import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const ComponentLoader = ({ text = "Loading...", className }) => (
  <div className={cn("flex flex-col items-center justify-center p-8 text-on-surface-variant", className)}>
    <div className="relative w-10 h-10 mb-4">
      <motion.div
        className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 border-r-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-[2px] rounded-full border-b-2 border-secondary border-l-2 border-l-transparent opacity-50"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
    <span className="text-sm font-medium tracking-wide animate-pulse">{text}</span>
  </div>
);

export const FullScreenLoader = ({ text = "Authenticating..." }) => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
    <div className="glass-panel p-8 rounded-2xl flex flex-col items-center shadow-ambient ghost-border">
      <ComponentLoader text={text} className="p-4" />
    </div>
  </div>
);
