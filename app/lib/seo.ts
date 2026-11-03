// Head data shared by both pages: site URL, image alt, and the JSON-LD builders. Values that
// must stay out of the repository (email, phone) are passed in from useContact().
export const SITE = 'https://pierre.kensae.com'

export const ogImageAlt =
  'Paysage du Baou au-dessus de la Côte d’Azur, une personne code à un bureau posé au sommet'

const address = {
  '@type': 'PostalAddress',
  addressLocality: 'Saint-Paul-de-Vence',
  addressRegion: 'Alpes-Maritimes',
  addressCountry: 'FR',
}

export function profileJsonLd(email: string, dateModified: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${SITE}/`,
    inLanguage: 'fr',
    dateModified,
    mainEntity: {
      '@type': 'Person',
      '@id': `${SITE}/#pierre`,
      name: 'Pierre Bastiani',
      jobTitle: 'Développeur full-stack & DevOps',
      url: `${SITE}/`,
      email: `mailto:${email}`,
      image: `${SITE}/og/og-main.jpg`,
      address,
      sameAs: [
        'https://github.com/PierreBastiani',
        'https://www.linkedin.com/in/pierre-bastiani',
        'https://www.malt.fr/profile/pierrebastiani',
      ],
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'Epitech' },
      knowsAbout: [
        'Ruby on Rails',
        'Vue',
        'Docker',
        'Kubernetes',
        'OpenShift',
        'CI/CD',
        'Home Assistant',
        'ESPHome',
        'Rust',
        'Claude Code',
      ],
    },
  }
}

export function serviceJsonLd(email: string, telephone: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE}/geek-du-quartier/#service`,
    name: 'Le geek du quartier',
    url: `${SITE}/geek-du-quartier/`,
    description:
      'Fiche Google, site, devis et pépins informatiques pour les commerces de La Colle-sur-Loup et Saint-Paul-de-Vence.',
    telephone,
    email: `mailto:${email}`,
    image: `${SITE}/og/og-geek.jpg`,
    address,
    areaServed: [
      { '@type': 'City', name: 'La Colle-sur-Loup' },
      { '@type': 'City', name: 'Saint-Paul-de-Vence' },
    ],
    founder: { '@type': 'Person', '@id': `${SITE}/#pierre`, name: 'Pierre Bastiani', url: `${SITE}/` },
  }
}
