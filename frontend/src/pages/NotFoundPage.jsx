import React from "react";
import { Link } from "react-router-dom";
import { SearchX, Ghost, ChevronLeft, MapPinOff } from "lucide-react";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-background relative overflow-hidden p-6">
      {/* Background Anomalies */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] animate-pulse pointer-events-none delay-1000" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="mx-auto w-32 h-32 bg-surface-container/30 rounded-[2.5rem] flex items-center justify-center mb-10 rotate-12 shadow-2xl glass-card border ghost-border group hover:rotate-0 transition-transform duration-500">
          <Ghost className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(163,166,255,0.4)]" />
        </div>
        
        <h1 className="text-8xl font-manrope font-extrabold text-on-surface mb-4 tracking-tighter opacity-80 select-none">404</h1>
        <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mb-8" />
        
        <h2 className="text-2xl font-manrope font-bold text-on-surface mb-4">Location Not Localized</h2>
        <p className="text-lg text-on-surface-variant max-w-md mx-auto mb-10 font-medium leading-relaxed">
          The coordinates you've entered refer to a non-existent spatial sector within the vault network. 
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/dashboard">
            <Button size="lg" className="h-14 px-8 rounded-2xl bg-primary text-surface font-bold shadow-xl shadow-primary/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95">
              <ChevronLeft className="w-5 h-5" /> Return to Center
            </Button>
          </Link>
          <Button variant="ghost" className="h-14 px-8 rounded-2xl text-on-surface-variant font-bold hover:text-on-surface flex items-center gap-2">
            <MapPinOff className="w-5 h-5" /> Log Anomaly
          </Button>
        </div>
      </motion.div>

      {/* Decorative Matrix Background Effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none font-mono text-[10px] overflow-hidden leading-none break-all p-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="mb-2">ERR_SECTOR_NOT_FOUND_CODE_{Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
};
