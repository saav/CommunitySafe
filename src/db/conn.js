const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/nodeproject").then(()=>{
    console.log("The connection is sucessfully")
}).catch(()=>{
    console.log("The connection is not sucessfully")
})