<!-- src/components/planboard/PlanBoardComment.vue -->
<template>
  <div class="plan-board-comment">
    <!-- 댓글 작성 폼 -->
    <div v-if="showCommentForm" class="comment-form mb-4">
      <div class="card">
        <div class="card-header bg-light">
          <h6 class="mb-0">
            <i class="fas fa-comment-alt me-2"></i>
            댓글 작성
          </h6>
        </div>
        <div class="card-body">
          <form @submit.prevent="submitComment">
            <div class="mb-3">
              <textarea
                v-model="newComment.content"
                class="form-control"
                rows="4"
                placeholder="댓글을 입력하세요..."
                required
              ></textarea>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <i class="fas fa-info-circle me-1"></i>
                따뜻하고 건설적인 댓글을 작성해주세요.
              </small>
              <div>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    작성 중...
                  </span>
                  <span v-else>
                    <i class="fas fa-paper-plane me-2"></i>
                    댓글 작성
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 댓글 목록 -->
    <div class="comments-section">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">댓글을 불러오는 중...</span>
        </div>
      </div>

      <!-- 댓글이 없는 경우 -->
      <div v-else-if="parentComments.length === 0" class="no-comments text-center py-5">
        <i class="fas fa-comment-slash text-muted mb-3" style="font-size: 3rem;"></i>
        <p class="text-muted mb-0">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
      </div>

      <!-- 댓글 목록 (부모 댓글만) -->
      <div v-else class="comments-list">
        <div
          v-for="comment in parentComments"
          :key="comment.commentId"
          class="comment-item parent-comment"
        >
          <!-- 부모 댓글 내용 -->
          <div class="comment-content">
            <div class="comment-header">
              <div class="comment-author">
                <div class="author-avatar">
                  <img
                    :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.writer)}&background=random`"
                    :alt="comment.writer"
                    class="avatar-img"
                  />
                </div>
                <div class="author-info">
                  <span class="author-name">{{ comment.writer }}</span>
                  <span class="comment-date">{{ formatDate(comment.regDate) }}</span>
                  <span v-if="comment.updateDate && comment.updateDate !== comment.regDate" class="edited-mark">
                    (수정됨)
                  </span>
                </div>
              </div>
              <div class="comment-actions">
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-link text-muted dropdown-toggle"
                    type="button"
                    :id="`commentDropdown${comment.commentId}`"
                    data-bs-toggle="dropdown"
                  >
                    <i class="fas fa-ellipsis-h"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="startReply(comment)">
                        <i class="fas fa-reply me-2"></i>답글 작성
                      </a>
                    </li>
                    <li v-if="canEditComment(comment)">
                      <a class="dropdown-item" href="#" @click.prevent="startEdit(comment)">
                        <i class="fas fa-edit me-2"></i>수정
                      </a>
                    </li>
                    <li v-if="canDeleteComment(comment)">
                      <hr class="dropdown-divider" />
                      <a class="dropdown-item text-danger" href="#" @click.prevent="deleteComment(comment)">
                        <i class="fas fa-trash me-2"></i>삭제
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 댓글 텍스트 (수정 모드가 아닌 경우) -->
            <div v-if="editingCommentId !== comment.commentId" class="comment-text">
              <p class="mb-0">{{ comment.content }}</p>
            </div>

            <!-- 댓글 수정 폼 -->
            <div v-else class="comment-edit-form mt-2">
              <form @submit.prevent="updateComment(comment)">
                <div class="mb-2">
                  <textarea
                    v-model="editContent"
                    class="form-control"
                    rows="3"
                    required
                  ></textarea>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-sm btn-outline-secondary me-2" @click="cancelEdit">
                    취소
                  </button>
                  <button type="submit" class="btn btn-sm btn-primary" :disabled="isSubmitting">
                    <span v-if="isSubmitting">수정 중...</span>
                    <span v-else>수정하기</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- 답글 작성 폼 -->
            <div v-if="replyingToCommentId === comment.commentId" class="reply-form mt-3">
              <form @submit.prevent="submitReply(comment)">
                <div class="mb-2">
                  <textarea
                    v-model="replyContent"
                    class="form-control"
                    rows="3"
                    :placeholder="`${comment.writer}님에게 답글을 남겨보세요...`"
                    required
                  ></textarea>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-sm btn-outline-secondary me-2" @click="cancelReply">
                    취소
                  </button>
                  <button type="submit" class="btn btn-sm btn-primary" :disabled="isSubmitting">
                    <span v-if="isSubmitting">답글 작성 중...</span>
                    <span v-else>답글 작성</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- 대댓글 목록 (부모 댓글 내부에 중첩) -->
          <div v-if="getChildComments(comment.commentId).length > 0" class="replies-section">
            <div
              v-for="reply in getChildComments(comment.commentId)"
              :key="reply.commentId"
              class="comment-item reply-comment"
            >
              <div class="comment-content">
                <div class="comment-header">
                  <div class="comment-author">
                    <div class="author-avatar">
                      <img
                        :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(reply.writer)}&background=random`"
                        :alt="reply.writer"
                        class="avatar-img"
                      />
                    </div>
                    <div class="author-info">
                      <span class="author-name">{{ reply.writer }}</span>
                      <span class="comment-date">{{ formatDate(reply.regDate) }}</span>
                      <span v-if="reply.updateDate && reply.updateDate !== reply.regDate" class="edited-mark">
                        (수정됨)
                      </span>
                    </div>
                  </div>
                  <div class="comment-actions">
                    <div class="dropdown">
                      <button
                        class="btn btn-sm btn-link text-muted dropdown-toggle"
                        type="button"
                        :id="`replyDropdown${reply.commentId}`"
                        data-bs-toggle="dropdown"
                      >
                        <i class="fas fa-ellipsis-h"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li v-if="canEditComment(reply)">
                          <a class="dropdown-item" href="#" @click.prevent="startEdit(reply)">
                            <i class="fas fa-edit me-2"></i>수정
                          </a>
                        </li>
                        <li v-if="canDeleteComment(reply)">
                          <hr class="dropdown-divider" />
                          <a class="dropdown-item text-danger" href="#" @click.prevent="deleteComment(reply)">
                            <i class="fas fa-trash me-2"></i>삭제
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- 답글 텍스트 -->
                <div v-if="editingCommentId !== reply.commentId" class="comment-text">
                  <p class="mb-0">{{ reply.content }}</p>
                </div>

                <!-- 답글 수정 폼 -->
                <div v-else class="comment-edit-form mt-2">
                  <form @submit.prevent="updateComment(reply)">
                    <div class="mb-2">
                      <textarea
                        v-model="editContent"
                        class="form-control"
                        rows="3"
                        required
                      ></textarea>
                    </div>
                    <div class="d-flex justify-content-end">
                      <button type="button" class="btn btn-sm btn-outline-secondary me-2" @click="cancelEdit">
                        취소
                      </button>
                      <button type="submit" class="btn btn-sm btn-primary" :disabled="isSubmitting">
                        <span v-if="isSubmitting">수정 중...</span>
                        <span v-else>수정하기</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import commentAPI from "@/api/comment";

