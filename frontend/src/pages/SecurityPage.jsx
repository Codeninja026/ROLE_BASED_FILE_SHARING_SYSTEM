import React from "react";
import { ShieldCheck, Key, Smartphone, AlertTriangle, Fingerprint, Lock, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";

export const SecurityPage = () => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-error/10 rounded-2xl text-error shadow-[0_0_25px_rgba(255,84,84,0.15)] border ghost-border border-error/20">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-manrope font-bold text-on-surface tracking-tight">Security Protocol</h1>
            <p className="text-on-surface-variant font-medium mt-1">Configure your cryptographic safeguards and session authority.</p>
          </div>
        </div>
        <div className="bg-surface-container rounded-xl px-5 py-3 border ghost-border flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">High Alert Level</span>
        </div>
      </div>

      <div className="grid gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="glass-card border-0 bg-surface-container/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full" />
            <CardHeader className="p-8 pb-6 border-b ghost-border">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-3 text-2xl font-manrope">
                    <Key className="w-6 h-6 text-primary shadow-glow-primary" /> Authority Credentials
                  </CardTitle>
                  <CardDescription className="mt-1">Manage your primary password and identity validation.</CardDescription>
                </div>
                <Button className="bg-primary/10 text-primary border border-primary/20 h-11 px-6 rounded-xl hover:bg-primary transition-all hover:text-surface font-bold">
                  Update Terminal Password
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface-container-low/50 border ghost-border group hover:bg-surface-container transition-all">
                <div className="p-4 bg-primary/10 rounded-xl text-primary border ghost-border">
                  <Fingerprint className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/70 mb-1">Last Validity Change</p>
                  <p className="text-xl font-bold text-on-surface font-manrope">45 Earth Cycles Ago</p>
                  <p className="text-sm text-primary font-bold mt-1">✓ Credentials Strong as Obsidian</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card border-0 bg-surface-container/20 overflow-hidden relative">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 blur-[60px] rounded-full" />
            <CardHeader className="p-8 pb-6 border-b ghost-border">
              <CardTitle className="flex items-center gap-3 text-2xl font-manrope">
                <Smartphone className="w-6 h-6 text-secondary shadow-glow-secondary" /> Active Neural Nodes
              </CardTitle>
              <CardDescription className="mt-1">Authorized devices currently connected to your data lattice.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y ghost-border">
                <SessionItem 
                  device="Mainframe Terminal (Pro)" 
                  location="San Francisco, Alpha Sector • Chrome" 
                  isCurrent 
                />
                <SessionItem 
                  device="Handheld Hub 13" 
                  location="San Francisco, Beta Sector • Mobile Safari" 
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="bg-error/5 border border-error/10 p-8 rounded-[2rem] overflow-hidden relative">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldAlert className="w-24 h-24 text-error" />
           </div>
           <div className="relative z-10">
              <h3 className="text-xl font-bold text-error mb-2 flex items-center gap-2 font-manrope">
                <AlertTriangle className="w-6 h-6" /> Destructive Override
              </h3>
              <p className="text-on-surface-variant max-w-3xl mb-6 font-medium">
                Once an account is terminated, all encrypted files and access history are purged from the distributed ledger. This action is irreversible.
              </p>
              <Button variant="danger" className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-error/20 bg-error hover:bg-error-dim">Initiate Purge</Button>
           </div>
        </Card>
      </div>
    </div>
  );
};

const SessionItem = ({ device, location, isCurrent }) => (
  <div className="p-8 flex justify-between items-center hover:bg-surface-variant/20 transition-all group">
    <div className="flex items-center gap-6">
      <div className={`p-3 rounded-xl bg-surface-container-highest/50 border ghost-border ${isCurrent ? 'text-secondary' : 'text-on-surface-variant'}`}>
        {isCurrent ? <Lock className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-lg font-bold text-on-surface flex items-center gap-3 tracking-tight">
          {device} 
          {isCurrent && (
            <span className="bg-secondary/10 text-secondary text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-widest border border-secondary/20 shadow-[0_0_10px_rgba(163,255,241,0.1)]">
              Primary Node
            </span>
          )}
        </p>
        <p className="text-sm text-on-surface-variant font-medium mt-1">{location}</p>
      </div>
    </div>
    {!isCurrent && (
      <Button variant="outline" size="sm" className="rounded-lg px-5 h-10 border-error/30 text-error hover:bg-error hover:text-surface font-bold transition-all">Revoke Access</Button>
    )}
  </div>
);

