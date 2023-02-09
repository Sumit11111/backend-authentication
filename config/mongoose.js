//imprting mongoose
const mongoose=require('mongoose');
//connectin setup
mongoose.connect("mongodb://127.0.0.1:27017/myUserDB");
const db=mongoose.connection;
//opening db connection
db.on('error',console.error.bind(console,"Error connecting to MongoDB"));
db.once('open',function(){
    console.log('Connected to Database::MongoDB');
});

module.exports=db;
