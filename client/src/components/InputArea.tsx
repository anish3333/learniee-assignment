export const InputArea = ({ inputMessage, setInputMessage, sendMessage, handleTyping }: any) => {
  return (
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
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
        />
        <button
          onClick={sendMessage}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};
