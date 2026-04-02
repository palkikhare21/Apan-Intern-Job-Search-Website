const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Internship=require("../models/internship.js");
const Company=require("../models/company.js");
const { isLoggedIn, isapplied } = require("../utils/middleware.js");
const Application=require("../models/application.js");


//internship index
router.get("/",isLoggedIn,wrapAsync(async(req,res)=>{
    let internships=await Internship.find({});
    let list = await Promise.all(
    internships.map(async (e) => {
        let companyid = e.owner;
        return await Company.find({companyId:companyid});
    }));
    list = list.flat();
    console.log(internships.length);
    res.render("forstudent/internindex.ejs",{internships,list});
}));

// internship details 
router.get("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let internship=await Internship.findById(id);
    let companyid = internship.owner;
    let company=Company.find({companyId:companyid});
    let applied=await Application.find({userId:req.user._id,internshipId:id});
    res.render("forstudent/internshow.ejs",{internship,company,applied});
}));

//internship apply
router.post("/:id",isLoggedIn,isapplied,wrapAsync(async(req,res)=>{
    let application=new Application({
            internshipId: req.params.id,
            userId: req.user.id
        });
    let applied=await application.save();
    if(applied){
        req.flash("success","you applied successfully");
        res.redirect("/student/internship");
    }
}));


module.exports=router;