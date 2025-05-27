<!-- src/views/PlanListView.vue -->
<template>
  <div class="plan-list-view">
    <div class="container py-4">
      <!-- 헤더 섹션 -->
      <div class="page-header">
        <div class="d-flex justify-content-between align-items-center" style="flex-direction: column">
          <div>
            <h1 class="mb-2">✈️ 나의 여행 계획</h1>
            <p class="text-muted mb-0">당신의 특별한 여행을 계획하고 관리하세요</p>
          </div>
          <router-link to="/plans/create" class="btn btn-primary btn-lg">
            <i class="fas fa-plus me-2"></i>새 여행 계획
          </router-link>
        </div>
      </div>

      <!-- 필터 및 정렬 -->
      <div class="filters-section">
        <div class="row align-items-center">
          <div class="col-md-6">
            <div class="search-box">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  v-model="searchQuery"
                  class="form-control"
                  placeholder="여행 제목으로 검색..."
                  @input="filterPlans"
                />
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex justify-content-end align-items-center gap-3">
              <div class="filter-group">
                <label class="form-label small mb-1">상태</label>
                <select v-model="statusFilter" class="form-select form-select-sm" @change="filterPlans">
                  <option value="">전체</option>
                  <option value="upcoming">예정된 여행</option>
                  <option value="ongoing">진행 중</option>
                  <option value="completed">완료된 여행</option>
                </select>
              </div>
              <div class="filter-group">
                <label class="form-label small mb-1">정렬</label>
                <select v-model="sortBy" class="form-select form-select-sm" @change="sortPlans">
                  <option value="newest">최신순</option>
                  <option value="oldest">오래된순</option>
                  <option value="startDate">출발일순</option>
                  <option value="title">제목순</option>
                </select>
              </div>
              <div class="view-toggle">
                <label class="form-label small mb-1">보기</label>
                <div class="btn-group" role="group">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    :class="{ active: viewMode === 'grid' }"
                    @click="viewMode = 'grid'"
                  >
                    <i class="fas fa-th"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    :class="{ active: viewMode === 'list' }"
                    @click="viewMode = 'list'"
                  >
                    <i class="fas fa-list"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-section">
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem">
            <span class="visually-hidden">로딩중...</span>
          </div>
          <p class="mt-3 text-muted">여행 계획을 불러오는 중...</p>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="!filteredPlans || filteredPlans.length === 0" class="empty-state">
        <div class="text-center py-5">
          <div class="empty-icon">
            <i class="fas fa-map-marked-alt"></i>
          </div>
          <h3 class="mb-3">
            {{ searchQuery || statusFilter ? "검색 결과가 없습니다" : "아직 여행 계획이 없습니다" }}
          </h3>
          <p class="text-muted mb-4">
            {{
              searchQuery || statusFilter
                ? "다른 검색어나 필터를 시도해보세요"
                : "첫 번째 여행 계획을 만들어 특별한 추억을 시작하세요!"
            }}
          </p>
          <router-link v-if="!searchQuery && !statusFilter" to="/plans/create" class="btn btn-primary btn-lg">
            <i class="fas fa-plus me-2"></i>첫 여행 계획 만들기
          </router-link>
          <button v-else class="btn btn-outline-secondary" @click="clearFilters">
            <i class="fas fa-times me-2"></i>필터 초기화
          </button>
        </div>
      </div>

      <!-- 그리드 뷰 -->
      <div v-else-if="viewMode === 'grid'" class="plans-grid">
        <div class="row">
          <div v-for="plan in filteredPlans" :key="plan.planId" class="col-lg-4 col-md-6 mb-4">
            <div class="plan-card" @click="goToPlanDetail(plan.planId)">
              <!-- 상태 배지 -->
              <div class="plan-status">
                <span class="badge" :class="getStatusBadgeClass(plan)">
                  {{ getStatusText(plan) }}
                </span>
              </div>

              <!-- 계획 이미지 -->
              <div class="plan-image">
                <img :src="getPlanImage(plan)" :alt="plan.title" @error="handleImageError" />
                <div class="plan-overlay">
                  <div class="plan-duration">
                    <i class="fas fa-calendar-alt me-1"></i>
                    {{ calculateDuration(plan) }}일
                  </div>
                </div>
              </div>

              <!-- 계획 정보 -->
              <div class="plan-content">
                <h5 class="plan-title">{{ plan.title }}</h5>
                <p class="plan-description">{{ plan.description || "설명이 없습니다." }}</p>

                <div class="plan-dates">
                  <div class="date-item">
                    <i class="fas fa-play text-success me-1"></i>
                    <small>{{ formatDate(plan.startDate) }}</small>
                  </div>
                  <div class="date-item">
                    <i class="fas fa-stop text-danger me-1"></i>
                    <small>{{ formatDate(plan.endDate) }}</small>
                  </div>
                </div>

                <div class="plan-stats">
                  <div class="stat-item">
                    <i class="fas fa-map-marker-alt text-primary me-1"></i>
                    <span>{{ getPlacesCount(plan) }}개 장소</span>
                  </div>
                  <div class="stat-item">
                    <i class="fas fa-clock text-info me-1"></i>
                    <span>{{ getDaysUntilTrip(plan) }}</span>
                  </div>
                </div>
              </div>

              <!-- 액션 버튼 -->
              <div class="plan-actions">
                <button class="btn btn-sm btn-outline-primary" @click.stop="goToPlanDetail(plan.planId)">
                  <i class="fas fa-eye me-1"></i>보기
                </button>
                <button class="btn btn-sm btn-outline-secondary" @click.stop="goToPlanEdit(plan.planId)">
                  <i class="fas fa-edit me-1"></i>수정
                </button>
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    type="button"
                    :id="`dropdownMenuButton${plan.planId}`"
                    data-bs-toggle="dropdown"
                    @click.stop
                  >
                    <i class="fas fa-ellipsis-h"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="sharePlan(plan)">
                        <i class="fas fa-share-alt me-2"></i>공유하기
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="duplicatePlan(plan)">
                        <i class="fas fa-copy me-2"></i>복사하기
                      </a>
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                      <a class="dropdown-item text-danger" href="#" @click.prevent="deletePlan(plan)">
                        <i class="fas fa-trash me-2"></i>삭제하기
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 리스트 뷰 -->
      <div v-else class="plans-list">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th style="width: 40%">여행 계획</th>
                <th style="width: 15%">기간</th>
                <th style="width: 15%">일정</th>
                <th style="width: 15%">상태</th>
                <th style="width: 15%">관리</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plan in filteredPlans" :key="plan.planId" class="plan-row">
                <td>
                  <div class="plan-info" @click="goToPlanDetail(plan.planId)">
                    <div class="d-flex align-items-center">
                      <img
                        :src="getPlanImage(plan)"
                        :alt="plan.title"
                        class="plan-thumbnail me-3"
                        @error="handleImageError"
                      />
                      <div>
                        <h6 class="mb-1">{{ plan.title }}</h6>
                        <p class="text-muted mb-0 small">{{ plan.description || "설명이 없습니다." }}</p>
                        <div class="text-muted small">
                          <i class="fas fa-map-marker-alt me-1"></i>
                          {{ getPlacesCount(plan) }}개 장소
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="text-nowrap">
                    <div class="fw-bold">{{ calculateDuration(plan) }}일</div>
                    <small class="text-muted"
                      >{{ formatDateShort(plan.startDate) }} ~ {{ formatDateShort(plan.endDate) }}</small
                    >
                  </div>
                </td>
                <td>
                  <div class="progress-info">
                    <div class="fw-bold">{{ getCompletedDays(plan) }}/{{ calculateDuration(plan) }}</div>
                    <div class="progress progress-sm">
                      <div
                        class="progress-bar"
                        :style="{ width: getProgressPercentage(plan) + '%' }"
                        :class="getProgressBarClass(plan)"
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge" :class="getStatusBadgeClass(plan)">
                    {{ getStatusText(plan) }}
                  </span>
                  <div class="text-muted small mt-1">
                    {{ getDaysUntilTrip(plan) }}
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      class="btn btn-sm btn-outline-primary me-1"
                      @click="goToPlanDetail(plan.planId)"
                      title="상세보기"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-secondary me-1"
                      @click="goToPlanEdit(plan.planId)"
                      title="수정하기"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <div class="dropdown d-inline">
                      <button
                        class="btn btn-sm btn-outline-secondary dropdown-toggle"
                        type="button"
                        :id="`listDropdown${plan.planId}`"
                        data-bs-toggle="dropdown"
                      >
                        <i class="fas fa-ellipsis-h"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li>
                          <a class="dropdown-item" href="#" @click.prevent="sharePlan(plan)">
                            <i class="fas fa-share-alt me-2"></i>공유하기
                          </a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="#" @click.prevent="duplicatePlan(plan)">
                            <i class="fas fa-copy me-2"></i>복사하기
                          </a>
                        </li>
                        <li><hr class="dropdown-divider" /></li>
                        <li>
                          <a class="dropdown-item text-danger" href="#" @click.prevent="deletePlan(plan)">
                            <i class="fas fa-trash me-2"></i>삭제하기
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="pagination-section">
        <nav aria-label="여행 계획 페이지네이션">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                <i class="fas fa-chevron-left"></i>
              </a>
            </li>
            <li v-for="page in displayPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                <i class="fas fa-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <!-- 통계 정보 -->
      <div v-if="plans.length > 0" class="stats-section">
        <div class="row">
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-calendar-check text-success"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ completedTripsCount }}</div>
                <div class="stat-label">완료된 여행</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-clock text-warning"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ upcomingTripsCount }}</div>
                <div class="stat-label">예정된 여행</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-map-marked-alt text-primary"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ totalPlacesCount }}</div>
                <div class="stat-label">총 방문 장소</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-calendar-alt text-info"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ totalDaysCount }}</div>
                <div class="stat-label">총 여행 일수</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import planAPI from "@/api/plan";

