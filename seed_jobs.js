require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.js');
const Company = require('./models/company.js');
const Job = require('./models/job.js');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for job seeding...'))
  .catch(err => console.log('DB error', err));

async function seedJobs() {
  try {
    let companyUser = await User.findOne({ usertype: 'company' });
    
    if (!companyUser) {
        console.log("No company user found to own the jobs!");
        // We will create a fallback owner just so it works
        companyUser = new User({ email: 'fake@example.com', username: 'TechCorp', usertype: 'company' });
        await companyUser.save();
        let companyProfile = new Company({
            companyId: companyUser._id, companyName: 'TechCorp', location: { city: 'Mumbai', state: 'MH' },
            website: 'https://techcorp.com', contactNumber: '9999999999', companyDetails: 'Great place.', typeOf: 'Startup'
        });
        await companyProfile.save();
    }

    const jobs = [
      {
        title: "Frontend Developer",
        description: "Looking for an experienced React developer to build amazing UI.",
        requirement: "HTML, CSS, React, JS",
        location: "Remote",
        salaryRange: { min: 40000, max: 60000 },
        jobType: "Full-time",
        owner: companyUser._id
      },
      {
        title: "Backend Node.js Engineer",
        description: "Build robust APIs for our high-traffic platform.",
        requirement: "Node.js, Express, MongoDB",
        location: "Bangalore",
        salaryRange: { min: 50000, max: 80000 },
        jobType: "Full-time",
        owner: companyUser._id
      },
      {
        title: "UI/UX Designer",
        description: "Design beautiful and intuitive user experiences.",
        requirement: "Figma, Adobe XD, Design Systems",
        location: "Mumbai",
        salaryRange: { min: 30000, max: 50000 },
        jobType: "Contract",
        owner: companyUser._id
      }
    ];

    for (let jobData of jobs) {
        let job = new Job(jobData);
        await job.save();
        console.log(`Created job: ${jobData.title}`);
    }

    console.log("Job seeding complete!");
  } catch (err) {
    console.log("Seed error:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedJobs();
