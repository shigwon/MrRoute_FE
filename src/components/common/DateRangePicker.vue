<!-- src/components/common/DateRangePicker.vue -->
<template>
  <div class="date-range-picker">
    <div class="picker-header">
      <h3>여행 날짜를 선택하세요</h3>
      <div class="selected-dates">
        <div class="date-input-group">
          <label>시작일</label>
          <div class="date-display" :class="{ empty: !startDate }">
            {{ startDate ? formatDisplayDate(startDate) : "날짜 선택" }}
          </div>
        </div>
        <div class="date-separator">~</div>
        <div class="date-input-group">
          <label>종료일</label>
          <div class="date-display" :class="{ empty: !endDate }">
            {{ endDate ? formatDisplayDate(endDate) : "날짜 선택" }}
          </div>
        </div>
        <div v-if="travelDays > 0" class="travel-duration">
          <span class="duration-badge">{{ travelDays }}일 여행</span>
        </div>
      </div>
    </div>

    <div class="calendar-container">
      <!-- 달력 헤더 -->
      <div class="calendar-header">
        <button class="nav-btn" @click="navigateMonth(-1)">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h4>{{ currentMonth.getFullYear() }}년 {{ monthNames[currentMonth.getMonth()] }}</h4>
        <button class="nav-btn" @click="navigateMonth(1)">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- 달력 그리드 -->
      <div class="calendar-grid">
        <!-- 요일 헤더 -->
        <div v-for="day in dayNames" :key="day" class="day-header">
          {{ day }}
        </div>

        <!-- 날짜 버튼들 -->
        <button
          v-for="(date, index) in calendarDays"
          :key="index"
          :class="getDateClass(date)"
          @click="handleDateClick(date)"
          @mouseenter="hoverDate = new Date(date)"
          @mouseleave="hoverDate = null"
          :disabled="isDateDisabled(date)"
        >
          {{ date.getDate() }}
        </button>
      </div>
    </div>

    <!-- 하단 컨트롤 -->
    <div class="picker-footer">
      <!-- 빠른 선택 버튼들 -->
      <div class="quick-select">
        <button class="quick-btn" @click="setQuickDate(1)">당일</button>
        <button class="quick-btn" @click="setQuickDate(3)">3일</button>
        <button class="quick-btn" @click="setQuickDate(7)">1주일</button>
        <button class="quick-btn" @click="setQuickDate(14)">2주일</button>
      </div>

      <!-- 액션 버튼들 -->
      <div class="action-buttons">
        <button class="clear-btn" @click="clearDates"><i class="fas fa-times me-1"></i>초기화</button>
        <button class="confirm-btn" :disabled="!startDate || !endDate" @click="confirmSelection">
          <i class="fas fa-check me-1"></i>확인
        </button>
      </div>
    </div>

    <!-- 안내 메시지 -->
    <div v-if="showHint" class="hint-message">
      <i class="fas fa-info-circle me-2"></i>
      {{ hintMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

// Props & Emits
const props = defineProps({
  startDate: {
    type: String,
    default: "",
  },
  endDate: {
    type: String,
    default: "",
  },
  minDate: {
    type: Date,
    default: () => {
      // 오늘 날짜가 선택 가능하도록 minDate를 오늘로 설정
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    },
  },
  maxDate: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date;
    },
  },
});

const emit = defineEmits(["update:startDate", "update:endDate", "dates-changed"]);

// 상태 관리
const currentMonth = ref(new Date());
const startDate = ref(null);
const endDate = ref(null);
const hoverDate = ref(null);
const isSelectingEnd = ref(false);
const showHint = ref(true);

// 상수들
const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

// Props 초기값 설정
onMounted(() => {
  if (props.startDate) {
    startDate.value = new Date(props.startDate);
  }
  if (props.endDate) {
    endDate.value = new Date(props.endDate);
  }
});

// 계산된 속성들
const today = computed(() => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
});

