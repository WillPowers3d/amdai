/**
 * Trust / E-E-A-T pack: /about, /methodology, /contact, /terms, /amdai-bench hub.
 * Facts come from existing run-card provenance and published site copy.
 * Do not invent bio, email, phone, address, prices, or tok/s.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';
import { amdai, amdai, RUN_SCHEMA } from './run-card';
import { LAB_NOTES_FEED } from './feed';

export const TRUST_PUBLISHED = '2026-10-13';

export type TrustLink = { href: string; label: string };

export const TRUST_FOOTER_LINKS: TrustLink[] = [
  { href: '/about', label: 'About' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/contact', label: 'Contact' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/disclosure', label: 'Disclosure' },
  { href: '/accessibility', label: 'Accessibility' },
  { href: '/credits', label: 'Credits' },
  { href: LAB_NOTES_FEED, label: 'Feed' },
];

export const REQUIRED_FOOTER_HREFS = TRUST_FOOTER_LINKS.map((link) => link.href);

export const HOW_WE_TEST = {
  href: '/methodology',
  label: 'How we test',
  body: 'Measured cells cite official amdai-bench/run@1 cards. Estimates stay labeled. Q3 is estimate-only. Q1/Q2 stay off.',
} as const;

function contactYamlEmail(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const file = join(here, '../data/contact.yaml');
  try {
    const parsed = parse(readFileSync(file, 'utf8')) as { email?: unknown };
    return String(parsed.email ?? '').trim();
  } catch {
    return '';
  }
}

/** Public contact inbox. Empty / invalid env or yaml renders nothing — never invent an address. */
export function contactEmail(raw?: string): string | null {
  const value = (raw ?? process.env.CONTACT_EMAIL ?? contactYamlEmail()).trim();
  if (!value) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
  return value;
}

/** QA warning only — unset inbox is not a build failure. */
export function contactEmailWarning(): string | null {
  if (contactEmail()) return null;
  return 'CONTACT_EMAIL unset — fill src/data/contact.yaml email or CONTACT_EMAIL before relying on a /contact mailbox. No address was invented.';
}

export const ABOUT = {
  name: 'About AMDai',
  kicker: 'Who runs this notebook',
  lead:
    'AMDai is an independent consumer notebook for local AI on AMD Radeon and ROCm — llama.cpp first, grounded in a real two-R9700 test rig. Numbers are measured amdai-bench/run@1 cards unless a cell says estimate or cited. It is not an AMD publication.',
  who: {
    title: 'Who runs it',
    body:
      `Official first-party cards are credited to ${amdai.display} (handle ${amdai.handle}; also ${amdai.handle} / ${amdai.display} on overnight rows). Verified submitter, rig ${amdai.rig}. That is the provenance already printed on amdai-bench/run@1 cards. This page does not add a biography, job title, city, or photo.`,
  },
  what: {
    title: 'What this site is',
    body:
      'Consumer Radeon / ROCm lab notes for running local LLMs at home. It is not a store, not a leaderboard scrape, and not an AMD channel. Use Benchmarks, run cards, and Stack Lab for the measured path; Privacy and the affiliate disclosure for how the site is funded.',
  },
  rig: {
    title: 'The test rig (local-desktop)',
    body:
      'local-desktop is the house box named on official cards: two AMD Radeon AI PRO R9700 32 GB (gfx1201), 256 GB DDR5-5200 (about 249 GB usable — Linux GiB labeled GB), Ubuntu 24.04+ for the measured path. llama.cpp first. Strata is the engine on the published Flash daily-driver row. The motherboard model is not published on this site. Desktop 2 (dual R9700 + 192 GB DDR5) is a planned kit, not a measured local-desktop result.',
  },
  independence: {
    title: 'Editorial independence',
    body:
      'Recommendations come from measured cards and labeled estimates, not from a retailer. Affiliate links do not change which GPU, quant, or engine this notebook names. We do not invent street prices or tok/s. Product names belong to their owners.',
  },
  affiliates: {
    title: 'How affiliate links work',
    body:
      'Some store buttons are Amazon Associates, Rakuten (Newegg), or B&H when those IDs are set. Buttons say “Check price” — we do not show a live or stale price. Full program notes live on the affiliate disclosure.',
  },
};

