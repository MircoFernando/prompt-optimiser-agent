import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";

const AIMessageBar = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Simulate AI typing effect
  const simulateResponse = (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate different responses based on input
    let response = "Hi there! I'm your AI assistant. How can I help you today?";
    
    if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
      response = "Hello! I'm your friendly AI assistant. What can I do for you?";
    } else if (userMessage.toLowerCase().includes("help")) {
      response = "I'm here to help! You can ask me questions, request information, or just chat.";
    } else if (userMessage.toLowerCase().includes("thank")) {
      response = "You're welcome! Is there anything else you'd like to know?";
    } else if (userMessage.toLowerCase().includes("who are you")) {
      response = "I'm an AI assistant designed to be helpful, harmless, and honest!";
    }
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { text: response, isUser: false }]);
    }, 1500); // Delay for typing effect
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (input.trim() === "") return;
    
    const userMessage = input;
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setInput("");
    
    simulateResponse(userMessage);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="relative flex h-screen w-full overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/30 p-4 shadow-2xl shadow-black/30 backdrop-blur-md">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Sparkles className="mb-4 h-12 w-12 text-indigo-400" />
              <h3 className="mb-2 text-xl text-indigo-200">How can I help you today?</h3>
              <p className="max-w-xs text-sm text-slate-400">
                Ask me anything and I'll do my best to assist you!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      msg.isUser
                        ? "rounded-tr-none bg-indigo-600 text-white"
                        : "rounded-tl-none border border-slate-600/50 bg-slate-700/60 text-slate-100"
                    } animate-fade-in`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-none border border-slate-600/50 bg-slate-700/60 p-3 text-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></div>
                      <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse delay-75"></div>
                      <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

      
      {/* Input form */}
      <form 
        onSubmit={handleSubmit}
        className={`bg-black/60 backdrop-blur-md rounded-xl border border-neutral-700 ${isFocused ? 'border-indigo-500/70 bg-slate-900/80' : 'border-slate-700/50 bg-slate-900/50'} transition-colors duration-200`}
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your message..."
            className="w-full min-h-12 border-none bg-transparent px-4 py-3 text-sm text-white placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{ overflow: "hidden" }}
          />
          <button
            type="submit"
            disabled={input.trim() === ""}
            className={`absolute right-1 rounded-full p-2 ${
              input.trim() === ""
                ? "text-slate-500 bg-slate-700/50 cursor-not-allowed"
                : "text-white bg-indigo-600 hover:bg-indigo-500"
            } transition-colors`}
          >
            {isTyping ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
      
      <style>
        {`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .delay-75 {
          animation-delay: 0.2s;
        }
        
        .delay-150 {
          animation-delay: 0.4s;
        }
        `}
      </style>
      </div>
    </div>
  );
};

export default AIMessageBar;
