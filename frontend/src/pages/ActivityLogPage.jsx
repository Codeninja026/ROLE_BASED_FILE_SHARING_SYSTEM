import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Activity, Search, Filter, Download, Upload, Share2, Trash2, User, LogIn, FileUp, Loader2 } from "lucide-react";
import { fileService } from "../services/fileService";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";
import { safeFormat, timeAgo } from "../utils/dateUtils";

const ACTION_FILTERS = [
  { value: 'all', label: 'All Actions', icon: Activity },
  { value: 'upload', label: 'Uploads', icon: Upload },
  { value: 'download', label: 'Downloads', icon: Download },
  { value: 'share', label: 'Shares', icon: Share2 },
  { value: 'delete', label: 'Deletes', icon: Trash2 },
  { value: 'login', label: 'Logins', icon: LogIn },
];

const ACTION_COLORS = {
  upload: 'text-primary bg-primary/10',
  download: 'text-tertiary bg-tertiary/10',
  share: 'text-secondary bg-secondary/10',
  delete: 'text-error bg-error/10',
  permanent_delete: 'text-error bg-error/10',
  login: 'text-blue-400 bg-blue-400/10',
  register: 'text-green-400 bg-green-400/10',
  user_update: 'text-yellow-400 bg-yellow-400/10',
  folder_create: 'text-primary bg-primary/10',
  folder_delete: 'text-error bg-error/10',
};

export const ActivityLogPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const data = await fileService.getActivities(filter);
        setActivities(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load activity log");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [filter, toast]);

  return (
    <div className="p-4 md:p-8 space-y-8 font-inter pb-20">
      <div>
        <h1 className="text-3xl font-black font-manrope tracking-tighter flex items-center gap-3">
          {user?.role === 'manager' ? 'Team Activity' : 'Telemetry'} <Activity className="w-6 h-6 text-tertiary opacity-50" />
        </h1>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">
          {user?.role === 'manager' ? 'Activity for your team members' : 'System activity audit trail'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {ACTION_FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border",
              filter === f.value ? "bg-primary/10 border-primary/30 text-primary" : "bg-surface-container/50 ghost-border text-on-surface-variant hover:bg-surface-container"
            )}>
            <f.icon className="w-3.5 h-3.5" /> {f.label}
          </button>
        ))}
      </div>

      {/* Activity list */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <Activity className="w-24 h-24 mb-6" />
          <h3 className="text-xl font-black font-manrope uppercase tracking-widest">No Activity Found</h3>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="divide-y ghost-border">
            {activities.map((a, i) => (
              <motion.div key={a.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-primary/5 transition-colors">
                <div className={cn("p-2.5 rounded-xl shrink-0", ACTION_COLORS[a.action] || 'text-on-surface-variant bg-surface-container')}>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold">
                    <span className="text-on-surface">{a.userName || 'System'}</span>
                    <span className="text-on-surface-variant mx-1.5">→</span>
                    <span className={cn("font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-md",
                      ACTION_COLORS[a.action] || 'bg-surface-container text-on-surface-variant'
                    )}>{a.action}</span>
                    {a.targetName && <span className="text-primary ml-2">{a.targetName}</span>}
                  </p>
                  {a.details && <p className="text-[10px] font-bold text-on-surface-variant mt-0.5 truncate">{a.details}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold text-on-surface-variant">{timeAgo(a.timestamp)}</p>
                  <p className="text-[9px] font-bold text-on-surface-variant/50">{safeFormat(a.timestamp, 'HH:mm')}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
