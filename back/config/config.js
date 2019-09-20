const fs = require('fs');
const privateKey = fs.readFileSync('./config/Private.key', 'utf8');
const publicKey = fs.readFileSync('./config/Public.key', 'utf8');

module.exports = {
    port: 5000,
    projPath: '/home/r2d2/r2d2Hacks/planeswar',
    dbhost: 'localhost',
    dbname: 'planeswar',
    dbuser: 'root',
    dbpassword: '',
    dbdialect: 'mysql',
    signinOptions: {
        expiresIn: '8h',
        algorithm: 'RS256',
    },
    verifyOptions: {
        expiresIn: '8h',
        algorithm: ['RS256'],
    },
    publicKey: publicKey,
    privateKey: privateKey,
}