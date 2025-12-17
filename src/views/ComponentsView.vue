<script setup>
import Navbar from '../components/common/Navbar.vue'
import BaseButton from '../components/common/BaseButton.vue'
import BaseCard from '../components/common/BaseCard.vue'
import BaseInput from '../components/common/BaseInput.vue'
</script>

<template>
  <div class="components-view">
    <Navbar />

    <main>
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <h1 class="hero-title">Linear is a purpose-built tool for planning and building products</h1>
          <p class="hero-subtitle">Streamline issues, projects, and product roadmaps</p>
          <div class="hero-actions">
            <BaseButton variant="primary">Get started</BaseButton>
            <BaseButton variant="secondary">Talk to sales</BaseButton>
          </div>
        </div>
      </section>

      <!-- Social Proof -->
      <section class="section social-proof">
        <div class="container">
          <h2 class="section-heading">Powering the world's best product teams</h2>
          <p class="section-description">From next-gen startups to established enterprises</p>
          <div class="logo-grid">
            <!-- Placeholders for logos -->
            <div v-for="i in 6" :key="i" class="logo-placeholder"></div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="section features">
        <div class="container">
          <div class="features-grid">
            <BaseCard>
              <h3 class="card-title">Made for modern product teams</h3>
              <p class="card-description">Relentless focus, fast execution, and a commitment to the quality of craft</p>
            </BaseCard>
            <BaseCard>
              <h3 class="card-title">Self-driving product operations</h3>
              <p class="card-description">Streamline workflows with AI assistance for routine tasks</p>
            </BaseCard>
            <BaseCard>
              <h3 class="card-title">Align your team</h3>
              <p class="card-description">Plan, manage, and track all product initiatives</p>
            </BaseCard>
          </div>
        </div>
      </section>

      <!-- Product Features List -->
      <section class="section product-features">
        <div class="container">
          <div class="list-grid">
            <div class="list-item">Manage projects end-to-end</div>
            <div class="list-item">Build momentum with Cycles</div>
            <div class="list-item">Manage incoming work with Triage</div>
            <div class="list-item">Linear Insights</div>
            <div class="list-item">Tailored workflows</div>
          </div>
        </div>
      </section>

      <!-- Integrations -->
      <section class="section integrations">
        <div class="container">
          <div class="integrations-content">
            <h2 class="section-heading">Collaborate across tools and teams</h2>
            <p class="section-description">Expand capabilities with integrations</p>
            <div class="input-demo">
              <BaseInput placeholder="Search integrations..." />
            </div>
          </div>
        </div>
      </section>

      <!-- Technical Foundation -->
      <section class="section technical">
        <div class="container">
          <div class="tech-grid">
            <div class="tech-item">Linear Sync Engine</div>
            <div class="tech-item">Enterprise-ready security</div>
            <div class="tech-item">Engineered for scale</div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.components-view {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.container {
  max-width: var(--max-width-xl);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.section {
  padding: var(--space-20) 0;
  border-bottom: 1px solid var(--color-border-light);
}

/* Hero Section */
.hero-section {
  padding: var(--space-32) 0 var(--space-20);
  text-align: center;
}

.hero-title {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-6);
  background: linear-gradient(to bottom right, var(--color-text-primary), var(--color-text-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: var(--text-xl);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-10);
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
}

/* Headings */
.section-heading {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-4);
  text-align: center;
}

.section-description {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  text-align: center;
  margin-bottom: var(--space-12);
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-8);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-2);
}

.card-description {
  color: var(--color-text-secondary);
}

/* Logo Grid */
.logo-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-8);
  opacity: 0.5;
}

.logo-placeholder {
  height: 40px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-default);
}

/* Product Features List */
.list-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-4);
}

.list-item {
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
}

/* Integrations */
.integrations-content {
  max-width: var(--max-width-md);
  margin: 0 auto;
  text-align: center;
}

.input-demo {
  margin-top: var(--space-8);
}

/* Technical */
.tech-grid {
  display: flex;
  justify-content: center;
  gap: var(--space-12);
  text-align: center;
}

.tech-item {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}
</style>
