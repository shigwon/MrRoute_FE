<!-- src/components/plan/create/PlanLocationSelectStep.vue -->
<template>
  <div class="plan-location-select-step">
    <!-- 검색 패널 토글 버튼 -->
    <button class="search-panel-toggle" :class="{ active: showSearchPanel }" @click="toggleSearchPanel">
      <i class="fas fa-search"></i>
      <span>검색</span>
    </button>

    <!-- 하단 네비게이션 -->
    <div class="bottom-navigation">
      <button class="step-back-btn" @click="handlePrevious"><i class="fas fa-arrow-left me-2"></i>이전 단계</button>
      <div class="selected-count">
        선택된 여행지: <span class="count">{{ selectedAttractions.length }}</span
        >개
      </div>
      <button class="step-next-btn" @click="handleNext" :disabled="selectedAttractions.length === 0">
        다음 단계 <i class="fas fa-arrow-right ms-2"></i>
      </button>
    </div>

    <!-- 검색 결과 네비게이션 패널 -->
    <div class="search-results-nav" :class="{ show: attractions.length > 0, collapsed: searchResultsCollapsed }">
      <div class="search-results-header" @click="toggleSearchResults">
        <div class="header-content">
          <h5>
            <i class="fas fa-search me-2"></i>
            검색 결과
            <span v-if="getSearchSummary()" class="search-context">
              {{ getSearchSummary() }}
            </span>
            <span class="result-count-badge">({{ totalCount.toLocaleString() }}개)</span>
          </h5>
          <div class="header-actions">
            <button
              class="clear-search-btn"
              @click.stop="clearSearchConditions"
              v-if="searchKeyword || searchContentType || searchArea"
              title="검색 조건 초기화"
            >
              <i class="fas fa-undo"></i>
              <span>초기화</span>
            </button>

            <button
              class="refresh-search-btn"
              @click.stop="searchAttractions"
              :disabled="searchLoading"
              title="검색 새로고침"
            >
              <i class="fas fa-sync" :class="{ 'fa-spin': searchLoading }"></i>
            </button>

            <button class="toggle-search-results" :class="{ collapsed: searchResultsCollapsed }">
              <i class="fas fa-chevron-up"></i>
            </button>

            <button class="close-search-results" @click.stop="clearSearchResults">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div v-if="searchLoading" class="search-status">
          <div class="search-loading">
            <div class="spinner-border spinner-border-sm text-primary me-2"></div>
            검색 중...
          </div>
        </div>

        <div
          v-if="!searchLoading && attractions.length === 0 && (searchKeyword || searchContentType || searchArea)"
          class="no-search-results"
        >
          <div class="no-results-icon">
            <i class="fas fa-search-location"></i>
          </div>
          <h6>검색 결과가 없습니다</h6>
          <p class="text-muted">
            <span v-if="getSearchSummary()">{{ getSearchSummary() }} 조건으로 검색된 관광지가 없습니다.</span>
          </p>
          <div class="search-suggestions">
            <p class="mb-2"><strong>다음을 시도해보세요:</strong></p>
            <ul class="suggestion-list">
              <li>다른 키워드로 검색해보세요</li>
              <li>카테고리를 "전체"로 변경해보세요</li>
              <li>지역을 더 넓게 선택해보세요</li>
              <li>검색어의 철자를 확인해보세요</li>
            </ul>
          </div>
          <button class="btn btn-outline-primary mt-3" @click="clearSearchConditions">
            <i class="fas fa-undo me-2"></i>검색 조건 초기화
          </button>
        </div>
      </div>

      <div class="search-results-content" :class="{ collapsed: searchResultsCollapsed }">
        <div class="search-results-list">
          <div
            v-for="(attraction, index) in attractions"
            :key="attraction.no"
            class="search-result-item"
            :class="{ selected: selectedAttractions.some((s) => s.no === attraction.no) }"
            @click="selectSearchResult(attraction)"
          >
            <img :src="attraction.firstImage1 || '/img/no-image.jpg'" :alt="attraction.title" class="result-thumb" />

            <div class="result-info">
              <h6 class="result-title">{{ attraction.title }}</h6>
              <p class="result-location">
                <i class="fas fa-map-marker-alt text-danger me-1"></i>
                {{ attraction.sido }} {{ attraction.gugun }}
              </p>
              <div class="result-details">
                <div v-if="attraction.contentTypeName" class="result-category">
                  <i :class="getCategoryIcon(attraction.contentTypeName)" class="me-1"></i>
                  {{ attraction.contentTypeName }}
                </div>
                <div v-if="attraction.viewCnt" class="result-views">
                  <i class="fas fa-eye me-1"></i>
                  {{ attraction.viewCnt.toLocaleString() }}
                </div>
              </div>
            </div>

            <div class="result-actions">
              <button
                v-if="!selectedAttractions.some((s) => s.no === attraction.no)"
                class="btn btn-sm btn-primary add-btn"
                @click.stop="addAttractionToSelection(attraction)"
                title="여행지 추가"
              >
                <i class="fas fa-plus"></i>
              </button>
              <button v-else class="btn btn-sm btn-success added-btn" disabled title="이미 추가됨">
                <i class="fas fa-check"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-if="searchTotalPages > 1" class="search-pagination">
          <button
            class="page-btn"
            :disabled="searchCurrentPage === 1 || searchLoading"
            @click="changeSearchPage(searchCurrentPage - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <span class="page-info">{{ searchCurrentPage }} / {{ searchTotalPages }}</span>

          <button
            class="page-btn"
            :disabled="searchCurrentPage === searchTotalPages || searchLoading"
            @click="changeSearchPage(searchCurrentPage + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 지도 컨트롤 버튼들 -->
    <div class="map-controls">
      <button class="control-btn" @click="changeMapType" :title="mapTypeTitle">
        <i :class="mapTypeIcon"></i>
      </button>
      <button class="control-btn" @click="toggleTrafficInfo" :class="{ active: showTraffic }" title="교통정보">
        <i class="fas fa-car"></i>
      </button>
    </div>

    <!-- 검색 패널 -->
    <div class="search-panel" :class="{ 'panel-open': showSearchPanel }">
      <div class="search-panel-header">
        <h3>여행지 검색 및 선택</h3>
        <button class="close-panel" @click="showSearchPanel = false">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="search-panel-content">
        <!-- 현재 위치 버튼 -->
        <div class="search-section">
          <label class="search-label">
            <i class="fas fa-crosshairs"></i>
            내 위치
          </label>
          <button class="current-location-btn-panel" @click="getCurrentLocation" :disabled="loadingLocation">
            <i class="fas fa-crosshairs me-2" v-if="!loadingLocation"></i>
            <i class="fas fa-spinner fa-spin me-2" v-else></i>
            <span v-if="!loadingLocation">현재 위치로 이동</span>
            <span v-else>위치 확인 중...</span>
          </button>
        </div>

        <!-- 키워드 검색 섹션 -->
        <div class="search-section priority">
          <label class="search-label">
            <i class="fas fa-search"></i>
            키워드 검색
          </label>
          <div class="search-input-group">
            <input
              type="text"
              v-model="searchKeyword"
              class="search-input"
              placeholder="예: 전주, 전주 맛집, 부산 해변..."
              @keyup.enter="searchAttractions"
              @input="handleSearchInputChange"
            />
            <button class="search-btn" @click="searchAttractions" :disabled="searchLoading">
              <i v-if="!searchLoading" class="fas fa-search"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
            </button>
          </div>
          <div v-if="!searchKeyword.trim()" class="search-tip">
            <small class="text-muted">
              <i class="fas fa-lightbulb me-1 text-warning"></i>
              <strong>검색 팁:</strong>
              "서울", "부산" 등 지역과 카테고리를 선택하면 더 정확한 검색이 가능합니다
            </small>
          </div>
        </div>

        <!-- 카테고리 선택 섹션 -->
        <div class="search-section">
          <label class="search-label">
            <i class="fas fa-tags"></i>
            카테고리
            <span class="optional-label">(선택사항)</span>
          </label>
          <select v-model="searchContentType" class="search-select" @change="searchAttractions">
            <option value="">전체 카테고리</option>
            <option v-for="type in contentTypes" :key="type.content_type_id" :value="type.content_type_id">
              {{ type.content_type_name }}
            </option>
          </select>
          <div v-if="searchContentType" class="selected-category">
            <div class="badge bg-primary mb-2">
              <i :class="getCategoryIcon(getContentTypeName(searchContentType))" class="me-1"></i>
              {{ getContentTypeName(searchContentType) }} 선택됨
            </div>
            <small class="text-muted d-block">선택한 카테고리로 검색 결과가 필터링됩니다</small>
          </div>
        </div>

        <!-- 지역 선택 섹션 -->
        <div class="search-section">
          <label class="search-label">
            <i class="fas fa-map-marker-alt"></i>
            지역 선택
            <span class="optional-label">(키워드에서 자동 인식됨)</span>
          </label>
          <select v-model="searchArea" class="search-select" @change="onAreaChange">
            <option value="">전체 지역</option>
            <option v-for="area in areaList" :key="area.sido_code" :value="area.sido_code">
              {{ area.sido_name }}
            </option>
          </select>
          <div class="search-help-text">
            <small class="text-muted">
              <i class="fas fa-info-circle me-1"></i>
              키워드에서 지역이 자동으로 인식되지 않을 때 직접 선택하세요
            </small>
          </div>
        </div>

        <!-- 시군구 선택 -->
        <div class="search-section" v-if="searchArea">
          <label class="search-label">
            <i class="fas fa-building"></i>
            시군구
          </label>
          <select v-model="searchGugun" class="search-select" :disabled="!searchArea">
            <option value="">전체 시군구</option>
            <option v-for="gugun in gugunList" :key="gugun.gugun_code" :value="gugun.gugun_code">
              {{ gugun.gugun_name }}
            </option>
          </select>
        </div>

        <!-- 인기 관광지 -->
        <div class="search-section">
          <label class="search-label">
            <i class="fas fa-fire text-danger"></i>
            인기 관광지
          </label>
          <div v-if="loadingPopular" class="text-center py-3">
            <div class="spinner-border spinner-border-sm text-primary"></div>
          </div>
          <div v-else class="popular-list">
            <div
              v-for="attraction in popularAttractions.slice(0, 5)"
              :key="attraction.no"
              class="popular-item"
              @click="addAttractionToSelection(attraction)"
            >
              <img :src="attraction.firstImage1 || '/img/no-image.jpg'" :alt="attraction.title" class="popular-thumb" />
              <div class="popular-info">
                <h6 class="mb-1">{{ attraction.title }}</h6>
                <p class="mb-0 text-muted small">{{ attraction.sido }}</p>
              </div>
              <button class="btn btn-sm btn-outline-primary">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 선택된 관광지 목록 -->
        <div class="search-section" v-if="selectedAttractions.length > 0">
          <label class="search-label">
            <i class="fas fa-check-circle text-success"></i>
            선택된 관광지 ({{ selectedAttractions.length }}개)
          </label>
          <div class="selected-list">
            <div v-for="(attraction, index) in selectedAttractions" :key="attraction.no" class="selected-item">
              <img
                :src="attraction.firstImage1 || '/img/no-image.jpg'"
                :alt="attraction.title"
                class="selected-thumb"
              />
              <div class="selected-info">
                <h6 class="mb-1">{{ attraction.title }}</h6>
                <p class="mb-0 text-muted small">{{ attraction.sido }}</p>
              </div>
              <div class="selected-actions">
                <select v-model="attraction.assignedDay" class="form-select form-select-sm" style="width: 80px">
                  <option value="">일차</option>
                  <option v-for="day in dayCount" :key="day" :value="day">{{ day }}일</option>
                </select>
                <button class="btn btn-sm btn-outline-danger ms-2" @click="removeAttraction(index)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 지도 영역 -->
    <div id="kakao-map" class="map-container"></div>

    <!-- 선택된 관광지 상세 정보 카드 -->
    <div v-if="attractionDetail" class="detail-card">
      <div class="detail-card-header">
        <h4>{{ attractionDetail.title }}</h4>
        <div class="detail-actions-header">
          <button
            class="btn btn-sm btn-primary add-btn"
            @click="addAttractionToSelection(attractionDetail)"
            title="여행지 추가"
          >
            <i class="fas fa-plus"></i>
          </button>
          <button class="close-detail" @click="closeDetail">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="detail-card-content">
        <img
          :src="attractionDetail.firstImage1 || '/img/no-image.jpg'"
          :alt="attractionDetail.title"
          class="detail-image"
        />

        <div class="detail-info">
          <p class="detail-location">
            <i class="fas fa-map-marker-alt"></i>
            {{ attractionDetail.sido }} {{ attractionDetail.gugun }}
          </p>

          <p v-if="attractionDetail.addr" class="detail-address">
            <i class="fas fa-home"></i>
            {{ attractionDetail.addr }}
          </p>

          <p v-if="attractionDetail.tel" class="detail-phone">
            <i class="fas fa-phone"></i>
            {{ attractionDetail.tel }}
          </p>
        </div>

        <div class="detail-actions">
          <button class="detail-btn primary" @click="addAttractionToSelection(attractionDetail)">여행지 추가</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import attractionAPI from "@/api/attraction";

