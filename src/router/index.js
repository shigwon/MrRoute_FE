// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../Views/member/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../Views/member/RegisterView.vue"),
    },
    {
      path: "/mypage",
      name: "mypage",
      component: () => import("../Views/member/MypageView.vue"),
      meta: { requiresAuth: true },
    },
    // 관광지 관련 라우트
    {
      path: "/attractions",
      name: "attractions",
      component: () => import("../Views/Attraction/AttractionListView.vue"),
    },
    {
      path: "/attractions/:id",
      name: "attraction-detail",
      component: () => import("../Views/Attraction/AttractionDetailView.vue"),
    },
    // 게시판 관련 라우트
    {
      path: "/board",
      name: "board-list",
      component: () => import("../Views/Board/BoardListView.vue"),
    },
    {
      path: "/board/:bno",
      name: "board-detail",
      component: () => import("../Views/Board/BoardDetailView.vue"),
    },
    {
      path: "/board/write",
      name: "board-write",
      component: () => import("../Views/Board/BoardWriteView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/board/edit/:bno",
      name: "board-edit",
      component: () => import("../Views/Board/BoardWriteView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../Views/options/NotFoundView.vue"),
    },
    {
      path: "/plans",
      name: "plans",
      component: () => import("../Views/plan/PlanListView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/plans/create",
      name: "plan-create",
      component: () => import("@/views/plan/PlanCreateView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/plans/:id",
      name: "plan-detail",
      component: () => import("@/views/plan/PlanDetailView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/plans/:id/edit",
      name: "plan-edit",
      component: () => import("@/views/plan/PlanEditView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/plans/share/:id",
      name: "plan-share",
      component: () => import("@/views/plan/PlanShareView.vue"),
    },
    {
      path: "/admin/members",
      name: "admin-members",
      component: () => import("@/views/admin/MembersManageView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/dashboard",
      name: "admin-dashboard",
      component: () => import("@/views/admin/DashboardView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    // 새로 추가되는 관리자 라우트들
    {
      path: "/admin/boards",
      name: "admin-boards",
      component: () => import("@/views/admin/BoardsManageView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    {
      path: "/admin/logs",
      name: "admin-logs",
      component: () => import("@/views/admin/SystemLogsView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    // 기존 routes 배열에 다음 라우트들을 추가하세요:

    {
      path: "/planboard",
      name: "planboard-list",
      component: () => import("../Views/planbaord/PlanBoardListView.vue"),
    },
    {
      path: "/planboard/search",
      name: "planboard-search",
      component: () => import("../Views/planbaord/PlanBoardSearchView.vue"),
    },
    {
      path: "/planboard/:pboardNo",
      name: "planboard-detail",
      component: () => import("../Views/planbaord/PlanBoardDetailView.vue"),
    },
    {
      path: "/planboard/write",
      name: "planboard-write",
      component: () => import("../Views/planbaord/PlanBoardWriteView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/planboard/edit/:pboardNo",
      name: "planboard-edit",
      component: () => import("../Views/planbaord/PlanBoardWriteView.vue"),
      meta: { requiresAuth: true },
    },// 공지사항 관련 라우트 추가
    {
      path: "/notices",
      name: "notice-list",
      component: () => import("@/views/notice/NoticeListView.vue"),
    },
    {
      path: "/notices/:nno",
      name: "notice-detail",
      component: () => import("@/views/notice/NoticeDetailView.vue"),
    },
    {
      path: "/notices/write",
      name: "notice-write",
      component: () => import("@/views/notice/NoticeWriteView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/notices/edit/:nno",
      name: "notice-edit",
      component: () => import("@/views/notice/NoticeWriteView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
  // 스크롤 동작 수정 - 안전한 스크롤 처리
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      // nextTick을 사용해 DOM이 완전히 렌더링된 후 스크롤 처리
      setTimeout(() => {
        if (savedPosition) {
          resolve(savedPosition);
        } else if (to.hash) {
          // 해시가 있는 경우 해당 요소로 스크롤
          const element = document.querySelector(to.hash);
          if (element) {
            resolve({
              el: to.hash,
              behavior: 'smooth',
            });
          } else {
            resolve({ top: 0 });
          }
        } else {
          // 페이지 맨 위로 스크롤
          resolve({ top: 0 });
        }
      }, 100); // 100ms 지연으로 DOM 렌더링 대기
    });
  },
});

// 네비게이션 가드에서도 안전 처리 추가
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem("auth-token") !== null;

  // 인증이 필요한 페이지 처리
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: "login", query: { redirect: to.fullPath } });
    return;
  }

  // 관리자 권한이 필요한 페이지 처리
  if (to.meta.requiresAdmin && !isLoggedIn) {
    next({ name: "login", query: { redirect: to.fullPath } });
    return;
  }

  next();
});

// 네비게이션 에러 처리 추가
router.onError((error) => {
  console.error('Router Error:', error);
  // 에러가 발생해도 페이지가 계속 작동하도록 처리
  if (error.message.includes('parentNode')) {
    // parentNode 관련 에러는 무시하고 계속 진행
    return;
  }
});


// // 네비게이션 가드 강화
// router.beforeEach(async (to, from, next) => {
//   const authStore = useAuthStore();
//   const isLoggedIn = authStore.isAuthenticated;
//   const isAdmin = authStore.isAdmin;

//   // 로그인이 필요한 페이지 처리
//   if (to.meta.requiresAuth && !isLoggedIn) {
//     next({ name: "login", query: { redirect: to.fullPath } });

//     return;
//   }

//   // 관리자 권한이 필요한 페이지 처리
//   if (to.meta.requiresAdmin) {
//     if (!isLoggedIn) {
//       next({ name: "login", query: { redirect: to.fullPath } });
//       return;
//     }

//     // 사용자 정보가 로드되지 않은 경우 로드 시도
//     if (!authStore.user) {
//       try {
//         await authStore.loadUser();
//       } catch (error) {
//         console.error("사용자 정보 로드 실패:", error);
//         next({ name: "login" });
//         return;
//       }
//     }

//     if (!isAdmin) {
//       alert("관리자 권한이 필요합니다.");
//       next({ name: "home" });
//       return;
//     }
//   }

//   next();
// });
// // 네비게이션 가드 강화
// router.beforeEach(async (to, from, next) => {
//   const authStore = useAuthStore();
//   const isLoggedIn = authStore.isAuthenticated;
//   const isAdmin = authStore.isAdmin;

//   // 로그인이 필요한 페이지 처리
//   if (to.meta.requiresAuth && !isLoggedIn) {
//     next({ name: "login", query: { redirect: to.fullPath } });
//     return;
//   }

//   // 관리자 권한이 필요한 페이지 처리
//   if (to.meta.requiresAdmin) {
//     if (!isLoggedIn) {
//       next({ name: "login", query: { redirect: to.fullPath } });
//       return;
//     }

//     // 사용자 정보가 로드되지 않은 경우 로드 시도
//     if (!authStore.user) {
//       try {
//         await authStore.loadUser();
//       } catch (error) {
//         console.error("사용자 정보 로드 실패:", error);
//         next({ name: "login" });
//         return;
//       }
//     }

//     if (!isAdmin) {
//       alert("관리자 권한이 필요합니다.");
//       next({ name: "home" });
//       return;
//     }
//   }

//   next();
// });
// 네비게이션 가드 설정
// router.beforeEach((to, from, next) => {
//   const isLoggedIn = localStorage.getItem("auth-token") !== null;

//   // 인증이 필요한 페이지 처리
//   if (to.meta.requiresAuth && !isLoggedIn) {
//     next({ name: "login", query: { redirect: to.fullPath } });
//     return;
//   }

//   next();
// });

export default router;
