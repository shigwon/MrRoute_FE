// src/api/planboard.js - 수정된 버전
import apiClient from "./index";

export default {
  // 게시글 목록 조회 - 파라미터 처리 개선
  getPlanBoards(params = {}) {
    console.log("getPlanBoards 호출됨:", params);

    // 빈 값들 제거
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {});

    console.log("정리된 파라미터:", cleanParams);

    return apiClient
      .get("/planboards", { params: cleanParams })
      .then((response) => {
        console.log("API 응답:", response.data);
        return response;
      })
      .catch((error) => {
        console.error("API 에러:", error);
        throw error;
      });
  },

  // 게시글 상세 조회
  getPlanBoardDetail(pboardNo) {
    console.log("getPlanBoardDetail 호출됨:", pboardNo);
    return apiClient.get(`/planboards/${pboardNo}`);
  },

  // 게시글 작성
  createPlanBoard(planBoardData) {
    console.log("createPlanBoard 호출됨:", planBoardData);
    return apiClient.post("/planboards", planBoardData);
  },

  // 게시글 수정
  updatePlanBoard(pboardNo, planBoardData) {
    return apiClient.put(`/planboards/${pboardNo}`, planBoardData);
  },

  // 게시글 삭제
  deletePlanBoard(pboardNo) {
    return apiClient.delete(`/planboards/${pboardNo}`);
  },

  // 댓글 목록 조회
  getComments(pboardNo) {
    return apiClient.get(`/planboards/${pboardNo}/comments`);
  },

  // 댓글 작성
  createComment(pboardNo, commentData) {
    return apiClient.post(`/planboards/${pboardNo}/comments`, commentData);
  },

  // 댓글 수정
  updateComment(commentId, commentData) {
    return apiClient.put(`/planboards/comments/${commentId}`, commentData);
  },

  // 댓글 삭제
  deleteComment(commentId) {
    return apiClient.delete(`/planboards/comments/${commentId}`);
  },

  // 좋아요 토글
  toggleLike(pboardNo) {
    return apiClient.post(`/planboards/${pboardNo}/likes`);
  },

  // 인기 태그 목록 조회
  getPopularTags(limit = 10) {
    return apiClient.get("/planboards/tags/popular", { params: { limit } });
  },

  // 추천 게시글 목록 조회
  getFeaturedPlanBoards(limit = 6) {
    return apiClient.get("/planboards/featured", { params: { limit } });
  },

  // 인기 게시글 목록 조회
  getPopularPlanBoards(limit = 6) {
    return apiClient.get("/planboards/popular", { params: { limit } });
  },

  // 태그별 게시글 목록 조회
  getPlanBoardsByTag(tagName, offset = 0, limit = 10) {
    return apiClient.get(`/planboards/tags/${encodeURIComponent(tagName)}`, {
      params: { offset, limit },
    });
  },

  // 사용자별 게시글 목록 조회
  getUserPlanBoards(userId, offset = 0, limit = 10) {
    return apiClient.get(`/planboards/user/${userId}`, {
      params: { offset, limit },
    });
  },

  // 게시글 검색
  searchPlanBoards(searchParams) {
    const { keyword, searchType = "all", offset = 0, limit = 10 } = searchParams;
    return apiClient.get("/planboards/search", {
      params: { keyword, searchType, offset, limit },
    });
  },

  // 여행 테마별 통계 조회
  getTravelThemeStatistics() {
    return apiClient.get("/planboards/statistics/themes");
  },

  // 월별 게시글 통계 조회
  getMonthlyStatistics(year = new Date().getFullYear()) {
    return apiClient.get("/planboards/statistics/monthly", { params: { year } });
  },
};