const router = useRouter();
const authStore = useAuthStore();

// 상태 관리
const loading = ref(true);
const plans = ref([]);
const searchQuery = ref("");
const statusFilter = ref("");
const sortBy = ref("newest");
const viewMode = ref("grid");
const currentPage = ref(1);
const itemsPerPage = ref(9);

// 계산된 속성
const filteredPlans = computed(() => {
  let filtered = [...plans.value];

  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (plan) =>
        plan.title.toLowerCase().includes(query) || (plan.description && plan.description.toLowerCase().includes(query))
    );
  }

  // 상태 필터
  if (statusFilter.value) {
    filtered = filtered.filter((plan) => {
      const status = getPlanStatus(plan);
      return status === statusFilter.value;
    });
  }

  // 정렬
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "startDate":
        return new Date(a.startDate) - new Date(b.startDate);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredPlans.value.length / itemsPerPage.value);
});

const displayPages = computed(() => {
  const pages = [];
  const maxDisplayPages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxDisplayPages / 2));
  let endPage = Math.min(totalPages.value, startPage + maxDisplayPages - 1);

  if (endPage - startPage + 1 < maxDisplayPages) {
    startPage = Math.max(1, endPage - maxDisplayPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

// 통계 계산
const completedTripsCount = computed(() => {
  return plans.value.filter((plan) => getPlanStatus(plan) === "completed").length;
});

const upcomingTripsCount = computed(() => {
  return plans.value.filter((plan) => getPlanStatus(plan) === "upcoming").length;
});

const totalPlacesCount = computed(() => {
  return plans.value.reduce((total, plan) => total + getPlacesCount(plan), 0);
});

const totalDaysCount = computed(() => {
  return plans.value.reduce((total, plan) => total + calculateDuration(plan), 0);
});

// 메서드
const fetchPlans = async () => {
  try {
    loading.value = true;
    const response = await planAPI.getUserPlans();
    plans.value = response.data || [];
  } catch (error) {
    console.error("여행 계획 목록 조회 중 오류 발생:", error);
    plans.value = [];
  } finally {
    loading.value = false;
  }
};

const getPlanStatus = (plan) => {
  const today = new Date();
  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);

  if (today < startDate) {
    return "upcoming";
  } else if (today >= startDate && today <= endDate) {
    return "ongoing";
  } else {
    return "completed";
  }
};

const getStatusText = (plan) => {
  const status = getPlanStatus(plan);
  switch (status) {
    case "upcoming":
      return "예정됨";
    case "ongoing":
      return "진행 중";
    case "completed":
      return "완료됨";
    default:
      return "알 수 없음";
  }
};

const getStatusBadgeClass = (plan) => {
  const status = getPlanStatus(plan);
  switch (status) {
    case "upcoming":
      return "bg-warning text-dark";
    case "ongoing":
      return "bg-success";
    case "completed":
      return "bg-secondary";
    default:
      return "bg-light text-dark";
  }
};

const calculateDuration = (plan) => {
  if (!plan.startDate || !plan.endDate) return 0;
  const start = new Date(plan.startDate);
  const end = new Date(plan.endDate);
  const diffTime = Math.abs(end - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const getPlacesCount = (plan) => {
  return plan.details ? plan.details.length : 0;
};

const getDaysUntilTrip = (plan) => {
  const today = new Date();
  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);

  if (today < startDate) {
    const diffTime = startDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays}일 후 출발`;
  } else if (today >= startDate && today <= endDate) {
    return "진행 중";
  } else {
    const diffTime = today - endDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays}일 전 완료`;
  }
};

const getCompletedDays = (plan) => {
  const today = new Date();
  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);

  if (today < startDate) {
    return 0;
  } else if (today >= startDate && today <= endDate) {
    const diffTime = today - startDate;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  } else {
    return calculateDuration(plan);
  }
};

