import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Lock, ChevronLeft, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";

export const AccessDeniedPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
      {/* Dynamic Background Noise/Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,84,84,0.05),transparent_70%)] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative z-10"
      >
        <div className="mx-auto w-24 h-24 bg-error/10 rounded-[2rem] border ghost-border border-error/20 flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(255,84,84,0.2)] group hover:scale-110 transition-transform">
          <ShieldAlert className="w-12 h-12 text-error animate-pulse" />
        </div>
        
        <h1 className="text-5xl font-manrope font-extrabold text-on-surface mb-6 tracking-tighter">Insufficient Clearances</h1>
        
        <div className="glass-card bg-error/5 border-error/10 p-6 rounded-2xl max-w-md mx-auto mb-10">
          <p className="text-lg text-on-surface-variant font-medium leading-relaxed">
            Your cryptographic signature does not grant access to this sector of the vault. Please verify your terminal authority.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Link to="/dashboard">
            <Button size="lg" className="h-14 px-8 rounded-2xl bg-surface-container hover:bg-surface-variant text-on-surface font-bold border ghost-border flex items-center gap-2">
              <ChevronLeft className="w-5 h-5" /> Return to Command Center
            </Button>
          </Link>
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-error/20 text-error hover:bg-error/10 font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Request Clearance
          </Button>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-2 text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-[0.3em]">
           <Lock className="w-3 h-3" /> System Sec-Lock Active
        </div>
      </motion.div>
    </div>
  );
};
