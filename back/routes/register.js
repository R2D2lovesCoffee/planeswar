const express = require('express');
const bcrypt = require('bcrypt');

const projPath = require('../config/config').projPath;
const User = require('../models/User');

const register = express.Router();

register.post('/',(req,res)=>{
    try{
        signup(req.body.email,req.body.password,req.body.nickname)
        .then(()=>{
            res.send({message:'succes!'});
        },(err)=>{
            res.status(400).send({message:err.message});
        });
    }
    catch(e){
        res.status(400).send({message:'invalid body format!'});
    }
})

register.get('/',(req,res)=>{
    res.sendFile(`${projPath}/front/views/register.html`);
})


async function signup(email, password, nickname){
    let user = await User.findOne({where:{email:email}});
    if(user)
        throw new Error('email already exists!');
    else{
        let passwordHash = bcrypt.hashSync(password,10);
        let created = await User.create({
            email:email,
            passwordHash:passwordHash,
            nickname:nickname,
        })
        delete created.passwordHash;
        return created;
    }
}

module.exports = register;