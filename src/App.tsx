/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, LayoutDashboard, MessageSquare, LogOut, BarChart3, Info, Plus, Trash2, FileSpreadsheet } from 'lucide-react';
import ApiKeyModal from './components/ApiKeyModal';
import FileUploader from './components/FileUploader';
import ChatBox from './components/ChatBox';
import { GeminiService, ChatMessage } from './services/geminiService';
import { cn } from './lib/utils';

interface Dataset {
  id: string;
  name: string;
  data: any[];
}

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');
  const [isUploading, setIsUploading] = useState(false);

  const activeDataset = useMemo(() => 
    datasets.find(d => d.id === activeDatasetId) || null
  , [datasets, activeDatasetId]);

  const selectedDatasets = useMemo(() => 
    datasets.filter(d => selectedDatasetIds.includes(d.id))
  , [datasets, selectedDatasetIds]);

  // Load API key from local storage if exists
  useEffect(() => {
    const savedKey = localStorage.getItem('datamind_apikey');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('datamind_apikey', key);
  };

  const handleLogout = () => {
    setApiKey(null);
    localStorage.removeItem('datamind_apikey');
  };

  const handleNewChat = () => {
    setMessages([]);
    setError(null);
  };

  const gemini = useMemo(() => (apiKey ? new GeminiService(apiKey) : null), [apiKey]);

  const dataStringContext = useMemo(() => {
    if (!selectedDatasets.length) return "No data selected for analysis.";
    
    return selectedDatasets.map(ds => {
      const data = ds.data;
      if (!data.length) return `File ${ds.name} is empty.`;
      const headers = Object.keys(data[0]);
      const previewCount = Math.min(data.length, 10); // Reduced per-file sample for multi-file support
      const samples = data.slice(0, previewCount);
      
      return `
        --- Dataset: ${ds.name} ---
        Total Rows: ${data.length}
        Columns: ${headers.join(", ")}
        Sample Data (First ${previewCount} rows):
        ${JSON.stringify(samples, null, 2)}
      `.trim();
    }).join("\n\n");
  }, [selectedDatasets]);

  const handleSendMessage = async (text: string) => {
    if (!gemini) {
      setError("Please configure your API key.");
      return;
    }

    if (selectedDatasetIds.length === 0) {
      setError("Please select at least one dataset from the sidebar to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const userMsg: ChatMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await gemini.chat(text, messages, dataStringContext);
      if (response) {
        setMessages(prev => [...prev, { role: 'model', text: response }]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to communicate with AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDataset = (parsedData: any[], name: string) => {
    const newDataset: Dataset = {
      id: Math.random().toString(36).substring(7),
      name,
      data: parsedData,
    };
    setDatasets(prev => {
      const updated = [...prev, newDataset];
      // Auto-select and set active if it's the first one
      if (updated.length === 1) {
        setActiveDatasetId(newDataset.id);
        setSelectedDatasetIds([newDataset.id]);
        setActiveTab('chat');
      }
      return updated;
    });
    setIsUploading(false);
  };

  const toggleDatasetSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDatasetIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedDatasetIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedDatasetIds.length} selected datasets?`)) return;

    setDatasets(prev => prev.filter(ds => !selectedDatasetIds.includes(ds.id)));
    if (selectedDatasetIds.includes(activeDatasetId || '')) {
      setActiveDatasetId(null);
    }
    setSelectedDatasetIds([]);
  };

  const removeDataset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDatasets(prev => prev.filter(d => d.id !== id));
    setSelectedDatasetIds(prev => prev.filter(i => i !== id));
    if (activeDatasetId === id) {
      setActiveDatasetId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <ApiKeyModal isOpen={!apiKey} onSave={handleSaveKey} />

      {apiKey && (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-20 lg:w-72 bg-white border-r border-slate-200 flex flex-col transition-all duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                <Database size={22} strokeWidth={2.5} />
              </div>
              <div className="hidden lg:block">
                <h1 className="text-lg font-black tracking-tight leading-none text-slate-900">DataMind</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise AI</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 flex flex-col">
              <nav className="px-4 space-y-2 mb-8">
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-sm",
                    activeTab === 'chat' ? "bg-indigo-50 text-indigo-700 shadow-sm" : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg", activeTab === 'chat' ? "bg-indigo-600 text-white" : "bg-slate-100")}>
                    <MessageSquare size={16} />
                  </div>
                  <span className="hidden lg:block text-left flex-1">Chat Analysis</span>
                </button>
                <button 
                  onClick={() => setActiveTab('preview')}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-sm",
                    activeTab === 'preview' ? "bg-indigo-50 text-indigo-700 shadow-sm" : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg", activeTab === 'preview' ? "bg-indigo-600 text-white" : "bg-slate-100")}>
                    <LayoutDashboard size={16} />
                  </div>
                  <span className="hidden lg:block text-left flex-1">Data Explorer</span>
                </button>

                <button 
                  onClick={handleNewChat}
                  className="w-full flex lg:hidden items-center justify-center p-3 rounded-xl bg-slate-900 text-white shadow-lg"
                >
                  <Plus size={16} />
                </button>
              </nav>

              <div className="px-6 flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Datasets</span>
                  {selectedDatasetIds.length > 0 && (
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">
                      {selectedDatasetIds.length} Selected
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedDatasetIds.length > 0 && (
                    <button 
                      type="button"
                      onClick={handleBulkDelete}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-red-100"
                      title="Delete Selected"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => setIsUploading(true)}
                    className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-indigo-100"
                    title="Upload New Dataset"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="px-3 space-y-1">
                {datasets.map(ds => (
                  <div
                    key={ds.id}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left group border border-transparent",
                      activeDatasetId === ds.id ? "bg-indigo-50/50 border-indigo-100" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-2 h-full py-1">
                      <input 
                        type="checkbox"
                        checked={selectedDatasetIds.includes(ds.id)}
                        onChange={(e) => {}}
                        onClick={(e) => toggleDatasetSelection(ds.id, e as any)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveDatasetId(ds.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveDatasetId(ds.id);
                        }
                      }}
                      className="flex-1 min-w-0 cursor-pointer outline-none flex items-center gap-2"
                    >
                      <div className={cn(
                        "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
                        activeDatasetId === ds.id ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
                      )}>
                        <FileSpreadsheet size={14} />
                      </div>
                      <div className="hidden lg:block truncate">
                        <p className={cn(
                          "text-xs font-bold truncate",
                          activeDatasetId === ds.id ? "text-indigo-700" : "text-slate-600"
                        )}>
                          {ds.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium">
                          {ds.data.length} rows
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => removeDataset(ds.id, e)}
                      className="hidden lg:flex shrink-0 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 outline-none"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {datasets.length === 0 && !isUploading && (
                  <div className="px-6 py-4 text-center">
                    <p className="text-[11px] text-slate-400 font-medium italic">No datasets yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 space-y-2">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all font-semibold text-sm group"
              >
                <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-red-100 transition-colors">
                  <LogOut size={16} />
                </div>
                <span className="hidden lg:block">Switch Account</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Model</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black text-indigo-700 uppercase tracking-[0.1em]">
                  <div className="w-1 h-1 bg-indigo-600 rounded-full animate-pulse" />
                  Gemini 3 Flash
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleNewChat}
                  className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]"
                >
                  <Plus size={14} />
                  New Chat
                </button>
                <div className="h-8 w-px bg-slate-200" />
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</span>
                  <span className="text-xs font-bold text-emerald-600">{activeDataset ? 'System Ready' : 'Awaiting Data'}</span>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 max-w-6xl mx-auto w-full">
              <AnimatePresence mode="wait">
                {isUploading || datasets.length === 0 ? (
                  <motion.section
                    key="uploader"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                          <Plus size={24} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-none mb-2">New Analysis</h2>
                          <p className="text-sm text-slate-500 font-medium italic">Upload a CSV or Excel file to begin.</p>
                        </div>
                      </div>
                      {datasets.length > 0 && (
                        <button 
                          onClick={() => setIsUploading(false)}
                          className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <FileUploader onDataParsed={handleAddDataset} />
                  </motion.section>
                ) : (
                  <div className="h-full flex flex-col space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                          {activeTab === 'chat' ? <MessageSquare size={20} /> : <LayoutDashboard size={20} />}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">{activeDataset?.name}</h2>
                          <p className="text-xs text-slate-500 font-medium">{activeDataset?.data.length} records detected</p>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {activeTab === 'chat' ? (
                        <motion.section
                          key="chat"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="h-[600px]"
                        >
                          <ChatBox 
                            messages={messages} 
                            onSendMessage={handleSendMessage} 
                            isLoading={isLoading} 
                            error={error} 
                          />
                        </motion.section>
                      ) : (
                        <motion.section
                          key="preview"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                        >
                          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              <LayoutDashboard size={16} className="text-indigo-600" />
                              Dataset Records
                            </h3>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                              Previewing {Math.min(activeDataset?.data.length || 0, 100)} items
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            {activeDataset && activeDataset.data.length > 0 ? (
                              <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 border-b border-slate-100">
                                  <tr>
                                    {Object.keys(activeDataset.data[0]).map((header) => (
                                      <th key={header} className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider whitespace-nowrap">
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {activeDataset.data.slice(0, 100).map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                      {Object.values(row).map((val: any, j) => (
                                        <td key={j} className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                                          {String(val)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="p-20 text-center flex flex-col items-center text-slate-400 italic">
                                <Info size={32} className="mb-4 opacity-20" />
                                No data records to display.
                              </div>
                            )}
                          </div>
                        </motion.section>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

