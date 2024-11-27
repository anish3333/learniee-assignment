import React, { useState } from "react";
import { getInitials } from "../lib/utils";
import { Menu, ChevronLeft, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Sidebar = ({
  currentUser,
  searchUsername,
  setSearchUsername,
  searchUser,
  recentChats,
  handleRecentMessageClick,
  receiver,
}: any) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const RecentChatsList = () => (
    <div className="space-y-2">
      {recentChats.map((chat: any) => (
        <div
          key={chat._id}
          onClick={() => {
            handleRecentMessageClick(chat);
            setIsDrawerOpen(false);
          }}
          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-150 
            ${
              receiver?._id === chat._id
                ? "bg-blue-100 border border-blue-200 shadow-sm" // Enhanced selected state
                : "hover:bg-gray-50"
            }`}
        >
          <div
            className={`
            w-10 h-10 rounded-full flex items-center justify-center font-semibold 
            ${
              receiver?._id === chat._id
                ? "bg-blue-200 text-blue-800"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {getInitials(chat.username)}
          </div>
          <div className="flex-1">
            <p
              className={`
              font-medium 
              ${receiver?._id === chat._id ? "text-blue-800" : "text-gray-800"}
            `}
            >
              {chat.username}
            </p>
            <p
              className={`text-sm 
              ${
                chat.isOnline
                  ? "text-green-500"
                  : receiver?._id === chat._id
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {chat.isOnline ? "Online" : "Offline"}
            </p>
          </div>
          {receiver?._id === chat._id && (
            <div className="w-2 h-2 bg-indigo-600 rounded-full ml-auto"></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-full md:w-[350px] bg-white border-r border-gray-200 flex flex-col">
        {/* Current User Profile */}
        <div className="h-16 border-b border-gray-200 px-6 flex items-center bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
              {getInitials(currentUser?.username || "")}
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">
                {currentUser?.username}
              </h2>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-around space-x-2">
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchUser()}
              placeholder="Search users..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
            <button
              onClick={searchUser}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
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
              {receiver && (
                <span className="ml-2 text-xs text-blue-600">
                  (Chatting with {receiver.username})
                </span>
              )}
            </h3>
            <RecentChatsList />
          </div>
        </div>
      </div>

      {/* Mobile Top Bar - Trigger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="h-16 flex items-center justify-between px-4">
          {/* Current User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
              {getInitials(currentUser?.username || "")}
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">
                {currentUser?.username}
              </h2>
            </div>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`
        md:hidden fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out
        ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}
        bg-white
      `}
      >
        {/* Mobile Drawer Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="text-center flex-1">
            <h2 className="text-lg font-semibold">Recent Chats</h2>
            {receiver && (
              <div className="flex items-center justify-center space-x-2 mt-1">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                  {getInitials(receiver.username)}
                </div>
                <p className="text-sm text-blue-600">
                  Chatting with {receiver.username}
                </p>
              </div>
            )}
          </div>
          <div className="w-10"></div> {/* Spacer for layout */}
        </div>

        {/* Search Box */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-around space-x-2">
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchUser()}
              placeholder="Search users..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
            <button
              onClick={searchUser}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Search
            </button>
          </div>
        </div>

        {/* Recent Chats List */}
        <div className="flex-1 overflow-y-auto p-4">
          <RecentChatsList />
        </div>
        <div className="p-4 w-full">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="inline-flex w-full items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
