<!-- src/views/HomeView.vue -->
<template>
  <div class="home">
    <section class="title-page">
      <div class="title-page-content">
        <h1>
          지금 <span class="highlight">Mr. Route</span>과 함께 <br />
          우리지역의 관광지를 알아보고 <br />
          나만의 여행 계획을 만들어보세요!
        </h1>
        <router-link v-if="isLoggedIn" to="/plans/create" class="cta-btn cta-btn-outline">여행 계획 만들기</router-link>
      </div>
      <div v-if="topAttractions.length > 0" class="contact-form top-rank-container">
        <h3>인기 여행지 TOP 10</h3>
        <div v-if="loadingRank" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
        </div>
        <ul v-else class="rank-list">
          <li v-for="(attraction, index) in topAttractions" :key="attraction.no" class="rank-item">
            <router-link :to="`/attractions/${attraction.no}`" class="rank-link">
              <span class="rank-number">{{ index + 1 }}</span>
              <span class="rank-title">{{ attraction.title }}</span>
              <span class="rank-region">{{ attraction.sido }}</span>
              <span class="rank-views">👀 {{ attraction.viewCnt }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </section>

    <section class="places">
      <h2>추천 관광지</h2>
      <div v-if="loadingPlaces" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
      </div>
      <div v-else class="place-container">
        <div v-for="place in featuredPlaces" :key="place.no" class="place-card" @click="goToAttraction(place.no)">
          <img :src="place.firstImage1 || '/img/no-image.jpg'" :alt="place.title" />
          <div class="place-content">
            <h3>{{ place.title }}</h3>
            <p class="place-location">
              <i class="fas fa-map-marker-alt text-danger me-1"></i>
              {{ place.sido }} {{ place.gugun }}
            </p>
            <div class="place-stats">
              <span class="view-count">
                <i class="fas fa-eye me-1"></i>
                {{ place.viewCnt || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="popular-cities" id="popular-cities">
      <h2 class="text-center">인기 도시</h2>
      <div v-if="loadingCities" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
      </div>
      <div v-else class="cities-container">
        <div v-for="city in popularCities" :key="city.sido" class="city-card" @click="searchCityAttractions(city)">
          <img
            :src="city.representativeImage || 'https://images.unsplash.com/photo-1517154421773-0529f29ea451'"
            :alt="city.sido"
          />
          <div class="city-overlay">
            <h3>{{ city.sido }}</h3>
            <p>{{ city.attractionCount }}개의 관광 명소</p>
          </div>
        </div>
      </div>
    </section>

    <section class="reviews">
      <h2 class="text-center">여행객 후기</h2>
      <div v-if="loadingReviews" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
      </div>
      <div v-else class="reviews-container">
        <div v-for="review in userReviews" :key="review.bno" class="review-card">
          <div class="review-content">"{{ truncateText(review.content, 100) }}"</div>
          <div class="reviewer">
            <div class="reviewer-img">
              <img
                :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(review.writer)}&background=random`"
                :alt="review.writer"
              />
            </div>
            <div class="reviewer-info">
              <h4>{{ review.writer }}</h4>
              <p>{{ review.title }}</p>
              <div class="review-meta">
                <span class="review-date">{{ formatDate(review.regDate) }}</span>
                <span class="review-views">👀 {{ review.viewCnt }}</span>
              </div>
            </div>
          </div>
          <div class="review-actions">
            <router-link :to="`/board/${review.bno}`" class="btn btn-sm btn-outline-primary"> 후기 보기 </router-link>
          </div>
        </div>
      </div>
    </section>
    <!-- HomeView.vue에 추가할 공지사항 섹션 -->
    <section class="notices-section">
      <div class="container">
        <div class="row align-items-center mb-4">
          <div class="col">
            <h2><i class="fas fa-bullhorn text-primary me-2"></i>공지사항</h2>
          </div>
          <div class="col-auto">
            <router-link to="/notices" class="btn btn-outline-primary btn-sm">
              전체보기 <i class="fas fa-arrow-right ms-1"></i>
            </router-link>
          </div>
        </div>

        <!-- 중요 공지사항 -->
        <div v-if="importantNotices.length > 0" class="important-notices mb-4">
          <div class="alert alert-warning">
            <h6 class="alert-heading"><i class="fas fa-exclamation-triangle me-2"></i>중요 공지사항</h6>
            <div v-for="notice in importantNotices" :key="notice.nno" class="important-notice-item">
              <router-link :to="`/notices/${notice.nno}`" class="text-decoration-none text-dark">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <i class="fas fa-star text-warning me-2"></i>
                    {{ notice.title }}
                  </div>
                  <small class="text-muted">{{ formatDate(notice.regDate) }}</small>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- 일반 공지사항 -->
        <div class="recent-notices">
          <div v-if="loadingNotices" class="text-center py-3">
            <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
          </div>

          <div v-else-if="recentNotices.length === 0" class="text-center py-4">
            <p class="text-muted mb-0">등록된 공지사항이 없습니다.</p>
          </div>

          <div v-else class="list-group">
            <router-link
              v-for="notice in recentNotices"
              :key="notice.nno"
              :to="`/notices/${notice.nno}`"
              class="list-group-item list-group-item-action"
            >
              <div class="d-flex justify-content-between align-items-center">
                <div class="notice-title">
                  <i v-if="notice.isImportant" class="fas fa-star text-warning me-2"></i>
                  {{ notice.title }}
                  <span v-if="isNew(notice.regDate)" class="badge bg-success ms-2">NEW</span>
                </div>
                <div class="notice-meta text-muted">
                  <small>{{ formatDate(notice.regDate) }}</small>
                  <span class="mx-2">·</span>
                  <small>조회 {{ notice.viewCnt }}</small>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>
    <section class="stats-section">
      <div class="container">
        <h2 class="text-center mb-5">Enjoy Trip 통계</h2>
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-icon">
              <i class="fas fa-map-marked-alt"></i>
            </div>
            <div class="stat-number">{{ totalAttractions.toLocaleString() }}+</div>
            <div class="stat-label">등록된 관광지</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-number">{{ totalMembers.toLocaleString() }}+</div>
            <div class="stat-label">가입 회원수</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <i class="fas fa-comments"></i>
            </div>
            <div class="stat-number">{{ totalReviews.toLocaleString() }}+</div>
            <div class="stat-label">여행 후기</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <i class="fas fa-route"></i>
            </div>
            <div class="stat-number">{{ totalPlans.toLocaleString() }}+</div>
            <div class="stat-label">여행 계획</div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <h2>나만의 여행 계획을 만들어보세요</h2>
      <p>Enjoy Trip과 함께라면 여행이 더욱 특별해집니다. 지금 바로 시작해보세요!</p>
      <div class="cta-buttons">
        <router-link to="/attractions" class="cta-btn me-3">관광지 둘러보기</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import attractionAPI from "@/api/attraction";
import boardAPI from "@/api/board";
import apiClient from "@/api";
// HomeView.vue의 script 섹션에 추가할 코드
import noticeAPI from "@/api/notice";

// 상태 추가
const importantNotices = ref([]);
const recentNotices = ref([]);
const loadingNotices = ref(false);

const router = useRouter();
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isAuthenticated);

// 상태 관리
const topAttractions = ref([]);
const featuredPlaces = ref([]);
const popularCities = ref([]);
const userReviews = ref([]);

// 통계 데이터
const totalAttractions = ref(0);
const totalMembers = ref(0);
const totalReviews = ref(0);
const totalPlans = ref(0);

// 로딩 상태
const loadingRank = ref(false);
const loadingPlaces = ref(false);
const loadingCities = ref(false);
const loadingReviews = ref(false);

// 인기 관광지 데이터 로드
const loadTopAttractions = async () => {
  if (!isLoggedIn.value) return;

  try {
    loadingRank.value = true;
    const response = await attractionAPI.getTopAttractions();
    topAttractions.value = response.data.slice(0, 10); // TOP 10만
  } catch (error) {
    console.error("인기 관광지 로드 오류:", error);
  } finally {
    loadingRank.value = false;
  }
};

// 추천 관광지 데이터 로드
const loadFeaturedPlaces = async () => {
  try {
    loadingPlaces.value = true;
    const response = await attractionAPI.getRandomAttractions(6);
    featuredPlaces.value = response.data;
  } catch (error) {
    console.error("추천 관광지 로드 오류:", error);
  } finally {
    loadingPlaces.value = false;
  }
};

// 인기 도시 데이터 로드
const loadPopularCities = async () => {
  try {
    loadingCities.value = true;
    const response = await apiClient.get("/attractions/popular-cities");
    popularCities.value = response.data.slice(0, 8); // TOP 6 도시
  } catch (error) {
    console.error("인기 도시 로드 오류:", error);
    // 폴백 데이터
    popularCities.value = [
      {
        sido: "서울",
        attractionCount: 63,
        representativeImage: "https://images.unsplash.com/photo-1517154421773-0529f29ea451",
      },
      {
        sido: "부산",
        attractionCount: 48,
        representativeImage: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7",
      },
      {
        sido: "제주특별자치도",
        attractionCount: 57,
        representativeImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      },
    ];
  } finally {
    loadingCities.value = false;
  }
};

// 여행 후기 데이터 로드 (게시판 데이터 활용)
const loadUserReviews = async () => {
  try {
    loadingReviews.value = true;
    const response = await boardAPI.getBoards({ currentPage: 1 });
    // 조회수가 높은 게시글을 후기로 활용
    const reviews = response.data.list || [];
    userReviews.value = reviews
      .filter((board) => board.content && board.content.length > 50) // 내용이 충분한 게시글만
      .sort((a, b) => b.viewCnt - a.viewCnt) // 조회수 순으로 정렬
      .slice(0, 3); // 상위 3개만
  } catch (error) {
    console.error("여행 후기 로드 오류:", error);
  } finally {
    loadingReviews.value = false;
  }
};

// 통계 데이터 로드
const loadStatistics = async () => {
  try {
    const response = await apiClient.get("/statistics/summary");
    const stats = response.data;
    totalAttractions.value = stats.totalAttractions || 1500;
    totalMembers.value = stats.totalMembers || 10000;
    totalReviews.value = stats.totalReviews || 5000;
    totalPlans.value = stats.totalPlans || 3000;
  } catch (error) {
    console.error("통계 데이터 로드 오류:", error);
    // 폴백 데이터
    totalAttractions.value = 1500;
    totalMembers.value = 10000;
    totalReviews.value = 5000;
    totalPlans.value = 3000;
  }
};

// 메서드
const goToAttraction = (attractionId) => {
  router.push(`/attractions/${attractionId}`);
};

const searchCityAttractions = (city) => {
  router.push({
    path: "/attractions",
    query: { area: city.sido },
  });
};

const isNew = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3; // 3일 이내면 NEW 표시
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "오늘";
  if (diffDays === 2) return "어제";
  if (diffDays <= 7) return `${diffDays}일 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// 공지사항 데이터 로드 함수
const loadNotices = async () => {
  try {
    loadingNotices.value = true;

    // 중요 공지사항과 최신 공지사항을 병렬로 가져오기
    const [importantResponse, recentResponse] = await Promise.all([
      noticeAPI.getImportantNotices(),
      noticeAPI.getRecentNotices(5),
    ]);

    importantNotices.value = importantResponse.data.slice(0, 3); // 최대 3개
    recentNotices.value = recentResponse.data;
  } catch (error) {
    console.error("공지사항 로드 오류:", error);
  } finally {
    loadingNotices.value = false;
  }
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  await Promise.all([
    loadTopAttractions(),
    loadFeaturedPlaces(),
    loadPopularCities(),
    loadUserReviews(),
    loadStatistics(),
    loadNotices(),
  ]);
});
</script>

<style scoped>
.home {
  width: 100%;
}

.title-page {
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
    url("https://images.unsplash.com/photo-1517154421773-0529f29ea451") no-repeat center center/cover;
  background-attachment: fixed;
  height: 950px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  position: relative;
  padding: 0 80px;
}

.title-page-content h1 {
  font-size: 3rem;
  font-weight: bold;
  line-height: 1.3;
}

.highlight {
  color: #007bff;
}

.cta-btn {
  display: inline-block;
  padding: 12px 30px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.cta-btn:hover {
  background-color: #0056b3;
  color: white;
  text-decoration: none;
}

.cta-btn-outline {
  background-color: transparent;
  border: 2px solid #007bff;
}

.cta-btn-outline:hover {
  background-color: #007bff;
}

.places {
  padding: 80px 0;
  background-color: #f8f9fa;
}

.places h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.place-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.place-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.place-card:hover {
  transform: translateY(-5px);
}

.place-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.place-content {
  padding: 20px;
}

.place-content h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.place-location {
  color: #6c757d;
  margin-bottom: 10px;
}

.place-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-count {
  color: #007bff;
  font-size: 0.9rem;
}

.popular-cities {
  padding: 80px 0;
}

.popular-cities h2 {
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.cities-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.city-card {
  position: relative;
  height: 300px;
  overflow: hidden;
  border-radius: 10px;
  cursor: pointer;
}

.city-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.city-card:hover img {
  transform: scale(1.1);
}

.city-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 20px;
}

.reviews {
  padding: 80px 0;
  background-color: #f8f9fa;
}

.reviews h2 {
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.reviews-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.review-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.review-content {
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-style: italic;
}

.reviewer {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.reviewer-img img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-info h4 {
  margin: 0;
  font-size: 1.1rem;
}

.reviewer-info p {
  margin: 0.25rem 0;
  color: #6c757d;
}

.review-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.review-actions {
  text-align: right;
}

.stats-section {
  padding: 80px 0;
  background-color: #007bff;
  color: white;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

.stat-item {
  padding: 2rem;
}

.stat-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.9;
}

.cta {
  padding: 80px 0;
  text-align: center;
  background-color: #f8f9fa;
}

.cta h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.cta-buttons {
  margin-top: 2rem;
}

.top-rank-container {
  color: #333;
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin-left: 10%;
}

.rank-list {
  list-style: none;
  padding: 0;
  margin: 0;
  height: 1000px;
  max-height: 500px;
  overflow-y: auto;
}

.rank-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  transition: color 0.3s;
}

.rank-link:hover {
  color: #007bff;
}

.rank-number {
  font-weight: bold;
  margin-right: 1rem;
  color: #007bff;
  min-width: 20px;
}

.rank-title {
  flex: 1;
  font-size: 0.9rem;
}

.rank-region {
  color: #6c757d;
  font-size: 0.8rem;
  margin-right: 0.5rem;
}

.rank-views {
  color: #007bff;
  font-size: 0.8rem;
}

/* 반응형 */
@media (max-width: 768px) {
  .title-page {
    flex-direction: column;
    padding: 0 20px;
  }

  .top-rank-container {
    margin: 2rem 0 0 0;
    max-width: 100%;
  }

  .title-page-content h1 {
    font-size: 2rem;
  }
}

.notices-section {
  padding: 60px 0;
  background-color: #f8f9fa;
}

.important-notice-item {
  padding: 0.5rem 0;
}

.important-notice-item:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
}

.important-notice-item a:hover {
  text-decoration: underline !important;
}

.list-group-item {
  border-left: none;
  border-right: none;
  border-radius: 0;
}

.list-group-item:first-child {
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

.list-group-item:last-child {
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.notice-title {
  font-weight: 500;
  flex: 1;
}

.notice-meta {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}
</style>
