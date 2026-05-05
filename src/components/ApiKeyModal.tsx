import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
  isOpen: boolean;
}

export default function ApiKeyModal({ onSave, isOpen }: ApiKeyModalProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.length < 20) {
      setError('Please enter a valid Gemini API key.');
      return;
    }
    onSave(key);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
          >
            <div className="bg-slate-50 p-6 border-bottom border-slate-100 italic font-medium flex items-center gap-2 text-slate-600 border-b">
              <Key size={18} />
              Setup API Configuration
            </div>
            
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to DataMind</h2>
              <p className="text-slate-500 mb-6 text-sm">
                To get started, please provide your Gemini API key. This key is stored only in your browser's memory and is used to power the analysis.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={key}
                      onChange={(e) => {
                        setKey(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter your key here..."
                      className={cn(
                        "w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all pr-12 focus:ring-2 focus:ring-indigo-500/20",
                        error ? "border-red-300 bg-red-50 focus:border-red-400" : "border-slate-200 focus:border-indigo-500"
                      )}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {key.length > 20 ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <Key size={18} className="text-slate-300" />
                      )}
                    </div>
                  </div>
                  {error && (
                    <div className="mt-2 flex items-center gap-1.5 text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                >
                  Confirm & Continue
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-3">
                <p className="text-xs text-slate-400">Don't have an API key?</p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Get a free key from Google AI Studio
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
