import React, { useState, useEffect, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Users, UserPlus, Edit3, Trash2, ToggleLeft, ToggleRight, Search, Loader2, X, Mail, Lock, User } from "lucide-react";
import { userService } from "../services/userService";
import { fileService } from "../services/fileService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Modal } from "../components/ui/Modal";
import { cn } from "../utils/cn";
import { safeFormat } from "../utils/dateUtils";

export const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const roles = [
    { value: 'user', label: 'User' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
  ];

  const fetchUsers = useCallback(async () => {
    try {
      const [userData, fileData] = await Promise.all([
        userService.getUsers(),
        fileService.getAllFiles(),
      ]);
      setUsers(userData);
      setRecentFiles(Array.isArray(fileData) ? fileData.slice(0, 8) : []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async (u) => {
    try {
      await userService.updateUser(u.id, { active: !u.active });
      toast.success(u.active ? "User deactivated" : "User activated");
      fetchUsers();
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleChangeRole = async (u) => {
    const roleOrder = ['user', 'manager', 'admin'];
    const currentIndex = roleOrder.indexOf(u.role);
    const newRole = roleOrder[(currentIndex + 1) % roleOrder.length];
    try {
      await userService.updateUser(u.id, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      fetchUsers();
    } catch {
      toast.error("Failed to change role");
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try {
      await userService.deleteUser(u.id);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Register via auth endpoint
      const { authService } = await import('../services/authService');
      await authService.register(addForm.name, addForm.email, addForm.password, addForm.role);
      toast.success("User created successfully");
      setShowAddUser(false);
      setAddForm({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase()) ||
    u.teamName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 font-inter pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-manrope tracking-tighter flex items-center gap-3">
            Admin Console <Shield className="w-6 h-6 text-error opacity-50" />
          </h1>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">{users.length} registered users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-container/50 border ghost-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary/50 w-64" />
          </div>
          <button onClick={() => setShowAddUser(true)}
            className="bg-primary text-black font-black rounded-xl px-6 h-11 shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <UserPlus className="w-5 h-5" /> Add User
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Users", value: users.length, color: "text-primary", bg: "bg-primary/10", icon: Users },
          { label: "Admins", value: users.filter(u => u.role === 'admin').length, color: "text-error", bg: "bg-error/10", icon: Shield },
          { label: "Managers", value: users.filter(u => u.role === 'manager').length, color: "text-secondary", bg: "bg-secondary/10", icon: Edit3 },
          { label: "Team Users", value: users.filter(u => u.teamId).length, color: "text-primary", bg: "bg-primary/10", icon: Users },
          { label: "Active", value: users.filter(u => u.active).length, color: "text-tertiary", bg: "bg-tertiary/10", icon: ToggleRight },
          { label: "Inactive", value: users.filter(u => !u.active).length, color: "text-on-surface-variant", bg: "bg-surface-container", icon: ToggleLeft },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg", s.bg)}><s.icon className={cn("w-4 h-4", s.color)} /></div>
            </div>
            <p className="text-2xl font-black font-manrope">{s.value}</p>
            <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Users table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-black font-manrope tracking-tight">Latest Uploaded Files</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mt-1 mb-4">
              Includes admin, manager, and team user uploads
            </p>
            {recentFiles.length === 0 ? (
              <p className="text-sm text-on-surface-variant opacity-60">No uploaded files found.</p>
            ) : (
              <div className="space-y-2">
                {recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-surface-container/30">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{file.name}</p>
                      <p className="text-[10px] font-bold text-on-surface-variant">
                        {file.ownerName} • {file.folderName || "Root"} • {safeFormat(file.createdAt, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary shrink-0">
                      {file.mimeType || "file"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b ghost-border text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 bg-surface-container-low/30">
                  <th className="py-5 px-6">User</th>
                  <th className="py-5 px-6 hidden md:table-cell">Email</th>
                  <th className="py-5 px-6 hidden lg:table-cell">Role</th>
                  <th className="py-5 px-6 hidden xl:table-cell">Team</th>
                  <th className="py-5 px-6 hidden lg:table-cell">Status</th>
                  <th className="py-5 px-6 hidden 2xl:table-cell">Joined</th>
                  <th className="py-5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="group border-b ghost-border last:border-0 hover:bg-primary/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar || u.avatarUrl} alt="" className="w-9 h-9 rounded-xl border ghost-border" />
                        <span className="text-sm font-bold">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-on-surface-variant hidden md:table-cell">{u.email}</td>
                    <td className="py-4 px-6 hidden lg:table-cell">
                      <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                        u.role === 'admin'
                          ? "bg-error/10 text-error"
                          : u.role === 'manager'
                            ? "bg-secondary/10 text-secondary"
                            : "bg-primary/10 text-primary"
                      )}>{u.role}</span>
                    </td>
                    <td className="py-4 px-6 hidden xl:table-cell text-xs font-bold text-on-surface-variant">
                      {u.teamName || "Unassigned"}
                    </td>
                    <td className="py-4 px-6 hidden lg:table-cell">
                      <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                        u.active ? "bg-tertiary/10 text-tertiary" : "bg-surface-container text-on-surface-variant"
                      )}>{u.active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-on-surface-variant hidden 2xl:table-cell">{safeFormat(u.createdAt, 'MMM dd, yyyy')}</td>
                    <td className="py-4 px-6 text-right">
                      {u.id !== currentUser?.id && (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleChangeRole(u)} title="Toggle role"
                            className="p-2 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary">
                            <Shield className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleToggleActive(u)} title="Toggle active"
                            className="p-2 hover:bg-tertiary/10 rounded-lg text-on-surface-variant hover:text-tertiary">
                            {u.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleDelete(u)} title="Delete user"
                            className="p-2 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal isOpen={showAddUser} onClose={() => setShowAddUser(false)} title="Create New User">
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input type="text" value={addForm.name} onChange={(e) => setAddForm(p => ({ ...p, name: e.target.value }))} required
                className="w-full h-12 bg-surface-container border ghost-border rounded-xl pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input type="email" value={addForm.email} onChange={(e) => setAddForm(p => ({ ...p, email: e.target.value }))} required
                className="w-full h-12 bg-surface-container border ghost-border rounded-xl pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input type="password" value={addForm.password} onChange={(e) => setAddForm(p => ({ ...p, password: e.target.value }))} required
                className="w-full h-12 bg-surface-container border ghost-border rounded-xl pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setAddForm(p => ({ ...p, role: role.value }))}
                  className={cn(
                    "h-11 rounded-xl font-black text-sm border transition-all",
                    addForm.role === role.value
                      ? role.value === 'admin'
                        ? "bg-error/10 border-error/40 text-error"
                        : role.value === 'manager'
                          ? "bg-secondary/10 border-secondary/40 text-secondary"
                          : "bg-primary/10 border-primary/40 text-primary"
                      : "bg-surface-container ghost-border text-on-surface-variant"
                  )}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={isSubmitting}
            className="w-full h-12 bg-primary text-black font-black rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            Create User
          </button>
        </form>
      </Modal>
    </div>
  );
};
