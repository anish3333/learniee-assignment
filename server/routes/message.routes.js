import { Router } from 'express';
import auth from '../middleware/auth.middleware.js';
import { sendMessage, getMessages, getRecentChats } from '../controllers/message.controller.js';

const router = Router();

router.post('/', auth, sendMessage);
router.get('/m/:userid', auth, getMessages);
router.get('/recent-chats', auth, getRecentChats);

export default router;
