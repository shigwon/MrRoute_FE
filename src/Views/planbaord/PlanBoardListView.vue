<!-- src/views/PlanBoard/PlanBoardListView.vue -->
<template>
  <div class="planboard-list-view">
    <div class="container py-4">
      <!-- 헤더 섹션 -->
      <div class="page-header">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="mb-2">🗺️ 여행 공유 게시판</h1>
            <p class="text-muted mb-0">다른 여행자들의 여행 계획을 구경하고 나만의 여행 계획도 공유해보세요!</p>
          </div>
          <router-link v-if="authStore.isAuthenticated" to="/planboard/write" class="btn btn-primary btn-lg">
            <i class="fas fa-plus me-2"></i>여행 계획 공유하기
          </router-link>
        </div>
      </div>

      <!-- 필터 및 검색 섹션 -->
      <div class="filters-section">
        <PlanBoardFilter
          :filters="filters"
          @update-filters="updateFilters"
          @search="searchPosts"
          @reset="resetFilters"
        />
      </div>

      <!-- 인기 태그 섹션 -->
      <div v-if="popularTags.length > 0" class="tags-section">
        <h5 class="mb-3"><i class="fas fa-fire text-danger me-2"></i>인기 태그</h5>
        <PlanBoardTags :tags="popularTags" :clickable="true" @tag-click="filterByTag" />
      </div>

      <!-- 정렬 및 뷰 옵션 -->
      <div class="sort-section">
        <div class="d-flex justify-content-between align-items-center">
          <div class="sort-options">
            <label class="form-label small mb-1">정렬</label>
            <select v-model="sortBy" class="form-select form-select-sm" style="width: auto" @change="loadPosts">
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="likes">좋아요순</option>
            </select>
          </div>
          <div class="view-options">
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

      <!-- 추천 게시글 섹션 -->
      <div v-if="featuredPosts.length > 0 && currentPage === 1" class="featured-section">
        <h5 class="mb-3"><i class="fas fa-star text-warning me-2"></i>추천 여행 계획</h5>
        <div class="row">
          <div v-for="post in featuredPosts.slice(0, 3)" :key="`featured-${post.pboardNo}`" class="col-md-4 mb-3">
            <div class="featured-card" @click="goToDetail(post.pboardNo)">
              <div class="featured-badge">
                <i class="fas fa-star"></i>
                추천
              </div>
              <img
                :src="post.thumbnailImage || getDefaultThumbnail(post.travelTheme)"
                :alt="post.title"
                class="featured-image"
              />
              <div class="featured-content">
                <h6 class="featured-title">{{ post.title }}</h6>
                <p class="featured-travel-title">{{ post.travelTitle }}</p>
                <div class="featured-meta">
                  <span class="featured-duration">{{ post.travelDuration }}일</span>
                  <span class="featured-destination">{{ post.travelDestinations }}</span>
                </div>
                <div class="featured-stats">
                  <span><i class="fas fa-heart text-danger me-1"></i>{{ post.likeCount }}</span>
                  <span><i class="fas fa-eye text-info me-1"></i>{{ post.viewCnt }}</span>
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
          <p class="mt-3 text-muted">게시글을 불러오는 중...</p>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="!posts || posts.length === 0" class="empty-state">
        <div class="text-center py-5">
          <div class="empty-icon">
            <i class="fas fa-map-marked-alt"></i>
          </div>
          <h3 class="mb-3">게시글이 없습니다</h3>
          <p class="text-muted mb-4">
            {{ hasActiveFilters ? "검색 조건에 맞는 게시글이 없습니다." : "첫 번째 여행 계획을 공유해보세요!" }}
          </p>
          <button v-if="hasActiveFilters" class="btn btn-outline-secondary" @click="resetFilters">
            <i class="fas fa-times me-2"></i>필터 초기화
          </button>
          <router-link v-else-if="authStore.isAuthenticated" to="/planboard/write" class="btn btn-primary">
            <i class="fas fa-plus me-2"></i>첫 게시글 작성하기
          </router-link>
        </div>
      </div>

      <!-- 게시글 목록 -->
      <div v-else class="posts-section">
        <!-- 그리드 뷰 -->
        <div v-if="viewMode === 'grid'" class="posts-grid">
          <div class="row">
            <div v-for="post in posts" :key="post.pboardNo" class="col-lg-4 col-md-6 mb-4">
              <PlanBoardItem
                :post="post"
                :view-mode="'grid'"
                @click="goToDetail(post.pboardNo)"
                @like="toggleLike"
                @tag-click="filterByTag"
              />
            </div>
          </div>
        </div>

        <!-- 리스트 뷰 -->
        <div v-else class="posts-list">
          <div v-for="post in posts" :key="post.pboardNo" class="mb-3">
            <PlanBoardItem
              :post="post"
              :view-mode="'list'"
              @click="goToDetail(post.pboardNo)"
              @like="toggleLike"
              @tag-click="filterByTag"
            />
          </div>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="pagination-section">
        <PlanBoardPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          @page-change="changePage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// PlanBoardListView.vue의 script 부분 수정
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import planboardAPI from "@/api/planboard";
import PlanBoardFilter from "@/components/PlanBoard/PlanBoardFilter.vue";
import PlanBoardItem from "@/components/PlanBoard/PlanBoardItem.vue";
import PlanBoardTags from "@/components/PlanBoard/PlanBoardTags.vue";
import PlanBoardPagination from "@/components/PlanBoard/PlanBoardPagination.vue";

