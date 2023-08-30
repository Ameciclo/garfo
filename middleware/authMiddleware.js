// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const secretKey = process.env.UPDATE_SECRET;

module.exports = (req, res, next) => {
  
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded.user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
};
