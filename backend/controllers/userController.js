const User = require('../model/User');
const { generateToken } = require('../middleware/authMiddleware');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: token, // Return token in response for production
      message: 'Login successful'
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private
const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { register, login, logout };