const router = useRouter();
const authStore = useAuthStore();

// 상태 관리
const loading = ref(true);
const posts = ref([]);
const featuredPosts = ref([]);
const popularTags = ref([]);
const currentPage = ref(1);
const totalPages = ref(0);
const totalItems = ref(0);
const viewMode = ref("grid");
const sortBy = ref("latest");

// 필터 상태
// filters 객체에 onlyMyPosts 필드 추가
const filters = ref({
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

// 계산된 속성
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some((value) => value !== "" && value !== null);
});

// 메서드 수정
const loadPosts = async () => {
  try {
    loading.value = true;
    console.log("loadPosts 시작");

    const params = {
      currentPage: currentPage.value,
      sortBy: sortBy.value,
      ...filters.value,
    };

    console.log("API 호출 파라미터:", params);

    const response = await planboardAPI.getPlanBoards(params);
    console.log("API 응답 전체:", response);
    console.log("API 응답 데이터:", response.data);

    // 응답 데이터 구조 확인 및 처리
    if (response.data) {
      // 응답이 배열인 경우
      if (Array.isArray(response.data)) {
        posts.value = response.data;
        totalItems.value = response.data.length;
        totalPages.value = 1;
        currentPage.value = 1;
      }
      // 응답이 객체인 경우 (페이징 정보 포함)
      else if (response.data.list || response.data.content || response.data.data) {
        posts.value = response.data.list || response.data.content || response.data.data || [];
        totalItems.value = response.data.totalCount || response.data.totalElements || response.data.total || 0;
        totalPages.value = response.data.totalPages || Math.ceil(totalItems.value / 10) || 1;
        currentPage.value = response.data.currentPage || response.data.page || 1;
      }
      // 단순 객체 응답인 경우
      else {
        posts.value = [response.data];
        totalItems.value = 1;
        totalPages.value = 1;
        currentPage.value = 1;
      }
    } else {
      posts.value = [];
      totalItems.value = 0;
      totalPages.value = 0;
    }

    console.log("처리된 posts:", posts.value);
    console.log("totalItems:", totalItems.value);
  } catch (error) {
    console.error("게시글 목록 로드 오류:", error);

    // 에러 상세 정보 로깅
    if (error.response) {
      console.error("응답 상태:", error.response.status);
      console.error("응답 데이터:", error.response.data);
    }

    // 에러 시 빈 배열로 설정
    posts.value = [];
    totalItems.value = 0;
    totalPages.value = 0;

    // 사용자에게 알림
    alert("게시글을 불러오는 중 오류가 발생했습니다. 새로고침해주세요.");
  } finally {
    loading.value = false;
  }
};

