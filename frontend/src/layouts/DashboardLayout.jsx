import React, { useState, useCallback, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, Files, Share2, Star, Trash2, Shield, Settings, User, Users, LogOut,
  Search, Upload, Bell, Menu, X, Activity, HardDrive, Building2, Moon, Sun, ChevronLeft,
  Plus, FileUp, FolderUp, MoreVertical, ChevronDown, TrendingUp, Terminal
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { fileService } from "../services/fileService";
import { Notifications } from "../components/layout/Notifications";
import { VentoLogo } from "../components/common/VentoLogo";
import { cn } from "../utils/cn";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Home", icon: LayoutDashboard },
  { path: "/files", label: "My Files", icon: Files },
  { path: "/shared", label: "Shared", icon: Share2 },
  { path: "/starred", label: "Starred", icon: Star },
  { path: "/storage", label: "Storage", icon: HardDrive },
  { path: "/trash", label: "Trash", icon: Trash2 },
];

const MANAGER_NAV_ITEMS = [
  { path: "/team", label: "My Team", icon: Users },
  { path: "/analytics", label: "Team Analytics", icon: TrendingUp },
  { path: "/activity", label: "Team Activity", icon: Activity },
  { path: "/vault", label: "Team Vault", icon: Building2 },
];

const ADMIN_NAV_ITEMS = [
  { path: "/admin", label: "User Management", icon: Shield },
  { path: "/admin/audit", label: "System Audit", icon: Terminal },
  { path: "/analytics", label: "System Analytics", icon: TrendingUp },
  { path: "/activity", label: "Global Activity", icon: Activity },
  { path: "/vault", label: "Enterprise Vault", icon: Building2 },
];

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.trim().length > 1) {
      searchTimeoutRef.current = setTimeout(() => {
        navigate(`/files?search=${encodeURIComponent(value)}`);
      }, 400);
    }
  }, [navigate]);

  const handleUpload = async (e, isFolder = false) => {
    const files = e.target.files;
    if (!files?.length) return;
    setCreateMenuOpen(false);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // For folder upload, we pass the relative path
        const path = isFolder ? file.webkitRelativePath : null;
        await fileService.uploadFile(file, null, (pct) => {
          setUploadProgress(Math.round((i / files.length) * 100 + pct / files.length));
        }, path);
      }
      toast.success(`${files.length} item(s) uploaded successfully`);
      // Refresh relevant pages to show updated storage metrics
      const pathsToRefresh = ['/files', '/dashboard', '/storage', '/analytics'];
      if (pathsToRefresh.includes(location.pathname)) {
        navigate(0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  return (
    <div className="flex h-screen bg-background text-on-surface overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r ghost-border bg-surface-container-lowest transition-all duration-300 z-30",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        {/* Logo */}
        <div className="h-[72px] flex items-center justify-between px-6 border-b ghost-border shrink-0">
          {sidebarOpen ? (
            <VentoLogo />
          ) : (
            <VentoLogo className="w-8 h-8" textClassName="hidden" />
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all hidden lg:block">
            <ChevronLeft className={cn("w-4 h-4 transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
        </div>

        {/* Create Button (Floating +) */}
        <div className="px-4 py-6">
          <div className="relative">
            <button
              onClick={() => setCreateMenuOpen(!createMenuOpen)}
              className={cn(
                "flex items-center gap-3 bg-primary text-black font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95",
                sidebarOpen ? "px-5 py-4 w-full" : "p-4 mx-auto"
              )}
            >
              <Plus className="w-6 h-6" />
              {sidebarOpen && <span>Create</span>}
              {sidebarOpen && <ChevronDown className={cn("w-4 h-4 ml-auto transition-transform", createMenuOpen && "rotate-180")} />}
            </button>

            <AnimatePresence>
              {createMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setCreateMenuOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 top-full mt-2 w-56 bg-surface-container-high border ghost-border rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
                  >
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-surface-container transition-all text-sm font-bold text-on-surface"
                    >
                      <FileUp className="w-5 h-5 text-primary" />
                      Upload File
                    </button>
                    <button
                      onClick={() => folderInputRef.current?.click()}
                      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-surface-container transition-all text-sm font-bold text-on-surface"
                    >
                      <FolderUp className="w-5 h-5 text-primary" />
                      Upload Folder
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Hidden Inputs */}
        <input ref={fileInputRef} type="file" multiple onChange={(e) => handleUpload(e, false)} className="hidden" />
        <input ref={folderInputRef} type="file" webkitdirectory="" directory="" onChange={(e) => handleUpload(e, true)} className="hidden" />

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pb-4">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all group",
                isActive ? "bg-surface-container-high text-primary" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}>
              <item.icon className={cn("w-5 h-5 shrink-0", sidebarOpen ? "" : "mx-auto")} />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}

          {isManager && (
            <>
              <div className="h-px bg-outline-variant/10 my-4 mx-4" />
              {MANAGER_NAV_ITEMS.map((item) => (
                <NavLink key={item.path} to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all",
                    isActive ? "bg-secondary/10 text-secondary" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  )}>
                  <item.icon className={cn("w-5 h-5 shrink-0", sidebarOpen ? "" : "mx-auto")} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </>
          )}

          {isAdmin && (
            <>
              <div className="h-px bg-outline-variant/10 my-4 mx-4" />
              {ADMIN_NAV_ITEMS.map((item) => (
                <NavLink key={item.path} to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all",
                    isActive ? "bg-error/10 text-error" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  )}>
                  <item.icon className={cn("w-5 h-5 shrink-0", sidebarOpen ? "" : "mx-auto")} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User section */}
        <div className="p-3 border-t ghost-border shrink-0">
          <NavLink to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container transition-all group">
            <img src={user?.avatar} alt="" className="w-9 h-9 rounded-xl border ghost-border shrink-0" />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{user?.name}</p>
                <p className="text-[10px] font-black text-on-surface-variant uppercase">{user?.role}</p>
              </div>
            )}
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Top bar */}
        <header className="h-[72px] flex items-center justify-between px-4 md:px-8 border-b ghost-border bg-background/50 backdrop-blur-xl shrink-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface">
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative group w-full max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={handleSearch}
                className="bg-surface-container-high/50 border ghost-border rounded-2xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-4">
            {/* Upload progress */}
            {isUploading && (
              <div className="flex items-center gap-3 px-3 py-2 bg-primary/10 rounded-xl mr-2">
                <div className="w-20 h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-[10px] font-black text-primary">{uploadProgress}%</span>
              </div>
            )}

            {/* Theme toggle */}
            <button onClick={toggleTheme} className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Toggle theme">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <Notifications />

            {/* Settings */}
            <NavLink to="/settings" className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
              <Settings className="w-5 h-5" />
            </NavLink>

            {/* Logout */}
            <button onClick={logout} className="p-2.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <Outlet />
        </main>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/80 z-40 lg:hidden" />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-background z-50 lg:hidden flex flex-col border-r ghost-border">
              <div className="h-[72px] flex items-center justify-between px-6 border-b ghost-border">
                <VentoLogo />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2"><X className="w-5 h-5" /></button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                <div className="px-4 py-4 mb-2">
                   <button onClick={() => { setMobileMenuOpen(false); fileInputRef.current?.click(); }} className="flex items-center gap-3 bg-primary text-black font-bold p-4 w-full rounded-2xl shadow-xl shadow-primary/20">
                    <Plus className="w-6 h-6" />
                    <span>Create New</span>
                   </button>
                </div>
                {NAV_ITEMS.map((item) => (
                  <NavLink key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all",
                      isActive ? "bg-surface-container-high text-primary" : "text-on-surface-variant hover:bg-surface-container"
                    )}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                {isManager && (
                  <>
                    <div className="h-px bg-outline-variant/10 my-4 mx-4" />
                    {MANAGER_NAV_ITEMS.map((item) => (
                      <NavLink key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all",
                          isActive ? "bg-secondary/10 text-secondary" : "text-on-surface-variant hover:bg-surface-container"
                        )}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </>
                )}
                {isAdmin && (
                  <>
                    <div className="h-px bg-outline-variant/10 my-4 mx-4" />
                    {ADMIN_NAV_ITEMS.map((item) => (
                      <NavLink key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all",
                          isActive ? "bg-error/10 text-error" : "text-on-surface-variant hover:bg-surface-container"
                        )}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
