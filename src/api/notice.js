// src/api/notice.js
import apiClient from "./index";

export default {
  // 공지사항 목록 조회
  getNotices(params) {
    return apiClient.get("/notices", { params });
  },

  // 공지사항 상세 조회
  getNoticeDetail(nno) {
    return apiClient.get(`/notices/${nno}`);
  },

  // 공지사항 작성 (관리자)
  createNotice(noticeData) {
    return apiClient.post("/notices", noticeData);
  },

  // 공지사항 수정 (관리자)
  updateNotice(nno, noticeData) {
    return apiClient.put(`/notices/${nno}`, noticeData);
  },

  // 공지사항 삭제 (관리자)
  deleteNotice(nno) {
    return apiClient.delete(`/notices/${nno}`);
  },

  // 중요 공지사항 조회
  getImportantNotices() {
    return apiClient.get("/notices/important");
  },

  // 최신 공지사항 조회
  getRecentNotices(limit = 5) {
    return apiClient.get("/notices/recent", { params: { limit } });
  },
  // 공지사항 조회수 증가
  increaseViewCount(nno) {
    return apiClient.post(`/notices/${nno}/view`);
  },
};
