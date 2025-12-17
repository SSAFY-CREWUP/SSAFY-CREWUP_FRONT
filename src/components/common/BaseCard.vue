<template>
  <div class="base-card">
    <slot></slot>
  </div>
</template>

<style scoped>
.base-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  box-shadow: var(--shadow-default);
  transition: all var(--duration-base) var(--ease-default);
}

.base-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
</style>
