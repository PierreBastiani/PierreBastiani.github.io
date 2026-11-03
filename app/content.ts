// All page copy in one place. Components only lay it out.
// Professional texts mirror the public Malt profile; nothing here that isn't public already.

// Email and phone are not here: the repository is public. They come from the generate-time
// env through runtimeConfig; components read them with useContact() (composables/useContact.ts).
export const contact = {
  name: 'Pierre Bastiani',
}

// '06 12 34 56 78' → 'tel:+33612345678' (French numbers; anything else is kept as dialled)
export function telHref(display: string) {
  const digits = display.replace(/[^\d+]/g, '')
  return 'tel:' + (digits.startsWith('0') ? '+33' + digits.slice(1) : digits)
}

export const links = {
  github: 'https://github.com/PierreBastiani',
  linkedin: 'https://www.linkedin.com/in/pierre-bastiani',
  malt: 'https://www.malt.fr/profile/pierrebastiani',
  geek: '/geek-du-quartier/',
  source: 'https://github.com/PierreBastiani/PierreBastiani.github.io',
  home: '/',
}

export const profile = {
  role: 'Développeur full-stack & DevOps',
  place: 'Saint-Paul-de-Vence, Côte d’Azur',
  lead: 'Je reprends des applis existantes, quel que soit le langage\u00a0: je lis le code, je corrige, je fais évoluer et je mets en production.',
  availability: 'Disponible à temps partiel, en télétravail ou sur la Côte d’Azur.',
  status: 'Disponible à temps partiel',
}

export const missions = [
  'Reprendre une appli Rails, Node ou Python dont le développeur est parti',
  'Dockeriser, mettre en place la CI/CD, migrer vers un autre serveur ou un cloud',
  'Brancher une API tierce\u00a0: paiement, caisse, livraison',
  'Automatiser une tâche avec un LLM',
]

export type OrgLogo = 'livepepper' | 'squad' | 'epitech'

export interface Experience {
  org: string
  /** one-tone logo shown above the role; `orgNote` is the text after it */
  logo?: OrgLogo
  orgNote?: string
  role: string
  period: string
  text: string
  tags: string[]
}

export const experiences: Experience[] = [
  {
    org: 'LivePepper',
    logo: 'livepepper',
    role: 'Lead Dev',
    period: 'juin 2025 – aujourd’hui',
    text: 'Intégrations caisse et livraison (HubRise, Deliverect, Zelty), migration des widgets historiques vers une API et des primitives Vue, load balancer HAProxy auto-hébergé, pipeline de dev avec des agents Claude Code.',
    tags: ['Ruby on Rails', 'Vue', 'HAProxy', 'Claude Code'],
  },
  {
    org: 'SQUAD, pour Amadeus',
    logo: 'squad',
    orgNote: 'pour Amadeus',
    role: 'Consultant DevOps',
    period: 'mars 2024 – janv. 2025',
    text: 'Migration d’un service C++ de distribution de données vers Microsoft Azure. Déploiement sur OpenShift avec ArgoCD et Helm (GitOps), pipelines Jenkins, suivi Grafana, astreinte hebdomadaire.',
    tags: ['C++', 'Azure', 'OpenShift', 'ArgoCD', 'Helm'],
  },
  {
    org: 'LivePepper',
    logo: 'livepepper',
    role: 'Développeur DevOps',
    period: 'sept. 2023 – févr. 2024',
    text: 'CDN avec AWS CloudFront, Lambda et S3 après une panne, images Docker Alpine avec la montée de version de Ruby, POC d’infrastructure Terraform et Kubernetes.',
    tags: ['AWS', 'Docker', 'Terraform', 'Kubernetes'],
  },
  {
    org: 'LivePepper',
    logo: 'livepepper',
    role: 'Développeur back-end puis full-stack',
    period: 'sept. 2020 – août 2023',
    text: 'Plateforme de commande en ligne pour restaurants. Passerelles de paiement (Stripe, Braintree, Ingenico, Paygreen), moteur de conditions de commande, filtres de la marketplace, connexion Google et Facebook, SMS Twilio, suivi GA4.',
    tags: ['Ruby on Rails', 'Vue', 'Stripe', 'Twilio'],
  },
]

export const education = {
  school: 'Epitech',
  logo: 'epitech' as OrgLogo,

  degree: 'Diplôme d’Expert(e) en technologies de l’information (Bac+5)',
  period: '2019 – 2024',
}

export interface Project {
  name: string
  href: string
  text: string
  tags: string[]
  /** which small illustration ProjectArt.vue draws for it */
  art: 'homelab' | 'smarket' | 'gree' | 'site'
}

