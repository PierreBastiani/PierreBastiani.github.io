<script setup lang="ts">
// Before / after for each thing the shop page offers, drawn flat like the rest of the site.
// No brands, no real business names. Captions are HTML (they translate); drawings are decorative.
defineProps<{ kind: 'google' | 'site' | 'orders' | 'fix'; before: string; after: string }>()

const star = (cx: number, cy: number, r: number) => {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 ? r * 0.45 : r
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}
const stars = [0, 1, 2, 3, 4].map((i) => star(52 + i * 11, 64, 4.2))
</script>

<template>
  <figure class="ba">
    <div class="pair">
      <!-- before -->
      <div class="panel before">
        <svg viewBox="0 0 160 120" aria-hidden="true" focusable="false">
          <template v-if="kind === 'google'">
            <rect x="30" y="14" width="100" height="92" rx="8" class="paper" />
            <rect x="40" y="24" width="80" height="26" rx="3" class="hole" />
            <rect x="40" y="56" width="50" height="5" rx="2.5" class="ghost" />
            <polygon v-for="(p, i) in stars" :key="i" :points="p" class="star-off" />
            <rect x="40" y="76" width="64" height="4" rx="2" class="ghost" />
            <rect x="40" y="86" width="44" height="4" rx="2" class="ghost" />
            <circle cx="112" cy="84" r="7" class="ask" />
            <path d="M110 81.5a2.2 2.2 0 1 1 2.6 2.2v1.6 M112.6 88.2v.1" class="ask-mark" />
          </template>
          <template v-else-if="kind === 'site'">
            <rect x="52" y="8" width="56" height="104" rx="9" class="device" />
            <rect x="56" y="16" width="48" height="88" rx="2" class="screen" />
            <rect v-for="i in 9" :key="i" x="58" :y="20 + i * 6" :width="62 + (i % 3) * 8" height="2" class="tiny" />
            <rect x="60" y="80" width="26" height="18" class="hole" />
            <path d="M60 80l26 18M86 80l-26 18" class="cross" />
          </template>
          <template v-else-if="kind === 'orders'">
            <rect x="14" y="26" width="62" height="78" rx="3" class="paper" transform="rotate(-6 45 65)" />
            <g transform="rotate(-6 45 65)">
              <circle v-for="i in 6" :key="i" cx="19" :cy="30 + i * 11" r="1.8" class="hole" />
              <path v-for="i in 6" :key="'s' + i" :d="`M26 ${33 + i * 11} q6 -4 12 0 t12 0 t12 0`" class="scribble" />
            </g>
            <path d="M84 62 h18 m-6 -5 l6 5 -6 5" class="arrow" />
            <rect x="108" y="44" width="42" height="28" rx="3" class="device" />
            <rect x="111" y="47" width="36" height="22" class="screen" />
            <path v-for="i in 3" :key="'k' + i" :d="`M114 ${51 + i * 5} q4 -3 8 0 t8 0 t8 0`" class="scribble light" />
            <rect x="104" y="72" width="50" height="4" rx="2" class="device" />
          </template>
          <template v-else>
            <rect x="58" y="30" width="44" height="22" rx="4" class="device" />
            <circle cx="66" cy="41" r="2" class="led-off" />
            <path d="M62 52 C40 70 110 66 70 86 S30 96 50 108" class="cable" />
            <path d="M80 52 C120 72 30 76 96 92 S120 100 104 108" class="cable b" />
            <path d="M96 52 C70 64 140 88 80 104" class="cable c" />
            <path d="M124 20 a14 14 0 0 1 20 0 M128 25 a8 8 0 0 1 12 0" class="wave-off" />
            <path d="M122 14 l24 18" class="cross" />
          </template>
        </svg>
      </div>

      <span class="arrow-mid" aria-hidden="true">→</span>

      <!-- after -->
      <div class="panel after">
        <svg viewBox="0 0 160 120" aria-hidden="true" focusable="false">
          <template v-if="kind === 'google'">
            <rect x="30" y="14" width="100" height="92" rx="8" class="paper" />
            <rect x="40" y="24" width="26" height="26" rx="3" class="ph-a" />
            <rect x="67" y="24" width="26" height="26" rx="3" class="ph-b" />
            <rect x="94" y="24" width="26" height="26" rx="3" class="ph-c" />
            <rect x="40" y="55" width="50" height="5" rx="2.5" class="ink" />
            <polygon v-for="(p, i) in stars" :key="i" :points="p" class="star-on" />
            <circle cx="43" cy="78" r="2.4" class="ok" />
            <rect x="49" y="76" width="44" height="4" rx="2" class="line" />
            <circle cx="43" cy="88" r="2.4" class="ok" />
            <rect x="49" y="86" width="36" height="4" rx="2" class="line" />
            <path d="M100 74 h22 a4 4 0 0 1 4 4 v10 a4 4 0 0 1 -4 4 h-14 l-6 5 v-5 h-2 a4 4 0 0 1 -4 -4 v-10 a4 4 0 0 1 4 -4 z" class="bubble" />
            <rect x="102" y="80" width="18" height="3" rx="1.5" class="line" />
            <rect x="102" y="86" width="12" height="3" rx="1.5" class="line" />
          </template>
          <template v-else-if="kind === 'site'">
            <rect x="52" y="8" width="56" height="104" rx="9" class="device" />
            <rect x="56" y="16" width="48" height="88" rx="2" class="screen-light" />
            <rect x="56" y="16" width="48" height="30" class="sky" />
            <path d="M56 46 l10 -10 8 6 10 -12 20 16 z" class="hill" />
            <rect x="62" y="52" width="32" height="5" rx="2.5" class="ink" />
            <rect x="62" y="62" width="36" height="3" rx="1.5" class="line" />
            <rect x="62" y="68" width="28" height="3" rx="1.5" class="line" />
            <rect x="62" y="82" width="36" height="13" rx="6.5" class="cta" />
            <path d="M70 86.2h2.2l.8 2-1 .7a5 5 0 0 0 2.6 2.6l.7-1 2 .8v2.2a1 1 0 0 1-1.1 1A8.5 8.5 0 0 1 69 87.3a1 1 0 0 1 1-1.1z" class="cta-ink" />
            <rect x="80" y="87" width="13" height="3" rx="1.5" class="cta-ink" />
          </template>
          <template v-else-if="kind === 'orders'">
            <rect x="52" y="8" width="56" height="104" rx="9" class="device" />
            <rect x="56" y="16" width="48" height="88" rx="2" class="screen-light" />
            <rect x="60" y="21" width="28" height="5" rx="2.5" class="ink" />
            <g v-for="i in 6" :key="i">
              <circle cx="65" :cy="28 + i * 11" r="3.4" :class="i < 5 ? 'ok' : 'todo'" />
              <path v-if="i < 5" :d="`M63.4 ${28 + i * 11} l1.3 1.3 2.3 -2.6`" class="tick" />
              <rect x="72" :y="26.5 + i * 11" :width="18 + ((i * 7) % 12)" height="3" rx="1.5" class="line" />
            </g>
          </template>
          <template v-else>
            <rect x="46" y="34" width="68" height="26" rx="4" class="device" />
            <circle cx="56" cy="47" r="2.2" class="ok" />
            <circle cx="64" cy="47" r="2.2" class="ok" />
            <path d="M60 60 v34 M74 60 v34 M88 60 v34 M102 60 v34" class="cable tidy" />
            <rect x="54" y="78" width="12" height="7" rx="1.5" class="tag" />
            <rect x="68" y="84" width="12" height="7" rx="1.5" class="tag" />
            <rect x="82" y="78" width="12" height="7" rx="1.5" class="tag" />
            <rect x="96" y="84" width="12" height="7" rx="1.5" class="tag" />
            <path d="M118 22 a20 20 0 0 1 28 0 M123 27 a13 13 0 0 1 18 0 M128 32 a6 6 0 0 1 8 0" class="wave-on" />
          </template>
        </svg>
      </div>
    </div>
    <figcaption class="caps">
      <span>{{ before }}</span>
      <span>{{ after }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.ba {
  margin: 0;
  display: grid;
  gap: 0.5rem;
}
.pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.4rem;
}
.panel {
  border-radius: 0.9rem;
  background: var(--art-bg);
  aspect-ratio: 4 / 3;
}
.panel svg {
  display: block;
  width: 100%;
  height: 100%;
}
.before {
  filter: saturate(0.6);
}
.arrow-mid {
  color: var(--quiet);
  font-size: 1.1rem;
}
.caps {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.9rem;
  font: 400 0.8rem / 1.4 var(--f-mono);
  color: var(--muted);
}

