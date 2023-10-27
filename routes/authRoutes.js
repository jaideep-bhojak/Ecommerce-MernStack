const express  = require('express');
const { createUser, loginUserCtrl, getAllUsers, getUser, deleteUser, updateUser, blockUser, unBlockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, loginAdmin, getWishList, saveAddress } = require('../controller/userCtrl');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', createUser);
router.post('/forgot-password-token', forgotPasswordToken);
router.put('/reset-password/:token', resetPassword);

router.put('/password', authMiddleware, updatePassword)
router.post('/login', loginUserCtrl);
router.post('/admin-login', loginAdmin);
router.get('/users', getAllUsers);
router.get ('/refreshApi', handleRefreshToken);
router.get ('/logout', logout);

router.get('/wishlist', authMiddleware, getWishList);
router.get('/:id', authMiddleware,isAdmin, getUser);
router.delete('/:id', deleteUser);
router.put('/edit-user', authMiddleware, updateUser);
router.put('/save-address', authMiddleware, saveAddress);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unBlockUser);


module.exports = router;