const express = require('express');
const { signup , login} = require('../controllers/authController');
const authRateLimit = require('../middleware/rateLimit');

const router = express.Router();

router.post('/signup', authRateLimit, signup);
router.post('/login', authRateLimit, login);

module.exports = router;
