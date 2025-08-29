const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// This is an example of a protected route.
// A user must be logged in to access this.
router.get('/dashboard', protect, (req, res) => {
  res.json({ message: `Welcome to your dashboard, ${req.user.username}!` });
});

module.exports = router;