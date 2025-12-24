<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCrewStore } from '../../stores/crew'
import { Search, Edit, View, ChatDotRound } from '@element-plus/icons-vue'

const route = useRoute()
const crewStore = useCrewStore()
const crewId = route.params.id

const posts = ref([])
const loading = ref(false)
const searchQuery = ref('')
const categoryFilter = ref('전체')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const categories = ['전체', '공지', '가입인사', '자유']
const categoryMap = {
  'NOTICE': '공지',
  'FREE': '자유',
  'GREETING': '가입인사',
  '공지': '공지',
  '자유': '자유',
  '가입인사': '가입인사'
}

const getCategoryClass = (cat) => {
  const koreanCat = categoryMap[cat] || cat
  if (koreanCat === '공지') return 'cat-notice'
  if (koreanCat === '가입인사') return 'cat-greeting'
  return 'cat-free'
}

const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await crewStore.fetchPosts(crewId, {
      page: currentPage.value,
      size: pageSize.value,
      search: searchQuery.value,
      category: categoryFilter.value
    })
    posts.value = res.data
    total.value = res.total
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.category) {
    categoryFilter.value = route.query.category
  }
  fetchPosts()
})

watch([currentPage, categoryFilter], () => {
  fetchPosts()
})

const handleSearch = () => {
  currentPage.value = 1
  fetchPosts()
}

// Post Create Modal Logic
const showCreateModal = ref(false)
const createForm = ref({
  category: '자유',
  title: '',
  content: ''
})
const submitting = ref(false)

const openCreateModal = () => {
  createForm.value = { category: '자유', title: '', content: '' }
  showCreateModal.value = true
}

const handleCreatePost = async () => {
  if (!createForm.value.title || !createForm.value.content) return
  
  submitting.value = true
  try {
    await crewStore.createPost(crewId, createForm.value)
    showCreateModal.value = false
    fetchPosts() // Refresh list
  } catch (error) {
    console.error('Failed to create post', error)
  } finally {
    submitting.value = false
  }
}

const navigateToDetail = (postId) => {
  openDetailModal(postId)
}

// Post Detail Modal Logic
const showDetailModal = ref(false)
const selectedPost = ref(null)
const postComments = ref([])
const newComment = ref('')
const detailLoading = ref(false)
const commentSubmitting = ref(false)

const openDetailModal = async (postId) => {
  showDetailModal.value = true
  detailLoading.value = true
  try {
    const [postData, commentsData] = await Promise.all([
      crewStore.fetchPost(crewId, postId),
      crewStore.fetchComments(crewId, postId)
    ])
    selectedPost.value = postData
    postComments.value = commentsData
    
    // Update list item views/comments to match detail
    const listItem = posts.value.find(p => p.id === postId)
    if (listItem) {
        listItem.views = postData.views
        listItem.comments = commentsData.length // Use actual comments length
    }
  } catch (error) {
    console.error('Failed to load post details', error)
  } finally {
    detailLoading.value = false
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim()) return
  
  commentSubmitting.value = true
  try {
    await crewStore.addComment(crewId, selectedPost.value.id, {
      content: newComment.value
    })
    // Refresh comments list as API returns Void
    postComments.value = await crewStore.fetchComments(crewId, selectedPost.value.id)
    
    newComment.value = ''
    
    // Update list item comment count with actual length logic
    const listItem = posts.value.find(p => p.id === selectedPost.value.id)
    if (listItem) {
      listItem.comments = postComments.value.length
    }
  } catch (error) {
    console.error('Failed to add comment', error)
  } finally {
    commentSubmitting.value = false
  }
}
</script>

