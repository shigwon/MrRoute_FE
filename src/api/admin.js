import apiClient from "./index";

export default {
  // ==================== 대시보드 ====================
  getDashboardData() {
    return apiClient.get("/admin/dashboard");
  },

  toggleMaintenanceMode(enabled) {
    return apiClient.post("/admin/system/maintenance", { enabled });
  },

  // ==================== 회원 관리 ====================
  getMembers(params) {
    return apiClient.get("/admin/members", { params });
  },

  updateMemberRole(memberId, role) {
    return apiClient.put(`/admin/members/${memberId}/role`, { role });
  },

  forceDeleteMember(memberId) {
    return apiClient.delete(`/admin/members/${memberId}`);
  },

  bulkUpdateMemberRole(memberIds, role) {
    return Promise.all(memberIds.map((id) => this.updateMemberRole(id, role)));
  },

  bulkDeleteMembers(memberIds) {
    return Promise.all(memberIds.map((id) => this.forceDeleteMember(id)));
  },

  // ==================== 게시글 관리 ====================
  getBoards(params) {
    return apiClient.get("/admin/boards", { params });
  },

  forceDeleteBoard(bno) {
    return apiClient.delete(`/admin/boards/${bno}`);
  },

  bulkDeleteBoards(boardIds) {
    return Promise.all(boardIds.map((id) => this.forceDeleteBoard(id)));
  },

  // ==================== 시스템 관리 ====================
  getSystemInfo() {
    return apiClient.get("/admin/system/info");
  },

  getSystemLogs(params) {
    return apiClient.get("/admin/system/logs", { params });
  },

  clearSystemLogs() {
    return apiClient.delete("/admin/system/logs");
  },

  // ==================== 통계 ====================
  getDetailedStatistics() {
    return apiClient.get("/admin/statistics");
  },

  getUserGrowthStats(period = "month") {
    return apiClient.get("/admin/statistics/user-growth", {
      params: { period },
    });
  },

  getContentStats() {
    return apiClient.get("/admin/statistics/content");
  },

  // ==================== 백업 및 복원 ====================
  createBackup() {
    return apiClient.post("/admin/backup/create");
  },

  getBackupList() {
    return apiClient.get("/admin/backup/list");
  },

  restoreBackup(backupId) {
    return apiClient.post(`/admin/backup/restore/${backupId}`);
  },

  downloadBackup(backupId) {
    return apiClient.get(`/admin/backup/download/${backupId}`, {
      responseType: "blob",
    });
  },

  // ==================== 설정 관리 ====================
  getSystemSettings() {
    return apiClient.get("/admin/settings");
  },

  updateSystemSettings(settings) {
    return apiClient.put("/admin/settings", settings);
  },

  // ==================== 알림 관리 ====================
  sendNotificationToAll(notification) {
    return apiClient.post("/admin/notifications/broadcast", notification);
  },

  sendNotificationToUser(userId, notification) {
    return apiClient.post(`/admin/notifications/user/${userId}`, notification);
  },

  getNotificationHistory(params) {
    return apiClient.get("/admin/notifications/history", { params });
  },
};
