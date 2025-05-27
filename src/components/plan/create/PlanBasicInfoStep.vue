<!-- src/components/plan/create/PlanBasicInfoStep.vue -->
<template>
    <div class="plan-basic-info-step">
      <div class="container py-4">
        <div class="step-content">
          <div class="card">
            <div class="card-header bg-white">
              <h2 class="mb-0">📝 여행 기본 정보를 입력해주세요</h2>
              <p class="text-muted mb-0">여행의 기본 정보를 설정해보세요</p>
            </div>
            <div class="card-body">
              <div class="row">
                <!-- 날짜 선택 영역 -->
                <div class="col-md-8">
                  <div class="mb-4">
                    <label class="form-label">
                      <i class="fas fa-calendar-alt me-2"></i>여행 기간
                    </label>
                    <DateRangePicker
                      :start-date="planData.startDate"
                      :end-date="planData.endDate"
                      @update:start-date="updateStartDate"
                      @update:end-date="updateEndDate"
                      @dates-changed="onDatesChanged"
                    />
                  </div>
                </div>
  
                <!-- 기본 정보 입력 영역 -->
                <div class="col-md-4" style="margin-top: 30px; ">
                  <div class="travel-tips mb-4">
                    <h5><i class="fas fa-lightbulb text-warning me-2"></i>여행 계획 팁</h5>
                    <ul class="tips-list">
                      <li>구체적인 제목을 지으면 나중에 찾기 쉬워요</li>
                      <li>여행 기간은 너무 빡빡하지 않게 계획하세요</li>
                      <li>날씨와 계절을 고려해주세요</li>
                      <li>교통편 예약도 미리 확인해보세요</li>
                    </ul>
                  </div>
  
                  <form @submit.prevent="handleSubmit">
                    <div class="mb-4">
                      <label for="title" class="form-label">
                        <i class="fas fa-plane me-2"></i>여행 제목
                      </label>
                      <input
                        type="text"
                        id="title"
                        v-model="planData.title"
                        class="form-control form-control-lg"
                        placeholder="예: 부산 바다 여행"
                        required
                        maxlength="100"
                      />
                      <div class="form-text">
                        {{ planData.title.length }}/100자
                      </div>
                    </div>
  
                    <div class="mb-4">
                      <label for="description" class="form-label">
                        <i class="fas fa-comment-alt me-2"></i>여행 설명
                      </label>
                      <textarea
                        id="description"
                        v-model="planData.description"
                        class="form-control"
                        rows="4"
                        placeholder="어떤 여행인지 간단히 설명해주세요"
                        maxlength="500"
                      ></textarea>
                      <div class="form-text">
                        {{ planData.description.length }}/500자
                      </div>
                    </div>
  
                    <!-- 여행 정보 요약 -->
                    <div v-if="isFormValid" class="trip-summary">
                      <h6><i class="fas fa-info-circle me-2"></i>여행 정보 요약</h6>
                      <div class="summary-content">
                        <div class="summary-item">
                          <strong>제목:</strong> {{ planData.title }}
                        </div>
                        <div class="summary-item">
                          <strong>기간:</strong> {{ formatDateRange() }}
                        </div>
                        <div class="summary-item">
                          <strong>일수:</strong> {{ dayCount }}일
                        </div>
                        <div v-if="planData.description" class="summary-item">
                          <strong>설명:</strong> {{ planData.description }}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
  
              <!-- 하단 버튼 영역 -->
              <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary"
                  @click="handleCancel"
                >
                  <i class="fas fa-arrow-left me-2"></i>취소
                </button>
                
                <div class="next-step-info">
                  <div v-if="!isFormValid" class="text-muted small mb-2">
                    <i class="fas fa-exclamation-circle me-1"></i>
                    모든 필수 정보를 입력해주세요
                  </div>
                  <button 
                    type="button" 
                    class="btn btn-primary btn-lg"
                    :disabled="!isFormValid"
                    @click="handleNext"
                  >
                    다음 단계 
                    <i class="fas fa-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import DateRangePicker from '@/components/common/DateRangePicker.vue'
  
  // Props 정의
  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => ({
        title: '',
        description: '',
        startDate: '',
        endDate: ''
      })
    }
  })
  
  // Events 정의
  const emit = defineEmits(['update:modelValue', 'next', 'cancel'])
  
  // 반응형 데이터
  const planData = ref({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  })
  
  // 계산된 속성
  const dayCount = computed(() => {
    if (!planData.value.startDate || !planData.value.endDate) return 0
    const start = new Date(planData.value.startDate)
    const end = new Date(planData.value.endDate)
    const diffTime = Math.abs(end - start)
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  })
  
  const isFormValid = computed(() => {
    return !!(
      planData.value.title.trim() && 
      planData.value.startDate && 
      planData.value.endDate && 
      dayCount.value > 0
    )
  })
  
  // 메서드
  const updateStartDate = (date) => {
    planData.value.startDate = date
    validateDates()
    emitUpdate()
  }
  
  const updateEndDate = (date) => {
    planData.value.endDate = date
    validateDates()
    emitUpdate()
  }
  
  const validateDates = () => {
    if (planData.value.startDate && planData.value.endDate) {
      const start = new Date(planData.value.startDate)
      const end = new Date(planData.value.endDate)
      
      if (end < start) {
        planData.value.endDate = planData.value.startDate
      }
    }
  }
  
  const onDatesChanged = (dates) => {
    console.log('날짜가 변경되었습니다:', dates)
  }
  
  const formatDateRange = () => {
    if (!planData.value.startDate || !planData.value.endDate) return ''
    
    const start = new Date(planData.value.startDate)
    const end = new Date(planData.value.endDate)
    
    const startStr = start.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    const endStr = end.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    return `${startStr} ~ ${endStr}`
  }
  
  const emitUpdate = () => {
    emit('update:modelValue', { ...planData.value })
  }
  
  const handleNext = () => {
    if (!isFormValid.value) return
    
    emit('next', { ...planData.value })
  }
  
  const handleCancel = () => {
    emit('cancel')
  }
  
  const handleSubmit = () => {
    handleNext()
  }
  
  // Watch로 props 변경 감지
  watch(() => props.modelValue, (newValue) => {
    if (newValue) {
      planData.value = { ...newValue }
    }
  }, { deep: true, immediate: true })
  
  // Watch로 planData 변경 감지하여 부모에게 전달
  watch(planData, () => {
    emitUpdate()
  }, { deep: true })
  
  // 컴포넌트 마운트 시 초기값 설정
  onMounted(() => {
    // 오늘 날짜를 기본값으로 설정
    if (!planData.value.startDate) {
      const today = new Date()
      planData.value.startDate = today.toISOString().split('T')[0]
      
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      planData.value.endDate = tomorrow.toISOString().split('T')[0]
      
      emitUpdate()
    }
  })
  </script>
  
  <style scoped>
  .plan-basic-info-step .card {
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
  
  .travel-tips {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 1.5rem;
    border-radius: 12px;
    border-left: 4px solid #667eea;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .travel-tips h5 {
    color: #495057;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .tips-list li {
    padding: 0.75rem 0;
    font-size: 0.9rem;
    color: #6c757d;
    line-height: 1.5;
    position: relative;
    padding-left: 2rem;
  }
  
  .tips-list li:before {
    content: "💡";
    position: absolute;
    left: 0;
    top: 0.75rem;
  }
  
  .tips-list li:not(:last-child) {
    border-bottom: 1px solid #e9ecef;
  }
  
  .form-control {
    border-radius: 8px;
    border: 1px solid #dee2e6;
    padding: 0.75rem 1rem;
    transition: all 0.3s ease;
  }
  
  .form-control:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  }
  
  .form-control-lg {
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .form-label {
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
  }
  
  .form-label i {
    color: #667eea;
  }
  
  .form-text {
    font-size: 0.8rem;
    color: #6c757d;
    text-align: right;
  }
  
  .trip-summary {
    background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
    border-radius: 12px;
    padding: 1.25rem;
    border: 1px solid #bbdefb;
    margin-top: 1.5rem;
  }
  
  .trip-summary h6 {
    color: #1976d2;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .summary-content {
    space-y: 0.5rem;
  }
  
  .summary-item {
    padding: 0.5rem 0;
    font-size: 0.9rem;
    color: #495057;
    border-bottom: 1px solid rgba(25, 118, 210, 0.1);
  }
  
  .summary-item:last-child {
    border-bottom: none;
  }
  
  .summary-item strong {
    color: #1976d2;
    font-weight: 600;
  }
  
  .next-step-info {
    text-align: right;
  }
  
  .btn {
    border-radius: 8px;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    transition: all 0.3s ease;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  .btn-primary:disabled {
    background: #6c757d;
    box-shadow: none;
    transform: none;
    cursor: not-allowed;
  }
  
  .btn-outline-secondary {
    border-color: #6c757d;
    color: #6c757d;
  }
  
  .btn-outline-secondary:hover {
    background: #6c757d;
    border-color: #6c757d;
    transform: translateY(-1px);
  }
  
  .btn-lg {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .card-header {
      padding: 1.5rem;
    }
    
    .card-header h2 {
      font-size: 1.5rem;
    }
    
    .travel-tips {
      margin-bottom: 2rem;
    }
    
    .tips-list li {
      font-size: 0.85rem;
      padding: 0.5rem 0;
      padding-left: 1.5rem;
    }
    
    .btn-lg {
      width: 100%;
      margin-top: 1rem;
    }
    
    .d-flex.justify-content-between {
      flex-direction: column;
      gap: 1rem;
    }
    
    .next-step-info {
      text-align: center;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 0 15px;
    }
    
    .card-body {
      padding: 1.5rem;
    }
    
    .travel-tips {
      padding: 1rem;
    }
    
    .trip-summary {
      padding: 1rem;
    }
    
    .summary-item {
      font-size: 0.85rem;
    }
  }
  
  /* 애니메이션 효과 */
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
  
  .trip-summary {
    animation: fadeInUp 0.5s ease-out;
  }
  
  .form-control:focus {
    animation: pulse 0.3s ease-in-out;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }
  </style>