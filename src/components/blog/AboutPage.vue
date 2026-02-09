<script setup lang="ts">
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';

defineProps<{
  siteName: string;
}>();
</script>

<template>
  <div>
    <SiteHeader :site-name="siteName" active-path="/about" />
    <main class="about-main">
      <section class="about-card">
        <p class="label">About</p>
        <h1>We write to help teams build with less noise.</h1>
        <p>
          Northline Journal is a practical publication on product design, engineering workflow, and
          sustainable growth.
        </p>
        <p>
          Every article is written as a real-world note: short, concrete, and focused on decisions
          that ship better outcomes.
        </p>
        <div class="facts">
          <p>Founded: 2021</p>
          <p>Publishing rhythm: Weekly</p>
          <p>Headquarters: Remote first</p>
        </div>
      </section>
    </main>
    <SiteFooter :site-name="siteName" />
  </div>
</template>

<style scoped>
.about-main {
  width: min(980px, calc(100% - 2rem));
  margin: 1.8rem auto 0;
}

.about-card {
  border: 1px solid var(--line);
  border-radius: 28px;
  padding: clamp(1.2rem, 2.5vw, 2.2rem);
  background: linear-gradient(140deg, color-mix(in srgb, var(--sand) 70%, white 30%), var(--surface));
}

.label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  color: var(--brand-deep);
}

h1 {
  margin: 0.5rem 0 0.8rem;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: clamp(2rem, 4vw, 3.1rem);
  line-height: 1;
}

p {
  color: var(--ink-muted);
  max-width: 65ch;
}

.facts {
  margin-top: 1.2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.facts p {
  margin: 0;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.35rem 0.68rem;
  font-size: 0.9rem;
  color: var(--ink);
}

@media (max-width: 700px) {
  .about-main {
    margin-top: 1.2rem;
  }

  .about-card {
    border-radius: 22px;
  }
}
</style>