// Props & Events
const props = defineProps({
  planData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["next", "previous", "update-attractions"]);

// 반응형 데이터
const showSearchPanel = ref(true);
const selectedAttractions = ref([]);
const popularAttractions = ref([]);
const areaList = ref([]);
const gugunList = ref([]);
const contentTypes = ref([]);
const searchArea = ref("");
const searchGugun = ref("");
const searchContentType = ref("");
const searchKeyword = ref("");
const attractionDetail = ref(null);
const loadingLocation = ref(false);
const loadingPopular = ref(false);
const attractions = ref([]);
const totalCount = ref(0);
const searchCurrentPage = ref(1);
const searchItemsPerPage = ref(10);
const searchLoading = ref(false);
const searchResultsCollapsed = ref(false);

// 지도 관련 상태
const mapType = ref("ROADMAP");
const showTraffic = ref(false);
let map = null;
let markers = [];
let infowindow = null;
let currentPosition = null;
let searchTimeout = null;

// 계산된 속성
const dayCount = computed(() => {
  if (!props.planData.startDate || !props.planData.endDate) return 0;
  const start = new Date(props.planData.startDate);
  const end = new Date(props.planData.endDate);
  const diffTime = Math.abs(end - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

const searchTotalPages = computed(() =>
  totalCount.value ? Math.ceil(totalCount.value / searchItemsPerPage.value) : 1
);

const mapTypeTitle = computed(() => {
  switch (mapType.value) {
    case "ROADMAP":
      return "위성지도";
    case "SKYVIEW":
      return "하이브리드";
    case "HYBRID":
      return "일반지도";
    default:
      return "지도 변경";
  }
});

const mapTypeIcon = computed(() => {
  switch (mapType.value) {
    case "ROADMAP":
      return "fas fa-satellite";
    case "SKYVIEW":
      return "fas fa-layer-group";
    case "HYBRID":
      return "fas fa-map";
    default:
      return "fas fa-map";
  }
});

// 메서드
const handlePrevious = () => {
  emit("previous");
};

const handleNext = () => {
  if (selectedAttractions.value.length === 0) {
    alert("여행지를 하나 이상 선택해주세요.");
    return;
  }

  emit("update-attractions", selectedAttractions.value);
  emit("next", { attractions: selectedAttractions.value });
};

const toggleSearchPanel = () => {
  showSearchPanel.value = !showSearchPanel.value;
};

const initializeMap = () => {
  if (!window.kakao || !window.kakao.maps) return;

  const mapContainer = document.getElementById("kakao-map");
  const mapOption = {
    center: new window.kakao.maps.LatLng(36.2683, 127.6358),
    level: 10,
  };

  map = new window.kakao.maps.Map(mapContainer, mapOption);

  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
    const latlng = mouseEvent.latLng;
    searchNearbyAttractions(latlng.getLat(), latlng.getLng());
  });

  loadRandomAttractions();
};

const loadCategories = async () => {
  try {
    const [areasResponse, contentTypesResponse] = await Promise.all([
      attractionAPI.getSido(),
      attractionAPI.getContentTypes(),
    ]);

    areaList.value = areasResponse.data;
    contentTypes.value = contentTypesResponse.data;
  } catch (error) {
    console.error("카테고리 로드 오류:", error);
  }
};

const loadPopularAttractions = async () => {
  try {
    loadingPopular.value = true;
    const response = await attractionAPI.getTopAttractions();
    popularAttractions.value = response.data.slice(0, 10);
  } catch (error) {
    console.error("인기 관광지 로드 오류:", error);
  } finally {
    loadingPopular.value = false;
  }
};

const loadRandomAttractions = async () => {
  try {
    const response = await attractionAPI.getRandomAttractions(20);
    const attractions = response.data;
    updateMapMarkers(attractions);
  } catch (error) {
    console.error("관광지 로드 오류:", error);
  }
};

const searchAttractions = async () => {
  try {
    searchLoading.value = true;

    if (!searchKeyword.value && !searchArea.value && !searchContentType.value) {
      await loadRandomAttractions();
      searchLoading.value = false;
      return;
    }

    let parsedKeyword = searchKeyword.value.trim();
    let parsedAreaCode = searchArea.value;

    if (searchKeyword.value && !searchArea.value) {
      const parseResult = parseSearchKeyword(searchKeyword.value.trim());
      if (parseResult.areaCode) {
        parsedAreaCode = parseResult.areaCode;
        parsedKeyword = parseResult.keyword;
      }
    }

    const offset = (searchCurrentPage.value - 1) * searchItemsPerPage.value;

    const params = {
      keyword: parsedKeyword,
      areaCode: parsedAreaCode,
      siGunGuCode: searchGugun.value,
      contentTypeName: searchContentType.value,
      offset: offset,
      limit: searchItemsPerPage.value,
    };

    const response = await attractionAPI.searchAttractions(params);

    if (response.data.attractions) {
      attractions.value = response.data.attractions;
      totalCount.value = response.data.totalCount || 0;
    } else if (Array.isArray(response.data)) {
      attractions.value = response.data;
      totalCount.value = response.data.length;
    } else {
      attractions.value = [];
      totalCount.value = 0;
    }

    if (attractions.value.length > 0) {
      updateMapMarkers();
      searchResultsCollapsed.value = false;
    }
  } catch (error) {
    console.error("관광지 검색 중 오류 발생:", error);
    attractions.value = [];
    totalCount.value = 0;
  } finally {
    searchLoading.value = false;
  }
};

const parseSearchKeyword = (keyword) => {
  const areaMapping = {
    서울: "1",
    서울특별시: "1",
    서울시: "1",
    인천: "2",
    인천광역시: "2",
    인천시: "2",
    대전: "3",
    대전광역시: "3",
    대전시: "3",
    대구: "4",
    대구광역시: "4",
    대구시: "4",
    광주: "5",
    광주광역시: "5",
    광주시: "5",
    부산: "6",
    부산광역시: "6",
    부산시: "6",
    울산: "7",
    울산광역시: "7",
    울산시: "7",
    세종: "8",
    세종특별자치시: "8",
    세종시: "8",
    경기: "31",
    경기도: "31",
    강원: "32",
    강원도: "32",
    강원특별자치도: "32",
    충북: "33",
    충청북도: "33",
    충남: "34",
    충청남도: "34",
    경북: "35",
    경상북도: "35",
    경남: "36",
    경상남도: "36",
    전북: "37",
    전라북도: "37",
    전북특별자치도: "37",
    전남: "38",
    전라남도: "38",
    제주: "39",
    제주특별자치도: "39",
    제주도: "39",
    전주: "37",
    여수: "38",
    순천: "38",
    목포: "38",
    포항: "35",
    경주: "35",
    안동: "35",
    창원: "36",
    김해: "36",
    진주: "36",
    춘천: "32",
    원주: "32",
    강릉: "32",
    속초: "32",
    청주: "33",
    충주: "33",
    천안: "34",
    공주: "34",
    부여: "34",
    수원: "31",
    성남: "31",
    고양: "31",
    용인: "31",
  };

  const sortedAreas = Object.keys(areaMapping).sort((a, b) => b.length - a.length);

  for (const area of sortedAreas) {
    if (keyword.includes(area)) {
      const remainingKeyword = keyword.replace(area, "").trim();
      return {
        area: area,
        areaCode: areaMapping[area],
        keyword: remainingKeyword,
      };
    }
  }

  return {
    area: null,
    areaCode: null,
    keyword: keyword,
  };
};

const getContentTypeName = (contentTypeId) => {
  const contentType = contentTypes.value.find((type) => type.content_type_id === contentTypeId);
  return contentType ? contentType.content_type_name : "선택된 카테고리";
};

const getCategoryIcon = (contentTypeName) => {
  const iconMap = {
    관광지: "fas fa-mountain",
    문화시설: "fas fa-building",
    축제공연행사: "fas fa-calendar-alt",
    여행코스: "fas fa-route",
    레포츠: "fas fa-running",
    숙박: "fas fa-bed",
    쇼핑: "fas fa-shopping-bag",
    음식점: "fas fa-utensils",
  };
  return iconMap[contentTypeName] || "fas fa-map-marker-alt";
};

const getSearchSummary = () => {
  let summary = [];

  if (searchKeyword.value.trim()) {
    summary.push(`"${searchKeyword.value.trim()}"`);
  }

  if (searchContentType.value) {
    const categoryName = getContentTypeName(searchContentType.value);
    summary.push(`"${categoryName}"`);
  }

  if (searchArea.value) {
    const areaName = areaList.value.find((area) => area.sido_code === searchArea.value)?.sido_name;
    if (areaName) {
      summary.push(`"${areaName}"`);
    }
  }

  return summary.join(" × ");
};

const clearSearchConditions = () => {
  searchKeyword.value = "";
  searchContentType.value = "";
  searchArea.value = "";
  searchGugun.value = "";
  searchCurrentPage.value = 1;
  loadRandomAttractions();
};

const handleSearchInputChange = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    if (searchKeyword.value.trim() || searchContentType.value || searchArea.value) {
      searchAttractions();
    }
  }, 800);
};

