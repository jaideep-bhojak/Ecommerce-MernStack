const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,

    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    numViews:{
        type: Number,
        default:0,
    },
    isLiked:{
        type: Boolean,
        default: false
    },
    isdisliked:{
        type:Boolean,
        default: false
    },
    likes:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User"
    },
    dislikes:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User"
    },
    image:{
        type: String,
        default: "https://media.istockphoto.com/id/922745190/photo/blogging-blog-concepts-ideas-with-worktable.jpg?s=612x612&w=0&k=20&c=xR2vOmtg-N6Lo6_I269SoM5PXEVRxlgvKxXUBMeMC_A=",

    },
    images: [],
    author: {
        type: String,
        default: "Admin"
    }

},{
    toJSON: {
        virtuals: true
    },
    toObject:{
      virtuals: true,  
    },
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Blog', blogSchema);