<template>
  <div class="board-view">
    <div class="board-header">
      <h2>게시판</h2>
      <button class="btn-write" @click="openCreateModal">
        <el-icon><Edit /></el-icon>
        글쓰기
      </button>
    </div>

    <div class="board-controls">
      <div class="categories">
        <span 
          v-for="cat in categories" 
          :key="cat"
          class="category-tag"
          :class="{ active: categoryFilter === cat }"
          @click="categoryFilter = cat"
        >
          {{ cat }}
        </span>
      </div>
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="제목으로 검색"
          prefix-icon="Search"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <div class="post-list" v-loading="loading">
      <div v-if="posts.length === 0" class="empty-state">
        게시글이 없습니다.
      </div>
      <div v-else v-for="post in posts" :key="post.id" class="post-item" @click="navigateToDetail(post.id)">
        <div class="post-header-row">
          <span class="post-category" :class="getCategoryClass(post.category)">{{ categoryMap[post.category] || post.category }}</span>
          <h3 class="post-title">{{ post.title }}</h3>
        </div>
        
        <div class="post-content-preview">
          {{ post.content }}
        </div>

        <div class="post-footer">
          <div class="author-info">
            <span class="author-name">작성자 : {{ post.author }}</span>
            <el-tag size="small" effect="plain" v-if="post.authorRole" class="role-tag">{{ post.authorRole }}</el-tag>
          </div>
          <div class="meta-info">
            <span class="date">{{ post.date }}</span>
            <span class="divider">|</span>
            <span class="stat-item">
              <el-icon><View /></el-icon> {{ post.views }}
            </span>
            <span class="stat-item">
              <el-icon><ChatDotRound /></el-icon> {{ post.comments }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        background
      />
    </div>


    <!-- Create Post Modal -->
    <el-dialog
      v-model="showCreateModal"
      title="글쓰기"
      width="500px"
      destroy-on-close
    >
      <div class="create-form">
        <div class="form-item">
          <label>카테고리</label>
          <el-select v-model="createForm.category" placeholder="카테고리 선택">
            <el-option
              v-for="cat in categories.filter(c => c !== '전체')"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>
        </div>
        <div class="form-item">
          <label>제목</label>
          <el-input v-model="createForm.title" placeholder="제목을 입력하세요" />
        </div>
        <div class="form-item">
          <label>내용</label>
          <el-input
            v-model="createForm.content"
            type="textarea"
            :rows="6"
            placeholder="내용을 입력하세요"
            resize="none"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateModal = false">취소</el-button>
          <el-button type="primary" :loading="submitting" @click="handleCreatePost">
            등록
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Post Detail Modal -->
    <el-dialog
      v-model="showDetailModal"
      :title="selectedPost?.title || '게시글 상세'"
      width="600px"
      destroy-on-close
      class="detail-modal"
    >
      <div v-if="detailLoading" class="loading-state">
        Loading...
      </div>
      <div v-else-if="selectedPost" class="post-detail-content">
        <div class="detail-header">
          <div class="detail-meta">
            <span class="category-badge" :class="getCategoryClass(selectedPost.category)">{{ categoryMap[selectedPost.category] || selectedPost.category }}</span>
            <span class="detail-date">{{ selectedPost.date }}</span>
          </div>
          <div class="detail-author">
            <span class="author-name">작성자 : {{ selectedPost.author }}</span>
            <span class="author-role" v-if="selectedPost.authorRole">{{ selectedPost.authorRole }}</span>
          </div>
        </div>
        
        <div class="detail-body">
          {{ selectedPost.content }}
        </div>
        
        <div class="detail-stats">
          <span><el-icon><View /></el-icon> {{ selectedPost.views }}</span>
          <span><el-icon><ChatDotRound /></el-icon> {{ postComments.length }}</span>
        </div>

        <div class="comments-section">
          <h4>댓글 {{ postComments.length }}</h4>
          <ul class="comment-list" v-loading="commentSubmitting">
            <li v-for="comment in postComments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <span class="comment-author">{{ comment.author }}</span>
                <span class="comment-date">{{ comment.date }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
            </li>
          </ul>
          
          <div class="comment-input">
            <el-input
              v-model="newComment"
              :disabled="commentSubmitting"
              placeholder="댓글을 입력하세요"
              @keyup.enter="handleAddComment"
            >
              <template #append>
                <el-button :loading="commentSubmitting" @click="handleAddComment">등록</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.board-view {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.board-header h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  color: #1F2937;
  letter-spacing: -0.02em;
}

.btn-write {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-write:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.btn-write:active {
  transform: scale(0.98);
}

.board-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.categories {
  display: flex;
  gap: 10px;
}

.category-tag {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.95rem;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  border: 1px solid #E5E7EB;
  font-weight: 500;
}

.category-tag:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
  transform: translateY(-1px);
}

.category-tag.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
}

.search-box {
  width: 280px;
}

/* Post List */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  opacity: 0;
  animation: fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.post-item:nth-child(1) { animation-delay: 0.1s; }
.post-item:nth-child(2) { animation-delay: 0.15s; }
.post-item:nth-child(3) { animation-delay: 0.2s; }
.post-item:nth-child(4) { animation-delay: 0.25s; }
.post-item:nth-child(5) { animation-delay: 0.3s; }

.post-item:hover {
  transform: translateY(-4px);
  background: white;
  box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.1), 0 4px 8px -4px rgba(0, 0, 0, 0.05);
  border-color: #E0E7FF;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.post-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.post-category {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  letter-spacing: -0.01em;
}