const onAreaChange = async () => {
  if (!searchArea.value) {
    gugunList.value = [];
    searchGugun.value = "";
    return;
  }

  try {
    const response = await attractionAPI.getGugun(searchArea.value);
    gugunList.value = response.data;
    searchGugun.value = "";
  } catch (error) {
    console.error("시군구 목록 로드 중 오류 발생:", error);
  }
};

const changeSearchPage = async (page) => {
  if (page < 1 || page > searchTotalPages.value || searchLoading.value) return;

  searchCurrentPage.value = page;
  await searchAttractions();
};

const selectSearchResult = (attraction) => {
  selectAttraction(attraction);
};

const clearSearchResults = () => {
  attractions.value = [];
  searchCurrentPage.value = 1;
  totalCount.value = 0;
  searchResultsCollapsed.value = false;
  loadRandomAttractions();
};

const toggleSearchResults = () => {
  searchResultsCollapsed.value = !searchResultsCollapsed.value;
};

const searchNearbyAttractions = async (lat, lng) => {
  try {
    const response = await attractionAPI.getRandomAttractions(100);
    const nearbyAttractions = response.data.filter((attraction) => {
      if (!attraction.latitude || !attraction.longitude) return false;

      const distance = calculateDistance(lat, lng, attraction.latitude, attraction.longitude);
      return distance < 10;
    });

    if (nearbyAttractions.length > 0) {
      const closest = nearbyAttractions.slice(0, 10);
      attractions.value = closest;
      totalCount.value = closest.length;
      updateMapMarkers(closest);

      if (closest.length > 0) {
        selectAttraction(closest[0]);
      }
    } else {
      attractions.value = [];
      totalCount.value = 0;
    }
  } catch (error) {
    console.error("주변 관광지 검색 오류:", error);
  }
};

