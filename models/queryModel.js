const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var querySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    
    npmPackage:{
        type:String,
        required:true,
    },
    description:{
        type: String
    }
});

//Export the model
module.exports = mongoose.model('Query', querySchema);