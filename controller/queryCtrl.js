const Query = require('../models/queryModel');
const asyncHandler = require('express-async-handler');

const savePackage = asyncHandler(async(req,res)=> {
    try {
        const saveQuery = await Query.create(req.body);
        res.json(saveQuery);    
    } catch (error) {
        throw new Error(error);
    }
      
});

module.exports = {savePackage}