import { Request, Response } from 'express';
import { Message } from '../models/message.model';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiver, content, type = 'text' } = req.body;
    const message = new Message({
      sender: (req as any).user?.userId,
      receiver,
      content,
      type
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: 'Error sending message' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    if(!userId) return res.status(400).json({ error: 'User ID param is required' })
    // console.log('User ID:', userId)
    // console.log('Authenticated User ID:', (req as any).user?.userId)


    const messages = await Message.find({
      $or: [
        { sender: (req as any).user?.userId , receiver: userId },
        { sender: userId, receiver: (req as any).user?.userId}
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching messages' });
  }
};
