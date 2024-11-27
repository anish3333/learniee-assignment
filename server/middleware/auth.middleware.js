import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded; // Attach the decoded user info to the request
    next(); // Proceed to the next middleware/handler
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default auth;
