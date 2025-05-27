<!-- src/views/admin/DashboardView.vue -->
<template>
  <div class="admin-dashboard-view">
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3">관리자 대시보드</h1>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" @click="refreshDashboard">
            <i class="fas fa-sync-alt me-1"></i>새로고침
          </button>
          <button
            class="btn"
            :class="maintenanceMode ? 'btn-warning' : 'btn-outline-warning'"
            @click="toggleMaintenanceMode"
          >
            <i class="fas fa-tools me-1"></i>
            {{ maintenanceMode ? "유지보수 모드 중" : "유지보수 모드" }}
          </button>
        </div>
      </div>

      <!-- 통계 카드들 -->
      <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-primary shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">전체 회원</div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ formatNumber(dashboardData.totalMembers) }}명
                  </div>
                  <div class="text-xs text-success mt-1">
                    <i class="fas fa-arrow-up"></i> 최근 7일: +{{ dashboardData.recentJoinCount || 0 }}
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-users fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-success shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-success text-uppercase mb-1">게시글 수</div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ formatNumber(dashboardData.totalBoards) }}개
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-comments fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-info shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-info text-uppercase mb-1">관광지 수</div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ formatNumber(dashboardData.totalAttractions) }}개
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-map-marker-alt fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-warning shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">관리자 수</div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">{{ dashboardData.adminCount || 1 }}명</div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-user-shield fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- 최근 가입 회원 -->
        <div class="col-xl-6 col-lg-7">
          <div class="card shadow mb-4">
            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 class="m-0 font-weight-bold text-primary">최근 가입 회원</h6>
              <router-link :to="{ name: 'admin-members' }" class="btn btn-sm btn-primary"> 전체 보기 </router-link>
            </div>
            <div class="card-body">
              <div v-if="dashboardData.recentMembers && dashboardData.recentMembers.length > 0">
                <div
                  v-for="member in dashboardData.recentMembers"
                  :key="member.id"
                  class="d-flex align-items-center justify-content-between py-2 border-bottom"
                >
                  <div class="d-flex align-items-center">
                    <div class="avatar me-3">
                      <div class="avatar-initial rounded-circle bg-label-primary">
                        {{ member.name.charAt(0) }}
                      </div>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ member.name }}</h6>
                      <small class="text-muted">{{ member.id }}</small>
                    </div>
                  </div>
                  <div class="text-end">
                    <span class="badge" :class="member.role === 'admin' ? 'bg-danger' : 'bg-primary'">
                      {{ member.role === "admin" ? "관리자" : "일반회원" }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-muted">
                <i class="fas fa-users fa-3x mb-3"></i>
                <p>최근 가입한 회원이 없습니다.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 인기 도시 -->
        <div class="col-xl-6 col-lg-5">
          <div class="card shadow mb-4">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-primary">인기 도시 TOP 5</h6>
            </div>
            <div class="card-body">
              <div v-if="dashboardData.popularCities && dashboardData.popularCities.length > 0">
                <div
                  v-for="(city, index) in dashboardData.popularCities.slice(0, 5)"
                  :key="city.sido"
                  class="d-flex align-items-center justify-content-between mb-3"
                >
                  <div class="d-flex align-items-center">
                    <div class="rank-badge me-3">
                      <span class="badge bg-primary">{{ index + 1 }}</span>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ city.sido }}</h6>
                      <small class="text-muted">{{ city.attractionCount }}개 관광지</small>
                    </div>
                  </div>
                  <div class="progress-container" style="width: 100px">
                    <div class="progress" style="height: 6px">
                      <div
                        class="progress-bar bg-primary"
                        :style="{
                          width: (city.attractionCount / dashboardData.popularCities[0].attractionCount) * 100 + '%',
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-muted">
                <i class="fas fa-map-marker-alt fa-3x mb-3"></i>
                <p>데이터를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 관리 메뉴 -->
      <div class="row">
        <div class="col-12">
          <div class="card shadow mb-4">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-primary">관리 메뉴</h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-xl-3 col-md-6 mb-3">
                  <router-link
                    :to="{ name: 'admin-members' }"
                    class="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4"
                  >
                    <i class="fas fa-users fa-2x mb-2"></i>
                    <span>회원 관리</span>
                    <small class="text-muted mt-1">{{ dashboardData.totalMembers }}명</small>
                  </router-link>
                </div>

                <div class="col-xl-3 col-md-6 mb-3">
                  <router-link
                    :to="{ name: 'admin-boards' }"
                    class="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4"
                  >
                    <i class="fas fa-comments fa-2x mb-2"></i>
                    <span>게시글 관리</span>
                    <small class="text-muted mt-1">{{ dashboardData.totalBoards }}개</small>
                  </router-link>
                </div>

                <div class="col-xl-3 col-md-6 mb-3">
                  <button
                    @click="showSystemInfo"
                    class="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4"
                  >
                    <i class="fas fa-server fa-2x mb-2"></i>
                    <span>시스템 정보</span>
                    <small class="text-muted mt-1">서버 상태</small>
                  </button>
                </div>

                <div class="col-xl-3 col-md-6 mb-3">
                  <router-link
                    :to="{ name: 'admin-logs' }"
                    class="btn btn-outline-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4"
                  >
                    <i class="fas fa-clipboard-list fa-2x mb-2"></i>
                    <span>시스템 로그</span>
                    <small class="text-muted mt-1">활동 로그</small>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import apiClient from "@/api";

