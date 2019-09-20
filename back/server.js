const socketio = require('socket.io');

const app = require('./app');
const port = require('./config/config.js').port;
const db = require('./config/db');
const Player = require('./Player');
const Room = require('./Room');
const User = require('./models/User');
const planeGenerator = require('./PlaneGenerator');
db.sync();

const server = app.listen(port,()=>{
    console.log(`server started on port ${port}...`);
})

const io = socketio(server);
let playersOnline = [];
let rooms = [];

io.on('connection',(socket)=>{

    socket.on('connectedToPlayPage',(received)=>{
        let player = new Player(received.id, received.nickname, received.mmr , received.winstreak, socket.id,false);
        playersOnline.push(player);
        socket.broadcast.emit('playerJoined',player);
        io.to(socket.id).emit('playersOnline',playersOnline);


    })
    socket.on('connectedToGamePage',received=>{
        
        let player = new Player(received.id, received.nickname, received.mmr , received.winstreak, socket.id,true);
        playersOnline.push(player);

        let room = getRoomByPlayerID(player.id);
        if(room){
            if(room.player1.id==player.id){
                rooms[rooms.indexOf(room)].player1.socketID = player.socketID;
            }
            else{
                rooms[rooms.indexOf(room)].player2.socketID = player.socketID;
            }
    
            socket.broadcast.emit('playerJoined',player);
            let opponent = getOpponent(player.id);
            if(opponent){
                setTimeout(() => {
                    opponent = getPlayerById(opponent.id);
                    io.to(socket.id).emit('opponent',opponent);
                }, 1500);
            }
        }
        else{
            io.to(socket.id).emit('getOut');
        }
    })

    socket.on('disconnect',()=>{
        let player = getPlayerBySocketId(socket.id);
        if(player){
            let index = playersOnline.indexOf(player);
            playersOnline.splice(index,1);
            socket.broadcast.emit('playerLeft',player);
            if(player.inGame){
                setTimeout(() => {
                    let opponent = getOpponent(player.id);
                    if(opponent){
                        opponent = getPlayerById(opponent.id);
                        if(opponent.inGame){
                            io.to(opponent.socketID).emit('opponentLeft');
                            updatePlayers(opponent,player);
                        }
                        deleteRoom(player); 
                    }    
                }, 1000);
            }
        }  
    })


    socket.on('invitation',id=>{    
        let sender = getPlayerBySocketId(socket.id);
        let invited = getPlayerById(id);
        io.to(invited.socketID).emit('invited',sender);
    })

    socket.on('declineInvitation',players=>{
        let {from, to} = players;
        io.to(to.socketID).emit('invitationDeclined',from);
    })
    socket.on('acceptInvitation',players=>{
        let {from, to} = players;
        io.to(to.socketID).emit('invitationAccepted',from);
        rooms.push(new Room(from,to));
    })

    socket.on('ready',matrix=>{
        let player = getPlayerBySocketId(socket.id);
        let room = getRoomByPlayerID(player.id);
        if(player.id==room.player1.id){
            rooms[rooms.indexOf(room)].player1.matrix = matrix;
            rooms[rooms.indexOf(room)].player1.planesKilled = 0;
            if(rooms[rooms.indexOf(room)].player2.matrix){
                let player1 = room.player1;
                let player2 = room.player2;
                io.to(player1.socketID).emit('opponentTurn');
                io.to(player2.socketID).emit('yourTurn');
            }
        }
        else{
            rooms[rooms.indexOf(room)].player2.matrix = matrix;
            rooms[rooms.indexOf(room)].player2.planesKilled = 0;
            if(rooms[rooms.indexOf(room)].player1.matrix){
                let player1 = room.player1;
                let player2 = room.player2;
                io.to(player1.socketID).emit('yourTurn');
                io.to(player2.socketID).emit('opponentTurn');
            }
        }
    })
    socket.on('notReady',received=>{
        let {matrix} = received;
        let {remainingPlanes} = received;
        let plane1, plane2;
        if(remainingPlanes==2){
            let planes = planeGenerator.createPlanes();
            plane1 = planes.plane1;
            plane2 = planes.plane2;
            io.to(socket.id).emit('nowReady',{first:plane1,second:plane2});

        }
        else if(remainingPlanes==1){
            plane1 = planeGenerator.getPlaneFromMatrix(matrix);
            plane2 = planeGenerator.createPlane2(plane1);
            io.to(socket.id).emit('nowReady',{second:plane2});

        }
        else{
            console.log('something went reaaally wrong...')
        }
        
    })

    socket.on('atack',coords=>{
        let player = getPlayerBySocketId(socket.id);
        let room = getRoomByPlayerID(player.id);
        if(player&&room){
            if(player.id==room.player1.id){
                let opponent = room.player2;
                let value = opponent.matrix[coords.x][coords.y];
                if(value==2)
                    rooms[rooms.indexOf(room)].player1.planesKilled++;
                if(rooms[rooms.indexOf(room)].player1.planesKilled==2){
                    updatePlayers(player,opponent);
                    io.to(opponent.socketID).emit('gameOver',{id:player.id,matrix:room.player1.matrix});
                    io.to(socket.id).emit('gameOver',{id:player.id,matrix:room.player2.matrix});
                }
                else{
                    io.to(opponent.socketID).emit('yourTurn',coords);
                    io.to(room.player1.socketID).emit('opponentTurn',{coords:coords,value:value});
                }
            }
            if(player.id==room.player2.id){
                let opponent = room.player1;
                let value = opponent.matrix[coords.x][coords.y];
                if(value==2)
                    rooms[rooms.indexOf(room)].player2.planesKilled++;
                if(rooms[rooms.indexOf(room)].player2.planesKilled==2){
                    updatePlayers(player,opponent);
                    io.to(opponent.socketID).emit('gameOver',{id:player.id,matrix:room.player2.matrix});
                    io.to(socket.id).emit('gameOver',{id:player.id,matrix:room.player1.matrix});
                }
                else{
                    io.to(opponent.socketID).emit('yourTurn',coords);
                    io.to(socket.id).emit('opponentTurn',{coords:coords,value:value});
                }
            }
        }
    })
})

