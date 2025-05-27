<!-- src/components/common/Chatbot.vue -->
<template>
  <div class="chatbot-container">
    <!-- 챗봇 버튼 -->
    <div
      v-if="!isOpen"
      class="chatbot-toggle-btn"
      @click="toggleChatbot"
      :class="{ 'has-notification': hasNewMessage }"
    >
      <i class="fas fa-comments"></i>
      <span v-if="hasNewMessage" class="notification-badge"></span>
    </div>

    <!-- 챗봇 창 -->
    <div v-if="isOpen" class="chatbot-window">
      <!-- 헤더 -->
      <div class="chatbot-header">
        <div class="chatbot-title">
          <i class="fas fa-robot me-2"></i>
          여행 도우미
        </div>
        <button class="chatbot-close-btn" @click="toggleChatbot">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- 메시지 영역 -->
      <div class="chatbot-messages" ref="messagesContainer">
        <div class="welcome-message">
          <div class="message bot-message">
            <div class="message-content">
              안녕하세요! 여행 도우미입니다. 🌏<br />
              여행 계획이나 관광지에 대해 궁금한 것이 있으시면 언제든 물어보세요!
            </div>
            <div class="message-time">{{ formatTime(new Date()) }}</div>
          </div>
        </div>

        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message-wrapper"
          :class="{ 'user-wrapper': message.isUser, 'bot-wrapper': !message.isUser }"
        >
          <div class="message" :class="{ 'user-message': message.isUser, 'bot-message': !message.isUser }">
            <div class="message-content" v-html="formatMessage(message.content)"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>

        <!-- 로딩 메시지 -->
        <div v-if="isLoading" class="message-wrapper bot-wrapper">
          <div class="message bot-message">
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 입력 영역 -->
      <div class="chatbot-input">
        <div class="quick-replies" v-if="!hasMessages && !isLoading">
          <button v-for="reply in quickReplies" :key="reply" class="quick-reply-btn" @click="sendMessage(reply)">
            {{ reply }}
          </button>
        </div>

        <div class="input-container">
          <input
            v-model="currentMessage"
            @keyup.enter="sendMessage()"
            @input="handleTyping"
            placeholder="메시지를 입력하세요..."
            :disabled="isLoading"
            class="message-input"
            maxlength="500"
          />
          <button @click="sendMessage()" :disabled="!currentMessage.trim() || isLoading" class="send-btn">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import apiClient from "@/api";

// 상태 관리
const isOpen = ref(false);
const currentMessage = ref("");
const messages = ref([]);
const isLoading = ref(false);
const hasNewMessage = ref(false);
const messagesContainer = ref(null);

// 빠른 답변 버튼
const quickReplies = ref(["인기 관광지 추천해줘", "여행 계획 세우는 방법", "맛집 추천", "숙박 추천", "교통 정보"]);

// 계산된 속성
const hasMessages = computed(() => messages.value.length > 0);

// 메서드
const toggleChatbot = () => {
  isOpen.value = !isOpen.value;
  hasNewMessage.value = false;

  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }
};

const sendMessage = async (message = null) => {
  const messageText = message || currentMessage.value.trim();

  if (!messageText || isLoading.value) return;

  // 사용자 메시지 추가
  messages.value.push({
    content: messageText,
    isUser: true,
    timestamp: new Date(),
  });

  currentMessage.value = "";
  isLoading.value = true;

  await nextTick();
  scrollToBottom();

  try {
    // 챗봇 API 호출
    const response = await apiClient.post("/chatbot/message", {
      message: messageText,
    });

    // 봇 응답 추가
    messages.value.push({
      content: response.data.response || "죄송합니다. 응답을 생성할 수 없습니다.",
      isUser: false,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("챗봇 응답 오류:", error);

    // 에러 시 기본 응답
    let errorMessage = "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

    // 네트워크 오류 처리
    if (!navigator.onLine) {
      errorMessage = "인터넷 연결을 확인해주세요.";
    }

    messages.value.push({
      content: errorMessage,
      isUser: false,
      timestamp: new Date(),
    });
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();

    // 창이 닫혀있으면 알림 표시
    if (!isOpen.value) {
      hasNewMessage.value = true;
    }
  }
};

const scrollToBottom = () => {
  // 안전한 스크롤 처리
  if (!messagesContainer.value) return;
  
  try {
    // DOM 요소가 여전히 존재하는지 확인
    if (document.contains(messagesContainer.value)) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  } catch (error) {
    console.warn('챗봇 스크롤 처리 실패:', error);
  }
};

const formatTime = (date) => {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMessage = (content) => {
  // URL을 링크로 변환
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return content
    .replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n/g, "<br>");
};

const handleTyping = () => {
  // 타이핑 상태 처리 (필요시 구현)
};

// 키보드 단축키
const handleKeyboard = (event) => {
  // ESC로 챗봇 닫기
  if (event.key === "Escape" && isOpen.value) {
    toggleChatbot();
  }
};

// 생명주기
onMounted(() => {
  document.addEventListener("keydown", handleKeyboard);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyboard);
});

// 컴포넌트 외부에서 사용할 수 있도록 expose
defineExpose({
  toggleChatbot,
  sendMessage,
});
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 85px;
  right: 20px;
  z-index: 1000;
  font-family: "Noto Sans KR", sans-serif;
}

/* 챗봇 토글 버튼 */
.chatbot-toggle-btn {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
}

.chatbot-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.chatbot-toggle-btn i {
  color: white;
  font-size: 24px;
}

.chatbot-toggle-btn.has-notification {
  animation: pulse 2s infinite;
}

.notification-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 12px;
  height: 12px;
  background-color: #ff4757;
  border-radius: 50%;
  border: 2px solid white;
}

/* 챗봇 창 */
.chatbot-window {
  width: 500px;
  height: 700px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 헤더 */
.chatbot-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chatbot-title {
  font-weight: 600;
  font-size: 16px;
}

.chatbot-close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.chatbot-close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 메시지 영역 */
.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f8f9fa;
}

.message-wrapper {
  margin-bottom: 15px;
}

.user-wrapper {
  display: flex;
  justify-content: flex-end;
}

.bot-wrapper {
  display: flex;
  justify-content: flex-start;
}

.message {
  max-width: 80%;
  padding: 12px 15px;
  border-radius: 18px;
  position: relative;
}

.user-message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 5px;
}

.bot-message {
  background: white;
  color: #333;
  border: 1px solid #e1e8ed;
  border-bottom-left-radius: 5px;
}

.message-content {
  font-size: 18px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 5px;
}

/* 타이핑 애니메이션 */
.typing-indicator {
  display: flex;
  gap: 3px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #667eea;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 빠른 답변 버튼 */
.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.quick-reply-btn {
  padding: 8px 12px;
  background: white;
  border: 1px solid #667eea;
  color: #667eea;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-reply-btn:hover {
  background: #667eea;
  color: white;
}

/* 입력 영역 */
.chatbot-input {
  padding: 15px 20px;
  background: white;
  border-top: 1px solid #e1e8ed;
}

.input-container {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #e1e8ed;
  border-radius: 25px;
  outline: none;
  font-size: 14px;
  resize: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #667eea;
}

.message-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 애니메이션 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .chatbot-window {
    width: 300px;
    height: 450px;
  }

  .chatbot-container {
    bottom: 15px;
    right: 15px;
  }
}

/* 스크롤바 스타일 */
.chatbot-messages::-webkit-scrollbar {
  width: 4px;
}

.chatbot-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chatbot-messages::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.chatbot-messages::-webkit-scrollbar-thumb:hover {
  background: #5a67d8;
}
</style>
