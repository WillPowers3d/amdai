export type ForumCategory = {
  slug: string;
  title: string;
  blurb: string;
};

export const forumCategories: ForumCategory[] = [
  { slug: 'getting-started', title: 'Getting Started', blurb: 'First box, first tokens, first weekend.' },
  { slug: 'install-drivers', title: 'Install & Drivers', blurb: 'ROCm packages, amdgpu, KFD, mixed repos.' },
  { slug: 'llamacpp', title: 'llama.cpp', blurb: 'Vulkan and HIP builds, GGUF, llama-server.' },
  { slug: 'strata', title: 'Strata', blurb: 'The fast-agent serve path we measured.' },
  { slug: 'vllm', title: 'vLLM', blurb: 'ROCm wheels, batching, not the house default.' },
  { slug: 'ollama-lm-studio', title: 'Ollama / LM Studio', blurb: 'Wrappers. Check the backend log before you blame RDNA 4.' },
  { slug: 'image-video', title: 'Image & Video Gen', blurb: 'ComfyUI and friends on Radeon. Cite what you ran.' },
  { slug: 'hardware-builds', title: 'Hardware & Builds', blurb: 'PSU, cooling, dual-card, BIOS notes, the R9700 vs 9070 XT.' },
  { slug: 'abliterated', title: 'Abliterated Models', blurb: 'Educational only. Never the default. Q3 is estimate/community; Q1/Q2 stay off.' },
  { slug: 'benchmarks', title: 'Benchmarks', blurb: 'tok/s with model, quant, context, backend, and gfx. No mystery numbers.' },
  { slug: 'show-your-rig', title: 'Show Your Rig', blurb: 'Attach a saved rig. GPU / ROCm / backend on the badge.' },
  { slug: 'site-feedback', title: 'Site Feedback', blurb: 'amdai.net itself — docs, calculator, this forum.' },
];

const bySlug = new Map(forumCategories.map((row) => [row.slug, row]));

export function forumCategory(slug: string): ForumCategory | undefined {
  return bySlug.get(slug);
}

/** Map a cited troubleshooter pattern onto a forum category. */
export function categoryForErrorTags(tags: string[]): string {
  const set = new Set(tags.map((t) => t.toLowerCase()));
  if (set.has('ollama') || set.has('lmstudio')) return 'ollama-lm-studio';
  if (set.has('vllm')) return 'vllm';
  if (set.has('strata')) return 'strata';
  if (set.has('reset') || set.has('hang') || set.has('psu')) return 'hardware-builds';
  if (set.has('hip') || set.has('compile') || set.has('gguf')) return 'llamacpp';
  if (set.has('hsa') || set.has('wheels') || set.has('apt') || set.has('driver')) return 'install-drivers';
  return 'install-drivers';
}

export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 56);
  return slug || 'thread';
}

export function threadPath(slug: string): string {
  return `/forum/t/${slug}`;
}

export function categoryPath(slug: string): string {
  return `/forum/c/${slug}`;
}

export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  const next = value.trim();
  if (!next.startsWith('/')) return null;
  if (next.startsWith('//') || next.includes('\\') || next.includes('://')) return null;
  return next.slice(0, 500);
}