export const METHODOLOGY = {
  name: 'How we test',
  kicker: 'Measured vs estimate',
  lead:
    'A number on AMDai is either a validating amdai-bench/run@1 card or a labeled estimate. Empty stays not measured. We do not scrape leaderboards or invent tok/s.',
  cards: {
    title: 'How measured numbers are produced',
    body:
      'Stack Lab and overnight local-desktop drops emit one JSON object per line (schema amdai-bench/run@1) under data/runs/. A card records hardware, software pins, GPU layout (single, split, dual-instance), the exact launch command, prefill (pp) and decode (tg) tok/s, VRAM per card / total, and peak system RAM when sampled. Official 35B tables use llama.cpp Vulkan, f16 KV, contexts 4K / 32K / 128K / 256K, one R9700 versus a split. llama.cpp first. The overnight 35B sweep recorded llama-bench, not llama-server.',
  },
  labels: {
    title: 'Measured, cited, and estimate',
    body:
      'Measured = a validating amdai-bench/run@1 card. Cited = a public doc with an https URL and an as-of date. Estimate = calculator math or a community listing, always labeled. Empty stays not measured.',
  },
  estimates: {
    title: 'How estimates are labeled',
    body:
      `Calculator totals (weights, KV, overhead, DIMM-kit rounding) are estimates unless a tested badge cites a card. Official 35B tables print the measured Q6, Q5, and Q4 cards from local-desktop. ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}) — not a local-desktop run. Q3 stays on the table as that estimate. Q1/Q2 stay off, including draft and MTP examples. House daily driver is Q5 when the file fits. We do not treat Q3 as the pick.`,
  },
  submit: {
    title: 'How to send a result',
    body:
      'Contribute a recipe JSON plus a log. Stack Lab exports a lab-notes-report/1 pack — each row is an amdai-bench/run@1 card. Ingest with npx tsx src/scripts/amdai-bench.ts ingest pack.json. Verified Q4+ measured rows merge into data/runs/. Q3 stays a labeled estimate. Do not invent a tok/s to fill a cell.',
  },
  citations: {
    title: 'Citations and as-of dates',
    body:
      'Each measured cell links its run card. Pages that reprint a figure keep the card date or “Measured on our rig, 2026-10.” External docs get an https citation and a retrieved or as-of date. Version pins are dated snapshots, not a forever matrix.',
  },
  corrections: {
    title: 'Corrections',
    body:
      'If a card or sentence is wrong, send a sourced recipe or note through Contribute — attach the log, do not invent a replacement tok/s. Official cards can be withdrawn. The 2026-10-12 35B sweep is labeled measured, pending re-verify after the DDR5-5200 oops. Q6_K 1-GPU 4K uses the 23:55 card (103.23 tok/s); the earlier 82.62 card stays on /results and is not averaged.',
  },
};

export const CONTACT = {
  name: 'Contact',
  kicker: 'Honest routes',
  lead:
    'There is no phone number or postal address on AMDai. Use the public routes below. A contact email appears only when CONTACT_EMAIL or src/data/contact.yaml email is set for this build.',
  routes: [
    { href: '/contribute', label: 'Contribute', body: 'Recipe JSON plus a log. The path for a sourced correction or a new Radeon card.' },
    { href: '/rocm-problems', label: 'ROCm problems', body: 'Cited consumer ROCm issues, workarounds, and how to help.' },
    { href: '/forum', label: 'Forum', body: 'The forum page stays up when threads are off. Code of conduct is on /forum/rules.' },
  ] satisfies Array<TrustLink & { body: string }>,
};

export const TERMS = {
  name: 'Terms of use',
  kicker: 'Plain English',
  lead:
    'AMDai is informational. Read it, copy a launch line, measure on your box. It is not a contract for hardware, software, or results. This page is not legal advice.',
  sections: [
    {
      title: 'Informational content',
      body:
        'Pages describe what we ran on local-desktop and what public docs say. They are not professional, legal, or safety advice. Product names belong to their owners. AMDai is not affiliated with AMD.',
    },
    {
      title: 'No warranty',
      body:
        'The site is provided as-is. Measured tok/s, VRAM, and RAM are for the card and pins on that run. Your box will differ. We do not warrant fitness for a particular purpose.',
    },
    {
      title: 'Hardware and BIOS',
      body:
        'You are responsible for power, cooling, firmware, and data on your machine. BIOS notes are cited chipset facts plus empty per-board rows — not a promise that a setting is safe on your motherboard. Change firmware at your own risk.',
    },
    {
      title: 'Affiliate links',
      body:
        'Some store buttons are affiliate links. Commissions do not change the price you pay and do not change the recommendation. See the affiliate disclosure.',
    },
    {
      title: 'Accounts and forum',
      body:
        'Optional accounts and the forum are off on the public static build unless those flags are set. When they are on, you are responsible for what you post. The forum code of conduct applies. Do not submit invented tok/s.',
    },
    {
      title: 'Privacy',
      body:
        'Content pages are static. Optional accounts and the Lab Notes digest have their own privacy page.',
    },
  ],
};

export const AMDAI_BENCH_HUB = {
  name: 'amdai-bench',
  kicker: RUN_SCHEMA,
  lead:
    'amdai-bench is the lowercase product name for first-party measurement on this site. A validating card is tagged amdai-bench/run@1. This hub points at the schema, the JSON dump, and the pages that print those cards.',
};

export function contactRoutes(): { href: string; label: string; body: string }[] {
  return [...CONTACT.routes];
}

