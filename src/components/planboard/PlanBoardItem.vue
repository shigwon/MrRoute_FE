<!-- src/components/PlanBoard/PlanBoardItem.vue -->
<template>
  <div
    class="planboard-item"
    :class="{
      'planboard-item-grid': viewMode === 'grid',
      'planboard-item-list': viewMode === 'list',
    }"
    @click="$emit('click')"
  >
    <!-- 그리드 뷰 -->
    <template v-if="viewMode === 'grid'">
      <div class="post-image-container">
        <img :src="post.thumbnailImage || getDefaultThumbnail()" :alt="post.title" class="post-image" />
        <div class="post-overlay">
          <div class="travel-duration">
            <i class="fas fa-calendar-alt me-1"></i>
            {{ post.travelDuration }}일
          </div>
        </div>
        <div v-if="post.isFeatured" class="featured-badge">
          <i class="fas fa-star"></i>
        </div>
      </div>

      <div class="post-content">
        <div class="post-header">
          <h5 class="post-title">{{ post.title }}</h5>
          <p class="travel-title">{{ post.travelTitle }}</p>
        </div>

        <div class="travel-info">
          <div v-if="post.travelDestinations" class="travel-destination">
            <i class="fas fa-map-marker-alt text-danger me-1"></i>
            {{ post.travelDestinations }}
          </div>
          <div v-if="post.travelTheme" class="travel-theme">
            <span class="theme-badge">{{ post.travelTheme }}</span>
          </div>
        </div>

        <div v-if="post.tagNames" class="post-tags">
          <span
            v-for="tag in getTagArray(post.tagNames)"
            :key="tag"
            class="tag-item"
            @click.stop="$emit('tag-click', tag)"
          >
            #{{ tag }}
          </span>
        </div>

        <div class="post-meta">
          <div class="author-info">
            <img :src="getAvatarUrl(post.writer)" :alt="post.writer" class="author-avatar" />
            <div class="author-details">
              <div class="author-name">{{ post.writer }}</div>
              <div class="post-date">{{ formatDate(post.regDate) }}</div>
            </div>
          </div>

          <div class="post-stats">
            <button
              class="stat-item like-btn"
              :class="{ liked: post.isLiked }"
              @click.stop="$emit('like', post.pboardNo)"
            >
              <i class="fas fa-heart"></i>
              <span>{{ post.likeCount || 0 }}</span>
            </button>
            <div class="stat-item">
              <i class="fas fa-comment text-info"></i>
              <span>{{ post.commentCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-eye text-muted"></i>
              <span>{{ post.viewCnt || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 리스트 뷰 -->
    <template v-else>
      <div class="list-content">
        <div class="list-image-container">
          <img :src="post.thumbnailImage || getDefaultThumbnail()" :alt="post.title" class="list-image" />
          <div v-if="post.isFeatured" class="featured-badge">
            <i class="fas fa-star"></i>
          </div>
        </div>

        <div class="list-main">
          <div class="list-header">
            <h5 class="post-title">{{ post.title }}</h5>
            <div class="travel-badges">
              <span v-if="post.travelDuration" class="duration-badge"> {{ post.travelDuration }}일 </span>
              <span v-if="post.travelTheme" class="theme-badge">
                {{ post.travelTheme }}
              </span>
            </div>
          </div>

          <div class="travel-summary">
            <div class="travel-title">{{ post.travelTitle }}</div>
            <div v-if="post.travelDestinations" class="travel-destination">
              <i class="fas fa-map-marker-alt text-danger me-1"></i>
              {{ post.travelDestinations }}
            </div>
          </div>

          <div v-if="post.tagNames" class="post-tags">
            <span
              v-for="tag in getTagArray(post.tagNames).slice(0, 3)"
              :key="tag"
              class="tag-item"
              @click.stop="$emit('tag-click', tag)"
            >
              #{{ tag }}
            </span>
            <span v-if="getTagArray(post.tagNames).length > 3" class="tag-more">
              +{{ getTagArray(post.tagNames).length - 3 }}
            </span>
          </div>

          <div class="list-meta">
            <div class="author-info">
              <img :src="getAvatarUrl(post.writer)" :alt="post.writer" class="author-avatar" />
              <div class="author-details">
                <div class="author-name">{{ post.writer }}</div>
                <div class="post-date">{{ formatDate(post.regDate) }}</div>
              </div>
            </div>

            <div class="post-stats">
              <button
                class="stat-item like-btn"
                :class="{ liked: post.isLiked }"
                @click.stop="$emit('like', post.pboardNo)"
              >
                <i class="fas fa-heart"></i>
                <span>{{ post.likeCount || 0 }}</span>
              </button>
              <div class="stat-item">
                <i class="fas fa-comment text-info"></i>
                <span>{{ post.commentCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-eye text-muted"></i>
                <span>{{ post.viewCnt || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  viewMode: {
    type: String,
    default: "grid", // 'grid' | 'list'
    validator: (value) => ["grid", "list"].includes(value),
  },
});

defineEmits(["click", "like", "tag-click"]);

// 메서드
const getDefaultThumbnail = () => {
  const thumbnails = {
    힐링: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    모험: "https://images.unsplash.com/photo-1551632811-561732d1e306",
    문화: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0",
    자연: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    도시: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
    맛집: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
  };

  return thumbnails[props.post.travelTheme] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828";
};

const getAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=40`;
};

const getTagArray = (tagNames) => {
  if (!tagNames) return [];
  return tagNames
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "오늘";
  if (diffDays === 2) return "어제";
  if (diffDays <= 7) return `${diffDays}일 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
</script>

<style scoped>
.planboard-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.planboard-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 그리드 뷰 스타일 */
.planboard-item-grid {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.post-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.planboard-item:hover .post-image {
  transform: scale(1.05);
}

.post-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: end;
}

.travel-duration {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* 공개/비공개 상태 배지 스타일 */
.visibility-status {
  display: flex;
  align-items: center;
}

.public-badge,
.private-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.public-badge {
  background: rgba(40, 167, 69, 0.9);
  color: white;
}

.private-badge {
  background: rgba(220, 53, 69, 0.9);
  color: white;
}

.public-badge-small,
.private-badge-small {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.public-badge-small {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.private-badge-small {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.featured-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #333;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  z-index: 2;
}

.post-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-header {
  margin-bottom: 1rem;
}

.post-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.travel-title {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.travel-info {
  margin-bottom: 1rem;
}

.travel-destination {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.travel-theme {
  margin-bottom: 0.5rem;
}

.theme-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.post-tags {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background: #f8f9fa;
  color: #495057;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e9ecef;
}

.tag-item:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.post-meta {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}

.post-date {
  font-size: 0.7rem;
  color: #6c757d;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #6c757d;
  background: none;
  border: none;
  cursor: default;
}

.like-btn {
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 4px;
}

.like-btn:hover {
  background: #f8f9fa;
}

.like-btn.liked {
  color: #dc3545;
}

.like-btn.liked i {
  color: #dc3545;
}

/* 리스트 뷰 스타일 */
.planboard-item-list {
  margin-bottom: 1rem;
}

.list-content {
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
}

.list-image-container {
  position: relative;
  flex-shrink: 0;
  width: 150px;
  height: 100px;
  overflow: hidden;
  border-radius: 8px;
}

.list-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.planboard-item:hover .list-image {
  transform: scale(1.05);
}

.list-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.travel-badges {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.duration-badge {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

.travel-summary {
  margin-bottom: 0.75rem;
}

.travel-summary .travel-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.travel-summary .travel-destination {
  font-size: 0.85rem;
}

.list-meta {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
}

.tag-more {
  background: #6c757d;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .list-content {
    flex-direction: column;
    gap: 1rem;
  }

  .list-image-container {
    width: 100%;
    height: 150px;
  }

  .list-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .travel-badges {
    align-self: flex-start;
  }

  .post-tags {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .post-stats {
    gap: 0.5rem;
    font-size: 0.75rem;
  }

  .list-meta {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .post-content,
  .list-content {
    padding: 1rem;
  }

  .post-meta,
  .list-meta {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .post-stats {
    align-self: stretch;
    justify-content: space-around;
  }
}
</style>
