/**
 * "Is more RAM worth it?" — shared copy for the builder RAM pick, /flash-ram-offload,
 * and the budget tiers. RAM sizes are estimates (two R9700s, 262144 context, f16 KV)
 * from the 2026-10-29 minimum-RAM worksheet. Speeds are the measured run cards already
 * in data/runs. Do not add tok/s that are not in data/runs.
 */

/** Measured: Qwen3.6-35B-A3B UD-Q5_K_XL, one R9700, llama.cpp, 4K, all in VRAM. */
export const SPEED_35B_ONE_CARD = {
  run_id: 'local-desktop-20261012-2311-35b-udq5kxl-1gpu-4k-llamacpp-f16',
  tok_s: 102.39,
  label: 'Qwen3.6-35B-A3B UD-Q5_K_XL on one R9700, fully in VRAM (llama.cpp, 4K)',
} as const;

/** Measured: Qwen 3.8 Flash UD-Q6_K_XL, two R9700s, Strata, 8K, experts offloaded to DDR5-5200. */
export const SPEED_FLASH_Q6_OFFLOAD = {
  run_id: 'local-desktop-flash-q6-strata-8k',
  tok_s: 32.8,
  label: 'Qwen 3.8 Flash UD-Q6_K_XL on two R9700s with experts in DDR5-5200 (Strata, 8K)',
} as const;

export type RamWorthTier = {
  kitGb: 96 | 128 | 192 | 256;
  model: string;
  needGb: string;
  smarter: string;
};

/** Two R9700s, 262144 context, f16 KV. Needs are estimates, not measured host RAM. */
export const RAM_WORTH_TIERS: readonly RamWorthTier[] = [
  {
    kitGb: 96,
    model: 'Qwen 3.8 Flash UD-Q4_K_XL',
    needGb: '~67 GB',
    smarter: 'Recommended for most builds. Runs Flash Q4 at full 256K context with room to spare.',
  },
  {
    kitGb: 128,
    model: 'Qwen 3.8 Flash UD-Q5_K_XL / UD-Q6_K_XL',
    needGb: '~111–121 GB',
    smarter: 'Same model, higher-precision file. A bit smarter, and more of it sits in system RAM.',
  },
  {
    kitGb: 192,
    model: 'GLM-5.3-Flash UD-Q4_K_XL',
    needGb: '~147 GB',
    smarter: 'A larger model. Smarter on hard problems, and much more of it sits in system RAM.',
  },
  {
    kitGb: 256,
    model: 'GLM-5.3-Flash UD-Q5_K_XL / UD-Q6_K_XL',
    needGb: '~184–232 GB',
    smarter: 'The largest files we size. Maximum intelligence on this hardware, and the slowest output.',
  },
];

export const RAM_WORTH_TITLE = 'Is more RAM worth it?';

export const RAM_WORTH_LEDE =
  'For most people, no. 96 GB (2x48 DDR5) is the right size for most builds: with two R9700s it runs Qwen 3.8 Flash Q4 at full 256K context (estimate: about 67 GB needed). Spending more on RAM lets you load a larger, smarter model, but more of that model has to sit in system RAM instead of on the graphics cards, so it answers a lot slower. It is usually not worth it unless you really want the maximum intelligence you can run at home and are okay with it being slow.';

export const RAM_WORTH_WHY_SLOW =
  'Why it gets slower: every token reads the model weights. The R9700’s own memory is 640 GB/s (AMD spec). Dual-channel DDR5 on a Ryzen 9000 desktop reads at roughly 55–64 GB/s, so weights that live in system RAM are read about 10x or more slower (spec-sheet estimate, not a benchmark). The bigger the file, the more of it lands in system RAM.';

export const RAM_WORTH_SPEED = `Measured on our rig: ${SPEED_35B_ONE_CARD.label} decodes about ${Math.round(SPEED_35B_ONE_CARD.tok_s)} tok/s (${SPEED_35B_ONE_CARD.tok_s}). ${SPEED_FLASH_Q6_OFFLOAD.label} decodes about ${Math.round(SPEED_FLASH_Q6_OFFLOAD.tok_s)} tok/s (${SPEED_FLASH_Q6_OFFLOAD.tok_s}) — roughly a third of the speed for a bigger, smarter model. We have not measured GLM-5.3-Flash; expect it to be slower still.`;

export const RAM_WORTH_ESTIMATE_NOTE =
  'RAM needs are estimates for two R9700s at 262144 context with f16 KV (file size from Hugging Face, expert split from the GGUF headers, 10 GB for the OS). Not measured host RAM. The calculator adds 16 GB headroom, so it can round one size higher.';

export const RAM_35B_ONLY_NOTE =
  'Only ever running the 35B on one card? 32 GB (2x16) is enough for that, because the model stays in VRAM. Skip it if you might want Qwen 3.8 Flash later — a 2x16 kit cannot be topped up.';

export function ramWorthPayload() {
  return {
    title: RAM_WORTH_TITLE,
    lede: RAM_WORTH_LEDE,
    why_slow: RAM_WORTH_WHY_SLOW,
    speed: RAM_WORTH_SPEED,
    estimate_note: RAM_WORTH_ESTIMATE_NOTE,
    only_35b_note: RAM_35B_ONLY_NOTE,
    tiers: RAM_WORTH_TIERS.map((tier) => ({ kit_gb: tier.kitGb, model: tier.model, need: `${tier.needGb} (estimate)` })),
    measured: [SPEED_35B_ONE_CARD, SPEED_FLASH_Q6_OFFLOAD],
  };
}
