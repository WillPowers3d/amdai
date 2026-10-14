/**
 * First-visit conversion path: landing → setup → measured recipe → cards.
 * Only real routes. No invented tok/s, prices, or /two-r9700.
 */

export type PathLink = { href: string; label: string };

export type PathStep = {
  id: string;
  label: string;
  body: string;
  href: string;
  also?: PathLink[];
};

export const DAILY_RECIPE = '/recipes/qwen36-35b.llamacpp-vulkan.262k';

/** One strip. Check a rig or budget → Ubuntu setup → measured recipe → cards → optional Stack Lab. */
export const PRIMARY_PATH: PathStep[] = [
  {
    id: 'rig',
    label: 'Check my rig',
    body: 'Size the box in the calculator, or pick a budget band. No invented prices.',
    href: '/calculator',
    also: [{ href: '/budget', label: 'Pick a budget' }],
  },
  {
    id: 'setup',
    label: 'First-run setup',
    body: 'Ubuntu 24.04+ is the measured path to the first token. Windows stays honest about limits.',
    href: '/setup',
  },
  {
    id: 'recipe',
    label: 'Measured recipe',
    body: 'The 32 GB R9700 daily driver on llama.cpp, or Flash / two-card pages when that is the job.',
    href: '/gpus/r9700',
    also: [
      { href: DAILY_RECIPE, label: 'Daily-driver recipe' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/flash-daily', label: 'Flash daily' },
      { href: '/qwen36-dual', label: 'Two cards' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
    ],
  },
  {
    id: 'speed',
    label: 'Read the speed',
    body: '33-card 35B llama.cpp matrix and official amdai-bench/run@1 cards. Empty stays not measured.',
    href: '/benchmarks',
    also: [{ href: '/results', label: 'Run cards' }],
  },
  {
    id: 'stack-lab',
    label: 'Optional Stack Lab',
    body: 'Ubuntu companion that records those cards. Packages are not published yet.',
    href: '/stack-lab',
  },
];

export const PINNED_NAV = ['/setup', '/gpus/r9700', '/benchmarks', '/calculator'] as const;

export const NAV_SURFACED = [
  '/setup',
  '/faq',
  '/glossary',
  '/compare',
  '/benchmarks',
  '/results',
  '/gpus/r9700',
  '/stack-lab',
  '/calculator',
  '/budget',
  '/newsletter',
  '/models',
  '/troubleshoot',
] as const;

export const REQUIRED_HOME_START_HREFS = [
  '/calculator',
  '/budget',
  '/setup',
  '/gpus/r9700',
  DAILY_RECIPE,
  '/qwen',
  '/flash-daily',
  '/qwen36-dual',
  '/benchmarks',
  '/results',
  '/stack-lab',
  '/faq',
  '/glossary',
  '/compare',
  '/troubleshoot',
] as const;

const NEXT_STEPS: Record<string, PathLink[]> = {
  '/': [
    { href: '/start', label: 'Getting started' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/faq', label: 'FAQ' },
    { href: '/troubleshoot', label: 'Troubleshoot' },
  ],
  '/start': [
    { href: '/setup', label: 'First-run setup' },
    { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: 'Daily-driver recipe' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/newsletter', label: 'Digest' },
    { href: '/troubleshoot', label: 'Troubleshoot' },
  ],
  '/setup': [
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: DAILY_RECIPE, label: 'Daily-driver recipe' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/stack-lab', label: 'Stack Lab' },
    { href: '/start', label: 'Getting started' },
    { href: '/setup/windows', label: 'Windows setup' },
  ],
  '/setup/windows': [
    { href: '/setup', label: 'First-run setup' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/backends/llamacpp', label: 'llama.cpp' },
    { href: '/troubleshoot', label: 'Troubleshoot' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/faq': [
    { href: '/start', label: 'Getting started' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/glossary', label: 'Glossary' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare', label: 'Compare 35B' },
    { href: '/about', label: 'About' },
    { href: '/disclosure', label: 'Affiliate disclosure' },
  ],
  '/gpus/r9700': [
    { href: '/compare/gpus', label: 'Compare GPUs' },
    { href: '/setup', label: 'First-run setup' },
    { href: DAILY_RECIPE, label: 'Daily-driver recipe' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/compare', label: 'Compare 35B' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/gpus/strix-halo': [
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/compare/gpus', label: 'Compare GPUs' },
    { href: '/compare', label: 'Compare 35B' },
    { href: '/bios', label: 'BIOS' },
    { href: '/rocm-problems/strix-halo-mes-remove-queue', label: 'MES hang' },
  ],
  '/gpus/rx-7900-xtx': [
    { href: '/compare/gpus', label: 'Compare GPUs' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/budget', label: 'Budget' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/gpus/rx-7900-xt', label: 'RX 7900 XT sheet' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/gpus/rx-7900-xt': [
    { href: '/compare/gpus', label: 'Compare GPUs' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/budget', label: 'Budget' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX sheet' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/gpus/rx-7800-xt': [
    { href: '/compare/gpus', label: 'Compare GPUs' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/budget', label: 'Budget' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/gpus/rx-7700-xt', label: 'RX 7700 XT sheet' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/gpus/rx-9070-xt': [
    { href: '/compare/gpus', label: 'Compare GPUs' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/stack-lab', label: 'Stack Lab' },
    { href: '/faq', label: 'FAQ' },
  ],
  '/gpus/rx-9060-xt': [
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT sheet' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/gpus/rx-7900-gre': [
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/rx-7900-xt', label: 'RX 7900 XT sheet' },
    { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT sheet' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/setup', label: 'First-run setup' },
  ],
  '/gpus/rx-7700-xt': [
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT sheet' },
    { href: '/gpus/rx-7900-gre', label: 'RX 7900 GRE sheet' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/setup', label: 'First-run setup' },
  ],
  '/gpus/rx-7600-xt': [
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT sheet' },
    { href: '/gpus/rx-7700-xt', label: 'RX 7700 XT sheet' },
    { href: '/gpus/rx-7600', label: 'RX 7600 (8 GB)' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
  ],
  '/gpus/rx-7600': [
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/rx-7600-xt', label: 'RX 7600 XT sheet' },
    { href: '/gpus/rx-7700-xt', label: 'RX 7700 XT sheet' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/setup', label: 'First-run setup' },
  ],
  '/gpus/rx-6800-xt': [
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT sheet' },
    { href: '/gpus/rx-7600-xt', label: 'RX 7600 XT sheet' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/setup', label: 'First-run setup' },
  ],
  '/gpus/rx-6700-xt': [
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT sheet' },
    { href: '/gpus/rx-7700-xt', label: 'RX 7700 XT sheet' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/setup', label: 'First-run setup' },
  ],
  '/gpus/w7900': [
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/w7800', label: 'PRO W7800 sheet' },
    { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX sheet' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/gpus', label: 'Compare GPUs' },
    { href: '/setup', label: 'First-run setup' },
  ],
  '/gpus/w7800': [
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/w7900', label: 'PRO W7900 sheet' },
    { href: '/gpus/w7700', label: 'PRO W7700 sheet' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/gpus', label: 'Compare GPUs' },
    { href: '/setup', label: 'First-run setup' },
  ],
  '/gpus/w7700': [
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/w7800', label: 'PRO W7800 sheet' },
    { href: '/gpus/rx-7700-xt', label: 'RX 7700 XT sheet' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/gpus', label: 'Compare GPUs' },
    { href: '/setup', label: 'First-run setup' },
  ],
  '/gpus/w6800': [
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus/w7800', label: 'PRO W7800 sheet' },
    { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT sheet' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/gpus', label: 'Compare GPUs' },
    { href: '/setup', label: 'First-run setup' },
  ],
  '/multi-gpu': [
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/qwen36-dual', label: '35B on two cards' },
    { href: '/flash-daily', label: 'Flash daily' },
    { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
    { href: '/setup', label: 'First-run setup' },
  ],
  '/benchmarks': [
    { href: '/results', label: 'Run cards' },
    { href: '/compare', label: 'Compare 35B' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/compare': [
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/gpus', label: 'Compare GPUs' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/results', label: 'Run cards' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/glossary', label: 'Glossary' },
  ],
  '/compare/gpus': [
    { href: '/compare', label: 'Compare 35B' },
    { href: '/compare/r9700-vs-rx-9070-xt', label: 'R9700 vs 9070 XT' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/compare/models', label: 'Compare models' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/gpus', label: 'GPU directory' },
  ],
  '/compare/models': [
    { href: '/compare/models/qwen36-vs-glm-53-flash', label: 'Qwen3.6-35B vs GLM 5.3 Flash' },
    { href: '/compare/models/qwen36-vs-flash', label: '35B vs Flash' },
    { href: '/models', label: 'Models' },
    { href: '/compare/gpus', label: 'Compare GPUs' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/calculator', label: 'Calculator' },
  ],
  '/compare/radeon-vs-nvidia': [
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare', label: 'Compare 35B' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/budget', label: 'Budget' },
    { href: '/faq', label: 'FAQ' },
  ],
  '/stack-lab': [
    { href: '/setup', label: 'First-run setup' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/results', label: 'Run cards' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/contribute', label: 'Contribute a card' },
  ],
  '/about': [
    { href: '/methodology', label: 'How we test' },
    { href: '/results', label: 'Run cards' },
    { href: '/disclosure', label: 'Affiliate disclosure' },
    { href: '/credits', label: 'Credits' },
    { href: '/contact', label: 'Contact' },
  ],
  '/methodology': [
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/results', label: 'Run cards' },
    { href: '/amdai-bench', label: 'amdai-bench' },
    { href: '/contribute', label: 'Contribute' },
    { href: '/about', label: 'About' },
  ],
  '/contact': [
    { href: '/contribute', label: 'Contribute' },
    { href: '/rocm-problems', label: 'ROCm problems' },
    { href: '/about', label: 'About' },
    { href: '/accessibility', label: 'Accessibility' },
    { href: '/methodology', label: 'How we test' },
  ],
  '/terms': [
    { href: '/disclosure', label: 'Affiliate disclosure' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/methodology', label: 'How we test' },
  ],
  '/amdai-bench': [
    { href: '/methodology', label: 'How we test' },
    { href: '/results', label: 'Run cards' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/contribute', label: 'Contribute' },
    { href: '/about', label: 'About' },
  ],
  '/models': [
    { href: '/models/qwen36', label: 'Qwen3.6-35B-A3B' },
    { href: '/models/flash', label: 'Qwen 3.8 Flash' },
    { href: '/models/gpt-oss-20b', label: 'gpt-oss 20B' },
    { href: '/models/gemma3-27b', label: 'Gemma 3 27B' },
    { href: '/models/llama33-70b', label: 'Llama 3.3 70B' },
    { href: '/models/glm-53-flash', label: 'GLM 5.3 Flash' },
    { href: '/models/qwen36-27b', label: 'Qwen3.6 27B' },
    { href: '/models/qwen38-27b', label: 'Qwen3.8 27B' },
    { href: '/qwen', label: 'Qwen compare' },
    { href: '/compare/models', label: 'Compare models' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/contribute', label: 'Contribute' },
  ],
  '/models/qwen36': [
    { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: 'Daily-driver recipe' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/qwen36-dual', label: '35B on two cards' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/models/flash': [
    { href: '/flash-daily', label: 'Flash daily' },
    { href: '/backends/strata', label: 'Strata' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/models/gpt-oss-20b': [
    { href: '/calculator?model=gpt-oss-20b', label: 'Calculator' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
    { href: '/amdai-bench', label: 'amdai-bench' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/models/gemma3-27b': [
    { href: '/calculator?model=gemma3-27b', label: 'Calculator' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
    { href: '/amdai-bench', label: 'amdai-bench' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/models/llama33-70b': [
    { href: '/calculator?model=llama33-70b', label: 'Calculator' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
    { href: '/amdai-bench', label: 'amdai-bench' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/models/glm-53-flash': [
    { href: '/calculator?model=glm-53-flash', label: 'Calculator' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
    { href: '/amdai-bench', label: 'amdai-bench' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/models/qwen36-27b': [
    { href: '/calculator?model=qwen36-27b', label: 'Calculator' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
    { href: '/qwen', label: 'Qwen compare' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/models/qwen38-27b': [
    { href: '/calculator?model=qwen38-27b', label: 'Calculator' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
    { href: '/qwen', label: 'Qwen compare' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/troubleshoot': [
    { href: '/troubleshoot/errors', label: 'Error paste' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/rocm-problems', label: 'ROCm problems' },
    { href: '/bios', label: 'BIOS' },
    { href: '/faq', label: 'FAQ' },
  ],
  '/image-gen': [
    { href: '/harnesses/image', label: 'ComfyUI harness' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/multi-gpu', label: 'Dual / multi-GPU' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/troubleshoot', label: 'Troubleshoot' },
    { href: '/vision', label: 'Vision' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/vision': [
    { href: '/setup', label: 'First-run setup' },
    { href: '/backends/llamacpp', label: 'llama.cpp' },
    { href: '/image-gen', label: 'Image gen' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/models', label: 'House models' },
    { href: '/wanted', label: 'Wanted' },
    { href: '/speech', label: 'Speech' },
  ],
  '/speech': [
    { href: '/setup', label: 'First-run setup' },
    { href: '/setup/windows', label: 'Windows setup' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/backends/llamacpp', label: 'llama.cpp' },
    { href: '/image-gen', label: 'Image gen' },
    { href: '/vision', label: 'Vision' },
    { href: '/multi-gpu', label: 'Dual / multi-GPU' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/long-context': [
    { href: '/calculator', label: 'Calculator' },
    { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
    { href: '/compare/q4-q5-q6', label: 'Q6 vs Q5 vs Q4' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/multi-gpu', label: 'Dual / multi-GPU' },
    { href: '/flash-ram-offload', label: 'Flash RAM offload' },
    { href: '/troubleshoot#oom-context', label: 'Long-context OOM' },
    { href: '/benchmarks', label: 'Benchmarks' },
  ],
  '/rag': [
    { href: '/setup', label: 'First-run setup' },
    { href: '/backends/llamacpp', label: 'llama.cpp' },
    { href: '/harnesses', label: 'Harnesses' },
    { href: '/long-context', label: 'Long context' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/speech', label: 'Speech' },
    { href: '/vision', label: 'Vision' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/power': [
    { href: '/hardware', label: 'Hardware' },
    { href: '/multi-gpu', label: 'Dual / multi-GPU' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/budget', label: 'Budget' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    { href: '/flash-ram-offload', label: 'Flash RAM offload' },
  ],
  '/fine-tuning': [
    { href: '/setup', label: 'First-run setup' },
    { href: '/setup/windows', label: 'Windows setup' },
    { href: '/rocm/versions', label: 'ROCm versions' },
    { href: '/rocm-problems/rocm-10-0-finetune-reset', label: 'Fine-tune reset' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/quants', label: 'Quants' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/models', label: 'House models' },
    { href: '/amdai-bench', label: 'amdai-bench' },
  ],
};

export const HIGH_TRAFFIC_PATHS = Object.keys(NEXT_STEPS);

export function nextStepsFor(pathname: string): PathLink[] {
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '') || '/';
  if (NEXT_STEPS[path]) return NEXT_STEPS[path]!;
  if (path.startsWith('/compare/models')) return NEXT_STEPS['/compare/models']!;
  if (path.startsWith('/compare/') && path.includes('-vs-')) return NEXT_STEPS['/compare/gpus']!;
  return NEXT_STEPS['/']!;
}

/** Curated next-step list for a path, or undefined — never falls back to the homepage list. */
export function stepsFor(pathname: string): PathLink[] | undefined {
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '') || '/';
  return NEXT_STEPS[path];
}

export function primaryPathHrefs(): string[] {
  const hrefs = new Set<string>();
  for (const step of PRIMARY_PATH) {
    hrefs.add(step.href);
    for (const link of step.also ?? []) hrefs.add(link.href);
  }
  return [...hrefs];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');
const INVENTED = /\/two-r9700|\/recipes\/?["'\s]|coming soon|upcoming/i;

export function assertPrimaryPathValid(): string[] {
  const errors: string[] = [];
  const blob = [
    ...PRIMARY_PATH.map((step) => `${step.label} ${step.body} ${step.href}`),
    ...Object.values(NEXT_STEPS).flatMap((list) => list.map((link) => `${link.label} ${link.href}`)),
  ].join('\n');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('lists Q1/Q2');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (INVENTED.test(blob)) errors.push('invented or stale path');
  const known = new Set([
    ...primaryPathHrefs(),
    ...Object.values(NEXT_STEPS).flatMap((list) => list.map((link) => link.href)),
  ]);
  for (const href of REQUIRED_HOME_START_HREFS) {
    if (!known.has(href)) errors.push(`primary path missing ${href}`);
  }
  for (const href of NAV_SURFACED) {
    if (!href.startsWith('/')) errors.push(`nav surface ${href} is not a path`);
  }
  if (!PRIMARY_PATH.some((step) => step.href === '/setup')) errors.push('path missing setup');
  if (!PRIMARY_PATH.some((step) => step.href === '/gpus/r9700')) errors.push('path missing r9700');
  if (!PRIMARY_PATH.some((step) => step.href === '/stack-lab')) errors.push('path missing Stack Lab');
  if (!PRIMARY_PATH.some((step) => /not published yet/i.test(step.body))) {
    errors.push('Stack Lab must stay unpublished');
  }
  return [...new Set(errors)];
}
