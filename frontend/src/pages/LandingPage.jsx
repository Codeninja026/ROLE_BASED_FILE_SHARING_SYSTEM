import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, Lock, Share2, Files, Users, Zap, ArrowRight, ChevronRight, 
  Globe, Star, HardDrive, Activity, CheckCircle2, Cloud, Zap as Bolt,
  Play, Pause, Volume2, VolumeX
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { VentoLogo } from "../components/common/VentoLogo";
import { cn } from "../utils/cn";

const FEATURES = [
  { icon: Shield, title: "Military-Grade Security", desc: "End-to-end encryption with BCrypt password hashing and JWT authentication." },
  { icon: Lock, title: "Role-Based Access", desc: "Granular permissions with VIEW, EDIT, and MANAGE access levels per file." },
  { icon: Share2, title: "Secure Sharing", desc: "Share files with specific users and control their access level in real-time." },
  { icon: HardDrive, title: "Smart Storage", desc: "Structured file storage with user/folder hierarchy and UUID naming." },
  { icon: Activity, title: "Full Audit Trail", desc: "Every action is logged — uploads, shares, deletes, and logins." },
  { icon: Globe, title: "Enterprise Ready", desc: "PostgreSQL backend, production-grade architecture, and Docker support." },
];

const PRICING = [
  { name: "Starter", price: "$0", features: ["10GB Storage", "Basic Sharing", "Email Support", "Max 50MB per file"], cta: "Start Free", popular: false },
  { name: "Professional", price: "$12", features: ["500GB Storage", "Advanced RBAC", "Priority Support", "Max 2GB per file", "Custom Branding"], cta: "Go Pro", popular: true },
  { name: "Enterprise", price: "Custom", features: ["Unlimited Storage", "Single Sign-On (SSO)", "Audit Logs Export", "24/7 Dedicated Support"], cta: "Contact Sales", popular: false },
];

/* ───────────────────────────────────────────── */

