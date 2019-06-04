const express = require('express');
const bodyParser = require('body-parser');

const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const playersRoute = require('./routes/players');
const auth = require('./auth');
const projPath = require('./config/config').projPath;

const router = express.Router();

router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());

router.use('/login',loginRoute);
router.use('/register',registerRoute);
router.use('/players',auth,playersRoute);

router.get('/home',auth,(req,res)=>{
    res.sendFile(`${projPath}/front/views/home.html`);
})
router.get('/play',auth,(req,res)=>{
    res.sendFile(`${projPath}/front/views/play.html`);
})
router.get('/game',auth,(req,res)=>{
    res.sendFile(`${projPath}/front/views/game.html`);
})

router.get('/',(req,res)=>{
    res.sendFile(`${projPath}/front/views/login.html`);
})

router.use((req, res, next)=>{
    res.status(404).send("Sorry, couldn't find that!");
});

module.exports = router;

