<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { useConfirmDialogHost } from '../../composables/useConfirmDialog';

const { state, accept, cancel } = useConfirmDialogHost();

function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && state.visible) {
    cancel();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onEscape);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onEscape);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div v-if="state.visible" class="confirm-overlay" @click.self="cancel">
        <section class="confirm-card" role="dialog" aria-modal="true" :aria-label="state.title">
          <p class="confirm-kicker">请确认操作</p>
          <h2>{{ state.title }}</h2>
          <p class="confirm-text">{{ state.message }}</p>
          <div class="confirm-actions">
            <button type="button" class="btn-cancel" @click="cancel">{{ state.cancelText }}</button>
            <button type="button" :class="['btn-confirm', `tone-${state.tone}`]" @click="accept">
              {{ state.confirmText }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: color-mix(in srgb, #02060d 46%, transparent);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  padding: 1rem;
}

.confirm-card {
  width: min(520px, 100%);
  border-radius: 20px;
  border: 1px solid var(--line-soft);
  background:
    radial-gradient(220px 120px at 0% 0%, color-mix(in srgb, var(--accent-cyan) 18%, transparent), transparent 70%),
    linear-gradient(145deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface) 86%, transparent));
  padding: 1rem;
  box-shadow: 0 22px 54px color-mix(in srgb, #021423 32%, transparent);
  display: grid;
  gap: 0.72rem;
}

.confirm-kicker {
  margin: 0;
  color: var(--accent-orange);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}

h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 2.2vw, 1.6rem);
  color: var(--ink-strong);
}

.confirm-text {
  margin: 0;
  color: var(--ink-muted);
  line-height: 1.7;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

button {
  min-height: 2.25rem;
  border-radius: 10px;
  border: 1px solid var(--line-strong);
  padding: 0 0.78rem;
  font: inherit;
  cursor: pointer;
}

.btn-cancel {
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  color: var(--ink);
}

.btn-confirm {
  color: #01212a;
  border: 0;
  font-weight: 700;
}

.btn-confirm.tone-default {
  background: linear-gradient(125deg, var(--accent-cyan), #69f2ff);
}

.btn-confirm.tone-danger {
  background: linear-gradient(125deg, #ff7f7f, #ffb26f);
  color: #2b0909;
}

.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}
</style>