export const LandingPage = () => {
  const { user } = useAuth();

  const scrollToContent = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-inter text-on-surface relative overflow-x-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[600px] bg-primary/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/3 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-tertiary/3 rounded-full blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-xl border-b ghost-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-4">
          <div className="flex items-center gap-8">
            <VentoLogo className="h-8 w-auto" />
            <div className="hidden md:flex items-center gap-6">
              {['features', 'pricing', 'about'].map(item => (
                <button 
                  key={item}
                  onClick={() => scrollToContent(item)}
                  className="text-sm font-bold text-on-surface-variant hover:text-primary capitalize transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard"
                className="bg-primary text-black font-black text-xs rounded-xl px-6 py-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors">
                  Sign In
                </Link>
                <Link to="/register"
                  className="bg-primary text-black font-black text-xs rounded-xl px-6 py-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Try Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-12 pt-40 pb-24 md:pt-56 md:pb-40 max-w-7xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl md:text-8xl lg:text-[120px] font-black font-manrope tracking-tighter leading-[0.85] mb-8">
            Store Securely.
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              Share by Role.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            Role Based File Sharing System is a secure web application for uploading, sharing, and managing files with controlled access based on user roles.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"
              className="bg-primary text-black font-black text-base rounded-2xl px-12 py-4 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-3">
              Open Project <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => scrollToContent('demo')}
              className="font-black text-base rounded-2xl px-12 py-4 border ghost-border hover:bg-surface-container transition-all flex items-center gap-3 text-on-surface-variant hover:text-on-surface">
              View Features <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black font-manrope tracking-tighter mb-4">
            Key <span className="text-primary">Features</span>
          </h2>
          <p className="text-on-surface-variant font-medium max-w-xl mx-auto">
            The system focuses on security, controlled access, easy file management, and visibility of user actions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-8 group hover:scale-[1.02] transition-transform"
            >
              <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-5 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-black font-manrope mb-2">{f.title}</h3>
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black font-manrope tracking-tighter mb-4">
            Project <span className="text-primary">Modules</span>
          </h2>
          <p className="text-on-surface-variant font-medium">This section can be used to explain the main modules implemented in the system.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING.map((p, i) => (
            <motion.div 
              key={p.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "glass-card p-8 flex flex-col relative overflow-hidden",
                p.popular ? "border-primary/40 ring-1 ring-primary/20 scale-105 z-10" : "scale-100"
              )}
            >
              {p.popular && (
                <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-black px-4 py-1.5 uppercase tracking-tighter">Most Popular</div>
              )}
              <h3 className="text-xl font-black mb-1">{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">{p.price}</span>
                <span className="text-sm text-on-surface-variant">/mo</span>
              </div>
              <div className="space-y-4 mb-10 flex-1">
                {p.features.map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <button 
                disabled
                className={cn(
                "w-full py-4 rounded-xl font-black transition-all cursor-not-allowed opacity-70",
                p.popular ? "bg-primary text-black shadow-lg shadow-primary/20" : "bg-surface-container-high text-on-surface"
              )}>
                Coming Soon
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative z-10 px-6 md:px-12 py-20 max-w-4xl mx-auto">
        <div className="glass-card p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-3xl font-black font-manrope tracking-tighter mb-8 italic">"Secure file sharing should be simple, controlled, and accountable."</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <p className="text-on-surface-variant font-medium leading-relaxed">
              This project addresses the problem of unauthorized file access by introducing role-based control, secure authentication, and a clear file management workflow.
            </p>
            <p className="text-on-surface-variant font-medium leading-relaxed">
              Built with Spring Boot, React, and PostgreSQL, it demonstrates a practical full-stack implementation suitable for academic presentation and real-world extension.
            </p>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="relative z-10 px-6 md:px-12 py-32 max-w-6xl mx-auto text-center">
         <div className="bg-primary text-black rounded-[3rem] p-12 md:p-24 shadow-2xl shadow-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
            
            <h2 className="text-4xl md:text-6xl font-black font-manrope tracking-tighter mb-8 relative z-10">Ready to explore the project?</h2>
            <Link to="/register"
              className="inline-flex items-center gap-3 bg-black text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-transform relative z-10">
              Open Demo <ArrowRight className="w-5 h-5" />
            </Link>
         </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-12 pt-24 pb-12 border-t ghost-border bg-surface-container/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <VentoLogo className="h-8 w-auto mb-6" />
            <p className="text-on-surface-variant font-medium max-w-sm mb-6">
              A secure role-based file sharing web application for managing files, permissions, and user activity.
            </p>
            <div className="flex gap-4">
              <Bolt className="w-5 h-5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" />
              <Cloud className="w-5 h-5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" />
              <Globe className="w-5 h-5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>
          <div>
            <h4 className="font-black mb-6 uppercase tracking-widest text-[10px]">Project</h4>
            <ul className="space-y-4 text-sm font-bold text-on-surface-variant">
               <li><button onClick={() => scrollToContent('features')} className="hover:text-primary transition-colors">Features</button></li>
               <li><button onClick={() => scrollToContent('demo')} className="hover:text-primary transition-colors">Live Demo</button></li>
               <li><button onClick={() => scrollToContent('pricing')} className="hover:text-primary transition-colors">Modules</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-6 uppercase tracking-widest text-[10px]">Project</h4>
            <ul className="space-y-4 text-sm font-bold text-on-surface-variant">
               <li><button onClick={() => scrollToContent('about')} className="hover:text-primary transition-colors">About Project</button></li>
               <li><a href="#" className="hover:text-primary transition-colors">Security Features</a></li>
               <li><a href="#" className="hover:text-primary transition-colors">Architecture</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-8 border-t ghost-border">
          <p className="text-xs font-black text-on-surface-variant/50 uppercase tracking-widest">
            © 2026 vento Enterprise. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">
             <span>v1.0.4-dev</span>
             <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-success" /> Server Up</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
