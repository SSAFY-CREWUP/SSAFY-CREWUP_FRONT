<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    @input="$emit('update:modelValue', $event.target.value)"
    class="base-input"
  />
</template>

<style scoped>
.base-input {
  width: 100%;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-default);
  padding: 0.75rem 1rem;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  transition: all var(--duration-base) var(--ease-default);
  outline: none;
}

.base-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(94, 106, 210, 0.1);
}

.base-input::placeholder {
  color: var(--color-text-tertiary);
}
</style>