const props = defineProps({
  boardNo: {
    type: [Number, String],
    required: true,
    validator(value) {
      const isValid = value && value !== 'undefined' && !isNaN(Number(value));
      if (!isValid) {
        console.error('Invalid boardNo prop:', value);
      }
      return isValid;
    }
  },
  showCommentForm: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['comment-added', 'comment-updated', 'comment-deleted']);

const authStore = useAuthStore();

// 상태 관리
const comments = ref([]);
const loading = ref(false);
const isSubmitting = ref(false);

// 댓글 작성/수정 관련
const newComment = ref({
  content: "",
});
const editingCommentId = ref(null);
const editContent = ref("");

// 답글 관련
const replyingToCommentId = ref(null);
const replyContent = ref("");

// 계산된 속성
const isLoggedIn = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.user);

// 부모 댓글만 필터링
const parentComments = computed(() => {
  return comments.value.filter(comment => !comment.parentId);
});

// 특정 부모 댓글의 자식 댓글들을 가져오는 함수
const getChildComments = (parentId) => {
  return comments.value.filter(comment => comment.parentId === parentId);
};

// 메서드
const loadComments = async () => {
  // boardNo 유효성 검사
  if (!props.boardNo || props.boardNo === 'undefined') {
    console.error('Cannot load comments: Invalid boardNo', props.boardNo);
    return;
  }

  try {
    loading.value = true;
    console.log('Loading comments for boardNo:', props.boardNo);
    const response = await commentAPI.getCommentsByBoard(props.boardNo);
    comments.value = response.data || [];
    console.log('Loaded comments:', comments.value.length);
  } catch (error) {
    console.error("댓글 목록 조회 중 오류 발생:", error);
    comments.value = [];
  } finally {
    loading.value = false;
  }
};

