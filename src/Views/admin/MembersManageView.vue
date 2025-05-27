<!-- src/views/admin/MembersManageView.vue -->
<template>
  <div class="members-manage-view">
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3">회원 관리</h1>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" @click="exportMembers">
            <i class="fas fa-download me-1"></i>내보내기
          </button>
          <button class="btn btn-primary" @click="refreshMembers"><i class="fas fa-sync-alt me-1"></i>새로고침</button>
        </div>
      </div>

      <!-- 검색 및 필터 -->
      <div class="card shadow mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <div class="form-group">
                <label>검색 조건</label>
                <select v-model="searchKey" class="form-select">
                  <option value="">전체</option>
                  <option value="id">아이디</option>
                  <option value="name">이름</option>
                  <option value="address">주소</option>
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
                  @keyup.enter="searchMembers"
                />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group">
                <label>권한</label>
                <select v-model="roleFilter" class="form-select">
                  <option value="">전체</option>
                  <option value="member">일반회원</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group">
                <label>&nbsp;</label>
                <button @click="searchMembers" class="btn btn-primary w-100">
                  <i class="fas fa-search me-1"></i>검색
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 회원 목록 -->
      <div class="card shadow">
        <div class="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 class="m-0 font-weight-bold text-primary">회원 목록 ({{ memberPage.totalItems }}명)</h6>
          <div class="d-flex gap-2">
            <span class="badge bg-primary">일반회원: {{ memberCount }}명</span>
            <span class="badge bg-danger">관리자: {{ adminCount }}명</span>
          </div>
        </div>

        <div class="card-body">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">회원 정보를 불러오는 중...</p>
          </div>

          <div v-else-if="memberPage.list.length === 0" class="text-center py-5 text-muted">
            <i class="fas fa-members fa-3x mb-3"></i>
            <p>조건에 맞는 회원이 없습니다.</p>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>
                    <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="form-check-input" />
                  </th>
                  <th>아이디</th>
                  <th>이름</th>
                  <th>주소</th>
                  <th>전화번호</th>
                  <th>권한</th>

                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="member in memberPage.list"
                  :key="member.id"
                  :class="{ 'table-warning': selectedMembers.includes(member.id) }"
                >
                  <td>
                    <input
                      type="checkbox"
                      :value="member.id"
                      v-model="selectedMembers"
                      :disabled="member.id === currentmemberId"
                      class="form-check-input"
                    />
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar avatar-sm me-2">
                        <div class="avatar-initial rounded-circle bg-label-primary">
                          {{ member.name.charAt(0) }}
                        </div>
                      </div>
                      <strong>{{ member.id }}</strong>
                    </div>
                  </td>
                  <td>{{ member.name }}</td>
                  <td>
                    <span class="text-muted" style="font-size: 0.875rem">
                      {{ member.address || "-" }}
                    </span>
                  </td>
                  <td>{{ member.tel || "-" }}</td>
                  <td>
                    <select
                      :value="member.role || 'member'"
                      @change="changeRole(member.id, $event.target.value)"
                      :disabled="member.id === currentmemberId"
                      class="form-select form-select-sm"
                      :class="member.role === 'admin' ? 'text-danger' : 'text-primary'"
                    >
                      <option value="member">일반회원</option>
                      <option value="admin">관리자</option>
                    </select>
                  </td>

                  <td>
                    <div class="btn-group" role="group">
                      <button class="btn btn-sm btn-outline-info" @click="viewMemberDetail(member)" title="상세보기">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        @click="confirmDeleteMember(member)"
                        :disabled="member.id === currentmemberId"
                        title="삭제"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 선택된 회원 일괄 작업 -->
          <div
            v-if="selectedMembers.length > 0"
            class="alert alert-info d-flex justify-content-between align-items-center"
          >
            <div>
              <i class="fas fa-info-circle me-2"></i>
              {{ selectedMembers.length }}명이 선택되었습니다.
            </div>
            <div class="btn-group">
              <button class="btn btn-sm btn-warning" @click="bulkChangeRole('member')">
                <i class="fas fa-member me-1"></i>일반회원으로 변경
              </button>
              <button class="btn btn-sm btn-danger" @click="bulkDeleteMembers">
                <i class="fas fa-trash me-1"></i>선택 삭제
              </button>
            </div>
          </div>

          <!-- 페이지네이션 -->
          <nav v-if="memberPage.totalPages > 1" aria-label="회원 목록 페이지네이션">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: !memberPage.hasPre }">
                <button class="page-link" @click="changePage(1)" :disabled="!memberPage.hasPre">
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

              <li class="page-item" :class="{ disabled: currentPage === memberPage.totalPages }">
                <button
                  class="page-link"
                  @click="changePage(currentPage + 1)"
                  :disabled="currentPage === memberPage.totalPages"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: !memberPage.hasNext }">
                <button class="page-link" @click="changePage(memberPage.totalPages)" :disabled="!memberPage.hasNext">
                  <i class="fas fa-angle-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- 회원 상세 정보 모달 -->
    <div v-if="selectedMember" class="modal show d-block" tabindex="-1" style="background-color: rgba(0, 0, 0, 0.5)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">회원 상세 정보</h5>
            <button type="button" class="btn-close" @click="selectedMemberPage = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">아이디</label>
                  <input type="text" class="form-control" :value="selectedMember.id" readonly />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">이름</label>
                  <input type="text" class="form-control" :value="selectedMember.name" readonly />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">전화번호</label>
                  <input type="text" class="form-control" :value="selectedMember.tel || '-'" readonly />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">권한</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="selectedMember.role === 'admin' ? '관리자' : '일반회원'"
                    readonly
                  />
                </div>
              </div>
              <div class="col-12">
                <div class="form-group mb-3">
                  <label class="form-label">주소</label>
                  <textarea class="form-control" rows="2" :value="selectedMember.address || '-'" readonly></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="selectedMember = null">닫기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import apiClient from "@/api";

