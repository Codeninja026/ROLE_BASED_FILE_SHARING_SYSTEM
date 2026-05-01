import api from "./api";

export const teamService = {
  async getTeams() {
    const { data } = await api.get("/teams");
    return data.data || [];
  },

  async getTeam(teamId) {
    const { data } = await api.get(`/teams/${teamId}`);
    return data.data;
  },

  async getAvailableUsers(query = "") {
    const { data } = await api.get("/teams/available-users", {
      params: query ? { q: query } : {},
    });
    return data.data || [];
  },

  async createTeam(payload) {
    const { data } = await api.post("/teams", payload);
    return data.data;
  },

  async updateTeam(teamId, payload) {
    const { data } = await api.patch(`/teams/${teamId}`, payload);
    return data.data;
  },

  async assignMember(teamId, userId) {
    const { data } = await api.post(`/teams/${teamId}/members/${userId}`);
    return data.data;
  },

  async removeMember(teamId, userId) {
    const { data } = await api.delete(`/teams/${teamId}/members/${userId}`);
    return data.data;
  },
};
