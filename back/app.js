const express = require('express');
const cookieParser = require('cookie-parser');

const router = require('./router');
const projPath = require('./config/config').projPath;

const app = express();

app.use(express.static(`${projPath}/front/public`));
app.use(cookieParser());
app.use('/',router);

module.exports = app;