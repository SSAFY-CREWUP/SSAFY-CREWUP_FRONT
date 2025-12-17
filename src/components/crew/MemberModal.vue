<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import crewApi from '../../api/crew'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  crewId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const members = ref([])
const loading = ref(false)

const fetchMembers = async () => {
  loading.value = true
  try {
    const response = await crewApi.getMembers(props.crewId)
    members.value = response.data
  } catch (error) {
    console.error('Failed to fetch members:', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchMembers()
  }
})

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="크루 멤버"
    width="500px"
    @close="close"
    class="member-modal"
  >
    <div v-if="loading" class="loading-state">
      Loading...
    </div>
    <div v-else class="member-grid">
      <div v-for="member in members" :key="member.id" class="member-item">
        <img :src="member.image" :alt="member.name" class="member-image" />
        <span class="member-name">{{ member.name }}</span>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 20px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.member-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}

.member-name {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
  word-break: keep-all;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #888;
}

/* Scrollbar styling */
.member-grid::-webkit-scrollbar {
  width: 6px;
}

.member-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.member-grid::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.member-grid::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
