import { Router } from 'express';
import auth from '../middleware/auth.middleware';
import { sendMessage, getMessages, getRecentChats } from '../controllers/message.controller';

const router = Router();

router.post('/', auth, sendMessage);
router.get('/m/:userid', auth, getMessages);
router.get('/recent-chats', auth, getRecentChats as any);

export default router;
