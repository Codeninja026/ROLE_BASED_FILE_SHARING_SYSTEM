import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, KeyRound, CheckCircle2, ShieldQuestion } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success("Recovery sequence initiated.");
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="glass-card border-0 bg-surface-container/30 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-secondary to-tertiary" />
        
        <CardHeader className="text-center pb-6 pt-10 relative">
          <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-[1.25rem] border ghost-border flex items-center justify-center mb-6 shadow-glow-secondary">
            {isSubmitted ? <CheckCircle2 className="w-8 h-8 text-secondary" /> : <ShieldQuestion className="w-8 h-8 text-secondary" />}
          </div>
          <CardTitle className="text-3xl font-manrope font-bold tracking-tight text-on-surface">Vault Recovery</CardTitle>
          <CardDescription className="text-on-surface-variant font-medium mt-2">
            {isSubmitted 
              ? "Check your neural link for instructions."
              : "Synchronize your network address to recover access."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-6 space-y-6 text-center"
              >
                <div className="p-6 bg-surface-container-highest/50 rounded-2xl border ghost-border">
                  <p className="text-on-surface-variant font-medium leading-relaxed">
                    We've dispatched an encrypted recovery token to <span className="font-bold text-on-surface text-primary">{email}</span>. Please verify its source.
                  </p>
                </div>
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  variant="ghost"
                  className="text-primary font-bold hover:bg-primary/10 rounded-xl"
                >
                  Resend Token
                </Button>
              </motion.div>
            ) : (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Network Address</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input 
                      type="email" 
                      placeholder="name@nexus.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 h-14 bg-surface-container/50 border-0 ghost-border rounded-xl font-medium focus:ring-secondary/40"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 mt-4 text-base font-bold bg-secondary text-surface rounded-xl shadow-xl shadow-secondary/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Initiate Recovery <KeyRound className="w-5 h-5" /></>}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
        
        <CardFooter className="flex justify-center pb-10 pt-2 border-t ghost-border bg-surface-container/10">
          <Link to="/login" className="flex items-center text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Login
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
