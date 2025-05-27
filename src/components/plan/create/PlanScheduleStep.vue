<!-- src/components/plan/create/PlanScheduleStep.vue -->
<template>
  <div class="plan-schedule-step">
    <div class="container py-4">
      <div class="step-content">
        <div class="card">
          <div class="card-header bg-white">
            <h2 class="mb-0">📅 일정을 완성해주세요</h2>
            <p class="text-muted mb-0">선택한 관광지들을 일차별로 정리하고 세부 시간을 설정하세요</p>
          </div>
          <div class="card-body">
            <!-- 일차별 탭 -->
            <ul class="nav nav-tabs mb-4">
              <li class="nav-item" v-for="day in dayCount" :key="day">
                <button class="nav-link" :class="{ active: activeDay === day }" @click="activeDay = day">
                  {{ day }}일차
                  <span v-if="getDayAttractions(day).length > 0" class="badge bg-primary ms-2">
                    {{ getDayAttractions(day).length }}
                  </span>
                </button>
              </li>
            </ul>

            <!-- 각 일차별 내용 -->
            <div v-for="day in dayCount" :key="day" v-show="activeDay === day">
              <div class="day-header mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <h4>{{ day }}일차 - {{ getDayDate(day) }}</h4>
                  <div class="day-actions">
                    <button class="btn btn-sm btn-outline-primary me-2" @click="addManualAttraction(day)">
                      <i class="fas fa-plus me-1"></i>직접 추가
                    </button>
                    <button class="btn btn-sm btn-outline-info" @click="optimizeSchedule(day)">
                      <i class="fas fa-route me-1"></i>일정 최적화
                    </button>
                  </div>
                </div>
                <div class="day-summary">
                  총 {{ getDayAttractions(day).length }}개 일정, 예상 소요시간: {{ calculateTotalTime(day) }}
                </div>
              </div>

              <div class="day-attractions">
                <draggable
                  :list="getDayAttractions(day)"
                  group="attractions"
                  @end="updateOrder"
                  item-key="no"
                  class="attraction-list"
                  handle=".drag-handle"
                >
                  <template #item="{ element: attraction, index }">
                    <div class="attraction-schedule-item">
                      <div class="drag-handle">
                        <i class="fas fa-grip-vertical"></i>
                      </div>

                      <div class="schedule-content">
                        <div class="schedule-main">
                          <div class="attraction-image">
                            <img
                              :src="attraction.firstImage1 || '/img/no-image.jpg'"
                              :alt="attraction.title"
                              class="schedule-thumb"
                            />
                          </div>

                          <div class="attraction-details">
                            <h6 class="attraction-title">{{ attraction.title }}</h6>
                            <p class="attraction-location mb-2">
                              <i class="fas fa-map-marker-alt text-danger me-1"></i>
                              {{ attraction.sido }} {{ attraction.gugun }}
                            </p>

                            <div class="time-controls row g-2">
                              <div class="col-md-4">
                                <label class="form-label small">방문 시간</label>
                                <input
                                  type="time"
                                  v-model="attraction.visitTime"
                                  class="form-control form-control-sm"
                                  @change="updateScheduleTime(attraction)"
                                />
                              </div>
                              <div class="col-md-4">
                                <label class="form-label small">소요시간</label>
                                <select
                                  v-model="attraction.duration"
                                  class="form-select form-select-sm"
                                  @change="updateScheduleTime(attraction)"
                                >
                                  <option value="30">30분</option>
                                  <option value="60">1시간</option>
                                  <option value="90">1시간 30분</option>
                                  <option value="120">2시간</option>
                                  <option value="180">3시간</option>
                                  <option value="240">4시간</option>
                                  <option value="360">6시간</option>
                                </select>
                              </div>
                              <div class="col-md-4">
                                <label class="form-label small">우선순위</label>
                                <select v-model="attraction.priority" class="form-select form-select-sm">
                                  <option value="high">높음</option>
                                  <option value="medium">보통</option>
                                  <option value="low">낮음</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div class="schedule-actions">
                            <button
                              class="btn btn-sm btn-outline-danger"
                              @click="removeFromDay(day, index)"
                              title="일정에서 제거"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>

                        <div class="schedule-memo">
                          <label class="form-label small">메모</label>
                          <textarea
                            v-model="attraction.memo"
                            class="form-control form-control-sm"
                            rows="2"
                            placeholder="이 장소에 대한 메모를 입력하세요..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </template>
                </draggable>

                <div v-if="getDayAttractions(day).length === 0" class="empty-day">
                  <div class="empty-day-content">
                    <i class="fas fa-calendar-plus text-muted"></i>
                    <h5 class="text-muted">이 날에는 아직 계획된 일정이 없습니다</h5>
                    <p class="text-muted">미배정 관광지를 드래그하거나 직접 추가해보세요</p>
                    <button class="btn btn-outline-primary" @click="addManualAttraction(day)">
                      <i class="fas fa-plus me-2"></i>새 일정 추가
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 미배정 관광지 -->
            <div v-if="unassignedAttractions.length > 0" class="mt-4">
              <div class="unassigned-header">
                <h5 class="mb-3">
                  <i class="fas fa-question-circle text-warning me-2"></i>
                  일차가 정해지지 않은 관광지 ({{ unassignedAttractions.length }}개)
                </h5>
                <button class="btn btn-sm btn-outline-success" @click="autoAssignAttractions">
                  <i class="fas fa-magic me-1"></i>자동 배정
                </button>
              </div>

              <div class="unassigned-attractions">
                <div
                  v-for="attraction in unassignedAttractions"
                  :key="attraction.no"
                  class="unassigned-item"
                  draggable="true"
                  @dragstart="startDrag(attraction)"
                >
                  <img
                    :src="attraction.firstImage1 || '/img/no-image.jpg'"
                    :alt="attraction.title"
                    class="unassigned-thumb"
                  />
                  <div class="unassigned-info">
                    <h6 class="mb-1">{{ attraction.title }}</h6>
                    <p class="mb-0 text-muted small">{{ attraction.sido }}</p>
                  </div>
                  <div class="unassigned-actions">
                    <select
                      v-model="attraction.assignedDay"
                      class="form-select form-select-sm"
                      style="width: 100px"
                      @change="assignToDay(attraction)"
                    >
                      <option value="">일차 선택</option>
                      <option v-for="day in dayCount" :key="day" :value="day">{{ day }}일차</option>
                    </select>
                    <button class="btn btn-sm btn-outline-danger ms-2" @click="removeAttraction(attraction)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 일정 요약 -->
            <div class="schedule-summary mt-4">
              <h5><i class="fas fa-chart-line me-2"></i>일정 요약</h5>
              <div class="row">
                <div v-for="day in dayCount" :key="day" class="col-md-6 col-lg-4 mb-3">
                  <div class="summary-card">
                    <div class="summary-header">
                      <h6>{{ day }}일차</h6>
                      <span class="badge bg-info">{{ getDayAttractions(day).length }}개 일정</span>
                    </div>
                    <div class="summary-content">
                      <div class="summary-item">
                        <i class="fas fa-clock me-1"></i>
                        {{ calculateTotalTime(day) }}
                      </div>
                      <div class="summary-item">
                        <i class="fas fa-calendar me-1"></i>
                        {{ getDayDate(day) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 하단 버튼 영역 -->
        <div class="d-flex justify-content-between align-items-center mt-4">
          <button class="btn btn-outline-secondary btn-lg" @click="handlePrevious">
            <i class="fas fa-arrow-left me-2"></i>이전 단계
          </button>

          <div class="save-actions">
            <button class="btn btn-outline-primary me-3" @click="saveDraft" :disabled="isSaving">
              <i class="fas fa-save me-2"></i>임시저장
            </button>
            <button class="btn btn-success btn-lg" @click="handleSave" :disabled="isSaving || !isValidSchedule">
              <span v-if="isSaving">
                <span class="spinner-border spinner-border-sm me-2"></span>
                저장 중...
              </span>
              <span v-else> <i class="fas fa-check me-2"></i>여행 계획 완성 </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 직접 추가 모달 -->
    <div class="modal fade" id="manualAddModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">직접 장소 추가</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addManualPlace">
              <div class="mb-3">
                <label class="form-label">장소명 *</label>
                <input
                  type="text"
                  v-model="manualPlace.title"
                  class="form-control"
                  placeholder="방문할 장소명을 입력하세요"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">주소</label>
                <input type="text" v-model="manualPlace.address" class="form-control" placeholder="주소를 입력하세요" />
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">방문 시간</label>
                  <input type="time" v-model="manualPlace.visitTime" class="form-control" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">소요 시간</label>
                  <select v-model="manualPlace.duration" class="form-select">
                    <option value="30">30분</option>
                    <option value="60">1시간</option>
                    <option value="90">1시간 30분</option>
                    <option value="120">2시간</option>
                    <option value="180">3시간</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">메모</label>
                <textarea
                  v-model="manualPlace.memo"
                  class="form-control"
                  rows="3"
                  placeholder="메모를 입력하세요"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
            <button type="button" class="btn btn-primary" @click="addManualPlace">추가</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import draggable from "vuedraggable";
import planAPI from "@/api/plan";

// Props & Events
const props = defineProps({
  planData: {
    type: Object,
    required: true,
  },
  selectedAttractions: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["previous", "save", "draft-save"]);

// 반응형 데이터
const activeDay = ref(1);
const isSaving = ref(false);
const attractions = ref([]);

const manualPlace = ref({
  title: "",
  address: "",
  visitTime: "",
  duration: 60,
  memo: "",
  targetDay: 1,
});

// 계산된 속성
const dayCount = computed(() => {
  if (!props.planData.startDate || !props.planData.endDate) return 0;
  const start = new Date(props.planData.startDate);
  const end = new Date(props.planData.endDate);
  const diffTime = Math.abs(end - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

const unassignedAttractions = computed(() => {
  return attractions.value.filter((attr) => !attr.assignedDay);
});

const isValidSchedule = computed(() => {
  // 최소한 하나의 일정이 배정되어야 함
  return attractions.value.some((attr) => attr.assignedDay);
});

// 메서드
const getDayAttractions = (day) => {
  return attractions.value
    .filter((attr) => attr.assignedDay === day)
    .sort((a, b) => {
      // 시간 순으로 정렬
      if (a.visitTime && b.visitTime) {
        return a.visitTime.localeCompare(b.visitTime);
      } else if (a.visitTime) {
        return -1;
      } else if (b.visitTime) {
        return 1;
      } else {
        return a.order - b.order;
      }
    });
};

const getDayDate = (day) => {
  if (!props.planData.startDate) return "";

  const start = new Date(props.planData.startDate);
  const dayDate = new Date(start);
  dayDate.setDate(start.getDate() + day - 1);

  return dayDate.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};

const calculateTotalTime = (day) => {
  const dayAttractions = getDayAttractions(day);
  const totalMinutes = dayAttractions.reduce((sum, attr) => sum + (attr.duration || 60), 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
};

const updateScheduleTime = (attraction) => {
  // 시간이 변경될 때 자동으로 다음 일정의 시간을 제안할 수 있음
  console.log("일정 시간 업데이트:", attraction.title, attraction.visitTime);
};

const addManualAttraction = (day) => {
  manualPlace.value.targetDay = day;
  const modal = new bootstrap.Modal(document.getElementById("manualAddModal"));
  modal.show();
};

const addManualPlace = () => {
  if (!manualPlace.value.title.trim()) {
    alert("장소명을 입력해주세요.");
    return;
  }

  const newPlace = {
    no: Date.now(),
    id: Date.now(),
    title: manualPlace.value.title,
    addr: manualPlace.value.address,
    sido: "직접입력",
    gugun: "",
    firstImage1: "",
    assignedDay: manualPlace.value.targetDay,
    visitTime: manualPlace.value.visitTime,
    duration: parseInt(manualPlace.value.duration),
    memo: manualPlace.value.memo,
    order: getDayAttractions(manualPlace.value.targetDay).length,
    priority: "medium",
    isManual: true,
  };

  attractions.value.push(newPlace);

  // 모달 초기화 및 닫기
  manualPlace.value = {
    title: "",
    address: "",
    visitTime: "",
    duration: 60,
    memo: "",
    targetDay: 1,
  };

  const modal = bootstrap.Modal.getInstance(document.getElementById("manualAddModal"));
  modal.hide();
};

const removeFromDay = (day, index) => {
  const dayAttractions = getDayAttractions(day);
  const attraction = dayAttractions[index];

  const globalIndex = attractions.value.findIndex((item) => item.no === attraction.no);
  if (globalIndex !== -1) {
    attractions.value.splice(globalIndex, 1);
  }
};

const removeAttraction = (attraction) => {
  const index = attractions.value.findIndex((item) => item.no === attraction.no);
  if (index !== -1) {
    attractions.value.splice(index, 1);
  }
};

const assignToDay = (attraction) => {
  if (attraction.assignedDay) {
    attraction.order = getDayAttractions(attraction.assignedDay).length;
  }
};

const updateOrder = () => {
  // 드래그 앤 드롭 후 순서 업데이트
  attractions.value.forEach((attraction) => {
    if (attraction.assignedDay) {
      const dayAttractions = getDayAttractions(attraction.assignedDay);
      const dayIndex = dayAttractions.findIndex((item) => item.no === attraction.no);
      if (dayIndex !== -1) {
        attraction.order = dayIndex;
      }
    }
  });
};

const startDrag = (attraction) => {
  // 드래그 시작 시 처리할 로직이 있다면 여기에
};

const optimizeSchedule = (day) => {
  const dayAttractions = getDayAttractions(day);
  if (dayAttractions.length < 2) {
    alert("최소 2개 이상의 일정이 있어야 최적화할 수 있습니다.");
    return;
  }

  // 간단한 최적화: 우선순위와 소요시간을 고려하여 시간 재배치
  let currentTime = 9 * 60; // 오전 9시부터 시작 (분 단위)

  dayAttractions
    .sort((a, b) => {
      // 우선순위 순으로 정렬
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    })
    .forEach((attraction) => {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      attraction.visitTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      currentTime += attraction.duration + 30; // 이동시간 30분 추가
    });

  alert(`${day}일차 일정이 최적화되었습니다.`);
};

const autoAssignAttractions = () => {
  if (unassignedAttractions.value.length === 0) return;

  const attractionsPerDay = Math.ceil(unassignedAttractions.value.length / dayCount.value);

  unassignedAttractions.value.forEach((attraction, index) => {
    const assignedDay = Math.floor(index / attractionsPerDay) + 1;
    attraction.assignedDay = Math.min(assignedDay, dayCount.value);
    attraction.order = getDayAttractions(attraction.assignedDay).length;
  });

  alert("미배정 관광지가 자동으로 각 일차에 배정되었습니다.");
};

const handlePrevious = () => {
  emit("previous");
};

const saveDraft = async () => {
  try {
    isSaving.value = true;

    const draftData = {
      ...props.planData,
      attractions: attractions.value,
      isDraft: true,
    };

    // 임시저장 로직
    localStorage.setItem("plan_draft", JSON.stringify(draftData));
    alert("임시저장되었습니다.");
  } catch (error) {
    console.error("임시저장 오류:", error);
    alert("임시저장에 실패했습니다.");
  } finally {
    isSaving.value = false;
  }
};

const handleSave = async () => {
  if (!isValidSchedule.value) {
    alert("최소한 하나의 일정을 배정해주세요.");
    return;
  }

  try {
    isSaving.value = true;

    const planData = {
      title: props.planData.title,
      description: props.planData.description,
      startDate: props.planData.startDate,
      endDate: props.planData.endDate,
      details: [],
    };

    // 모든 배정된 관광지를 details로 변환
    attractions.value
      .filter((attraction) => attraction.assignedDay)
      .forEach((attraction) => {
        planData.details.push({
          dayNumber: attraction.assignedDay,
          attractionId: attraction.isManual ? null : attraction.no,
          title: attraction.title,
          description: attraction.memo || "",
          visitTime: attraction.visitTime || "",
          stayDuration: attraction.duration || 60,
          orderNo: attraction.order || 0,
        });
      });

    // API 호출
    const response = await planAPI.createPlan(planData);

    // 임시저장 데이터 삭제
    localStorage.removeItem("plan_draft");

    emit("save", {
      planId: response.data.planId,
      message: "여행 계획이 성공적으로 저장되었습니다! 🎉",
    });
  } catch (error) {
    console.error("여행 계획 저장 오류:", error);
    alert("여행 계획 저장에 실패했습니다. 다시 시도해주세요.");
  } finally {
    isSaving.value = false;
  }
};

// 라이프사이클
onMounted(() => {
  // 전달받은 관광지 데이터 초기화
  attractions.value = props.selectedAttractions.map((attraction) => ({
    ...attraction,
    visitTime: attraction.visitTime || "",
    duration: attraction.duration || 60,
    memo: attraction.memo || "",
    order: attraction.order || 0,
    priority: attraction.priority || "medium",
  }));

  // 임시저장된 데이터가 있으면 복원
  const draftData = localStorage.getItem("plan_draft");
  if (draftData) {
    try {
      const draft = JSON.parse(draftData);
      if (draft.attractions && confirm("임시저장된 데이터가 있습니다. 복원하시겠습니까?")) {
        attractions.value = draft.attractions;
      }
    } catch (error) {
      console.error("임시저장 데이터 복원 오류:", error);
    }
  }
});
</script>

/* PlanScheduleStep.vue 스타일 */
<style scoped>
.plan-schedule-step .card {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: none;
  border-radius: 15px;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-bottom: none;
}

.card-header h2 {
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.nav-tabs {
  border-bottom: 2px solid #e9ecef;
}

.nav-tabs .nav-link {
  border: none;
  border-radius: 8px 8px 0 0;
  color: #6c757d;
  font-weight: 500;
  padding: 12px 20px;
  transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
  background: #f8f9fa;
  color: #495057;
}

.nav-tabs .nav-link.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.nav-tabs .nav-link .badge {
  font-size: 0.7rem;
}

.day-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  margin-bottom: 1.5rem;
}

.day-header h4 {
  color: #495057;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.day-summary {
  color: #6c757d;
  font-size: 0.9rem;
}

.day-actions {
  display: flex;
  gap: 0.5rem;
}

.attraction-list {
  min-height: 100px;
}

.attraction-schedule-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.attraction-schedule-item:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.schedule-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-main {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.drag-handle {
  color: #adb5bd;
  cursor: move;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.drag-handle:hover {
  background: #f8f9fa;
  color: #6c757d;
}

.attraction-image {
  flex-shrink: 0;
}

.schedule-thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.attraction-details {
  flex: 1;
  min-width: 0;
}

.attraction-title {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.attraction-location {
  color: #6c757d;
  font-size: 0.9rem;
}

.time-controls .form-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.25rem;
}

.time-controls .form-control,
.time-controls .form-select {
  border-radius: 6px;
  font-size: 0.9rem;
}

.schedule-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.schedule-memo textarea {
  resize: vertical;
  border-radius: 6px;
}

.empty-day {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  background: #f8f9fa;
}

.empty-day-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #dee2e6;
}

.empty-day-content h5 {
  margin-bottom: 1rem;
}

.unassigned-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.unassigned-attractions {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #ffeaa7;
}

.unassigned-item {
  display: flex;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

.unassigned-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.unassigned-item:last-child {
  margin-bottom: 0;
}

.unassigned-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 1rem;
  flex-shrink: 0;
}

.unassigned-info {
  flex: 1;
  min-width: 0;
}

.unassigned-info h6 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.unassigned-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.schedule-summary {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #bbdefb;
}

.schedule-summary h5 {
  color: #1976d2;
  font-weight: 600;
  margin-bottom: 1rem;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.summary-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.summary-header h6 {
  margin: 0;
  font-weight: 600;
  color: #495057;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-item {
  font-size: 0.9rem;
  color: #6c757d;
  display: flex;
  align-items: center;
}

.summary-item i {
  color: #667eea;
  margin-right: 0.5rem;
}

.save-actions {
  display: flex;
  align-items: center;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .card-header {
    padding: 1.5rem;
  }

  .day-header {
    padding: 1rem;
  }

  .day-actions {
    flex-direction: column;
    gap: 0.25rem;
  }

  .day-actions .btn {
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
  }

  .attraction-schedule-item {
    flex-direction: column;
    gap: 1rem;
  }

  .schedule-main {
    flex-direction: column;
    gap: 1rem;
  }

  .time-controls {
    gap: 0.5rem;
  }

  .time-controls .col-md-4 {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .unassigned-item {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }

  .unassigned-actions {
    width: 100%;
    justify-content: center;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .save-actions {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .card-body {
    padding: 1rem;
  }

  .nav-tabs .nav-link {
    padding: 8px 12px;
    font-size: 0.9rem;
  }

  .attraction-schedule-item {
    padding: 1rem;
  }

  .schedule-thumb {
    width: 60px;
    height: 45px;
  }

  .empty-day {
    padding: 2rem 1rem;
  }

  .empty-day-content i {
    font-size: 2rem;
  }

  .unassigned-attractions {
    padding: 1rem;
  }

  .schedule-summary {
    padding: 1rem;
  }
}

/* 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.attraction-schedule-item {
  animation: fadeInUp 0.3s ease-out;
}

.summary-card {
  animation: fadeInUp 0.4s ease-out;
}
</style>
