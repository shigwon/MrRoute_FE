<!-- src/views/PlanBoard/PlanBoardDetailView.vue -->
<template>
  <div class="planboard-detail-view">
    <div class="container py-4">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-section">
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem">
            <span class="visually-hidden">로딩중...</span>
          </div>
          <p class="mt-3 text-muted">게시글을 불러오는 중...</p>
        </div>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-section">
        <div class="alert alert-danger text-center">
          <i class="fas fa-exclamation-circle me-2"></i>
          {{ error }}
        </div>
      </div>

      <!-- 게시글 내용 -->
      <div v-else-if="post" class="post-detail">
        <!-- 게시글 헤더 -->
        <div class="post-header">
          <div class="header-content">
            <div class="post-meta">
              <span class="post-category">
                <i class="fas fa-map-marked-alt me-1"></i>
                {{ post.travelTheme || "여행" }}
              </span>
              <span class="post-date">{{ formatDate(post.regDate) }}</span>
            </div>

            <h1 class="post-title">{{ post.title }}</h1>

            <div class="post-travel-info" v-if="post.travelTitle">
              <h3 class="travel-title">
                <i class="fas fa-route me-2"></i>
                {{ post.travelTitle }}
              </h3>
              <div class="travel-meta">
                <div class="travel-meta-item" v-if="post.startDate && post.endDate">
                  <i class="fas fa-calendar-alt text-primary"></i>
                  <span>{{ formatDate(post.startDate) }} ~ {{ formatDate(post.endDate) }}</span>
                </div>
                <div class="travel-meta-item" v-if="post.travelDuration">
                  <i class="fas fa-clock text-info"></i>
                  <span>{{ post.travelDuration }}일</span>
                </div>
                <div class="travel-meta-item" v-if="post.travelDestinations">
                  <i class="fas fa-map-marker-alt text-danger"></i>
                  <span>{{ post.travelDestinations }}</span>
                </div>
                <div class="travel-meta-item" v-if="post.participantCount">
                  <i class="fas fa-users text-success"></i>
                  <span>{{ post.participantCount }}명</span>
                </div>
                <div class="travel-meta-item" v-if="post.estimatedBudget">
                  <i class="fas fa-won-sign text-warning"></i>
                  <span>{{ formatBudget(post.estimatedBudget) }}</span>
                </div>
              </div>
            </div>

            <div class="post-author-info">
              <div class="author-avatar">
                <img
                  :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(post.writer)}&background=random`"
                  :alt="post.writer"
                />
              </div>
              <div class="author-details">
                <h5 class="author-name">{{ post.writer }}</h5>
                <p class="author-meta">작성일: {{ formatDateTime(post.regDate) }}</p>
                <p v-if="post.updateDate && post.updateDate !== post.regDate" class="author-meta">
                  수정일: {{ formatDateTime(post.updateDate) }}
                </p>
              </div>
              <div class="post-stats">
                <div class="stat-item">
                  <i class="fas fa-eye text-info"></i>
                  <span>{{ post.viewCnt }}</span>
                </div>
                <div class="stat-item">
                  <i class="fas fa-heart text-danger"></i>
                  <span>{{ post.likeCount }}</span>
                </div>
                <div class="stat-item">
                  <i class="fas fa-comment text-primary"></i>
                  <span>{{ post.commentCount }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="post-actions" style="margin-top: 25px">
            <button
              class="action-btn like-btn"
              :class="{ active: post.isLiked }"
              @click="toggleLike"
              :disabled="!authStore.isAuthenticated"
            >
              <i class="fas fa-heart"></i>
              <span>{{ post.likeCount }}</span>
            </button>

            <button class="action-btn share-btn" @click="sharePost">
              <i class="fas fa-share-alt"></i>
              <span>공유</span>
            </button>

            <div v-if="isAuthor" class="author-actions">
              <router-link :to="`/planboard/edit/${post.pboardNo}`" class="action-btn edit-btn">
                <i class="fas fa-edit"></i>
                <span>수정</span>
              </router-link>

              <button class="action-btn delete-btn" @click="confirmDelete">
                <i class="fas fa-trash"></i>
                <span>삭제</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 썸네일 이미지 -->
        <div v-if="post.thumbnailImage" class="post-thumbnail">
          <img :src="post.thumbnailImage" :alt="post.title" class="thumbnail-image" />
        </div>

        <!-- 게시글 내용 -->
        <div class="post-content">
          <div class="content-text" v-html="formatContent(post.content)"></div>
        </div>

        <!-- ✨ 새로 추가: 여행 일정 정보가 있는 경우 표시 -->
        <div
          v-if="planDetails && planDetails.details && planDetails.details.length > 0"
          class="travel-schedule-section"
        >
          <!-- 여행 일정 개요 섹션 -->
          <div class="row mb-4">
            <div class="col-md-8">
              <div class="card">
                <div class="card-header bg-light">
                  <h5 class="mb-0">
                    <i class="fas fa-calendar-alt me-2"></i>
                    여행 일정 개요
                  </h5>
                </div>
                <div class="card-body">
                  <div class="timeline">
                    <div
                      v-for="day in dayCount"
                      :key="day"
                      class="timeline-item"
                      :class="{ 'timeline-item-active': selectedDay === day }"
                      @click="selectedDay = day"
                    >
                      <div class="timeline-date">
                        <span class="timeline-day">{{ day }}일차</span>
                        <span class="timeline-full-date">{{ getDayDate(day) }}</span>
                      </div>
                      <div class="timeline-content">
                        <div v-if="getDayDetails(day).length === 0" class="text-muted">일정 없음</div>
                        <div v-else>
                          <div v-for="(detail, index) in getDayDetails(day)" :key="index" class="timeline-item-brief">
                            <i class="fas fa-map-marker-alt text-danger me-2"></i>
                            {{ detail.title }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <!-- 여행 정보 카드 -->
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    여행 정보
                  </h6>
                </div>
                <div class="card-body">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span><i class="fas fa-calendar me-2"></i> 기간</span>
                      <span class="badge bg-primary rounded-pill">{{ dayCount }}일</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span><i class="fas fa-map-marked-alt me-2"></i> 방문 장소</span>
                      <span class="badge bg-primary rounded-pill">{{ totalPlaces }}곳</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span><i class="fas fa-user me-2"></i> 작성자</span>
                      <span>{{ post.writer }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span><i class="far fa-calendar-alt me-2"></i> 작성일</span>
                      <span>{{ formatDate(post.regDate) }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- 선택된 일차 상세 정보 -->
          <div class="card mb-4">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">{{ selectedDay }}일차 상세 일정 ({{ getDayDate(selectedDay) }})</h5>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-secondary" :disabled="selectedDay === 1" @click="selectedDay--">
                  <i class="fas fa-chevron-left"></i> 이전 일차
                </button>
                <button
                  class="btn btn-sm btn-outline-secondary"
                  :disabled="selectedDay === dayCount"
                  @click="selectedDay++"
                >
                  다음 일차 <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
            <div class="card-body">
              <div v-if="getDayDetails(selectedDay).length === 0" class="text-center py-4">
                <p class="text-muted mb-3">이 날짜에 계획된 일정이 없습니다.</p>
              </div>
              <div v-else>
                <div class="day-detail-timeline">
                  <div v-for="(detail, index) in getDayDetails(selectedDay)" :key="index" class="day-detail-item">
                    <div class="day-detail-time">
                      {{ formatTime(detail.visitTime) }}
                      <div class="day-detail-duration text-muted">
                        {{ formatDuration(detail.stayDuration) }}
                      </div>
                    </div>
                    <div class="day-detail-content">
                      <h5>{{ detail.title }}</h5>
                      <p v-if="detail.description" class="mb-2">{{ detail.description }}</p>

                      <div v-if="detail.attractionId" class="attraction-info">
                        <div v-if="detail.attraction" class="card mb-3">
                          <div class="row g-0">
                            <div class="col-md-4">
                              <img
                                :src="detail.attraction.firstImage1 || '/img/no-image.jpg'"
                                class="img-fluid rounded-start"
                                :alt="detail.attraction.title"
                              />
                            </div>
                            <div class="col-md-8">
                              <div class="card-body">
                                <h5 class="card-title">{{ detail.attraction.title }}</h5>
                                <p class="card-text">
                                  <small class="text-muted">
                                    <i class="fas fa-map-marker-alt"></i>
                                    {{ detail.attraction.sido }} {{ detail.attraction.gugun }}
                                  </small>
                                </p>
                                <p class="card-text attraction-overview">
                                  {{ detail.attraction.overview }}
                                </p>
                                <a
                                  :href="`/attractions/${detail.attraction.no}`"
                                  class="btn btn-sm btn-outline-primary"
                                  target="_blank"
                                >
                                  상세 정보 보기
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 지도 섹션 -->
          <div class="card mb-4">
            <div class="card-header bg-white">
              <h5 class="mb-0">
                <i class="fas fa-map me-2"></i>
                {{ selectedDay }}일차 경로
              </h5>
            </div>
            <div class="card-body p-0">
              <div id="map" style="height: 400px"></div>
            </div>
          </div>
        </div>

        <!-- 태그 -->
        <div v-if="post.tags && post.tags.length > 0" class="post-tags">
          <h5 class="tags-title">
            <i class="fas fa-tags me-2"></i>
            태그
          </h5>
          <PlanBoardTags :tags="post.tags" :clickable="true" @tag-click="goToTagSearch" />
        </div>

        <!-- 첨부 파일 -->
        <div v-if="post.attachmentFiles" class="post-attachments">
          <h5 class="attachments-title">
            <i class="fas fa-paperclip me-2"></i>
            첨부 파일
          </h5>
          <div class="attachment-list">
            <!-- 첨부 파일 목록 표시 로직 -->
            <div class="attachment-item">
              <i class="fas fa-file"></i>
              <span>첨부 파일 처리 로직 구현 필요</span>
            </div>
          </div>
        </div>

        <!-- 네비게이션 -->
        <div class="post-navigation">
          <div class="nav-buttons">
            <router-link to="/planboard" class="nav-btn list-btn">
              <i class="fas fa-list me-2"></i>
              목록으로
            </router-link>

            <div class="nav-post-buttons">
              <button v-if="previousPost" class="nav-btn prev-btn" @click="goToPost(previousPost.pboardNo)">
                <i class="fas fa-chevron-left me-2"></i>
                이전 글
              </button>

              <button v-if="nextPost" class="nav-btn next-btn" @click="goToPost(nextPost.pboardNo)">
                다음 글
                <i class="fas fa-chevron-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 댓글 섹션 -->
        <div class="comments-section">
          <PlanBoardComment
            :pboard-no="post.pboardNo"
            :comments="comments"
            :comment-count="post.commentCount"
            @comment-added="onCommentAdded"
            @comment-updated="onCommentUpdated"
            @comment-deleted="onCommentDeleted"
          />
        </div>

        <!-- 관련 게시글 추천 -->
        <div v-if="relatedPosts.length > 0" class="related-posts">
          <h5 class="related-title">
            <i class="fas fa-lightbulb me-2"></i>
            이런 여행 계획은 어때요?
          </h5>
          <div class="related-grid">
            <div v-for="relatedPost in relatedPosts" :key="relatedPost.pboardNo" class="related-item">
              <div class="related-card" @click="goToPost(relatedPost.pboardNo)">
                <img
                  :src="relatedPost.thumbnailImage || getDefaultThumbnail(relatedPost.travelTheme)"
                  :alt="relatedPost.title"
                  class="related-image"
                />
                <div class="related-content">
                  <h6 class="related-title-text">{{ relatedPost.title }}</h6>
                  <p class="related-travel-title">{{ relatedPost.travelTitle }}</p>
                  <div class="related-meta">
                    <span class="related-duration">{{ relatedPost.travelDuration }}일</span>
                    <span class="related-likes">
                      <i class="fas fa-heart text-danger me-1"></i>
                      {{ relatedPost.likeCount }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import planboardAPI from "@/api/planboard";
import planAPI from "@/api/plan";
import attractionAPI from "@/api/attraction";
import PlanBoardTags from "@/components/PlanBoard/PlanBoardTags.vue";
import PlanBoardComment from "@/components/PlanBoard/PlanBoardComment.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 상태 관리
const loading = ref(true);
const error = ref(null);
const post = ref(null);
const comments = ref([]);
const relatedPosts = ref([]);
const previousPost = ref(null);
const nextPost = ref(null);

// ✨ 새로 추가: 여행 일정 관련 상태
const planDetails = ref(null);
const selectedDay = ref(1);
let map = null;
let markers = [];

const pboardNo = computed(() => parseInt(route.params.pboardNo));

// 권한 확인
const isAuthor = computed(() => {
  return authStore.isAuthenticated && post.value && (post.value.userId === authStore.user?.id || authStore.isAdmin);
});

// ✨ 새로 추가: 여행 일정 관련 computed
// 일수 계산
const dayCount = computed(() => {
  if (!planDetails.value || !planDetails.value.startDate || !planDetails.value.endDate) return 0;

  const start = new Date(planDetails.value.startDate);
  const end = new Date(planDetails.value.endDate);
  const diffTime = Math.abs(end - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

// 총 방문 장소 수
const totalPlaces = computed(() => {
  if (!planDetails.value || !planDetails.value.details) return 0;
  return planDetails.value.details.filter((detail) => !!detail.title).length;
});

// 메서드
const fetchPostDetail = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await planboardAPI.getPlanBoardDetail(pboardNo.value);
    post.value = response.data;

    // ✨ 새로 추가: 여행 계획 정보가 있는 경우 상세 정보 로드
    if (post.value.planId) {
      await loadPlanDetails(post.value.planId);
    }

    // 댓글 로드
    await loadComments();

    // 관련 게시글 로드
    await loadRelatedPosts();

    // 이전/다음 게시글 로드 (옵션)
    await loadNavigationPosts();
  } catch (err) {
    console.error("게시글 상세 정보 조회 중 오류 발생:", err);
    if (err.response?.status === 404) {
      error.value = "게시글을 찾을 수 없습니다.";
    } else {
      error.value = "게시글을 불러오는 중 오류가 발생했습니다.";
    }
  } finally {
    loading.value = false;
  }
};

// ✨ 새로 추가: 여행 계획 상세 정보 로드
const loadPlanDetails = async (planId) => {
  try {
    const response = await planAPI.getPlanDetail(planId);
    planDetails.value = response.data;

    // 관광지 정보 로드
    await loadAttractionDetails();

    // 선택된 일차가 유효한지 확인
    if (selectedDay.value > dayCount.value) {
      selectedDay.value = 1;
    }
  } catch (error) {
    console.error("여행 계획 상세 정보 조회 중 오류 발생:", error);
  }
};

// ✨ 새로 추가: 관광지 정보 로드
const loadAttractionDetails = async () => {
  try {
    if (!planDetails.value || !planDetails.value.details) return;

    const attractionIds = planDetails.value.details
      .filter((detail) => detail.attractionId)
      .map((detail) => detail.attractionId);

    if (attractionIds.length === 0) return;

    const promises = attractionIds.map((id) => attractionAPI.getAttractionDetail(id));
    const responses = await Promise.allSettled(promises);

    responses.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const attraction = result.value.data;
        planDetails.value.details.forEach((detail) => {
          if (detail.attractionId === attraction.no) {
            detail.attraction = attraction;
          }
        });
      }
    });
  } catch (error) {
    console.error("관광지 정보 로드 중 오류 발생:", error);
  }
};

// ✨ 새로 추가: 특정 일차의 세부 일정 가져오기
const getDayDetails = (day) => {
  if (!planDetails.value || !planDetails.value.details) return [];

  return planDetails.value.details
    .filter((detail) => detail.dayNumber === day)
    .sort((a, b) => {
      if (a.visitTime && b.visitTime) {
        return a.visitTime.localeCompare(b.visitTime);
      } else if (a.visitTime) {
        return -1;
      } else if (b.visitTime) {
        return 1;
      } else {
        return (a.orderNo || 0) - (b.orderNo || 0);
      }
    });
};

// ✨ 새로 추가: 특정 일차의 날짜 계산
const getDayDate = (day) => {
  if (!planDetails.value || !planDetails.value.startDate) return "";

  const start = new Date(planDetails.value.startDate);
  const dayDate = new Date(start);
  dayDate.setDate(start.getDate() + day - 1);

  return dayDate.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};

// ✨ 새로 추가: 시간 포맷
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  return timeStr.substring(0, 5);
};

// ✨ 새로 추가: 소요 시간 포맷
const formatDuration = (minutes) => {
  if (!minutes) return "";

  if (minutes < 60) {
    return `${minutes}분`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}시간`;
    } else {
      return `${hours}시간 ${remainingMinutes}분`;
    }
  }
};

