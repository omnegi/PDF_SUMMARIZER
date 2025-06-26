import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { sendMessage } from './services/api';

const ChatInterface = ({ summary }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (summary) {
      setMessages([
        {
          id: Date.now(),
          text: "I've analyzed the PDF. Feel free to ask me any questions about it!",
          sender: 'ai',
        },
      ]);
    }
  }, [summary]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(input);
      const aiMessage = {
        id: Date.now(),
        text: response,
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'ai',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[600px] flex flex-col rounded-xl border border-white/10 backdrop-blur-md bg-white/5 shadow-lg overflow-hidden">
      <div className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white">
        <h2 className="text-xl font-semibold  bg-indigo-600 hover:bg-indigo-700 bg-clip-text text-white">
          Hello User!!
        </h2>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[60%] p-4 rounded-xl text-sm whitespace-pre-line ${
              message.sender === 'user'
                ? 'ml-auto bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'mr-auto bg-white/5 backdrop-blur-md text-black'
            }`}
          >
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto bg-white/5 backdrop-blur-md text-white max-w-[60%] p-4 rounded-xl flex gap-1">
            <div className="animate-bounce">.</div>
            <div className="animate-bounce delay-200">.</div>
            <div className="animate-bounce delay-400">.</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
        <div className="flex gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-1">
          <div className="flex gap-2 bg-slate-800 rounded-lg flex-1 px-2 py-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full bg-transparent outline-none text-white placeholder-gray-400 py-2 px-2"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-2 rounded-lg hover:opacity-90 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
