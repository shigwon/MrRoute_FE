<!-- src/views/notice/NoticeListView.vue -->
<template>
    <div class="notice-list-view">
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>공지사항</h1>
          <router-link 
            v-if="authStore.isAdmin" 
            to="/notices/write" 
            class="btn btn-primary">
            <i class="fas fa-pen"></i> 공지사항 작성
          </router-link>
        </div>
  
        <!-- 중요 공지사항 -->
        <div v-if="importantNotices.length > 0" class="important-notices mb-4">
          <h5 class="text-danger mb-3">
            <i class="fas fa-exclamation-triangle"></i> 중요 공지사항
          </h5>
          <div class="card border-danger">
            <div class="card-body">
              <div 
                v-for="notice in importantNotices" 
                :key="notice.nno"
                class="important-notice-item"
                @click="goToDetail(notice.nno)">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="notice-title">
                    <i class="fas fa-star text-warning me-2"></i>
                    {{ notice.title }}
                  </div>
                  <div class="notice-date text-muted">
                    {{ formatDate(notice.regDate) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 검색 -->
        <div class="search-container mb-3">
          <div class="row">
            <div class="col-md-6">
              <div class="input-group">
                <select v-model="searchKey" class="form-select" style="max-width: 120px">
                  <option value="1">제목</option>
                  <option value="2">내용</option>
                  <option value="3">작성자</option>
                </select>
                <input
                  type="text"
                  v-model="searchWord"
                  class="form-control"
                  placeholder="검색어 입력"
                  @keyup.enter="searchNotices"
                />
                <button class="btn btn-primary" @click="searchNotices">
                  <i class="fas fa-search"></i> 검색
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 공지사항 목록 -->
        <div class="notice-table-container">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">로딩중...</span>
            </div>
          </div>
  
          <div v-else-if="!noticeList || noticeList.length === 0" class="text-center py-5">
            <p class="text-muted">등록된 공지사항이 없습니다.</p>
          </div>
  
          <table v-else class="table table-hover">
            <thead class="table-light">
              <tr>
                <th style="width: 8%">번호</th>
                <th style="width: 50%">제목</th>
                <th style="width: 12%">작성자</th>
                <th style="width: 15%">작성일</th>
                <th style="width: 8%">조회수</th>
                <th v-if="authStore.isAdmin" style="width: 7%">관리</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="notice in noticeList" 
                :key="notice.nno" 
                @click="goToDetail(notice.nno)" 
                style="cursor: pointer"
                :class="{ 'table-warning': notice.isImportant }">
                <td>{{ notice.nno }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <i v-if="notice.isImportant" class="fas fa-star text-warning me-2"></i>
                    {{ notice.title }}
                    <span v-if="isNew(notice.regDate)" class="badge bg-danger ms-2">NEW</span>
                  </div>
                </td>
                <td>{{ notice.writer }}</td>
                <td>{{ formatDate(notice.regDate) }}</td>
                <td>{{ notice.viewCnt }}</td>
                <td v-if="authStore.isAdmin" @click.stop>
                  <div class="btn-group btn-group-sm">
                    <button 
                      class="btn btn-outline-primary btn-sm"
                      @click="editNotice(notice.nno)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger btn-sm"
                      @click="confirmDelete(notice.nno)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- 페이지네이션 -->
        <div v-if="totalPages > 0" class="pagination-container d-flex justify-content-center mt-4">
          <nav aria-label="Page navigation">
            <ul class="pagination">
              <li :class="['page-item', { disabled: currentPage === 1 }]">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                  <i class="fas fa-chevron-left"></i>
                </a>
              </li>
  
              <li v-for="page in displayPages" :key="page" :class="['page-item', { active: page === currentPage }]">
                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>
  
              <li :class="['page-item', { disabled: currentPage === totalPages }]">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                  <i class="fas fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/auth";
  import noticeAPI from "@/api/notice";
  
  const router = useRouter();
  const authStore = useAuthStore();
  
  // 상태 관리
  const loading = ref(true);
  const noticeList = ref([]);
  const importantNotices = ref([]);
  const searchKey = ref("1");
  const searchWord = ref("");
  const currentPage = ref(1);
  const totalItems = ref(0);
  const totalPages = ref(0);
  const itemsPerPage = ref(10);
  
  // 계산된 속성
  const displayPages = computed(() => {
    const pages = [];
    const maxPages = 5;
  
    let startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
    let endPage = startPage + maxPages - 1;
  
    if (endPage > totalPages.value) {
      endPage = totalPages.value;
      startPage = Math.max(1, endPage - maxPages + 1);
    }
  
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  
    return pages;
  });
  
  // 메서드
  const fetchNotices = async () => {
    try {
      loading.value = true;
  
      const params = {
        key: searchKey.value === "" ? null : searchKey.value,
        word: searchWord.value === "" ? null : searchWord.value,
        currentPage: currentPage.value,
      };
  
      const response = await noticeAPI.getNotices(params);
      const data = response.data;
  
      noticeList.value = data.list || [];
      totalItems.value = data.totalItems || 0;
      totalPages.value = data.totalPages || 0;
      currentPage.value = data.condition?.currentPage || 1;
      itemsPerPage.value = data.condition?.itemsPerPage || 10;
    } catch (error) {
      console.error("공지사항 목록 조회 오류:", error);
    } finally {
      loading.value = false;
    }
  };
  
  const fetchImportantNotices = async () => {
    try {
      const response = await noticeAPI.getImportantNotices();
      importantNotices.value = response.data || [];
    } catch (error) {
      console.error("중요 공지사항 조회 오류:", error);
    }
  };
  
  const searchNotices = () => {
    currentPage.value = 1;
    fetchNotices();
  };
  
  const changePage = (page) => {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
    fetchNotices();
  };
  
  const goToDetail = (nno) => {
    router.push(`/notices/${nno}`);
  };
  
  const editNotice = (nno) => {
    router.push(`/notices/edit/${nno}`);
  };
  
  const confirmDelete = async (nno) => {
    if (confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      try {
        await noticeAPI.deleteNotice(nno);
        alert("공지사항이 삭제되었습니다.");
        fetchNotices();
        fetchImportantNotices();
      } catch (error) {
        console.error("공지사항 삭제 오류:", error);
        alert("공지사항 삭제에 실패했습니다.");
      }
    }
  };
  
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
  
    const date = new Date(dateStr);
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  
    if (isToday) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\. /g, "-")
        .replace(".", "");
    }
  };
  
  const isNew = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3; // 3일 이내면 NEW 표시
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  onMounted(() => {
    fetchNotices();
    fetchImportantNotices();
  });
  </script>
  
  <style scoped>
  .notice-table-container {
    min-height: 400px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
  
  .table {
    margin-bottom: 0;
  }
  
  .table thead th {
    font-weight: 600;
    text-align: center;
  }
  
  .table tbody td {
    text-align: center;
    vertical-align: middle;
  }
  
  .table tbody td:nth-child(2) {
    text-align: left;
  }
  
  .important-notice-item {
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .important-notice-item:hover {
    background-color: #f8f9fa;
  }
  
  .important-notice-item:last-child {
    border-bottom: none;
  }
  
  .notice-title {
    font-weight: 500;
  }
  
  .pagination-container .pagination {
    margin-bottom: 0;
  }
  
  .pagination .page-item.active .page-link {
    background-color: #0d6efd;
    border-color: #0d6efd;
  }
  
  .pagination .page-link {
    color: #0d6efd;
  }
  </style>