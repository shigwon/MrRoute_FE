<!-- src/views/notice/NoticeDetailView.vue -->
<template>
    <div class="notice-detail-view">
      <div class="container py-4">
        <div class="card">
          <div class="card-header bg-white">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="notice-title-section">
                <h2 class="mb-2">
                  <i v-if="notice.isImportant" class="fas fa-star text-warning me-2"></i>
                  {{ notice.title }}
                </h2>
                <div class="notice-badges">
                  <span v-if="notice.isImportant" class="badge bg-danger me-2">중요</span>
                  <span v-if="isNew(notice.regDate)" class="badge bg-success">NEW</span>
                </div>
              </div>
              <div class="badge bg-primary">조회수: {{ notice.viewCnt }}</div>
            </div>
            
            <div class="notice-meta">
              <div class="row">
                <div class="col-md-6">
                  <span class="me-3">
                    <i class="fas fa-user text-muted me-1"></i>
                    작성자: {{ notice.writer }}
                  </span>
                </div>
                <div class="col-md-6 text-end">
                  <span>
                    <i class="far fa-clock text-muted me-1"></i>
                    {{ formatDateTime(notice.regDate) }}
                  </span>
                </div>
              </div>
              
              <!-- 공지 기간 표시 -->
              <div v-if="notice.startDate || notice.endDate" class="notice-period mt-2">
                <i class="fas fa-calendar-alt text-info me-1"></i>
                <span class="text-info">
                  공지 기간: 
                  {{ notice.startDate ? formatDate(notice.startDate) : '제한없음' }} ~ 
                  {{ notice.endDate ? formatDate(notice.endDate) : '제한없음' }}
                </span>
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
              <!-- 공지사항 내용 -->
              <div class="notice-content mb-4">
                <div v-html="formatContent(notice.content)"></div>
              </div>
  
              <!-- 버튼 그룹 -->
              <div class="notice-actions">
                <div class="d-flex justify-content-between mt-4">
                  <router-link to="/notices" class="btn btn-secondary">
                    <i class="fas fa-list"></i> 목록
                  </router-link>
  
                  <div v-if="authStore.isAdmin" class="admin-actions">
                    <router-link 
                      :to="`/notices/edit/${notice.nno}`" 
                      class="btn btn-primary me-2">
                      <i class="fas fa-edit"></i> 수정
                    </router-link>
                    <button 
                      class="btn btn-danger" 
                      @click="confirmDelete">
                      <i class="fas fa-trash"></i> 삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 다른 공지사항 -->
        <div v-if="recentNotices.length > 0" class="mt-4">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="mb-0">다른 공지사항</h5>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <router-link
                  v-for="recentNotice in recentNotices"
                  :key="recentNotice.nno"
                  :to="`/notices/${recentNotice.nno}`"
                  class="list-group-item list-group-item-action"
                  :class="{ active: recentNotice.nno === notice.nno }">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <i v-if="recentNotice.isImportant" class="fas fa-star text-warning me-2"></i>
                      {{ recentNotice.title }}
                      <span v-if="isNew(recentNotice.regDate)" class="badge bg-success ms-2">NEW</span>
                    </div>
                    <small class="text-muted">{{ formatDate(recentNotice.regDate) }}</small>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/auth";
  import noticeAPI from "@/api/notice";
  
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  
  // 상태 관리
  const notice = ref({});
  const recentNotices = ref([]);
  const loading = ref(true);
  
  // 메서드
  const fetchNoticeDetail = async () => {
    try {
      loading.value = true;
      const nno = parseInt(route.params.nno);
  
      if (isNaN(nno)) {
        throw new Error("유효하지 않은 공지사항 번호입니다.");
      }
  
      const response = await noticeAPI.getNoticeDetail(nno);
      notice.value = response.data;
    } catch (error) {
      console.error("공지사항 상세 정보 조회 오류:", error);
      alert("공지사항을 불러올 수 없습니다.");
      router.push("/notices");
    } finally {
      loading.value = false;
    }
  };
  
  const fetchRecentNotices = async () => {
    try {
      const response = await noticeAPI.getRecentNotices(5);
      recentNotices.value = response.data || [];
    } catch (error) {
      console.error("최근 공지사항 조회 오류:", error);
    }
  };
  
  const confirmDelete = async () => {
    if (confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      try {
        await noticeAPI.deleteNotice(notice.value.nno);
        alert("공지사항이 삭제되었습니다.");
        router.push("/notices");
      } catch (error) {
        console.error("공지사항 삭제 오류:", error);
        alert("공지사항 삭제에 실패했습니다.");
      }
    }
  };
  
  const formatContent = (content) => {
    if (!content) return "";
    
    // 줄바꿈을 <br>로 변환
    return content
      .replace(/\n/g, "<br>")
      // URL을 링크로 변환
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  };
  
  const formatDateTime = (dateStr) => {
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
  
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
  
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };
  
  const isNew = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  onMounted(() => {
    fetchNoticeDetail();
    fetchRecentNotices();
  });
  </script>
  
  <style scoped>
  .notice-detail-view .card {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: none;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .notice-detail-view .card-header {
    border-bottom: 1px solid #eee;
    padding: 2rem;
  }
  
  .notice-detail-view .card-body {
    padding: 2rem;
  }
  
  .notice-title-section h2 {
    color: #333;
    line-height: 1.4;
  }
  
  .notice-badges {
    margin-bottom: 1rem;
  }
  
  .notice-meta {
    border-top: 1px solid #eee;
    padding-top: 1rem;
    font-size: 0.95rem;
    color: #6c757d;
  }
  
  .notice-period {
    font-size: 0.9rem;
  }
  
  .notice-content {
    min-height: 200px;
    line-height: 1.8;
    font-size: 1.1rem;
    color: #333;
  }
  
  .notice-content :deep(a) {
    color: #0d6efd;
    text-decoration: none;
  }
  
  .notice-content :deep(a:hover) {
    text-decoration: underline;
  }
  
  .notice-actions {
    border-top: 1px solid #eee;
    padding-top: 1.5rem;
  }
  
  .admin-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .list-group-item.active {
    background-color: #e3f2fd;
    border-color: #2196f3;
    color: #1976d2;
  }
  
  .list-group-item.active .fas {
    color: #ff9800;
  }
  </style>