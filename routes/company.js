const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Job=require("../models/job.js");
const Internship=require("../models/internship.js");
const { optioncompany, isLoggedIn } = require("../utils/middleware.js");
const Application = require("../models/application.js");
const Company = require("../models/company.js");


router.get("/",wrapAsync(async(req,res)=>{
    const jobIds = await Job.find({owner:req.user.id }).distinct('_id');
    const internshipIds = await Internship.find({ owner:req.user.id  }).distinct('_id');
    const totalapplicant = await Application.countDocuments({
        $or: [
               { jobId: { $in: jobIds } },
               { internshipId: { $in: internshipIds } }
        ]
    });
    const shortlist = await Application.countDocuments({
        Status: "accepted",
        $or: [
            { jobId: { $in: jobIds } },
            { internshipId: { $in: internshipIds } }
        ]
    });
    const hired=await Application.countDocuments({
        Status:"hired",
        $or: [
            { jobId: { $in: jobIds } },
            { internshipId: { $in: internshipIds } }
        ]
    });
     const rejected=await Application.countDocuments({
        Status:"rejected",
        $or: [
            { jobId: { $in: jobIds } },
            { internshipId: { $in: internshipIds } }
        ]
    });
    
    console.log(totalapplicant,shortlist,hired,rejected);
    res.render("company.ejs",{totalapplicant,shortlist,hired,rejected});
}));

//create new
router.post("/",wrapAsync(async(req,res)=>{
    const list=req.body.list;
    if(req.session.listingtype==="internship"){
        let intern=new Internship(list);
        intern.owner=req.user;
        const result = await intern.save();
        console.log(result);
    }
    if(req.session.listingtype==="job"){
        let job=new Job(list);
        job.owner=req.user;
        const result = await job.save();
        console.log(result);
    }
    res.redirect("/company");
}));

router.post("/application/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let action=req.query.action;
    let application=await Application.findById(id);
    application.Status=action;
    application.save();
    if(application.internshipId){
        const Aid=application.internshipId;
        res.redirect(`/company/internship/application/${Aid}`);
    }else{
        const Aid=application.jobId;
        res.redirect(`/company/job/application/${Aid}`);
    }
}));

//signup
router.get("/signup",optioncompany,(req,res)=>{
    res.render("signup.ejs", { usertype: "company" });
});

router.get("/details",isLoggedIn,(req,res)=>{
    res.render("company/companyprofile.ejs");
});


router.post("/details",isLoggedIn,wrapAsync(async(req,res)=>{
    let list=req.body.list;
    let Companyone=new Company(list);
    let saved=await Companyone.save();
     if(saved){
        req.flash("success","Welcome to ApnaIntern!");
        res.redirect("/company");
    }
}));
router.get("/profile",isLoggedIn,wrapAsync(async(req,res)=>{
    let User=req.user;
    let company=await Company.find({companyId:User.id});
    res.render("company/companyprofiledetails.ejs",{company,User});
}));
router.get("/profile/:id/edit",isLoggedIn,wrapAsync(async(req,res)=>{
    let id=req.params.id;
    console.log(id)
    let company=await Company.findById(id);
    console.log(company)
    res.render("company/profileedit.ejs",{company})
}));
router.put("/profile/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    try{
        let id=req.params.id;
        let company=await Company.findByIdAndUpdate(id,{...req.body.list},{new:true});
        console.log(company);
        req.flash("success","updated!");
        res.redirect("/company/profile");
    }catch(e){
        req.flash("error", "Update failed: " + e.message);
        res.redirect(`/company/profile/${id}/edit`);
    }
}))
module.exports=router;