<!-- src/views/planboard/PlanBoardWriteView.vue -->
<template>
  <div class="planboard-write-view">
    <div class="container py-4">
      <!-- 페이지 헤더 -->
      <div class="page-header mb-4">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item active">{{ isEdit ? "여행기 수정" : "여행기 작성" }}</li>
          </ol>
        </nav>
        <h1 class="h2">
          <i class="fas fa-pen-alt me-2"></i>
          {{ isEdit ? "여행기 수정" : "새 여행기 작성" }}
        </h1>
        <p class="text-muted">나만의 특별한 여행 경험을 다른 분들과 공유해보세요!</p>
      </div>

      <div class="row">
        <div class="col-lg-8">
          <!-- 여행 계획 선택 단계 -->
          <div v-if="!selectedPlan && !isEdit" class="plan-selection-step">
            <PlanSelector @plan-selected="handlePlanSelected" @selection-cancelled="handleSelectionCancelled" />
          </div>

          <!-- 게시글 작성 폼 -->
          <div v-if="selectedPlan || isEdit || showDirectWrite" class="write-form">
            <form @submit.prevent="handleSubmit">
              <div class="card">
                <div class="card-header bg-light">
                  <h5 class="mb-0">
                    <i class="fas fa-edit me-2"></i>
                    여행기 작성
                  </h5>
                </div>
                <div class="card-body">
                  <!-- 선택된 여행 계획 요약 (수정 시에만 표시하지 않음) -->
                  <div v-if="selectedPlan && !isEdit" class="selected-plan-summary alert alert-info">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="alert-heading">
                          <i class="fas fa-route me-2"></i>
                          선택된 여행 계획: {{ selectedPlan.title }}
                        </h6>
                        <p class="mb-1">
                          <i class="fas fa-calendar-alt me-1"></i>
                          {{ formatDate(selectedPlan.startDate) }} ~ {{ formatDate(selectedPlan.endDate) }} ({{
                            calculateDays(selectedPlan.startDate, selectedPlan.endDate)
                          }}일)
                        </p>
                        <p class="mb-0">
                          <i class="fas fa-map-pin me-1"></i>
                          관광지 {{ selectedPlan.details ? selectedPlan.details.length : 0 }}개
                        </p>
                      </div>
                      <button type="button" class="btn btn-sm btn-outline-secondary" @click="changePlan">
                        <i class="fas fa-exchange-alt me-1"></i>
                        계획 변경
                      </button>
                    </div>
                  </div>

                  <!-- 기본 정보 입력 -->
                  <div class="row mb-4">
                    <div class="col-md-8">
                      <label for="title" class="form-label required">
                        <i class="fas fa-heading me-1"></i>
                        게시글 제목
                      </label>
                      <input
                        type="text"
                        id="title"
                        v-model="form.title"
                        class="form-control"
                        placeholder="매력적인 제목을 입력해주세요"
                        required
                        maxlength="100"
                      />
                      <div class="form-text">{{ form.title.length }}/100자</div>
                    </div>
                    <div class="col-md-4">
                      <label for="travelTheme" class="form-label">
                        <i class="fas fa-palette me-1"></i>
                        여행 테마
                      </label>
                      <select id="travelTheme" v-model="form.travelTheme" class="form-select">
                        <option value="">테마 선택</option>
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
                  </div>
                  <!-- 🔥 새로 추가되는 공개/비공개 설정 부분 🔥 -->
                  <div class="row mb-4">
                    <div class="col-12">
                      <label class="form-label">
                        <i class="fas fa-eye me-1"></i>
                        공개 설정
                      </label>
                      <div class="public-toggle-container">
                        <div class="form-check form-switch">
                          <input
                            class="form-check-input public-toggle-switch"
                            type="checkbox"
                            id="isPublic"
                            v-model="form.isPublic"
                            :class="{ 'switch-on': form.isPublic, 'switch-off': !form.isPublic }"
                          />
                          <label class="form-check-label public-toggle-label" for="isPublic">
                            <div class="toggle-content">
                              <div class="toggle-icon">
                                <i
                                  :class="form.isPublic ? 'fas fa-globe text-success' : 'fas fa-lock text-warning'"
                                ></i>
                              </div>
                              <div class="toggle-text">
                                <strong>{{ form.isPublic ? "공개" : "비공개" }}</strong>
                                <small class="toggle-description">
                                  {{
                                    form.isPublic
                                      ? "모든 사용자가 이 게시글을 볼 수 있습니다"
                                      : "본인만 이 게시글을 볼 수 있습니다"
                                  }}
                                </small>
                              </div>
                            </div>
                          </label>
                        </div>

                        <!-- 공개/비공개 상태에 따른 추가 정보 -->
                        <div class="public-status-info">
                          <div v-if="form.isPublic" class="alert alert-info alert-sm">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>공개 게시글:</strong> 다른 사용자들이 검색하고 댓글을 달 수 있습니다.
                          </div>
                          <div v-else class="alert alert-warning alert-sm">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>비공개 게시글:</strong> 본인만 볼 수 있으며, 나중에 공개로 변경할 수 있습니다.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 여행 상세 정보 -->
                  <div class="row mb-4">
                    <div class="col-md-8">
                      <label for="travelTitle" class="form-label">
                        <i class="fas fa-map me-1"></i>
                        여행 이름
                      </label>
                      <input
                        type="text"
                        id="travelTitle"
                        v-model="form.travelTitle"
                        class="form-control"
                        placeholder="예: 제주도 힐링 여행"
                        maxlength="50"
                      />
                    </div>
                    <div class="col-md-4">
                      <label for="travelDuration" class="form-label">
                        <i class="fas fa-clock me-1"></i>
                        여행 기간 (일)
                      </label>
                      <input
                        type="number"
                        id="travelDuration"
                        v-model.number="form.travelDuration"
                        class="form-control"
                        :class="{ 'readonly-input': selectedPlan }"
                        min="1"
                        max="365"
                        placeholder="일수"
                        :readonly="selectedPlan"
                        :title="selectedPlan ? '선택된 여행 계획의 일수입니다' : ''"
                      />
                      <div v-if="selectedPlan" class="form-text text-info">
                        <i class="fas fa-info-circle me-1"></i>
                        선택된 여행 계획의 일수
                      </div>
                    </div>
                  </div>

                  <div class="row mb-4">
                    <div class="col-md-6">
                      <label for="travelDestinations" class="form-label">
                        <i class="fas fa-map-marker-alt me-1"></i>
                        주요 목적지
                      </label>
                      <input
                        type="text"
                        id="travelDestinations"
                        v-model="form.travelDestinations"
                        class="form-control"
                        placeholder="예: 제주도, 서귀포시, 성산일출봉"
                        maxlength="100"
                      />
                      <div class="form-text">쉼표(,)로 구분해서 입력해주세요</div>
                    </div>
                    <div class="col-md-6">
                      <label for="participantCount" class="form-label">
                        <i class="fas fa-users me-1"></i>
                        여행 인원
                      </label>
                      <select id="participantCount" v-model.number="form.participantCount" class="form-select">
                        <option :value="null">인원 선택</option>
                        <option :value="1">혼자 여행</option>
                        <option :value="2">2명 (커플/친구)</option>
                        <option :value="3">3명</option>
                        <option :value="4">4명 (가족)</option>
                        <option :value="5">5명 이상</option>
                      </select>
                    </div>
                  </div>

                  <!-- 여행 일정 정보 (선택된 계획이 있을 때만 표시) -->
                  <div v-if="selectedPlan && selectedPlan.details" class="travel-schedule mb-4">
                    <h6 class="mb-3">
                      <i class="fas fa-calendar-alt me-2"></i>
                      여행 일정 미리보기
                    </h6>
                    <div class="schedule-preview">
                      <div v-for="(dayGroup, dayNumber) in groupedSchedule" :key="dayNumber" class="day-schedule">
                        <div class="day-header">
                          <span class="day-number">{{ dayNumber }}일차</span>
                          <span class="day-date">{{ getDayDate(dayNumber) }}</span>
                        </div>
                        <div class="day-attractions">
                          <div v-for="detail in dayGroup" :key="detail.detailId" class="attraction-item">
                            <i class="fas fa-map-pin text-primary me-2"></i>
                            {{ detail.title }}
                            <span v-if="detail.visitTime" class="visit-time"> ({{ detail.visitTime }}) </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 본문 내용 -->
                  <div class="mb-4">
                    <label for="content" class="form-label required">
                      <i class="fas fa-file-alt me-1"></i>
                      여행기 내용
                    </label>
                    <textarea
                      id="content"
                      v-model="form.content"
                      class="form-control"
                      rows="12"
                      placeholder="여행에서 경험한 특별한 순간들을 자세히 공유해주세요.&#10;&#10;- 어떤 곳을 방문했나요?&#10;- 가장 인상 깊었던 경험은?&#10;- 다른 여행자들에게 추천하고 싶은 팁이 있다면?&#10;- 맛집이나 숨은 명소가 있었다면?"
                      required
                      maxlength="5000"
                    ></textarea>
                    <div class="form-text">{{ form.content.length }}/5000자</div>
                  </div>
                </div>
                <!-- 1. 본문 내용 입력 부분 다음에 추가할 HTML (line 220 정도) -->
                <!-- 본문 내용 다음에 바로 추가 -->
                <!-- ✨ 새로 추가: 선택된 여행 계획의 상세 일정 미리보기 -->
                <div
                  v-if="selectedPlan && selectedPlan.details && selectedPlan.details.length > 0"
                  class="travel-schedule-preview mb-4"
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
                              v-for="day in planDayCount"
                              :key="day"
                              class="timeline-item"
                              :class="{ 'timeline-item-active': selectedPlanDay === day }"
                              @click="selectedPlanDay = day"
                            >
                              <div class="timeline-date">
                                <span class="timeline-day">{{ day }}일차</span>
                                <span class="timeline-full-date">{{ getPlanDayDate(day) }}</span>
                              </div>
                              <div class="timeline-content">
                                <div v-if="getPlanDayDetails(day).length === 0" class="text-muted">일정 없음</div>
                                <div v-else>
                                  <div
                                    v-for="(detail, index) in getPlanDayDetails(day)"
                                    :key="index"
                                    class="timeline-item-brief"
                                  >
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
                              <span class="badge bg-primary rounded-pill">{{ planDayCount }}일</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                              <span><i class="fas fa-map-marked-alt me-2"></i> 방문 장소</span>
                              <span class="badge bg-primary rounded-pill">{{ planTotalPlaces }}곳</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                              <span><i class="fas fa-route me-2"></i> 여행 계획</span>
                              <span>{{ selectedPlan.title }}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 선택된 일차 상세 정보 -->
                  <div class="card mb-4">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center">
                      <h5 class="mb-0">{{ selectedPlanDay }}일차 상세 일정 ({{ getPlanDayDate(selectedPlanDay) }})</h5>
                      <div class="btn-group"></div>
                    </div>
                    <div class="card-body">
                      <div v-if="getPlanDayDetails(selectedPlanDay).length === 0" class="text-center py-4">
                        <p class="text-muted mb-3">이 날짜에 계획된 일정이 없습니다.</p>
                      </div>
                      <div v-else>
                        <div class="day-detail-timeline">
                          <div
                            v-for="(detail, index) in getPlanDayDetails(selectedPlanDay)"
                            :key="index"
                            class="day-detail-item"
                          >
                            <div class="day-detail-time">
                              {{ formatPlanTime(detail.visitTime) }}
                              <div class="day-detail-duration text-muted">
                                {{ formatPlanDuration(detail.stayDuration) }}
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
                                        style="height: 100px; object-fit: cover"
                                      />
                                    </div>
                                    <div class="col-md-8">
                                      <div class="card-body">
                                        <h6 class="card-title">{{ detail.attraction.title }}</h6>
                                        <p class="card-text">
                                          <small class="text-muted">
                                            <i class="fas fa-map-marker-alt"></i>
                                            {{ detail.attraction.sido }} {{ detail.attraction.gugun }}
                                          </small>
                                        </p>
                                        <p class="card-text attraction-overview-small">
                                          {{ detail.attraction.overview }}
                                        </p>
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
                        {{ selectedPlanDay }}일차 경로
                      </h5>
                    </div>
                    <div class="card-body p-0">
                      <div id="writeMap" style="height: 300px"></div>
                    </div>
                  </div>
                </div>
                <!-- 폼 액션 버튼 -->
                <div class="card-footer bg-light">
                  <div class="d-flex justify-content-between">
                    <div>
                      <button
                        type="button"
                        class="btn btn-outline-secondary me-2"
                        @click="saveDraft"
                        :disabled="isSubmitting"
                      >
                        <i class="fas fa-save me-1"></i>
                        임시저장
                      </button>
                      <button type="button" class="btn btn-outline-secondary" @click="handleCancel">
                        <i class="fas fa-times me-1"></i>
                        취소
                      </button>
                    </div>
                    <button type="submit" class="btn btn-primary" :disabled="!isFormValid || isSubmitting">
                      <span v-if="isSubmitting">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        {{ isEdit ? "수정 중..." : "작성 중..." }}
                      </span>
                      <span v-else>
                        <i class="fas fa-paper-plane me-1"></i>
                        {{ isEdit ? "수정 완료" : "여행기 작성" }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 기존 여행 상세 정보 다음에 추가 -->
              <div class="row mb-4">
                <div class="col-md-6">
                  <label for="estimatedBudget" class="form-label">
                    <i class="fas fa-won-sign me-1"></i>
                    예상 예산 (원)
                  </label>
                  <input
                    type="number"
                    id="estimatedBudget"
                    v-model.number="form.estimatedBudget"
                    class="form-control"
                    placeholder="예: 500000"
                    min="0"
                  />
                  <div class="form-text">선택사항입니다</div>
                </div>

                <!-- 공개/비공개 설정 추가 -->
                <div class="col-md-6">
                  <label class="form-label">
                    <i class="fas fa-eye me-1"></i>
                    게시글 공개 설정
                  </label>
                  <div class="public-toggle-container">
                    <div class="public-toggle-wrapper">
                      <input type="checkbox" id="isPublic" v-model="form.isPublic" class="public-toggle-input" />
                      <label for="isPublic" class="public-toggle-label">
                        <span class="public-toggle-slider"></span>
                        <span class="public-toggle-text">
                          <span class="public-text">공개</span>
                          <span class="private-text">비공개</span>
                        </span>
                      </label>
                    </div>
                    <div class="public-toggle-description">
                      <div v-if="form.isPublic" class="public-description">
                        <i class="fas fa-globe-asia text-success me-1"></i>
                        <small class="text-success fw-bold">모든 사용자가 볼 수 있습니다</small>
                      </div>
                      <div v-else class="private-description">
                        <i class="fas fa-lock text-warning me-1"></i>
                        <small class="text-warning fw-bold">본인만 볼 수 있습니다</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
            <div class="card">
              <div class="card-header bg-light">
                <h5 class="mb-0">
                  <i class="fas fa-tags me-1"></i>
                  태그 추가
                </h5>
              </div>
              <div class="card-body">
                <!-- 태그 입력 -->
                <div class="mb-4">
                  <label class="form-label">
                    <i class="fas fa-tags me-1"></i>
                    태그
                  </label>
                  <PlanBoardTags
                    :tags="tagList"
                    :editable="true"
                    :removable="true"
                    @tag-add="addTag"
                    @tag-remove="removeTag"
                    @tags-updated="updateTags"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 직접 작성 옵션 (여행 계획이 없는 경우) -->
          <div v-if="!selectedPlan && !isEdit && !showDirectWrite" class="direct-write-option mt-3">
            <div class="alert alert-info">
              <div class="text-center">
                <h6 class="alert-heading">여행 계획 없이 직접 작성하시겠어요?</h6>
                <p class="mb-3">기존 여행 계획이 없어도 여행기를 작성할 수 있습니다.</p>
                <button class="btn btn-outline-primary" @click="startDirectWrite">
                  <i class="fas fa-pen me-1"></i>
                  직접 작성하기
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 사이드바 -->
        <div class="col-lg-4">
          <div class="sidebar">
            <!-- 작성 가이드 -->
            <div class="card mb-4">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="fas fa-lightbulb me-2"></i>
                  작성 가이드
                </h6>
              </div>
              <div class="card-body">
                <div class="guide-item">
                  <h6>📝 좋은 여행기 작성 팁</h6>
                  <ul class="small">
                    <li>구체적인 장소와 경험을 포함하세요</li>
                    <li>사진과 함께 설명하면 더 생생해요</li>
                    <li>실용적인 팁(교통, 맛집 등)을 공유하세요</li>
                    <li>솔직한 후기가 더 도움이 됩니다</li>
                  </ul>
                </div>
                <div class="guide-item">
                  <h6>🏷️ 태그 활용</h6>
                  <ul class="small">
                    <li>지역명, 테마, 특징을 태그로 추가</li>
                    <li>다른 사용자가 쉽게 찾을 수 있어요</li>
                    <li>예: #제주도 #힐링 #맛집투어</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 인기 태그 -->
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="fas fa-fire me-2"></i>
                  인기 태그
                </h6>
              </div>
              <div class="card-body">
                <div class="popular-tags">
                  <span
                    v-for="tag in popularTags"
                    :key="tag"
                    class="badge bg-light text-dark me-1 mb-1 clickable-tag"
                    @click="addPopularTag(tag)"
                  >
                    #{{ tag }}
                  </span>
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
import PlanSelector from "@/components/planboard/PlanSelector.vue";
import PlanBoardTags from "@/components/planboard/PlanBoardTags.vue";
import attractionAPI from "@/api/attraction";
import planAPI from "@/api/plan";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// ✨ 새로 추가: 여행 일정 미리보기 관련 상태
const selectedPlanDay = ref(1);
let writeMap = null;
let writeMapMarkers = [];

// 상태 관리
const isEdit = computed(() => !!route.params.pboardNo);
const selectedPlan = ref(null);
const showDirectWrite = ref(false);
const isSubmitting = ref(false);
const tagList = ref([]);
const popularTags = ref([
  "제주도",
  "부산",
  "서울",
  "강릉",
  "여수",
  "경주",
  "전주",
  "춘천",
  "힐링",
  "맛집",
  "카페",
  "바다",
  "산",
  "야경",
  "일출",
  "혼자여행",
  "커플여행",
  "가족여행",
  "친구여행",
  "사진맛집",
  "핫플레이스",
]);

// form 데이터에 isPublic 추가
const form = ref({
  title: "",
  content: "",
  travelTitle: "",
  travelTheme: "",
  travelDestinations: "",
  travelDuration: null,
  participantCount: null,
  estimatedBudget: null, // 예산 필드도 추가
  planId: null,
  tagNames: "",
  isPublic: true, // 기본값은 공개로 설정
});

// 계산된 속성
const isFormValid = computed(() => {
  return form.value.title.trim() && form.value.content.trim();
});

const groupedSchedule = computed(() => {
  if (!selectedPlan.value || !selectedPlan.value.details) return {};

  const grouped = {};
  selectedPlan.value.details.forEach((detail) => {
    if (!grouped[detail.dayNumber]) {
      grouped[detail.dayNumber] = [];
    }
    grouped[detail.dayNumber].push(detail);
  });

  // 각 일차별로 orderNo 순으로 정렬
  Object.keys(grouped).forEach((day) => {
    grouped[day].sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0));
  });

  return grouped;
});