const updateMapMarkers = (attractionList = attractions.value) => {
  if (!map) return;

  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  if (infowindow) {
    infowindow.close();
  }

  if (attractionList.length === 0) return;

  const bounds = new kakao.maps.LatLngBounds();

  attractionList.forEach((attraction) => {
    if (!attraction.latitude || !attraction.longitude) return;

    const position = new kakao.maps.LatLng(attraction.latitude, attraction.longitude);

    const marker = new kakao.maps.Marker({
      position: position,
      map: map,
    });

    kakao.maps.event.addListener(marker, "click", () => {
      selectAttraction(attraction);
    });

    markers.push(marker);
    bounds.extend(position);
  });

  if (markers.length > 0) {
    map.setBounds(bounds);
  }
};

const selectAttraction = async (attraction) => {
  try {
    const response = await attractionAPI.getAttractionDetail(attraction.no);
    attractionDetail.value = response.data;

    if (map && attraction.latitude && attraction.longitude) {
      const position = new window.kakao.maps.LatLng(attraction.latitude, attraction.longitude);
      map.setCenter(position);
      map.setLevel(3);
    }
  } catch (error) {
    console.error("관광지 상세 정보 로드 중 오류 발생:", error);
    attractionDetail.value = attraction;
  }
};

const closeDetail = () => {
  attractionDetail.value = null;
};

