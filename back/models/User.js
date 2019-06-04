const Sequelize = require('sequelize');
const db = require('../config/db');

const User = db.define('user',{
    id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    email:{
        type:Sequelize.STRING,
    },
    passwordHash:{
        type:Sequelize.STRING,
    },
    mmr:{
        type:Sequelize.INTEGER,
        defaultValue:0,
    },
    nickname:{
        type:Sequelize.STRING,
    },
    winstreak:{
        type:Sequelize.INTEGER,
        defaultValue:0,
    }
    
},{
    timestamps:false,
})

module.exports = User;