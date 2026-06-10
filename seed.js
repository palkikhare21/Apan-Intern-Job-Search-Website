require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.js');
const Company = require('./models/company.js');
const Internship = require('./models/internship.js');
const Application = require('./models/application.js');
const passport = require('passport');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for seeding...'))
  .catch(err => console.log('DB error', err));

async function seedData() {
  try {
    // Find the student
    let studentUser = await User.findOne({ usertype: 'student' });
    if (!studentUser) {
        console.log("No student found to apply. Please sign up a student first.");
        process.exit(1);
    }

    // 1. Delete old ApnaPartner to prevent duplicate errors
    let oldUser = await User.findOne({ username: 'ApnaPartner' });
    if (oldUser) {
      await Company.deleteMany({ companyId: oldUser._id });
      await Internship.deleteMany({ owner: oldUser._id });
      await User.findByIdAndDelete(oldUser._id);
    }

    // 2. Create the Company User
    let newCompanyUser = new User({
        email: 'apnapartner@example.com',
        username: 'ApnaPartner',
        usertype: 'company'
    });
    
    // Passport's register method sets the salt and hash
    let registeredCompany = await User.register(newCompanyUser, 'apna123');
    console.log("Company user created: apnapartner@example.com / apna123");

    // 3. Create the Company Profile
    let companyProfile = new Company({
        companyId: registeredCompany._id,
        companyName: 'ApnaPartner',
        location: { city: 'Mumbai', state: 'MH', country: 'India' },
        website: 'https://apnapartner.com',
        contactNumber: '9999999999',
        companyDetails: 'A fast-growing partner for students and freshers.',
        typeOf: 'Startup'
    });
    await companyProfile.save();
    console.log("Company profile created.");

    // 4. Create the 5 Internships
    const roles = [
      "Software Engineering Intern",
      "Marketing Intern",
      "Data Science Intern",
      "Content Writing Intern",
      "Graphic Design Intern"
    ];

    for (let role of roles) {
        let intern = new Internship({
            title: role,
            description: `We are looking for a talented ${role}.`,
            stipend: 15000,
            duration: 3,
            owner: registeredCompany._id,
            location: 'Mumbai, India',
            skills: ['Communication', 'Teamwork'],
            requirement: 'Basic knowledge of the field.',
            category: 'Tech'
        });
        await intern.save();

        // 5. Apply the student to the internship
        let application = new Application({
            userId: studentUser._id,
            internshipId: intern._id,
            Status: 'pending'
        });
        await application.save();
        console.log(`Created internship and applied student: ${role}`);
    }

    console.log("Seed complete!");
  } catch (err) {
    console.log("Seed error:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedData();
