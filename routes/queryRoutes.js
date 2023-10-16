const express = require('express');
const { savePackage } = require('../controller/queryCtrl');
const router = express.Router();

router.post('/', savePackage); 

module.exports = router;