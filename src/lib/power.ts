/**
 * Cited board-power and PSU guide at /power.
 * Watts come from AMD product pages already in the repo. Empty stays not recorded.
 * Dual R9700 is not a PSU SKU we invent. No prices, no invented tok/s.
 */

import { CONSUMER_NAV_LINKS } from './consumer-gpu';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import {
  AMD_7800XT_SPEC,
  AMD_7900XT_SPEC,
  AMD_7900XTX_SPEC,
  AMD_R9700_SPEC,
  SPEC_ROWS,
} from './radeon-vs-nvidia';
import { officialLinks } from './site';

export const POWER_PUBLISHED = '2026-10-14';
export const POWER_CITED_LABEL = 'Cited, not measured on local-desktop';
export const POWER_EMPTY = 'not recorded';
export const POWER_PSU_EMPTY = 'not recorded — check the product page';
export const POWER_SEARCH_GUIDANCE = '1000W-class is search guidance, not a SKU';

export type PowerLink = { href: string; label: string };

export type PowerSource = {
  id: string;
  title: string;
  href: string;
};

export type PowerBoardRow = {
  id: string;
  name: string;
  href: string;
  tbp: string;
  psu: string;
  connector: string;
  source: string;
  sourceHref: string;
  kind: 'cited' | 'unrecorded';
};

export type PowerStep = {
  id: string;
  title: string;
  body: string;
  links: PowerLink[];
};

export type PowerFaq = {
  id: string;
  question: string;
  answer: string;
  links: PowerLink[];
};

export const POWER_TITLE = 'Board power and PSU on Radeon';
export const POWER_DESCRIPTION =
  'Cited AMD board power (TBP) per Radeon and PSU sizing, including dual R9700. No invented watts or prices.';

export const POWER_LEAD = `
  This page is electrical, not a tok/s card. Tokens still start on llama.cpp.
  Board power is AMD’s published TBP on the product page. A PSU minimum is
  only printed when AMD published one. Empty cells stay ${POWER_EMPTY}.
  We do not add headroom watts, dual-card SKUs, or street prices.
`.replace(/\s+/g, ' ').trim();

export const POWER_SOURCES: PowerSource[] = [
  { id: 'r9700', title: 'AMD Radeon AI PRO R9700 product page', href: AMD_R9700_SPEC },
  { id: 'rx7900xtx', title: 'AMD Radeon RX 7900 XTX product page', href: AMD_7900XTX_SPEC },
  { id: 'rx7900xt', title: 'AMD Radeon RX 7900 XT product page', href: AMD_7900XT_SPEC },
  { id: 'rx7800xt', title: 'AMD Radeon RX 7800 XT product page', href: AMD_7800XT_SPEC },
  { id: 'rx6700xt', title: 'AMD Radeon RX 6700 XT product page', href: 'https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6700-xt.html' },
  { id: 'rocm', title: 'AMD ROCm documentation', href: officialLinks.rocm },
];

const R9700_CONNECTOR = '12V-2x6 (AMD R9700 product page)';

function citedRadeonPower(): PowerBoardRow[] {
  return SPEC_ROWS.filter((row) => row.camp === 'radeon').map((row) => ({
    id: row.id,
    name: row.name,
    href: row.id === 'r9700' ? '/gpus/r9700' : `/gpus/${row.productId}`,
    tbp: row.power.value,
    psu: row.id === 'r9700' ? '750 W minimum (AMD product page)' : POWER_PSU_EMPTY,
    connector: row.id === 'r9700' ? R9700_CONNECTOR : POWER_EMPTY,
    source: row.power.source,
    sourceHref: row.power.href,
    kind: 'cited' as const,
  }));
}