const submitComment = async () => {
  if (!isLoggedIn.value) {
    alert("댓글을 작성하려면 로그인이 필요합니다.");
    return;
  }

  if (!newComment.value.content.trim()) {
    alert("댓글 내용을 입력해주세요.");
    return;
  }

  try {
    isSubmitting.value = true;

    const commentData = {
      bno: props.boardNo,
      content: newComment.value.content.trim(),
      parentId: null, // 최상위 댓글
    };

    await commentAPI.createComment(commentData);
    emit('comment-added');

    // 폼 초기화
    newComment.value.content = "";

    // 댓글 목록 새로고침
    await loadComments();

  } catch (error) {
    console.error("댓글 작성 중 오류 발생:", error);
    alert("댓글 작성에 실패했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

const startReply = (comment) => {
  replyingToCommentId.value = comment.commentId;
  replyContent.value = "";
};

const submitReply = async (parentComment) => {
  if (!isLoggedIn.value) {
    alert("답글을 작성하려면 로그인이 필요합니다.");
    return;
  }

  if (!replyContent.value.trim()) {
    alert("답글 내용을 입력해주세요.");
    return;
  }

  try {
    isSubmitting.value = true;

    const replyData = {
      bno: props.boardNo,
      content: replyContent.value.trim(),
      parentId: parentComment.commentId,
    };

    await commentAPI.createComment(replyData);
    
    // 폼 초기화
    replyContent.value = "";
    replyingToCommentId.value = null;

    // 댓글 목록 새로고침
    await loadComments();
    emit('comment-added');

  } catch (error) {
    console.error("답글 작성 중 오류 발생:", error);
    alert("답글 작성에 실패했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

const cancelReply = () => {
  replyingToCommentId.value = null;
  replyContent.value = "";
};

const startEdit = (comment) => {
  editingCommentId.value = comment.commentId;
  editContent.value = comment.content;
};

const updateComment = async (comment) => {
  if (!editContent.value.trim()) {
    alert("댓글 내용을 입력해주세요.");
    return;
  }

  try {
    isSubmitting.value = true;

    const updateData = {
      content: editContent.value.trim(),
    };

    await commentAPI.updateComment(comment.commentId, updateData);
    
    // 편집 상태 해제
    editingCommentId.value = null;
    editContent.value = "";

    // 댓글 목록 새로고침
    await loadComments();
    emit('comment-updated');

  } catch (error) {
    console.error("댓글 수정 중 오류 발생:", error);
    alert("댓글 수정에 실패했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

const cancelEdit = () => {
  editingCommentId.value = null;
  editContent.value = "";
};

const deleteComment = async (comment) => {
  if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
    return;
  }

  try {
    await commentAPI.deleteComment(comment.commentId);
    
    // 댓글 목록 새로고침
    await loadComments();
    emit('comment-deleted');
    
    alert("댓글이 삭제되었습니다.");

  } catch (error) {
    console.error("댓글 삭제 중 오류 발생:", error);
    alert("댓글 삭제에 실패했습니다.");
  }
};

const canEditComment = (comment) => {
  console.log('Edit check:', {
    isLoggedIn: isLoggedIn.value,
    currentUser: currentUser.value,
    commentWriter: comment.writer,
    isAdmin: authStore.isAdmin
  });
  
  if (!isLoggedIn.value || !currentUser.value) return false;
  return comment.writer === currentUser.value.name || authStore.isAdmin;
};

const canDeleteComment = (comment) => {
  console.log('Delete check:', {
    isLoggedIn: isLoggedIn.value,
    currentUser: currentUser.value,
    commentWriter: comment.writer,
    isAdmin: authStore.isAdmin
  });
  
  if (!isLoggedIn.value || !currentUser.value) return false;
  return comment.writer === currentUser.value.name || authStore.isAdmin;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "오늘 " + date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 2) {
    return "어제 " + date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays <= 7) {
    return `${diffDays - 1}일 전`;
  } else {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
};

// 라이프사이클
onMounted(() => {
  loadComments();
});

// props 변경 감지
watch(() => props.boardNo, () => {
  if (props.boardNo) {
    loadComments();
  }
});
</script>

<style scoped>
/* 기본 댓글 컨테이너 */
.comment-item {
  margin-bottom: 1.5rem;
}

.parent-comment {
  padding: 1.25rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.parent-comment:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d0d7de;
}

/* 대댓글 스타일 */
.reply-comment {
  margin: 1rem 0 0.5rem 2.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-left: 3px solid #0d6efd;
  border-radius: 8px;
  position: relative;
}

.reply-comment::before {
  content: '';
  position: absolute;
  left: -2.5rem;
  top: 50%;
  width: 1.5rem;
  height: 2px;
  background-color: #e9ecef;
  transform: translateY(-50%);
}

.reply-comment::after {
  content: '';
  position: absolute;
  left: -2.5rem;
  top: -1rem;
  bottom: 50%;
  width: 2px;
  background-color: #e9ecef;
}

/* 댓글 헤더 */
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
}

.reply-comment .avatar-img {
  width: 32px;
  height: 32px;
}

.author-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.author-name {
  font-weight: 600;
  color: #24292f;
  font-size: 0.9rem;
  line-height: 1.2;
}

.comment-date {
  font-size: 0.8rem;
  color: #656d76;
  margin-top: 0.1rem;
}

.edited-mark {
  font-size: 0.75rem;
  color: #656d76;
  font-style: italic;
  margin-left: 0.5rem;
}

/* 댓글 내용 */
.comment-text {
  line-height: 1.6;
  color: #24292f;
  margin-bottom: 0.5rem;
}

.comment-text p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 댓글 액션 버튼 */
.comment-actions .dropdown-toggle {
  border: none;
  background: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #656d76;
  transition: all 0.15s ease;
}

.comment-actions .dropdown-toggle:hover {
  background-color: #f3f4f6;
  color: #24292f;
}

.comment-actions .dropdown-toggle:focus {
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
}

/* 댓글 작성 폼 */
.comment-form .card {
  border: 1px solid #d0d7de;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.comment-form .card-header {
  background: linear-gradient(135deg, #f6f8fa 0%, #ffffff 100%);
  border-bottom: 1px solid #d0d7de;
}

/* 수정/답글 폼 */
.comment-edit-form,
.reply-form {
  background-color: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.75rem;
}

.comment-edit-form textarea,
.reply-form textarea {
  border: 1px solid #d0d7de;
  border-radius: 6px;
  font-size: 0.9rem;
}

.comment-edit-form textarea:focus,
.reply-form textarea:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

/* 답글 섹션 */
.replies-section {
  margin-top: 1rem;
  position: relative;
}

/* 빈 댓글 상태 */
.no-comments {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px dashed #d0d7de;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  margin: 2rem 0;
}

.no-comments i {
  opacity: 0.6;
  margin-bottom: 1rem;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .parent-comment {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .reply-comment {
    margin-left: 1.5rem;
    padding: 0.75rem;
  }

  .reply-comment::before {
    left: -1.5rem;
    width: 1rem;
  }

  .reply-comment::after {
    left: -1.5rem;
  }

  .avatar-img {
    width: 36px;
    height: 36px;
  }

  .reply-comment .avatar-img {
    width: 28px;
    height: 28px;
  }

  .comment-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .comment-actions {
    margin-top: 0.25rem;
  }

  .comment-author {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .reply-comment {
    margin-left: 1rem;
  }

  .reply-comment::before {
    left: -1rem;
    width: 0.75rem;
  }

  .reply-comment::after {
    left: -1rem;
  }

  .parent-comment {
    padding: 0.75rem;
  }

  .comment-edit-form,
  .reply-form {
    padding: 0.75rem;
  }
}

/* 로딩 및 상태 스타일 */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* 드롭다운 메뉴 개선 */
.dropdown-menu {
  border: 1px solid #d0d7de;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 0.5rem 0;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background-color: #f6f8fa;
}

.dropdown-item.text-danger:hover {
  background-color: #fff5f5;
  color: #dc3545;
}

/* 버튼 스타일 개선 */
.btn-sm {
  font-size: 0.85rem;
  padding: 0.375rem 0.75rem;
}

.btn-primary {
  background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
  transform: translateY(-1px);
}

.btn-outline-secondary {
  border-color: #d0d7de;
  color: #656d76;
}

.btn-outline-secondary:hover {
  background-color: #f6f8fa;
  border-color: #d0d7de;
  color: #24292f;
}
</style>