const addAttractionToSelection = (attraction) => {
  if (selectedAttractions.value.find((item) => item.no === attraction.no)) {
    alert("이미 선택된 관광지입니다.");
    return;
  }

  const enhancedAttraction = {
    ...attraction,
    id: attraction.no,
    assignedDay: "",
    visitTime: "",
    duration: 60,
    memo: "",
    order: 0,
  };

  selectedAttractions.value.push(enhancedAttraction);
  updateMapMarkers();
  closeDetail();

  alert(`${attraction.title}이(가) 여행지 목록에 추가되었습니다!`);
};

const removeAttraction = (index) => {
  const removed = selectedAttractions.value.splice(index, 1)[0];
  updateMapMarkers();
  alert(`${removed.title}이(가) 여행지 목록에서 제거되었습니다.`);
};

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("위치 서비스를 지원하지 않는 브라우저입니다.");
    return;
  }

  loadingLocation.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      if (map) {
        const moveLatLon = new kakao.maps.LatLng(currentPosition.lat, currentPosition.lng);
        map.setCenter(moveLatLon);
        map.setLevel(5);

        const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
        const imageSize = new kakao.maps.Size(24, 35);
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

        new kakao.maps.Marker({
          map: map,
          position: moveLatLon,
          image: markerImage,
        });
      }

      loadingLocation.value = false;
    },
    (error) => {
      console.error("위치 정보를 가져올 수 없습니다:", error);
      alert("위치 정보를 가져올 수 없습니다.");
      loadingLocation.value = false;
    }
  );
};

