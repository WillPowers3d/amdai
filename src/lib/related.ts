/**
 * Data-driven “Related” links. Same GPU, model, quant, backend, or topic.
 * Only real routes. No invented tok/s, prices, or /two-r9700.
 */

import { loadBackendsFromFs } from './backends';
import { MODEL_PAGES } from './gpu-ids';
import { GLOSSARY } from './glossary';
import { stepsFor, type PathLink } from './primary-path';
import { liveRecipes, recipesForCard, recipesForModel } from './recipes';
import { recipes } from './recipes-data';
import { CONSUMER_NAV_LINKS } from './consumer-gpu';
import { WORKSTATION_NAV_LINKS } from './workstation-gpu';
import { gpuCompareIdFromInput, gpuCompareLinksFor } from './gpu-compare';
import {
  CAN_RUN_GPU_PATH,
  CAN_RUN_GPU_SHORT,
  CAN_RUN_MODEL_SHORT,
  canRunGpuIdFromInput,
  canRunLinksForGpu,
  canRunLinksForModel,
  canRunModelIdFromInput,
  parseCanRunSlug,
} from './can-run';
import { modelCompareIdFromInput, modelCompareLinksFor } from './model-compare';
import { urlPath } from './seo';

export type RelatedLink = PathLink;

const RELATED_MAX = 48;

const SKIP_RELATED = new Set([
  '/',
  '/404',
  '/search',
  '/login',
  '/unsubscribe',
  '/newsletter/confirm',
]);

function recipeLabel(recipe: { weights: { quant: string }; ctx_label: string }): string {
  return `${recipe.weights.quant} · ${recipe.ctx_label}`;
}

function backendLabel(id: string): string {
  const row = loadBackendsFromFs().find((item) => item.id === id);
  return row?.name ?? id;
}

function add(out: RelatedLink[], seen: Set<string>, href: string, label: string) {
  const clean = urlPath((href.split('#')[0] || href).split('?')[0] || href);
  if (!clean.startsWith('/') || seen.has(clean)) return;
  if (clean === '/two-r9700') return;
  seen.add(clean);
  out.push({ href: clean, label });
}

