/**
 * Single source of truth for the club-license offer shown across the site
 * (pricing section, checkout page, JSON-LD). The amount Stripe actually
 * charges lives in the Stripe Price object (STRIPE_PRICE_ID) — keep the two
 * in sync when the version price steps up.
 */
export const LICENSE = {
  version: 'v1',
  /** Display price in euros — mirror of the Stripe Price. */
  price: 2000,
  currency: 'EUR',
  currencySymbol: '€',
  name: 'Kouci Club License',
} as const

/** The version ladder — the price only ever goes up. Owning early wins. */
export const VERSION_LADDER = [
  { version: 'v1', price: 2000, label: 'launch', current: true },
  { version: 'v2', price: 2600, label: 'planned', current: false },
  { version: 'v3', price: 3400, label: 'planned', current: false },
] as const

export const LICENSE_INCLUDES = [
  'Every team and age group in your club — one license covers them all',
  'Unlimited coaches, assistants and analysts',
  'All v1 tools: players & caps, penalty maps, animated tactics, live match',
  'Assisted installation + a training session for your technical staff',
  'Your data is yours — export everything, any time',
  'Founder status: locked v1 price, direct line into the roadmap',
] as const

export function formatPrice(value: number): string {
  return `${LICENSE.currencySymbol}${value.toLocaleString('en-US')}`
}
