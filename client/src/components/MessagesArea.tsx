export const MessagesArea = ({ messages, currentUser, receiver, isTyping, chatContainerRef } : any) => {
  return (
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((msg : any, idx : number) => (

        <div
          key={msg._id || idx}
          className={`flex ${
            msg.sender === currentUser?._id ? "justify-end" : "justify-start"
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
                msg.sender === currentUser?._id ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {new Date(msg.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
      {isTyping && (
        <div className="text-gray-500 text-sm italic">{receiver.username} is typing...</div>
      )}
    </div>
  );
};