const loadFeaturedPosts = async () => {
  try {
    console.log("loadFeaturedPosts 시작");
    const response = await planboardAPI.getFeaturedPlanBoards(6);
    console.log("추천 게시글 응답:", response.data);
    featuredPosts.value = response.data || [];
  } catch (error) {
    console.error("추천 게시글 로드 오류:", error);
    featuredPosts.value = [];
  }
};

const loadPopularTags = async () => {
  try {
    console.log("loadPopularTags 시작");
    const response = await planboardAPI.getPopularTags(10);
    console.log("인기 태그 응답:", response.data);
    popularTags.value = response.data || [];
  } catch (error) {
    console.error("인기 태그 로드 오류:", error);
    popularTags.value = [];
  }
};

// 나머지 메서드들...
const updateFilters = (newFilters) => {
  filters.value = { ...filters.value, ...newFilters };
  currentPage.value = 1;
  loadPosts();
};

const searchPosts = (searchData) => {
  filters.value = { ...filters.value, ...searchData };
  currentPage.value = 1;
  loadPosts();
};

// resetFilters 함수에도 추가
const resetFilters = () => {
  filters.value = {
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
  currentPage.value = 1;
  sortBy.value = "latest";
  loadPosts();
};

const filterByTag = (tagName) => {
  filters.value.tagName = tagName;
  currentPage.value = 1;
  loadPosts();
};

const changePage = (page) => {
  currentPage.value = page;
  loadPosts();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const goToDetail = (pboardNo) => {
  router.push(`/planboard/${pboardNo}`);
};

const toggleLike = async (pboardNo) => {
  if (!authStore.isAuthenticated) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  try {
    const response = await planboardAPI.toggleLike(pboardNo);
    const postIndex = posts.value.findIndex((post) => post.pboardNo === pboardNo);
    if (postIndex !== -1) {
      posts.value[postIndex].isLiked = response.data.isLiked;
      posts.value[postIndex].likeCount += response.data.isLiked ? 1 : -1;
    }
  } catch (error) {
    console.error("좋아요 토글 오류:", error);
    alert("좋아요 처리 중 오류가 발생했습니다.");
  }
};

const getDefaultThumbnail = (travelTheme) => {
  const thumbnails = {
    힐링: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    모험: "https://images.unsplash.com/photo-1551632811-561732d1e306",
    문화: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0",
    자연: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    도시: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
    맛집: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
  };
  return thumbnails[travelTheme] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828";
};

// 라이프사이클 - 에러 처리 개선
onMounted(async () => {
  console.log("컴포넌트 마운트됨");

  try {
    // 순차적으로 로드하여 에러 발생 지점 확인
    await loadPosts();
    console.log("메인 게시글 로드 완료");

    // 추천 게시글과 인기 태그는 실패해도 메인 기능에 영향 없음
    await loadFeaturedPosts().catch((err) => console.warn("추천 게시글 로드 실패:", err));
    await loadPopularTags().catch((err) => console.warn("인기 태그 로드 실패:", err));

    console.log("모든 데이터 로드 완료");
  } catch (error) {
    console.error("컴포넌트 초기화 중 오류:", error);
  }
});

// 정렬 변경 감지
watch(sortBy, () => {
  console.log("정렬 방식 변경:", sortBy.value);
  currentPage.value = 1;
  loadPosts();
});
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
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

.tags-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.sort-section {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.featured-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.featured-card {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 280px;
  display: flex;
  flex-direction: column;
}

.featured-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.featured-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #333;
  padding: 4px 8px;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 600;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 3px;
}

.featured-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.featured-content {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.featured-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.featured-travel-title {
  color: #6c757d;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.featured-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.featured-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  font-size: 0.8rem;
  color: #6c757d;
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

.posts-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.posts-grid .row {
  margin: -0.5rem;
}

.posts-grid .col-lg-4,
.posts-grid .col-md-6 {
  padding: 0.5rem;
}

.pagination-section {
  margin-top: 2rem;
}

.view-options .btn {
  min-width: 40px;
}

@media (max-width: 768px) {
  .page-header .d-flex {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .sort-section .d-flex {
    flex-direction: column;
    gap: 1rem;
  }

  .featured-section .row {
    margin: 0;
  }

  .featured-section .col-md-4 {
    padding: 0 0 1rem 0;
  }
}
</style>
