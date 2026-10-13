export const GPU_NAME_IDS: Record<string, string> = {
  'AMD Ryzen AI Max+ 395 (Radeon 8060S)': 'strix-halo',
  'AMD Radeon AI PRO R9700': 'r9700',
  'AMD Radeon AI PRO R9700S': 'r9700s',
  'AMD Radeon AI PRO R9600D': 'r9600d',
  'AMD Radeon AI PRO R9600': 'r9600',
  'AMD Radeon RX 9070 XT': 'rx9070xt',
  'AMD Radeon RX 9070 GRE': 'rx9070gre',
  'AMD Radeon RX 9070': 'rx9070',
  'AMD Radeon RX 9060 XT': 'rx9060xt',
  'AMD Radeon RX 9060 XT LP': 'rx9060xt-lp',
  'AMD Radeon RX 9060': 'rx9060',
  'AMD Radeon RX 7900 XTX': 'rx7900xtx',
  'AMD Radeon RX 7900 XT': 'rx7900xt',
  'AMD Radeon RX 7900 GRE': 'rx7900gre',
  'AMD Radeon RX 7800 XT': 'rx7800xt',
  'AMD Radeon RX 7700 XT': 'rx7700xt',
  'AMD Radeon RX 7700': 'rx7700',
  'AMD Radeon RX 7600 XT': 'rx7600xt',
  'AMD Radeon RX 7600': 'rx7600',
  'AMD Radeon RX 6950 XT / 6900 XT': 'rx6950xt',
  'AMD Radeon PRO W7900': 'w7900',
  'AMD Radeon PRO W7800': 'w7800',
  'AMD Radeon PRO W7700': 'w7700',
  'AMD Radeon PRO W6800': 'w6800',
};

export function gpuCardIdFromName(name: string): string {
  return GPU_NAME_IDS[name] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function gpuCardId(card: { name: string }): string {
  return gpuCardIdFromName(card.name);
}

export const MODEL_PAGES = [
  {
    id: 'qwen36',
    name: 'Qwen3.6-35B-A3B',
    official: 'Qwen/Qwen3.6-35B-A3B',
    gguf: 'unsloth/Qwen3.6-35B-A3B-GGUF',
    role: 'Daily driver on one R9700',
    hf: 'https://huggingface.co/Qwen/Qwen3.6-35B-A3B',
  },
  {
    id: 'flash',
    name: 'Qwen 3.8 Flash',
    official: 'Qwen/Qwen3.8-Flash-Next',
    gguf: 'unsloth/Qwen3.8-Flash-Next-GGUF',
    role: 'Fast agent when Strata is up',
    hf: 'https://huggingface.co/Qwen/Qwen3.8-Flash-Next',
  },
] as const;