export const projects: Project[] = [
  {
    name: 'homelab',
    href: 'https://github.com/PierreBastiani/homelab',
    text: 'Maison auto-hébergée\u00a0: Home Assistant et Node-RED, appareils sortis du cloud (purificateur reflashé sous ESPHome, clim pilotée en infrarouge), Jellyfin, LLM local.',
    tags: ['Home Assistant', 'ESPHome', 'Docker'],
    art: 'homelab',
  },
  {
    name: 'smarket',
    href: 'https://github.com/PierreBastiani/smarket',
    text: 'Suivi des prix en supermarché\u00a0: scrapers Node, puis un pipeline Rust qui rapproche les produits d’Open Food Facts et garde l’historique des prix.',
    tags: ['Rust', 'Node', 'Scraping'],
    art: 'smarket',
  },
  {
    name: 'gree-smartir',
    href: 'https://github.com/PierreBastiani/gree-smartir',
    text: 'Générateur de codes infrarouges pour les clims Gree dans Home Assistant, à partir du protocole décodé.',
    tags: ['Python', 'Home Assistant', 'IR'],
    art: 'gree',
  },
  {
    name: 'pierre.kensae.com',
    href: 'https://github.com/PierreBastiani/PierreBastiani.github.io',
    text: 'Ce site, en Nuxt 4, généré en pages statiques. Le paysage en calques et la carte topo en 3D sont du SVG dessiné à la main, sans librairie 3D\u00a0; deux thèmes, Esterel en clair et crépuscule nordique en sombre.',
    tags: ['Nuxt', 'Vue', 'SVG'],
    art: 'site',
  },
]

export interface Route {
  id: string
  name: string
  grade: string // climbing grade = how deep I go (placeholder values, to tune)
  stack: string
  project: { label: string; href?: string }
}

export const routes: Route[] = [
  { id: 'ship', name: 'Mise en prod & exploitation', grade: '7a', stack: 'Kubernetes, OpenShift, Docker, HAProxy, CI/CD',
    project: { label: 'homelab', href: 'https://github.com/PierreBastiani/homelab' } },
  { id: 'build', name: 'Produit web', grade: '6c', stack: 'Ruby on Rails, Vue, intégrations paiement et caisse',
    project: { label: 'Commande en ligne pour restaurants (LivePepper)' } },
  { id: 'ai', name: 'IA appliquée', grade: '6b+', stack: 'Agents Claude Code, LLM locaux, YOLO',
    project: { label: 'Classification de plumes', href: 'https://github.com/GaetanCrd/Classification' } },
  { id: 'home', name: 'Domotique & réseau', grade: '7b', stack: 'Home Assistant, Node-RED, ESPHome, réseau',
    project: { label: 'gree-smartir', href: 'https://github.com/PierreBastiani/gree-smartir' } },
  { id: 'data', name: 'Données & scraping', grade: '6a', stack: 'Scrapers, pipelines de données, Rust',
    project: { label: 'smarket', href: 'https://github.com/PierreBastiani/smarket' } },
]

export const localOffer = {
  title: 'Ce que je règle pour vous',
  intro:
    'Je passe dans votre commerce, je regarde ce qui vous fait perdre du temps sur l’ordi ou le téléphone, et je le règle.',
  // `visual` picks the before/after drawing in OfferVisual.vue; `before`/`after` caption it.
  items: [
    { title: 'Votre fiche Google à jour', text: 'Horaires, photos, réponses aux avis\u00a0: les clients du coin vous trouvent.',
      visual: 'google', before: 'Une fiche vide', after: 'Une fiche complète' },
    { title: 'Un site qui s’affiche', text: 'Simple, rapide, et vous le modifiez vous-même.',
      visual: 'site', before: 'Illisible sur un téléphone', after: 'Clair, avec un bouton pour appeler' },
    { title: 'Fini les ressaisies', text: 'Devis, commandes et plannings qui se remplissent tout seuls.',
      visual: 'orders', before: 'Le cahier, puis l’ordi', after: 'Une seule liste, à jour' },
    { title: 'Les petits pépins informatiques', text: 'Wi-Fi, imprimante, sauvegardes, mots de passe\u00a0: je règle, et je vous explique.',
      visual: 'fix', before: 'Les câbles en vrac', after: 'Rangé, étiqueté, ça marche' },
  ] as { title: string; text: string; visual: 'google' | 'site' | 'orders' | 'fix'; before: string; after: string }[],
  steps: [
    { title: '20\u00a0min ensemble', text: 'Vous me montrez ce qui vous prend du temps.' },
    { title: 'Je viens sur place', text: 'Je mets en place avec vous et votre équipe.' },
    { title: 'Vous gardez tout', text: 'Les outils sont à vous, je vous montre.' },
  ],
  offer:
    'Je lance cette activité et je veux d’abord vérifier que je peux vraiment être utile aux commerces d’ici. Pour les 3\u00a0premiers\u00a0: une demi-journée offerte. Vous me dites franchement si ça vous a servi.',
  how: 'Comment ça se passe',
  me: {
    line: 'J’habite à Saint-Paul-de-Vence et je suis développeur depuis 2020.',
  },
  trial: 'Essai offert',
  // Questions a shop owner asks, answered only with what Pierre has said.
  faq: {
    title: 'Vos questions',
    items: [
      { q: 'La première demi-journée est vraiment offerte\u00a0?', a: 'Oui, pour les 3\u00a0premiers commerces. Ensuite, vous me dites franchement si ça vous a servi.' },
      { q: 'Faut-il s’y connaître en informatique\u00a0?', a: 'Non. Vous me montrez ce qui vous prend du temps, je m’en occupe et je vous explique ce que j’ai fait.' },
      { q: 'Je garde les outils après\u00a0?', a: 'Oui. Les outils sont à vous, et je vous montre comment vous en servir.' },
      { q: 'Vous venez où\u00a0?', a: 'Dans votre commerce, à La Colle-sur-Loup ou à Saint-Paul-de-Vence.' },
    ],
  },
  call: { title: 'Le plus simple, c’est de m’appeler.', mail: 'Écrire un mail', bar: 'Appeler' },
}

