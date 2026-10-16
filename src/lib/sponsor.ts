/**
 * Sponsorship slots for AMD / Radeon-relevant vendors.
 * No invented prices, vendors, or bookings. Empty payment URL hides the CTA.
 */

import { contactEmail } from './trust';

export const SPONSOR_PUBLISHED = '2026-10-16';
export const SPONSOR_PATH = '/sponsor';
export const SPONSOR_PAYMENT_URL_ENV = 'SPONSOR_PAYMENT_URL';
export const SPONSOR_LABEL = 'Sponsored';
export const SPONSOR_RATES = 'contact for rates';

export const SPONSOR_NAME = 'Sponsor AMDai';
export const SPONSOR_KICKER = 'Labeled placements';
export const SPONSOR_HEADING = 'Sponsor AMDai';
export const SPONSOR_LEAD =
  'AMDai sells a few labeled placements to vendors who sell into the same home-lab Radeon stack this notebook documents. A booking is marked Sponsored. It does not change measured cards, labeled estimates, or which GPU this site names.';

export const SPONSOR_DESCRIPTION =
  'Sponsorship slots for AMD/Radeon-relevant vendors: homepage banner, featured GPU and backend listings, newsletter mention. Labeled Sponsored. Contact for rates.';

export type SponsorSlotId = 'home-banner' | 'gpus-featured' | 'backends-featured' | 'newsletter-mention';

export type SponsorSlot = {
  id: SponsorSlotId;
  name: string;
  placement: string;
  placementLabel: string;
  summary: string;
  audience: string;
};

export const SPONSOR_SLOTS: SponsorSlot[] = [
  {
    id: 'home-banner',
    name: 'Homepage banner',
    placement: '/',
    placementLabel: 'Home',
    summary: 'One labeled banner on the AMDai homepage, above the living status card.',
    audience:
      'Discrete Radeon and Radeon AI PRO vendors, Ryzen AI / Strix Halo system builders, and DDR5 kit makers for local LLM boxes.',
  },
  {
    id: 'gpus-featured',
    name: 'Featured GPU listing',
    placement: '/gpus',
    placementLabel: 'GPU directory',
    summary: 'One labeled featured listing on the GPU directory, above the card table.',
    audience: 'Radeon GPU sellers and workstation vendors whose SKUs already belong on /gpus.',
  },
  {
    id: 'backends-featured',
    name: 'Featured backend listing',
    placement: '/backends',
    placementLabel: 'Inference engines',
    summary: 'One labeled featured listing on the inference-engines hub.',
    audience: 'llama.cpp-adjacent engines, hosts, and Radeon inference tools. Not a ranking.',
  },
  {
    id: 'newsletter-mention',
    name: 'Newsletter mention',
    placement: '/newsletter',
    placementLabel: 'Lab Notes digest',
    summary: 'One labeled Sponsored line in a Lab Notes digest issue when a mention is booked.',
    audience: 'Same AMD and Radeon-relevant vendors as the on-site slots.',
  },
];

export type SponsorBooking = {
  slotId: SponsorSlotId;
  name: string;
  href: string;
  line: string;
};

/** No bookings ship in-repo. Do not invent a vendor. */
export const SPONSOR_BOOKINGS: SponsorBooking[] = [];

export function sponsorSlot(id: SponsorSlotId): SponsorSlot {
  const hit = SPONSOR_SLOTS.find((slot) => slot.id === id);
  if (!hit) throw new Error(`unknown sponsor slot ${id}`);
  return hit;
}

export function bookingFor(slotId: SponsorSlotId): SponsorBooking | null {
  return SPONSOR_BOOKINGS.find((row) => row.slotId === slotId) ?? null;
}

export function sponsorPaymentUrl(raw?: string): string | null {
  const value = (raw ?? process.env[SPONSOR_PAYMENT_URL_ENV] ?? '').trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function sponsorMailto(subject = 'AMDai sponsorship'): string | null {
  const email = contactEmail();
  if (!email) return null;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

export function digestSponsoredMention(): { label: string; text: string; href: string } | null {
  const booking = bookingFor('newsletter-mention');
  if (!booking) return null;
  return { label: SPONSOR_LABEL, text: booking.line, href: booking.href };
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;

export function assertSponsorValid(): string[] {
  const errors: string[] = [];
  const blob = [
    SPONSOR_LEAD,
    SPONSOR_DESCRIPTION,
    SPONSOR_RATES,
    ...SPONSOR_SLOTS.map((slot) => `${slot.name} ${slot.summary} ${slot.audience}`),
    ...SPONSOR_BOOKINGS.map((row) => `${row.name} ${row.line} ${row.href}`),
  ].join('\n');
  if (SPONSOR_SLOTS.length !== 4) errors.push('expected four slots');
  const ids = new Set<string>();
  for (const slot of SPONSOR_SLOTS) {
    if (ids.has(slot.id)) errors.push(`duplicate slot ${slot.id}`);
    ids.add(slot.id);
    if (!slot.placement.startsWith('/')) errors.push(`${slot.id} bad placement`);
    if (!/Radeon|llama\.cpp/i.test(`${slot.summary} ${slot.audience}`)) {
      errors.push(`${slot.id} must stay AMD/Radeon-relevant`);
    }
  }
  if (!ids.has('home-banner') || !ids.has('gpus-featured') || !ids.has('backends-featured') || !ids.has('newsletter-mention')) {
    errors.push('missing required slot');
  }
  if (!/contact for rates/i.test(SPONSOR_RATES)) errors.push('rates must stay contact-for-rates');
  if (!/Sponsored/.test(SPONSOR_LABEL)) errors.push('Sponsored label missing');
  if (SPONSOR_BOOKINGS.length) {
    for (const row of SPONSOR_BOOKINGS) {
      if (!ids.has(row.slotId)) errors.push(`booking for unknown slot ${row.slotId}`);
      if (!row.href.startsWith('/') && !row.href.startsWith('https://')) errors.push(`booking ${row.slotId} bad href`);
    }
  }
  if (sponsorPaymentUrl('') !== null) errors.push('empty payment URL must hide the CTA');
  if (sponsorPaymentUrl('not-a-url') !== null) errors.push('invalid payment URL must hide the CTA');
  if (sponsorPaymentUrl('http://example.com/pay') !== null) errors.push('http payment URL must hide the CTA');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/@amdai\.|local-desktop|amdai|amdai/i.test(blob)) errors.push('invented inbox or scrubbed PII');
  return [...new Set(errors)];
}
