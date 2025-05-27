<!-- src/views/admin/SystemLogsView.vue -->
<template>
  <div class="system-logs-view">
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3">시스템 로그</h1>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-warning" @click="clearLogs"><i class="fas fa-trash me-1"></i>로그 정리</button>
          <button class="btn btn-outline-primary" @click="exportLogs">
            <i class="fas fa-download me-1"></i>내보내기
          </button>
          <button class="btn btn-primary" @click="refreshLogs"><i class="fas fa-sync-alt me-1"></i>새로고침</button>
        </div>
      </div>

      <!-- 필터링 옵션 -->
      <div class="card shadow mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-2">
              <div class="form-group">
                <label>로그 레벨</label>
                <select v-model="logLevel" class="form-select" @change="filterLogs">
                  <option value="">전체</option>
                  <option value="ERROR">오류</option>
                  <option value="WARN">경고</option>
                  <option value="INFO">정보</option>
                  <option value="DEBUG">디버그</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label>시작 날짜</label>
                <input v-model="startDate" type="date" class="form-control" @change="filterLogs" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label>종료 날짜</label>
                <input v-model="endDate" type="date" class="form-control" @change="filterLogs" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label>검색어</label>
                <div class="input-group">
                  <input
                    v-model="searchKeyword"
                    type="text"
                    class="form-control"
                    placeholder="로그 메시지 검색..."
                    @keyup.enter="filterLogs"
                  />
                  <button class="btn btn-outline-secondary" @click="filterLogs">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 실시간 모니터링 -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card border-left-info shadow">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-info font-weight-bold">실시간 모니터링</h6>
                  <div class="row">
                    <div class="col">
                      <small class="text-muted">오류: </small>
                      <span class="badge bg-danger">{{ realTimeStats.errorCount }}</span>
                    </div>
                    <div class="col">
                      <small class="text-muted">경고: </small>
                      <span class="badge bg-warning">{{ realTimeStats.warnCount }}</span>
                    </div>
                    <div class="col">
                      <small class="text-muted">정보: </small>
                      <span class="badge bg-info">{{ realTimeStats.infoCount }}</span>
                    </div>
                    <div class="col">
                      <small class="text-muted">마지막 업데이트: </small>
                      <span class="text-muted">{{ formatTime(lastUpdate) }}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    class="btn btn-sm"
                    :class="isRealTimeMode ? 'btn-success' : 'btn-outline-success'"
                    @click="toggleRealTimeMode"
                  >
                    <i class="fas" :class="isRealTimeMode ? 'fa-pause' : 'fa-play'"></i>
                    {{ isRealTimeMode ? "실시간 중지" : "실시간 모니터링" }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 로그 목록 -->
      <div class="card shadow">
        <div class="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 class="m-0 font-weight-bold text-primary">시스템 로그 ({{ filteredLogs.length }}개)</h6>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="autoScrollSwitch" v-model="autoScroll" />
            <label class="form-check-label" for="autoScrollSwitch"> 자동 스크롤 </label>
          </div>
        </div>

        <div class="card-body p-0">
          <div
            ref="logContainer"
            class="log-container"
            :class="{ 'auto-scroll': autoScroll }"
            style="max-height: 600px; overflow-y: auto"
          >
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">로그를 불러오는 중...</p>
            </div>

            <div v-else-if="filteredLogs.length === 0" class="text-center py-5 text-muted">
              <i class="fas fa-file-alt fa-3x mb-3"></i>
              <p>조건에 맞는 로그가 없습니다.</p>
            </div>

            <div v-else class="log-entries">
              <div v-for="(log, index) in filteredLogs" :key="index" class="log-entry" :class="getLogClass(log.level)">
                <div class="log-header">
                  <span class="log-timestamp">{{ formatDateTime(log.timestamp) }}</span>
                  <span class="log-level" :class="getLevelClass(log.level)">
                    {{ log.level }}
                  </span>
                  <span class="log-source">{{ log.source }}</span>
                </div>
                <div class="log-message">
                  {{ log.message }}
                </div>
                <div v-if="log.stackTrace" class="log-stack-trace">
                  <button class="btn btn-sm btn-outline-secondary mb-2" @click="toggleStackTrace(index)">
                    <i class="fas fa-code"></i>
                    {{ expandedStackTraces.includes(index) ? "스택 트레이스 숨기기" : "스택 트레이스 보기" }}
                  </button>
                  <pre v-if="expandedStackTraces.includes(index)" class="stack-trace">{{ log.stackTrace }}</pre>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import adminAPI from "@/api/admin";

// 상태 관리
const logs = ref([]);
const loading = ref(false);
const logLevel = ref("");
const startDate = ref("");
const endDate = ref("");
const searchKeyword = ref("");
const isRealTimeMode = ref(false);
const autoScroll = ref(true);
const expandedStackTraces = ref([]);
const lastUpdate = ref(new Date());
const logContainer = ref(null);

const realTimeStats = ref({
  errorCount: 0,
  warnCount: 0,
  infoCount: 0,
});

let realTimeInterval = null;

// 계산된 속성
const filteredLogs = computed(() => {
  let filtered = [...logs.value];

  // 레벨 필터
  if (logLevel.value) {
    filtered = filtered.filter((log) => log.level === logLevel.value);
  }

  // 날짜 필터
  if (startDate.value) {
    const start = new Date(startDate.value);
    filtered = filtered.filter((log) => new Date(log.timestamp) >= start);
  }

  if (endDate.value) {
    const end = new Date(endDate.value);
    end.setHours(23, 59, 59); // 하루 끝까지
    filtered = filtered.filter((log) => new Date(log.timestamp) <= end);
  }

  // 키워드 필터
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filtered = filtered.filter(
      (log) => log.message.toLowerCase().includes(keyword) || log.source.toLowerCase().includes(keyword)
    );
  }

  return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});

