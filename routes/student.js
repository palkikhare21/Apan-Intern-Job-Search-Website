const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Job=require("../models/job.js");
const Internship=require("../models/internship.js");
const { optionstudent, isLoggedIn } = require("../utils/middleware.js");
const Application=require("../models/application.js");
const Company=require("../models/company.js");
const Student = require("../models/student.js");

router.get("/",isLoggedIn,wrapAsync(async(req,res)=>{
    const internships=await Internship.find({});
    const jobs=await Job.find({});
    const student=await Student.find({studentId:req.user.id});
    
    const applications = await Application.find({userId: req.user._id})
        .populate('jobId')
        .populate('internshipId')
        .sort({ appliedAt: -1 })
        .limit(5);

    let companies = [];
    for (let app of applications) {
        let ownerId = app.internshipId ? app.internshipId.owner : (app.jobId ? app.jobId.owner : null);
        let company = null;
        if(ownerId) {
            company = await Company.findOne({companyId: ownerId});
        }
        companies.push(company);
    }
    
    res.render("student/dashboard.ejs",{internships,jobs,student, applications, companies});
}));

router.get("/myapplication",isLoggedIn,wrapAsync(async(req,res)=>{
    let applications=await Application.find({userId:req.user._id})
    console.log(applications);
    let requestlist = await Promise.all(
    applications.map(async (e) => {
            if(e.internshipId){
                let intern = await Internship.findById(e.internshipId);
                return intern || { title: 'Deleted Internship' };
            }else{
                let job = await Job.findById(e.jobId);
                return job || { title: 'Deleted Job' };
            }
    }));
    let internjobCompanylist = await Promise.all(
        applications.map(async (e) => {
            let companyid;
            if(e.internshipId){
                let internship=await Internship.findById(e.internshipId);
                companyid = internship ? internship.owner : null;
            }else{
                let job=await Job.findById(e.jobId);
                companyid = job ? job.owner : null;
            }
           if (!companyid) return { companyname: 'Unknown Company' };
           let company = await Company.findOne({companyId:companyid});
           return company || { companyname: 'Unknown Company' };
       }));
    res.render("student/application.ejs",{applications,requestlist,internjobCompanylist});
}));


router.get("/signup",optionstudent,(req,res)=>{
    res.render("signup.ejs", { usertype: "student" });
});

router.get("/details",isLoggedIn,(req,res)=>{
    res.render("student/studentprofile.ejs");
});

router.post("/details", isLoggedIn, wrapAsync(async(req,res)=>{
    const rawSkills = req.body.list.skills;
    const skillsArray = rawSkills.split(',').map(skill => skill.trim()).filter(Boolean);
    req.body.list.skills = skillsArray;
    let list = req.body.list;
    list.studentId = req.user._id;
    let student = new Student(list);
    let saved = await student.save();
    if(saved){
        req.flash("success","Welcome to ApnaIntern!");
        req.session.save(() => {
            res.redirect("/student");
        });
    }
}));
router.get("/profile",isLoggedIn,wrapAsync(async(req,res)=>{
    let User=req.user;
    console.log(User);
    let student=await Student.find({studentId:req.user.id});
    console.log(student,"hello");
    res.render("student/studentprofiledetails.ejs",{student,User});
}));

module.exports=router;