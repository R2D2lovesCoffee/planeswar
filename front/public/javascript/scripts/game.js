import config from '../config.js';

const host = config.host;
let socket;
let opponent;

let nickname1=document.getElementById('nickname-1');
let mmr1=document.getElementById('mmr-1');
let nickname2=document.getElementById('nickname-2');
let mmr2=document.getElementById('mmr-2');
let message=document.getElementById('message');
let timer=document.getElementById('timer');
let canvas1=document.getElementById('canvas-1');
let canvas2=document.getElementById('canvas-2');
let btnRotate=document.getElementById('btn-rotate');
let imgPlane=document.getElementById('img-plane');
let btnReset=document.getElementById('btn-reset');
let btnReady=document.getElementById('btn-ready');

let time, timeout, interval;

const boardSize = canvas1.width=canvas1.height=canvas2.width=canvas2.height=document.querySelector('.card').clientWidth/2
const squareSize = boardSize/10;
const orange = "#b9771c";
let planeSelected = false;
let matrix = new Array(10);
let matrixOpponent = new Array(10);
for(let i = 0;i<10;i++){
    matrix[i] = new Array(10);
    matrixOpponent[i] = new Array(10);
    for(let j = 0;j<10;j++){
        matrix[i][j]=0;
        matrixOpponent[i][j]=-1;
    }
}
let rotation = 0;
let angle=180;
let state = 0;
let remainingPlanes=2;
let timing;

message.innerHTML='Place your planes!';
drawBoards();

