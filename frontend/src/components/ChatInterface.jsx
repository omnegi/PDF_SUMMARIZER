import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, MessageCircle } from 'lucide-react';
import { sendMessage } from './services/api';
import Markdown from 'react-markdown';
import ErrorBoundary from './ErrorBoundary';

const ChatInterface = ({ summary }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    console.log('ChatInterface: summary changed:', summary);
    if (summary) {
      const welcomeMessage = {
        id: Date.now(),
        text: "🎉 Perfect! I've successfully analyzed your PDF document. I'm ready to answer any questions you have about the content. What would you like to know?",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      console.log('ChatInterface: Setting welcome message:', welcomeMessage);
      setMessages([welcomeMessage]);
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(input);
      const aiMessage = {
        id: Date.now(),
        text: response && typeof response === 'string' ? response : 'I received an invalid response. Please try again.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: 'I apologize, but I encountered an error while processing your request. Please try asking your question again.',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[700px] flex flex-col rounded-2xl border border-white/20 backdrop-blur-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 shadow-2xl overflow-hidden">
      {/* Enhanced Header */}
      <div className="relative p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              AI Assistant
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </h2>
            <p className="text-blue-100 text-sm opacity-90">Ready to help with your document</p>
          </div>
        </div>
        
        {/* Chat indicator */}
        <div className="absolute top-4 right-6 flex items-center gap-2 text-white/80">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm">Online</span>
        </div>
      </div>

      {/* Messages Container */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-900/50 to-slate-800/50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-white/60">
            <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm">Ask me anything about your uploaded document</p>
          </div>
        )}
        
        {messages.map((message) => {
          console.log('ChatInterface: Rendering message:', message);
          return (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.sender === 'user' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}>
              {message.sender === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            
            {/* Message Bubble */}
            <div className={`flex flex-col max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`relative p-4 rounded-2xl shadow-lg ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-md'
                  : 'bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-tl-md'
              }`}>
                {/* Message tail */}
                <div className={`absolute top-0 w-0 h-0 ${
                  message.sender === 'user'
                    ? 'right-0 border-l-[12px] border-l-purple-500 border-t-[12px] border-t-transparent'
                    : 'left-0 border-r-[12px] border-r-white/10 border-t-[12px] border-t-transparent'
                }`}></div>
                
                <div className="max-w-none">
                  <ErrorBoundary>
                    {message.text ? (
                      <div className="text-sm leading-relaxed">
                        {typeof message.text === 'string' ? message.text : String(message.text)}
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed text-gray-300">
                        [Empty message]
                      </div>
                    )}
                  </ErrorBoundary>
                </div>
              </div>
              
              {/* Timestamp */}
              <span className="text-xs text-white/50 mt-1 px-2">
                {message.timestamp}
              </span>
            </div>
          </div>
          );
        })}
        
        {/* Loading animation */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl rounded-tl-md p-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-300"></div>
                </div>
                <span className="text-white/60 text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Input Form */}
      <div className="p-6 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-xl border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your document..."
              disabled={isLoading}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-md transition-all duration-200"
            />
            {input && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
              isLoading || !input.trim()
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
            }`}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
        
        {/* Quick suggestions */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {['Summarize key points', 'What are the main topics?', 'Any important dates?'].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInput(suggestion)}
              className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