const changeMapType = () => {
  if (!map) return;

  switch (mapType.value) {
    case "ROADMAP":
      map.setMapTypeId(kakao.maps.MapTypeId.SKYVIEW);
      mapType.value = "SKYVIEW";
      break;
    case "SKYVIEW":
      map.setMapTypeId(kakao.maps.MapTypeId.HYBRID);
      mapType.value = "HYBRID";
      break;
    case "HYBRID":
      map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);
      mapType.value = "ROADMAP";
      break;
  }
};

const toggleTrafficInfo = () => {
  if (!map) return;

  showTraffic.value = !showTraffic.value;

  if (showTraffic.value) {
    map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);
  } else {
    map.removeOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);
  }
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Watch
watch([searchKeyword, searchContentType, searchArea, searchGugun], () => {
  searchCurrentPage.value = 1;
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    if (searchKeyword.value.trim() || searchContentType.value || searchArea.value) {
      searchAttractions();
    }
  }, 500);
});

// 라이프사이클
onMounted(async () => {
  await loadCategories();

  setTimeout(async () => {
    initializeMap();
    await loadPopularAttractions();
  }, 100);
});

onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});
</script>

<style scoped>
.plan-location-select-step {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  padding-top: 80px;
  padding-bottom: 80px;
  box-sizing: border-box;
  overflow: hidden;
}

.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 15px 20px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1003;
  border-top: 1px solid #eee;
}

.selected-count {
  font-weight: 500;
  color: #333;
  background: #f8f9fa;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #dee2e6;
}

.selected-count .count {
  color: #0d6efd;
  font-weight: 600;
}

