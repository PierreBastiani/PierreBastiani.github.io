import { contact, telHref } from '@/content'

// The public contact details, baked in at generate time (nuxt.config.ts stops the build without
// them). The email is public runtime config: it's on both pages. The phone is private runtime
// config, so it never ships with the main page; see loadContactPhone below.
// In dev with no .env, an obvious placeholder shows instead.
export function useContact() {
  const { contactEmail } = useRuntimeConfig().public
  const email = contactEmail || 'NUXT_PUBLIC_CONTACT_EMAIL-manquant@example.invalid'
  return { name: contact.name, email }
}

// The phone travels as async data of the shop page: written into that page's HTML and its
// _payload.json at generate time, so it also arrives when the client navigates there from /.
// The shop page awaits loadContactPhone() once; its components read it with useContactPhone().
export function loadContactPhone() {
  return useAsyncData('contact-phone', () => Promise.resolve(useRuntimeConfig().contactPhone || '00 00 00 00 00'))
}

export function useContactPhone() {
  const { data } = useNuxtData<string>('contact-phone')
  const phone = computed(() => data.value ?? '')
  return { phone, phoneHref: computed(() => telHref(phone.value)) }
}
