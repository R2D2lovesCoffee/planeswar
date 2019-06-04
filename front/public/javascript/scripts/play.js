import config from '../config.js';

const host = config.host;

let players = [];
let ul = document.getElementsByTagName('ul')[0];
let socket;
let invitations=[];

fetch(`${host}/players/me`)
.then(res=>res.json())
.then(me=>{
    document.getElementById('code').innerHTML = me.id;
    document.getElementById('first-button').onclick=()=>{
        emitInvitation(document.getElementsByTagName('input')[0].value);
    }

    socket = io(host);
    socket.emit('connectedToPlayPage',me);


    socket.on('playersOnline',playersOnline=>{  
        let index = players.indexOf(getPlayerById(me.id));
        players = playersOnline;
        players.splice(index,1);
        
        displayList(players);
    })

    socket.on('playerJoined',player=>addPlayer(player));

    
    socket.on('playerLeft',player=>{
        try{
            removePlayer(player);
        }
        catch(e){}
    });

    socket.on('invited',by=>{
        let invitationBox = createInvitationBox(by, me);
        addInvitation(invitationBox);
        setTimeout(() => {
            try{
                removeInvitation(invitationBox);
            }
            catch(e){
                console.log('invitation already removed');
            }
        }, 5000);
    })
    socket.on('invitationDeclined',from=>{
        showMessage(`${from.nickname} HAS DECLINED YOUR INVITATION!`);
    })
    socket.on('invitationAccepted',()=>{
        window.location=`${host}/game`;
    })

});

function showMessage(message){
    let where = document.getElementById('title-first');
    where.innerHTML=message;
    setTimeout(() => {
        where.innerHTML = 'PICK YOUR OPPONENT';
    }, 5000);
}

function emitInvitation(id){
    if(id){
        let player = getPlayerById(id);
        if(player){
            if(!player.inGame)
                socket.emit('invitation',id);
            else
                showMessage('That player is already in a game!');
        }
        else{
            showMessage('That player is not online!')
        }
    }
}

function addInvitation(invitationBox){
    invitations.forEach(invitation=>{
        move(invitation,150);
    })
    invitations.unshift(invitationBox);
    document.body.appendChild(invitationBox);
}

function removeInvitation(invitationBox){
    let index = invitations.indexOf(invitationBox);
    document.body.removeChild(invitationBox);
    for(let i = index+1;i<invitations.length;i++)
        move(invitations[i],-150);
    invitations.splice(index,1);
}
function move(invitation, value){
    let position = Number(invitation.style.bottom.split('p')[0]);
    invitation.style.bottom=`${position+value}px`;
}

function displayList(players){
    players.forEach(player=>{
        let li = document.createElement('li');
        li.innerHTML=player.nickname;
        if(player.inGame)
        li.innerHTML+=' in game...';
        ul.appendChild(li);

        li.onclick = ()=>emitInvitation(players[indexInParent(li)].id);
    })
}
function addPlayer(player){
    players.unshift(player);
    let li = document.createElement('li');
    li.innerHTML = player.nickname;
    if(player.inGame)
        li.innerHTML+=' in game...';

    ul.insertBefore(li,ul.firstChild);
    li.onclick = ()=>emitInvitation(players[indexInParent(li)].id);
}

function removePlayer(player){
    let index = players.indexOf(getPlayerById(player.id));
    players.splice(index,1);

    ul.removeChild(ul.children[index]);
}


function createInvitationBox(from, to){
    let container = document.createElement('div');
    container.className = 'pop-up';
    container.style.right = '0';
    container.style.bottom = `0`;
    container.style.marginRight='40px';
    container.style.marginBottom='15px';

    let text = document.createElement('div');
    text.innerHTML=`${from.nickname} is challenging you!`;
    text.style.textAlign='center';
    text.style.fontSize='18px';
    text.style.padding='10px';
    let button1 = document.createElement('div');
    button1.innerHTML = 'DECLINE';
    button1.className = 'invitation-button';
    button1.style.color='#d20000';
    let button2 = document.createElement('div');
    button2.innerHTML = 'ACCEPT';
    button2.className='invitation-button';
    button2.style.backgroundColor='#ff9400'

    button1.addEventListener('click',()=>{
        removeInvitation(container);
        socket.emit('declineInvitation',{
            from:to,
            to:from,
        })
    })
    button2.addEventListener('click',()=>{
        socket.emit('acceptInvitation',{
            from:to,
            to:from,
        })
        window.location = `${host}/game`;
    })


    container.appendChild(text);
    container.appendChild(button1);
    container.appendChild(button2);
    return container;
}

function getPlayerById(id){
    for(let i=0;i<players.length;i++)
        if(players[i].id==id)
            return players[i];
}

function indexInParent(node) {
    var children = node.parentNode.childNodes;
    var num = 0;
    for (var i=0; i<children.length; i++) {
         if (children[i]==node) return num;
         if (children[i].nodeType==1) num++;
    }
    return -1;
}