// ✨ 새로 추가: 지도 초기화
const initializeMap = () => {
  if (!window.kakao || !window.kakao.maps) return;

  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  const mapOption = {
    center: new window.kakao.maps.LatLng(33.450701, 126.570667),
    level: 7,
  };

  map = new window.kakao.maps.Map(mapContainer, mapOption);
};

// ✨ 새로 추가: 지도에 마커 표시
const updateMapMarkers = () => {
  if (!map || !window.kakao) return;

  // 기존 마커 제거
  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  // 선택된 일차의 세부 일정 가져오기
  const dayDetails = getDayDetails(selectedDay.value);

  // 관광지가 있는 일정만 필터링
  const locations = dayDetails
    .filter((detail) => detail.attraction && detail.attraction.latitude && detail.attraction.longitude)
    .map((detail, index) => ({
      title: detail.title,
      lat: parseFloat(detail.attraction.latitude),
      lng: parseFloat(detail.attraction.longitude),
      order: index + 1,
    }));

  if (locations.length === 0) return;

  // 마커 생성
  const bounds = new window.kakao.maps.LatLngBounds();

  locations.forEach((location) => {
    const position = new window.kakao.maps.LatLng(location.lat, location.lng);

    // 마커 생성
    const marker = new window.kakao.maps.Marker({
      position: position,
      map: map,
    });

    // 인포윈도우 생성
    const content = `
        <div style="padding:5px; width:150px; text-align:center; font-size:12px;">
          <strong>${location.order}. ${location.title}</strong>
        </div>
      `;

    const infowindow = new window.kakao.maps.InfoWindow({
      content: content,
      removable: true,
    });

    // 마커 클릭 시 인포윈도우 표시
    window.kakao.maps.event.addListener(marker, "click", function () {
      infowindow.open(map, marker);
    });

    // 배열에 마커 추가
    markers.push(marker);

    // 지도 범위에 포함
    bounds.extend(position);
  });

  // 경로선 그리기
  if (locations.length > 1) {
    const linePath = locations.map((location) => new window.kakao.maps.LatLng(location.lat, location.lng));

    const polyline = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 3,
      strokeColor: "#5882FA",
      strokeOpacity: 0.7,
      strokeStyle: "solid",
    });

    polyline.setMap(map);
  }

  // 지도 범위 설정
  map.setBounds(bounds);
};

