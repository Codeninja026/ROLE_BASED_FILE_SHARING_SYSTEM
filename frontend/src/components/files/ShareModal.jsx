import React, { useState, useEffect, useCallback, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Shield, Eye, Edit3, Trash2, Loader2 } from 'lucide-react';
import { fileService } from '../../services/fileService';
import { teamService } from '../../services/teamService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const ACCESS_LEVELS = [
  { value: 'VIEW', label: 'View', icon: Eye, desc: 'Can view and download' },
  { value: 'EDIT', label: 'Edit', icon: Edit3, desc: 'Can view, download, and rename' },
  { value: 'MANAGE', label: 'Manage', icon: Shield, desc: 'Full access including sharing' },
];

export const ShareModal = ({ isOpen, onClose, file }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [teamSearch, setTeamSearch] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [accessLevel, setAccessLevel] = useState('VIEW');
  const [shareMode, setShareMode] = useState('team');
  const [permissions, setPermissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const canUseTeamSharing = user?.role === 'manager' || user?.role === 'admin' || !!user?.teamId;
  const isAdmin = user?.role === 'admin';

  const fetchPermissions = useCallback(async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const isFolder = file.mimeType === undefined;
      const data = isFolder 
          ? await fileService.getFolderPermissions(file.id)
          : await fileService.getFilePermissions(file.id);
      setPermissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const fetchTeams = useCallback(async () => {
    if (!canUseTeamSharing) return;

    if (user?.role === 'user' && user?.teamId) {
      setTeams([
        {
          id: user.teamId,
          name: user.teamName || 'My Team',
          managerName: 'Team Manager',
          memberCount: null,
        },
      ]);
      return;
    }

    setIsTeamLoading(true);
    try {
      const data = await teamService.getTeams();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setIsTeamLoading(false);
    }
  }, [canUseTeamSharing, user?.role, user?.teamId, user?.teamName]);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    setIsUserLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(Array.isArray(data) ? data.filter((candidate) => candidate.email !== user?.email) : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsUserLoading(false);
    }
  }, [isAdmin, user?.email]);

  useEffect(() => {
    if (isOpen && file) {
      fetchPermissions();
      fetchTeams();
      fetchUsers();
    }
  }, [fetchPermissions, fetchTeams, fetchUsers, file, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTeamSearch('');
      setSelectedTeamId('');
      setSelectedUserEmail('');
      setUserSearch('');
      setShareMode(isAdmin ? 'user' : 'team');
      setAccessLevel('VIEW');
    }
  }, [isAdmin, isOpen]);

  const filteredTeams = useMemo(() => {
    const query = teamSearch.trim().toLowerCase();
    if (!query) return teams;
    return teams.filter((team) =>
      team.name?.toLowerCase().includes(query) ||
      team.managerName?.toLowerCase().includes(query)
    );
  }, [teamSearch, teams]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return users;
    return users.filter((candidate) =>
      candidate.name?.toLowerCase().includes(query) ||
      candidate.email?.toLowerCase().includes(query)
    );
  }, [userSearch, users]);

  const selectedTeam = teams.find((team) => String(team.id) === String(selectedTeamId));
  const selectedUser = users.find((candidate) => candidate.email === selectedUserEmail);

  const handleShare = async (e) => {
    e.preventDefault();
    if (shareMode === 'team' && !selectedTeamId) return;
    if (shareMode === 'user' && !selectedUserEmail) return;
    setIsSharing(true);
    try {
      const isFolder = file.mimeType === undefined;
      let sharedUsers;
      if (isFolder) {
        sharedUsers = await fileService.shareFolder(
          file.id,
          shareMode === 'team' ? Number(selectedTeamId) : null,
          accessLevel,
          shareMode === 'all',
          shareMode === 'user' ? selectedUserEmail : null
        );
      } else {
        sharedUsers = await fileService.shareFile(
          file.id,
          shareMode === 'team' ? Number(selectedTeamId) : null,
          accessLevel,
          shareMode === 'all',
          shareMode === 'user' ? selectedUserEmail : null
        );
      }
      toast.success(
        shareMode === 'all'
          ? `Shared with ${sharedUsers.length} users in your allowed scope`
          : shareMode === 'user'
            ? `Shared with ${selectedUser?.name || selectedUserEmail}`
            : `Shared with ${selectedTeam?.name || 'selected team'}`
      );
      setTeamSearch('');
      setSelectedTeamId('');
      setSelectedUserEmail('');
      setUserSearch('');
      setShareMode(isAdmin ? 'user' : 'team');
      fetchPermissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Share failed');
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevoke = async (userId) => {
    try {
      const isFolder = file.mimeType === undefined;
      if (isFolder) {
        await fileService.revokeFolderAccess(file.id, userId);
      } else {
        await fileService.revokeAccess(file.id, userId);
      }
      toast.success('Access revoked');
      fetchPermissions();
    } catch {
      toast.error('Failed to revoke access');
    }
  };

  if (!isOpen || !file) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-surface-container-highest border ghost-border rounded-3xl shadow-2xl w-full max-w-xl z-10 overflow-hidden"
        >
          <div className="flex items-center justify-between px-8 py-5 border-b ghost-border">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest">Share Access</h3>
              <p className="text-[10px] font-bold text-on-surface-variant mt-1 truncate max-w-[300px]">
                {file.originalName || file.name}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-xl text-on-surface-variant hover:text-on-surface">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <form onSubmit={handleShare} className="space-y-4">
              <div className={`grid gap-2 ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShareMode('user')}
                    className={cn(
                      'h-11 rounded-xl border text-xs font-black uppercase tracking-widest transition-all',
                      shareMode === 'user'
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'bg-surface-container border-transparent ghost-border text-on-surface-variant hover:bg-surface-container-high'
                    )}
                  >
                    Specific User
                  </button>
                )}
                {canUseTeamSharing && (
                  <button
                    type="button"
                    onClick={() => setShareMode('team')}
                    className={cn(
                      'h-11 rounded-xl border text-xs font-black uppercase tracking-widest transition-all',
                      shareMode === 'team'
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'bg-surface-container border-transparent ghost-border text-on-surface-variant hover:bg-surface-container-high'
                    )}
                  >
                    Specific Team
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShareMode('all')}
                  className={cn(
                    'h-11 rounded-xl border text-xs font-black uppercase tracking-widest transition-all',
                    shareMode === 'all'
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'bg-surface-container border-transparent ghost-border text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  All Allowed Users
                </button>
              </div>

              {shareMode === 'user' && isAdmin && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search user by name or email"
                    className="w-full h-12 bg-surface-container border ghost-border rounded-xl px-4 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <div className="rounded-2xl bg-surface-container/30 border ghost-border p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">All Users</p>
                    {isUserLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <p className="text-xs text-on-surface-variant">No matching users found.</p>
                    ) : (
                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {filteredUsers.map((candidate) => (
                          <button
                            key={candidate.id}
                            type="button"
                            onClick={() => setSelectedUserEmail(candidate.email)}
                            className={cn(
                              'w-full text-left p-3 rounded-xl transition-colors border',
                              candidate.email === selectedUserEmail
                                ? 'bg-primary/10 border-primary/30'
                                : 'bg-transparent border-transparent hover:bg-primary/10'
                            )}
                          >
                            <p className="text-sm font-bold">{candidate.name}</p>
                            <p className="text-[10px] font-bold text-on-surface-variant">{candidate.email}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {shareMode === 'team' && canUseTeamSharing && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    placeholder="Search team by name or manager"
                    className="w-full h-12 bg-surface-container border ghost-border rounded-xl px-4 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />

                  <div className="rounded-2xl bg-surface-container/30 border ghost-border p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">
                      {user?.role === 'manager' ? 'Your Teams' : user?.role === 'user' ? 'Your Team' : 'Available Teams'}
                    </p>
                    {isTeamLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : filteredTeams.length === 0 ? (
                      <p className="text-xs text-on-surface-variant">No matching teams found.</p>
                    ) : (
                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {filteredTeams.map((team) => (
                          <button
                            key={team.id}
                            type="button"
                            onClick={() => setSelectedTeamId(String(team.id))}
                            className={cn(
                              'w-full text-left p-3 rounded-xl transition-colors border',
                              String(team.id) === String(selectedTeamId)
                                ? 'bg-primary/10 border-primary/30'
                                : 'bg-transparent border-transparent hover:bg-primary/10'
                            )}
                          >
                            <p className="text-sm font-bold">{team.name}</p>
                            <p className="text-[10px] font-bold text-on-surface-variant">
                              Manager: {team.managerName || 'Unassigned'} • Members: {team.memberCount ?? 'Team Scope'}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {ACCESS_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setAccessLevel(level.value)}
                    className={cn(
                      'p-3 rounded-xl border text-center transition-all',
                      accessLevel === level.value
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'bg-surface-container border-transparent ghost-border text-on-surface-variant hover:bg-surface-container-high'
                    )}
                  >
                    <level.icon className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[11px] font-black block">{level.label}</span>
                    <span className="text-[9px] font-medium opacity-60">{level.desc}</span>
                  </button>
                ))}
              </div>

              {shareMode === 'all' && (
                <div className="rounded-2xl bg-primary/5 border border-primary/20 p-3">
                  <p className="text-xs font-bold text-on-surface">
                    {user?.role === 'manager'
                      ? 'This will share the file with all users in your managed teams.'
                      : user?.role === 'user'
                        ? 'This will share the file with your teammates and your team manager.'
                        : 'This will share the file with all non-admin users in the system.'}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSharing || (shareMode === 'team' && !selectedTeamId) || (shareMode === 'user' && !selectedUserEmail)}
                className="w-full h-12 bg-primary text-black font-black text-sm rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                {shareMode === 'all' ? 'Share With All Allowed Users' : shareMode === 'user' ? 'Share With Selected User' : 'Share With Selected Team'}
              </button>
            </form>

            <div>
              <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Shared With</h4>
              {isLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : permissions.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-6 opacity-40">Not shared with anyone yet</p>
              ) : (
                <div className="space-y-2">
                  {permissions.map((p) => (
                    <div key={p.permissionId} className="flex items-center gap-3 p-3 bg-surface-container/30 rounded-xl group">
                      <img
                        src={p.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${p.userName}`}
                        alt=""
                        className="w-9 h-9 rounded-xl border ghost-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{p.userName}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant">{p.userEmail}</p>
                      </div>
                      <span className={cn(
                        'text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg',
                        p.accessLevel === 'VIEW' && 'bg-blue-500/10 text-blue-400',
                        p.accessLevel === 'EDIT' && 'bg-tertiary/10 text-tertiary',
                        p.accessLevel === 'MANAGE' && 'bg-secondary/10 text-secondary',
                      )}>{p.accessLevel}</span>
                      <button
                        onClick={() => handleRevoke(p.userId)}
                        className="p-2 hover:bg-error/10 rounded-xl text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
