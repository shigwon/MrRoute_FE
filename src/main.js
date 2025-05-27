// src/main.js 수정사항
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

// 스타일 및 라이브러리
import "./assets/css/main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const app = createApp(App);

// 전역 에러 핸들러 설정
app.config.errorHandler = (error, instance, info) => {
  console.error('Vue 전역 에러:', error, info);
  
  // parentNode 관련 에러는 무시
  if (error.message && error.message.includes('parentNode')) {
    return;
  }
  
  // 개발 환경에서만 상세 에러 출력
  if (import.meta.env.DEV) {
    console.error('컴포넌트 인스턴스:', instance);
    console.error('에러 정보:', info);
  }
};

// 전역 경고 핸들러 설정 (개발 환경)
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    // 특정 경고는 무시
    if (msg.includes('parentNode') || msg.includes('scrollBehavior')) {
      return;
    }
    console.warn('Vue 경고:', msg, trace);
  };
}

app.use(createPinia());
app.use(router);

app.mount("#app");