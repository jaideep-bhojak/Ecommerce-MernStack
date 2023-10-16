const express = require('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { createBrand, updateBrand, deleteBrand, getaBrand, getAllBrand } = require('../controller/brandCtrl');
const router = express.Router();

router.post('/create-brand', authMiddleware, isAdmin, createBrand);
router.put('/:id', authMiddleware, isAdmin, updateBrand);
router.delete('/:id', authMiddleware, isAdmin, deleteBrand);
router.get('/:id', getaBrand);
router.get('/', authMiddleware, isAdmin, getAllBrand);

module.exports = router 