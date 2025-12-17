<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost'].includes(value)
  }
})
</script>

<template>
  <button :class="['base-button', `base-button--${variant}`]">
    <slot></slot>
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-default);
  padding: 0.75rem 1.5rem;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-default);
  border: none;
  outline: none;
}

.base-button--primary {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.base-button--primary:hover {
  background-color: var(--color-primary-600);
}

.base-button--secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-light);
}

.base-button--secondary:hover {
  background-color: var(--color-bg-secondary);
}

.base-button--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
}

.base-button--ghost:hover {
  background-color: var(--color-bg-tertiary);
}
</style>
