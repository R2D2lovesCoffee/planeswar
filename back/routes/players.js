const express = require('express');
const projPath = require('../config/config').projPath;
const User = require('../models/User');
const auth = require('../auth');

const players = express.Router();

players.get('/me', async (req,res)=>{
    let {payload} = res.locals;
    let player = await User.findOne({where:{id:payload.id},raw:true});
    delete player.passwordHash;
    delete player.email
    res.status(200).send(player);
})

players.get('/leaders', async (req,res)=>{
    let leaders = await User.findAll({
        order:[
            ['mmr','DESC'],
        ],
        limit:10,
        raw:true,
    })
    leaders.forEach(player=>{
        delete player.email;
        delete player.passwordHash;
    })
    res.status(200).send(leaders);
})

module.exports = players;
