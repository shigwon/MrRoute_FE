<!-- src/views/admin/BoardsManageView.vue -->
<template>
  <div class="boards-manage-view">
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3">게시글 관리</h1>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" @click="exportBoards">
            <i class="fas fa-download me-1"></i>내보내기
          </button>
          <button class="btn btn-primary" @click="refreshBoards"><i class="fas fa-sync-alt me-1"></i>새로고침</button>
        </div>
      </div>

      <!-- 검색 및 필터 -->
      <div class="card shadow mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>검색 조건</label>
                <select v-model="searchKey" class="form-select">
                  <option value="">전체</option>
                  <option value="title">제목</option>
                  <option value="writer">작성자</option>
                  <option value="content">내용</option>
                </select>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label>검색어</label>
                <input
                  v-model="searchWord"
                  type="text"
                  class="form-control"
                  placeholder="검색어를 입력하세요"
                  @keyup.enter="searchBoards"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label>정렬</label>
                <select v-model="sortOrder" class="form-select" @change="searchBoards">
                  <option value="latest">최신순</option>
                  <option value="oldest">오래된순</option>
                  <option value="views">조회순</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group">
                <label>&nbsp;</label>
                <button @click="searchBoards" class="btn btn-primary w-100">
                  <i class="fas fa-search me-1"></i>검색
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 게시글 목록 -->
      <div class="card shadow">
        <div class="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 class="m-0 font-weight-bold text-primary">게시글 목록 ({{ boardPage.totalItems }}개)</h6>
          <div class="d-flex gap-2">
            <span class="badge bg-info">오늘 작성: {{ todayPostCount }}개</span>
            <span class="badge bg-success">이번 주: {{ weekPostCount }}개</span>
          </div>
        </div>

        <div class="card-body">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">게시글을 불러오는 중...</p>
          </div>

          <div v-else-if="boardPage.list.length === 0" class="text-center py-5 text-muted">
            <i class="fas fa-comments fa-3x mb-3"></i>
            <p>조건에 맞는 게시글이 없습니다.</p>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th style="width: 50px">
                    <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="form-check-input" />
                  </th>
                  <th style="width: 80px">번호</th>
                  <th>제목</th>
                  <th style="width: 120px">작성자</th>
                  <th style="width: 100px">조회수</th>
                  <th style="width: 120px">작성일</th>
                  <th style="width: 120px">관리</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="board in boardPage.list"
                  :key="board.bno"
                  :class="{ 'table-warning': selectedBoards.includes(board.bno) }"
                >
                  <td>
                    <input type="checkbox" :value="board.bno" v-model="selectedBoards" class="form-check-input" />
                  </td>
                  <td>
                    <span class="badge bg-secondary">{{ board.bno }}</span>
                  </td>
                  <td>
                    <div class="d-flex flex-column">
                      <router-link
                        :to="{ name: 'board-detail', params: { bno: board.bno } }"
                        class="text-decoration-none fw-bold text-dark"
                        target="_blank"
                      >
                        {{ board.title }}
                      </router-link>
                      <small class="text-muted" v-if="board.content">
                        {{ truncateText(board.content, 50) }}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar avatar-sm me-2">
                        <div class="avatar-initial rounded-circle bg-label-info">
                          {{ board.writer.charAt(0) }}
                        </div>
                      </div>
                      <span>{{ board.writer }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-primary">{{ board.viewCnt || 0 }}</span>
                  </td>
                  <td>
                    <small class="text-muted">
                      {{ formatDate(board.regDate) }}
                    </small>
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      <button class="btn btn-sm btn-outline-info" @click="viewBoardDetail(board)" title="상세보기">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-warning" @click="editBoard(board)" title="수정">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteBoard(board)" title="삭제">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 선택된 게시글 일괄 작업 -->
          <div
            v-if="selectedBoards.length > 0"
            class="alert alert-info d-flex justify-content-between align-items-center"
          >
            <div>
              <i class="fas fa-info-circle me-2"></i>
              {{ selectedBoards.length }}개의 게시글이 선택되었습니다.
            </div>
            <div class="btn-group">
              <button class="btn btn-sm btn-danger" @click="bulkDeleteBoards">
                <i class="fas fa-trash me-1"></i>선택 삭제
              </button>
            </div>
          </div>

          <!-- 페이지네이션 -->
          <nav v-if="boardPage.totalPages > 1" aria-label="게시글 목록 페이지네이션">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: !boardPage.hasPre }">
                <button class="page-link" @click="changePage(1)" :disabled="!boardPage.hasPre">
                  <i class="fas fa-angle-double-left"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>

              <li v-for="page in displayPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === boardPage.totalPages }">
                <button
                  class="page-link"
                  @click="changePage(currentPage + 1)"
                  :disabled="currentPage === boardPage.totalPages"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: !boardPage.hasNext }">
                <button class="page-link" @click="changePage(boardPage.totalPages)" :disabled="!boardPage.hasNext">
                  <i class="fas fa-angle-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- 게시글 상세 정보 모달 -->
    <div v-if="selectedBoard" class="modal show d-block" tabindex="-1" style="background-color: rgba(0, 0, 0, 0.5)">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">게시글 상세 정보</h5>
            <button type="button" class="btn-close" @click="selectedBoard = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">번호</label>
                  <input type="text" class="form-control" :value="selectedBoard.bno" readonly />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">작성자</label>
                  <input type="text" class="form-control" :value="selectedBoard.writer" readonly />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">조회수</label>
                  <input type="text" class="form-control" :value="selectedBoard.viewCnt || 0" readonly />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">작성일</label>
                  <input type="text" class="form-control" :value="formatDate(selectedBoard.regDate)" readonly />
                </div>
              </div>
              <div class="col-12">
                <div class="form-group mb-3">
                  <label class="form-label">제목</label>
                  <input type="text" class="form-control" :value="selectedBoard.title" readonly />
                </div>
              </div>
              <div class="col-12">
                <div class="form-group mb-3">
                  <label class="form-label">내용</label>
                  <textarea class="form-control" rows="10" :value="selectedBoard.content" readonly></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="selectedBoard = null">닫기</button>
            <button type="button" class="btn btn-warning" @click="editBoard(selectedBoard)">수정</button>
            <button type="button" class="btn btn-danger" @click="confirmDeleteBoard(selectedBoard)">삭제</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";

