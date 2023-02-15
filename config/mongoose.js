//imprting mongoose
const mongoose=require('mongoose');
//connectin setup
mongoose.connect(`mongodb+srv://${process.env.db_user}:${process.env.db_password}@cluster0.eoh5n.mongodb.net/users?retryWrites=true&w=majority`);
const db=mongoose.connection;
//opening db connection
db.on('error',console.error.bind(console,"Error connecting to MongoDB"));
db.once('open',function(){
    console.log('Connected to Database::MongoDB');
});

module.exports=db;
