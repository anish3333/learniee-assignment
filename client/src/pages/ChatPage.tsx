import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContest";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/SideBar";
import { ChatHeader } from "../components/ChatHeader";
import { MessagesArea } from "../components/MessagesArea";
import { InputArea } from "../components/InputArea";
import { WelcomeScreen } from "../components/WelcomeScreen";
import { ReceiptRussianRuble } from "lucide-react";

export interface User {
  _id: string;
  username: string;
  isOnline?: boolean;
}

export interface Message {
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
        `${import.meta.env.VITE_PROXY_URL}/proxy?url=${encodeURIComponent(
          `${import.meta.env.VITE_SERVER_URL}/api/messages/recent-chats`
        )}`,
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
        `${import.meta.env.VITE_PROXY_URL}/proxy?url=${encodeURIComponent(
          `${
            import.meta.env.VITE_SERVER_URL
          }/api/auth/search?username=${searchUsername}`
        )}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setReceiver(data.user);
      console.log(data.user);
      if (data.user._id) {
        const historyRes = await fetch(
          `${import.meta.env.VITE_PROXY_URL}/proxy?url=${encodeURIComponent(
            `${import.meta.env.VITE_SERVER_URL}/api/messages/m/${data.user._id}`
          )}`,
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

      const res = await fetch(
        `${import.meta.env.VITE_PROXY_URL}/proxy?url=${encodeURIComponent(
          `${import.meta.env.VITE_SERVER_URL}/api/messages`
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messageData),
          credentials: "include",
        }
      );
      
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
    console.log(user);
    if (user._id) {
      const historyRes = await fetch(
        `${import.meta.env.VITE_PROXY_URL}/proxy?url=${encodeURIComponent(
          `${import.meta.env.VITE_SERVER_URL}/api/messages/m/${user._id}`
        )}`,
        { credentials: "include" }
      );
      const messages = await historyRes.json();
      console.log("Fetched messages:", messages);

      setMessages(messages);
    }
  };

  useEffect(() => {
    if (!socket || !receiver) {
      console.log(socket, receiver)
      console.log("socket or receiver not found");
      return;
    }

    socket.on("receive_message", (message: Message) => {
      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg._id === message._id);
        return messageExists ? prev : [...prev, message];
      });
    });

    socket.on("user_typing", ({ userId }: { userId: string }) => {
      if (userId === receiver?._id) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    });

    const handleUserStatusChange = ({
      userId,
      isOnline,
    }: {
      userId: string;
      isOnline: boolean;
    }) => {
      console.log("User status change event received:", userId, isOnline);

      if (receiver && userId === receiver._id) {
        setReceiver((prev) => (prev ? { ...prev, isOnline } : null));
      }

      setRecentChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === userId ? { ...chat, isOnline } : chat
        )
      );
    };

    socket.on("user_status_change", handleUserStatusChange);

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_status_change", handleUserStatusChange);
    };
  }, [socket, receiver, currentUser]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-gray-50 border-t-2">
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        searchUsername={searchUsername}
        setSearchUsername={setSearchUsername}
        searchUser={searchUser}
        recentChats={recentChats}
        handleRecentMessageClick={handleRecentMessageClick}
        receiver={receiver}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {receiver ? (
          <>
            <MessagesArea
              messages={messages}
              currentUser={currentUser}
              receiver={receiver}
              isTyping={isTyping}
              chatContainerRef={chatContainerRef}
            />
            <InputArea
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              sendMessage={sendMessage}
              handleTyping={handleTyping}
            />
          </>
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
