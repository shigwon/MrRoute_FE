<!-- src/views/BoardDetailView.vue -->
<template>
  <div class="board-detail-view">
    <div class="container py-4">
      <div class="card">
        <div class="card-header bg-white">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h2 class="mb-0">{{ board.title }}</h2>
            <div class="badge bg-primary">조회수: {{ board.viewCnt }}</div>
          </div>
          <div class="d-flex justify-content-between text-muted">
            <div>
              <span class="me-3"><i class="fas fa-user"></i> {{ board.writer }}</span>
            </div>
            <div>
              <span><i class="far fa-clock"></i> {{ formatDate(board.regDate) }}</span>
            </div>
          </div>
        </div>

        <div class="card-body">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">로딩중...</span>
            </div>
          </div>
          <div v-else>
            <!-- 게시글 내용 -->
            <div class="board-content mb-4">
              {{ board.content }}
            </div>

            <!-- 버튼 그룹 -->
            <div class="d-flex justify-content-between mt-4 pt-4 border-top">
              <router-link to="/board" class="btn btn-secondary"> <i class="fas fa-list"></i> 목록 </router-link>

              <div v-if="isAuthor">
                <router-link :to="`/board/edit/${board.bno}`" class="btn btn-primary me-2">
                  <i class="fas fa-edit"></i> 수정
                </router-link>
                <button class="btn btn-danger" @click="confirmDelete"><i class="fas fa-trash"></i> 삭제</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 댓글 섹션 -->
      <div class="mt-4">
        <CommentSection :board-no="parseInt(route.params.bno)" ref="commentSection" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import boardAPI from "@/api/board";
import CommentSection from "@/components/board/CommentSection.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 상태 관리
const board = ref({});
const loading = ref(true);
const commentSection = ref(null);

// 콘솔 로그를 추가하여 권한 확인
const isAuthor = computed(() => {
  console.log("인증 상태:", authStore.isAuthenticated);
  console.log("현재 사용자:", authStore.user);
  console.log("게시글 작성자:", board.value?.writer);

  return (
    authStore.isAuthenticated &&
    board.value &&
    board.value.writer &&
    (board.value.writer === authStore.user?.name || authStore.isAdmin)
  );
});

// 메서드
const fetchBoardDetail = async () => {
  try {
    loading.value = true;
    const bno = parseInt(route.params.bno);

    if (isNaN(bno)) {
      throw new Error("유효하지 않은 게시글 번호입니다.");
    }

    const response = await boardAPI.getBoardDetail(bno);
    board.value = response.data;
  } catch (error) {
    console.error("게시글 상세 정보를 가져오는 중 오류 발생:", error);
    alert("게시글을 불러오는 중 오류가 발생했습니다.");
    router.push("/board");
  } finally {
    loading.value = false;
  }
};

const confirmDelete = () => {
  if (confirm("정말로 이 게시글을 삭제하시겠습니까?\n삭제된 게시글과 댓글은 복구할 수 없습니다.")) {
    deleteBoard();
  }
};

const deleteBoard = async () => {
  try {
    loading.value = true;
    const bno = board.value.bno;
    console.log(`게시글 삭제 요청 - 번호: ${bno}`);

    // API 호출 전 토큰 확인
    const token = localStorage.getItem("auth-token");
    console.log("인증 토큰 유무:", !!token);

    const response = await boardAPI.deleteBoard(bno);
    console.log("삭제 API 응답:", response);

    alert("게시글이 삭제되었습니다.");
    router.push("/board");
  } catch (error) {
    console.error("게시글 삭제 중 오류 발생:", error);
    // 오류 응답 상세 정보 표시
    if (error.response) {
      console.error("에러 상태:", error.response.status);
      console.error("에러 데이터:", error.response.data);
    }
    alert("게시글 삭제에 실패했습니다. " + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 컴포넌트 마운트 시 게시글 상세 정보 불러오기
onMounted(() => {
  fetchBoardDetail();
});
</script>

<style scoped>
.board-detail-view .card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 10px;
  overflow: hidden;
}

.board-detail-view .card-header {
  border-bottom: 1px solid #eee;
  padding: 1.5rem;
}

.board-detail-view .card-body {
  padding: 2rem;
}

.board-content {
  min-height: 300px;
  white-space: pre-line;
  line-height: 1.8;
  font-size: 1.1rem;
  color: #333;
}

.badge {
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
}

/* 댓글 섹션을 위한 추가 스타일 */
.mt-4 {
  margin-top: 2rem !important;
}

/* 게시글과 댓글 사이의 구분선 */
.border-top {
  border-top: 1px solid #dee2e6 !important;
}

/* 반응형 */
@media (max-width: 768px) {
  .board-detail-view .card-body {
    padding: 1rem;
  }

  .board-content {
    font-size: 1rem;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .d-flex.justify-content-between > div:last-child {
    align-self: flex-end;
  }
}
</style>
