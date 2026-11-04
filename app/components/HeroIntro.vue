<script setup lang="ts">
// What sits in the hero's dark band, under the scene: status, who, the pitch, the actions,
// a few facts and (on the main page) the tools. The band itself belongs to HeroStrata.
import { introFacts, links, localOffer, profile } from '@/content'
import { useContact, useContactPhone } from '@/composables/useContact'
import { stack } from '@/assets/icons/stack'
import MaltIcon from '@/assets/icons/MaltIcon.vue'
import GithubIcon from '@/assets/icons/GithubIcon.vue'
import LinkedinIcon from '@/assets/icons/LinkedinIcon.vue'

const props = defineProps<{ variant: 'main' | 'geek' }>()
const facts = introFacts[props.variant]
const contact = useContact()
// only the shop page asks for the phone, so the main page never carries it
const call = props.variant === 'geek' ? useContactPhone() : null
</script>

<template>
  <div class="intro-grid" :class="variant">
    <div class="pitch">
      <p class="status"><span class="dot" aria-hidden="true"></span>{{ profile.status }}</p>

      <template v-if="variant === 'main'">
        <p class="role">
          {{ profile.role }},
          <template v-for="(part, i) in profile.place.split(', ')" :key="part">{{ i ? ', ' : '' }}<span class="nw">{{ part }}</span></template>
        </p>
        <p class="lead">{{ profile.lead }}</p>
        <div class="btns">
          <a class="btn btn-primary" :href="links.malt"><MaltIcon />Me contacter sur Malt</a>
          <a class="btn compact" :href="links.github"><GithubIcon /><span class="label" translate="no">GitHub</span></a>
          <a class="btn compact" :href="links.linkedin"><LinkedinIcon /><span class="label" translate="no">LinkedIn</span></a>
        </div>
      </template>
      <template v-else>
        <p class="lead">{{ localOffer.intro }}</p>
        <div class="btns">
          <a v-if="call" class="btn btn-primary" :href="call.phoneHref.value">
            <svg class="icon line" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" />
            </svg><span>Appeler le <span class="nw">{{ call?.phone.value }}</span></span>
          </a>
          <a class="btn" :href="`mailto:${contact.email}`">Écrire un mail</a>
        </div>
      </template>
    </div>

    <div class="aside">
      <ul class="facts">
        <li v-for="f in facts" :key="f.text">
          <!-- hyphenated place names stay whole in the narrow cartouche -->
          <template v-for="(word, i) in f.text.split(' ')" :key="i">{{ i ? ' ' : '' }}<span class="nw">{{ word }}</span></template><template v-if="f.en"> · <span lang="en">{{ f.en }}</span></template>
        </li>
      </ul>
      <ul v-if="variant === 'main'" class="stack" aria-label="Outils principaux">
        <li v-for="t in stack" :key="t.name">
          <svg viewBox="0 0 24 24" role="img" :aria-label="t.name" focusable="false">
            <title>{{ t.name }}</title>
            <path :d="t.path" />
          </svg>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.intro-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 2rem clamp(2rem, 6vw, 6rem);
  align-items: end;
}
.pitch {
  display: grid;
  gap: 0.9rem;
  justify-items: start;
}
/* Availability: a small printed tag, mono caps in an ink frame, a square porphyry mark. */
.status {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.7rem 0.3rem 0.6rem;
  border: 1px solid var(--on-ground);
  font: 500 0.72rem / 1.3 var(--f-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.dot {
  flex: none;
  width: 0.5rem;
  height: 0.5rem;
  background: var(--accent);
}
.role {
  font-weight: 500;
  color: color-mix(in srgb, var(--on-ground) 72%, transparent);
}
.nw {
  white-space: nowrap;
}
.btn :deep(.icon) {
  flex: none;
  width: 1.05rem;
  height: 1.05rem;
}
.btn .line {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linejoin: miter;
}

/* The facts and the tools: a cartouche on the band. Ink frame with an inner rule, facts in
   Geist Mono caps between hairlines, the tool marks printed in the paper ink on the last rule. */
.aside {
  width: min(100%, 22rem);
  padding: 0.35rem 1rem;
  border: 1.5px solid var(--on-ground);
  box-shadow:
    inset 0 0 0 3px var(--ground),
    inset 0 0 0 4px color-mix(in srgb, var(--on-ground) 55%, transparent);
}
.facts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  font: 400 0.75rem / 1.5 var(--f-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--on-ground) 82%, transparent);
}
.facts li {
  padding-block: 0.55rem;
  border-top: 1px solid color-mix(in srgb, var(--on-ground) 22%, transparent);
}
.facts li:first-child {
  border-top: 0;
}
.stack {
  list-style: none;
  margin: 0;
  padding: 0.8rem 0 0.65rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  border-top: 1px solid color-mix(in srgb, var(--on-ground) 55%, transparent);
  color: var(--on-ground);
}
.stack svg {
  display: block;
  width: 1.2rem;
  height: 1.2rem;
  fill: currentColor;
}
@media (max-width: 52rem) {
  .intro-grid {
    grid-template-columns: 1fr;
  }
  .aside {
    width: 100%;
  }
}

/* On a narrow phone the secondary buttons keep their icon only, in a square; the name stays
   as the link text for screen readers. */
@media (max-width: 25rem) {
  .compact {
    justify-content: center;
    width: 2.75rem;
    padding-inline: 0;
  }
  .compact .label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
