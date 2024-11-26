import { Router } from 'express';
import auth from '../middleware/auth.middleware';
import { sendMessage, getMessages } from '../controllers/message.controller';

const router = Router();

router.post('/', auth, sendMessage);
router.get('/:userid', auth, getMessages);

export default router;
