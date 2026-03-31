const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Job=require("../models/job.js");
const { isLoggedIn, isapplied, savedbackpath, saveredirectUrl } = require("../utils/middleware.js");
const Company=require("../models/company.js");
const Application=require("../models/application.js");

//job index
router.get("/",isLoggedIn,savedbackpath,wrapAsync(async(req,res)=>{
    const jobs=await Job.find({});
    let list = await Promise.all(
    jobs.map(async (e) => {
        let companyid = e.owner;
        let company =await Company.find({companyId:companyid});
        return company;
    }));
    list = list.flat();
    res.render("forstudent/jobindex.ejs",{jobs,list});
}));

//job details
router.get("/:id",isLoggedIn,saveredirectUrl,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let job=await Job.findById(id);
    let companyid = job.owner;
    let company =await Company.find({companyId:companyid});
    let applied=await Application.find({userId:req.user._id,jobId:id});
    let path=res.locals.redirect;
    res.render("forstudent/jobshow.ejs",{job,company,applied,path});
}));


//job apply
router.post("/:id",isLoggedIn,isapplied,wrapAsync(async(req,res)=>{
    let application=new Application({
        jobId: req.params.id,
        userId: req.user._id
    });
    let applied=await application.save();
    if(applied){
        req.flash("success","you applied successfully");
        res.redirect("/student/job");
    }
}));


module.exports=router;