export const POWER_UNRECORDED_ROWS: PowerBoardRow[] = [
  {
    id: 'rx-7900-gre',
    name: 'Radeon RX 7900 GRE',
    href: '/gpus/rx-7900-gre',
    tbp: POWER_EMPTY,
    psu: POWER_PSU_EMPTY,
    connector: POWER_EMPTY,
    source: 'No AMD TBP cited on AMDai yet',
    sourceHref: '/gpus/rx-7900-gre',
    kind: 'unrecorded',
  },
  {
    id: 'rx-7700-xt',
    name: 'Radeon RX 7700 XT',
    href: '/gpus/rx-7700-xt',
    tbp: POWER_EMPTY,
    psu: POWER_PSU_EMPTY,
    connector: POWER_EMPTY,
    source: 'No AMD TBP cited on AMDai yet',
    sourceHref: '/gpus/rx-7700-xt',
    kind: 'unrecorded',
  },
  {
    id: 'rx-7600-xt',
    name: 'Radeon RX 7600 XT',
    href: '/gpus/rx-7600-xt',
    tbp: POWER_EMPTY,
    psu: POWER_PSU_EMPTY,
    connector: POWER_EMPTY,
    source: 'No AMD TBP cited on AMDai yet',
    sourceHref: '/gpus/rx-7600-xt',
    kind: 'unrecorded',
  },
  {
    id: 'rx-7600',
    name: 'Radeon RX 7600',
    href: '/gpus/rx-7600',
    tbp: POWER_EMPTY,
    psu: POWER_PSU_EMPTY,
    connector: POWER_EMPTY,
    source: 'No AMD TBP cited on AMDai yet',
    sourceHref: '/gpus/rx-7600',
    kind: 'unrecorded',
  },
  {
    id: 'rx-6800-xt',
    name: 'Radeon RX 6800 XT',
    href: '/gpus/rx-6800-xt',
    tbp: POWER_EMPTY,
    psu: POWER_PSU_EMPTY,
    connector: POWER_EMPTY,
    source: 'No AMD TBP cited on AMDai yet',
    sourceHref: '/gpus/rx-6800-xt',
    kind: 'unrecorded',
  },
  {
    id: 'rx-9070-xt',
    name: 'Radeon RX 9070 XT',
    href: '/gpus/rx-9070-xt',
    tbp: POWER_EMPTY,
    psu: POWER_PSU_EMPTY,
    connector: POWER_EMPTY,
    source: 'No AMD TBP cited on AMDai yet',
    sourceHref: '/gpus/rx-9070-xt',
    kind: 'unrecorded',
  },
  {
    id: 'rx-9060-xt',
    name: 'Radeon RX 9060 XT',
    href: '/gpus/rx-9060-xt',
    tbp: POWER_EMPTY,
    psu: POWER_PSU_EMPTY,
    connector: POWER_EMPTY,
    source: 'No AMD TBP cited on AMDai yet',
    sourceHref: '/gpus/rx-9060-xt',
    kind: 'unrecorded',
  },
  {
    id: 'strix-halo',
    name: 'Strix Halo / Ryzen AI Max (Radeon 8060S)',
    href: '/gpus/strix-halo',
    tbp: POWER_EMPTY,
    psu: POWER_PSU_EMPTY,
    connector: POWER_EMPTY,
    source: 'Shared-memory APU — no discrete TBP cited on AMDai',
    sourceHref: '/gpus/strix-halo',
    kind: 'unrecorded',
  },
];

export const POWER_CITED_EXTRA: PowerBoardRow[] = [
  {
    id: 'rx-6700-xt',
    name: 'Radeon RX 6700 XT',
    href: '/gpus/rx-6700-xt',
    tbp: '230 W TBP',
    psu: POWER_PSU_EMPTY,
    connector: POWER_EMPTY,
    source: 'AMD RX 6700 XT product page (Typical Board Power)',
    sourceHref: 'https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6700-xt.html',
    kind: 'cited',
  },
];

export const POWER_BOARD_ROWS: PowerBoardRow[] = [...citedRadeonPower(), ...POWER_CITED_EXTRA, ...POWER_UNRECORDED_ROWS];

