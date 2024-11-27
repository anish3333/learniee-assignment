import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiver, content, type = "text" } = req.body;
    const message = new Message({
      sender: req.user?.userId,
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

export const getMessages = async (req, res) => {
  try {
    const { userid } = req.params;
    if (!userid) {
      res.status(400).json({ error: "User ID param is required" });
      return;
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user?.userId, receiver: userid },
        { sender: userid, receiver: req.user?.userId },
      ],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: "Error fetching messages" });
  }
};

export const getRecentChats = async (req, res) => {
  try {
    const userId = req.user?.userId; // Current user's ID
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Step 1: Fetch all messages involving the current user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ timestamp: -1 }); // Sort by latest first

    // Step 2: Process messages to extract unique users and latest timestamps
    const chatMap = {};

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

    // Step 3: Fetch user details for unique users
    const userIds = Object.keys(chatMap);
    const users = await User.find({ _id: { $in: userIds } }).select(
      "username isOnline"
    );

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