export function trustBlob(): string {
  return [
    ABOUT.lead,
    ABOUT.who.body,
    ABOUT.what.body,
    ABOUT.rig.body,
    ABOUT.independence.body,
    ABOUT.affiliates.body,
    METHODOLOGY.lead,
    METHODOLOGY.cards.body,
    METHODOLOGY.labels.body,
    METHODOLOGY.estimates.body,
    METHODOLOGY.submit.body,
    METHODOLOGY.citations.body,
    METHODOLOGY.corrections.body,
    CONTACT.lead,
    ...CONTACT.routes.map((row) => `${row.label} ${row.body}`),
    TERMS.lead,
    ...TERMS.sections.map((row) => `${row.title} ${row.body}`),
    AMDAI_BENCH_HUB.lead,
    HOW_WE_TEST.body,
    RUN_SCHEMA,
    amdai.display,
    amdai.handle,
    amdai.handle,
    'Minimum system RAM needed',
    'RAM needed at full context',
  ].join('\n');
}

export function trustHrefs(): string[] {
  const links = [
    ...TRUST_FOOTER_LINKS,
    { href: HOW_WE_TEST.href, label: HOW_WE_TEST.label },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/results', label: 'Results' },
    { href: '/contribute', label: 'Contribute' },
    { href: '/amdai-bench', label: 'amdai-bench' },
    { href: '/amdai-bench/run@1.schema.json', label: 'Schema' },
    { href: '/amdai-bench/lab-notes-report@1.schema.json', label: 'lab-notes-report schema' },
    { href: '/amdai-bench/runs.json', label: 'Runs JSON' },
    { href: '/rocm-problems', label: 'ROCm problems' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/r9700', label: 'R9700' },
    { href: '/disclosure', label: 'Disclosure' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/credits', label: 'Credits' },
    { href: '/stack-lab', label: 'Stack Lab' },
    { href: '/forum', label: 'Forum' },
    { href: '/forum/rules', label: 'Forum rules' },
    { href: LAB_NOTES_FEED, label: 'Feed' },
  ];
  return [...new Set(links.map((link) => link.href.split('?')[0] ?? link.href))];
}

const BANNED_VISIBLE = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertTrustValid(): string[] {
  const errors: string[] = [];
  const blob = trustBlob();
  const hrefs = new Set(trustHrefs());
  if (ABOUT.who.body.includes(amdai.display) === false) errors.push('about must name amdai');
  if (!ABOUT.who.body.includes(amdai.handle)) errors.push('about must use the run-card handle');
  if (!/local-desktop/.test(ABOUT.rig.body)) errors.push('about must name local-desktop');
  if (!/256 GB/.test(ABOUT.rig.body) || !/R9700/.test(ABOUT.rig.body)) errors.push('about must cite the published kit');
  if (/motherboard model is not published/i.test(ABOUT.rig.body) === false) {
    errors.push('about must not invent a motherboard');
  }
  if (!/not affiliated with AMD/i.test(blob)) errors.push('independence missing');
  if (!/amdai-bench\/run@1/.test(METHODOLOGY.cards.body)) errors.push('methodology must name run@1');
  if (!/llama\.cpp/.test(METHODOLOGY.cards.body)) errors.push('methodology must keep llama.cpp first');
  if (!/f16 KV/.test(METHODOLOGY.cards.body)) errors.push('methodology must name f16 KV');
  if (!/estimate/i.test(METHODOLOGY.estimates.body) || !/UD-Q3_K_XL/.test(METHODOLOGY.estimates.body)) {
    errors.push('Q3 must stay a labeled estimate');
  }
  if (!/Q1\/Q2 stay off/.test(METHODOLOGY.estimates.body)) errors.push('Q1/Q2 stay-off missing');
  if (!/CONTACT_EMAIL/.test(CONTACT.lead)) errors.push('contact must explain unset email');
  if (/phone|postal address|P\.O\. Box/i.test(blob) && /no phone/i.test(CONTACT.lead) === false) {
    errors.push('must not invent a phone or address');
  }
  if (contactEmail('') !== null) errors.push('empty CONTACT_EMAIL must be null');
  if (contactEmail('not-an-email') !== null) errors.push('invalid CONTACT_EMAIL must be null');
  if (!/as-is/i.test(TERMS.sections.map((row) => row.body).join(' '))) errors.push('terms need no-warranty');
  if (!TRUST_FOOTER_LINKS.some((link) => link.href === '/disclosure')) errors.push('footer missing disclosure');
  if (BANNED_VISIBLE.test(blob)) errors.push('banned model');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/@amdai\.|mailto:/i.test(blob)) errors.push('invented email in catalog copy');
  if (!/not legal advice/i.test(TERMS.lead)) errors.push('terms must say not legal advice');
  if (!ABOUT.what.body.includes('/benchmarks') && !trustHrefs().includes('/stack-lab')) {
    errors.push('about must point at the measured path');
  }
  if (!/Strata/.test(ABOUT.rig.body)) errors.push('about must name Strata for Flash');
  if (!/Measured =/.test(METHODOLOGY.labels.body)) errors.push('methodology must define measured vs estimate');
  for (const required of ['/about', '/methodology', '/contact', '/terms', '/contribute', '/amdai-bench', '/benchmarks', '/results', '/stack-lab', '/rss.xml', '/forum']) {
    if (!hrefs.has(required)) errors.push(`missing href ${required}`);
  }
  return [...new Set(errors)];
}

export { COMPARE_Q3, COMPARE_Q3_CITE, RUN_SCHEMA, amdai, amdai };
