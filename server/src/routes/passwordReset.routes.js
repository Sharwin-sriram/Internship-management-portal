const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordReset.controller');
const { rateLimiter } = require('../middlewares/rateLimiter.middleware');

// Apply rate limiting to prevent abuse
router.post('/request', rateLimiter(5, 15), passwordResetController.requestReset);
router.post('/validate', passwordResetController.validateToken);
router.post('/reset', passwordResetController.resetPassword);

module.exports = router;
