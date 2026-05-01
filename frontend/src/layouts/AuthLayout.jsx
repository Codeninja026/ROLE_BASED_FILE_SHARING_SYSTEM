import React from "react";
import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock } from "lucide-react";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[160px] pointer-events-none animate-pulse delay-700" />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
        className="mb-10 z-10 text-center"
      >
        <Link to="/" className="inline-flex flex-col items-center group">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary-dim to-secondary flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(163,166,255,0.3)] transition-all group-hover:scale-110 group-active:scale-95 group-hover:shadow-[0_0_50px_rgba(163,166,255,0.5)]">
            <Lock className="w-8 h-8 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-extrabold font-manrope tracking-tighter text-on-surface flex items-center gap-2 drop-shadow-2xl">
            vento <span className="text-primary opacity-50 font-medium text-xl">Lattice</span>
          </h1>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="w-full max-w-lg z-10 p-4"
      >
        <Outlet />
      </motion.div>

      <div className="mt-12 text-on-surface-variant font-bold text-[10px] uppercase tracking-[0.4em] z-10 flex items-center gap-3">
         <Shield className="w-3.5 h-3.5" /> Obsidian Protocol Active
      </div>
    </div>
  );
};
