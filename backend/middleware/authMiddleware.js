const jwt = require('jsonwebtoken');
const User = require('../model/User')

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '3h' });
  return token;
};

const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check Authorization header first (for production cross-origin)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Fallback to cookies (for local development)
    else if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
    
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = { generateToken, protect };