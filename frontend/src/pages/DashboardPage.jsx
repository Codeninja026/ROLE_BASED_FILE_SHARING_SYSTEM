import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  Files, Users, HardDrive, Star, Share2, Trash2, Activity, Upload, Bell,
  TrendingUp, ArrowUpRight, Folder, Clock
} from "lucide-react";
import { fileService } from "../services/fileService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { cn } from "../utils/cn";
import { safeFormat } from "../utils/dateUtils";

export const DashboardPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await fileService.getMetrics();
        setDashboard(data);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 glass-card animate-pulse rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <div key={i} className="h-72 glass-card animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const d = dashboard || {};
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const stats = [
    { label: "Files", value: d.totalFiles || 0, icon: Files, color: "text-primary", bg: "bg-primary/10" },
    { label: "Folders", value: d.folderCount || 0, icon: Folder, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Shared", value: d.sharedCount || 0, icon: Share2, color: "text-tertiary", bg: "bg-tertiary/10" },
    { label: "Starred", value: d.starredCount || 0, icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: isAdmin ? "Total Users" : "Notifications", value: isAdmin ? d.totalUsers || 0 : d.notificationCount || 0,
      icon: isAdmin ? Users : Bell, color: "text-error", bg: "bg-error/10" },
  ];

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usedBytes = d.usedBytes || 0;
  const pct = d.percentage || 0;
  const displayUsed = formatBytes(usedBytes);
  const displayTotal = formatBytes(d.totalBytes || (10 * 1024 * 1024 * 1024));

  return (
    <div className="p-4 md:p-8 space-y-8 pb-20 font-inter">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black font-manrope tracking-tighter">
            Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-sm font-bold text-on-surface-variant mt-1 uppercase tracking-[0.1em]">
            {isAdmin ? "System Administrator Dashboard" : isManager ? "Manager Oversight Workspace" : "Personal Workspace"}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6 group hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl", s.bg)}>
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-black font-manrope">{s.value}</p>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Storage + Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <HardDrive className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Storage Capacity</h3>
          </div>

          <div className="flex items-end gap-2 mb-6">
            <span className="text-5xl font-black font-manrope text-primary">{displayUsed.split(' ')[0]}</span>
            <span className="text-lg font-bold text-on-surface-variant mb-1">{displayUsed.split(' ')[1]} used of {displayTotal}</span>
          </div>

          <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden border ghost-border mb-4">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            />
          </div>

          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
            {pct.toFixed(2)}% utilized • {pct > 99.99 ? 0 : (100 - pct).toFixed(2)}% remaining
          </p>
        </motion.div>

        {/* Type distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">File Distribution</h3>
          </div>

          <div className="space-y-4">
            {d.typeDistribution && Object.entries(d.typeDistribution).length > 0 ? (
              Object.entries(d.typeDistribution).map(([type, count]) => {
                const total = Object.values(d.typeDistribution).reduce((a, b) => a + b, 0);
                const pctType = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={type} className="flex items-center gap-4">
                    <span className="text-[11px] font-black text-on-surface-variant uppercase w-24 truncate">{type}</span>
                    <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pctType}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-on-surface-variant w-8 text-right">{count}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-on-surface-variant text-center py-8 opacity-40">No files uploaded yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent activity + files */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-tertiary" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Recent Activity</h3>
          </div>

          <div className="space-y-3">
            {d.recentActivity?.length > 0 ? d.recentActivity.slice(0, 8).map((a, i) => (
              <div key={a.id || i} className="flex items-center gap-3 p-3 bg-surface-container/30 rounded-xl">
                <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold truncate">
                    <span className="text-on-surface">{a.userName}</span>
                    <span className="text-on-surface-variant"> — {a.action}</span>
                    <span className="text-primary"> {a.targetName}</span>
                  </p>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant shrink-0">
                  {safeFormat(a.timestamp, 'HH:mm')}
                </span>
              </div>
            )) : (
              <p className="text-sm text-on-surface-variant text-center py-8 opacity-40">No recent activity</p>
            )}
          </div>
        </motion.div>

        {/* Recent Files */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Recent Files</h3>
          </div>

          <div className="space-y-3">
            {d.recentFiles?.length > 0 ? d.recentFiles.slice(0, 8).map((f, i) => (
              <div key={f.id || i} className="flex items-center gap-3 p-3 bg-surface-container/30 rounded-xl group hover:bg-surface-container/50 transition-colors">
                <Files className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold truncate">{f.name}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant">
                    {((f.fileSize || 0) / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant shrink-0">
                  {safeFormat(f.createdAt, 'MMM dd')}
                </span>
              </div>
            )) : (
              <p className="text-sm text-on-surface-variant text-center py-8 opacity-40">No files yet. Upload your first file!</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
