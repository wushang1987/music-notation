const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/generate', aiController.generateMusic);
router.post('/modify', aiController.modifyMusic);

module.exports = router;
