import express from 'express';
import { login, register, logout, isAuthenticated } from '../controllers/auth.controller';
import auth from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.get('/logout', logout as any)

// protected
router.get('/isauth', auth, isAuthenticated as any)
export default router;