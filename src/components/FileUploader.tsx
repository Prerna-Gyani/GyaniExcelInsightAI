import React, { useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, FileSpreadsheet, FileText, CheckCircle2, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { cn } from '../lib/utils';

interface FileUploaderProps {
  onDataParsed: (data: any[], fileName: string) => void;
}

export default function FileUploader({ onDataParsed }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const parseFile = useCallback((file: File) => {
    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          onDataParsed(results.data, file.name);
          // Don't set currentFile here if we're doing bulk, 
          // or just show the last one. 
          // For simplicity in UX, we'll clear it after a short delay or just show "Completed"
          setCurrentFile(file.name);
        },
        error: (err) => console.error(err)
      });
    } else if (['xlsx', 'xls'].includes(extension || '')) {
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        onDataParsed(jsonData, file.name);
        setCurrentFile(file.name);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [onDataParsed]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => parseFile(file));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    files.forEach(file => parseFile(file));
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center text-center group bg-slate-50/50",
          isDragging ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
        )}
      >
        <input
          type="file"
          multiple
          accept=".csv, .xlsx, .xls"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="mb-6 relative">
          <motion.div
            animate={isDragging ? { y: -10 } : { y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 relative z-10"
          >
            {currentFile ? (
              <CheckCircle2 size={32} className="text-emerald-500" />
            ) : (
              <Upload className={cn("transition-colors duration-300", isDragging ? "text-indigo-600" : "text-slate-400")} size={32} />
            )}
          </motion.div>
          <div className="absolute -inset-4 bg-indigo-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {currentFile ? `Added ${currentFile}` : 'Drop your data here'}
        </h3>
        <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-8">
          {currentFile ? 'Upload more files or check the sidebar to start analyzing.' : 'Select one or more Excel or CSV files to start analyzing with DataMind AI.'}
        </p>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-full text-[11px] font-bold text-slate-500 shadow-sm">
            <FileSpreadsheet size={14} className="text-emerald-500" />
            XLSX / XLS
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-full text-[11px] font-bold text-slate-500 shadow-sm">
            <FileText size={14} className="text-blue-500" />
            CSV
          </div>
        </div>
      </div>
    </div>
  );
}
