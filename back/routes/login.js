const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('../config/config');
const User = require('../models/User');

const {projPath} = config;
const {privateKey} = config;
const {signinOptions} = config;

const login = express.Router();

login.post('/',(req,res)=>{
    try{
        signin(req.body.email,req.body.password)
        .then((user)=>{
            let token = jwt.sign({id:user.id},privateKey,signinOptions);
            res.clearCookie('access_token');
            res.cookie('access_token',token);
            res.status(200).send({message:'success!'});
        },(err)=>{
            res.status(400).send({message:err.message});
        })
    }  
    catch(e){
        res.status(400).send({message:'invalid body format!'});
    }
})

login.get('/',(req,res)=>{
    res.sendFile(`${projPath}/front/views/login.html`);
})

async function signin(email, password){
    let user = await User.findOne({where:{email:email},raw:true})
    if(user){
        if(bcrypt.compareSync(password, user.passwordHash)){
            delete user.passwordHash;
            return user;
        }
        throw new Error('incorrect email or password!');
    }
    else{
        throw new error('incorrect email or password!');
    }
}


module.exports = login;