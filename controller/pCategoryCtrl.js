const Category = require('../models/pCategoryModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongoDbId');


const createCategory = asyncHandler(async(req, res)=>{
    try {
        const newCategory = await Category.create(req.body);
        res.json(newCategory)
    } catch (error) {
        throw new Error(error);
    }
});

const updateCategory = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
            new: true
        });

        res.json(updatedCategory);
    } catch (error) {
        throw new Error(error);
    }
});

//product deletion
const deleteCategory = asyncHandler(async(req, res)=>{
    const  {id}  = req.params;
    validateMongoDbId(id);
    try {
       const deletedCategory  =await Category.findByIdAndDelete(id);
       res.json(deletedCategory);

    } catch (error) {
        throw new Error(error);
    }
});

const getaCategory = asyncHandler(async(req, res)=>{
    const {id} = req.params
    try {
        const getCategory = await Category.findById(id);
        res.json(getCategory);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllCategory = asyncHandler(async(req, res)=>{
    try {
       const allCategories = await Category.find();
       res.json(allCategories);
    } catch (error) {
        throw new Error(error);
    }
})



module.exports = {createCategory, updateCategory, deleteCategory, getaCategory, getAllCategory}