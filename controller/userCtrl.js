const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { param } = require('../routes/authRoutes');
const validateMongoDbId = require('../utils/validateMongoDbId');
const { generateRefreshToken } = require('../config/refreshToken'); 
const jwt  = require('jsonwebtoken');
const sendEmail = require('./emailCtrl');
const crypto = require('crypto');



const createUser = asyncHandler(
    async(req, res) =>{
        const email = req.body.email;
        const findUser =await User.findOne({email: email});
        if(!findUser){
            const newUser =await User.create(req.body);
            res.json(newUser);          
        }
        else{
            throw new Error('User Already Exists');
            // res.json({
            //     msg: "user already created",
            //     success: false
            // })
        }
    }
);

const loginUserCtrl = asyncHandler( async(req, res) => {
     const {email, password} = req.body;
     //console.log(email, password);
     //check if user exist or not
     const findUser = await User.findOne({email});
     if(findUser && await findUser.isPasswordMatched(password)){
        //res.json(findUser);
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(findUser._id, {
            refreshToken: refreshToken 
        },{
            new: true
        });
        res.cookie('refreshToken',refreshToken,{
            httpOnly: true,
            maxAge: 72*60*60*1000,
        }); 
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        })

     }else{
        throw new Error("Invalid credentials");
     }
});

//handle refresh token
const handleRefreshToken = asyncHandler(async(req,res)=>{
    const cookie = req.cookies;
    if(!cookie) throw new Error('Not Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user) throw new Error('No Refresh Token is present in DB or not matched.');
    jwt.verify(refreshToken, process.env.JWT_SECRET,(err, decodedURI) =>{
        console.log(decodedURI);
        if(err || user.id !== decodedURI.id) {
            throw new Error('Something wrong with refresh token in handleRefreshToken.')
        }
        const accessToken = generateToken(user?.id);
        res.json({accessToken}); 
});
});


//get all users
const getAllUsers = asyncHandler(async(req, res)=>{
    try{
        const users =await User.find();
        res.json(users);
        
    }catch(error){
        throw new Error(error);
    }
});

//get a user

const getUser = asyncHandler(async(req, res)=> {
    const { id } = req.user;
    console.log(id);
    validateMongoDbId(id);
    try {
        const getAUser = await User.findById(id);
        res.json({
            user: getAUser
        })
    } catch (error) {
        throw new Error(error);
    }
});

//delete a user


const deleteUser = asyncHandler(async(req, res)=> {
    console.log('user to be deleted'+ req.params);
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deleteAUser = await User.findByIdAndDelete(id);
        res.json({
            userdeleted: deleteAUser
        })
    } catch (error) {
        throw new Error(error);
    }
});

//logout functionality

const logout = asyncHandler(async(req, res)=>{
    const cookie = req.cookies;
    if(!cookie) throw new Error('Not Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user){
        res.clearCookie('refreshToken',{
            httpOnly: true,
            secure: true
        });
        return res.sendStatus(204); //forbidden
    }
    await User.findOneAndUpdate({refreshToken},{
        refreshToken: '',  
    });
    res.clearCookie('refreshToken',{
        httpOnly: true,
        secure: true
    });
    res.sendStatus(204); //forbidden 
});


//Update a user

const updateUser = asyncHandler(async(req, res)=>{
    const { id } = req.user;
    validateMongoDbId(id);
    try {
        const updatedUser= await User.findByIdAndUpdate(id,{
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile
        }, {
            new: true,
        });

        res.json({
            updatedUser
        })
        
    } catch (error) {
        throw new Error(error);
    }
});

const blockUser = asyncHandler(async(req, res)=>{
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const block =await User.findByIdAndUpdate(id, {
            isBlocked: true
        }, {
            new: true
        });
        res.json({block});

    } catch (error) {
        throw new Error(error)
    }
});
const unBlockUser = asyncHandler(async(req, res)=>{
    const { id } = req.params;
    validateMongoDbId(id);
    console.log(id);
    try {
        const unBlock =await User.findByIdAndUpdate(id, {
            isBlocked: false
        }, {
            new: true
        });
        res.json({unBlock});
    } catch (error) {
        throw new Error(error)
    }
});


const updatePassword = asyncHandler(async(req, res)=>{
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if(password){
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    }else{
        res.json(user); 
    }
});

//when user clicks the forgot password button

const forgotPasswordToken = asyncHandler(async(req, res)=>{
    const {email} = req.body;
    console.log({email});
    const user =await User.findOne({email});
    if(!user){
        throw new Error('User not found with this email.');
    }

    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, please follow this link to reset your password. This link is valid for 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</a>`
        const data = {
            to: email,
            text: 'Hey user',
            subject: "Forgot Password Link",
            htm: resetURL
        };
        sendEmail(data);
        res.json(token);

    } catch (error) {
        throw new Error(error);
    }
});

// when user clicks the link to reset the password.

const resetPassword = asyncHandler(async(req, res)=>{
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if(!user) throw new Error("Token Expired, please try again later");

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
})


module.exports = {createUser, 
    loginUserCtrl, getAllUsers, getUser, deleteUser,updateUser,
    blockUser,
    unBlockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword
    };  