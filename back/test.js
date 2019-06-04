let players = [];
players.push({
    id:1,
    name:'name1',
})
players.push({
    id:2,
    name:'name2',
})
players.push({
    id:3,
    name:'name3',
})
players.push({
    id:4,
    name:'name4',
})
players.push({
    id:5,
    name:'name5',
})

function getPlayerById(id){
    for(let i = 0;i<players.length;i++)
        if(players[i].id==id)
            return players[i];
}

let player = getPlayerById(5);
console.log(player);