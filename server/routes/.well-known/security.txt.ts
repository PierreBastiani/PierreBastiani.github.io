// /.well-known/security.txt (RFC 9116), prerendered at generate time from the contact env, so
// the address never sits in the repository.
export default defineEventHandler((event) => {
  const { contactEmail } = useRuntimeConfig(event).public
  const expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return [
    `Contact: mailto:${contactEmail}`,
    `Expires: ${expires}`,
    'Preferred-Languages: fr, en',
    'Canonical: https://pierre.kensae.com/.well-known/security.txt',
    '',
  ].join('\n')
})
