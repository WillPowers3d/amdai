/**
 * Size-vs-speed priority. Shared by /budget and /calculator.
 * Speed claims are estimates unless a first-party “Tested on our rig” number applies.
 * Never recommend a quant below Q4.
 */
import {
  applyGpuPreset,
  applyModelPreset,
  bestQuantThatFits,
  DEFAULT_INPUT,
  fitsInVram,
  quantById,
  type CalcInput,
  type CalcResult,
  type Quant,
} from './calculator';

export const PRIORITY_PARAM = 'priority';
export type Priority = 'size' | 'speed';
export const PRIORITIES: Priority[] = ['size', 'speed'];
export const DEFAULT_PRIORITY: Priority = 'speed';

export const PRIORITY_COPY: Record<
  Priority,
  { label: string; short: string; lede: string; offload: string; bestQuantLabel: string }
> = {
  size: {
    label: 'Max model size',
    short: 'Size',
    lede:
      'Favor more total VRAM — a larger card or a second GPU — and plenty of system RAM so a bigger file can overflow. Pick the largest house model and the highest quant that still makes sense (Q5 or Q6 when they fit, never below Q4). Tokens per second will be lower than an in-VRAM load. Speed numbers are estimates unless a “Tested on our rig” badge is showing.',
    offload:
      'Overflow to system RAM is the max-size path. Tokens per second will be lower than keeping the whole file in VRAM (estimate — no tok/s unless a tested badge applies). Do not drop below Q4.',
    bestQuantLabel: 'Highest quant that fits in VRAM (max size)',
  },
  speed: {
    label: 'Speed',
    short: 'Speed',
    lede:
      'Favor the whole model in one GPU’s VRAM with no RAM offload. Prefer a MoE with few active parameters (Qwen3.6-35B-A3B style), Q4_K_M to Q5, a shorter context, and a single fast card. Offloading weights or KV into system RAM kills speed.',
    offload:
      'Offloading to system RAM kills speed. Fit the file on one GPU, shorten context, or stay at Q4_K_M–Q5. Do not drop below Q4.',
    bestQuantLabel: 'Q4_K_M–Q5 that fits one GPU (speed)',
  },
};

export type PriorityAdvice = {
  headline: string;
  body: string;
  applyLabel?: string;
  apply?: CalcInput;
};

export function isPriority(value: string | null | undefined): value is Priority {
  return value === 'size' || value === 'speed';
}

export function parsePriority(search: string): Priority {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const raw = q.get(PRIORITY_PARAM);
  return isPriority(raw) ? raw : DEFAULT_PRIORITY;
}

export function hasPriorityParam(search: string): boolean {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return isPriority(q.get(PRIORITY_PARAM));
}

/** Suggested /budget tier when the visitor has not picked one. */
export function suggestedBudgetTier(priority: Priority): 'pro' | 'enthusiast' {
  return priority === 'size' ? 'pro' : 'enthusiast';
}

export function withPriorityParam(search: string, priority: Priority): string {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  q.set(PRIORITY_PARAM, priority);
  return q.toString();
}

export function appendPriority(pathAndQuery: string, priority: Priority): string {
  const qIndex = pathAndQuery.indexOf('?');
  const path = qIndex === -1 ? pathAndQuery : pathAndQuery.slice(0, qIndex);
  const search = qIndex === -1 ? '' : pathAndQuery.slice(qIndex);
  return `${path}?${withPriorityParam(search, priority)}`;
}

/** Speed: Q5 if it fits one GPU, else Q4_K_M. Size: highest Q4+ that fits VRAM. */
export function bestQuantForPriority(input: CalcInput, priority: Priority): Quant | null {
  if (priority === 'size') return bestQuantThatFits(input);
  const single: CalcInput = { ...input, split: false, gpuCount: 1 };
  if (fitsInVram({ ...single, quantId: 'q5_k_m' })) return quantById('q5_k_m');
  if (fitsInVram({ ...single, quantId: 'q4_k_m' })) return quantById('q4_k_m');
  return null;
}

export function speedDefaults(current: CalcInput): CalcInput {
  return applyModelPreset(
    'qwen36',
    applyGpuPreset(current.gpuId === 'custom' ? 'r9700' : current.gpuId, {
      ...DEFAULT_INPUT,
      gpuId: current.gpuId === 'custom' ? 'r9700' : current.gpuId,
      vramGb: current.gpuId === 'custom' ? current.vramGb : DEFAULT_INPUT.vramGb,
      gpuCount: 1,
      split: false,
      ramGb: current.ramGb,
      quantId: 'q5_k_m',
      context: 32768,
    }),
  );
}

export function sizeDefaults(current: CalcInput): CalcInput {
  return applyModelPreset(
    'flash',
    applyGpuPreset('r9700', {
      ...DEFAULT_INPUT,
      gpuCount: Math.max(2, current.gpuCount),
      split: true,
      ramGb: Math.max(128, current.ramGb),
      quantId: 'q6_k',
      context: 262144,
    }),
  );
}