const loadComments = async () => {
  try {
    const response = await planboardAPI.getComments(pboardNo.value);
    comments.value = response.data || [];
  } catch (error) {
    console.error("댓글 로드 오류:", error);
  }
};

const loadRelatedPosts = async () => {
  try {
    // 같은 테마의 다른 게시글 조회
    const params = {
      travelTheme: post.value.travelTheme,
      currentPage: 1,
      sortBy: "popular",
    };

    const response = await planboardAPI.getPlanBoards(params);
    relatedPosts.value = (response.data.list || []).filter((p) => p.pboardNo !== pboardNo.value).slice(0, 3);
  } catch (error) {
    console.error("관련 게시글 로드 오류:", error);
  }
};

const loadNavigationPosts = async () => {
  try {
    // 이전/다음 게시글 조회 로직 (실제 API 구현 필요)
    // 여기서는 간단히 생략
  } catch (error) {
    console.error("네비게이션 게시글 로드 오류:", error);
  }
};

const toggleLike = async () => {
  if (!authStore.isAuthenticated) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  try {
    const response = await planboardAPI.toggleLike(pboardNo.value);

    post.value.isLiked = response.data.isLiked;
    post.value.likeCount += response.data.isLiked ? 1 : -1;
  } catch (error) {
    console.error("좋아요 토글 오류:", error);
    alert("좋아요 처리 중 오류가 발생했습니다.");
  }
};

