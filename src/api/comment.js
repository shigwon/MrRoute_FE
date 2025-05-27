// src/api/comment.js
import apiClient from "./index";

export default {
  // 댓글 작성
  createComment(commentData) {
    return apiClient.post("/comments", commentData);
  },

  // 게시글 댓글 조회
  getCommentsByBoard(boardId) {
    return apiClient.get(`/comments/board/${boardId}`);
  },

  // 댓글 수정
  updateComment(commentId, commentData) {
    return apiClient.put(`/comments/${commentId}`, commentData);
  },

  // 댓글 삭제
  deleteComment(commentId) {
    return apiClient.delete(`/comments/${commentId}`);
  },
};