fetch(`${host}/players/me`)
.then(res=>res.json())
.then(me=>{
    time=20;
    timer.innerHTML = time;
    timeout = setTimeout(() => {
        if(remainingPlanes!=0)
            socket.emit('notReady',{matrix,remainingPlanes});
    }, 20000);
    interval = setInterval(() => {
        if(time<=5)
        timer.style.color="red";
        time--;
        timer.innerHTML = time;
    }, 1000);

    nickname1.innerHTML=me.nickname;
    mmr1.innerHTML+=me.mmr;
    
    socket = io(host);

    socket.emit('connectedToGamePage',me);

    socket.on('nowReady',planes=>{
        let plane2 = planes.second;
        let plane1;
        if(planes.first){
            plane1 = planes.first;
            drawPlane(plane1,orange);
            fillMatrix(plane1);
        }
        drawPlane(plane2,orange);
        fillMatrix(plane2);
        ready();
        timer.style.color = orange;
        socket.emit('ready',matrix);
    })

    socket.on('opponent',opp=>{
        console.log(opp);
        opponent = opp;
        nickname2.innerHTML=opponent.nickname;
        mmr2.innerHTML+=opponent.mmr;
    })

    socket.on('opponentLeft',()=>{
        clearInterval(interval);
        clearTimeout(timeout);
        message.innerHTML='Your opponent left! You won!';
        setTimeout(() => {
            window.location=`${host}/play`;
        }, 3000);
    })

    socket.on('yourTurn',(coords)=>{
        clearInterval(interval);
        clearTimeout(timeout);

        if(coords){
            drawRect(canvas1,coords.x,coords.y,"red",0.5);
        }
        state = 1;
        showMessage('Your turn!');
        canvas2.addEventListener('mouseover',listenerMouseOver2);
        canvas2.addEventListener('click',listenerClick2);
        canvas2.addEventListener('mousemove',listenerMouseMove2);

        time = 5;
        timer.innerHTML=time;

        let goodSpot = new Coord(0,0);
        while(matrixOpponent[goodSpot.x][goodSpot.y]!=-1)
            goodSpot=new Coord(Math.floor(Math.random()*10),Math.floor(Math.random()*10));

        interval = setInterval(() => {
            time--;
            timer.innerHTML=time;
        }, 1000);
        timeout = setTimeout(() => {
            socket.emit('atack',goodSpot);
            clearInterval(interval);
            clearTimeout(timeout);
        }, 5000);
    })

    socket.on('opponentTurn',(received)=>{
        clearInterval(interval);
        clearTimeout(timeout);
        
        state = -1;
        showMessage('Your opponent turn!');
        canvas2.removeEventListener('mouseover',listenerMouseOver2);
        canvas2.removeEventListener('click',listenerClick2);
        canvas2.removeEventListener('mousemove',listenerMouseMove2);

        if(received){
            let coords = received.coords;
            let value = received.value;

            matrixOpponent[coords.x][coords.y] = value;
            if(value==0)
                drawRect(canvas2,coords.x,coords.y,"grey",1)
            else if(value==1)
                drawRect(canvas2,coords.x,coords.y,orange,1);
            else if(value==2)
                drawRect(canvas2,coords.x,coords.y,"red",1);
        }

        time = 5;
        timer.innerHTML=time;
        interval = setInterval(() => {
            time--;
            timer.innerHTML=time;
        }, 1000);
        
    })

    socket.on('gameOver',received=>{
        clearInterval(interval);
        clearTimeout(timeout);

        let {id} = received;
        let matrixOpp = received.matrix;
        if(id==me.id){
            showMessage('Congrats! You won!');
        }
        else{
            showMessage(`${opponent.nickname} won!`)
        }
        state=100;
        canvas2.removeEventListener("mousemove",listenerMouseMove2);
        canvas2.removeEventListener("mouseover",listenerMouseOver2);
        for(let i =0;i<matrixOpp.length;i++){
            for(let j =0;j<matrixOpp[i].length;j++){
                if(matrixOpp[i][j]==1)
                    drawRect(canvas2,i,j,orange);
                else if(matrixOpp[i][j]==2)
                    drawRect(canvas2,i,j,"red");
            }
        }
        setTimeout(() => {
            window.location=`${host}/play`;
        }, 5000);
    })

    socket.on('getOut',()=>{
        window.location=`${host}/play`;
    })



    let listenerMouseOver = (e)=>{
        if(planeSelected){
            clearBoard1();
            drawBoard1();
            let canvasCoords = getMousePos(canvas1,e);
            let realCoords = getRealCoords(canvasCoords);
            let plane = getPlane(realCoords.x,realCoords.y,rotation);
            drawPlane(plane,'grey',0.5);
        }
    }
    let listenerMouseMove = (e)=>{
        if(planeSelected){
            clearBoard1();
            drawBoard1();
            let canvasCoords = getMousePos(canvas1,e);
            let realCoords = getRealCoords(canvasCoords);
            let plane = getPlane(realCoords.x,realCoords.y,rotation);
            drawPlane(plane,'grey',0.5);
        }
    }
    let listenerClick = (e)=>{
        if(planeSelected){
            planeSelected=false;
            let canvasCoords = getMousePos(canvas1,e);
            let realCoords = getRealCoords(canvasCoords);
            let plane = getPlane(realCoords.x,realCoords.y,rotation);
            if(availableSpace(plane)){
                drawPlane(plane,orange,1);
                fillMatrix(plane);
                remainingPlanes--;
            }
            else{
                showMessage("You cant place your plane there, sir!");
            }
        }
        else{
            showMessage("Select plane first!");
        }
    }

    let listenerClick2 = (e)=>{
        let canvasCoords = getMousePos(canvas2,e);
        let realCoords = getRealCoords(canvasCoords);
        if(matrixOpponent[realCoords.x][realCoords.y]!=-1)
            showMessage('You cant atack there anymore, sir!');
        else{
            socket.emit('atack',realCoords);
            clearInterval(interval);
            clearTimeout(timeout);
        }
    }
    let listenerMouseMove2 = (e)=>{
        clearBoard2();
        drawBoard2();
        let canvasCoords = getMousePos(canvas2,e);
        let realCoords = getRealCoords(canvasCoords);
        drawRect(canvas2,realCoords.x,realCoords.y,"grey",0.5);
    }
    let listenerMouseOver2 = (e)=>{
        clearBoard2();
        drawBoard2();
        let canvasCoords = getMousePos(canvas2,e);
        let realCoords = getRealCoords(canvasCoords);
        drawRect(canvas2,realCoords.x,realCoords.y,"grey",0.5);
    }
    canvas1.addEventListener('mouseover',listenerMouseOver);
    canvas1.addEventListener('mousemove',listenerMouseMove);
    canvas1.addEventListener('click',listenerClick);


    btnRotate.addEventListener('click',()=>{
        angle=(angle+90)%360;
        imgPlane.className='rotate'+angle;
        rotation=(rotation+1)%4;
    })
    imgPlane.addEventListener('click',()=>{
        if(remainingPlanes>0){
            planeSelected=true;
        }
        else{
            showMessage("You ain't got any planes left, soldier!");
        }
    })
    btnReset.addEventListener('click',()=>{
        clearMatrix();
        clearBoards();
        drawBoards();
        remainingPlanes=2;
    })
    btnReady.addEventListener('click',()=>{
        if(remainingPlanes==0){
            ready();
        }
        else{
            showMessage(`Place your planes first!`);
        }
    })

    function ready(){
        let cardLeft = document.getElementById('left');
        cardLeft.removeChild(btnReady);
        cardLeft.removeChild(btnReset);
        cardLeft.removeChild(imgPlane);
        cardLeft.removeChild(btnRotate);
        canvas1.removeEventListener('click',listenerClick);
        canvas1.removeEventListener('mouseover',listenerMouseOver);
        canvas1.removeEventListener('mousemove',listenerMouseMove);
        socket.emit('ready',matrix);
    }
})

