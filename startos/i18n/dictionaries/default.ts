export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Monetary Node!': 0,
  Dashboard: 1,
  'The dashboard is ready': 2,
  'The dashboard is not ready': 3,
  // interfaces.ts
  'The Monetary Node dashboard: node status, sync and stripping progress, spam measurements, and the network and index settings panel.': 4,
  'Electrum Server': 5,
  'Connect a wallet such as Sparrow or Electrum over the Electrum protocol. Unauthenticated, like every home Electrum server.': 6,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
