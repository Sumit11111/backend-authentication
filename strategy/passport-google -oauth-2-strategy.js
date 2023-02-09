//importing required packages
const googleStrategy=require('passport-google-oauth').OAuth2Strategy;
const crypto=require('crypto');
const passport = require('passport');
const User=require('../modals/users');
const nodeMailer=require('../config/nodeMailer');

//send request handling through passport
passport.serializeUser((user,done)=>{
    done(null,user);
})

//response request handling through passport
passport.deserializeUser((user,done)=>{
    done(null,user);
})

//passport setup
passport.use(new googleStrategy({
    clientID:process.env.clientID,
    clientSecret:process.env.clientSecret,
    callbackURL:process.env.callbackURL
},

function(accessToken,refreshToken,profile,done)
{
    User.findOne({email:profile.emails[0].value}).exec((err,user)=>{
        if(err)
        {
            console.log("error in google strategy authentication",err)
            return;
        }
        
        if(user)
        {
            return done(null,user);
        }else{
            //creating user in db
            User.create({
                email:profile.emails[0].value,
                password:crypto.randomBytes(20).toString('hex')
            },(err,user)=>{
                if(err)
                {
                    console.log("error in creating user google strategy authentication",err)
                    return;
                }
                //user email and password details will be sent via mail
                nodeMailer.sendMail({
                    from:process.env.myEmail,
                    to:user.email,
                    subject:"Your Credentials!",
                    html:`<h1>email:${user.email},password:${user.password}</h1>`
                },(err,info)=>{
                    if(err)
                    {
                        console.log("Error in sending Mail",err);
                        return;
                    }
                    console.log("Mail sent!",info);
                })
                return done(null,user);
            })
        }
    })
}

))

module.exports=passport;