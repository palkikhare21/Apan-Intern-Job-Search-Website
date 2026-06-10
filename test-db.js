const mongoose = require('mongoose');
const uri = "mongodb://127.0.0.1:27017/apnaintern";
mongoose.connect(uri).then(() => {
    console.log("Connected successfully!");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