.cat-notice { background: #EEF2FF; color: #6366f1; }
.cat-greeting { background: #F3E8FF; color: #a855f7; }
.cat-free { background: #F3F4F6; color: #6B7280; }

.post-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: #1F2937;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.post-item:hover .post-title {
  color: #6366f1;
}

.post-content-preview {
  font-size: 0.95rem;
  color: #6B7280;
  margin-bottom: 16px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* Standard property */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #9CA3AF;
  border-top: 1px solid #F3F4F6;
  padding-top: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-weight: 600;
  color: #4B5563;
}

.role-tag {
  height: 22px;
  padding: 0 8px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #9CA3AF;
  background: white;
  border-radius: 16px;
  border: 1px dashed #E5E7EB;
}

@media (max-width: 768px) {
  .board-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
  
  .categories {
    overflow-x: auto;
    padding-bottom: 8px;
  }
  
  .category-tag {
    white-space: nowrap;
  }
}

/* Create Form */
.create-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-weight: 700;
  font-size: 0.95rem;
  color: #374151;
}

/* Premium Input Styles (Global for this component) */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-select__wrapper) {
  background-color: #F3F4F6;
  box-shadow: none !important;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 10px 14px;
  transition: all 0.2s;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover),
:deep(.el-select__wrapper:hover) {
  background-color: #E5E7EB;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus),
:deep(.el-select__wrapper.is-focused) {
  background-color: white;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
}

:deep(.el-input__inner) {
  font-weight: 500;
  color: #1F2937;
}

/* Dialog Footer Buttons */
:deep(.el-dialog__footer) {
  padding-top: 20px;
  border-top: 1px solid #F3F4F6;
}

:deep(.el-button) {
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  height: auto;
  border: none;
}

:deep(.el-button--default) {
  background: #F3F4F6;
  color: #6B7280;
}

:deep(.el-button--default:hover) {
  background: #E5E7EB;
  color: #374151;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

:deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #F3F4F6;
}

:deep(.el-dialog__title) {
  font-weight: 800;
  font-size: 1.2rem;
  color: #1F2937;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

/* Detail Modal Styles */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #F3F4F6;
}

.category-badge {
  background: #EEF2FF;
  color: #6366f1;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-right: 12px;
}

.detail-date {
  font-size: 0.9rem;
  color: #9CA3AF;
}

.detail-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.detail-body {
  min-height: 200px;
  white-space: pre-wrap;
  line-height: 1.7;
  margin-bottom: 30px;
  color: #1F2937;
  font-size: 1.05rem;
}

.detail-stats {
  display: flex;
  gap: 20px;
  color: #9CA3AF;
  font-size: 0.95rem;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #F3F4F6;
}

.detail-stats span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.comments-section h4 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #374151;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  max-height: 300px;
  overflow-y: auto;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #F9FAFB;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 6px;
}

.comment-author {
  font-weight: 700;
  color: #4B5563;
}

.comment-date {
  color: #9CA3AF;
  font-size: 0.8rem;
}

.comment-content {
  font-size: 0.95rem;
  color: #6B7280;
  line-height: 1.5;
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: #9CA3AF;
}
</style>
