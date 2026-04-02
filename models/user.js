const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportlocalmongoosge=require("passport-local-mongoose");

const userSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    usertype:{
        type:String,
        required:true
    }
});

userSchema.plugin(passportlocalmongoosge);

const User=mongoose.model("user",userSchema);
module.exports=User;