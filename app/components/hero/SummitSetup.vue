<script setup lang="ts">
import { useId } from 'vue'
import { codeLines } from '@/lib/scene'

// The summit rock of the Baou with the desk on it: a flat limestone block as the table,
// the portable monitor and the laptop showing code, the keyboard, a power bank and its cable,
// a chalk bag, and a figure in a beanie and headphones at the desk, back to us.
// Drawn in scene units around x 900, then shifted so the desk sits in the middle of a phone.
// The low sun is ahead and to the right, so tops and right-facing faces are the lit ones.
const monitor = codeLines(7, 12, 72)
const laptop = codeLines(19, 9, 36)
const tones = ['var(--code-a)', 'var(--code-b)', 'var(--code-c)']
// The desk is drawn in the hero and again on the contact section: one gradient id per instance.
const glowId = `screen-glow-${useId()}`
</script>

<template>
  <g transform="translate(-40 30)">
    <defs>
      <radialGradient :id="glowId" cx="960" cy="688" r="150" gradientUnits="userSpaceOnUse">
        <stop offset="0" style="stop-color: var(--screen-glow); stop-opacity: 0.32" />
        <stop offset="1" style="stop-color: var(--screen-glow); stop-opacity: 0" />
      </radialGradient>
    </defs>

    <!-- the crest: pale broken limestone running in from the right, a cliff on the left -->
    <path
      d="M700 1000 L716 920 L736 850 L752 800 L760 776 L850 768 L858 716 L1088 706 L1110 688 L1138 666 L1176 660 L1198 682 L1250 700 L1300 724 L1340 714 L1420 738 L1480 750 L1530 742 L1620 768 L1720 782 L1780 774 L1920 800 L2120 812 L2320 832 L2620 846 L2980 860 L2980 1000 Z"
      fill="var(--rock)"
    />
    <!-- faces turned away from the sun -->
    <path d="M700 1000 L716 920 L736 850 L752 800 L760 776 L790 790 L776 860 L760 940 L752 1000 Z" fill="var(--rock-shade)" />
    <path d="M858 716 L1088 706 L1094 790 L1040 812 L940 806 L862 800 Z" fill="var(--rock-shade)" />
    <path d="M1110 688 L1138 666 L1150 700 L1130 760 L1094 790 L1088 706 Z" fill="var(--rock-shade)" />
    <path d="M1300 724 L1340 714 L1420 738 L1380 760 L1330 790 L1310 760 Z" fill="var(--rock-shade)" opacity="0.6" />
    <path d="M1530 742 L1620 768 L1560 790 L1500 840 L1510 780 Z" fill="var(--rock-shade)" opacity="0.6" />
    <path d="M1780 774 L1920 800 L1840 818 L1760 880 L1770 820 Z" fill="var(--rock-shade)" opacity="0.55" />
    <path d="M2320 832 L2620 846 L2480 862 L2360 930 L2330 870 Z" fill="var(--rock-shade)" opacity="0.5" />
    <!-- edges catching the low sun -->
    <path d="M1138 666 L1176 660 L1198 682 L1250 700 L1300 724 L1290 732 L1240 712 L1190 694 L1170 674 Z" fill="var(--rock-lit)" />
    <path d="M858 716 L1088 706 L1094 714 L862 724 Z" fill="var(--rock-lit)" />
    <path d="M760 776 L850 768 L848 776 L764 782 Z" fill="var(--rock-lit)" />

    <!-- screen glow, only at dusk -->
    <rect x="780" y="520" width="360" height="340" :fill="`url(#${glowId})`" style="opacity: var(--glow-opacity)" />

    <!-- portable monitor on its folio stand -->
    <path d="M962 706 L978 712 L976 714 L958 708 Z" fill="var(--gear)" />
    <rect x="880" y="650" width="90" height="58" rx="2" fill="var(--gear)" />
    <rect x="884" y="654" width="82" height="48" fill="var(--screen)" />
    <template v-for="(l, i) in monitor" :key="'m' + i">
      <rect v-if="l.len" :x="891 + l.indent * 4" :y="656.5 + i * 3.7" :width="l.len" height="1.8" :fill="tones[l.tone]" />
    </template>
    <rect x="884" y="654" width="4" height="48" fill="var(--code-a)" opacity="0.25" />

    <!-- laptop -->
    <path d="M986 710 L982 666 L1044 662 L1050 708 Z" fill="var(--gear)" />
    <path d="M989 706 L986 670 L1041 666 L1045 704 Z" fill="var(--screen)" />
    <rect x="988" y="670" width="9" height="34" fill="var(--code-a)" opacity="0.18" />
    <template v-for="(l, i) in laptop" :key="'l' + i">
      <rect v-if="l.len" :x="1001 + l.indent * 3" :y="672 + i * 3.6" :width="l.len" height="1.7" :fill="tones[l.tone]" />
    </template>
    <path d="M978 712 L1054 708 L1062 714 L972 718 Z" fill="var(--gear-lit)" />

    <!-- keyboard, power bank and its cable -->
    <path d="M888 717 L893 710 L960 709 L966 716 Z" fill="var(--gear)" />
    <path d="M893 711 L960 710" stroke="var(--gear-lit)" stroke-width="1" />
    <path d="M1058 712 C1068 736 1092 738 1100 706" fill="none" stroke="var(--gear)" stroke-width="2" stroke-linecap="round" />
    <rect x="1094" y="696" width="16" height="9" rx="1.5" fill="var(--gear)" />

    <!-- chalk bag -->
    <path d="M772 776 L774 752 L794 752 L796 776 Z" fill="var(--figure)" />
    <path d="M772 754 C778 746 790 746 796 754" fill="none" stroke="var(--rock-lit)" stroke-width="2.5" />

    <!-- the figure at the desk: legs, back, arm, head in a beanie with headphones -->
    <g fill="var(--figure)">
      <path d="M806 768 C806 754 818 752 832 752 L882 756 C892 758 894 768 888 774 L886 818 L904 818 C908 822 906 826 900 826 L872 826 L872 776 L826 776 C812 776 806 774 806 768 Z" />
      <path d="M806 770 C800 744 801 714 810 696 C818 682 838 679 850 688 C860 700 861 740 857 770 Z" />
      <path d="M836 694 C848 708 858 726 862 730 L896 712 L901 718 L868 742 C862 746 854 742 851 736 L830 704 Z" />
      <path d="M832 690 L846 690 L848 676 L834 676 Z" />
      <ellipse cx="841" cy="662" rx="15" ry="17" />
    </g>
    <path d="M824 668 C821 650 828 636 840 633 C847 631 852 633 855 637 C860 645 861 656 858 666 Z" fill="var(--accent)" />
    <path d="M823 669 L859 666 L859 659 L823 662 Z" fill="var(--figure)" opacity="0.25" />
    <path d="M829 676 C826 654 834 642 845 642 C855 643 859 655 857 670" fill="none" stroke="var(--gear)" stroke-width="2.5" />
    <ellipse cx="837" cy="674" rx="5.5" ry="7.5" fill="var(--gear)" />
  </g>
</template>
