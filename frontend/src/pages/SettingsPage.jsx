import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Sun, Moon, Bell, BellOff, Clock, Save, Loader2 } from "lucide-react";
import { settingsService } from "../services/settingsService";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { cn } from "../utils/cn";

export const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const [settings, setSettings] = useState({ theme: 'dark', emailNotifications: true, pushNotifications: false, sessionTimeout: 30 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await settingsService.getSettings();
        setSettings(data);
        if (data.theme) setTheme(data.theme);
      } catch (err) {
        console.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsService.updateSettings(settings);
      setTheme(settings.theme);
      toast.success("Settings saved");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8 font-inter pb-20 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black font-manrope tracking-tighter flex items-center gap-3">
          Settings <Settings className="w-6 h-6 text-primary opacity-50" />
        </h1>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">Configure your workspace</p>
      </div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          {settings.theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-yellow-400" />}
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">Appearance</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setSettings(s => ({ ...s, theme: 'dark' })); setTheme('dark'); }}
            className={cn("p-6 rounded-2xl border-2 transition-all text-center",
              settings.theme === 'dark' ? "border-primary bg-primary/10" : "border-transparent ghost-border hover:border-on-surface-variant/30"
            )}>
            <Moon className="w-8 h-8 mx-auto mb-3 text-primary" />
            <p className="text-sm font-black">Dark Mode</p>
            <p className="text-[10px] font-bold text-on-surface-variant mt-1">Professional dark theme</p>
          </button>
          <button onClick={() => { setSettings(s => ({ ...s, theme: 'light' })); setTheme('light'); }}
            className={cn("p-6 rounded-2xl border-2 transition-all text-center",
              settings.theme === 'light' ? "border-primary bg-primary/10" : "border-transparent ghost-border hover:border-on-surface-variant/30"
            )}>
            <Sun className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
            <p className="text-sm font-black">Light Mode</p>
            <p className="text-[10px] font-bold text-on-surface-variant mt-1">Clean light interface</p>
          </button>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-5 h-5 text-secondary" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">Notifications</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-container/30 rounded-xl">
            <div>
              <p className="text-sm font-bold">Email Notifications</p>
              <p className="text-[10px] font-bold text-on-surface-variant">Receive alerts via email</p>
            </div>
            <button onClick={() => setSettings(s => ({ ...s, emailNotifications: !s.emailNotifications }))}
              className={cn("w-14 h-8 rounded-full transition-all flex items-center px-1",
                settings.emailNotifications ? "bg-primary" : "bg-surface-container-high"
              )}>
              <div className={cn("w-6 h-6 bg-white rounded-full shadow transition-transform",
                settings.emailNotifications ? "translate-x-6" : "translate-x-0")} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container/30 rounded-xl">
            <div>
              <p className="text-sm font-bold">Push Notifications</p>
              <p className="text-[10px] font-bold text-on-surface-variant">Browser push notifications</p>
            </div>
            <button onClick={() => setSettings(s => ({ ...s, pushNotifications: !s.pushNotifications }))}
              className={cn("w-14 h-8 rounded-full transition-all flex items-center px-1",
                settings.pushNotifications ? "bg-primary" : "bg-surface-container-high"
              )}>
              <div className={cn("w-6 h-6 bg-white rounded-full shadow transition-transform",
                settings.pushNotifications ? "translate-x-6" : "translate-x-0")} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Session */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-5 h-5 text-tertiary" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">Session</h3>
        </div>
        <div className="flex items-center justify-between p-4 bg-surface-container/30 rounded-xl">
          <div>
            <p className="text-sm font-bold">Session Timeout</p>
            <p className="text-[10px] font-bold text-on-surface-variant">Auto-lock after inactivity</p>
          </div>
          <select value={settings.sessionTimeout}
            onChange={(e) => setSettings(s => ({ ...s, sessionTimeout: parseInt(e.target.value) }))}
            className="bg-surface-container border ghost-border rounded-xl px-4 py-2 text-sm font-bold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50">
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
          </select>
        </div>
      </motion.div>

      {/* Save button */}
      <button onClick={handleSave} disabled={isSaving}
        className="w-full h-14 bg-primary text-black font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50">
        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        Save All Settings
      </button>
    </div>
  );
};