export function calculatorAdvice(input: CalcInput, result: CalcResult, priority: Priority): PriorityAdvice {
  const oneGpu = input.gpuCount === 1 && !input.split;
  const moe = input.activeParamsB > 0 && input.activeParamsB < input.totalParamsB;
  const q4to5 = input.quantId === 'q4_k_m' || input.quantId === 'q5_k_m';

  if (priority === 'speed') {
    if (result.overflowGiB > 0.05) {
      return {
        headline: 'Speed: this setup offloads — that kills tokens per second',
        body: 'Fit the whole file in one GPU with no RAM offload. House pattern: Qwen3.6-35B-A3B at Q4_K_M–Q5, shorter context if needed. We do not have a tok/s number for this overflowing setup. Flash Q6 is a size pick (publisher listing ~169 GB).',
        applyLabel: 'Apply speed defaults (35B Q5, 1× GPU, 32K)',
        apply: speedDefaults(input),
      };
    }
    if (input.split || input.gpuCount > 1) {
      return {
        headline: 'Speed: prefer one GPU, no split',
        body: 'Splitting across cards is a size move. Speed wants one copy in one card and 0% RAM offload. Tokens per second for a split load: estimate only — no first-party number.',
        applyLabel: 'Apply speed defaults (35B Q5, 1× GPU, 32K)',
        apply: speedDefaults(input),
      };
    }
    if (input.modelId === 'flash') {
      return {
        headline: 'Speed: Flash Q6 is the size file',
        body: 'Publisher listing ~169 GB — it will not sit in one GPU. First-party tok/s on our rig is for Flash on the Pro RAM path (Strata v0.1.42 ~32.6 tok/s vs llama.cpp ~16), not an in-VRAM speed pick. For speed, use Qwen3.6-35B-A3B at Q4_K_M–Q5 on one card.',
        applyLabel: 'Apply speed defaults (35B Q5, 1× GPU, 32K)',
        apply: speedDefaults(input),
      };
    }
    if (input.quantId === 'q6_k' || input.quantId === 'q8_0' || input.quantId === 'bf16') {
      return {
        headline: 'Speed: Q4_K_M to Q5 is the band',
        body: 'Q6 and above are a size/quality move and need more VRAM. If Q5 already fits one GPU, stay there. Never drop below Q4. Tokens per second: estimate only.',
      };
    }
    if (oneGpu && moe && q4to5 && result.verdict !== 'no') {
      if (result.tested?.id === 'daily') {
        return {
          headline: 'Speed: in-VRAM MoE on one card (tested on our rig)',
          body: 'Daily driver shape: Qwen3.6-35B-A3B Q5, one R9700, 0% RAM offload, f16 KV. Measured on our rig, 2026-10 — UD-Q5_K_XL decode 100.8 tok/s at short context, ~88 at 32K, ~50 at 256K. Q5_K_M sibling 108.3 tok/s (28.5 GB VRAM).',
        };
      }
      if (result.tested?.id === 'q4') {
        return {
          headline: 'Speed: in-VRAM MoE on one card (tested on our rig)',
          body: 'Q4_K_M on one R9700, llama.cpp, f16 KV. Measured on our rig, 2026-10 — 116.5 tok/s decode; 1814 tok/s prefill at 32K. Prefer Q5 when it fits.',
        };
      }
      return {
        headline: 'Speed: in-VRAM MoE on one card (estimate)',
        body: 'Whole file in one GPU, few active experts, Q4_K_M–Q5. Tokens per second: estimate only — no first-party number for this exact setup.',
      };
    }
    return {
      headline: 'Speed: keep it in one GPU',
      body: 'One card, no split, no RAM offload, Q4_K_M–Q5, shorter context if the estimate is tight. Offload kills speed. Tokens per second: estimate only unless a tested badge applies.',
    };
  }

  if (result.tested?.id === 'fast') {
    return {
      headline: 'Max size: Flash Q6 on the Pro RAM path (tested on our rig)',
      body: 'Publisher file ~169 GB. First-party: Strata v0.1.42 ~32.6 tok/s vs llama.cpp ~16 on our rig for this Flash Q6. A one-card 35B in VRAM is faster — Measured on our rig, 2026-10: UD-Q5_K_XL 100.8 tok/s short / ~88 at 32K / ~50 at 256K.',
    };
  }
  if (input.modelId !== 'flash' && input.ramGb >= 128) {
    return {
      headline: 'Max size: you have the RAM for a larger file',
      body: 'Qwen 3.8 Flash UD-Q6_K_XL is the largest house GGUF (publisher ~169 GB). Expect system-RAM residency and lower tokens per second than an in-VRAM 35B. First-party Flash numbers exist only on our Pro rig (Strata ~32.6 vs llama.cpp ~16). Never below Q4.',
      applyLabel: 'Apply size defaults (Flash Q6, 2× GPU split, ≥128 GB RAM)',
      apply: sizeDefaults(input),
    };
  }
  if (result.overflowGiB > 0.05) {
    return {
      headline: 'Max size: this file overflows VRAM (estimate)',
      body: PRIORITY_COPY.size.offload,
      applyLabel: 'Apply size defaults (Flash Q6, 2× GPU split, ≥128 GB RAM)',
      apply: sizeDefaults(input),
    };
  }
  if (result.bestQuant && result.bestQuant.id !== input.quantId && result.bestQuant.bpw > quantById(input.quantId).bpw) {
    return {
      headline: `Max size: ${result.bestQuant.label} still fits (estimate)`,
      body: 'You asked for the largest file that stays in VRAM. A higher quant at or above Q5 is the size move when it fits. Tokens per second will be lower than a lighter quant (estimate). Never below Q4.',
    };
  }
  if (oneGpu && !input.split) {
    return {
      headline: 'Max size: one card is the speed shape',
      body: 'More total VRAM (a second card, or a 32 GB card if you are below that) and 128–256 GB DDR5 is the size ladder. Tokens per second will be lower once you offload. First-party 35B tok/s (Measured on our rig, 2026-10) is the in-VRAM llama.cpp set; Flash Q6 on our Pro rig is ~32.6 vs ~16.',
      applyLabel: 'Apply size defaults (Flash Q6, 2× GPU split, ≥128 GB RAM)',
      apply: sizeDefaults(input),
    };
  }
  return {
    headline: 'Max size: more VRAM and RAM, higher quant',
    body: PRIORITY_COPY.size.lede,
  };
}
