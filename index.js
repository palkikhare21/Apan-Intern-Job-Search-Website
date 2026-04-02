const express=require("express");
const app=express();
const mongoose=require("mongoose");
const ejsMate=require("ejs-mate");
const path=require("path");
const session=require("express-session");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const expressError=require("./utils/expressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const flash=require("connect-flash");
const User = require("./models/user.js");
const Internship = require("./models/internship.js");
const Job = require("./models/job.js");
const methodOverride=require("method-override");



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));


const sessionOption={ 
    secret:"secretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,  //ms*s*min*h*days
        maxAge:1000*60*60*24*3,
    }
};
app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use( new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const student_route=require("./routes/student.js");
const student_intern_route=require("./routes/student_internship.js");
const student_job_route=require("./routes/student_job.js");
const company_route=require("./routes/company.js");
const company_intern_route=require("./routes/company_internship.js");
const company_job_route=require("./routes/company_job.js");
const user_route=require("./routes/user.js");



// Disable Mongoose buffering to avoid the 10s timeout error on Vercel.
// Queries will now fail immediately if the DB is not connected.
mongoose.set('bufferCommands', false);

async function main() {
    const dbUrl = process.env.STORAGE_URL || process.env.MONGODB_URI || process.env.ATLAS_URL;
    
    console.log("DB URL Found:", !!dbUrl); // Log if the URL arrives at the server

    try {
        await mongoose.connect(dbUrl || "mongodb://127.0.0.1:27017/apnaintern");
        console.log("Connected to MongoDB successfully");
    } catch (err) {
        console.error("Critical MongoDB connection error:", err);
    }
}
main();

mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection heart-beat error:", err);
});


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    res.locals.isSignup=req.session.isSignup;
    next();
});


app.get("/", async (req, res) => {
    try {
        // Only attempt to find if the connection is ready (state 1 is connected)
        if (mongoose.connection.readyState !== 1) {
            console.warn("Attempting query while DB is not ready. State:", mongoose.connection.readyState);
            return res.render("home.ejs", { internships: [], jobs: [] });
        }
        const internships = await Internship.find({}).limit(6);
        const jobs = await Job.find({}).limit(6);
        res.render("home.ejs", { internships, jobs });
    } catch (err) {
        console.error("Homepage load error:", err);
        res.render("home.ejs", { internships: [], jobs: [] });
    }
});
//student
app.use("/student",student_route);
app.use("/student/internship",student_intern_route);
app.use("/student/job",student_job_route);

//company
app.use("/company",company_route);
app.use("/company/internship",company_intern_route);
app.use("/company/job",company_job_route);

//signup,login/logout
app.use("/",user_route);
app.use("/signup",(req,res)=>{
    res.render("beforeSignup.ejs");

});
app.all(/.*/,(req,res,next)=>{
    next(new expressError(404,"page not found"));
});

app.use((err,req,res,next)=>{
    let{statusCode=500,message="Some error!"}=err;
    res.status(statusCode).render("error.ejs",{message});
});


app.listen(8080,(req,res)=>{
    console.log("listening..............");

});

module.exports = app;