function deleteRoom(player){
    for(let i = 0;i<rooms.length;i++){
        if(rooms[i].player1.id==player.id||rooms[i].player2.id==player.id)
            rooms.splice(i,1);
    }
}
function getRoomByPlayerID(id){
    for(let i = 0;i<rooms.length;i++){
        if(rooms[i].player1.id==id||rooms[i].player2.id==id)
            return rooms[i];
    }
}

function getOpponent(id){
    for(let i = 0;i<rooms.length;i++){
        if(rooms[i].player1.id==id)
            return rooms[i].player2;
        else if(rooms[i].player2.id==id)
            return rooms[i].player1;
    }
}

function getPlayerById(id){
    for(let i=0;i<playersOnline.length;i++)
        if(playersOnline[i].id==id)
            return playersOnline[i];
}
function getPlayerBySocketId(socketID){
    for(let i=0;i<playersOnline.length;i++)
        if(playersOnline[i].socketID==socketID)
            return playersOnline[i];
}

async function updatePlayers(winner, loser){
    let winnerDB = await User.findOne({where:{id:winner.id}});
    let loserDB = await User.findOne({where:{id:loser.id}});
    let mmrDif;
    if(winner.mmr>loser.mmr){
        mmrDif = 25-Math.floor(winner.mmr/loser.mmr);
        if(mmrDif<15)
            mmrDif=15;
    }
    else{
        mmrDif = 25+Math.floor(winner.mmr/loser.mmr);
        if(mmrDif>35)
            mmrDif=35;
    }
    winnerDB.update({mmr:winner.mmr+mmrDif,winstreak:winner.winstreak+1});
    if(loser.mmr-mmrDif<=0)
        loserDB.update({mmr:0,winstreak:0});
    else
        loserDB.update({mmr:loser.mmr-mmrDif,winstreak:0});
}