const authStore = useAuthStore();

// 상태 관리
const memberPage = ref({
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
const roleFilter = ref("");
const selectedMembers = ref([]);
const selectAll = ref(false);
const selectedMember = ref(null);

// 계산된 속성
const currentmemberId = computed(() => authStore.member?.id);
const memberCount = computed(() => memberPage.value.list.filter((m) => !m.role || m.role === "member").length);
const adminCount = computed(() => memberPage.value.list.filter((m) => m.role === "admin").length);

const displayPages = computed(() => {
  const maxDisplayPages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxDisplayPages / 2));
  let endPage = Math.min(memberPage.value.totalPages, startPage + maxDisplayPages - 1);

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
const loadMembers = async () => {
  try {
    loading.value = true;
    const params = {
      key: searchKey.value,
      word: searchWord.value,
      currentPage: currentPage.value,
    };

    const response = await apiClient.get("/admin/members", { params });
    memberPage.value = response.data;

    // 권한 필터 적용
    if (roleFilter.value) {
      memberPage.value.list = memberPage.value.list.filter((member) => {
        if (roleFilter.value === "member") {
          return !member.role || member.role === "member";
        }
        return member.role === roleFilter.value;
      });
    }

    selectedMembers.value = [];
    selectAll.value = false;
  } catch (error) {
    console.error("회원 목록 조회 중 오류:", error);
    if (error.response?.status === 403) {
      alert("관리자 권한이 필요합니다.");
      this.$router.push("/");
    }
  } finally {
    loading.value = false;
  }
};

const searchMembers = () => {
  currentPage.value = 1;
  loadMembers();
};

const refreshMembers = () => {
  loadMembers();
};

const changePage = (page) => {
  if (page >= 1 && page <= memberPage.value.totalPages) {
    currentPage.value = page;
    loadMembers();
  }
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedMembers.value = memberPage.value.list
      .filter((member) => member.id !== currentmemberId.value)
      .map((member) => member.id);
  } else {
    selectedMembers.value = [];
  }
};

const changeRole = async (memberId, newRole) => {
  if (memberId === currentmemberId.value) {
    alert("자신의 권한은 변경할 수 없습니다.");
    return;
  }

  if (!confirm(`해당 회원의 권한을 ${newRole === "admin" ? "관리자" : "일반회원"}로 변경하시겠습니까?`)) {
    return;
  }

  try {
    await apiClient.put(`/admin/members/${memberId}/role`, { role: newRole });
    alert("권한이 성공적으로 변경되었습니다.");
    loadMembers();
  } catch (error) {
    console.error("권한 변경 중 오류:", error);
    alert("권한 변경에 실패했습니다.");
    loadMembers();
  }
};

const confirmDeleteMember = (member) => {
  if (member.id === currentmemberId.value) {
    alert("자신의 계정은 삭제할 수 없습니다.");
    return;
  }

  if (confirm(`정말로 '${member.name}(${member.id})' 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
    deleteMember(member.id);
  }
};

const deleteMember = async (memberId) => {
  try {
    await apiClient.delete(`/admin/members/${memberId}`);
    alert("회원이 성공적으로 삭제되었습니다.");
    loadMembers();
  } catch (error) {
    console.error("회원 삭제 중 오류:", error);
    alert("회원 삭제에 실패했습니다.");
  }
};

const bulkDeleteMembers = async () => {
  if (selectedMembers.value.length === 0) return;

  if (
    !confirm(
      `선택된 ${selectedMembers.value.length}명의 회원을 정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
    )
  ) {
    return;
  }

  try {
    for (const memberId of selectedMembers.value) {
      await apiClient.delete(`/admin/members/${memberId}`);
    }
    alert("선택된 회원들이 성공적으로 삭제되었습니다.");
    selectedMembers.value = [];
    loadMembers();
  } catch (error) {
    console.error("일괄 회원 삭제 중 오류:", error);
    alert("회원 삭제에 실패했습니다.");
  }
};

const viewMemberDetail = (member) => {
  selectedMember.value = member;
};

const exportMembers = () => {
  // CSV 내보내기 로직
  const csvContent =
    "data:text/csv;charset=utf-8," +
    "아이디,이름,주소,전화번호,권한\n" +
    memberPage.value.list
      .map(
        (member) =>
          `${member.id},${member.name},"${member.address || ""}",${member.tel || ""},${
            member.role === "admin" ? "관리자" : "일반회원"
          }`
      )
      .join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `members_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formatDate = (timestamp) => {
  // timestamp를 날짜로 변환 (간단한 구현)
  const date = new Date(timestamp * 1000); // timestamp가 초 단위라고 가정
  return date.toLocaleDateString("ko-KR");
};

onMounted(() => {
  loadMembers();
});
</script>

<style scoped>
.avatar {
  width: 32px;
  height: 32px;
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

.bg-label-primary {
  background-color: #696cff !important;
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

.form-select-sm {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
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