const dashboardData = ref({
  totalMembers: 0,
  totalBoards: 0,
  totalAttractions: 0,
  adminCount: 0,
  recentJoinCount: 0,
  recentMembers: [],
  popularCities: [],
});

const maintenanceMode = ref(false);
const loading = ref(false);

const loadDashboardData = async () => {
  try {
    loading.value = true;
    const response = await apiClient.get("/admin/dashboard");
    dashboardData.value = { ...dashboardData.value, ...response.data };
  } catch (error) {
    console.error("대시보드 데이터 조회 중 오류:", error);
    if (error.response?.status === 403) {
      alert("관리자 권한이 필요합니다.");
      this.$router.push("/");
    }
  } finally {
    loading.value = false;
  }
};

const refreshDashboard = () => {
  loadDashboardData();
};

const toggleMaintenanceMode = async () => {
  try {
    const newMode = !maintenanceMode.value;
    await apiClient.post("/admin/system/maintenance", {
      enabled: newMode,
    });

    maintenanceMode.value = newMode;
    alert(`유지보수 모드가 ${newMode ? "활성화" : "비활성화"}되었습니다.`);
  } catch (error) {
    console.error("유지보수 모드 변경 중 오류:", error);
    alert("유지보수 모드 변경에 실패했습니다.");
  }
};

const showSystemInfo = () => {
  // 시스템 정보 모달 표시 로직
  alert("시스템 정보 기능은 구현 예정입니다.");
};

const showLogs = () => {
  // 시스템 로그 모달 표시 로직
  alert("시스템 로그 기능은 구현 예정입니다.");
};

const formatNumber = (number) => {
  return new Intl.NumberFormat("ko-KR").format(number || 0);
};

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.border-left-primary {
  border-left: 0.25rem solid #4e73df !important;
}

.border-left-success {
  border-left: 0.25rem solid #1cc88a !important;
}

.border-left-info {
  border-left: 0.25rem solid #36b9cc !important;
}

.border-left-warning {
  border-left: 0.25rem solid #f6c23e !important;
}

.avatar {
  width: 40px;
  height: 40px;
}

.avatar-initial {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
}

.bg-label-primary {
  background-color: #696cff !important;
}

.rank-badge {
  width: 30px;
  text-align: center;
}

.progress-container {
  flex-shrink: 0;
}

.text-xs {
  font-size: 0.75rem;
}

.card {
  border: none;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
}

.btn:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
</style>
