const express = require('express')

const db = require('./config/mongoose')
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express()
var path = require('path');
const{userRouter} = require('./routes/index')



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('etag', false)
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/users',userRouter)
module.exports = app
app.listen(8000,function(){
    console.log('server running on port 8000')
})