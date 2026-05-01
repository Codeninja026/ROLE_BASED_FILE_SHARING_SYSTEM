import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, Info, AlertCircle, FileUp, Share2, Trash2 } from "lucide-react";
import { fileService } from "../../services/fileService";
import { cn } from "../../utils/cn";
import { safeFormat } from "../../utils/dateUtils";

export const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const [data, count] = await Promise.all([
        fileService.getNotifications(),
        fileService.getUnreadCount()
      ]);
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fileService.markAllRead();
      fetchNotifications();
    } catch (err) {
      console.error("Failed to clear notifications");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'upload': return <FileUp className="w-4 h-4 text-primary" />;
      case 'share': return <Share2 className="w-4 h-4 text-secondary" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-error" />;
      default: return <Info className="w-4 h-4 text-tertiary" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all relative group"
      >
        <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-background animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="absolute right-0 mt-4 w-96 glass-card bg-surface-container-highest/95 backdrop-blur-2xl z-50 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] border ghost-border overflow-hidden rounded-2xl"
            >
              <div className="px-6 py-4 border-b ghost-border flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">System Alerts</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] font-black text-primary uppercase hover:underline">Mark all as read</button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center opacity-30">
                    <Info className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Active Telemetry</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "p-4 border-b ghost-border last:border-0 hover:bg-primary/5 transition-colors flex gap-4",
                        !n.isRead && "bg-primary/5 border-l-2 border-l-primary"
                      )}
                    >
                      <div className="mt-1 p-2 bg-surface-container rounded-lg shrink-0">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-on-surface leading-snug">{n.message}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase mt-1 opacity-50">
                          {safeFormat(n.timestamp, 'HH:mm • MMM dd')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-6 py-3 bg-surface-container/50 text-center">
                <button onClick={() => setIsOpen(false)} className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest hover:text-on-surface transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