const router = useRouter();

// 상태 관리
const boardPage = ref({
  list: [],
  totalItems: 0,
  totalPages: 0,
  hasPre: false,
  hasNext: false,
});

const loading = ref(false);
const currentPage = ref(1);
const searchKey = ref("");
const searchWord = ref("");
const sortOrder = ref("latest");
const selectedBoards = ref([]);
const selectAll = ref(false);
const selectedBoard = ref(null);

// 계산된 속성
const todayPostCount = computed(() => {
  const today = new Date().toISOString().split("T")[0];
  return boardPage.value.list.filter((board) => {
    const boardDate = new Date(board.regDate).toISOString().split("T")[0];
    return boardDate === today;
  }).length;
});

const weekPostCount = computed(() => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return boardPage.value.list.filter((board) => {
    const boardDate = new Date(board.regDate);
    return boardDate >= weekAgo;
  }).length;
});

const displayPages = computed(() => {
  const maxDisplayPages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxDisplayPages / 2));
  let endPage = Math.min(boardPage.value.totalPages, startPage + maxDisplayPages - 1);

  if (endPage - startPage + 1 < maxDisplayPages) {
    startPage = Math.max(1, endPage - maxDisplayPages + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

// 메서드
const loadBoards = async () => {
  try {
    loading.value = true;
    const params = {
      key: searchKey.value,
      word: searchWord.value,
      currentPage: currentPage.value,
    };

    const response = await apiClient.get("/admin/boards", { params });
    boardPage.value = response.data;

    // 정렬 적용
    if (sortOrder.value === "views") {
      boardPage.value.list.sort((a, b) => (b.viewCnt || 0) - (a.viewCnt || 0));
    } else if (sortOrder.value === "oldest") {
      boardPage.value.list.sort((a, b) => new Date(a.regDate) - new Date(b.regDate));
    }

    selectedBoards.value = [];
    selectAll.value = false;
  } catch (error) {
    console.error("게시글 목록 조회 중 오류:", error);
    if (error.response?.status === 403) {
      alert("관리자 권한이 필요합니다.");
      router.push("/");
    }
  } finally {
    loading.value = false;
  }
};

const searchBoards = () => {
  currentPage.value = 1;
  loadBoards();
};

const refreshBoards = () => {
  loadBoards();
};

const changePage = (page) => {
  if (page >= 1 && page <= boardPage.value.totalPages) {
    currentPage.value = page;
    loadBoards();
  }
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedBoards.value = boardPage.value.list.map((board) => board.bno);
  } else {
    selectedBoards.value = [];
  }
};

const viewBoardDetail = (board) => {
  selectedBoard.value = board;
};

const editBoard = (board) => {
  selectedBoard.value = null;
  router.push({ name: "board-edit", params: { bno: board.bno } });
};

const confirmDeleteBoard = (board) => {
  if (confirm(`정말로 '${board.title}' 게시글을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
    deleteBoard(board.bno);
  }
};

const deleteBoard = async (bno) => {
  try {
    await apiClient.delete(`/admin/boards/${bno}`);
    alert("게시글이 성공적으로 삭제되었습니다.");
    selectedBoard.value = null;
    loadBoards();
  } catch (error) {
    console.error("게시글 삭제 중 오류:", error);
    alert("게시글 삭제에 실패했습니다.");
  }
};

const bulkDeleteBoards = async () => {
  if (selectedBoards.value.length === 0) return;

  if (
    !confirm(
      `선택된 ${selectedBoards.value.length}개의 게시글을 정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
    )
  ) {
    return;
  }

  try {
    for (const bno of selectedBoards.value) {
      await apiClient.delete(`/admin/boards/${bno}`);
    }
    alert("선택된 게시글들이 성공적으로 삭제되었습니다.");
    selectedBoards.value = [];
    loadBoards();
  } catch (error) {
    console.error("일괄 게시글 삭제 중 오류:", error);
    alert("게시글 삭제에 실패했습니다.");
  }
};

const exportBoards = () => {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    "번호,제목,작성자,조회수,작성일\n" +
    boardPage.value.list
      .map(
        (board) => `${board.bno},"${board.title}",${board.writer},${board.viewCnt || 0},"${formatDate(board.regDate)}"`
      )
      .join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `boards_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

onMounted(() => {
  loadBoards();
});
</script>

<style scoped>
.avatar {
  width: 28px;
  height: 28px;
}

.avatar-sm {
  width: 24px;
  height: 24px;
}

.avatar-initial {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 0.75rem;
}

.bg-label-info {
  background-color: #17a2b8 !important;
}

.card {
  border: none;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.btn-group .btn {
  border-radius: 0.375rem;
  margin-right: 0.125rem;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

.modal.show {
  display: block !important;
}

.pagination .page-link {
  color: #5a5c69;
  border: 1px solid #dddfeb;
}

.pagination .page-item.active .page-link {
  background-color: #5a5c69;
  border-color: #5a5c69;
}

.alert-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
}

@media (max-width: 768px) {
  .btn-group {
    flex-direction: column;
  }

  .btn-group .btn {
    margin-bottom: 0.125rem;
    margin-right: 0;
  }

  .table-responsive {
    font-size: 0.875rem;
  }
}
</style>