export const POWER_STEPS: PowerStep[] = [
  {
    id: 'read-tbp',
    title: 'Read AMD’s TBP on the product page',
    body:
      'Total board power is the published electrical envelope for that SKU. The cited cells on this page copy AMD product pages already used on Radeon vs NVIDIA. If the cell is not recorded, open the product page for the card you are buying. Do not copy a neighbor SKU.',
    links: [
      { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
      { href: '/gpus', label: 'GPU directory' },
    ],
  },
  {
    id: 'read-psu-min',
    title: 'Read AMD’s minimum PSU only when they published one',
    body:
      'AMD publishes a 750 W minimum PSU recommendation for the R9700 (product page). That is a generic-system minimum, not headroom for a 5090-class CPU and six drives. Other directory cards stay not recorded — check the product page for the SKU you buy.',
    links: [
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/hardware', label: 'Hardware' },
    ],
  },
  {
    id: 'no-invented-watts',
    title: 'Do not invent headroom watts',
    body:
      'AMDai does not add a house formula on top of TBP. 1000W-class is search guidance for headroom, not a SKU and not a dual-card rating. Buttons say Check price — we do not print a figure.',
    links: [
      { href: '/budget', label: 'Budget' },
      { href: '/disclosure', label: 'Affiliate disclosure' },
    ],
  },
  {
    id: 'native-cable',
    title: 'Use a native 12V-2x6 cable if that is what the card expects',
    body:
      'The R9700 product page lists a 12V-2x6 connector. Cheap pigtails are how people learn about transient spikes. Match the connector the card actually has. We do not invent a pinout for partner coolers.',
    links: [
      { href: '/hardware', label: 'Hardware' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
    ],
  },
  {
    id: 'dual-r9700',
    title: 'Two R9700s are not a PSU SKU we invent',
    body:
      'AMD publishes 300 W TBP and a 750 W minimum PSU recommendation per R9700 (product page). Two 300 W TBP cards plus 750 W minimum per card is not a dual-card PSU number we will invent. Check the unit you buy. A second card on local-desktop is copies or Flash offload, not automatic 2× decode. llama.cpp first.',
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
    ],
  },
  {
    id: 'then-tokens',
    title: 'Then get a token on llama.cpp',
    body:
      'Power is settled before you chase tok/s. Ubuntu 24.04+ is the measured first-run path. Size the GGUF on the calculator. Q3 stays a labeled estimate when a quant comparison appears. Q1/Q2 stay off.',
    links: [
      { href: '/setup', label: 'First-run setup' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
];

export const POWER_DUAL = `
  local-desktop seats two Radeon AI PRO R9700 cards. AMD publishes 300 W TBP and a
  750 W minimum PSU recommendation per card (product page). That is electrical,
  not a street price. Two 300 W TBP cards plus 750 W minimum per card is not
  a dual-card PSU SKU we will invent. ${POWER_SEARCH_GUIDANCE}. Check the unit
  you buy; use a native 12V-2x6 cable if that is what the card expects.
  A second card is copies or Flash RAM offload, not automatic 2× decode.
  ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} for that Flash job live on the Flash
  RAM offload page — this page does not invent a kit size. llama.cpp first.
`.replace(/\s+/g, ' ').trim();

export const POWER_FAQ: PowerFaq[] = [
  {
    id: 'what-is-tbp',
    question: 'What is TBP?',
    answer:
      'Total board power. AMD publishes it on the product page for the SKU. The cited rows here copy those pages. It is not a measured wall-plug number from local-desktop and not a street price.',
    links: [
      { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
    ],
  },
  {
    id: 'r9700-psu',
    question: 'What PSU does one R9700 need?',
    answer:
      'AMD’s published minimum is 750 W, and TBP is 300 W (product page). That is a generic-system minimum. If your PSU is below 750 W, upgrade the PSU — do not guess a wattage. 1000W-class is search guidance for headroom, not a SKU.',
    links: [
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/budget', label: 'Budget' },
    ],
  },
  {
    id: 'dual-psu',
    question: 'What PSU do two R9700s need?',
    answer:
      'Two 300 W TBP cards plus 750 W minimum per card is not a dual-card PSU number AMDai will invent. Check the unit you buy. 1000W-class stays search guidance. See Dual / multi-GPU for when the second card helps.',
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/hardware', label: 'Hardware' },
    ],
  },
  {
    id: 'other-cards',
    question: 'Where is TBP for the 16 GB cards?',
    answer:
      'Not recorded on AMDai yet. The RX 9070 XT, 9060 XT, 7900 GRE, 7700 XT, 7600 XT, and 7600 sheets do not invent a wattage. Open the product page for the SKU you buy. Strix Halo is a shared-memory APU — no discrete TBP is cited here.',
    links: [
      { href: '/gpus', label: 'GPU directory' },
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT' },
      { href: '/gpus/strix-halo', label: 'Strix Halo' },
    ],
  },
];

export const POWER_SECTIONS = [
  { id: 'board-power', label: 'Cited board power' },
  { id: 'unrecorded', label: 'Not recorded yet' },
  { id: 'psu', label: 'PSU sizing' },
  { id: 'dual', label: 'Dual R9700' },
  { id: 'faq', label: 'FAQ' },
  { id: 'sources', label: 'Sources' },
] as const;

export const POWER_HUB_LINKS: PowerLink[] = [
  { href: '/hardware', label: 'Hardware' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/budget', label: 'Budget' },
  { href: '/bios', label: 'BIOS' },
  { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
  { href: '/setup', label: 'Setup' },
  { href: '/faq', label: 'FAQ' },
];

export const REQUIRED_POWER_HREFS = [
  '/hardware',
  '/multi-gpu',
  '/qwen36-dual',
  '/flash-ram-offload',
  '/gpus/r9700',
  '/gpus/rx7900xtx',
  '/gpus/rx7900xt',
  '/gpus/rx7800xt',
  '/gpus/rx-9070-xt',
  '/gpus/rx-9060-xt',
  '/gpus/rx-7900-gre',
  '/gpus/rx-7700-xt',
  '/gpus/rx-7600-xt',
  '/gpus/rx-7600',
  '/gpus/rx-6800-xt',
  '/gpus/rx-6700-xt',
  '/gpus/strix-halo',
  '/compare/radeon-vs-nvidia',
  '/budget',
  '/bios',
  '/setup',
  '/backends/llamacpp',
  '/calculator',
  '/disclosure',
  '/gpus',
] as const;

export const POWER_HOWTO_STEPS = POWER_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export function powerBlob(): string {
  return [
    POWER_TITLE,
    POWER_DESCRIPTION,
    POWER_LEAD,
    POWER_CITED_LABEL,
    POWER_EMPTY,
    POWER_PSU_EMPTY,
    POWER_SEARCH_GUIDANCE,
    POWER_DUAL,
    ...POWER_BOARD_ROWS.map((row) => `${row.name} ${row.tbp} ${row.psu} ${row.connector} ${row.source}`),
    ...POWER_STEPS.map((row) => `${row.title} ${row.body}`),
    ...POWER_FAQ.map((row) => `${row.question} ${row.answer}`),
  ].join('\n');
}

export function powerHrefs(): string[] {
  const links: PowerLink[] = [
    ...POWER_HUB_LINKS,
    ...POWER_BOARD_ROWS.map((row) => ({ href: row.href, label: row.name })),
    ...POWER_STEPS.flatMap((step) => step.links),
    ...POWER_FAQ.flatMap((row) => row.links),
    ...POWER_SOURCES.map((source) => ({ href: source.href, label: source.title })),
    ...CONSUMER_NAV_LINKS,
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertPowerValid(): string[] {
  const errors: string[] = [];
  const blob = powerBlob();
  const hrefs = new Set(powerHrefs());
  if (POWER_CITED_LABEL !== 'Cited, not measured on local-desktop') errors.push('cited label drifted');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp in view');
  if (!/300 W/.test(blob) || !/750 W/.test(blob)) errors.push('must cite AMD 300 W TBP and 750 W min PSU');
  if (!/355 W/.test(blob) || !/315 W/.test(blob) || !/263 W/.test(blob)) {
    errors.push('must cite the other AMD TBP cells already on Radeon vs NVIDIA');
  }
  if (!/not a dual-card PSU/.test(blob)) errors.push('must refuse to invent a dual-card PSU SKU');
  if (!blob.includes(POWER_SEARCH_GUIDANCE)) errors.push('must label 1000W-class as search guidance');
  if (!blob.includes(POWER_EMPTY)) errors.push('must keep not-recorded cells');
  if (POWER_BOARD_ROWS.filter((row) => row.kind === 'cited').length < 4) errors.push('too few cited TBP rows');
  if (POWER_BOARD_ROWS.filter((row) => row.kind === 'unrecorded').length < 6) {
    errors.push('uncited directory cards must stay not recorded');
  }
  if (POWER_BOARD_ROWS.some((row) => row.kind === 'cited' && !/^https:\/\//.test(row.sourceHref))) {
    errors.push('cited TBP must point at an https product page');
  }
  if (POWER_UNRECORDED_ROWS.some((row) => row.tbp !== POWER_EMPTY)) {
    errors.push('unrecorded rows must not invent TBP');
  }
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM lines missing');
  if (!/labeled estimate/.test(blob)) errors.push('Q3 must stay a labeled estimate when quants appear');
  if (/\b\d+(?:\.\d+)?\s*tok\/s\b/i.test(blob)) errors.push('invented tok/s');
  for (const source of POWER_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_POWER_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
