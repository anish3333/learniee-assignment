import express from 'express';
import { login, register, logout } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.get('/logout', logout as any)

export default router;