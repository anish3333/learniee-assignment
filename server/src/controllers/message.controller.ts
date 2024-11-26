import { Request, Response } from "express";
import { Message } from "../models/message.model";
import { User } from "../models/user.model";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiver, content, type = "text" } = req.body;
    const message = new Message({
      sender: (req as any).user?.userId,
      receiver,
      content,
      type,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: "Error sending message" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { userid } = req.params;
    if (!userid) {
      res.status(400).json({ error: "User ID param is required" });
      return;
    }
    // console.log('User ID:', userId)
    // console.log('Authenticated User ID:', (req as any).user?.userId)

    const messages = await Message.find({
      $or: [
        { sender: (req as any).user?.userId, receiver: userid },
        { sender: userid, receiver: (req as any).user?.userId },
      ],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: "Error fetching messages" });
  }
};

export const getRecentChats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId; // Current user's ID
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log("User ID:", userId);

    // Step 1: Fetch all messages involving the current user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ timestamp: -1 }); // Sort by latest first

    console.log("Messages fetched:", messages);

    // Step 2: Process messages to extract unique users and latest timestamps
    const chatMap: Record<string, { lastMessageTime: Date }> = {};

    messages.forEach((message) => {
      const otherUser =
        message.sender.toString() === userId
          ? message.receiver.toString()
          : message.sender.toString();

      // Update the map only if this message is more recent
      if (!chatMap[otherUser] || chatMap[otherUser].lastMessageTime < message.timestamp) {
        chatMap[otherUser] = { lastMessageTime: message.timestamp };
      }
    });

    console.log("Chat Map:", chatMap);

    // Step 3: Fetch user details for unique users
    const userIds = Object.keys(chatMap);
    const users = await User.find({ _id: { $in: userIds } }).select(
      "username isOnline"
    );

    console.log("Users fetched:", users);

    // Step 4: Combine user details with message information
    const formattedChats = users.map((user) => ({
      id: user._id,
      username: user.username,
      isOnline: user.isOnline,
      lastMessageTime: chatMap[user._id.toString()].lastMessageTime.toISOString(),
    }));

    // Sort the chats by last message time
    formattedChats.sort(
      (a, b) =>
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime()
    );

    const final = users.map((user) => ({
      _id: user._id,
      username: user.username,
      isOnline: user.isOnline,
    }));

    res.json(final);
  } catch (error) {
    console.error("Error fetching recent chats:", error);
    res.status(500).json({ error: "Error fetching recent chats" });
  }
};

