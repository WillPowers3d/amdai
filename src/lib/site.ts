export const site = {
  name: 'R9700 Lab Notes',
  shortName: 'Lab Notes',
  tagline: 'Local AI on the AMD Radeon AI PRO R9700 — for home labs, not data centers.',
  description:
    'Practical documentation and tutorials for running local LLMs and ROCm tooling on the AMD Radeon AI PRO R9700 and other home-friendly AMD GPUs.',
  officialGpu: 'AMD Radeon AI PRO R9700',
  informalGpu: 'R9700 Pro',
};

export const officialLinks = {
  product:
    'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html',
  rocm: 'https://rocm.docs.amd.com/en/latest/',
  rocmInstall: 'https://rocm.docs.amd.com/en/latest/install/quick-start.html',
  compatibility:
    'https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html',
  radeonRocm: 'https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/',
  pytorch: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/frameworks/pytorch/install.html',
  vllm: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/inference/vllm.html',
  llamaCpp: 'https://github.com/ggml-org/llama.cpp',
  ollama: 'https://ollama.com/',
};

export type NavItem = {
  href: string;
  label: string;
  description: string;
};

export const primaryNav: NavItem[] = [
  { href: '/', label: 'Home', description: 'Why this card, and what the site covers' },
  { href: '/gpus', label: 'AMD GPUs', description: 'R9700 naming, PRO vs consumer vs Instinct' },
  { href: '/rocm', label: 'ROCm', description: 'Linux-first stack, install overview, caveats' },
  { href: '/local-ai', label: 'Local AI', description: 'llama.cpp, Ollama, vLLM, VRAM and power' },
  { href: '/tutorials', label: 'Tutorials', description: 'Starter walkthroughs you can run at home' },
  { href: '/blog', label: 'Blog', description: 'Naming notes, version caveats, deep dives' },
];

export const plannedSections: NavItem[] = [
  { href: '/#planned', label: 'FAQ', description: 'Short answers to recurring setup questions' },
  { href: '/#planned', label: 'Hardware guide', description: 'PSU, cooling, and case notes' },
  { href: '/#planned', label: 'Troubleshooting', description: 'Common ROCm and inference failures' },
];