// What local shop owners say, word for word, with their name and shop as they agree to show
// it. The block renders nothing while the list is empty.
export const localTestimonials: { quote: string; author: string; shop?: string }[] = []

// Section headings. `quiet` is the second, muted line of a two-tone heading.
export const sections = {
  skills: {
    label: 'Compétences',
    title: 'Cinq voies, une falaise.',
    quiet: 'Plus la cotation est haute, plus je vais loin dans le sujet.',
    sub: 'Ce que je construis et fais tourner, coté comme des voies d’escalade, avec un projet pour chaque voie.',
  },
  experience: {
    label: 'Parcours',
    title: 'Six ans sur des applis en production.',
  },
  projects: {
    label: 'Projets perso',
    title: 'Ce que je construis le week-end.',
    quiet: 'Le code est public sur GitHub.',
  },
  contact: {
    label: 'Contact',
    title: 'Une appli à reprendre, une infra à remettre d’aplomb ?',
    missions: 'Les missions qui me vont',
  },
  local: {
    how: 'Comment ça se passe',
    trial: 'Essai offert',
  },
}

// Contact: the route card ("fiche de la voie") and the summit register ("carnet de sommet").
// Every value restates something above: profile.availability, missions, links.
export const routeCard = {
  title: 'Fiche de la voie',
  place: 'Côte d’Azur',
  intro: 'Je prends des missions à temps partiel, via Malt ou en direct.',
  rows: [
    { icon: 'clock', label: 'Engagement', value: 'Temps partiel' },
    { icon: 'pin', label: 'Accès', value: 'Télétravail ou Côte d’Azur' },
    { icon: 'route', label: 'Type', value: 'Reprise d’applis, CI/CD et migrations, intégrations API, automatisation avec un LLM' },
    { icon: 'tag', label: 'Tarif', value: 'Sur Malt', href: 'malt' },
    { icon: 'mail', label: 'Contact', value: '', href: 'email' }, // value: the address, from useContact()
  ] as { icon: 'clock' | 'pin' | 'route' | 'tag' | 'mail'; label: string; value: string; href?: 'malt' | 'email' }[],
}

export const logbook = {
  title: 'Carnet de sommet',
  // printed in the card's lettering band, like the summit figure's route card
  place: 'Baou de Saint-Jeannet',
  altitude: '802\u00a0m',
  intro: 'En haut des voies, une boîte garde un carnet où chacun signe son passage. Laissez-y deux lignes sur votre projet, je réponds par mail.',
  you: 'Vous',
  sign: 'Signer le carnet de sommet',
  subject: 'Carnet de sommet\u00a0: un projet à discuter',
  body: 'Bonjour Pierre,\n\nMon projet\u00a0:\n\nDélai\u00a0:\n\n',
  note: 'Ouvre votre messagerie avec un message prérempli.',
}

// Recommendations from Malt or LinkedIn. Real quotes only, copied word for word with
// the author's name and a link to the source. The section renders nothing while empty.
export interface Recommendation {
  quote: string
  author: string
  role?: string
  source: 'Malt' | 'LinkedIn'
  href?: string
}

export const recommendations: Recommendation[] = []

// Facts under the intro, in the hero's dark band. Only what the page already says
// (or Malt shows: French and English).
export const introFacts = {
  main: [
    { text: 'En production depuis 2020' },
    { text: 'Lead Dev chez LivePepper' },
    { text: 'Français', en: 'English' },
    { text: 'Saint-Paul-de-Vence' },
  ],
  geek: [
    { text: 'La Colle-sur-Loup et Saint-Paul-de-Vence' },
    { text: 'Je viens sur place' },
    { text: 'Demi-journée offerte aux 3\u00a0premiers' },
  ],
} as Record<'main' | 'geek', { text: string; en?: string }[]>