// 메서드
const loadLogs = async () => {
  try {
    loading.value = true;

    // 실제 구현시에는 백엔드 API 호출
    // const response = await adminAPI.getSystemLogs({
    //   level: logLevel.value,
    //   startDate: startDate.value,
    //   endDate: endDate.value,
    //   keyword: searchKeyword.value
    // });
    // logs.value = response.data;

    // 임시 데모 데이터
    logs.value = generateDemoLogs();
    updateRealTimeStats();
    lastUpdate.value = new Date();

    if (autoScroll.value) {
      await nextTick();
      scrollToBottom();
    }
  } catch (error) {
    console.error("로그 조회 중 오류:", error);
  } finally {
    loading.value = false;
  }
};

const generateDemoLogs = () => {
  const levels = ["ERROR", "WARN", "INFO", "DEBUG"];
  const sources = ["UserController", "BoardService", "AuthFilter", "DatabaseConnection", "FileUpload"];
  const messages = [
    "User login attempt failed for user: test@example.com",
    "Database connection pool exhausted",
    "File upload completed successfully",
    "Cache refresh completed",
    "Invalid authentication token received",
    "Memory usage threshold exceeded: 85%",
    "Scheduled backup task completed",
    "API rate limit exceeded for client: 192.168.1.100",
  ];

  const demoLogs = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now.getTime() - i * 300000); // 5분 간격
    const level = levels[Math.floor(Math.random() * levels.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];

    demoLogs.push({
      timestamp: timestamp.toISOString(),
      level,
      source,
      message,
      stackTrace: level === "ERROR" ? generateStackTrace() : null,
    });
  }

  return demoLogs;
};

const generateStackTrace = () => {
  return `java.lang.RuntimeException: Database connection failed
      at com.ssafy.trip.config.DatabaseConfig.getConnection(DatabaseConfig.java:45)
      at com.ssafy.trip.model.dao.MemberDaoImpl.selectDetail(MemberDaoImpl.java:23)
      at com.ssafy.trip.model.service.BasicMemberService.login(BasicMemberService.java:67)
      at com.ssafy.trip.controller.api.MemberRestController.login(MemberRestController.java:89)`;
};

const updateRealTimeStats = () => {
  const last24Hours = logs.value.filter((log) => {
    const logTime = new Date(log.timestamp);
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    return logTime >= yesterday;
  });

  realTimeStats.value = {
    errorCount: last24Hours.filter((log) => log.level === "ERROR").length,
    warnCount: last24Hours.filter((log) => log.level === "WARN").length,
    infoCount: last24Hours.filter((log) => log.level === "INFO").length,
  };
};

