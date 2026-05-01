import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Shield, Edit3, Lock, Loader2, Save, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userService } from "../services/userService";
import { safeFormat } from "../utils/dateUtils";

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await userService.updateProfile(name);
      await refreshUser();
      toast.success("Profile updated");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);
    try {
      await userService.updateProfilePicture(file);
      await refreshUser();
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { 
      toast.error("New password must be at least 6 characters"); 
      return; 
    }
    setIsChangingPwd(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 font-inter pb-20 max-w-2xl">
      <div>
        <h1 className="text-3xl font-black font-manrope tracking-tighter flex items-center gap-3">
          Profile <User className="w-6 h-6 text-primary opacity-50" />
        </h1>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">Your account details</p>
      </div>

      {/* Avatar & name */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative group shrink-0">
             <img src={user?.avatar} alt="" className="w-24 h-24 rounded-3xl border-2 ghost-border shadow-xl object-cover" />
             <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
             >
                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
             </button>
             <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <input value={name} onChange={(e) => setName(e.target.value)} autoFocus
                  className="flex-1 h-12 bg-surface-container border ghost-border rounded-xl px-4 text-lg font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <button onClick={handleSave} disabled={isSaving}
                  className="h-12 px-6 bg-primary text-black font-black rounded-xl flex items-center gap-2 justify-center disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black font-manrope">{user?.name}</h2>
                <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-primary/10 text-primary">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-surface-container/30 rounded-xl">
            <Mail className="w-5 h-5 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Email</p>
              <p className="text-sm font-bold truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-surface-container/30 rounded-xl">
            <Calendar className="w-5 h-5 text-secondary" />
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Joined</p>
              <p className="text-sm font-bold">{safeFormat(user?.createdAt, 'MMMM dd, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-surface-container/30 rounded-xl">
            <Shield className="w-5 h-5 text-tertiary" />
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Provider</p>
              <p className="text-sm font-bold capitalize">{user?.provider || 'LOCAL'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Password change */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-error" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">Security</h3>
        </div>

        {showPasswordModal ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
              className="w-full h-12 bg-surface-container border ghost-border rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <input type="password" placeholder="New password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
              className="w-full h-12 bg-surface-container border ghost-border rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <div className="flex gap-3">
              <button type="submit" disabled={isChangingPwd}
                className="flex-1 h-12 bg-primary text-black font-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {isChangingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Change Password
              </button>
              <button type="button" onClick={() => setShowPasswordModal(false)}
                className="h-12 px-6 bg-surface-container font-black rounded-xl">Cancel</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setShowPasswordModal(true)}
            className="w-full h-12 bg-error/10 text-error font-black rounded-xl hover:bg-error/20 transition-all">
            Change Password
          </button>
        )}
      </motion.div>
    </div>
  );
};
