//imported required packages
const express=require('express');
const passport = require('passport');
const jwt=require('jsonwebtoken');
const cookieSession=require('cookie-session');
const notifier=require("node-notifier");
const nodeMailer=require('./config/nodeMailer');
const app=express();
const PORT=8000;
require('./strategy/passport-google -oauth-2-strategy');


// database connection and schema setup
const db=require('./config/mongoose');
const user=require('./modals/users');

//ejs view setup
app.set('view engine','ejs');
app.set('views','./views');

//url parser setup
app.use(express.urlencoded({extended:false}));

//session cookie setup
app.use(cookieSession({
    name:'google-auth-session',
    keys:['accessToken','refreshToken']
}))

app.use(passport.initialize());
app.use(passport.session());

//route setup
app.get('/',(req,res)=>{
    res.render('home');
});
app.get('/signIn',(req,res)=>{
    res.render('signIn');
});
app.get('/signUp',(req,res)=>{
    res.render('signUp');
});
app.get('/signOut',(req,res)=>{
    notifier.notify("successfully signed Out");
    res.redirect('/signIn');
});
//google authentication setup
app.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));
app.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signIn',successRedirect: '/admin'}))
    

//forget password routing page
app.get('/forget-password',(req,res)=>{
    return res.render('forget-password');
});

//call update password in mongodb and send mail to user with updated creds
app.post('/updatePassword',(req,res)=>{
    //console.log(req.body);
    if(req.body.password==req.body.cPassword)
    {
        user.updateOne({email:req.body.email},{$set:{password:req.body.password}},(err)=>{
            if(err)
            {
                console.log("error in updating",err);
                return;
            }
            //console.log("document updated");
            nodeMailer.sendMail({
                from:env.process.myEmail,
                to:req.body.email,
                subject:"Your Credentials!",
                html:`<h1>email:${req.body.email},password:${req.body.password}</h1>`
            },(err,info)=>{
                if(err)
                {
                    console.log("Error in sending Mail",err);
                    return;
                }
                //console.log("Mail sent!",info);
            })
            return res.redirect('/signIn');
        });
    }
    else
    {
        notifier.notify("confirm Password doesn't match with password");
        return res.redirect("/forget-password");
    }
    
})

//admin page rendering
app.post('/admin',(req,res)=>{
    user.findOne({email:req.body.email},(err,users)=>{
        if(err)
        {
            console.log("error in signing In:",err);
        }
        if(users.password==req.body.password)
        {
            notifier.notify(`welcome to admin page`);
            res.render('admin');
        }
        else{
            notifier.notify(`check your creds`);
            res.redirect('/signIn');
        }
    })
    
});

//Normal signUp page routing
app.post('/createUser',(req,res)=>{
    if(req.body.password!=req.body.cPassword)
    {
        return res.redirect("back");
    }
    user.findOne({email:req.body.email},function(err,newUser){
        if(err)
        {
            console.log("error in finding user during sign Up");
            return;
        }
        if(!newUser){
            user.create({email:req.body.email,password:req.body.password},(err,user)=>{
                if(err)
                {
                    console.log('error in creating user');
                    return;
                }
                notifier.notify(`user created successfully`);
                return res.redirect('/signIn');
            })
        }else{
            notifier.notify(`user already exist!`);
            res.redirect('/signIn');
        }
    })
})

//listening server at specific port
app.listen(PORT,(err)=>{
    if(err)
    {
        console.log("error in loading");
    }
    console.log("server is running at :",PORT);
})

