<!-- src/components/PlanBoard/PlanBoardFilter.vue -->
<template>
  <div class="planboard-filter">
    <!-- 메인 검색바 -->
    <div class="main-search">
      <div class="search-input-group">
        <div class="input-group">
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
          <input
            type="text"
            v-model="localFilters.keyword"
            class="form-control"
            placeholder="여행 제목이나 내용으로 검색..."
            @keyup.enter="handleSearch"
          />
          <button class="btn btn-primary" @click="handleSearch"><i class="fas fa-search me-1"></i>검색</button>
        </div>
      </div>

      <button class="btn btn-outline-secondary filter-toggle-btn" @click="showAdvancedFilters = !showAdvancedFilters">
        <i class="fas fa-filter me-1"></i>
        상세 필터
        <i class="fas" :class="showAdvancedFilters ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </button>
    </div>

    <!-- 상세 필터 (접을 수 있음) -->
    <div class="advanced-filters" :class="{ show: showAdvancedFilters }">
      <div class="row g-3">
        <!-- 여행 테마 -->
        <div class="col-md-4">
          <label class="form-label">
            <i class="fas fa-palette me-1 text-primary"></i>
            여행 테마
          </label>
          <select v-model="localFilters.travelTheme" class="form-select">
            <option value="">전체 테마</option>
            <option value="힐링">🧘‍♀️ 힐링</option>
            <option value="모험">🏔️ 모험</option>
            <option value="문화">🏛️ 문화</option>
            <option value="자연">🌲 자연</option>
            <option value="도시">🏙️ 도시</option>
            <option value="맛집">🍽️ 맛집</option>
            <option value="쇼핑">🛍️ 쇼핑</option>
            <option value="역사">📚 역사</option>
            <option value="체험">🎯 체험</option>
            <option value="사진">📷 사진</option>
          </select>
        </div>

        <!-- 목적지 -->
        <div class="col-md-4">
          <label class="form-label">
            <i class="fas fa-map-marker-alt me-1 text-danger"></i>
            목적지
          </label>
          <input
            type="text"
            v-model="localFilters.destination"
            class="form-control"
            placeholder="예: 제주도, 부산, 서울"
          />
        </div>

        <!-- 인원수 -->
        <div class="col-md-4">
          <label class="form-label">
            <i class="fas fa-users me-1 text-info"></i>
            인원수
          </label>
          <select v-model="localFilters.participantCount" class="form-select">
            <option value="">전체</option>
            <option value="1">혼자 여행</option>
            <option value="2">2명 (커플/친구)</option>
            <option value="3">3명</option>
            <option value="4">4명 (가족)</option>
            <option value="5">5명 이상</option>
          </select>
        </div>

        <!-- 내 게시글만 보기 (로그인한 사용자만) -->
        <div v-if="authStore.isAuthenticated" class="col-md-4">
          <label class="form-label">
            <i class="fas fa-user me-1 text-success"></i>
            게시글 필터
          </label>
          <div class="form-check form-switch mt-2">
            <input
              class="form-check-input"
              type="checkbox"
              id="onlyMyPosts"
              v-model="localFilters.onlyMyPosts"
              @change="handleSearch"
            />
            <label class="form-check-label" for="onlyMyPosts"> 내가 작성한 게시글만 보기 </label>
          </div>
        </div>

        <!-- 여행 시작일 범위 -->
        <div class="col-md-6">
          <label class="form-label">
            <i class="fas fa-calendar-alt me-1 text-success"></i>
            여행 시작일 범위
          </label>
          <div class="row g-2">
            <div class="col">
              <input type="date" v-model="localFilters.startDateFrom" class="form-control" placeholder="시작일 이후" />
            </div>
            <div class="col-auto d-flex align-items-center">
              <span class="text-muted">~</span>
            </div>
            <div class="col">
              <input type="date" v-model="localFilters.startDateTo" class="form-control" placeholder="시작일 이전" />
            </div>
          </div>
        </div>

        <!-- 예산 범위 -->
        <div class="col-md-6">
          <label class="form-label">
            <i class="fas fa-won-sign me-1 text-warning"></i>
            예산 범위 (만원)
          </label>
          <div class="row g-2">
            <div class="col">
              <input type="number" v-model="localFilters.budgetMin" class="form-control" placeholder="최소" min="0" />
            </div>
            <div class="col-auto d-flex align-items-center">
              <span class="text-muted">~</span>
            </div>
            <div class="col">
              <input type="number" v-model="localFilters.budgetMax" class="form-control" placeholder="최대" min="0" />
            </div>
          </div>
        </div>
      </div>

      <!-- 필터 액션 버튼 -->
      <div class="filter-actions">
        <button class="btn btn-outline-secondary" @click="handleReset"><i class="fas fa-undo me-1"></i>초기화</button>
        <button class="btn btn-primary" @click="handleSearch"><i class="fas fa-search me-1"></i>필터 적용</button>
      </div>
    </div>

    <!-- 활성 필터 표시 -->
    <div v-if="activeFilters.length > 0" class="active-filters">
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <span class="filter-label">
          <i class="fas fa-filter me-1"></i>
          활성 필터:
        </span>
        <span v-for="filter in activeFilters" :key="filter.key" class="filter-tag">
          {{ filter.label }}: {{ filter.value }}
          <button class="filter-remove" @click="removeFilter(filter.key)">
            <i class="fas fa-times"></i>
          </button>
        </span>
        <button class="btn btn-sm btn-outline-secondary" @click="handleReset">
          <i class="fas fa-times me-1"></i>전체 초기화
        </button>
      </div>
    </div>

    <!-- 빠른 필터 버튼들 -->
    <div class="quick-filters">
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <span class="quick-filter-label">빠른 필터:</span>
        <button
          v-for="quickFilter in quickFilters"
          :key="quickFilter.key"
          class="btn btn-sm btn-outline-primary quick-filter-btn"
          @click="applyQuickFilter(quickFilter)"
        >
          {{ quickFilter.icon }} {{ quickFilter.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update-filters", "search", "reset"]);

// 상태 관리
const showAdvancedFilters = ref(false);
// localFilters에 onlyMyPosts 필드 추가
const localFilters = ref({
  keyword: "",
  travelTheme: "",
  destination: "",
  startDateFrom: "",
  startDateTo: "",
  budgetMin: null,
  budgetMax: null,
  participantCount: null,
  tagName: "",
  onlyMyPosts: false, // 추가
});

// 빠른 필터 옵션
const quickFilters = ref([
  {
    key: "solo",
    label: "혼자 여행",
    icon: "🚶‍♀️",
    filters: { participantCount: "1" },
  },
  {
    key: "couple",
    label: "커플 여행",
    icon: "💑",
    filters: { participantCount: "2" },
  },
  {
    key: "family",
    label: "가족 여행",
    icon: "👨‍👩‍👧‍👦",
    filters: { participantCount: "4" },
  },
  {
    key: "healing",
    label: "힐링 여행",
    icon: "🧘‍♀️",
    filters: { travelTheme: "힐링" },
  },
  {
    key: "adventure",
    label: "모험 여행",
    icon: "🏔️",
    filters: { travelTheme: "모험" },
  },
  {
    key: "food",
    label: "맛집 탐방",
    icon: "🍽️",
    filters: { travelTheme: "맛집" },
  },
]);

// 계산된 속성
const activeFilters = computed(() => {
  const filters = [];
  const filterLabels = {
    keyword: "검색어",
    travelTheme: "여행 테마",
    destination: "목적지",
    participantCount: "인원수",
    startDateFrom: "시작일(이후)",
    startDateTo: "시작일(이전)",
    budgetMin: "최소 예산",
    budgetMax: "최대 예산",
    tagName: "태그",
  };

  Object.entries(localFilters.value).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      let displayValue = value;

      // 특별한 포맷팅
      if (key === "participantCount") {
        const participantLabels = {
          1: "혼자 여행",
          2: "2명 (커플/친구)",
          3: "3명",
          4: "4명 (가족)",
          5: "5명 이상",
        };
        displayValue = participantLabels[value] || `${value}명`;
      } else if (key === "budgetMin" || key === "budgetMax") {
        displayValue = `${value}만원`;
      } else if (key === "startDateFrom" || key === "startDateTo") {
        displayValue = new Date(value).toLocaleDateString("ko-KR");
      }

      filters.push({
        key,
        label: filterLabels[key] || key,
        value: displayValue,
      });
    }
  });

  return filters;
});

