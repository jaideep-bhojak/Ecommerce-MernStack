const express = require('express');
const { createCategory, updateCategory, deleteCategory, getaCategory, getAllCategory } = require('../controller/pCategoryCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/create-category', authMiddleware, isAdmin, createCategory);
router.put('/:id', authMiddleware, isAdmin, updateCategory);
router.delete('/:id', authMiddleware, isAdmin, deleteCategory);
router.get('/:id', getaCategory);
router.get('/', authMiddleware, isAdmin, getAllCategory);

module.exports = router 