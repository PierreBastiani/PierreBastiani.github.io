# pierre.kensae.com

Source of my site: [pierre.kensae.com](https://pierre.kensae.com). Two pages, in French:

- `/` for clients who find me on Malt, GitHub or LinkedIn: what I build, where I've worked, side projects, how to reach me.
- `/geek-du-quartier/` for shops in La Colle-sur-Loup and Saint-Paul-de-Vence, the page my flyers point to.

## Stack

Nuxt 4 (Vue 3) in TypeScript. No UI kit and no 3D library. `nuxt generate` renders both pages to static HTML at build time, then the client hydrates them; moving between the two pages is a client-side navigation with a view transition. GitHub Pages serves `.output/public`, deployed by `.github/workflows/deploy.yml` on every push to `main`.

```sh
npm ci
npm run dev        # http://localhost:3000
npm run build      # type-check, then nuxt generate into .output/public
npm run preview    # serve the generated site
```

All the copy lives in `app/content.ts`; components only lay it out. The contact email and phone aren't in the repository: copy `.env.example` to `.env` locally, and the deploy workflow reads them from the `CONTACT_EMAIL` and `CONTACT_PHONE` repository secrets. Generation fails without them.

## Design notes

- The hero is the real view south from the Baou de Saint-Jeannet, drawn as flat SVG layers that drift apart with scroll and pointer. The same scene closes the page.
- The skills section is a climbing topo: a cut-layer contour model of a crag, projected to SVG in TypeScript, with one route per skill.
- The work history is a multi-pitch route, newest job at the top, with a climber who abseils or climbs as you scroll.
- Two palettes from my own photos: Esterel (red porphyry over a deep sea) in light mode, a Nordic dusk in dark mode. The theme follows the device unless you pick one. The photos stay out of this repository; the only photo here is my portrait.
- Motion stops under `prefers-reduced-motion`.

## Credits

- Fonts: [Hanken Grotesk](https://github.com/marcologous/hanken-grotesk) and [Geist Mono](https://github.com/vercel/geist-font), both under the SIL Open Font License 1.1, through Fontsource.
- Tool and brand marks: [Simple Icons](https://simpleicons.org) 13.21.0 (CC0). The Rust logo is © the Rust Foundation, CC BY-SA 4.0. Company and school logos belong to their owners and only name where I worked or studied.

## Licence

The code is under the MIT licence (`LICENSE`). It doesn't cover the text or the illustrations, which are © Pierre Bastiani, all rights reserved, nor the portrait photo (© FAIRSHOT).
