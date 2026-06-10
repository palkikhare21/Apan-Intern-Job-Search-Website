const mongoose = require('mongoose');
const { Schema } = mongoose;


const companySchema=new Schema({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    location: {
        city: { type: String },
        state: { type: String },
        country: {
            type: String,
            default: "India"
        }
    },
    website: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    companyDetails: {
        type: String,
        required: true
    },
    internshipIDs: [
        {
            type: Schema.Types.ObjectId,
            ref: "Internship"
        }
    ],
    jobIDs: [
        {
            type: Schema.Types.ObjectId,
            ref: "Job"
        }
    ],
    typeOf:{
        type:String,
        required:true
    }
});


const Company=mongoose.model("company",companySchema);
module.exports=Company;