const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Job=require("../models/job.js");
const Internship=require("../models/internship.js");
const { optioncompany, isLoggedIn } = require("../utils/middleware.js");
const Application = require("../models/application.js");
const Company = require("../models/company.js");


router.get("/", isLoggedIn, wrapAsync(async(req,res)=>{
    const jobIds = await Job.find({owner:req.user.id }).distinct('_id');
    const internshipIds = await Internship.find({ owner:req.user.id  }).distinct('_id');
    
    // Fetch stats
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
    const hired = await Application.countDocuments({
        Status: "hired",
        $or: [
            { jobId: { $in: jobIds } },
            { internshipId: { $in: internshipIds } }
        ]
    });
    const rejected = await Application.countDocuments({
        Status: "rejected",
        $or: [
            { jobId: { $in: jobIds } },
            { internshipId: { $in: internshipIds } }
        ]
    });

    // Fetch all applications for the dashboard list
    const applications = await Application.find({
        $or: [
            { jobId: { $in: jobIds } },
            { internshipId: { $in: internshipIds } }
        ]
    })
    .populate('userId')
    .populate('jobId')
    .populate('internshipId')
    .sort({ appliedAt: -1 });

    res.render("company/dashboard.ejs", { totalapplicant, shortlist, hired, rejected, applications });
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

router.post("/application/:id", isLoggedIn, wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let action=req.query.action;
    let application=await Application.findById(id).populate('jobId').populate('internshipId');
    
    // Security check: Ensure the company owns this job/internship
    const listing = application.jobId || application.internshipId;
    if (listing.owner.toString() !== req.user.id) {
        req.flash("error", "You do not have permission to manage this application.");
        return res.redirect("/company");
    }

    application.Status = action;
    await application.save();

    req.flash("success", `Application marked as ${action}.`);
    
    // Redirect back to dashboard if they came from there, otherwise to the specific list
    if (req.get('Referer') && req.get('Referer').includes('/company')) {
        res.redirect("/company");
    } else if(application.internshipId){
        res.redirect(`/company/internship/application/${application.internshipId._id}`);
    } else {
        res.redirect(`/company/job/application/${application.jobId._id}`);
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
    list.companyId = req.user._id;
    let Companyone=new Company(list);
    let saved=await Companyone.save();
     if(saved){
        req.flash("success","Welcome to ApnaIntern!");
        req.session.save(() => {
            res.redirect("/company");
        });
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