.step-back-btn,
.step-next-btn {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-back-btn {
  color: #6c757d;
}

.step-back-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

.step-next-btn {
  background: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.step-next-btn:disabled {
  background: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.step-next-btn:hover:not(:disabled) {
  background: #0b5ed7;
  border-color: #0b5ed7;
  transform: translateY(-1px);
}

.search-panel-toggle {
  position: fixed;
  top: 90px;
  left: 20px;
  background: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1002;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.search-panel-toggle:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.search-panel-toggle.active {
  background: #0d6efd;
  color: white;
  left: 440px;
}

.search-results-nav {
  position: fixed;
  bottom: 80px;
  left: 20px;
  right: 20px;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  max-height: 50vh;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  opacity: 0;
  transition: all 0.3s ease;
  overflow: hidden;
}

.search-results-nav.show {
  transform: translateY(0);
  opacity: 1;
}

.search-results-nav.collapsed {
  max-height: 60px;
}

.search-results-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  flex-shrink: 0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-results-header:hover {
  background: #e9ecef;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  flex: 1;
}

.search-context {
  font-size: 0.85rem;
  color: #495057;
  font-weight: 500;
  margin-left: 8px;
  padding: 2px 8px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.result-count-badge {
  font-size: 0.8rem;
  color: #0d6efd;
  font-weight: 600;
  margin-left: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.clear-search-btn,
.refresh-search-btn,
.toggle-search-results,
.close-search-results {
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 4px;
  width: 28px;
  height: 28px;
  justify-content: center;
}

.clear-search-btn:hover {
  background: #f8f9fa;
  border-color: #dc3545;
  color: #dc3545;
}

.refresh-search-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #0d6efd;
  color: #0d6efd;
}

.toggle-search-results:hover {
  background: #dee2e6;
  color: #333;
}

.toggle-search-results.collapsed {
  transform: rotate(180deg);
}

.close-search-results:hover {
  background: #dee2e6;
  color: #333;
}

.search-status {
  margin-top: 8px;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.search-loading {
  color: #0d6efd;
  display: flex;
  align-items: center;
}

.no-search-results {
  text-align: center;
  padding: 40px 20px;
  background: white;
  margin: 10px;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}

.no-results-icon {
  font-size: 3rem;
  color: #dee2e6;
  margin-bottom: 16px;
}

.search-suggestions {
  margin: 20px 0;
  text-align: left;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.suggestion-list {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.suggestion-list li {
  padding: 4px 0;
  font-size: 0.9rem;
  color: #6c757d;
  position: relative;
  padding-left: 16px;
}

.suggestion-list li:before {
  content: "•";
  color: #0d6efd;
  position: absolute;
  left: 0;
  font-weight: bold;
}

.search-results-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-results-content.collapsed {
  height: 0;
  opacity: 0;
}

.search-results-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  max-height: calc(50vh - 120px);
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.search-result-item:hover {
  background: #f8f9fa;
  border-color: #0d6efd;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-result-item.selected {
  background: #e9f0ff;
  border-color: #0d6efd;
}

.result-thumb {
  width: 60px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 12px;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-location {
  margin: 0 0 4px 0;
  font-size: 0.8rem;
  color: #6c757d;
  display: flex;
  align-items: center;
}

.result-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.result-category {
  font-size: 0.75rem;
  color: #0d6efd;
  background: #e9f0ff;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.result-views {
  font-size: 0.75rem;
  color: #6c757d;
  display: flex;
  align-items: center;
}

.result-actions {
  margin-left: 12px;
  flex-shrink: 0;
}

.add-btn {
  min-width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.add-btn:hover {
  transform: scale(1.05);
}

.added-btn {
  min-width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  opacity: 0.8;
}

.search-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.page-btn {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
}

.page-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #0d6efd;
  color: #0d6efd;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f9fa;
}

.page-info {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}

.map-controls {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1002;
}

.control-btn {
  width: 48px;
  height: 48px;
  background: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
}

.control-btn:hover {
  background: #f8f9fa;
  color: #0d6efd;
}

.control-btn.active {
  background: #0d6efd;
  color: white;
}

.search-panel {
  position: fixed;
  top: 65px;
  left: -420px;
  width: 420px;
  height: calc(100vh - 65px);
  background: white;
  z-index: 1001;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-panel.panel-open {
  left: 0;
}

.search-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  flex-shrink: 0;
}

.search-panel-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.close-panel {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
}

.close-panel:hover {
  background: #e9ecef;
  color: #333;
}

.search-panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}

.search-section {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.search-section.priority {
  background: #f8f9fa;
  border-bottom: 2px solid #0d6efd;
}

.search-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.search-label i {
  color: #0d6efd;
  width: 16px;
}

.optional-label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: normal;
  opacity: 0.8;
}

.search-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  background: white;
}

.search-select:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.1);
}

.search-input-group {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.1);
}

.search-btn {
  background: #0d6efd;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 14px;
}

.search-btn:hover {
  background: #0056b3;
}

.search-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.search-tip {
  margin-top: 8px;
  padding: 10px 12px;
  background: linear-gradient(90deg, #fff3e0 0%, #f8f9fa 100%);
  border-radius: 6px;
  border-left: 4px solid #ff9800;
}

.search-tip strong {
  color: #f57c00;
}

.selected-category {
  margin-top: 10px;
  padding: 8px;
  background: #e9f0ff;
  border-radius: 6px;
  border: 1px solid #cce0ff;
}

.selected-category .badge {
  font-size: 0.8rem;
  padding: 5px 10px;
}

.search-help-text {
  margin-top: 6px;
}

.current-location-btn-panel {
  width: 100%;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-location-btn-panel:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.popular-list,
.selected-list {
  max-height: 200px;
  overflow-y: auto;
}

.popular-item,
.selected-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.popular-item:hover {
  background: #f8f9fa;
  border-color: #0d6efd;
}

.popular-thumb,
.selected-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 8px;
}

.popular-info,
.selected-info {
  flex: 1;
}

.popular-info h6,
.selected-info h6 {
  margin: 0 0 2px 0;
  font-size: 0.85rem;
}

.selected-actions {
  display: flex;
  align-items: center;
}

.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#kakao-map {
  width: 100%;
  height: 100%;
}

.detail-card {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 350px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.detail-card-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-actions-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.close-detail {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
}

.close-detail:hover {
  background: #e9ecef;
  color: #333;
}

.detail-card-content {
  padding: 16px;
}

.detail-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 12px;
}

.detail-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-info i {
  width: 16px;
  color: #6c757d;
}

.detail-actions {
  margin-top: 16px;
}

.detail-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s;
}

.detail-btn.primary {
  background: #0d6efd;
  color: white;
}

.detail-btn.primary:hover {
  background: #0056b3;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .search-panel {
    width: 380px;
    left: -380px;
  }

  .search-panel-toggle.active {
    left: 380px;
  }

  .detail-card {
    width: 320px;
  }
}

@media (max-width: 768px) {
  .plan-location-select-step {
    padding-top: 60px;
    padding-bottom: 70px;
  }

  .bottom-navigation {
    flex-direction: column;
    gap: 10px;
    padding: 10px 15px;
  }

  .selected-count {
    order: -1;
    margin-bottom: 5px;
  }

  .step-back-btn,
  .step-next-btn {
    padding: 8px 16px;
    font-size: 14px;
    flex: 1;
    max-width: 150px;
  }

  .search-panel {
    width: 100vw;
    left: -100vw;
    top: 60px;
    height: calc(100vh - 130px);
  }

  .search-panel.panel-open {
    left: 0;
  }

  .search-panel-toggle.active {
    left: calc(100vw - 100px);
  }

  .detail-card {
    width: calc(100vw - 20px);
    bottom: 90px;
    right: 10px;
    left: 10px;
  }

  .search-results-nav {
    left: 10px;
    right: 10px;
    bottom: 90px;
    max-height: 40vh;
  }

  .search-results-list {
    max-height: calc(40vh - 100px);
  }

  .map-controls {
    right: 10px;
    top: 40%;
  }

  .search-panel-toggle {
    left: 10px;
    top: 70px;
  }
}

@media (max-width: 480px) {
  .bottom-navigation {
    padding: 8px 10px;
  }

  .step-back-btn,
  .step-next-btn {
    padding: 8px 12px;
    font-size: 13px;
  }

  .selected-count {
    font-size: 13px;
    padding: 6px 12px;
  }

  .search-results-nav {
    left: 5px;
    right: 5px;
    bottom: 70px;
    max-height: 35vh;
  }

  .search-results-header {
    padding: 12px 15px;
  }

  .search-results-header h5 {
    font-size: 0.9rem;
  }

  .search-results-list {
    padding: 8px;
    max-height: calc(35vh - 90px);
  }

  .search-result-item {
    padding: 10px;
  }

  .result-thumb {
    width: 50px;
    height: 38px;
    margin-right: 10px;
  }

  .result-title {
    font-size: 0.85rem;
  }

  .result-location {
    font-size: 0.75rem;
  }

  .search-panel-content {
    height: 600px;
    padding: 0;
  }

  .search-section {
    padding: 8px 12px;
  }

  .detail-card-content {
    padding: 12px;
  }

  .search-panel-toggle {
    padding: 10px 12px;
    font-size: 14px;
  }

  .control-btn {
    width: 44px;
    height: 44px;
    font-size: 14px;
  }

  .detail-card {
    max-height: 60vh;
    bottom: 70px;
  }
}

/* 커스텀 스크롤바 */
.search-panel-content::-webkit-scrollbar,
.detail-card::-webkit-scrollbar,
.popular-list::-webkit-scrollbar,
.selected-list::-webkit-scrollbar,
.search-results-list::-webkit-scrollbar {
  width: 6px;
}

.search-panel-content::-webkit-scrollbar-track,
.detail-card::-webkit-scrollbar-track,
.popular-list::-webkit-scrollbar-track,
.selected-list::-webkit-scrollbar-track,
.search-results-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.search-panel-content::-webkit-scrollbar-thumb,
.detail-card::-webkit-scrollbar-thumb,
.popular-list::-webkit-scrollbar-thumb,
.selected-list::-webkit-scrollbar-thumb,
.search-results-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.search-panel-content::-webkit-scrollbar-thumb:hover,
.detail-card::-webkit-scrollbar-thumb:hover,
.popular-list::-webkit-scrollbar-thumb:hover,
.selected-list::-webkit-scrollbar-thumb:hover,
.search-results-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 애니메이션 효과 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-card {
  animation: fadeIn 0.4s ease-out;
}

.search-panel.panel-open {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.search-result-item {
  transition: all 0.3s ease;
}

.search-result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.search-result-item.selected {
  background: linear-gradient(135deg, #e9f0ff 0%, #f0f7ff 100%);
  border-color: #0d6efd;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.2);
}

/* 스피너 애니메이션 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.fa-spin {
  animation: spin 1s linear infinite;
}

/* 포커스 스타일 개선 */
.search-input:focus,
.search-select:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* 버튼 상태 */
.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* 선택된 관광지 강조 */
.selected-item {
  background: #e9f0ff;
  border-color: #0d6efd;
}

/* 로딩 상태 */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* 상태별 색상 */
.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-info {
  color: #17a2b8 !important;
}

.text-primary {
  color: #0d6efd !important;
}

/* 검색 버튼 로딩 상태 */
.search-btn .fa-spinner {
  animation: spin 1s linear infinite;
}
</style>
