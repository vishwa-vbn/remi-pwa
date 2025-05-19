import React, { useState, useRef, useEffect } from "react";
import { IoPersonCircleOutline, IoChatbubblesOutline } from "react-icons/io5";
import { IoIosSend } from "react-icons/io";

const ChatView = ({ messages = [], loading = false, error = "", onSendMessage, sessionTitle }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 flex-1">
      {/* Session Title */}
      <div className="p-3 bg-white border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">{sessionTitle}</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Empty State */}
        {messages.length === 0 && !loading && !error && (
          <div className="max-w-md mx-auto text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Start a New Conversation
            </h2>
            <p className="text-sm text-gray-500">
              Type a message below to begin chatting in this session.
            </p>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 mb-4 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role !== "user" && (
              <IoChatbubblesOutline className="text-2xl text-gray-400" />
            )}

            <div
              className={`max-w-xs md:max-w-sm p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-gray-200 text-gray-900"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs text-gray-400 mt-1 block text-right">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {message.role === "user" && (
              <IoPersonCircleOutline className="text-2xl text-gray-400" />
            )}
          </div>
        ))}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center mt-4">
            <div className="h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-md mx-auto p-3 mt-4 bg-red-50 text-red-600 rounded-lg shadow-sm border border-red-200">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-200">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 max-w-3xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoIosSend className="text-lg" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;