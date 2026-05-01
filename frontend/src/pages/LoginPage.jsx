import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Shield, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export const LoginPage = () => {
  const { login, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Authentication verified. Welcome back.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-inter">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-primary/10 rounded-3xl mb-6 border border-primary/20">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black font-manrope tracking-tighter">
            Role Based File Sharing System
          </h1>
          <p className="text-sm font-bold text-on-surface-variant mt-2 uppercase tracking-[0.15em]">
            Secure Role-Based Access Portal
          </p>
        </div>

        <div className="glass-card p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="admin@rbfs.local"
                  className="w-full h-14 bg-surface-container border ghost-border rounded-2xl pl-12 pr-4 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full h-14 bg-surface-container border ghost-border rounded-2xl pl-12 pr-12 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full h-14 bg-primary text-black font-black text-sm rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign In</span> <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" /> Return to Home Landing
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-8">
          Need an account? <Link to="/register" className="font-bold text-primary hover:underline">Create user account</Link>
        </p>
      </motion.div>
    </div>
  );
};
