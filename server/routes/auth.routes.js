import express from 'express';
import { login, register, logout, isAuthenticated, searchUser } from '../controllers/auth.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/search', searchUser);

// Protected routes
router.get('/isauth', auth, isAuthenticated);

export default router;
