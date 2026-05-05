import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../services/geminiService';
import { cn } from '../lib/utils';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function ChatBox({ messages, onSendMessage, isLoading, error }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-none">AI Analyst</h3>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Online</span>
          </div>
        </div>
        <Sparkles size={16} className="text-indigo-400" />
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="bg-slate-50 p-4 rounded-3xl mb-4">
              <Bot size={40} className="text-slate-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Ready to analyze</h4>
            <p className="text-slate-500 text-sm max-w-xs">
              Upload a file and ask anything! Try "Summarize this data" or "What is the average of Column X?"
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center",
                msg.role === 'user' ? "bg-slate-100 text-slate-600" : "bg-indigo-600 text-white"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-slate-900 text-white rounded-tr-none" 
                  : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none markdown-body"
              )}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </motion.div>
          ))
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="shrink-0 w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-400 font-medium italic rounded-tl-none">
              Analyzing data...
            </div>
          </motion.div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-xs font-medium leading-relaxed">{error}</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="w-full pl-6 pr-24 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95",
                !input.trim() || isLoading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-500/10"
              )}
            >
              Analyze
              <Send size={14} />
            </button>
          </div>
        </form>
        <p className="mt-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Gemini 3 Flash • Technical Data Mode
        </p>
      </div>
    </div>
  );
}
