import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, HardDrive, PieChart as PieChartIcon, FileText, ImageIcon, Video, File, Activity, AlertCircle, ShieldCheck
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { useStorage } from "../../hooks/useStorage";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export const StorageDetailsModal = ({ isOpen, onClose }) => {
  const { metrics } = useStorage();

  const data = [
    { name: 'Documents', value: metrics.typeDistribution?.documents || 0, color: '#a3a6ff' },
    { name: 'Images', value: metrics.typeDistribution?.images || 0, color: '#9bffce' },
    { name: 'Videos', value: metrics.typeDistribution?.videos || 0, color: '#ff6e84' },
    { name: 'Other', value: metrics.typeDistribution?.other || 0, color: '#ac8aff' }
  ].filter(d => d.value > 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Core Storage Analytics">
      <div className="space-y-8 p-2">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 glass-card bg-primary/5 border-primary/20 rounded-3xl text-center">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Used Space</p>
            <p className="text-2xl font-black text-on-surface">{(metrics.usedBytes / (1024*1024*1024)).toFixed(2)} <span className="text-xs opacity-50">GB</span></p>
          </div>
          <div className="p-6 glass-card bg-secondary/5 border-secondary/20 rounded-3xl text-center">
            <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Available</p>
            <p className="text-2xl font-black text-on-surface">{((metrics.totalBytes - metrics.usedBytes) / (1024*1024*1024)).toFixed(2)} <span className="text-xs opacity-50">GB</span></p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="h-[250px] relative">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />)}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1a1d24', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                   itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center opacity-30">
               <PieChartIcon className="w-16 h-16" />
            </div>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <p className="text-2xl font-black text-on-surface">{metrics.percentage.toFixed(0)}%</p>
             <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-tighter">Capacity</p>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3">
          {data.map(d => (
            <div key={d.name} className="flex items-center justify-between p-3 bg-surface-container rounded-xl border ghost-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] font-bold text-on-surface-variant uppercase">{d.name}</span>
              </div>
              <span className="text-xs font-black text-on-surface">{d.value}</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-surface-container-low/50 rounded-2xl border ghost-border flex items-start gap-4">
           <ShieldCheck className="w-5 h-5 text-primary mt-1" />
           <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed">
             This sector is synchronized with the global Obsidian Cluster. Storage analytics are updated in real-time as objects are ingested or purged.
           </p>
        </div>
      </div>
    </Modal>
  );
};