const travelDays = computed(() => {
  if (startDate.value && endDate.value) {
    const diffTime = Math.abs(endDate.value - startDate.value);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  return 0;
});

const hintMessage = computed(() => {
  if (!startDate.value) {
    return "시작일을 선택해주세요";
  } else if (!endDate.value) {
    return "종료일을 선택해주세요";
  } else if (startDate.value.getTime() === endDate.value.getTime()) {
    return `당일 여행을 계획하고 있습니다`;
  } else {
    return `${travelDays.value}일간의 멋진 여행을 계획해보세요!`;
  }
});

const calendarDays = computed(() => {
  return generateCalendarDays(currentMonth.value);
});

// 메서드들
const generateCalendarDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startCalendarDate = new Date(firstDay);
  startCalendarDate.setDate(1 - firstDay.getDay());

  const days = [];
  const currentDate = new Date(startCalendarDate);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};

const isDateDisabled = (date) => {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  // 오늘 날짜를 비교용으로 생성
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 오늘 날짜는 선택 가능하도록 설정
  return checkDate < today || checkDate > props.maxDate;
};

const handleDateClick = (date) => {
  if (isDateDisabled(date)) return;

  const clickedDate = new Date(date);
  clickedDate.setHours(0, 0, 0, 0);

  if (!startDate.value || (startDate.value && endDate.value)) {
    // 새로운 시작일 선택
    startDate.value = clickedDate;
    endDate.value = null;
    isSelectingEnd.value = true;
    showHint.value = true;
  } else if (isSelectingEnd.value) {
    if (clickedDate < startDate.value) {
      // 시작일보다 이전 날짜 선택 시 시작일을 새로 설정
      startDate.value = clickedDate;
      endDate.value = null;
    } else {
      // 종료일 설정
      endDate.value = clickedDate;
      isSelectingEnd.value = false;

      // 1일 여행인 경우 안내
      if (clickedDate.getTime() === startDate.value.getTime()) {
        setTimeout(() => {
          showHint.value = true;
        }, 500);
      }
    }
  }

  // 부모 컴포넌트에 변경된 날짜만 알리고, '확인' 버튼 클릭 시에만 선택 완료 이벤트 발생
  if (startDate.value) {
    emit("update:startDate", formatDateForInput(startDate.value));
  }
  if (endDate.value) {
    emit("update:endDate", formatDateForInput(endDate.value));
  }
};

const isInRange = (date) => {
  if (!startDate.value) return false;

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  if (endDate.value) {
    return checkDate >= startDate.value && checkDate <= endDate.value;
  } else if (hoverDate.value && isSelectingEnd.value) {
    const start = startDate.value;
    const end = hoverDate.value > startDate.value ? hoverDate.value : startDate.value;
    return checkDate >= start && checkDate <= end;
  }

  return false;
};

const getDateClass = (date) => {
  const classes = ["calendar-day"];
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  // 현재 월이 아닌 날짜
  if (date.getMonth() !== currentMonth.value.getMonth()) {
    classes.push("other-month");
  }

  // 비활성화된 날짜
  if (isDateDisabled(date)) {
    classes.push("disabled");
  }

  // 오늘 날짜
  if (checkDate.getTime() === today.value.getTime()) {
    classes.push("today");
  }

  // 선택된 시작일
  if (startDate.value && checkDate.getTime() === startDate.value.getTime()) {
    classes.push("selected", "start-date");
  }

  // 선택된 종료일
  if (endDate.value && checkDate.getTime() === endDate.value.getTime()) {
    classes.push("selected", "end-date");
  }

  // 범위 내 날짜
  if (
    isInRange(date) &&
    (!startDate.value || checkDate.getTime() !== startDate.value.getTime()) &&
    (!endDate.value || checkDate.getTime() !== endDate.value.getTime())
  ) {
    classes.push("in-range");
  }

  return classes.join(" ");
};

const navigateMonth = (direction) => {
  const newMonth = new Date(currentMonth.value);
  newMonth.setMonth(currentMonth.value.getMonth() + direction);
  currentMonth.value = newMonth;
};

const setQuickDate = (days) => {
  const start = new Date(today.value);
  const end = new Date(today.value);
  end.setDate(end.getDate() + days - 1); // 당일 여행의 경우 days가 1이면 end는 start와 같은 날짜가 됨

  startDate.value = start;
  endDate.value = end;
  isSelectingEnd.value = false;
  showHint.value = true;

  // 날짜만 변경하고 실제 확정은 '확인' 버튼을 통해 이루어지도록 함
  emit("update:startDate", formatDateForInput(start));
  emit("update:endDate", formatDateForInput(end));
};

