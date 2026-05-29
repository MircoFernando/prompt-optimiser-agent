import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { promptServiceADK, promptServiceLangGraph, promptServiceSession, type OptimizationResponse } from "@/services/promptService";

const AIMessageBar = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<{ text: string | React.ReactNode; isUser: boolean }[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substring(2, 11)}`);
  const [promptCount, setPromptCount] = useState<number>(0);

  const ADKOptimize = async (prompt: string): Promise<OptimizationResponse> => {
    try {
      return await promptServiceADK.optimize({
        initial_prompt: prompt,
        session_id: sessionId,
        max_iterations: 3
      });
    } catch (error) {
      console.error("Error optimizing prompt with ADK:", error);
      return {
        optimized_draft: "Failed to fetch response from Google ADK.",
        latency_seconds: 0,
        framework_used: "Google ADK",
        input_tokens: 0,
        output_tokens: 0,
      };
    }
  };

  const LangGraphOptimize = async (prompt: string): Promise<OptimizationResponse> => {
    try {
      return await promptServiceLangGraph.optimize({
        initial_prompt: prompt,
        session_id: sessionId,
        max_iterations: 3
      });
    } catch (error) {
      console.error("Error optimizing prompt with LangGraph:", error);
      return {
        optimized_draft: "Failed to fetch response from LangGraph.",
        latency_seconds: 0,
        framework_used: "LangGraph",
        input_tokens: 0,
        output_tokens: 0,
      };
    }
  };

  const formatResponse = (text: string) => {
    return text.split("\n").map((line, index) => (
      <p key={index} className={line.trim() === "" ? "h-2" : "mb-2"}>
        {line}
      </p>
    ));
  };

  const handleOptimisation = async (userMessage: string) => {
    setIsTyping(true);
    try {      
      const nextPromptCount = promptCount + 1;
      setPromptCount(nextPromptCount);

      // 1. Fire BOTH backend requests over the network at the exact same instant
      const adkPromise = ADKOptimize(userMessage);
      const langGraphPromise = LangGraphOptimize(userMessage);

      // 2. Wait for both async tasks to complete in parallel
      const [adkResultText, langGraphResultText] = await Promise.all([
        adkPromise,
        langGraphPromise
      ]);
      
      // 3. Append the side-by-side benchmark results to the message board together
      setMessages((prev) => [
        ...prev, 
        { 
          text: (
            <div className="space-y-4 divider-y border-slate-700">
              <div>
                <div className="font-bold text-indigo-400 mb-1 text-xs tracking-wider">
                  GOOGLE ADK ENGINE {adkResultText.latency_seconds ? `(~${adkResultText.latency_seconds}s)` : ""}:
                </div>
                <div className="text-slate-100">{formatResponse(adkResultText.optimized_draft)}</div>
                <div className="mt-3 text-[11px] text-slate-400">
                  Input Tokens: {adkResultText.input_tokens} | Output Tokens: {adkResultText.output_tokens}
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-700/60">
                <div className="font-bold text-emerald-400 mb-1 text-xs tracking-wider">
                  LANGGRAPH ENGINE {langGraphResultText.latency_seconds ? `(~${langGraphResultText.latency_seconds}s)` : ""}:
                </div>
                <div className="text-slate-100">{formatResponse(langGraphResultText.optimized_draft)}</div>
                <div className="mt-3 text-[11px] text-slate-400">
                  Input Tokens: {langGraphResultText.input_tokens} | Output Tokens: {langGraphResultText.output_tokens}
                </div>
              </div>
            </div>
          ), 
          isUser: false 
        }
      ]);

      if (nextPromptCount === 3) {
        try {
          await promptServiceSession.clear({ session_id: sessionId });
        } catch (error) {
          console.error("Error clearing session on third prompt:", error);
        }
      }

    } catch (error) {
      console.error("Error during parallel optimization workflow:", error);
    } finally {
      setIsTyping(false);
    }
  };
  
  const simulateResponse = async (userMessage: string) => {
    const cleanMsg = userMessage.toLowerCase().trim();
    
    if (cleanMsg.includes("hello") || cleanMsg.includes("hi")) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { text: "Hi there! I'm a Prompt optimizing agent. Tell me what you want to do?", isUser: false }]);
      }, 800);
    } else if (cleanMsg.includes("help")) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { text: "I'm here to help! Send me your task and I'll optimize the prompt rules for you.", isUser: false }]);
      }, 800);
    } else if (cleanMsg.includes("thank you")) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { text: "You're very welcome! Is there anything else you'd like to refine?", isUser: false }]);
      }, 800);
    } else if (cleanMsg.includes("who are you")) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { text: "I'm a dual-engine benchmarking assistant designed to run iterative multi-agent reflection loops via Google ADK and LangGraph.", isUser: false }]);
      }, 800);
    } else {
      // Execute live dual-framework optimization loop if no conversational strings match
      await handleOptimisation(userMessage);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() === "" || isTyping) return;
    
    const userMessage = input;
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setInput("");
    
    await simulateResponse(userMessage);
  };

  // Auto-scroll anchor adjustment
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div
      className="relative flex h-screen w-full overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8 justify-between">
        {/* Main Conversation Window Container */}
        <div className="flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/30 p-4 shadow-2xl shadow-black/30 backdrop-blur-md mb-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Sparkles className="mb-4 h-12 w-12 text-indigo-400 animate-pulse" />
              <h3 className="mb-2 text-xl text-indigo-200">System Prompt Optimization Engine</h3>
              <p className="max-w-xs text-sm text-slate-400">
                Submit a system instruction concept to trigger the 4-agent benchmark evaluation loop.
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
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      msg.isUser
                        ? "rounded-tr-none bg-indigo-600 text-white"
                        : "rounded-tl-none border border-slate-600/50 bg-slate-900/80 text-slate-100"
                    } animate-fade-in`}
                  >
                    <div className="text-sm selection:bg-indigo-500">{msg.text}</div>
                  </div>
                </div>
              ))}
              
              {/* Dynamic Animated Wave Bubbles */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-none border border-slate-600/50 bg-slate-900/80 p-4 text-slate-100">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                      <span className="text-xs text-slate-400 tracking-wide">Orchestrating Agent Loops...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form Footer Layout */}
        <form 
          onSubmit={handleSubmit}
          className={`bg-black/60 backdrop-blur-md rounded-xl border ${isFocused ? 'border-indigo-500/70 bg-slate-900/80' : 'border-slate-700/50 bg-slate-900/50'} transition-all duration-200`}
        >
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isTyping ? "Engine loop running..." : "Type your message..."}
              disabled={isTyping}
              className="w-full min-h-12 border-none bg-transparent px-4 py-3 text-sm text-white placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={input.trim() === "" || isTyping}
              className={`absolute right-2 rounded-full p-2 ${
                input.trim() === "" || isTyping
                  ? "text-slate-500 bg-slate-800 cursor-not-allowed"
                  : "text-white bg-indigo-600 hover:bg-indigo-500"
              } transition-all`}
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.25s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AIMessageBar;