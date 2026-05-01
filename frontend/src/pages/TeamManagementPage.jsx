import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { teamService } from "../services/teamService";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { cn } from "../utils/cn";

const EMPTY_FORM = { name: "", managerId: "" };

export const TeamManagementPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === "admin";

  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [userSearch, setUserSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) || null,
    [teams, selectedTeamId]
  );

  const loadTeams = useCallback(async () => {
    const teamData = await teamService.getTeams();
    setTeams(teamData);
    setSelectedTeamId((currentId) => {
      if (currentId && teamData.some((team) => team.id === currentId)) {
        return currentId;
      }
      return teamData[0]?.id ?? null;
    });
    return teamData;
  }, []);

  const loadManagers = useCallback(async () => {
    if (!isAdmin) return [];
    const allUsers = await userService.getUsers();
    const managerUsers = allUsers.filter(
      (candidate) => candidate.role === "manager" || candidate.role === "admin"
    );
    setManagers(managerUsers);
    return managerUsers;
  }, [isAdmin]);

  const loadAvailableUsers = useCallback(async (query = "") => {
    setIsUserLoading(true);
    try {
      const data = await teamService.getAvailableUsers(query);
      setAvailableUsers(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load available users");
    } finally {
      setIsUserLoading(false);
    }
  }, [toast]);

  const refreshPageData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [teamData, managerData] = await Promise.all([
        loadTeams(),
        loadManagers(),
      ]);
      const nextSelectedTeam = teamData[0] || null;
      setForm({
        name: nextSelectedTeam?.name || "",
        managerId:
          String(nextSelectedTeam?.managerId || managerData[0]?.id || ""),
      });
      await loadAvailableUsers(userSearch);
    } catch {
      toast.error("Failed to load team data");
    } finally {
      setIsLoading(false);
    }
  }, [loadAvailableUsers, loadManagers, loadTeams, toast, userSearch]);

  useEffect(() => {
    refreshPageData();
  }, [refreshPageData]);

  useEffect(() => {
    if (selectedTeam) {
      setForm({
        name: selectedTeam.name || "",
        managerId: String(selectedTeam.managerId || ""),
      });
      return;
    }

    if (!isLoading) {
      setForm({
        name: "",
        managerId: String(managers[0]?.id || ""),
      });
    }
  }, [isLoading, managers, selectedTeam]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadAvailableUsers(userSearch);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [loadAvailableUsers, userSearch]);

  const handleCreateNew = () => {
    setSelectedTeamId(null);
    setForm({
      name: "",
      managerId: String(managers[0]?.id || ""),
    });
  };

  const handleSaveTeam = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Team name is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = { name: form.name.trim() };
      if (isAdmin && form.managerId) {
        payload.managerId = Number(form.managerId);
      }

      const savedTeam = selectedTeamId
        ? await teamService.updateTeam(selectedTeamId, payload)
        : await teamService.createTeam(payload);

      const updatedTeams = await loadTeams();
      const activeTeam = updatedTeams.find((team) => team.id === savedTeam.id) || savedTeam;
      setSelectedTeamId(activeTeam.id);
      setForm({
        name: activeTeam.name || "",
        managerId: String(activeTeam.managerId || ""),
      });
      await loadAvailableUsers(userSearch);
      toast.success(selectedTeamId ? "Team updated successfully" : "Team created successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save team");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssign = async (userId) => {
    if (!selectedTeamId) {
      toast.error("Create or select a team first");
      return;
    }

    try {
      const updated = await teamService.assignMember(selectedTeamId, userId);
      setTeams((currentTeams) =>
        currentTeams.map((team) => (team.id === updated.id ? updated : team))
      );
      toast.success("User added to team");
      await loadAvailableUsers(userSearch);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add user");
    }
  };

  const handleRemove = async (userId) => {
    if (!selectedTeamId) return;

    try {
      const updated = await teamService.removeMember(selectedTeamId, userId);
      setTeams((currentTeams) =>
        currentTeams.map((team) => (team.id === updated.id ? updated : team))
      );
      toast.success("User removed from team");
      await loadAvailableUsers(userSearch);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove user");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 font-inter pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-manrope tracking-tighter flex items-center gap-3">
            Team Management <Users className="w-6 h-6 text-secondary opacity-60" />
          </h1>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">
            {isAdmin
              ? "Manage teams, managers, and team users from one place"
              : "Create multiple teams and assign users with controlled access"}
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="h-11 px-5 bg-primary text-black font-black rounded-xl self-start"
        >
          Create New Team
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <div className="glass-card p-5 space-y-4 h-fit">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black font-manrope">Managed Teams</h2>
          </div>

          {!teams.length ? (
            <p className="text-sm text-on-surface-variant">No teams created yet.</p>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={cn(
                    "w-full text-left rounded-2xl p-4 border transition-all",
                    selectedTeamId === team.id
                      ? "bg-primary/10 border-primary/30"
                      : "bg-surface-container/30 ghost-border hover:bg-surface-container/50"
                  )}
                >
                  <p className="text-sm font-black">{team.name}</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {team.memberCount || team.members?.length || 0} members
                  </p>
                  <p className="text-[11px] text-secondary font-bold mt-2">
                    Manager: {team.managerName}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSaveTeam} className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-black font-manrope">
                {selectedTeam ? "Edit Team" : "Create Team"}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px_auto] gap-3">
              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Enter team name"
                className="h-12 bg-surface-container border ghost-border rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
              />

              {isAdmin && (
                <select
                  value={form.managerId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, managerId: event.target.value }))
                  }
                  className="h-12 bg-surface-container border ghost-border rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} ({manager.role})
                    </option>
                  ))}
                </select>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="h-12 px-6 bg-primary text-black font-black rounded-xl disabled:opacity-50"
              >
                {isSaving ? "Saving..." : selectedTeam ? "Update Team" : "Create Team"}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-black font-manrope">Team Members</h2>
              {!selectedTeam ? (
                <p className="text-sm text-on-surface-variant">
                  Select a team to manage its members.
                </p>
              ) : !selectedTeam.members?.length ? (
                <p className="text-sm text-on-surface-variant">No members assigned yet.</p>
              ) : (
                <div className="space-y-3">
                  {selectedTeam.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 p-3 bg-surface-container/40 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-bold">{member.name}</p>
                        <p className="text-xs text-on-surface-variant">{member.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error"
                        title="Remove from team"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black font-manrope">Available Users</h2>
                <div className="relative w-full max-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Search users"
                    className="w-full h-11 bg-surface-container border ghost-border rounded-xl pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {isUserLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : !availableUsers.length ? (
                <p className="text-sm text-on-surface-variant">
                  No unassigned users match this search.
                </p>
              ) : (
                <div className="space-y-3">
                  {availableUsers.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between gap-3 p-3 bg-surface-container/40 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-bold">{candidate.name}</p>
                        <p className="text-xs text-on-surface-variant">{candidate.email}</p>
                      </div>
                      <button
                        onClick={() => handleAssign(candidate.id)}
                        disabled={!selectedTeam}
                        className="inline-flex items-center gap-2 px-3 h-10 bg-secondary/15 text-secondary font-bold rounded-lg disabled:opacity-40"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