// 메서드
const handleSearch = () => {
  emit("search", { ...localFilters.value });
};

// handleReset 함수에도 추가
const handleReset = () => {
  localFilters.value = {
    keyword: "",
    travelTheme: "",
    destination: "",
    startDateFrom: "",
    startDateTo: "",
    budgetMin: null,
    budgetMax: null,
    participantCount: null,
    tagName: "",
    onlyMyPosts: false, // 추가
  };
  emit("reset");
};

const removeFilter = (key) => {
  localFilters.value[key] = key.includes("budget") ? null : "";
  handleSearch();
};

const applyQuickFilter = (quickFilter) => {
  // 기존 필터 초기화 후 빠른 필터 적용
  Object.assign(localFilters.value, quickFilter.filters);
  handleSearch();
};

// props 변경 감지
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters };
  },
  { deep: true }
);

// 디바운싱을 위한 검색어 감지
watch(
  () => localFilters.value.keyword,
  () => {
    // 검색어 변경 시 자동 검색 (선택적)
    // handleSearch();
  }
);
</script>

<style scoped>
.planboard-filter {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.main-search {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.search-input-group {
  flex: 1;
}

.filter-toggle-btn {
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.advanced-filters {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  border-top: 1px solid #eee;
  padding-top: 0;
}

.advanced-filters.show {
  max-height: 500px;
  padding-top: 1.5rem;
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.form-label i {
  width: 16px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.active-filters {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.filter-label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.filter-tag {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.filter-remove:hover {
  background: rgba(255, 255, 255, 0.2);
}

.quick-filters {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.quick-filter-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
}

.quick-filter-btn {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  transition: all 0.2s;
}

.quick-filter-btn:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
  transform: translateY(-1px);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-search {
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-input-group {
    width: 100%;
  }

  .filter-toggle-btn {
    width: 100%;
    justify-content: center;
  }

  .filter-actions {
    flex-direction: column;
  }

  .filter-actions .btn {
    width: 100%;
  }

  .active-filters .d-flex {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start !important;
  }

  .filter-tag {
    margin-bottom: 0.25rem;
  }

  .quick-filters .d-flex {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start !important;
  }

  .quick-filter-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .planboard-filter {
    padding: 1rem;
  }

  .input-group .btn {
    padding: 0.375rem 0.75rem;
  }

  .input-group .btn i {
    margin-right: 0;
  }

  .input-group .btn span {
    display: none;
  }
}

/* 커스텀 스크롤바 */
.advanced-filters::-webkit-scrollbar {
  width: 4px;
}

.advanced-filters::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.advanced-filters::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.advanced-filters::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 애니메이션 */
@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 500px;
    opacity: 1;
  }
}

.advanced-filters.show {
  animation: slideDown 0.3s ease;
}

/* 포커스 스타일 */
.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* 버튼 호버 효과 */
.btn:hover {
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.btn-outline-secondary:hover {
  box-shadow: 0 2px 4px rgba(108, 117, 125, 0.2);
}
</style>
