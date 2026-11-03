<script setup lang="ts">
// A small stylised map of where I go: the Loup valley on the west, La Colle-sur-Loup by the
// river, Saint-Paul-de-Vence perched on its spur to the east, the road between them. Shapes are
// approximate on purpose; no addresses, no shop pins. Palette: the hero's hill and sea tokens.
const villa = (x: number, y: number, w: number, h: number) => ({ x, y, w, h })
const laColle = [
  villa(126, 150, 9, 7), villa(137, 147, 8, 8), villa(147, 151, 10, 6), villa(131, 160, 8, 6),
  villa(141, 158, 9, 7), villa(152, 160, 7, 6), villa(118, 158, 8, 6), villa(158, 152, 7, 6),
]
const saintPaul = [
  villa(272, 98, 8, 7), villa(281, 95, 9, 8), villa(291, 97, 8, 7), villa(300, 99, 8, 6),
  villa(276, 107, 9, 6), villa(286, 106, 8, 7), villa(296, 107, 9, 6), villa(306, 104, 6, 6),
]
</script>

<template>
  <svg class="map" viewBox="0 0 400 260" role="img" aria-labelledby="local-map-title">
    <title id="local-map-title">Carte de La Colle-sur-Loup et Saint-Paul-de-Vence, la zone où je me déplace</title>
    <rect width="400" height="260" class="land" />
    <!-- hills -->
    <path d="M0 40 C60 10 120 30 170 20 S300 0 400 30 V0 H0 Z" class="hill-far" />
    <path d="M220 140 C240 90 270 70 300 72 C330 74 352 100 360 130 C330 150 260 160 220 140 Z" class="hill-mid" />
    <path d="M0 230 C80 200 160 220 240 205 S360 190 400 210 V260 H0 Z" class="hill-far" />
    <!-- the Loup -->
    <path d="M70 0 C96 46 44 82 78 124 S118 190 88 260" class="river" />
    <text x="40" y="210" class="label river-label">Le Loup</text>
    <!-- the road between the two villages -->
    <path d="M150 156 C190 150 210 132 240 124 S272 112 286 104" class="road" />
    <path d="M150 156 C190 150 210 132 240 124 S272 112 286 104" class="road-line" />
    <!-- La Colle-sur-Loup -->
    <g v-for="(h, i) in laColle" :key="'c' + i">
      <rect :x="h.x" :y="h.y" :width="h.w" :height="h.h" class="house" />
      <rect :x="h.x - 0.5" :y="h.y - 2" :width="h.w + 1" height="2.2" class="roof" />
    </g>
    <!-- Saint-Paul-de-Vence on its spur, inside its walls -->
    <ellipse cx="290" cy="103" rx="26" ry="13" class="walls" />
    <g v-for="(h, i) in saintPaul" :key="'p' + i">
      <rect :x="h.x" :y="h.y" :width="h.w" :height="h.h" class="house" />
      <rect :x="h.x - 0.5" :y="h.y - 2" :width="h.w + 1" height="2.2" class="roof" />
    </g>
    <rect x="288" y="84" width="5" height="12" class="house" />
    <path d="M287.5 84 l3 -5 3 5 z" class="roof" />
    <!-- where I go -->
    <path d="M84 186 C64 140 108 106 170 104 C214 70 290 44 344 66 C384 84 372 140 324 150 C276 160 246 206 176 212 C126 216 96 210 84 186 Z" class="zone" />
    <text x="96" y="140" class="label">La Colle-sur-Loup</text>
    <text x="266" y="68" class="label">Saint-Paul-de-Vence</text>
    <!-- north -->
    <path d="M372 236 l6 -16 6 16 -6 -4 z" class="north" />
  </svg>
</template>

<style scoped>
.map {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 1.25rem;
}
.land { fill: var(--art-bg); }
.hill-far { fill: var(--hill-far); opacity: 0.45; }
.hill-mid { fill: var(--hill-mid); opacity: 0.55; }
.river { fill: none; stroke: var(--sea-haze); stroke-width: 7; stroke-linecap: round; }
.road { fill: none; stroke: var(--art-paper); stroke-width: 6; stroke-linecap: round; }
.road-line { fill: none; stroke: var(--art-line); stroke-width: 1; stroke-dasharray: 4 4; }
.house { fill: var(--villa); }
.roof { fill: var(--roof); }
.walls { fill: none; stroke: var(--art-stone-r); stroke-width: 2; }
.zone { fill: color-mix(in srgb, var(--accent) 8%, transparent); stroke: var(--accent); stroke-width: 1.6; stroke-dasharray: 6 5; }
.label { font: 600 11px var(--f-body); fill: var(--ink); paint-order: stroke; stroke: var(--art-bg); stroke-width: 3; }
.river-label { font-style: italic; font-weight: 500; fill: var(--muted); }
.north { fill: var(--muted); }
</style>
