export const WelcomeScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md w-full mx-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9 9 0 01-9-9 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          Welcome to the Chat App
        </h2>
        <p className="text-gray-600 mt-2">Select a chat to start messaging</p>
      </div>
    </div>
  );
};
