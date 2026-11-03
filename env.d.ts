/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** public contact address shown on both pages, e.g. contact@example.com */
  readonly VITE_CONTACT_EMAIL: string
  /** phone as displayed on the shop page, e.g. 06 12 34 56 78 */
  readonly VITE_CONTACT_PHONE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
