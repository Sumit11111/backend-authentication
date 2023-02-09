const mongoose=require('mongoose');
//user schema setup
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
})

const user=mongoose.model('user',userSchema);
module.exports=user;