const getProgressPercentage = (plan) => {
  const completed = getCompletedDays(plan);
  const total = calculateDuration(plan);
  return total > 0 ? (completed / total) * 100 : 0;
};

const getProgressBarClass = (plan) => {
  const status = getPlanStatus(plan);
  switch (status) {
    case "upcoming":
      return "bg-warning";
    case "ongoing":
      return "bg-success";
    case "completed":
      return "bg-secondary";
    default:
      return "bg-light";
  }
};

const getPlanImage = (plan) => {
  // 계획에 포함된 관광지 중 첫 번째 이미지 사용
  if (plan.details && plan.details.length > 0) {
    for (const detail of plan.details) {
      if (detail.attraction && detail.attraction.firstImage1) {
        return detail.attraction.firstImage1;
      }
    }
  }

  // 기본 이미지 반환
  return "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=250&fit=crop";
};

const handleImageError = (event) => {
  event.target.src = "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=250&fit=crop";
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

const formatDateShort = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
};

const filterPlans = () => {
  currentPage.value = 1;
};

const sortPlans = () => {
  currentPage.value = 1;
};

const clearFilters = () => {
  searchQuery.value = "";
  statusFilter.value = "";
  sortBy.value = "newest";
  currentPage.value = 1;
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const goToPlanDetail = (planId) => {
  router.push(`/plans/${planId}`);
};

const goToPlanEdit = (planId) => {
  router.push(`/plans/${planId}/edit`);
};

const sharePlan = async (plan) => {
  try {
    const shareUrl = `${window.location.origin}/plans/share/${plan.planId}`;

    if (navigator.share) {
      await navigator.share({
        title: plan.title,
        text: plan.description,
        url: shareUrl,
      });
    } else {
      // 클립보드에 복사
      await navigator.clipboard.writeText(shareUrl);
      alert("공유 링크가 클립보드에 복사되었습니다!");
    }
  } catch (error) {
    console.error("공유 중 오류 발생:", error);
  }
};

const duplicatePlan = async (plan) => {
  try {
    if (!confirm("이 여행 계획을 복사하시겠습니까?")) return;

    const response = await planAPI.copyPlan(plan.planId);
    alert("여행 계획이 복사되었습니다!");
    await fetchPlans();
  } catch (error) {
    console.error("계획 복사 중 오류 발생:", error);
    alert("계획 복사에 실패했습니다.");
  }
};

const deletePlan = async (plan) => {
  try {
    if (!confirm(`"${plan.title}" 여행 계획을 정말 삭제하시겠습니까?`)) return;

    await planAPI.deletePlan(plan.planId);
    alert("여행 계획이 삭제되었습니다.");
    await fetchPlans();
  } catch (error) {
    console.error("계획 삭제 중 오류 발생:", error);
    alert("계획 삭제에 실패했습니다.");
  }
};

// 라이프사이클
onMounted(() => {
  fetchPlans();
});
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
  margin-bottom: 2rem;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.filter-group {
  min-width: 120px;
}

.search-box .input-group-text {
  background: #f8f9fa;
  border-right: none;
}

.search-box .form-control {
  border-left: none;
  background: #f8f9fa;
}

.search-box .form-control:focus {
  background: white;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.view-toggle .btn {
  min-width: 40px;
}

.loading-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-state {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.plans-grid .plan-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.plan-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}

.plan-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.plan-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.plan-card:hover .plan-image img {
  transform: scale(1.05);
}

.plan-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 1rem;
}

.plan-duration {
  font-weight: 600;
}

.plan-content {
  padding: 1.5rem;
  flex: 1;
}

.plan-title {
  margin-bottom: 0.75rem;
  font-weight: 600;
  line-height: 1.3;
}

.plan-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plan-dates {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.date-item {
  display: flex;
  align-items: center;
}

.plan-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #6c757d;
}

.stat-item {
  display: flex;
  align-items: center;
}

.plan-actions {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
}

.plans-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.plan-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.plan-row:hover {
  background-color: #f8f9fa;
}

.plan-info {
  cursor: pointer;
}

.plan-thumbnail {
  width: 60px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
}

.progress-sm {
  height: 4px;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.pagination-section {
  margin-top: 2rem;
  padding: 1rem 0;
}

.stats-section {
  margin-top: 3rem;
  padding: 2rem 0;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .page-header {
    text-align: center;
  }

  .page-header .d-flex {
    flex-direction: column;
    gap: 1rem;
  }

  .filters-section .row {
    flex-direction: column;
    gap: 1rem;
  }

  .filters-section .col-md-6:last-child .d-flex {
    justify-content: center !important;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .plan-card {
    margin-bottom: 1.5rem;
  }

  .plan-actions {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .plan-actions > * {
    flex: 1;
    min-width: 80px;
  }

  .stats-section .row {
    gap: 1rem;
  }

  .stat-card {
    margin-bottom: 1rem;
  }
}
</style>
