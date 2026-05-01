import React from "react";
import { Activity, Clock, FileText, Share2, Trash2, Edit3, Shield } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { motion } from "framer-motion";

export const ActivityPage = () => {
  const activities = [
    { id: 1, action: "Uploaded", item: "Q3_Financial_Report.pdf", time: "2 minutes ago", type: "create", icon: FileText, color: "text-primary" },
    { id: 2, action: "Modified permissions for", item: "Project_Pitch.key", time: "1 hour ago", type: "update", icon: Edit3, color: "text-secondary" },
    { id: 3, action: "Shared", item: "Logo_Assets.zip", time: "Yesterday", type: "share", icon: Share2, color: "text-tertiary" },
    { id: 4, action: "Deleted", item: "Old_Notes.txt", time: "Feb 12", type: "delete", icon: Trash2, color: "text-error" },
    { id: 5, action: "Accessed Admin Terminal", item: "System Configuration", time: "Feb 10", type: "admin", icon: Shield, color: "text-primary" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-glow-primary border ghost-border">
            <Activity className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-manrope font-bold text-on-surface tracking-tight">Audit Protocol</h1>
            <p className="text-on-surface-variant font-medium mt-1">Real-time telemetric activity tracking for your vault.</p>
          </div>
        </div>
        <div className="bg-surface-container rounded-xl px-5 py-3 border ghost-border flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Live Feed Operational</span>
        </div>
      </div>

      <div className="grid gap-4">
        {activities.map((act, idx) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="glass-card p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-surface-variant/30 transition-all cursor-default border ghost-border group">
               <div className={`p-3 rounded-xl bg-surface-container-highest/50 border ghost-border ${act.color} group-hover:scale-110 transition-transform`}>
                <act.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <p className="text-on-surface text-lg font-semibold tracking-tight">
                    {act.action} <span className="text-primary font-bold">{act.item}</span>
                  </p>
                  <p className="text-sm text-on-surface-variant flex items-center bg-surface-container px-3 py-1 rounded-full font-medium">
                    <Clock className="w-3.5 h-3.5 mr-2" /> {act.time}
                  </p>
                </div>
                <p className="text-sm text-on-surface-variant mt-1.5 font-medium">System event ID: <span className="font-mono text-xs">EVT-{act.id}XF-{Math.floor(Math.random()*1000)}</span></p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