/* palette: the illustration tokens from main.css */
.paper { fill: var(--art-paper); }
.hole { fill: none; stroke: var(--art-line); stroke-width: 1.5; stroke-dasharray: 3 3; }
.ghost { fill: var(--art-line); opacity: 0.6; }
.star-off { fill: none; stroke: var(--art-line); stroke-width: 1.2; }
.star-on { fill: var(--art-sun); stroke: color-mix(in srgb, var(--art-sun) 70%, var(--art-ink)); stroke-width: 0.6; }
.ask { fill: var(--art-line); }
.ask-mark { fill: none; stroke: var(--art-paper); stroke-width: 1.6; stroke-linecap: round; }
.ink { fill: var(--art-ink); }
.line { fill: var(--art-line); }
.ph-a { fill: var(--art-window); }
.ph-b { fill: var(--art-alu-l); }
.ph-c { fill: var(--art-stone-r); }
.ok { fill: var(--sea); }
.todo { fill: none; stroke: var(--art-line); stroke-width: 1.4; }
.tick { fill: none; stroke: var(--art-paper); stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.bubble { fill: var(--art-window); }
.device { fill: var(--art-ink); }
.screen { fill: var(--art-paper); }
.screen-light { fill: var(--art-paper); }
.tiny { fill: var(--art-line); }
.cross { fill: none; stroke: var(--accent); stroke-width: 2; stroke-linecap: round; }
.sky { fill: var(--art-window); }
.hill { fill: var(--art-sea-t); }
.cta { fill: var(--accent); }
.cta-ink { fill: var(--on-accent); }
.scribble { fill: none; stroke: var(--art-ink); stroke-width: 1.4; stroke-linecap: round; opacity: 0.7; }
.scribble.light { stroke: var(--art-line); opacity: 1; }
.arrow { fill: none; stroke: var(--muted); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.cable { fill: none; stroke: var(--art-sea-l); stroke-width: 2.4; stroke-linecap: round; }
.cable.b { stroke: var(--art-stone-r); }
.cable.c { stroke: var(--art-alu-r); }
.cable.tidy { stroke: var(--art-sea-l); }
.led-off { fill: var(--art-line); }
.wave-off { fill: none; stroke: var(--art-line); stroke-width: 2.4; stroke-linecap: round; }
.wave-on { fill: none; stroke: var(--sea); stroke-width: 2.6; stroke-linecap: round; }
.tag { fill: var(--art-paper); stroke: var(--art-line); stroke-width: 0.8; }
</style>
