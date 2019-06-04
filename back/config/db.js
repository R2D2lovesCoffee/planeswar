const Sequelize = require('sequelize');
const config = require('./config');

const db = new Sequelize(`${config.dbdialect}://${config.dbuser}:${config.dbpassword}@${config.dbhost}/${config.dbname}`);

module.exports = db;