function showMessage(msg){
    message.innerHTML=msg;
    setTimeout(() => {
        switch(state){
            case 0:
                message.innerHTML='Place your planes!'
                break;
            case 1:
                message.innerHTML='Your turn!';
                break;
            case 2:
                message.innerHTML='Your opponent turn!';
        }
    }, 3000);
}


function availableSpace(plane){
    for(let i = 0;i<8;i++)
        if(!matrix[plane[i].x]||!matrix[plane[i].y])
            return false;
        else if(matrix[plane[i].x][plane[i].y]!=0)
            return false;
    return true;
}
function fillMatrix(plane){
    for(let i = 0;i<plane.length;i++)
        matrix[plane[i].x][plane[i].y]=1;
    matrix[plane[0].x][plane[0].y]=2;
}

function Coord(x,y){
    this.x = x;
    this.y = y;
}
function getPlane(x,y,rotation){
    let plane = [];
    switch(rotation){
        case 0:
            plane.push(new Coord(x,y));
            plane.push(new Coord(x+1,y+1));
            plane.push(new Coord(x,y+1));
            plane.push(new Coord(x-1,y+1));
            plane.push(new Coord(x,y+2));
            plane.push(new Coord(x+1,y+3));
            plane.push(new Coord(x,y+3));
            plane.push(new Coord(x-1,y+3));
            break;
        case 1:
            plane.push(new Coord(x,y));
            plane.push(new Coord(x-1,y-1));
            plane.push(new Coord(x-1,y))
            plane.push(new Coord(x-1,y+1));
            plane.push(new Coord(x-2,y));
            plane.push(new Coord(x-3,y-1));
            plane.push(new Coord(x-3,y));
            plane.push(new Coord(x-3,y+1));
            break;
        case 2:
            plane.push(new Coord(x,y));
            plane.push(new Coord(x-1,y-1));
            plane.push(new Coord(x,y-1));
            plane.push(new Coord(x+1,y-1));
            plane.push(new Coord(x,y-2));
            plane.push(new Coord(x-1,y-3));
            plane.push(new Coord(x,y-3));
            plane.push(new Coord(x+1,y-3));
            break;
        case 3:
            plane.push(new Coord(x,y));
            plane.push(new Coord(x+1,y-1));
            plane.push(new Coord(x+1,y));
            plane.push(new Coord(x+1,y+1));
            plane.push(new Coord(x+2,y));
            plane.push(new Coord(x+3,y-1));
            plane.push(new Coord(x+3,y));
            plane.push(new Coord(x+3,y+1));
    }
    return plane;
}
function drawPlane(plane,style,alpha){
    if(plane){
        plane.forEach(coord=>{
            drawRect(canvas1,coord.x,coord.y,style,alpha);
        })
    }
}
function drawRect(canvas, x, y, style,alpha=1){
    let ctx = canvas.getContext('2d');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = style;
    ctx.fillRect(x*squareSize+1,y*squareSize+1,squareSize-1,squareSize-1);
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}
function getRealCoords(coords){
    return {
        x:Math.floor(coords.x/squareSize),
        y:Math.floor(coords.y/squareSize),
    }
}
function drawBoard1(){
    let ctx1 = canvas1.getContext('2d');
    ctx1.strokeStyle='grey';
    for(let i=0;i<=10;i++){
        ctx1.moveTo(0,i*squareSize);
        ctx1.lineTo(boardSize,i*squareSize);
        ctx1.stroke();
    }
    for(let i=0;i<=10;i++){
        ctx1.moveTo(i*squareSize,0);
        ctx1.lineTo(i*squareSize,boardSize);
        ctx1.stroke();
    }
    for(let i = 0;i<10;i++)
        for(let j = 0;j<10;j++)
            if(matrix[i][j]!=0)
                drawRect(canvas1,i,j,orange,1);
}
function clearBoard1(){
    let ctx1 = canvas1.getContext('2d');
    ctx1.clearRect(0,0,boardSize,boardSize);
}
function drawBoards(){
    let ctx1 = canvas1.getContext('2d');
    let ctx2 = canvas2.getContext('2d');
    ctx1.strokeStyle='grey';
    ctx2.strokeStyle='grey';

    ctx1.beginPath();
    for(let i=0;i<=10;i++){
        ctx1.moveTo(0,i*squareSize);
        ctx1.lineTo(boardSize,i*squareSize);
        ctx1.stroke();
        ctx2.moveTo(0,i*squareSize);
        ctx2.lineTo(boardSize,i*squareSize);
        ctx2.stroke();
    }
    for(let i=0;i<=10;i++){
        ctx1.moveTo(i*squareSize,0);
        ctx1.lineTo(i*squareSize,boardSize);
        ctx1.stroke();
        ctx2.moveTo(i*squareSize,0);
        ctx2.lineTo(i*squareSize,boardSize);
        ctx2.stroke();
    }
    for(let i = 0;i<10;i++)
        for(let j = 0;j<10;j++)
            if(matrix[i][j]!=0)
                drawRect(canvas1,i,j,orange,1);
}
function clearBoards(){
    let ctx1 = canvas1.getContext('2d');
    let ctx2 = canvas2.getContext('2d');
    ctx1.clearRect(0,0,boardSize,boardSize);
    ctx2.clearRect(0,0,boardSize,boardSize);
}
function clearMatrix(){
    for(let i = 0;i<10;i++)
        for(let j =0;j<10;j++)
            matrix[i][j]=0;
}

function clearBoard2(){
    let ctx2 = canvas2.getContext('2d');
    ctx2.clearRect(0,0,boardSize,boardSize);
}
function drawBoard2(){
    let ctx2 = canvas2.getContext('2d');
    ctx2.strokeStyle='grey';
    for(let i=0;i<=10;i++){
        ctx2.moveTo(0,i*squareSize);
        ctx2.lineTo(boardSize,i*squareSize);
        ctx2.stroke();
    }
    for(let i=0;i<=10;i++){
        ctx2.moveTo(i*squareSize,0);
        ctx2.lineTo(i*squareSize,boardSize);
        ctx2.stroke();
    }
    for(let i = 0;i<10;i++)
        for(let j = 0;j<10;j++){
            if(matrixOpponent[i][j]==0)
                drawRect(canvas2,i,j,"grey",1)
            else if(matrixOpponent[i][j]==1)
                drawRect(canvas2,i,j,orange,1);
            else if(matrixOpponent[i][j]==2)
                drawRect(canvas2,i,j,"red",1);
        }
}