// 메서드
const handlePlanSelected = async (plan) => {
  selectedPlan.value = plan;

  // 폼에 여행 계획 정보 자동 입력
  if (plan) {
    form.value.planId = plan.planId;
    form.value.travelTitle = plan.title;
    form.value.travelDuration = calculateDays(plan.startDate, plan.endDate);

    // 목적지 추출 (details에서 관광지명들 추출)
    if (plan.details && plan.details.length > 0) {
      const destinations = [...new Set(plan.details.map((detail) => detail.title))];
      form.value.travelDestinations = destinations.slice(0, 5).join(", ");
    }

    // 기본 제목 제안
    if (!form.value.title) {
      form.value.title = `${plan.title} 여행기`;
    }

    // ✨ 새로 추가: 관광지 정보 로드
    await loadPlanAttractionDetails();

    // 선택된 일차가 유효한지 확인
    if (selectedPlanDay.value > planDayCount.value) {
      selectedPlanDay.value = 1;
    }

    // 지도 초기화
    setTimeout(() => {
      initializeWriteMap();
      updateWriteMapMarkers();
    }, 1000);
  }
};

const handleSelectionCancelled = () => {
  selectedPlan.value = null;
};

const loadPlanAttractionDetails = async () => {
  try {
    if (!selectedPlan.value || !selectedPlan.value.details) return;

    const attractionIds = selectedPlan.value.details
      .filter((detail) => detail.attractionId)
      .map((detail) => detail.attractionId);

    if (attractionIds.length === 0) return;

    const promises = attractionIds.map((id) => attractionAPI.getAttractionDetail(id));
    const responses = await Promise.allSettled(promises);

    responses.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const attraction = result.value.data;
        selectedPlan.value.details.forEach((detail) => {
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
const getPlanDayDetails = (day) => {
  if (!selectedPlan.value || !selectedPlan.value.details) return [];

  return selectedPlan.value.details
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
const getPlanDayDate = (day) => {
  if (!selectedPlan.value || !selectedPlan.value.startDate) return "";

  const start = new Date(selectedPlan.value.startDate);
  const dayDate = new Date(start);
  dayDate.setDate(start.getDate() + day - 1);

  return dayDate.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};

// ✨ 새로 추가: 시간 포맷
const formatPlanTime = (timeStr) => {
  if (!timeStr) return "";
  return timeStr.substring(0, 5);
};

// ✨ 새로 추가: 소요 시간 포맷
const formatPlanDuration = (minutes) => {
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
const initializeWriteMap = () => {
  if (!window.kakao || !window.kakao.maps) return;

  const mapContainer = document.getElementById("writeMap");
  if (!mapContainer) return;

  const mapOption = {
    center: new window.kakao.maps.LatLng(33.450701, 126.570667),
    level: 7,
  };

  writeMap = new window.kakao.maps.Map(mapContainer, mapOption);
};

// ✨ 새로 추가: 지도에 마커 표시
const updateWriteMapMarkers = () => {
  if (!writeMap || !window.kakao) return;

  // 기존 마커 제거
  writeMapMarkers.forEach((marker) => marker.setMap(null));
  writeMapMarkers = [];

  // 선택된 일차의 세부 일정 가져오기
  const dayDetails = getPlanDayDetails(selectedPlanDay.value);

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
      map: writeMap,
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
      infowindow.open(writeMap, marker);
    });

    // 배열에 마커 추가
    writeMapMarkers.push(marker);

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

    polyline.setMap(writeMap);
  }

  // 지도 범위 설정
  writeMap.setBounds(bounds);
};

const changePlan = () => {
  selectedPlan.value = null;
  showDirectWrite.value = false;

  // 폼 초기화 (제목과 내용은 유지)
  const titleBackup = form.value.title;
  const contentBackup = form.value.content;

  form.value = {
    title: titleBackup,
    content: contentBackup,
    travelTitle: "",
    travelTheme: "",
    travelDestinations: "",
    travelDuration: null,
    participantCount: null,
    planId: null,
    tagNames: "",
  };
};

const startDirectWrite = () => {
  showDirectWrite.value = true;
};

const removeTag = (tag) => {
  const tagName = typeof tag === "string" ? tag : tag.tagName;
  const index = tagList.value.findIndex((t) => t.tagName === tagName);
  if (index > -1) {
    tagList.value.splice(index, 1);
    updateTagNames();
  }
};

const updateTags = (newTags) => {
  tagList.value = [...newTags];
  updateTagNames();
};

const addPopularTag = (tagName) => {
  // 이벤트 전파 방지
  event?.stopPropagation();
  event?.preventDefault();

  if (!tagName || !tagName.trim()) return;

  const trimmedTag = tagName.trim();
  if (!tagList.value.find((tag) => tag.tagName === trimmedTag)) {
    tagList.value.push({ tagName: trimmedTag, useCount: 1 });
    updateTagNames();
  }
};

const updateTagNames = () => {
  form.value.tagNames = tagList.value.map((tag) => tag.tagName).join(",");
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

const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const getDayDate = (dayNumber) => {
  if (!selectedPlan.value || !selectedPlan.value.startDate) return "";

  const startDate = new Date(selectedPlan.value.startDate);
  const dayDate = new Date(startDate);
  dayDate.setDate(startDate.getDate() + dayNumber - 1);

  return dayDate.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};

const saveDraft = async () => {
  try {
    // 임시저장 로직 (localStorage 활용)
    const draftData = {
      ...form.value,
      selectedPlan: selectedPlan.value,
      tagList: tagList.value,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("planboard_draft", JSON.stringify(draftData));
    alert("임시저장되었습니다.");
  } catch (error) {
    console.error("임시저장 오류:", error);
    alert("임시저장에 실패했습니다.");
  }
};

const loadDraft = () => {
  try {
    const draftData = localStorage.getItem("planboard_draft");
    if (draftData) {
      const draft = JSON.parse(draftData);

      if (confirm("임시저장된 데이터가 있습니다. 불러오시겠습니까?")) {
        form.value = { ...draft };
        selectedPlan.value = draft.selectedPlan;
        tagList.value = draft.tagList || [];
        showDirectWrite.value = !selectedPlan.value;
      }
    }
  } catch (error) {
    console.error("임시저장 데이터 로드 오류:", error);
  }
};

// handleSubmit 함수에서 DB 저장 시 변환
const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert("제목과 내용을 모두 입력해주세요.");
    return;
  }

  try {
    isSubmitting.value = true;

    const submitData = {
      ...form.value,
      tagNames: form.value.tagNames || "",
      isPublic: form.value.isPublic ? 1 : 0, // 🔥 boolean을 숫자로 변환 (DB 저장용)
    };

    if (isEdit.value) {
      await planboardAPI.updatePlanBoard(route.params.pboardNo, submitData);
      alert("여행기가 수정되었습니다.");
    } else {
      await planboardAPI.createPlanBoard(submitData);
      alert("새로운 여행기가 작성되었습니다.");

      // 임시저장 데이터 삭제
      localStorage.removeItem("planboard_draft");
    }

    router.push("/planboard");
  } catch (error) {
    console.error("게시글 저장 오류:", error);
    alert(isEdit.value ? "게시글 수정에 실패했습니다." : "게시글 작성에 실패했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  if (confirm("작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?")) {
    router.push("/planboard");
  }
};

// loadExistingPost 함수에서 기존 데이터 로드시 여행 계획 정보도 함께 로드
const loadExistingPost = async () => {
  if (isEdit.value) {
    try {
      const response = await planboardAPI.getPlanBoardDetail(route.params.pboardNo);
      const post = response.data;

      form.value = {
        title: post.title || "",
        content: post.content || "",
        travelTitle: post.travelTitle || "",
        travelTheme: post.travelTheme || "",
        travelDestinations: post.travelDestinations || "",
        travelDuration: post.travelDuration || null,
        participantCount: post.participantCount || null,
        estimatedBudget: post.estimatedBudget || null,
        planId: post.planId || null,
        tagNames: post.tagNames || "",
        isPublic: post.isPublic !== undefined ? post.isPublic : true, // 기존 데이터의 공개 설정 로드
      };

      // 태그 리스트 설정
      if (post.tagNames) {
        tagList.value = post.tagNames.split(",").map((tag) => ({
          tagName: tag.trim(),
          useCount: 1,
        }));
      }

      // 🔥 수정: 여행 계획이 있는 경우 해당 계획 정보를 로드
      if (post.planId) {
        try {
          // 여행 계획 상세 정보 가져오기
          const planResponse = await planAPI.getPlanDetail(post.planId);
          selectedPlan.value = planResponse.data;

          // 여행 계획의 관광지 정보도 로드
          await loadPlanAttractionDetails();

          // 선택된 일차가 유효한지 확인
          if (selectedPlanDay.value > planDayCount.value) {
            selectedPlanDay.value = 1;
          }

          // 지도 초기화 (약간의 지연 후)
          setTimeout(() => {
            initializeWriteMap();
            updateWriteMapMarkers();
          }, 1000);
        } catch (planError) {
          console.error("여행 계획 로드 오류:", planError);
          // 여행 계획 로드에 실패해도 게시글 수정은 가능하도록 처리
          selectedPlan.value = null;
        }
      }

      showDirectWrite.value = true;
    } catch (error) {
      console.error("게시글 로드 오류:", error);
      alert("게시글을 불러오는데 실패했습니다.");
      router.push("/planboard");
    }
  }
};

// ✨ 새로 추가: 여행 계획 관련 computed
// 일수 계산
const planDayCount = computed(() => {
  if (!selectedPlan.value || !selectedPlan.value.startDate || !selectedPlan.value.endDate) return 0;

  const start = new Date(selectedPlan.value.startDate);
  const end = new Date(selectedPlan.value.endDate);
  const diffTime = Math.abs(end - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

// 총 방문 장소 수
const planTotalPlaces = computed(() => {
  if (!selectedPlan.value || !selectedPlan.value.details) return 0;
  return selectedPlan.value.details.filter((detail) => !!detail.title).length;
});

// ✨ 새로 추가: 선택된 일자가 변경될 때 지도 업데이트
watch(selectedPlanDay, () => {
  setTimeout(() => {
    updateWriteMapMarkers();
  }, 100);
});

// 라이프사이클
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  if (isEdit.value) {
    await loadExistingPost();
  } else {
    loadDraft(); // 새 작성 시에만 임시저장 데이터 확인
  }
});
</script>

<style scoped>
/* ===== 전체 레이아웃 ===== */
.planboard-write-view {
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.container {
  max-width: 1200px;
}

/* ===== 페이지 헤더 ===== */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem 0;
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.breadcrumb {
  justify-content: center;
  background: transparent;
  margin-bottom: 1rem;
}

.breadcrumb-item a {
  color: #6c757d;
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb-item a:hover {
  color: #0d6efd;
}

.breadcrumb-item.active {
  color: #0d6efd;
  font-weight: 600;
}

.page-header h1 {
  color: #212529;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-header p {
  color: #6c757d;
  font-size: 1.1rem;
  margin-bottom: 0;
}

/* ===== 카드 스타일 ===== */
.card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 15px;
  overflow: hidden;
  background: white;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-bottom: none;
  position: relative;
  overflow: hidden;
}

.card-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.card-header:hover::before {
  left: 100%;
}

.card-header h5,
.card-header h6 {
  margin-bottom: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.card-header i {
  color: rgba(255, 255, 255, 0.9);
  margin-right: 0.5rem;
}

.card-body {
  padding: 2rem;
  background: white;
}

.card-footer {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-top: 1px solid #dee2e6;
  padding: 1.5rem;
}

/* ===== 선택된 여행 계획 요약 ===== */
.selected-plan-summary {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border: 1px solid #bbdefb;
  border-left: 4px solid #0d6efd;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.selected-plan-summary::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #0d6efd, #6610f2, #0d6efd);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.selected-plan-summary .alert-heading {
  color: #0d6efd;
  font-weight: 700;
  margin-bottom: 1rem;
}

.selected-plan-summary p {
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: 500;
}

.selected-plan-summary .btn-outline-secondary {
  border-color: #6c757d;
  color: #6c757d;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.selected-plan-summary .btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

/* ===== 폼 요소 스타일 ===== */
.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.form-label i {
  color: #0d6efd;
  width: 18px;
  margin-right: 0.5rem;
}

.form-label.required::after {
  content: " *";
  color: #dc3545;
  font-weight: 700;
}

.form-control,
.form-select {
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
  background: #f8f9ff;
}

.form-control:hover,
.form-select:hover {
  border-color: #adb5bd;
}

.form-text {
  font-size: 0.85rem;
  color: #6c757d;
  text-align: right;
  margin-top: 0.5rem;
  font-weight: 500;
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

/* ===== 여행 일정 미리보기 ===== */
.travel-schedule {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
}

.travel-schedule h6 {
  color: #495057;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #0d6efd;
  display: inline-block;
}

.schedule-preview {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.day-schedule {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
}

.day-schedule:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.day-schedule:last-child {
  margin-bottom: 0;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 1rem;
}

.day-number {
  background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.3);
}

.day-date {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 600;
  background: #f8f9fa;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
}

.day-attractions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.attraction-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #495057;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
  position: relative;
}

.attraction-item:hover {
  border-left-color: #0d6efd;
  background: linear-gradient(135deg, #e8f4ff 0%, #f0f7ff 100%);
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.15);
}

.attraction-item i {
  margin-right: 0.75rem;
  width: 16px;
  flex-shrink: 0;
}

.visit-time {
  margin-left: auto;
  font-size: 0.75rem;
  color: #6c757d;
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  border: 1px solid #dee2e6;
}

/* ===== 직접 작성 옵션 ===== */
.direct-write-option {
  margin-top: 2rem;
  animation: fadeInUp 0.5s ease-out;
}

.direct-write-option .alert {
  border: 2px dashed #0d6efd;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
  border-radius: 15px;
  padding: 2.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.direct-write-option .alert::before {
  content: "";
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #0d6efd, #6610f2, #0d6efd);
  border-radius: 15px;
  z-index: -1;
  animation: borderRotate 3s linear infinite;
}

@keyframes borderRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.direct-write-option .alert-heading {
  color: #0d6efd;
  font-weight: 700;
  margin-bottom: 1rem;
}

.direct-write-option p {
  color: #495057;
  font-size: 1.05rem;
  margin-bottom: 1.5rem;
}

.direct-write-option .btn {
  padding: 0.75rem 2rem;
  font-weight: 700;
  border-radius: 25px;
  background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.direct-write-option .btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.direct-write-option .btn:hover::before {
  left: 100%;
}

.direct-write-option .btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(13, 110, 253, 0.4);
}

/* ===== 사이드바 ===== */
.sidebar {
  position: sticky;
  top: 100px;
}

.sidebar .card {
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.sidebar .card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
}

.sidebar .card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.25rem;
}

.sidebar .card-header h6 {
  color: white;
  font-weight: 700;
  margin-bottom: 0;
}

.sidebar .card-body {
  padding: 1.5rem;
}

/* ===== 가이드 아이템 ===== */
.guide-item {
  padding: 1.25rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  border-left: 4px solid #0d6efd;
  margin-bottom: 1.25rem;
  transition: all 0.3s ease;
}

.guide-item:hover {
  border-left-color: #6610f2;
  background: linear-gradient(135deg, #e8f4ff 0%, #f0f7ff 100%);
  transform: translateX(5px);
}

.guide-item:last-child {
  margin-bottom: 0;
}

.guide-item h6 {
  color: #0d6efd;
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.guide-item ul {
  margin-bottom: 0;
  padding-left: 1.5rem;
}

.guide-item li {
  color: #495057;
  line-height: 1.7;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.guide-item li:last-child {
  margin-bottom: 0;
}

/* ===== 인기 태그 ===== */
.popular-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  line-height: 1.5;
}

.clickable-tag {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.clickable-tag::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(13, 110, 253, 0.1), transparent);
  transition: left 0.5s;
}

.clickable-tag:hover::before {
  left: 100%;
}

.clickable-tag:hover {
  background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
  color: white;
  border-color: #0d6efd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

/* ===== 버튼 스타일 ===== */
.btn {
  border-radius: 10px;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: none;
}

.btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(13, 110, 253, 0.4);
}

.btn-outline-secondary {
  border: 2px solid #6c757d;
  color: #6c757d;
  background: white;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* ===== 로딩 상태 ===== */
.spinner-border {
  width: 1.2rem;
  height: 1.2rem;
  animation: spinner-border 0.8s linear infinite;
}

@keyframes spinner-border {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ===== 스크롤바 커스터마이징 ===== */
.schedule-preview::-webkit-scrollbar {
  width: 8px;
}

.schedule-preview::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 4px;
}

.schedule-preview::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #0d6efd, #6610f2);
  border-radius: 4px;
}

.schedule-preview::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #0b5ed7, #5a0fc8);
}

/* ===== 애니메이션 ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.plan-selection-step,
.write-form,
.direct-write-option {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.form-control:focus,
.form-select:focus {
  animation: pulse 0.3s ease-in-out;
}

/* ===== 반응형 디자인 ===== */
@media (max-width: 1200px) {
  .sidebar {
    position: static;
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .planboard-write-view {
    background: white;
  }

  .page-header {
    text-align: left;
    margin-bottom: 1.5rem;
    padding: 1.5rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .card-body {
    padding: 1.5rem;
  }

  .card-footer {
    padding: 1rem;
  }

  .travel-schedule {
    padding: 1.25rem;
  }

  .day-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .day-attractions {
    padding-left: 0;
  }

  .attraction-item {
    padding: 0.6rem;
    font-size: 0.85rem;
  }

  .selected-plan-summary {
    padding: 1.25rem;
  }

  .selected-plan-summary .d-flex {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start !important;
  }

  .card-footer .d-flex {
    flex-direction: column;
    gap: 1rem;
  }

  .card-footer .d-flex > div:first-child {
    order: 2;
  }

  .card-footer .btn {
    width: 100%;
  }

  .direct-write-option .alert {
    padding: 1.5rem;
  }

  .guide-item {
    padding: 1rem;
  }

  .popular-tags {
    gap: 0.5rem;
  }

  .clickable-tag {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }

  .page-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .card-body {
    padding: 1rem;
  }

  .card-footer {
    padding: 0.75rem;
  }

  .form-control,
  .form-select {
    font-size: 16px; /* iOS 줌 방지 */
    padding: 0.6rem 0.8rem;
  }

  .travel-schedule {
    padding: 1rem;
  }

  .day-schedule {
    padding: 1rem;
  }

  .attraction-item {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .visit-time {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
  }

  .selected-plan-summary {
    padding: 1rem;
  }

  .guide-item {
    padding: 0.75rem;
  }

  .popular-tags {
    gap: 0.35rem;
  }

  .clickable-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }

  .btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}

/* ===== 접근성 개선 ===== */
.form-control:focus,
.form-select:focus,
.btn:focus {
  outline: none;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.clickable-tag:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

/* ===== 프린트 스타일 ===== */
@media print {
  .sidebar,
  .card-footer,
  .direct-write-option {
    display: none;
  }

  .card {
    box-shadow: none;
    border: 1px solid #dee2e6;
  }

  .card-header {
    background: #f8f9fa !important;
    color: #333 !important;
  }
}

/* ===== 고대비 모드 지원 ===== */
@media (prefers-contrast: high) {
  .card {
    border: 2px solid #000;
  }

  .form-control,
  .form-select {
    border: 2px solid #000;
  }

  .btn-primary {
    background: #000;
    color: #fff;
  }

  .btn-outline-secondary {
    border: 2px solid #000;
    color: #000;
  }
}
/* readonly 입력 필드 스타일 */
.readonly-input {
  background-color: #f8f9fa !important;
  border-color: #e9ecef !important;
  cursor: not-allowed;
  color: #6c757d !important;
}

.readonly-input:focus {
  background-color: #f8f9fa !important;
  border-color: #e9ecef !important;
  box-shadow: none !important;
}

/* 태그 클릭 방지 */
.clickable-tag {
  position: relative;
  z-index: 1;
}

.clickable-tag:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

/* 폼 텍스트 정보 스타일 */
.form-text.text-info {
  color: #0dcaf0 !important;
  font-weight: 500;
  display: flex;
  align-items: center;
  margin-top: 0.25rem;
}

.form-text.text-info i {
  color: #0dcaf0;
}

/* 🔥 공개/비공개 토글 스타일 🔥 */
.public-toggle-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.public-toggle-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #28a745, #17a2b8, #28a745);
  animation: shimmer 2s infinite;
}

.form-check.form-switch {
  margin-bottom: 1rem;
}

.public-toggle-switch {
  width: 3rem;
  height: 1.5rem;
  background-color: #dc3545;
  border: 2px solid #dc3545;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.public-toggle-switch:checked {
  background-color: #28a745;
  border-color: #28a745;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.public-toggle-switch:focus {
  box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
}

.public-toggle-switch.switch-on {
  background-color: #28a745;
  border-color: #28a745;
}

.public-toggle-switch.switch-off {
  background-color: #ffc107;
  border-color: #ffc107;
}

.public-toggle-label {
  cursor: pointer;
  margin-left: 1rem;
  flex: 1;
  user-select: none;
}

.toggle-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.toggle-content:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.toggle-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #dee2e6;
  transition: all 0.3s ease;
}

.toggle-icon i {
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.toggle-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.toggle-text strong {
  color: #495057;
  font-size: 1.1rem;
  font-weight: 700;
}

.toggle-description {
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.4;
  margin-top: 0.25rem;
}

.public-status-info {
  margin-top: 1rem;
}

.alert-sm {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
  border: none;
  margin-bottom: 0;
}

.alert-info {
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

.alert-warning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  color: #856404;
  border-left: 4px solid #ffc107;
}

/* 애니메이션 효과 */
@keyframes toggleBounce {
  0%,
  20%,
  60%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  80% {
    transform: translateY(-1px);
  }
}

.public-toggle-switch:checked + .public-toggle-label .toggle-content {
  animation: toggleBounce 0.6s ease-out;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .toggle-content {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
    padding: 1rem;
  }

  .toggle-text {
    text-align: center;
  }

  .public-toggle-container {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .public-toggle-switch {
    width: 2.5rem;
    height: 1.2rem;
  }

  .toggle-icon {
    width: 35px;
    height: 35px;
  }

  .toggle-icon i {
    font-size: 1rem;
  }

  .toggle-text strong {
    font-size: 1rem;
  }

  .toggle-description {
    font-size: 0.8rem;
  }
}

/* ✨ 새로 추가: 여행 일정 미리보기 스타일 */
.travel-schedule-preview {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.travel-schedule-preview .timeline {
  position: relative;
  margin: 0 0 30px 0;
}

.travel-schedule-preview .timeline-item {
  position: relative;
  padding: 12px 0;
  border-left: 2px solid #e9ecef;
  padding-left: 20px;
  margin-left: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.travel-schedule-preview .timeline-item:hover {
  background-color: #f8f9fa;
}

.travel-schedule-preview .timeline-item-active {
  border-left: 2px solid #0d6efd;
  background-color: #e9f0ff;
}

.travel-schedule-preview .timeline-date {
  margin-bottom: 5px;
}

.travel-schedule-preview .timeline-day {
  font-weight: bold;
  margin-right: 10px;
}

.travel-schedule-preview .timeline-full-date {
  color: #6c757d;
  font-size: 0.9rem;
}

.travel-schedule-preview .timeline-item-brief {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 3px 0;
}

.travel-schedule-preview .day-detail-timeline {
  position: relative;
}

.travel-schedule-preview .day-detail-item {
  display: flex;
  margin-bottom: 30px;
  position: relative;
}

.travel-schedule-preview .day-detail-item:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 30px;
  left: 80px;
  height: calc(100% + 30px);
  border-left: 2px dashed #e9ecef;
}

.travel-schedule-preview .day-detail-time {
  min-width: 80px;
  font-weight: bold;
  text-align: center;
  padding-top: 5px;
}

.travel-schedule-preview .day-detail-duration {
  font-size: 0.8rem;
  font-weight: normal;
}

.travel-schedule-preview .day-detail-content {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  margin-left: 20px;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.travel-schedule-preview .day-detail-content::before {
  content: "";
  position: absolute;
  top: 15px;
  left: -10px;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid white;
}

.travel-schedule-preview .attraction-overview-small {
  max-height: 3em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 0.85rem;
}
</style>
