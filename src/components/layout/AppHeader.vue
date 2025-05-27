<!-- src/components/layout/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="container">
      <div class="logo">
        <router-link to="/">Mr. <span>Route</span></router-link>
      </div>

      <nav>
        <ul>
          <li>
            <router-link :to="{ name: 'attractions' }">관광지 검색</router-link>
          </li>
          <li><router-link :to="{ name: 'board-list' }">게시판</router-link></li>
          <li>
  <router-link :to="{ name: 'notice-list' }">공지사항</router-link>
</li>
          <li v-if="isLoggedIn">
            <router-link :to="{ name: 'plans' }">내 여행 계획 보기</router-link>
          </li>
          <!-- 새로 추가: 여행 공유 게시판 메뉴 -->
          <li class="dropdown-menu-item">
            <div class="nav-dropdown">
              <button class="nav-dropdown-toggle" @click="togglePlanBoardMenu">
                여행 공유 게시판 <i class="fas fa-chevron-down"></i>
              </button>
              <div v-show="showPlanBoardMenu" class="nav-dropdown-menu">
                <router-link :to="{ name: 'planboard-list' }" @click="closePlanBoardMenu">
                  <i class="fas fa-list me-2"></i>전체 여행기
                </router-link>
                <router-link :to="{ name: 'planboard-search' }" @click="closePlanBoardMenu">
                  <i class="fas fa-search me-2"></i>여행기 검색
                </router-link>
                <router-link v-if="isLoggedIn" :to="{ name: 'planboard-write' }" @click="closePlanBoardMenu">
                  <i class="fas fa-pen me-2"></i>여행기 작성
                </router-link>
                <div class="dropdown-divider"></div>
                <router-link
                  :to="{ path: '/planboard/search', query: { travelTheme: '힐링' } }"
                  @click="closePlanBoardMenu"
                >
                  <i class="fas fa-spa me-2"></i>힐링 여행
                </router-link>
                <router-link
                  :to="{ path: '/planboard/search', query: { travelTheme: '맛집탐방' } }"
                  @click="closePlanBoardMenu"
                >
                  <i class="fas fa-utensils me-2"></i>맛집 여행
                </router-link>
                <router-link
                  :to="{ path: '/planboard/search', query: { travelTheme: '가족여행' } }"
                  @click="closePlanBoardMenu"
                >
                  <i class="fas fa-users me-2"></i>가족 여행
                </router-link>
              </div>
            </div>
          </li>
          <!-- 로그인하지 않은 경우 -->
          <template v-if="!isLoggedIn">
            <li>
              <router-link :to="{ name: 'login' }" class="nav-btn nav-login">로그인</router-link>
            </li>
            <li>
              <router-link :to="{ name: 'register' }" class="nav-btn nav-register">회원가입</router-link>
            </li>
          </template>

          <!-- 로그인한 경우 -->
          <template v-else>
            <!-- 사용자 메뉴 -->
            <li class="user-menu">
              <button class="user-menu-btn" @click="toggleUserMenu">
                {{ userName }} <i class="fas fa-chevron-down"></i>
              </button>

              <div v-show="showUserMenu" class="user-dropdown">
                <router-link :to="{ name: 'mypage' }"><i class="fas fa-user"></i> 마이페이지</router-link>
                <router-link :to="{ name: 'board-write' }"><i class="fas fa-pen"></i> 글 작성하기</router-link>
                <!-- 관리자 메뉴 항목 추가 -->
                <router-link :to="{ name: 'plan-create' }"><i class="fas fa-pen"></i> 여행계획 만들기</router-link>

                <router-link v-if="isAdmin" :to="{ name: 'admin-dashboard' }">
                  <i class="fas fa-cog"></i> 관리자 대시보드
                </router-link>
                <button @click="handleLogout"><i class="fas fa-sign-out-alt"></i> 로그아웃</button>
              </div>
            </li>
          </template>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const showUserMenu = ref(false);
