const express = require('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, disliketheBlog, uploadImages } = require('../controller/blogCtrl');
const { blogImgResize, uploadPhoto } = require('../middlewares/uploadImages');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createBlog);
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images', 2), blogImgResize , uploadImages); 
router.put('/dislike-blog', authMiddleware, disliketheBlog);
router.put('/like-blog', authMiddleware, likeBlog);
router.put('/:id', authMiddleware, isAdmin, updateBlog);
router.get('/:id', getBlog);
router.get('/', getAllBlogs);
router.delete('/:id', authMiddleware, deleteBlog);

 
module.exports = router;