const filterLogs = () => {
  loadLogs();
};

const refreshLogs = () => {
  loadLogs();
};

const toggleRealTimeMode = () => {
  isRealTimeMode.value = !isRealTimeMode.value;

  if (isRealTimeMode.value) {
    realTimeInterval = setInterval(() => {
      loadLogs();
    }, 5000); // 5초마다 업데이트
  } else {
    if (realTimeInterval) {
      clearInterval(realTimeInterval);
      realTimeInterval = null;
    }
  }
};

const toggleStackTrace = (index) => {
  const idx = expandedStackTraces.value.indexOf(index);
  if (idx > -1) {
    expandedStackTraces.value.splice(idx, 1);
  } else {
    expandedStackTraces.value.push(index);
  }
};

const clearLogs = async () => {
  if (!confirm("정말로 모든 로그를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
    return;
  }

  try {
    // await adminAPI.clearSystemLogs();
    logs.value = [];
    alert("로그가 성공적으로 삭제되었습니다.");
  } catch (error) {
    console.error("로그 삭제 중 오류:", error);
    alert("로그 삭제에 실패했습니다.");
  }
};

const exportLogs = () => {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    "시간,레벨,소스,메시지\n" +
    filteredLogs.value
      .map(
        (log) => `"${formatDateTime(log.timestamp)}",${log.level},${log.source},"${log.message.replace(/"/g, '""')}"`
      )
      .join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `system_logs_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const scrollToBottom = () => {
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight;
  }
};

const getLogClass = (level) => {
  switch (level) {
    case "ERROR":
      return "log-error";
    case "WARN":
      return "log-warn";
    case "INFO":
      return "log-info";
    case "DEBUG":
      return "log-debug";
    default:
      return "";
  }
};

const getLevelClass = (level) => {
  switch (level) {
    case "ERROR":
      return "badge bg-danger";
    case "WARN":
      return "badge bg-warning";
    case "INFO":
      return "badge bg-info";
    case "DEBUG":
      return "badge bg-secondary";
    default:
      return "badge bg-light";
  }
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatTime = (date) => {
  return date.toLocaleTimeString("ko-KR");
};

// 생명주기
onMounted(() => {
  loadLogs();

  // 기본값 설정 (오늘 날짜)
  const today = new Date().toISOString().split("T")[0];
  startDate.value = today;
  endDate.value = today;
});

onUnmounted(() => {
  if (realTimeInterval) {
    clearInterval(realTimeInterval);
  }
});
</script>

<style scoped>
.border-left-info {
  border-left: 0.25rem solid #36b9cc !important;
}

.log-container {
  background-color: #f8f9fa;
}

.log-container.auto-scroll {
  scroll-behavior: smooth;
}

.log-entries {
  padding: 0.5rem;
}

.log-entry {
  background: white;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-left: 4px solid #dee2e6;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: all 0.2s;
}

.log-entry:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

.log-entry.log-error {
  border-left-color: #dc3545;
  background-color: #fff5f5;
}

.log-entry.log-warn {
  border-left-color: #ffc107;
  background-color: #fffdf5;
}

.log-entry.log-info {
  border-left-color: #17a2b8;
  background-color: #f5fdff;
}

.log-entry.log-debug {
  border-left-color: #6c757d;
  background-color: #f8f9fa;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.log-timestamp {
  color: #6c757d;
  font-family: "Courier New", monospace;
}

.log-level {
  font-size: 0.75rem;
  font-weight: 600;
}

.log-source {
  color: #495057;
  font-weight: 500;
}

.log-message {
  font-family: "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #212529;
  white-space: pre-wrap;
  word-break: break-word;
}

.log-stack-trace {
  margin-top: 0.75rem;
}

.stack-trace {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-size: 0.75rem;
  line-height: 1.3;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
}

.form-check-input:checked {
  background-color: #28a745;
  border-color: #28a745;
}

@media (max-width: 768px) {
  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .card-body.p-0 {
    padding: 0.5rem !important;
  }

  .log-container {
    max-height: 400px !important;
  }
}
</style>
