const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");
const passport=require("passport");
const { saveredirectUrl } = require("../utils/middleware.js");


router.post("/signup",wrapAsync(async(req,res,next)=>{
    try{
        const {username,email,password,usertype}=req.body;
        // Backup: check session if usertype is not in body
        const finalUserType = usertype || req.session.usertype;
        const newUser=new User({username,email,usertype: finalUserType});
        let registerUser=await User.register(newUser,password);
        req.login(registerUser,(err)=>{
            if(err){
                next(err);
            }
            if(usertype=="student"){
                res.redirect("/student/details");
            }else{
                res.redirect("/company/details");
            }
            
        });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}));
//login
router.get("/login",(req,res)=>{
    res.render("login.ejs");
});
router.post("/login",saveredirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),wrapAsync(async(req,res)=>{
    req.flash("success","Welcome to ApnaIntern!");
    if(req.user.usertype==="company"){
        if(res.locals.redirect){
            res.redirect(res.locals.redirect);
        }else{
            res.redirect("/company");
        }
    }
    else{
        if(res.locals.redirect){
            res.redirect(res.locals.redirect);
        }else{
           res.redirect("/student");
        }
    }
}));

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }else{
            req.flash("success","you successfully logout!");
            res.redirect("/");  
        }
    })
});





module.exports=router;