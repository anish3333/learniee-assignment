import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const auth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.auth_token
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return; // Stop further execution
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    (req as any).user = decoded as { userId: string };
    next(); // Proceed to the next middleware/handler
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
    return; // Stop further execution
  }
};

export default auth;