const showPlanBoardMenu = ref(false);

// 로그인 상태와 사용자 정보를 스토어에서 가져옴
const isLoggedIn = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => {
  console.log("현재 사용자 역할:", authStore.user?.role);
  return authStore.isAdmin;
});
const userName = computed(() => authStore.user?.name || "사용자");

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleLogout = async () => {
  await authStore.logout();
  showUserMenu.value = false;
  router.push("/");
};

// 사용자 메뉴 외부 클릭 시 닫기
const closeUserMenu = (e) => {
  if (!e.target.closest(".user-menu")) {
    showUserMenu.value = false;
  }
  if (!e.target.closest(".nav-dropdown")) {
    showPlanBoardMenu.value = false;
  }
};

// 여행 공유 게시판판
const togglePlanBoardMenu = () => {
  showPlanBoardMenu.value = !showPlanBoardMenu.value;
  // 다른 메뉴 닫기
  showUserMenu.value = false;
};

const closePlanBoardMenu = () => {
  showPlanBoardMenu.value = false;
};

// 컴포넌트 마운트 시 이벤트 리스너 추가
onMounted(() => {
  document.addEventListener("click", closeUserMenu);
});

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  document.removeEventListener("click", closeUserMenu);
});

// 디버깅을 위한 watch 추가
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      console.log("사용자 정보 변경:", newUser);
      console.log("사용자 역할:", newUser.role);
      console.log("관리자 여부:", isAdmin.value);
    }
  },
  { deep: true }
);
</script>

<style scoped>
.app-header {
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.logo a {
  text-decoration: none;
  color: #333;
}

.logo span {
  color: #0d6efd;
}

nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

nav ul li {
  margin-left: 20px;
}

nav ul li a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

nav ul li a:hover {
  color: #0d6efd;
}

.nav-btn {
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: 600;
}

.nav-login {
  border: 1px solid #0d6efd;
  color: #0d6efd;
}

.nav-register {
  background-color: #0d6efd;
  color: white !important;
}

.user-menu {
  position: relative;
}

.user-menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 5px;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 180px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  margin-top: 10px;
  z-index: 1000;
}

.user-dropdown a,
.user-dropdown button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 15px;
  text-decoration: none;
  color: #333;
  border: none;
  background: none;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-dropdown a:hover,
.user-dropdown button:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
}

.user-dropdown i {
  width: 20px;
  margin-right: 8px;
}

.dropdown-menu-item {
  position: relative;
}

.nav-dropdown {
  position: relative;
}

.nav-dropdown-toggle {
  background: none;
  border: none;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  font-size: inherit;
}

.nav-dropdown-toggle:hover {
  color: #0d6efd;
}

.nav-dropdown-toggle i {
  font-size: 0.8rem;
  transition: transform 0.3s;
}

.nav-dropdown-toggle:hover i {
  transform: rotate(180deg);
}

.nav-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 220px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  padding: 12px 0;
  margin-top: 8px;
  z-index: 1000;
  border: 1px solid #eee;
}

.nav-dropdown-menu a {
  display: block;
  padding: 10px 16px;
  text-decoration: none;
  color: #333;
  font-size: 14px;
  transition: all 0.2s;
  border: none;
}

.nav-dropdown-menu a:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
  transform: translateX(5px);
}

.nav-dropdown-menu .dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 8px 0;
}

/* 반응형 - 모바일에서는 일반 메뉴처럼 동작 */
@media (max-width: 768px) {
  .nav-dropdown-menu {
    position: static;
    box-shadow: none;
    border: none;
    margin-top: 0;
    padding: 0;
    background: transparent;
  }

  .nav-dropdown-menu a {
    padding: 8px 20px;
    border-left: 3px solid transparent;
  }

  .nav-dropdown-menu a:hover {
    border-left-color: #0d6efd;
    background: rgba(13, 110, 253, 0.1);
    transform: none;
  }

  .dropdown-divider {
    margin: 5px 16px;
  }
}
</style>
