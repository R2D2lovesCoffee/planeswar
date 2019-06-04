import config from '../config.js';
let host = config.host;


fetch(`${host}/players/me`)
.then(resp=>resp.json())
.then(player=>{
    document.getElementById('nickname').innerHTML = player.nickname;
    document.getElementById('mmr-value').innerHTML = player.mmr;
    document.getElementById('winstreak-value').innerHTML = player.winstreak;
});

fetch(`${host}/players/leaders`)
.then(leaders=>leaders.json())
.then(leaders=>{
    document.getElementById('nickname1').innerHTML = leaders[0].nickname;
    document.getElementById('mmr1').innerHTML = leaders[0].mmr;
    document.getElementById('nickname2').innerHTML = leaders[1].nickname;
    document.getElementById('mmr2').innerHTML = leaders[1].mmr;
    document.getElementById('nickname3').innerHTML = leaders[2].nickname;
    document.getElementById('mmr3').innerHTML = leaders[2].mmr;
    document.getElementById('nickname4').innerHTML = leaders[3].nickname;
    document.getElementById('mmr4').innerHTML = leaders[3].mmr;
    document.getElementById('nickname5').innerHTML = leaders[4].nickname;
    document.getElementById('mmr5').innerHTML = leaders[4].mmr;
});

document.querySelector('.button').addEventListener('click',()=>{
    window.location = `${host}/play`;
})