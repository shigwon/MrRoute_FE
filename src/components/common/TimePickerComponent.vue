<!-- src/components/common/TimePickerComponent.vue -->
<template>
  <div class="time-picker-container">
    <label v-if="label" class="form-label small">{{ label }}</label>
    <div class="time-picker-wrapper">
      <div class="time-input-group">
        <select v-model="selectedHour" class="time-select hour-select" @change="updateTime">
          <option v-for="hour in hours" :key="hour" :value="hour">
            {{ hour.toString().padStart(2, "0") }}
          </option>
        </select>
        <span class="time-separator">:</span>
        <select v-model="selectedMinute" class="time-select minute-select" @change="updateTime">
          <option v-for="minute in minutes" :key="minute" :value="minute">
            {{ minute.toString().padStart(2, "0") }}
          </option>
        </select>
      </div>
      <div class="quick-times">
        <button
          v-for="quickTime in quickTimes"
          :key="quickTime.value"
          type="button"
          class="quick-time-btn"
          :class="{ active: modelValue === quickTime.value }"
          @click="setQuickTime(quickTime.value)"
        >
          {{ quickTime.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const selectedHour = ref(9);
const selectedMinute = ref(0);

// 시간 옵션 (6시부터 23시까지)
const hours = computed(() => {
  const result = [];
  for (let i = 6; i <= 23; i++) {
    result.push(i);
  }
  return result;
});

// 분 옵션 (15분 단위)
const minutes = computed(() => [0, 15, 30, 45]);

// 빠른 시간 선택 옵션
const quickTimes = ref([
  { label: "오전 9시", value: "09:00" },
  { label: "오전 10시", value: "10:00" },
  { label: "오후 1시", value: "13:00" },
  { label: "오후 2시", value: "14:00" },
  { label: "오후 3시", value: "15:00" },
]);

const updateTime = () => {
  const timeString = `${selectedHour.value.toString().padStart(2, "0")}:${selectedMinute.value
    .toString()
    .padStart(2, "0")}`;
  emit("update:modelValue", timeString);
};

const setQuickTime = (timeValue) => {
  const [hour, minute] = timeValue.split(":").map(Number);
  selectedHour.value = hour;
  selectedMinute.value = minute;
  emit("update:modelValue", timeValue);
};

// props 값이 변경될 때 내부 상태 업데이트
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue.includes(":")) {
      const [hour, minute] = newValue.split(":").map(Number);
      selectedHour.value = hour;
      selectedMinute.value = minute;
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (!props.modelValue) {
    updateTime();
  }
});
</script>

<style scoped>
.time-picker-container {
  width: 100%;
}

.time-picker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  transition: border-color 0.3s;
}

.time-input-group:focus-within {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.time-select {
  border: none;
  outline: none;
  background: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 2px 4px;
  cursor: pointer;
}

.hour-select {
  width: 40px;
}

.minute-select {
  width: 40px;
}

.time-separator {
  font-size: 1.2rem;
  font-weight: bold;
  color: #495057;
  margin: 0 2px;
}

.quick-times {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.quick-time-btn {
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  background: white;
  color: #6c757d;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-time-btn:hover {
  background: #f8f9fa;
  border-color: #0d6efd;
  color: #0d6efd;
}

.quick-time-btn.active {
  background: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

/* 반응형 */
@media (max-width: 480px) {
  .quick-times {
    gap: 2px;
  }

  .quick-time-btn {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
}
</style>
