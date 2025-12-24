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
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.board-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.btn-write {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-write:hover {
  background: #45a049;
}

.board-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.categories {
  display: flex;
  gap: 8px;
}

.category-tag {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  background: #f5f5f5;
}

.category-tag:hover {
  background: #e0e0e0;
}

.category-tag.active {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
}

.search-box {
  width: 250px;
}

/* Post List */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-item {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.post-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.post-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.post-category {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.cat-notice { background: #ffebee; color: #f44336; }
.cat-greeting { background: #e3f2fd; color: #2196f3; }
.cat-free { background: #f5f5f5; color: #616161; }

.post-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-content-preview {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-name {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.role-tag {
  height: 20px;
  padding: 0 6px;
  font-size: 0.7rem;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-tertiary);
  background: #f9fafb;
  border-radius: 12px;
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
    padding-bottom: 4px;
  }
  
  .category-tag {
    white-space: nowrap;
  }
}
/* Create Form */
.create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

/* Detail Modal Styles */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.category-badge {
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-right: 8px;
}

.detail-date {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
}

.detail-author {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.detail-body {
  min-height: 150px;
  white-space: pre-wrap;
  line-height: 1.6;
  margin-bottom: 20px;
  color: var(--color-text-primary);
}

.detail-stats {
  display: flex;
  gap: 12px;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.comments-section h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
  max-height: 200px;
  overflow-y: auto;
}

.comment-item {
  padding: 8px 0;
  border-bottom: 1px solid #f9f9f9;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 600;
}

.comment-date {
  color: var(--color-text-tertiary);
  font-size: 0.75rem;
}

.comment-content {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-tertiary);
}
</style>
