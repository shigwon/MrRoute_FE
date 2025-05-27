<!-- src/views/plan/PlanCreateView.vue -->
<template>
  <div class="plan-create-view">
    <!-- 상단 진행 단계 표시 -->
    <div class="progress-steps">
      <div class="container">
        <div class="steps-container">
          <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-title">기본 정보</div>
          </div>
          <div class="step-line" :class="{ completed: currentStep > 1 }"></div>
          <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-title">여행지 선택</div>
          </div>
          <div class="step-line" :class="{ completed: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep === 3 }">
            <div class="step-number">3</div>
            <div class="step-title">일정 완성</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 1: 기본 정보 입력 -->
    <PlanBasicInfoStep
      v-if="currentStep === 1"
      v-model="planData"
      @next="handleStep1Next"
      @cancel="handleCancel"
    />

    <!-- Step 2: 여행지 선택 -->
    <PlanLocationSelectStep
      v-if="currentStep === 2"
      :plan-data="planData"
      @previous="handleStep2Previous"
      @next="handleStep2Next"
      @update-attractions="updateSelectedAttractions"
    />

    <!-- Step 3: 일정 완성 -->
    <PlanScheduleStep
      v-if="currentStep === 3"
      :plan-data="planData"
      :selected-attractions="selectedAttractions"
      @previous="handleStep3Previous"
      @save="handlePlanSave"
      @draft-save="handleDraftSave"
    />

    <!-- 디버깅 정보 (개발 환경에서만 표시) -->
    <div v-if="isDevelopment" class="debug-info">
      <details>
        <summary>디버깅 정보</summary>
        <div class="debug-content">
          <h4>현재 단계: {{ currentStep }}</h4>
          <h4>계획 데이터:</h4>
          <pre>{{ JSON.stringify(planData, null, 2) }}</pre>
          <h4>선택된 관광지 ({{ selectedAttractions.length }}개):</h4>
          <pre>{{ JSON.stringify(selectedAttractions.map(a => ({ 
            no: a.no, 
            title: a.title, 
            assignedDay: a.assignedDay 
          })), null, 2) }}</pre>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PlanBasicInfoStep from '@/components/plan/create/PlanBasicInfoStep.vue'
import PlanLocationSelectStep from '@/components/plan/create/PlanLocationSelectStep.vue'
import PlanScheduleStep from '@/components/plan/create/PlanScheduleStep.vue'

const router = useRouter()
const authStore = useAuthStore()

// 개발 환경 확인
const isDevelopment = computed(() => import.meta.env.DEV)

// 인증 확인
if (!authStore.isAuthenticated) {
  router.push('/login?redirect=/plans/create')
}

// 상태 관리
const currentStep = ref(1)

// 여행 계획 데이터
const planData = ref({
  title: '',
  description: '',
  startDate: '',
  endDate: ''
})

// 선택된 관광지 데이터
const selectedAttractions = ref([])

// 메서드
const handleStep1Next = (data) => {
  console.log('Step 1 완료:', data)
  planData.value = { ...planData.value, ...data }
  currentStep.value = 2
}

const handleStep2Previous = () => {
  console.log('Step 2에서 이전 단계로')
  currentStep.value = 1
}

const handleStep2Next = (data) => {
  console.log('Step 2 완료, 받은 데이터:', data)
  
  // 여러 가지 형태의 데이터 구조를 처리
  if (data) {
    if (data.attractions) {
      selectedAttractions.value = [...data.attractions]
    } else if (Array.isArray(data)) {
      selectedAttractions.value = [...data]
    } else if (data.selectedAttractions) {
      selectedAttractions.value = [...data.selectedAttractions]
    }
  }
  
  console.log('Step 2 완료 후 선택된 관광지:', selectedAttractions.value.length + '개')
  console.log('선택된 관광지 목록:', selectedAttractions.value.map(a => a.title))
  
  if (selectedAttractions.value.length === 0) {
    alert('여행지를 하나 이상 선택해주세요.')
    return
  }
  
  currentStep.value = 3
}

// Step 2에서 관광지 업데이트 처리
const updateSelectedAttractions = (attractions) => {
  console.log('관광지 업데이트:', attractions.length + '개')
  selectedAttractions.value = [...attractions]
}

const handleStep3Previous = () => {
  console.log('Step 3에서 이전 단계로')
  currentStep.value = 2
}

const handleCancel = () => {
  if (confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
    router.push('/plans')
  }
}

const handlePlanSave = (result) => {
  console.log('여행 계획 저장 완료:', result)
  alert(result.message)
  router.push(`/plans/${result.planId}`)
}

const handleDraftSave = () => {
  console.log('임시저장 완료')
}

// 브라우저 뒤로가기 방지 (선택사항)
const handleBeforeUnload = (event) => {
  if (currentStep.value > 1) {
    event.preventDefault()
    event.returnValue = '작성 중인 내용이 사라집니다. 정말 나가시겠습니까?'
  }
}

// 라이프사이클
onMounted(() => {
  console.log('PlanCreateView 마운트됨')
  
  // 임시저장된 데이터 복원 시도
  const savedPlan = localStorage.getItem('plan_draft')
  if (savedPlan) {
    try {
      const draft = JSON.parse(savedPlan)
      if (confirm('임시저장된 계획이 있습니다. 복원하시겠습니까?')) {
        planData.value = {
          title: draft.title || '',
          description: draft.description || '',
          startDate: draft.startDate || '',
          endDate: draft.endDate || ''
        }
        
        if (draft.attractions && draft.attractions.length > 0) {
          selectedAttractions.value = draft.attractions
          currentStep.value = 3  // 관광지까지 선택된 경우 3단계로
        } else if (planData.value.title && planData.value.startDate) {
          currentStep.value = 2  // 기본 정보만 있는 경우 2단계로
        }
      }
    } catch (error) {
      console.error('임시저장 데이터 복원 오류:', error)
      localStorage.removeItem('plan_draft')
    }
  }
  
  // 페이지 나가기 전 확인
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
import { onUnmounted } from 'vue'

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.plan-create-view {
  min-height: 100vh;
  background: #f8f9fa;
}

.progress-steps {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
  position: sticky;
  top: -80px;
  z-index: 999;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.progress-steps.hide {
  opacity: 0;
  transform: translateY(-20px);
  pointer-events: none;
}

.steps-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.6;
  transition: all 0.3s;
}

.step.active,
.step.completed {
  opacity: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
}

.step.active .step-number {
  background: white;
  color: #667eea;
  transform: scale(1.1);
}

.step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-title {
  font-size: 0.9rem;
  text-align: center;
}

.step-line {
  width: 100px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 1rem;
  transition: all 0.3s;
}

.step-line.completed {
  background: #28a745;
}

/* 디버깅 정보 스타일 */
.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  max-width: 300px;
  z-index: 9999;
}

.debug-content {
  margin-top: 10px;
}

.debug-content pre {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 4px;
  overflow: auto;
  max-height: 200px;
  font-size: 10px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .progress-steps {
    padding: 1.5rem 0;
  }
  
  .steps-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .step-line {
    width: 2px;
    height: 30px;
    margin: 0;
  }
  
  .debug-info {
    position: relative;
    top: auto;
    right: auto;
    margin: 20px;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .progress-steps {
    padding: 1rem 0;
  }
  
  .step-number {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
  
  .step-title {
    font-size: 0.8rem;
  }
}
</style>