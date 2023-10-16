const Blog =require("../models/blogModel");
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId");

const createBlog = asyncHandler(async(req, res)=>{
    try {
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);
    } catch (error) {
        throw new Error(error);
    }
});

//update blog
const updateBlog = asyncHandler(async(req, res)=>{
    const { id } = req.params; 
    //validateMongoDbId(id);
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.json(updatedBlog);
    } catch (error) {
        throw new Error(error);
    }
});

// get block
const getBlog = asyncHandler(async(req, res)=>{
    const { id } = req.params; 
    validateMongoDbId(id);
    try {
        const blog = await Blog.findById(id).populate('likes');
        const updatedBlog = await Blog.findByIdAndUpdate(
            id, 
            { $inc: { numViews: 1}}, 
            { new : true});
        res.json(blog);
    } catch (error) {
        throw new Error(error);
    }
});

//get all blogs

const getAllBlogs = asyncHandler(async(req, res)=>{
    try {
        const getBlogs = await Blog.find();
        res.json(getBlogs);    
    } catch (error) {
        throw new Error(error);
    }
});

//delete blogs
const deleteBlog = asyncHandler(async(req, res)=>{
    const { id } = req.params; 
    validateMongoDbId(id);
    try {
        const deletedBlog = await Blog.findByIdAndDelete(id);
        res.json(deletedBlog);
    } catch (error) {
        throw new Error(error);
    }
});

//liked 
const likeBlog = asyncHandler(async(req, res)=>{
    const {blogId} = req.body;
    validateMongoDbId(blogId);
    try {
        //find the blog to be liked
        const blog = await Blog.findById(blogId ); 
        //find the login user
        const loginUserId = req?.user?._id;
        //if the user has liked the post
        const isLiked = blog?.isLiked;
        //find if the user has disliked the blog
        blog?.dislikes?.forEach(x => console.log(x));
        const alreadyDisliked = blog?.dislikes?.some((userId => userId?.toString() === loginUserId.toString()));
        console.log(alreadyDisliked);
        if(alreadyDisliked){
            const updatedBlog = await Blog.findByIdAndUpdate(blogId, {
                $pull: { dislikes: loginUserId },
                isdisliked: false
            }, {new: true});
          //res.json(blog);
        }

        if(isLiked){
            const updatedBlog = await Blog.findByIdAndUpdate(blogId, {
                $pull: { likes: loginUserId },
                isLiked: false
            }, {new: true});

            //res.json(updatedBlog);
        }
        else{
            const updatedBlog = await Blog.findByIdAndUpdate(blogId, {
                $push: { likes: loginUserId },
                isLiked: true
            }, {new: true});     
        }

        res.json(await Blog.findById(blogId));
    } catch (error) {
        throw new Error(error);
    }
});

//disliked 
const disliketheBlog = asyncHandler(async(req, res)=>{
    const { blogId } = req.body;
    validateMongoDbId(blogId);
    try {
        //find the blog to be liked
        const blog = await Blog.findById(blogId); 
        //find the login user
        const loginUserId = req?.user?._id;
        //if the user has liked the post
        const isDisliked = blog?.isdisliked;
        //find if the user has liked the blog
        const alreadyLikeBlog = blog?.likes?.some((userId => userId.toString() === loginUserId.toString())); //blog?.likes?.find((userId => userId?.toString() === loginUserId.toString()));
        console.log(`checking length of likes in dislike method: ${blog?.likes?.length}`);
        console.log(alreadyLikeBlog);
        if(alreadyLikeBlog){
            const updatedblog = await Blog.findByIdAndUpdate(blogId, {
                $pull: { likes: loginUserId },
                isLiked: false
            }, {new: true});

            //res.json(updatedblog);
        }

        if(isDisliked){
            const updatedblog = await Blog.findByIdAndUpdate(blogId, {
                $pull: { dislikes: loginUserId },
                isdisliked: false
            }, {new: true});

            //res.json(updatedblog);
        }
        else{
            console.log("entered in else")
            const updatedblog = await Blog.findByIdAndUpdate(blogId, {
                $push: { dislikes: loginUserId },
                isdisliked: true
            }, {new: true});

            //res.json(updatedblog);           
        }
        
        res.json(await Blog.findById(blogId));
        
    } catch (error) {
        throw new Error(error);
    }
    
})


module.exports = { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, disliketheBlog}