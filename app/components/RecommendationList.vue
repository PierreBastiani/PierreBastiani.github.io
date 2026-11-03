<script setup lang="ts">
// Slot for recommendations from Malt or LinkedIn (content.ts `recommendations`).
// Renders nothing until there is at least one real, sourced quote.
import { recommendations } from '@/content'
</script>

<template>
  <section v-if="recommendations.length" id="recommandations" class="section" aria-labelledby="reco-title">
    <div class="wrap">
      <header class="section-head">
        <p class="eyebrow">Recommandations</p>
        <h2 id="reco-title">Ce qu’en disent ceux avec qui j’ai travaillé.</h2>
      </header>
      <ul class="list">
        <li v-for="r in recommendations" :key="r.author + r.quote.slice(0, 20)">
          <figure>
            <blockquote>
              <p>{{ r.quote }}</p>
            </blockquote>
            <figcaption>
              <span class="author" translate="no">{{ r.author }}</span>
              <span v-if="r.role" class="role">{{ r.role }}</span>
              <a v-if="r.href" :href="r.href" class="source">{{ r.source }}</a>
              <span v-else class="source">{{ r.source }}</span>
            </figcaption>
          </figure>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
  gap: 3rem clamp(2rem, 5vw, 4rem);
}
figure {
  margin: 0;
  display: grid;
  gap: 1.25rem;
}
blockquote {
  margin: 0;
  font-size: var(--step-1);
  line-height: 1.45;
}
figcaption {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  color: var(--muted);
  font-size: var(--step--1);
}
.author {
  color: var(--ink);
  font-weight: 600;
}
.source {
  font-family: var(--f-mono);
}
</style>
