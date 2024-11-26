import { getInitials } from "../lib/utils";
import { User } from "../pages/ChatPage";

export const ChatHeader = ({ receiver } : { receiver: User }) => {

  return (
    <div className="h-16 border-b border-gray-200 px-6 flex items-center bg-white">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
          {getInitials(receiver.username)}
        </div>
        <div>
          <h2 className="font-semibold text-gray-800">{receiver.username}</h2>
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
  );
};
