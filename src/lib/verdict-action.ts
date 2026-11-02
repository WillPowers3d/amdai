/**
 * Map a calculator verdict to at most one honest next step.
 * No prices. No Q1/Q2. GB means GiB. Newegg first, Amazon secondary.
 */

export const VERDICT_ACTION_SRC = 'calc-verdict';
export const VERDICT_ACTION_SRC_2X = 'calc-verdict-2x';

export type VerdictFits = 'fits' | 'tight' | 'no';

export type VerdictActionInput = {
  fits: VerdictFits;
  gpuId?: string;
  gpuVramGiB: number;
  gpuCount: number;
  modelId?: string;
  totalGiB: number;
  ramGiB?: number | null;
  offloadOk?: boolean;
};

export type VerdictActionKind = 'none' | 'ram' | 'gpu' | 'gpu2' | 'smaller-quant';

export type VerdictAction = {
  kind: VerdictActionKind;
  text: string;
  link?: string;
  alt?: string;
  check?: string;
  kitGB?: number;
  buttonLabel?: string;
  altLabel?: string;
  checkLabel?: string;
};

const R9700 = 32;
const RAM_KITS = [32, 64, 96, 128, 192, 256] as const;

export function offloadModel(modelId: string | undefined): boolean {
  return modelId === 'flash' || modelId === 'glm-53-flash';
}

export function verdictAction(v: VerdictActionInput): VerdictAction {
  if (v.fits === 'fits' || v.fits === 'tight') {
    return {
      kind: 'none',
      text: 'Your hardware runs this. Nothing to buy.',
      link: '/setup/',
      buttonLabel: 'First-run setup',
    };
  }

  if (v.offloadOk) {
    const hostNeed = Math.max(0, v.totalGiB - v.gpuVramGiB * v.gpuCount);
    if (v.ramGiB != null && v.ramGiB >= hostNeed + 8) {
      return {
        kind: 'none',
        text: `Runs with experts in system RAM (~${hostNeed.toFixed(0)} GiB of it). Slower, nothing to buy.`,
        link: '/flash-ram-offload/',
        buttonLabel: 'Flash RAM offload',
      };
    }
    const kit = RAM_KITS.find((k) => k >= hostNeed + 8);
    if (!kit) {
      return {
        kind: 'smaller-quant',
        text: 'Too big even with 256 GB of RAM. Try a smaller quant (Q4 minimum).',
      };
    }
    return {
      kind: 'ram',
      kitGB: kit,
      text: `Needs about ${hostNeed.toFixed(0)} GiB of system RAM for the experts. A ${kit} GB DDR5 kit covers it.`,
      link: `/go/newegg/ddr5-${kit}?src=${VERDICT_ACTION_SRC}`,
      alt: `/go/amazon/ddr5-${kit}?src=${VERDICT_ACTION_SRC}`,
      buttonLabel: `Check ${kit} GB DDR5 at Newegg`,
      altLabel: `Check ${kit} GB DDR5 at Amazon`,
    };
  }

  if (v.totalGiB <= R9700 && v.gpuVramGiB < R9700) {
    return {
      kind: 'gpu',
      text: 'One Radeon AI PRO R9700 (32 GB) holds this. We measured the 35B at 256K on one.',
      link: `/go/newegg/r9700?src=${VERDICT_ACTION_SRC}`,
      alt: `/go/amazon/r9700?src=${VERDICT_ACTION_SRC}`,
      check: '/gpus/r9700/',
      buttonLabel: 'Check Radeon AI PRO R9700 at Newegg',
      altLabel: 'Check Radeon AI PRO R9700 at Amazon',
      checkLabel: 'R9700 measured page',
    };
  }

  if (v.totalGiB <= 2 * R9700) {
    return {
      kind: 'gpu2',
      text: 'Two R9700s (64 GB) hold this.',
      link: `/go/newegg/r9700?src=${VERDICT_ACTION_SRC_2X}`,
      alt: `/go/amazon/r9700?src=${VERDICT_ACTION_SRC_2X}`,
      check: '/gpus/r9700/',
      buttonLabel: 'Check Radeon AI PRO R9700 at Newegg',
      altLabel: 'Check Radeon AI PRO R9700 at Amazon',
      checkLabel: 'R9700 measured page',
    };
  }

  return {
    kind: 'smaller-quant',
    text: 'Too big for VRAM. Try a smaller quant (Q4 minimum) or an MoE model with RAM offload.',
  };
}

export function assertVerdictActionValid(rows: VerdictAction[] = []): string[] {
  const errors: string[] = [];
  const samples: Array<[VerdictActionInput, VerdictActionKind]> = [
    [{ fits: 'tight', gpuVramGiB: 32, gpuCount: 1, totalGiB: 30.7 }, 'none'],
    [{ fits: 'no', gpuVramGiB: 16, gpuCount: 1, totalGiB: 30.7 }, 'gpu'],
    [{ fits: 'no', gpuVramGiB: 24, gpuCount: 1, totalGiB: 30.7 }, 'gpu'],
    [{ fits: 'no', gpuVramGiB: 32, gpuCount: 2, totalGiB: 167.9, offloadOk: true, ramGiB: 32 }, 'ram'],
    [{ fits: 'no', gpuVramGiB: 32, gpuCount: 2, totalGiB: 167.9, offloadOk: true, ramGiB: 249 }, 'none'],
    [{ fits: 'no', gpuVramGiB: 32, gpuCount: 2, totalGiB: 122, offloadOk: true, ramGiB: 32 }, 'ram'],
  ];
  for (const [inp, want] of samples) {
    const got = verdictAction(inp);
    if (got.kind !== want) errors.push(`expected ${want} got ${got.kind} for ${JSON.stringify(inp)}`);
  }
  const ram96 = verdictAction({
    fits: 'no',
    gpuVramGiB: 32,
    gpuCount: 2,
    totalGiB: 122,
    offloadOk: true,
    ramGiB: 32,
  });
  if (ram96.kitGB !== 96) errors.push(`Flash Q4-ish host need should pick 96 GB, got ${ram96.kitGB}`);
  for (const action of [verdictAction({ fits: 'no', gpuVramGiB: 16, gpuCount: 1, totalGiB: 30.7 }), ...rows]) {
    if (action.link?.includes('/go/') && !/src=calc-verdict/.test(action.link)) {
      errors.push(`missing src=calc-verdict on ${action.link}`);
    }
    if (/\$\d|\bMSRP\b|hurry|limited time|act now|buy now/i.test(action.text)) {
      errors.push(`pressure or price in action text: ${action.text}`);
    }
    if (/\bQ[123]\b/.test(action.text) && !/Q4/.test(action.text)) {
      errors.push(`quant below Q4: ${action.text}`);
    }
  }
  return errors;
}
