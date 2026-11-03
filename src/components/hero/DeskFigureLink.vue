<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { contact, profile } from '@/content'
import portrait from '@/assets/pierre-bastiani.jpg'

// A real link over the figure at the desk (the SVG layers are aria-hidden), and a small card
// beside it that is a link too. Both go to the contact section.
//
// The figure and the card form one hover zone: the card opens when the pointer enters the
// figure, stays open while the pointer is over either (a transparent bridge fills the gap
// between them), and closes 280 ms after it has left both. Keyboard: focusing the figure
// opens it, Tab moves into the card, Escape closes, focus leaving both closes. On touch, a
// tap on the figure goes straight to the contact section.
//
// While open, the parent holds the pointer parallax (v-model:open) so nothing drifts away
// from the pointer. Positioned in scene units: one scene unit is 0.1cqh (see HeroStrata).
const open = defineModel<boolean>('open', { default: false })
const zone = ref<HTMLElement | null>(null)
const figure = ref<HTMLAnchorElement | null>(null)

let timer = 0
let refocusing = false // Escape returns focus to the figure without reopening the card
function show() {
  clearTimeout(timer)
  open.value = true
}
function onFocusIn() {
  if (refocusing) {
    refocusing = false
    return
  }
  show()
}
function hideSoon() {
  clearTimeout(timer)
  timer = window.setTimeout(() => (open.value = false), 280)
}
function onEnter(e: PointerEvent) {
  if (e.pointerType === 'mouse') show()
}
function onLeave(e: PointerEvent) {
  if (e.pointerType === 'mouse') hideSoon()
}
function onFocusOut(e: FocusEvent) {
  if (!zone.value?.contains(e.relatedTarget as Node | null)) {
    clearTimeout(timer)
    open.value = false
  }
}
function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !open.value) return
  clearTimeout(timer)
  open.value = false
  if (document.activeElement !== figure.value) {
    refocusing = true
    figure.value?.focus()
  }
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="spot" style="--depth: 0.85">
    <div
      ref="zone"
      class="zone"
      :class="{ open }"
      @pointerenter="onEnter"
      @pointerleave="onLeave"
      @focusin="onFocusIn"
      @focusout="onFocusOut"
      @keydown="onKey"
    >
      <a ref="figure" class="figure" href="#contact" aria-label="Pierre Bastiani, me contacter"></a>
      <div class="bridge">
        <a class="card" href="#contact" :tabindex="open ? 0 : -1" @click="open = false">
          <img :src="portrait" alt="" width="44" height="44" loading="lazy" decoding="async" />
          <span class="who">
            <span class="name">{{ contact.name }}</span>
            <span class="role">{{ profile.role }}</span>
          </span>
          <span class="avail">{{ profile.availability }}</span>
          <span class="cta">Me contacter →</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spot {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  transform: translate3d(
    calc(var(--px) * var(--depth) * -18px),
    calc(var(--scroll) * (1 - var(--depth)) * 150px + var(--py) * var(--depth) * -6px),
    0
  );
}
/* the figure in scene units: x 760 to 868, y 652 to 860 (the view is centred on x 800) */
.zone {
  position: absolute;
  left: calc(50% - 4cqh);
  top: 65.2cqh;
  width: 10.8cqh;
  height: 20.8cqh;
}
.figure {
  position: absolute;
  inset: 0;
  border-radius: 0.6rem;
  pointer-events: auto;
}
/* The bridge holds the card and reaches back to the figure, so the pointer never crosses a
   gap. It only takes the pointer while the card is open. */
.bridge {
  position: absolute;
  right: 100%;
  top: -0.5rem;
  padding-right: 0.6rem;
  pointer-events: none;
}
.zone.open .bridge {
  pointer-events: auto;
}
.card {
  width: 16rem;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.55rem 0.7rem;
  align-items: center;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--ink);
  box-shadow: 0 6px 20px -12px rgb(0 0 0 / 0.35);
  font-size: 0.85rem;
  line-height: 1.35;
  text-decoration: none;
  opacity: 0;
  translate: 0 4px;
  visibility: hidden;
  transition:
    opacity 0.2s ease,
    translate 0.2s ease,
    visibility 0s linear 0.2s;
}
.zone.open .card {
  opacity: 1;
  translate: 0 0;
  visibility: visible;
  transition:
    opacity 0.2s ease,
    translate 0.2s ease;
}
.card:hover {
  border-color: color-mix(in srgb, var(--accent) 50%, var(--line));
  color: var(--ink);
}
.card img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}
.who {
  display: grid;
}
.name {
  font-weight: 650;
}
.role,
.avail {
  color: var(--muted);
}
.avail,
.cta {
  grid-column: 1 / -1;
}
.cta {
  font-weight: 600;
  color: var(--accent-text);
}
/* narrow screens with a keyboard: the card sits above the figure, the bridge reaches down */
@media (max-width: 40rem) {
  .bridge {
    right: auto;
    left: 50%;
    top: auto;
    bottom: 100%;
    padding: 0 0 0.6rem;
    transform: translateX(-50%);
  }
}
/* touch: a tap on the figure goes straight to the contact section, no card */
@media (hover: none) {
  .bridge {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .spot {
    transform: none;
  }
  .card,
  .zone.open .card {
    translate: none;
    transition: none;
  }
}
</style>
