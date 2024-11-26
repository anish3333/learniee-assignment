import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContest";
import { useAuth } from "../context/AuthContext";

interface User {
  _id: string;
  username: string;
  isOnline?: boolean;
}

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
  type: string;
}

const ChatPage = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const [searchUsername, setSearchUsername] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [receiver, setReceiver] = useState<User | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<any | null>(null);
  const [recentChats, setRecentChats] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize user and socket connection
  useEffect(() => {
    if (user) {
      setCurrentUser({
        _id: user.id,
        username: user.username,
        isOnline: user.isOnline,
      });
      socket?.emit("user_connected", user.id);
      fetchRecentChats();
    }
  }, [user, socket]);

  const fetchRecentChats = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/messages/recent-chats",
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      console.log("Recent chats:", data);

      setRecentChats(data);
    } catch (error) {
      console.error("Error fetching recent chats:", error);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchUser = async () => {
    if (!searchUsername.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/search?username=${searchUsername}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setReceiver(data.user);
      console.log(data.user)
      if (data.user._id) {
        const historyRes = await fetch(
          `http://localhost:5000/api/messages/m/${data.user._id}`,
          { credentials: "include" }
        );
        const messages = await historyRes.json();
        setMessages(messages);
      }
    } catch (error) {
      console.error("User not found:", error);
    }
  };

  const handleTyping = () => {
    if (socket && receiver) {
      socket.emit("typing", {
        sender: currentUser?._id,
        receiver: receiver._id,
      });

      if (typingTimeout) clearTimeout(typingTimeout);

      const timeout = setTimeout(() => setIsTyping(false), 2000);
      setTypingTimeout(timeout);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !receiver || !currentUser) return;

    const messageData = {
      receiver: receiver._id,
      content: inputMessage,
      type: "text",
      timestamp: new Date().toISOString(),
      sender: currentUser._id,
    };

    try {
      const optimisticMessage = {
        ...messageData,
        _id: Date.now().toString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      setInputMessage("");

      const res = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
        credentials: "include",
      });
      const savedMessage = await res.json();

      socket?.emit("send_message", savedMessage);

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === optimisticMessage._id ? savedMessage : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleRecentMessageClick = async (user: User) => {
    setReceiver(user);
    console.log(user)
      if (user._id) {
        const historyRes = await fetch(
          `http://localhost:5000/api/messages/m/${user._id}`,
          { credentials: "include" }
        );
        const messages = await historyRes.json();
        console.log("Fetched messages:", messages)

        setMessages(messages);
      }
  }

  useEffect(() => {
    if (!socket || !receiver) return;

    socket.on("receive_message", (message: Message) => {
      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg._id === message._id);
        return messageExists ? prev : [...prev, message];
      });
    });

    socket.on("user_typing", ({ userId }: { userId: string }) => {
      // Only show typing if the typing user is the current receiver
      if (userId === receiver._id) {
        setIsTyping(true);

        // Automatically stop typing indication after 2 seconds
        setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    });

    socket.on(
      "user_status_change",
      ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
        if (receiver && userId === receiver._id) {
          setReceiver((prev) => (prev ? { ...prev, isOnline } : null));
        }
      }
    );

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_status_change");
    };
  }, [socket, receiver]);

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Current User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {currentUser ? getInitials(currentUser.username) : "?"}
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">
                {currentUser?.username}
              </h2>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchUser()}
              placeholder="Search users..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={searchUser}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </div>

        {/* Recent Chats */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">
              Recent Chats
            </h3>
            <div className="space-y-2">
              {recentChats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => handleRecentMessageClick(chat)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-150
                    ${
                      receiver?._id === chat._id
                        ? "bg-blue-50 border border-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                    {getInitials(chat.username)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{chat.username}</p>
                    <p className="text-sm text-gray-500">
                      {chat.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {receiver ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 px-6 flex items-center bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                  {getInitials(receiver.username)}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {receiver.username}
                  </h2>
                  <p
                    className={`text-sm ${
                      receiver.isOnline ? "text-green-500" : "text-gray-500"
                    }`}
                  >
                    {receiver.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {messages.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  className={`flex ${
                    msg.sender === currentUser?._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === currentUser?._id
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-100 rounded-bl-none"
                    }`}
                  >
                    <p className="break-words">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === currentUser?._id
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="text-gray-500 text-sm italic">
                  {receiver.username} is typing...
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="h-20 border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    if (e.target.value.trim()) {
                      handleTyping();
                    }
                  }}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          // Welcome Screen
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md w-full mx-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to Chat
              </h2>
              <p className="text-gray-500">
                Search for a user to start chatting or select from your recent
                conversations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
