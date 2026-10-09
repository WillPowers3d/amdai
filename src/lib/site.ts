export const site = {
  name: 'R9700 Lab Notes',
  shortName: 'Lab Notes',
  tagline: 'Local AI on the AMD Radeon AI PRO R9700 — for home labs, not data centers.',
  description:
    'Living notes for home-lab AMD ROCm: the Radeon AI PRO R9700, inference software, Qwen, and agent harnesses. Versions move weekly — treat pins as dated snapshots.',
  officialGpu: 'AMD Radeon AI PRO R9700',
  informalGpu: 'R9700 Pro',
};

export const officialLinks = {
  product:
    'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html',
  rocm: 'https://rocm.docs.amd.com/en/latest/',
  rocmInstall: 'https://rocm.docs.amd.com/en/latest/install/rocm.html',
  rocm10Notes: 'https://rocm.docs.amd.com/en/docs-10.0.0/about/release-notes.html',
  rocmTransition: 'https://rocm.docs.amd.com/en/docs-10.0.0/about/transition-guide-TheRock.html',
  compatibility:
    'https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html',
  radeonRocm: 'https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/',
  pytorch: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/frameworks/pytorch/install.html',
  vllmAmd: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/inference/vllm.html',
  vllmUpstream: 'https://docs.vllm.ai/en/stable/getting_started/installation/gpu/index.html',
  llamaCpp: 'https://github.com/ggml-org/llama.cpp',
  ollama: 'https://ollama.com/',
  tgiAmd: 'https://huggingface.co/docs/text-generation-inference/en/installation_amd',
  hermes: 'https://hermes-agent.nousresearch.com/',
  hermesLocal: 'https://hermes-agent.nousresearch.com/docs/user-guide/local-models',
  openclaw: 'https://docs.openclaw.ai/',
  openclawGithub: 'https://github.com/openclaw/openclaw',
  qwen: 'https://huggingface.co/Qwen',
};

export type NavItem = {
  href: string;
  label: string;
  description: string;
  group: 'path' | 'stack' | 'practice';
};

export const homeLink: NavItem = {
  href: '/',
  label: 'Home',
  description: 'What works this week and the map of the site',
  group: 'path',
};

export const primaryNav: NavItem[] = [
  { href: '/start', label: 'Getting started', description: 'GPU → ROCm → software → optional harness', group: 'path' },
  { href: '/stack-lab', label: 'Stack Lab', description: 'Ubuntu companion — living catalog, profiles being reworked', group: 'path' },
  { href: '/gpus', label: 'AMD GPUs', description: 'R9700 naming, PRO vs RX vs Instinct', group: 'stack' },
  { href: '/rocm', label: 'ROCm', description: 'What it is, plus short version notes', group: 'stack' },
  { href: '/software', label: 'AI software', description: 'vLLM, llama.cpp, Ollama, TGI — when to pick each', group: 'stack' },
  { href: '/abliterated', label: 'Abliterated', description: 'Refusal removal, Qwen variants, trust notes', group: 'stack' },
  { href: '/harnesses', label: 'Harnesses', description: 'Hermes Agent and OpenClaw above the model', group: 'stack' },
  { href: '/hardware', label: 'Hardware', description: 'PSU, cooling, noise, VRAM vs model size', group: 'stack' },
  { href: '/tutorials', label: 'Tutorials', description: 'Practical how-tos for this stack', group: 'practice' },
  { href: '/troubleshooting', label: 'Troubleshooting', description: 'GPU not seen, wrong wheel, CPU fallback', group: 'practice' },
  { href: '/faq', label: 'FAQ', description: 'Short answers for a first home box', group: 'practice' },
  { href: '/blog', label: 'Blog', description: 'Longer posts and ROCm version notes', group: 'practice' },
];

export const allNav: NavItem[] = [homeLink, ...primaryNav];

export const navGroups: { id: NavItem['group']; label: string }[] = [
  { id: 'path', label: 'Path' },
  { id: 'stack', label: 'Stack' },
  { id: 'practice', label: 'Practice' },
];
