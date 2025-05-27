<!-- src/App.vue 수정사항 -->
<template>
  <div class="app">
    <AppHeader />
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </transition>
      </router-view>
    </main>
    <AppFooter />

    <!-- 챗봇 컴포넌트 추가 -->
    <Chatbot />
  </div>
</template>

<script setup>
import { onMounted, onErrorCaptured } from "vue";
import { useAuthStore } from "@/stores/auth";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import Chatbot from "@/components/common/Chatbot.vue";

const authStore = useAuthStore();

onMounted(async () => {
  // 로컬 스토리지에 토큰이 있으면 사용자 정보 로드
  if (authStore.token && !authStore.user) {
    try {
      await authStore.loadUser();
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    }
  }
});

// 컴포넌트 레벨 에러 캐처
onErrorCaptured((error, instance, info) => {
  console.error('컴포넌트 에러 캐치:', error, info);
  
  // parentNode 관련 에러는 무시
  if (error.message && error.message.includes('parentNode')) {
    return false; // 에러 전파 중단
  }
  
  // 다른 에러들은 계속 전파
  return true;
});

// 전역 에러 핸들러 (브라우저 레벨)
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('parentNode')) {
    event.preventDefault(); // 에러 무시
    return false;
  }
});

// 전역 Promise rejection 핸들러
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('parentNode')) {
    event.preventDefault(); // 에러 무시
    return false;
  }
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 페이지 전환 시 깜빡임 방지 */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>