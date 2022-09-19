const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/usersdb';
const connectionparams = { 
    useNewUrlParser: true,
    useUnifiedTopology: true
 }
 mongoose.connect(url,connectionparams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })

module.exports = exports = mongoose;