const sharePost = async () => {
  const shareUrl = window.location.href;
  const shareText = `${post.value.title} - ${post.value.travelTitle}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: shareText,
        text: post.value.content.substring(0, 100) + "...",
        url: shareUrl,
      });
    } catch (error) {
      console.log("공유 취소됨");
    }
  } else {
    // 클립보드에 복사
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("링크가 클립보드에 복사되었습니다!");
    } catch (error) {
      prompt("링크를 복사하세요:", shareUrl);
    }
  }
};

const confirmDelete = () => {
  if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
    deletePost();
  }
};

const deletePost = async () => {
  try {
    await planboardAPI.deletePlanBoard(pboardNo.value);
    alert("게시글이 삭제되었습니다.");
    router.push("/planboard");
  } catch (error) {
    console.error("게시글 삭제 오류:", error);
    alert("게시글 삭제에 실패했습니다.");
  }
};

const goToPost = (targetPboardNo) => {
  router.push(`/planboard/${targetPboardNo}`);
};

const goToTagSearch = (tagName) => {
  router.push({
    path: "/planboard",
    query: { tagName },
  });
};

const onCommentAdded = (newComment) => {
  comments.value.push(newComment);
  post.value.commentCount++;
};

const onCommentUpdated = (updatedComment) => {
  const index = comments.value.findIndex((c) => c.commentId === updatedComment.commentId);
  if (index !== -1) {
    comments.value[index] = updatedComment;
  }
};

const onCommentDeleted = (commentId) => {
  const index = comments.value.findIndex((c) => c.commentId === commentId);
  if (index !== -1) {
    comments.value.splice(index, 1);
    post.value.commentCount--;
  }
};

// 유틸리티 함수
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
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

const formatBudget = (budget) => {
  if (!budget) return "";
  return budget.toLocaleString() + "원";
};

const formatContent = (content) => {
  if (!content) return "";

  // 개행 문자를 <br>로 변환
  return content.replace(/\n/g, "<br>").replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
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

// ✨ 새로 추가: 선택된 일자가 변경될 때 지도 업데이트
watch(selectedDay, () => {
  setTimeout(() => {
    updateMapMarkers();
  }, 100);
});

// 라이프사이클
onMounted(() => {
  fetchPostDetail();
});

// ✨ 새로 추가: 여행 계획이 로드된 후 지도 초기화
watch(planDetails, (newPlanDetails) => {
  if (newPlanDetails && newPlanDetails.details && newPlanDetails.details.length > 0) {
    setTimeout(() => {
      initializeMap();
      updateMapMarkers();
    }, 1000);
  }
});

// 라우트 변경 감지
watch(
  () => route.params.pboardNo,
  (newPboardNo, oldPboardNo) => {
    if (newPboardNo !== oldPboardNo) {
      fetchPostDetail();
    }
  }
);
</script>

<style scoped>
.loading-section,
.error-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 2rem;
}

.post-detail {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.post-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  position: relative;
}

.header-content {
  margin-bottom: 1.5rem;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.post-category {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-weight: 500;
}

.post-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.travel-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #fff3cd;
}

.travel-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.travel-meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  opacity: 0.9;
}

.travel-meta-item i {
  width: 16px;
  text-align: center;
}

.post-author-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.author-details {
  flex: 1;
}

.author-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.author-meta {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.8;
}

.post-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.post-actions {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  text-decoration: none;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  color: white;
}

.like-btn.active {
  background: #ff6b6b;
  border-color: #ff6b6b;
}

.delete-btn:hover {
  background: #dc3545;
  border-color: #dc3545;
}

.author-actions {
  display: flex;
  gap: 0.5rem;
}

.post-thumbnail {
  padding: 0;
}

.thumbnail-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.post-content {
  padding: 2rem;
}

.content-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  word-break: break-word;
}

.content-text :deep(a) {
  color: #0d6efd;
  text-decoration: none;
}

.content-text :deep(a:hover) {
  text-decoration: underline;
}

/* ✨ 새로 추가: 여행 일정 스타일 */
.travel-schedule-section {
  padding: 2rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.timeline {
  position: relative;
  margin: 0 0 30px 0;
}

.timeline-item {
  position: relative;
  padding: 12px 0;
  border-left: 2px solid #e9ecef;
  padding-left: 20px;
  margin-left: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.timeline-item:hover {
  background-color: #f8f9fa;
}

.timeline-item-active {
  border-left: 2px solid #0d6efd;
  background-color: #e9f0ff;
}

.timeline-date {
  margin-bottom: 5px;
}

.timeline-day {
  font-weight: bold;
  margin-right: 10px;
}

.timeline-full-date {
  color: #6c757d;
  font-size: 0.9rem;
}

.timeline-item-brief {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 3px 0;
}

.day-detail-timeline {
  position: relative;
}

.day-detail-item {
  display: flex;
  margin-bottom: 30px;
  position: relative;
}

.day-detail-item:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 30px;
  left: 80px;
  height: calc(100% + 30px);
  border-left: 2px dashed #e9ecef;
}

.day-detail-time {
  min-width: 80px;
  font-weight: bold;
  text-align: center;
  padding-top: 5px;
}

.day-detail-duration {
  font-size: 0.8rem;
  font-weight: normal;
}

.day-detail-content {
  flex: 1;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-left: 20px;
  position: relative;
}

.day-detail-content::before {
  content: "";
  position: absolute;
  top: 15px;
  left: -10px;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid #f8f9fa;
}

.attraction-overview {
  max-height: 4.5em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.post-tags {
  padding: 1.5rem 2rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.tags-title {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.post-attachments {
  padding: 1.5rem 2rem;
  border-top: 1px solid #eee;
}

.attachments-title {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.post-navigation {
  padding: 1.5rem 2rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-post-buttons {
  display: flex;
  gap: 1rem;
}

.nav-btn {
  background: white;
  border: 1px solid #dee2e6;
  color: #495057;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.nav-btn:hover {
  background: #0d6efd;
  border-color: #0d6efd;
  color: white;
  transform: translateY(-1px);
}

.comments-section {
  padding: 2rem;
  border-top: 1px solid #eee;
}

.related-posts {
  padding: 2rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.related-title {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.related-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.related-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.related-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.related-content {
  padding: 1rem;
}

.related-title-text {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-travel-title {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .post-header {
    padding: 1.5rem 1rem;
  }

  .post-title {
    font-size: 1.8rem;
  }

  .travel-title {
    font-size: 1.2rem;
  }

  .travel-meta {
    flex-direction: column;
    gap: 0.75rem;
  }

  .post-author-info {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .post-stats {
    justify-content: center;
  }

  .post-actions {
    position: static;
    justify-content: center;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .post-content {
    padding: 1.5rem 1rem;
  }

  .post-tags,
  .post-attachments,
  .post-navigation,
  .comments-section,
  .related-posts,
  .travel-schedule-section {
    padding: 1.5rem 1rem;
  }

  .nav-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-post-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .related-grid {
    grid-template-columns: 1fr;
  }

  .day-detail-item {
    flex-direction: column;
    gap: 1rem;
  }

  .day-detail-item::after {
    display: none;
  }

  .day-detail-time {
    min-width: auto;
    text-align: left;
  }

  .day-detail-content {
    margin-left: 0;
  }

  .day-detail-content::before {
    display: none;
  }
}
</style>
