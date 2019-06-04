const jwt = require('jsonwebtoken');

const config = require('./config/config');

const {publicKey} = config;
const {verifyOptions} = config;

module.exports = (req,res,next)=>{
    try{
        let token = req.cookies['access_token'];
        let payload = jwt.verify(token,publicKey,verifyOptions);
        if(payload){//token is verified
            res.locals.payload = payload;
            next();
        }
        else{
            res.redirect('/login');
        }
    }
    catch(e){//token does not exist
        res.redirect('/login');
    }
    
}