// 4. DateRangePicker에서 emit되는 이벤트 처리 개선
const handleDateUpdate = (field, value) => {
  plan.value[field] = value;

  // 양쪽 날짜가 모두 설정되었을 때만 계산 실행
  if (plan.value.startDate && plan.value.endDate) {
    calculateDays();
  }
};

// 5. 더 안전한 날짜 계산 함수
const calculateDays = () => {
  if (!plan.value.startDate || !plan.value.endDate) {
    return;
  }

  try {
    const start = new Date(plan.value.startDate);
    const end = new Date(plan.value.endDate);

    // 유효한 날짜인지 확인
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn("유효하지 않은 날짜:", plan.value.startDate, plan.value.endDate);
      return;
    }

    // 종료일이 시작일보다 이전인 경우 조정
    if (end < start) {
      plan.value.endDate = plan.value.startDate;
      return;
    }

    const dayCount = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    console.log("계산된 여행 일수:", dayCount);
  } catch (error) {
    console.error("날짜 계산 중 오류:", error);
  }
};
const clearDates = () => {
  startDate.value = null;
  endDate.value = null;
  isSelectingEnd.value = false;
  showHint.value = true;

  // 초기화 후 부모에게 알림
  emit("update:startDate", "");
  emit("update:endDate", "");
};

const confirmSelection = () => {
  if (startDate.value && endDate.value) {
    const startDateStr = formatDateForInput(startDate.value);
    const endDateStr = formatDateForInput(endDate.value);

    // '확인' 버튼 클릭 시에만 dates-changed 이벤트 발생
    emit("dates-changed", {
      startDate: startDateStr,
      endDate: endDateStr,
      duration: travelDays.value,
    });

    showHint.value = false;
  }
};

const formatDisplayDate = (date) => {
  if (!date) return "";
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const formatDateForInput = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 선택이 완료된 경우 부모에게 전체 범위 전달
watch([startDate, endDate], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    emit("dateSelected", {
      startDate: newStart.toISOString().split("T")[0],
      endDate: newEnd.toISOString().split("T")[0],
      travelDays: travelDays.value,
    });
  }
});
</script>

<style scoped>
.date-range-picker {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.picker-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 14px;
  text-align: center;
}

.picker-header h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
}

.selected-dates {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.date-input-group {
  text-align: center;
}

.date-input-group label {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.date-display {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  min-width: 100px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.date-display.empty {
  color: rgba(255, 255, 255, 0.6);
}

.date-separator {
  font-size: 18px;
  font-weight: bold;
  opacity: 0.8;
}

.travel-duration {
  margin-top: 8px;
}

.duration-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.calendar-container {
  padding: 20px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.calendar-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #667eea;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #f0f4ff;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-header {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  padding: 8px 4px;
}

.calendar-day {
  aspect-ratio: 1;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
}

.calendar-day:hover:not(.disabled) {
  background: #f0f4ff;
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-day.disabled {
  color: #ddd;
  cursor: not-allowed;
}

.calendar-day.today {
  background: #fff3e0;
  color: #ff9800;
  font-weight: 600;
}

.calendar-day.selected {
  background: #667eea;
  color: white;
  font-weight: 600;
}

.calendar-day.start-date {
  border-radius: 8px 4px 4px 8px;
}

.calendar-day.end-date {
  border-radius: 4px 8px 8px 4px;
}

.calendar-day.in-range {
  background: #e8f0fe;
  color: #1976d2;
}

.picker-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.quick-select {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.clear-btn,
.confirm-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn {
  background: #f5f5f5;
  color: #666;
}

.clear-btn:hover {
  background: #e0e0e0;
}

.confirm-btn {
  background: #667eea;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.hint-message {
  padding: 12px 20px;
  background: #f0f4ff;
  color: #4a5568;
  text-align: center;
  font-size: 14px;
  border-top: 1px solid #e2e8f0;
}

.travel-alert {
  margin-top: 20px;
  font-size: 14px;
  text-align: center;
}

@media (max-width: 480px) {
  .date-range-picker {
    margin: 10px;
    max-width: none;
  }

  .selected-dates {
    flex-direction: column;
    gap: 8px;
  }

  .quick-select {
    flex-wrap: wrap;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