function topicLinks(path: string): RelatedLink[] {
  if (path === '/compare' || path.startsWith('/compare/')) {
    return [
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/compare/gpus', label: 'Compare GPUs' },
      { href: '/compare/models', label: 'Compare models' },
      { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/results', label: 'Run cards' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/long-context', label: 'Long context' },
    ];
  }
  if (path === '/benchmarks' || path === '/benchmarks/methodology') {
    return [
      { href: '/results', label: 'Run cards' },
      { href: '/compare', label: 'Compare 35B' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/methodology', label: 'How we test' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/long-context', label: 'Long context' },
    ];
  }
  if (
    path === '/setup' ||
    path === '/setup/windows' ||
    path === '/setup/fedora' ||
    path === '/setup/arch' ||
    path === '/setup/docker' ||
    path === '/setup/lm-studio' ||
    path === '/setup/coding-assistant' ||
    path === '/setup/ollama' ||
    path === '/start'
  ) {
    return [
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/faq', label: 'FAQ' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/setup/fedora', label: 'Fedora setup' },
      { href: '/setup/arch', label: 'Arch setup' },
      { href: '/setup/docker', label: 'Docker / Podman' },
      { href: '/setup/lm-studio', label: 'LM Studio' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/setup/ollama', label: 'Ollama' },
      { href: '/image-gen', label: 'Image gen on Radeon' },
      { href: '/vision', label: 'Vision on Radeon' },
      { href: '/speech', label: 'Speech on Radeon' },
      { href: '/long-context', label: 'Long context' },
      { href: '/rag', label: 'RAG on Radeon' },
      { href: '/fine-tuning', label: 'Fine-tuning on Radeon' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/can-run', label: 'Can my Radeon run it?' },
    ];
  }
  if (path === '/can-run' || path.startsWith('/can-run/')) {
    return [
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus', label: 'GPU directory' },
      { href: '/models', label: 'Models' },
      { href: '/compare/gpus', label: 'Compare GPUs' },
      { href: '/compare/models', label: 'Compare models' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ];
  }
  if (path === '/tuning') {
    return [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/long-context', label: 'Long context' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/power', label: 'Power and PSU' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/calculator', label: 'Calculator' },
    ];
  }
  if (path === '/faq' || path === '/glossary') {
    return [
      { href: '/setup', label: 'First-run setup' },
      { href: '/glossary', label: 'Glossary' },
      { href: '/faq', label: 'FAQ' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/rocm/glossary', label: 'ROCm glossary' },
      { href: '/backends', label: 'Backends' },
      { href: '/long-context', label: 'Long context' },
      { href: '/fine-tuning', label: 'Fine-tuning on Radeon' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/can-run', label: 'Can my Radeon run it?' },
    ];
  }
  if (path === '/troubleshoot' || path === '/troubleshooting' || path.startsWith('/troubleshoot/')) {
    return [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/troubleshooting', label: 'Troubleshooting' },
      { href: '/setup', label: 'First-run setup' },
      { href: '/setup/docker', label: 'Docker / Podman' },
      { href: '/setup/lm-studio', label: 'LM Studio' },
      { href: '/setup/ollama', label: 'Ollama' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/bios', label: 'BIOS' },
      { href: '/faq', label: 'FAQ' },
      { href: '/long-context', label: 'Long context' },
    ];
  }
  if (path === '/multi-gpu' || path === '/qwen36-dual') {
    return [
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/power', label: 'Power and PSU' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
      { href: '/flash-daily', label: 'Flash daily' },
      { href: '/setup', label: 'First-run setup' },
      { href: '/long-context', label: 'Long context' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
    ];
  }
  if (path === '/flash-daily' || path === '/flash-ram-offload') {
    return [
      { href: '/models/flash', label: 'Qwen 3.8 Flash' },
      { href: '/backends/strata', label: 'Strata' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/quants', label: 'Quants' },
      { href: '/long-context', label: 'Long context' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
    ];
  }
  if (path === '/fine-tuning') {
    return [
      { href: '/setup', label: 'First-run setup' },
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/rocm/versions', label: 'ROCm versions' },
      { href: '/rocm-problems/rocm-10-0-finetune-reset', label: 'Fine-tune reset' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/quants', label: 'Quants' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/models', label: 'House models' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ];
  }
  if (path.startsWith('/rocm') && !path.startsWith('/rocm-problems')) {
    return [
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/glossary', label: 'Glossary' },
      { href: '/setup', label: 'First-run setup' },
      { href: '/setup/docker', label: 'Docker / Podman' },
      { href: '/setup/lm-studio', label: 'LM Studio' },
      { href: '/setup/ollama', label: 'Ollama' },
      { href: '/fine-tuning', label: 'Fine-tuning on Radeon' },
    ];
  }
  if (path.startsWith('/rocm-problems')) {
    return [
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/setup/ollama', label: 'Ollama' },
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/troubleshooting', label: 'Troubleshooting' },
      { href: '/contact', label: 'Contact' },
    ];
  }
  if (path === '/labs' || path === '/labs/shannon' || path === '/secure-lab' || path === '/autoresearch') {
    return [
      { href: '/labs/shannon', label: 'Shannon’s lab' },
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/secure-lab', label: 'Secure home lab' },
      { href: '/autoresearch', label: 'Autoresearch idea' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/credits', label: 'Credits' },
    ];
  }
  if (path === '/hardware') {
    return [
      { href: '/power', label: 'Power and PSU' },
      { href: '/bios', label: 'BIOS' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/labs/shannon', label: 'Shannon’s lab' },
    ];
  }
  if (path === '/power') {
    return [
      { href: '/hardware', label: 'Hardware' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/budget', label: 'Budget' },
      { href: '/bios', label: 'BIOS' },
      { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/setup', label: 'First-run setup' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
    ];
  }
  if (path === '/long-context') {
    return [
      { href: '/long-context', label: 'Long context' },
      { href: '/compare', label: 'Compare 35B' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
      { href: '/compare/q4-q5-q6', label: 'Q6 vs Q5 vs Q4' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/rag', label: 'RAG on Radeon' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
    ];
  }
  if (path === '/rag') {
    return [
      { href: '/rag', label: 'RAG on Radeon' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/harnesses/anythingllm', label: 'AnythingLLM' },
      { href: '/harnesses/open-webui', label: 'Open WebUI' },
      { href: '/setup', label: 'First-run setup' },
      { href: '/long-context', label: 'Long context' },
      { href: '/speech', label: 'Speech on Radeon' },
      { href: '/image-gen', label: 'Image gen on Radeon' },
      { href: '/vision', label: 'Vision on Radeon' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
    ];
  }
  if (path === '/vision') {
    return [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/image-gen', label: 'Image gen on Radeon' },
      { href: '/setup', label: 'First-run setup' },
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/models', label: 'House models' },
      { href: '/wanted', label: 'Wanted' },
      { href: '/speech', label: 'Speech on Radeon' },
      { href: '/rag', label: 'RAG on Radeon' },
    ];
  }
  if (path === '/speech') {
    return [
      { href: '/speech', label: 'Speech on Radeon' },
      { href: '/image-gen', label: 'Image gen on Radeon' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/setup', label: 'First-run setup' },
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/long-context', label: 'Long context' },
      { href: '/rag', label: 'RAG on Radeon' },
      { href: '/vision', label: 'Vision on Radeon' },
    ];
  }
  if (path === '/image-gen' || path.startsWith('/harnesses')) {
    return [
      { href: '/image-gen', label: 'Image gen on Radeon' },
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/harnesses/image', label: 'ComfyUI harness' },
      { href: '/harnesses/compare', label: 'Compare harnesses' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/setup', label: 'First-run setup' },
      { href: '/setup/lm-studio', label: 'LM Studio' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/setup/ollama', label: 'Ollama' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/speech', label: 'Speech on Radeon' },
      { href: '/vision', label: 'Vision on Radeon' },
      { href: '/long-context', label: 'Long context' },
      { href: '/rag', label: 'RAG on Radeon' },
    ];
  }
  if (path === '/forum' || path.startsWith('/forum/')) {
    return [
      { href: '/forum', label: 'Forum' },
      { href: '/forum/rules', label: 'Forum rules' },
      { href: '/forum/search', label: 'Forum search' },
      { href: '/rocm-problems', label: 'ROCm problems' },
    ];
  }
  if (
    path === '/about' ||
    path === '/methodology' ||
    path === '/contact' ||
    path === '/terms' ||
    path === '/amdai-bench' ||
    path === '/privacy' ||
    path === '/disclosure' ||
    path === '/accessibility' ||
    path === '/credits'
  ) {
    return [
      { href: '/about', label: 'About' },
      { href: '/methodology', label: 'How we test' },
      { href: '/contact', label: 'Contact' },
      { href: '/terms', label: 'Terms' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ];
  }
  return [];
}

export function relatedFor(pathname: string): RelatedLink[] {
  const path = urlPath(pathname);
  if (SKIP_RELATED.has(path)) return [];
  if (path.startsWith('/account') || path.startsWith('/go/') || path.startsWith('/forum/inbox')) return [];
  if (path === '/forum/mod' || path === '/forum/new') return [];

  const seen = new Set<string>([path]);
  const out: RelatedLink[] = [];

  if (path === '/gpus' || path.startsWith('/gpus/')) {
    const id = path === '/gpus' ? '' : path.slice('/gpus/'.length);
    add(out, seen, '/compare', 'Compare 35B');
    add(out, seen, '/compare/gpus', 'Compare GPUs');
    add(out, seen, '/compare/radeon-vs-nvidia', 'Radeon vs NVIDIA');
    add(out, seen, '/benchmarks', 'Benchmarks');
    add(out, seen, '/multi-gpu', 'Dual / multi-GPU');
    add(out, seen, '/setup', 'First-run setup');
    add(out, seen, '/stack-lab', 'Stack Lab');
    add(out, seen, '/gpus/r9700', 'R9700 measured page');
    if (id) {
      const compareId = gpuCompareIdFromInput(id);
      if (compareId) {
        for (const link of gpuCompareLinksFor(compareId).filter((row) => row.featured)) {
          add(out, seen, link.href, `vs ${link.label}`);
        }
      }
      for (const recipe of recipesForCard(recipes, id)) {
        add(out, seen, `/recipes/${recipe.id}`, recipeLabel(recipe));
      }
    }
    add(out, seen, '/gpus/strix-halo', 'Strix Halo');
    for (const link of WORKSTATION_NAV_LINKS) add(out, seen, link.href, link.label);
    for (const link of CONSUMER_NAV_LINKS) add(out, seen, link.href, link.label);
    add(out, seen, '/calculator', 'Calculator');
    add(out, seen, '/budget', 'Budget');
    add(out, seen, '/fine-tuning', 'Fine-tuning on Radeon');
    add(out, seen, '/tuning', 'Speed up llama.cpp');
    add(out, seen, '/can-run', 'Can my Radeon run it?');
    if (id) {
      const canGpu = canRunGpuIdFromInput(id);
      if (canGpu) {
        for (const link of canRunLinksForGpu(canGpu)) add(out, seen, link.href, link.label);
      }
    }
    for (const model of MODEL_PAGES) add(out, seen, `/models/${model.id}`, model.name);
    if (id) {
      add(out, seen, '/results', 'Run cards');
      add(out, seen, '/backends/llamacpp', 'llama.cpp');
      add(out, seen, '/stack-lab', 'Stack Lab');
    }
  }

  if (path.startsWith('/recipes/')) {
    const recipe = liveRecipes(recipes).find((row) => `/recipes/${row.id}` === path);
    if (recipe) {
      add(out, seen, `/gpus/${recipe.card}`, recipe.card);
      const model = MODEL_PAGES.find((row) => row.id === recipe.model_id);
      add(out, seen, `/models/${recipe.model_id}`, model?.name ?? recipe.model);
      add(out, seen, `/backends/${recipe.backend}`, backendLabel(recipe.backend));
      for (const sibling of liveRecipes(recipes)) {
        if (sibling.id === recipe.id) continue;
        if (
          sibling.model_id === recipe.model_id ||
          sibling.backend === recipe.backend ||
          sibling.weights.quant === recipe.weights.quant
        ) {
          add(out, seen, `/recipes/${sibling.id}`, recipeLabel(sibling));
        }
      }
      add(out, seen, '/compare', 'Compare 35B');
      add(out, seen, '/benchmarks', 'Benchmarks');
    }
  }

  if (path === '/models' || path.startsWith('/models/')) {
    const id = path === '/models' ? '' : path.slice('/models/'.length);
    if (id) {
      const model = MODEL_PAGES.find((row) => row.id === id);
      for (const recipe of recipesForModel(recipes, id)) {
        add(out, seen, `/recipes/${recipe.id}`, recipeLabel(recipe));
      }
      add(out, seen, '/qwen', 'Qwen compare');
      if (id === 'flash') add(out, seen, '/flash-daily', 'Flash daily');
      if (id === 'qwen36') add(out, seen, '/qwen36-dual', '35B on two cards');
      add(out, seen, '/compare', 'Compare 35B');
      add(out, seen, '/compare/gpus', 'Compare GPUs');
      add(out, seen, '/compare/models', 'Compare models');
      add(out, seen, '/can-run', 'Can my Radeon run it?');
      if (id) {
        const canModel = canRunModelIdFromInput(id);
        if (canModel) {
          for (const link of canRunLinksForModel(canModel)) add(out, seen, link.href, link.label);
        }
        const compareId = modelCompareIdFromInput(id);
        if (compareId) {
          for (const link of modelCompareLinksFor(compareId).filter((row) => row.featured)) {
            add(out, seen, link.href, `vs ${link.label}`);
          }
        }
      }
      add(out, seen, '/benchmarks', 'Benchmarks');
      add(out, seen, '/calculator', 'Calculator');
      add(out, seen, '/gpus/r9700', 'R9700 measured page');
      add(out, seen, '/long-context', 'Long context');
      add(out, seen, '/gpus/rx-7900-xtx', 'RX 7900 XTX');
      add(out, seen, '/gpus/rx-7900-xt', 'RX 7900 XT');
      add(out, seen, '/gpus/rx-7800-xt', 'RX 7800 XT');
      add(out, seen, '/amdai-bench', 'amdai-bench');
      add(out, seen, '/stack-lab', 'Stack Lab');
      add(out, seen, '/abliterated', 'Abliterated');
      add(out, seen, '/contribute', 'Contribute');
      void model;
    } else {
      for (const model of MODEL_PAGES) add(out, seen, `/models/${model.id}`, model.name);
      add(out, seen, '/qwen', 'Qwen compare');
      add(out, seen, '/contribute', 'Contribute');
      add(out, seen, '/abliterated', 'Abliterated');
    }
  }

  if (path === '/backends' || path.startsWith('/backends/')) {
    const id = path === '/backends' ? '' : path.slice('/backends/'.length);
    add(out, seen, '/backends', 'Backends');
    add(out, seen, '/tuning', 'Speed up llama.cpp');
    add(out, seen, '/setup/docker', 'Docker / Podman');
    add(out, seen, '/setup/lm-studio', 'LM Studio');
    add(out, seen, '/setup/coding-assistant', 'Coding assistant');
    add(out, seen, '/setup/ollama', 'Ollama');
    if (id) {
      for (const recipe of liveRecipes(recipes).filter((row) => row.backend === id)) {
        add(out, seen, `/recipes/${recipe.id}`, recipeLabel(recipe));
      }
      add(out, seen, '/software', 'AI software');
      if (id !== 'llamacpp') add(out, seen, '/backends/llamacpp', 'llama.cpp');
    } else {
      for (const row of loadBackendsFromFs()) add(out, seen, `/backends/${row.id}`, row.name);
    }
  }

  if (path.startsWith('/can-run/')) {
    const parsed = parseCanRunSlug(path.slice('/can-run/'.length));
    if (parsed) {
      add(out, seen, '/can-run', 'Can my Radeon run it?');
      add(out, seen, CAN_RUN_GPU_PATH[parsed.gpuId], CAN_RUN_GPU_SHORT[parsed.gpuId]);
      add(out, seen, `/models/${parsed.modelId}`, CAN_RUN_MODEL_SHORT[parsed.modelId]);
      for (const link of canRunLinksForModel(parsed.modelId)) add(out, seen, link.href, link.label);
      for (const link of canRunLinksForGpu(parsed.gpuId)) add(out, seen, link.href, link.label);
    }
  }

  if (path.startsWith('/results/')) {
    add(out, seen, '/results', 'Run cards');
    add(out, seen, '/benchmarks', 'Benchmarks');
    add(out, seen, '/gpus/r9700', 'R9700 measured page');
    add(out, seen, '/amdai-bench', 'amdai-bench');
  }

  if (path.startsWith('/harnesses/quiz/') && path !== '/harnesses/quiz') {
    add(out, seen, '/harnesses/quiz', 'Harness quiz');
    add(out, seen, '/harnesses', 'Harnesses');
  }

  if (path === '/glossary') {
    for (const entry of GLOSSARY.slice(0, 4)) {
      add(out, seen, `/glossary#${entry.id}`, entry.term);
    }
  }

  for (const link of topicLinks(path)) add(out, seen, link.href, link.label);

  const curated = stepsFor(path);
  if (curated) {
    for (const link of curated) add(out, seen, link.href, link.label);
  }

  return out.slice(0, RELATED_MAX);
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;

export function assertRelatedValid(
  paths: string[] = [
    '/gpus/r9700',
    '/gpus/rx-7900-xtx',
    '/gpus/rx-7900-xt',
    '/gpus/rx-7800-xt',
    '/gpus/rx-9070-xt',
    '/gpus/rx-9070',
    '/gpus/rx-9070-gre',
    '/gpus/rx-9060-xt',
    '/gpus/rx-7900-gre',
    '/gpus/rx-7700-xt',
    '/gpus/rx-7600-xt',
    '/gpus/rx-7600',
    '/gpus/rx-6800-xt',
    '/gpus/rx-6950-xt',
    '/gpus/rx-6700-xt',
    '/gpus/w7900',
    '/gpus/w7800',
    '/gpus/w7700',
    '/gpus/w6800',
    '/compare',
    '/compare/gpus',
    '/compare/models',
    '/compare/radeon-vs-nvidia',
    '/setup',
    '/setup/windows',
    '/setup/fedora',
    '/setup/arch',
    '/setup/docker',
    '/setup/lm-studio',
    '/setup/coding-assistant',
    '/setup/ollama',
    '/faq',
    '/models/qwen36',
    '/models/flash',
    '/models/gpt-oss-20b',
    '/models/gemma3-27b',
    '/models/llama33-70b',
    '/models/glm-53-flash',
    '/models/qwen36-27b',
    '/models/qwen38-27b',
    '/image-gen',
    '/vision',
    '/speech',
    '/long-context',
    '/rag',
    '/power',
    '/fine-tuning',
    '/tuning',
    '/can-run',
    '/hardware',
  ],
): string[] {
  const errors: string[] = [];
  for (const path of paths) {
    const links = relatedFor(path);
    const blob = links.map((link) => `${link.label} ${link.href}`).join('\n');
    if (BANNED.test(blob)) errors.push(`${path}: banned model`);
    if (Q1Q2.test(blob)) errors.push(`${path}: lists Q1/Q2`);
    if (/\$\d|\bMSRP\b/i.test(blob)) errors.push(`${path}: invented price`);
    if (/\/two-r9700/.test(blob)) errors.push(`${path}: invented path`);
    if (links.some((link) => link.href === path)) errors.push(`${path}: self-link`);
  }
  const r9700 = relatedFor('/gpus/r9700').map((link) => link.href);
  for (const href of ['/compare', '/compare/gpus', '/compare/radeon-vs-nvidia', '/benchmarks', '/multi-gpu', '/setup']) {
    if (!r9700.includes(href)) errors.push(`/gpus/r9700 missing ${href}`);
  }
  if (!r9700.some((href) => href.startsWith('/recipes/'))) {
    errors.push('/gpus/r9700 missing recipe links');
  }
  for (const href of ['/gpus/strix-halo', '/gpus/w7900', '/gpus/w7800', '/gpus/w7700', '/gpus/w6800', '/gpus/rx-7900-xtx', '/gpus/rx-7900-xt', '/gpus/rx-7800-xt', '/gpus/rx-9070-xt', '/gpus/rx-9070', '/gpus/rx-9070-gre', '/gpus/rx-9060-xt', '/gpus/rx-7900-gre', '/gpus/rx-7700-xt', '/gpus/rx-7600-xt', '/gpus/rx-7600', '/gpus/rx-6800-xt', '/gpus/rx-6950-xt', '/gpus/rx-6700-xt']) {
    if (!r9700.includes(href)) errors.push(`/gpus/r9700 missing ${href}`);
  }
  const xtx = relatedFor('/gpus/rx-7900-xtx').map((link) => link.href);
  for (const href of ['/gpus/r9700', '/calculator', '/budget', '/setup', '/stack-lab']) {
    if (!xtx.includes(href)) errors.push(`/gpus/rx-7900-xtx missing ${href}`);
  }
  const qwen36 = relatedFor('/models/qwen36').map((link) => link.href);
  for (const href of ['/qwen36-dual', '/compare', '/compare/models', '/benchmarks', '/calculator', '/gpus/r9700']) {
    if (!qwen36.includes(href)) errors.push(`/models/qwen36 missing ${href}`);
  }
  const flash = relatedFor('/models/flash').map((link) => link.href);
  for (const href of ['/flash-daily', '/benchmarks', '/calculator', '/gpus/r9700']) {
    if (!flash.includes(href)) errors.push(`/models/flash missing ${href}`);
  }
  for (const path of [
    '/models/gpt-oss-20b',
    '/models/gemma3-27b',
    '/models/llama33-70b',
    '/models/glm-53-flash',
    '/models/qwen36-27b',
    '/models/qwen38-27b',
  ] as const) {
    const hrefs = relatedFor(path).map((link) => link.href);
    for (const href of ['/calculator', '/gpus/r9700', '/gpus/rx-7900-xtx', '/amdai-bench']) {
      if (!hrefs.includes(href)) errors.push(`${path} missing ${href}`);
    }
  }
  return errors;
}
