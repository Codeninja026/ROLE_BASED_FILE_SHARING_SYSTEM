import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HardDrive, Loader2, File, FileText, Image as ImageIcon, Video, Music, Archive, FileSpreadsheet } from "lucide-react";
import { fileService } from "../services/fileService";
import { useToast } from "../context/ToastContext";
import { cn } from "../utils/cn";

const TYPE_CONFIG = {
  documents: { icon: FileText, color: "text-red-400", bg: "bg-red-400/10" },
  images: { icon: ImageIcon, color: "text-green-400", bg: "bg-green-400/10" },
  videos: { icon: Video, color: "text-blue-400", bg: "bg-blue-400/10" },
  audio: { icon: Music, color: "text-purple-400", bg: "bg-purple-400/10" },
  spreadsheets: { icon: FileSpreadsheet, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  archives: { icon: Archive, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  other: { icon: File, color: "text-gray-400", bg: "bg-gray-400/10" },
};

export const StoragePage = () => {
  const toast = useToast();
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await fileService.getMetrics();
        setMetrics(data);
      } catch (err) {
        toast.error("Failed to load storage metrics");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const m = metrics || {};
  const usedBytes = m.usedBytes || 0;
  const pct = m.percentage || 0;
  const displayUsed = formatBytes(usedBytes);
  const displayTotal = formatBytes(m.totalBytes || (10 * 1024 * 1024 * 1024));
  const typeDist = m.typeDistribution || {};
  const total = Object.values(typeDist).reduce((a, b) => a + b, 0);

  return (
    <div className="p-4 md:p-8 space-y-8 font-inter pb-20 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black font-manrope tracking-tighter flex items-center gap-3">
          Storage Metrics <HardDrive className="w-6 h-6 text-primary opacity-50" />
        </h1>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">Capacity analysis</p>
      </div>

      {/* Main capacity meter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10 text-center">
        {/* Circular progress */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="var(--color-surface-container)" strokeWidth="8" fill="none" />
            <circle cx="50" cy="50" r="42" stroke="var(--color-primary)" strokeWidth="8" fill="none"
              strokeDasharray={`${pct * 2.64} ${264 - pct * 2.64}`} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black font-manrope text-primary">
              {pct.toFixed(2)}%
            </span>
            <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Used</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto">
          <div>
            <p className="text-3xl font-black font-manrope">{displayUsed.split(' ')[0]}</p>
            <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">{displayUsed.split(' ')[1]} Used</p>
          </div>
          <div className="hidden md:block w-px h-10 bg-outline-variant/20 self-center" />
          <div>
            <p className="text-3xl font-black font-manrope">{displayTotal.split(' ')[0]}</p>
            <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">{displayTotal.split(' ')[1]} Total</p>
          </div>
          <div className="hidden md:block w-px h-10 bg-outline-variant/20 self-center" />
          <div>
            <p className="text-3xl font-black font-manrope">{m.totalFiles || 0}</p>
            <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Files</p>
          </div>
          <div className="hidden md:block w-px h-10 bg-outline-variant/20 self-center" />
          <div>
            <p className="text-3xl font-black font-manrope">{m.folderCount || 0}</p>
            <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Folders</p>
          </div>
        </div>
      </motion.div>

      {/* Type breakdown */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6">File Type Breakdown</h3>

        {total === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-8 opacity-40">No files yet</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(typeDist).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
              const config = TYPE_CONFIG[type] || TYPE_CONFIG.other;
              const pctType = (count / total) * 100;

              return (
                <div key={type} className="flex items-center gap-4 p-3 bg-surface-container/30 rounded-xl">
                  <div className={cn("p-2.5 rounded-xl shrink-0", config.bg)}>
                    <config.icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-black uppercase tracking-wider">{type}</span>
                      <span className="text-[11px] font-bold text-on-surface-variant">{count} files ({pctType.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pctType}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn("h-full rounded-full", config.bg.replace('/10', '/60'))} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};
