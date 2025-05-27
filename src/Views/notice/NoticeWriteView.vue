<!-- src/views/notice/NoticeWriteView.vue -->
<template>
    <div class="notice-write-view">
      <div class="container py-4">
        <h1 class="mb-4">{{ isEdit ? "공지사항 수정" : "공지사항 작성" }}</h1>
  
        <div class="card">
          <div class="card-body">
            <form @submit.prevent="submitForm">
              <!-- 제목 -->
              <div class="mb-3">
                <label for="title" class="form-label">제목 *</label>
                <input
                  type="text"
                  class="form-control"
                  id="title"
                  v-model="noticeForm.title"
                  placeholder="공지사항 제목을 입력하세요"
                  required
                />
              </div>
  
              <!-- 공지사항 옵션 -->
              <div class="row mb-3">
                <div class="col-md-4">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="isImportant"
                      v-model="noticeForm.isImportant"
                    />
                    <label class="form-check-label text-danger" for="isImportant">
                      <i class="fas fa-star"></i> 중요 공지사항
                    </label>
                  </div>
                </div>
                <div class="col-md-4">
                  <label for="priority" class="form-label">우선순위</label>
                  <select id="priority" v-model="noticeForm.priority" class="form-select">
                    <option value="0">일반 (0)</option>
                    <option value="1">낮음 (1)</option>
                    <option value="2">보통 (2)</option>
                    <option value="3">높음 (3)</option>
                    <option value="4">긴급 (4)</option>
                    <option value="5">최고 (5)</option>
                  </select>
                </div>
              </div>
  
              <!-- 공지 기간 -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="startDate" class="form-label">공지 시작일</label>
                  <input
                    type="date"
                    class="form-control"
                    id="startDate"
                    v-model="noticeForm.startDate"
                  />
                  <div class="form-text">설정하지 않으면 즉시 공개됩니다.</div>
                </div>
                <div class="col-md-6">
                  <label for="endDate" class="form-label">공지 종료일</label>
                  <input
                    type="date"
                    class="form-control"
                    id="endDate"
                    v-model="noticeForm.endDate"
                  />
                  <div class="form-text">설정하지 않으면 계속 공개됩니다.</div>
                </div>
              </div>
  
              <!-- 내용 -->
              <div class="mb-4">
                <label for="content" class="form-label">내용 *</label>
                <textarea
                  class="form-control"
                  id="content"
                  v-model="noticeForm.content"
                  rows="15"
                  placeholder="공지사항 내용을 입력하세요"
                  required
                ></textarea>
                <div class="form-text">
                  URL은 자동으로 링크로 변환됩니다. 줄바꿈은 그대로 표시됩니다.
                </div>
              </div>
  
              <!-- 미리보기 -->
              <div class="mb-4">
                <button 
                  type="button" 
                  class="btn btn-outline-info mb-3" 
                  @click="togglePreview">
                  <i class="fas fa-eye"></i> {{ showPreview ? '미리보기 숨기기' : '미리보기' }}
                </button>
                
                <div v-if="showPreview" class="preview-container">
                  <div class="card">
                    <div class="card-header">
                      <h5 class="mb-0">
                        <i v-if="noticeForm.isImportant" class="fas fa-star text-warning me-2"></i>
                        {{ noticeForm.title || '제목을 입력하세요' }}
                      </h5>
                      <div class="mt-2">
                        <span v-if="noticeForm.isImportant" class="badge bg-danger me-2">중요</span>
                        <span class="badge bg-secondary">우선순위: {{ noticeForm.priority }}</span>
                      </div>
                    </div>
                    <div class="card-body">
                      <div v-html="formatPreviewContent(noticeForm.content)"></div>
                    </div>
                  </div>
                </div>
              </div>
  
              <!-- 버튼 그룹 -->
              <div class="d-flex justify-content-between">
                <router-link to="/notices" class="btn btn-secondary">
                  <i class="fas fa-times"></i> 취소
                </router-link>
                
                <div>
                  <button 
                    type="button" 
                    class="btn btn-outline-primary me-2"
                    @click="saveDraft">
                    <i class="fas fa-save"></i> 임시저장
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    :disabled="isSubmitting">
                    <i class="fas fa-check"></i> 
                    {{ isEdit ? "수정하기" : "등록하기" }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/auth";
  import noticeAPI from "@/api/notice";
  
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  
  // 상태 관리
  const noticeForm = ref({
    title: "",
    content: "",
    isImportant: false,
    priority: 0,
    startDate: "",
    endDate: "",
  });
  
  const isSubmitting = ref(false);
  const showPreview = ref(false);
  const isEdit = computed(() => !!route.params.nno);
  
  // 권한 체크 (관리자만 접근 가능)
  if (!authStore.isAdmin) {
    alert("관리자만 접근할 수 있습니다.");
    router.push("/notices");
  }
  
  // 수정 모드일 경우 데이터 불러오기
  const fetchNoticeDetail = async () => {
    if (!isEdit.value) return;
  
    try {
      const nno = parseInt(route.params.nno);
      const response = await noticeAPI.getNoticeDetail(nno);
      const notice = response.data;
  
      noticeForm.value = {
        title: notice.title,
        content: notice.content,
        isImportant: notice.isImportant || false,
        priority: notice.priority || 0,
        startDate: notice.startDate || "",
        endDate: notice.endDate || "",
      };
    } catch (error) {
      console.error("공지사항 정보 조회 오류:", error);
      alert("공지사항 정보를 불러올 수 없습니다.");
      router.push("/notices");
    }
  };
  
  // 폼 제출 처리
  const submitForm = async () => {
    try {
      isSubmitting.value = true;
  
      // 날짜 유효성 검사
      if (noticeForm.value.startDate && noticeForm.value.endDate) {
        if (new Date(noticeForm.value.startDate) > new Date(noticeForm.value.endDate)) {
          alert("시작일이 종료일보다 늦을 수 없습니다.");
          return;
        }
      }
  
      if (isEdit.value) {
        // 공지사항 수정
        const nno = parseInt(route.params.nno);
        await noticeAPI.updateNotice(nno, noticeForm.value);
        alert("공지사항이 수정되었습니다.");
        router.push(`/notices/${nno}`);
      } else {
        // 공지사항 등록
        await noticeAPI.createNotice(noticeForm.value);
        alert("공지사항이 등록되었습니다.");
        router.push("/notices");
      }
    } catch (error) {
      console.error("공지사항 저장 오류:", error);
      alert(isEdit.value ? "공지사항 수정에 실패했습니다." : "공지사항 등록에 실패했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };
  
  // 임시저장
  const saveDraft = () => {
    const draftKey = isEdit.value ? `notice_draft_${route.params.nno}` : 'notice_draft_new';
    localStorage.setItem(draftKey, JSON.stringify(noticeForm.value));
    alert("임시저장되었습니다.");
  };
  
  // 임시저장 불러오기
  const loadDraft = () => {
    const draftKey = isEdit.value ? `notice_draft_${route.params.nno}` : 'notice_draft_new';
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft && confirm("임시저장된 내용이 있습니다. 불러오시겠습니까?")) {
      noticeForm.value = { ...noticeForm.value, ...JSON.parse(savedDraft) };
    }
  };
  
  // 미리보기 토글
  const togglePreview = () => {
    showPreview.value = !showPreview.value;
  };
  
  // 미리보기 콘텐츠 포맷
  const formatPreviewContent = (content) => {
    if (!content) return "내용을 입력하세요...";
    
    return content
      .replace(/\n/g, "<br>")
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  };
  
  // 페이지 떠날 때 경고 함수
  const beforeUnloadHandler = (e) => {
    if (noticeForm.value.title || noticeForm.value.content) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  
  // 컴포넌트 마운트 시 실행
  onMounted(() => {
    if (isEdit.value) {
      fetchNoticeDetail();
    } else {
      // 새 글 작성 시 임시저장 확인
      loadDraft();
    }
    
    // 페이지 떠날 때 경고 이벤트 추가
    window.addEventListener('beforeunload', beforeUnloadHandler);
  });
  
  // 컴포넌트 언마운트 시 이벤트 제거
  onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
  });
  </script>
  
  <style scoped>
  .notice-write-view .card {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: none;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .notice-write-view .form-control:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  }
  
  .notice-write-view textarea {
    resize: vertical;
    min-height: 400px;
    font-family: inherit;
  }
  
  .preview-container {
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    background-color: #f8f9fa;
  }
  
  .preview-container .card {
    margin: 0;
  }
  
  .form-check-label {
    font-weight: 500;
  }
  
  .btn-group {
    gap: 0.5rem;
  }
  
  /* 중요 공지사항 체크박스 스타일 */
  .form-check-input:checked {
    background-color: #dc3545;
    border-color: #dc3545;
  }
  
  /* 우선순위 선택박스 스타일 */
  .form-select option[value="4"],
  .form-select option[value="5"] {
    font-weight: bold;
    color: #dc3545;
  }
  
  /* 미리보기 스타일 */
  .preview-container :deep(a) {
    color: #0d6efd;
    text-decoration: none;
  }
  
  .preview-container :deep(a:hover) {
    text-decoration: underline;
  }
  </style>