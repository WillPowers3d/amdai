/**
 * Map rocminfo / rocm-smi marketing names and gfx IDs to a calculator card id.
 * gfx1201 is shared by the R9700 and the RX 9070 family — name wins when both appear.
 */

export type GpuDetectCard = {
  id: string;
  name: string;
  gfx: string[];
  names: string[];
  vramGb: number | null;
};

export type GpuDetectHit = {
  id: string;
  name: string;
  reason: string;
  confidence: 'name' | 'gfx';
};

export const GPU_DETECT: GpuDetectCard[] = [
  { id: 'r9700', name: 'Radeon AI PRO R9700', gfx: ['gfx1201'], names: ['radeon ai pro r9700', 'r9700', 'ai pro r9700'], vramGb: 32 },
  { id: 'rx9070xt', name: 'Radeon RX 9070 XT', gfx: ['gfx1201'], names: ['rx 9070 xt', '9070 xt', 'rx9070xt'], vramGb: 16 },
  { id: 'rx9070gre', name: 'Radeon RX 9070 GRE', gfx: ['gfx1201'], names: ['rx 9070 gre', '9070 gre'], vramGb: 12 },
  { id: 'rx9070', name: 'Radeon RX 9070', gfx: ['gfx1201'], names: ['rx 9070', '9070'], vramGb: 16 },
  { id: 'rx9060xt', name: 'Radeon RX 9060 XT', gfx: ['gfx1200'], names: ['rx 9060 xt', '9060 xt'], vramGb: 16 },
  { id: 'rx7900xtx', name: 'Radeon RX 7900 XTX', gfx: ['gfx1100'], names: ['7900 xtx', 'rx 7900 xtx'], vramGb: 24 },
  { id: 'rx7900xt', name: 'Radeon RX 7900 XT', gfx: ['gfx1100'], names: ['7900 xt', 'rx 7900 xt'], vramGb: 20 },
  { id: 'rx7900gre', name: 'Radeon RX 7900 GRE', gfx: ['gfx1100'], names: ['7900 gre'], vramGb: 16 },
  { id: 'rx7800xt', name: 'Radeon RX 7800 XT', gfx: ['gfx1101'], names: ['7800 xt'], vramGb: 16 },
  { id: 'rx7700xt', name: 'Radeon RX 7700 XT', gfx: ['gfx1101'], names: ['7700 xt'], vramGb: 12 },
  { id: 'rx7600xt', name: 'Radeon RX 7600 XT', gfx: ['gfx1102'], names: ['rx 7600 xt', '7600 xt'], vramGb: 16 },
  { id: 'rx7600', name: 'Radeon RX 7600', gfx: ['gfx1102'], names: ['rx 7600', '7600'], vramGb: 8 },
  { id: 'rx6800xt', name: 'Radeon RX 6800 XT', gfx: ['gfx1030'], names: ['rx 6800 xt', '6800 xt', 'rx6800xt'], vramGb: 16 },
  { id: 'w7900', name: 'Radeon PRO W7900', gfx: ['gfx1100'], names: ['w7900', 'pro w7900'], vramGb: 48 },
  { id: 'w7800', name: 'Radeon PRO W7800', gfx: ['gfx1100'], names: ['w7800', 'pro w7800'], vramGb: 32 },
  { id: 'w6800', name: 'Radeon PRO W6800', gfx: ['gfx1030'], names: ['w6800', 'pro w6800'], vramGb: 32 },
  { id: 'strix-halo', name: 'Ryzen AI Max+ 395 / Strix Halo', gfx: ['gfx1151'], names: ['strix halo', 'ryzen ai max+ 395', 'ryzen ai max 395', '8060s', 'gfx1151'], vramGb: null },
];

const NAME_ORDER = [...GPU_DETECT].sort((a, b) => {
  const aLen = Math.max(...a.names.map((n) => n.length));
  const bLen = Math.max(...b.names.map((n) => n.length));
  return bLen - aLen;
});

export function detectGpu(text: string): GpuDetectHit[] {
  const hay = text.toLowerCase().replace(/_/g, ' ');
  if (!hay.trim()) return [];

  const named: GpuDetectHit[] = [];
  for (const card of NAME_ORDER) {
    const name = card.names.find((alias) => hay.includes(alias));
    if (!name) continue;
    if (card.id === 'rx9070' && /9070\s+(xt|gre)/.test(hay)) continue;
    if (card.id === 'rx7900xt' && /7900\s+xtx/.test(hay)) continue;
    if (card.id === 'rx7600' && /7600\s+xt/.test(hay)) continue;
    if (card.id === 'w6800' && /6800\s+xt/.test(hay)) continue;
    named.push({
      id: card.id,
      name: card.name,
      reason: `Matched marketing name “${name}”`,
      confidence: 'name',
    });
  }
  if (named.length) return uniqueHits(named);

  const gfxHits: GpuDetectHit[] = [];
  for (const card of GPU_DETECT) {
    for (const gfx of card.gfx) {
      if (hay.includes(gfx.toLowerCase())) {
        gfxHits.push({
          id: card.id,
          name: card.name,
          reason: `gfx ${gfx} is shared — pick the SKU. ${card.name} is one option.`,
          confidence: 'gfx',
        });
      }
    }
  }
  return uniqueHits(gfxHits);
}

function uniqueHits(hits: GpuDetectHit[]): GpuDetectHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    if (seen.has(hit.id)) return false;
    seen.add(hit.id);
    return true;
  });
}

export function detectPrimary(text: string): GpuDetectHit | null {
  const hits = detectGpu(text);
  return hits.find((hit) => hit.confidence === 'name') ?? hits[0] ?? null;
}
