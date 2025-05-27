<!-- src/views/PlanEditView.vue -->
<template>
  <div class="plan-edit-view">
    <div class="container py-4">
      <h1 class="mb-4">여행 계획 수정</h1>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
      </div>

      <div v-else class="card mb-4">
        <div class="card-body">
          <form @submit.prevent="updatePlan">
            <!-- 기본 정보 입력 -->
            <div class="mb-3">
              <label for="title" class="form-label">여행 제목</label>
              <input
                type="text"
                id="title"
                v-model="plan.title"
                class="form-control"
                placeholder="여행 이름을 입력하세요"
                required
              />
            </div>

            <div class="mb-3">
              <label for="description" class="form-label">여행 설명</label>
              <textarea
                id="description"
                v-model="plan.description"
                class="form-control"
                rows="3"
                placeholder="여행에 대한 설명을 입력하세요"
              ></textarea>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label for="startDate" class="form-label">시작일</label>
                <input
                  type="date"
                  id="startDate"
                  v-model="plan.startDate"
                  class="form-control"
                  required
                  @change="calculateDays"
                />
              </div>
              <div class="col-md-6">
                <label for="endDate" class="form-label">종료일</label>
                <input
                  type="date"
                  id="endDate"
                  v-model="plan.endDate"
                  class="form-control"
                  required
                  @change="calculateDays"
                />
              </div>
            </div>

            <!-- 일차별 계획 -->
            <div v-if="dayCount > 0" class="mt-4">
              <h3>일차별 계획</h3>

              <div class="day-tabs">
                <ul class="nav nav-tabs mb-3">
                  <li class="nav-item" v-for="day in dayCount" :key="day">
                    <button :class="['nav-link', { active: activeDay === day }]" @click.prevent="activeDay = day">
                      {{ day }}일차
                    </button>
                  </li>
                </ul>
              </div>

              <div class="day-content">
                <div v-for="day in dayCount" :key="day" v-show="activeDay === day">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4>{{ day }}일차 일정 - {{ getDayDate(day) }}</h4>
                    <button type="button" class="btn btn-sm btn-primary" @click="addDetailToDay(day)">
                      <i class="fas fa-plus"></i> 일정 추가
                    </button>
                  </div>

                  <!-- 드래그 앤 드롭 가능한 일정 목록 -->
                  <draggable
                    v-model="dayDetails[day]"
                    group="details"
                    @end="updateDetailOrders(day)"
                    item-key="tempId"
                    handle=".drag-handle"
                    :animation="200"
                  >
                    <template #item="{ element: detail, index }">
                      <div class="card mb-3">
                        <div class="card-header bg-light d-flex align-items-center">
                          <div class="drag-handle me-2 cursor-move">
                            <i class="fas fa-grip-vertical text-muted"></i>
                          </div>
                          <div class="flex-grow-1">
                            <span class="fw-bold">일정 #{{ index + 1 }}</span>
                          </div>
                          <button type="button" class="btn btn-sm btn-outline-danger" @click="removeDetail(day, index)">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                        <div class="card-body">
                          <div class="row mb-3">
                            <div class="col-md-6">
                              <label class="form-label">장소/제목</label>
                              <div class="input-group">
                                <input
                                  type="text"
                                  v-model="detail.title"
                                  class="form-control"
                                  placeholder="방문 장소 또는 일정 제목"
                                />
                                <button
                                  type="button"
                                  class="btn btn-outline-secondary"
                                  @click="openAttractionModal(detail)"
                                >
                                  <i class="fas fa-search"></i> 관광지 검색
                                </button>
                              </div>
                            </div>
                            <div class="col-md-3">
                              <label class="form-label">방문 시간</label>
                              <input type="time" v-model="detail.visitTime" class="form-control" />
                            </div>
                            <div class="col-md-3">
                              <label class="form-label">소요 시간(분)</label>
                              <input type="number" v-model="detail.stayDuration" class="form-control" min="0" />
                            </div>
                          </div>

                          <div class="mb-3">
                            <label class="form-label">메모</label>
                            <textarea v-model="detail.description" class="form-control" rows="2"></textarea>
                          </div>

                          <!-- 선택된 관광지 정보 표시 -->
                          <div v-if="detail.attractionId && detail.attraction" class="selected-attraction">
                            <div class="alert alert-info d-flex align-items-center">
                              <div class="me-3">
                                <img
                                  :src="detail.attraction.firstImage1 || '/img/no-image.jpg'"
                                  alt="관광지 이미지"
                                  style="width: 60px; height: 60px; object-fit: cover"
                                  class="rounded"
                                />
                              </div>
                              <div>
                                <p class="mb-1">
                                  <strong>{{ detail.attraction.title }}</strong>
                                </p>
                                <p class="mb-0 small">{{ detail.attraction.sido }} {{ detail.attraction.gugun }}</p>
                              </div>
                              <button
                                type="button"
                                class="btn btn-sm btn-outline-danger ms-auto"
                                @click="removeAttraction(detail)"
                              >
                                <i class="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </draggable>

                  <div v-if="!dayDetails[day] || dayDetails[day].length === 0" class="alert alert-light text-center">
                    <p class="mb-0">이 날짜에 계획된 일정이 없습니다. '일정 추가' 버튼을 클릭하여 일정을 추가하세요.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between mt-4">
              <router-link :to="`/plans/${planId}`" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i> 취소
              </router-link>
              <button type="submit" class="btn btn-primary" :disabled="isSaving">
                <span v-if="isSaving">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  저장 중...
                </span>
                <span v-else><i class="fas fa-save"></i> 변경사항 저장</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 관광지 검색 모달 -->
    <div class="modal fade" id="attractionModal" tabindex="-1" ref="attractionModalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">관광지 검색</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="search-container mb-3">
              <div class="row">
                <div class="col-md-4">
                  <select v-model="searchArea" class="form-select">
                    <option value="">지역 선택</option>
                    <option v-for="area in areaList" :key="area.sido_code" :value="area.sido_code">
                      {{ area.sido_name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <select v-model="searchContentType" class="form-select">
                    <option value="">카테고리 선택</option>
                    <option v-for="type in contentTypes" :key="type.content_type_id" :value="type.content_type_id">
                      {{ type.content_type_name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <div class="input-group">
                    <input
                      type="text"
                      v-model="searchKeyword"
                      class="form-control"
                      placeholder="관광지 검색"
                      @keyup.enter="searchAttractions"
                    />
                    <button class="btn btn-primary" @click="searchAttractions">
                      <i class="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="isSearching" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">검색 중...</span>
              </div>
            </div>

            <div v-else-if="!searchResults || searchResults.length === 0" class="text-center py-5">
              <p class="text-muted">검색 결과가 없습니다.</p>
            </div>

            <div v-else class="row">
              <div v-for="attraction in searchResults" :key="attraction.no" class="col-md-4 mb-3">
                <div
                  class="card h-100 cursor-pointer"
                  :class="{ 'border-primary': selectedAttraction === attraction.no }"
                  @click="selectAttraction(attraction)"
                >
                  <img
                    :src="attraction.firstImage1 || '/img/no-image.jpg'"
                    class="card-img-top"
                    alt="관광지 이미지"
                    style="height: 150px; object-fit: cover"
                  />
                  <div class="card-body">
                    <h6 class="card-title">{{ attraction.title }}</h6>
                    <p class="card-text small">{{ attraction.sido }} {{ attraction.gugun }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
            <button type="button" class="btn btn-primary" :disabled="!selectedAttraction" @click="confirmAttraction">
              선택 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import planAPI from "@/api/plan";
import attractionAPI from "@/api/attraction";
import draggable from "vuedraggable";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const planId = parseInt(route.params.id);
const loading = ref(true);
const isSaving = ref(false);
const plan = ref({
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  details: [],
});

const activeDay = ref(1);
const dayDetails = reactive({}); // 일차별 세부 일정
let tempIdCounter = 0; // 임시 ID 생성을 위한 카운터

// 관광지 검색
const attractionModalRef = ref(null);
const currentDetail = ref(null);
const areaList = ref([]);
const contentTypes = ref([]);
const searchArea = ref("");
const searchContentType = ref("");
const searchKeyword = ref("");
const searchResults = ref([]);
const isSearching = ref(false);
const selectedAttraction = ref(null);

// 로그인 확인
if (!authStore.isAuthenticated) {
  router.push(`/login?redirect=/plans/${planId}/edit`);
}

// 일수 계산
const dayCount = computed(() => {
  if (!plan.value.startDate || !plan.value.endDate) return 0;

  const start = new Date(plan.value.startDate);
  const end = new Date(plan.value.endDate);

  // 날짜 차이 계산 (밀리초 단위)
  const diffTime = Math.abs(end - start);
  // 일 단위로 변환하고 1을 더함 (시작일 포함)
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

// 여행 계획 상세 정보 조회
const fetchPlanDetail = async () => {
  try {
    loading.value = true;
    const response = await planAPI.getPlanDetail(planId);
    plan.value = response.data;

    // 관광지 정보 로드
    await loadAttractionDetails();

    // 일차별 세부 일정 초기화
    initializeDayDetails();

    // 선택된 일차가 유효한지 확인
    if (activeDay.value > dayCount.value) {
      activeDay.value = 1;
    }
  } catch (error) {
    console.error("여행 계획 상세 정보 조회 중 오류 발생:", error);
    router.push("/plans");
  } finally {
    loading.value = false;
  }
};

// 관광지 정보 로드
const loadAttractionDetails = async () => {
  try {
    const attractionIds = plan.value.details
      .filter((detail) => detail.attractionId)
      .map((detail) => detail.attractionId);

    if (attractionIds.length === 0) return;

    const promises = attractionIds.map((id) => attractionAPI.getAttractionDetail(id));
    const responses = await Promise.all(promises);

    responses.forEach((response) => {
      const attraction = response.data;
      plan.value.details.forEach((detail) => {
        if (detail.attractionId === attraction.no) {
          detail.attraction = attraction;
        }
      });
    });
  } catch (error) {
    console.error("관광지 정보 로드 중 오류 발생:", error);
  }
};

// 일차별 세부 일정 초기화
const initializeDayDetails = () => {
  for (let day = 1; day <= dayCount.value; day++) {
    dayDetails[day] = plan.value.details
      .filter((detail) => detail.dayNumber === day)
      .map((detail) => ({
        ...detail,
        tempId: tempIdCounter++,
      }))
      .sort((a, b) => a.orderNo - b.orderNo);
  }
};

// 날짜 변경 시 일수 재계산
const calculateDays = () => {
  // 종료일이 시작일보다 이전인 경우 조정
  if (plan.value.startDate && plan.value.endDate) {
    const start = new Date(plan.value.startDate);
    const end = new Date(plan.value.endDate);

    if (end < start) {
      plan.value.endDate = plan.value.startDate;
    }
  }

  // 일차별 세부 일정 초기화 (필요한 경우)
  if (dayCount.value > 0) {
    activeDay.value = Math.min(activeDay.value, dayCount.value);

    // 새로운 일차가 추가된 경우 배열 초기화
    for (let day = 1; day <= dayCount.value; day++) {
      if (!dayDetails[day]) {
        dayDetails[day] = [];
      }
    }
  }
};

// 특정 일차의 날짜 계산
const getDayDate = (day) => {
  if (!plan.value.startDate) return "";

  const start = new Date(plan.value.startDate);
  const dayDate = new Date(start);
  dayDate.setDate(start.getDate() + day - 1);

  return dayDate.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};

// 특정 일차에 일정 추가
const addDetailToDay = (day) => {
  if (!dayDetails[day]) {
    dayDetails[day] = [];
  }

  const newOrderNo = dayDetails[day].length > 0 ? Math.max(...dayDetails[day].map((d) => d.orderNo)) + 1 : 1;

  dayDetails[day].push({
    dayNumber: day,
    title: "",
    description: "",
    visitTime: "",
    stayDuration: 60,
    orderNo: newOrderNo,
    attractionId: null,
    tempId: tempIdCounter++,
  });
};

// 일정 삭제
const removeDetail = (day, index) => {
  dayDetails[day].splice(index, 1);

  // orderNo 재정렬
  updateDetailOrders(day);
};

// 일정 순서 업데이트
const updateDetailOrders = (day) => {
  dayDetails[day].forEach((detail, index) => {
    detail.orderNo = index + 1;
  });
};

// 관광지 검색 모달 열기
const openAttractionModal = (detail) => {
  currentDetail.value = detail;

  // 모달 초기화
  selectedAttraction.value = null;
  searchResults.value = [];

  // 모달 열기
  const modal = new bootstrap.Modal(document.getElementById("attractionModal"));
  modal.show();

  // 처음 한 번만 지역 및 콘텐츠 타입 로드
  if (areaList.value.length === 0) {
    loadAreas();
    loadContentTypes();
  }
};

// 지역 목록 로드
const loadAreas = async () => {
  try {
    const response = await attractionAPI.getSido();
    areaList.value = response.data;
  } catch (error) {
    console.error("지역 목록 로드 중 오류 발생:", error);
  }
};

// 콘텐츠 타입 목록 로드
const loadContentTypes = async () => {
  try {
    const response = await attractionAPI.getContentTypes();
    contentTypes.value = response.data;
  } catch (error) {
    console.error("콘텐츠 타입 목록 로드 중 오류 발생:", error);
  }
};

// 관광지 검색
const searchAttractions = async () => {
  try {
    isSearching.value = true;

    const params = {
      areaCode: searchArea.value,
      contentTypeName: searchContentType.value,
      keyword: searchKeyword.value,
      offset: 0,
      limit: 9,
    };

    const response = await attractionAPI.getAttractions(params);
    searchResults.value = response.data;
  } catch (error) {
    console.error("관광지 검색 중 오류 발생:", error);
  } finally {
    isSearching.value = false;
  }
};

// 관광지 선택
const selectAttraction = (attraction) => {
  selectedAttraction.value = attraction.no;
};

// 관광지 선택 확인
const confirmAttraction = () => {
  if (!selectedAttraction.value || !currentDetail.value) return;

  const attraction = searchResults.value.find((a) => a.no === selectedAttraction.value);

  if (attraction) {
    currentDetail.value.attractionId = attraction.no;
    currentDetail.value.attraction = attraction;
    currentDetail.value.title = attraction.title;
  }

  // 모달 닫기
  const modal = bootstrap.Modal.getInstance(document.getElementById("attractionModal"));
  modal.hide();
};

// 선택된 관광지 제거
const removeAttraction = (detail) => {
  detail.attractionId = null;
  detail.attraction = null;
};

// 여행 계획 업데이트
const updatePlan = async () => {
  try {
    isSaving.value = true;

    // 수정할 계획 데이터 준비
    const updatedPlan = {
      planId: plan.value.planId,
      userId: plan.value.userId,
      title: plan.value.title,
      description: plan.value.description,
      startDate: plan.value.startDate,
      endDate: plan.value.endDate,
      details: [],
    };

    // 모든 일차의 세부 일정 추가
    for (let day = 1; day <= dayCount.value; day++) {
      if (dayDetails[day]) {
        updatedPlan.details.push(
          ...dayDetails[day].map((detail) => ({
            detailId: detail.detailId || 0, // 새로 추가된 일정은 0으로 설정
            planId: plan.value.planId,
            dayNumber: day,
            attractionId: detail.attractionId,
            title: detail.title,
            description: detail.description,
            visitTime: detail.visitTime,
            stayDuration: detail.stayDuration,
            orderNo: detail.orderNo,
          }))
        );
      }
    }

    await planAPI.updatePlan(planId, updatedPlan);
    alert("여행 계획이 수정되었습니다.");
    router.push(`/plans/${planId}`);
  } catch (error) {
    console.error("여행 계획 수정 중 오류 발생:", error);
    alert("여행 계획 수정에 실패했습니다.");
  } finally {
    isSaving.value = false;
  }
};

// dayCount가 변경될 때 dayDetails 업데이트
watch(dayCount, (newDayCount, oldDayCount) => {
  if (newDayCount > oldDayCount) {
    // 새로운 일차 추가
    for (let day = oldDayCount + 1; day <= newDayCount; day++) {
      dayDetails[day] = [];
    }
  }
});

// 컴포넌트 마운트 시 여행 계획 상세 정보 불러오기
onMounted(() => {
  fetchPlanDetail();
});

// 컴포넌트 언마운트 시 정리 (기본적인 정리만)
onUnmounted(() => {
  // 필요한 정리 작업이 있다면 여기에 추가
  console.log("PlanEditView 컴포넌트가 언마운트되었습니다.");
});
</script>

<style scoped>
.cursor-move {
  cursor: move;
}

.cursor-pointer {
  cursor: pointer;
}

.card {
  transition: all 0.2s ease;
}

.card.border-primary {
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
}
</style>
