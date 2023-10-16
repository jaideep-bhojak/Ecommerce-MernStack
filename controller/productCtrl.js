const Product = require('../models/productModel');
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");
const slugify = require('slugify');

const createProduct =asyncHandler(async(req,res)=>{
    try {
    if(req.body.title){
        req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);

    } catch (error) {
        throw new Error(error);
    }
});

//product update

const updateProduct = asyncHandler(async(req, res)=>{
    const  {id}  = req.params;
    try {
       if(req.body.title){
        req.body.slug = slugify(req.body.title);
       }
       const updatedProduct  =await Product.findByIdAndUpdate(  id , req.body, {
        new: true,
       });
       res.json({updatedProduct});

    } catch (error) {
        throw new Error(error);
    }
});

//product deletion
const deleteProduct = asyncHandler(async(req, res)=>{
    const  {id}  = req.params;
    try {
       if(req.body.title){
        req.body.slug = slugify(req.body.title);
       }
       const deletedProduct  =await Product.findByIdAndDelete(id);
       res.json({deletedProduct});

    } catch (error) {
        throw new Error(error);
    }
})


//get a product
const getAProduct = asyncHandler(async(req, res)=>{
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllProducts = asyncHandler(async(req, res)=>{
    console.log(req.query);

    try {
        //filtering based on price values
        const queryObj = {...req.query}; 
        const excludeFields = ['page','sort', 'limit', 'fields'];
        excludeFields.forEach((x)=> delete queryObj[x]);        
        //console.log(queryObj, req.query);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        //console.log(JSON.parse(queryStr));
        let query = Product.find(JSON.parse(queryStr));
        //console.log(query);
        
        // Sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(",").join(' ');
            query = query.sort(sortBy);
        }else{
            query = query.sort('-createdAt');
        }

        //limiting the fields
        if(req.query.fields){
            const fields = req.query.fields.split(",").join(' ');
            query = query.select(fields);
        }else{
            query = query.select('-__v'); 
        }

        // pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if(req.query.page){
            const productCount = await Product.countDocuments();
            if(skip >= productCount){
                throw new Error('This page does not exist');
            }
        }
        
        const product = await query;
        //const getAllProduct = await Product.find(queryObj);
        // const getAllProduct = await Product.find({
        //     brand: req.query.brand,
        //     category: req.query.category
        // });
        //const getAllProduct = await Product.where("category").equals(req.query.category);
        res.json(product);
    } catch (error) {
        throw new Error(error);
    }
});

const addToWishList = asyncHandler(async(req, res)=>{
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyAdded = user?.wishlist?.find((pId) => pId.toString() === prodId.toString());
        if(alreadyAdded){
            let user = await User.findByIdAndUpdate(_id, {
                $pull: { wishlist: prodId }
            }, { new : true });

            res.json(user);
        }else{   
            let user = await User.findByIdAndUpdate(_id, {
                $push: { wishlist: prodId }
            }, { new : true });

            res.json(user);

        }
    } catch (error) {
        throw new Error(error);
    }
});

const rating = asyncHandler(async(req, res)=>{
    const { _id } = req.user;
    const { star, prodId, userComment } = req.body;
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(user => user.postedBy.toString() === _id.toString());
    console.log(`alreadyRated: ${alreadyRated}`); 
    if(alreadyRated){
        try {
            const updateRating = await Product.updateOne(
                {
                  ratings: { $elemMatch: alreadyRated }
                },
                {
                    $set: { "ratings.$.star": star, "ratings.$.comment": userComment}
                },
                {
                    new: true
                }
            );
            
        } catch (error) {
            throw new Error(error);
        }
    }else{
        const ratedProduct = await Product.findByIdAndUpdate(prodId, {
            $push: {
                ratings:{
                    star: star,
                    comment: userComment,
                    postedBy: _id
                }
             }            
        }, {new : true});

    }

    const getallRatings = await Product.findById(prodId);
    let totalOfRating = getallRatings.ratings.length;
    let ratingSum = getallRatings.ratings.map( item => item.star).reduce((previous, current)=> previous + current, 0);
    let actualRating = Math.round(ratingSum / totalOfRating);
    let finalProduct = await Product.findByIdAndUpdate(prodId, {
        totalRating : actualRating
    }, { new : true });

    res.json(finalProduct);

})

const uploadImages = asyncHandler(async(req, res) => {
    console.log('level3');
    console.log(req.files);
    console.log('level4');
});

module.exports = {createProduct, getAProduct,
     getAllProducts, updateProduct, deleteProduct, addToWishList,
    rating, uploadImages}