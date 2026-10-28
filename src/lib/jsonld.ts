/**
 * schema.org JSON-LD builders. Numbers and dates come from existing data only.
 * Never emit AggregateRating, Review, Offer, or price fields.
 */

import { GLOSSARY } from './glossary';
import { FAQ_ITEMS } from './faq';
import { SETUP_HOWTO_STEPS, SETUP_PUBLISHED } from './setup';
import { SETUP_WINDOWS_HOWTO_STEPS, SETUP_WINDOWS_PUBLISHED } from './setup-windows';
import { SETUP_FEDORA_HOWTO_STEPS, SETUP_FEDORA_PUBLISHED } from './setup-fedora';
import { SETUP_ARCH_HOWTO_STEPS, SETUP_ARCH_PUBLISHED } from './setup-arch';
import { SETUP_DOCKER_HOWTO_STEPS, SETUP_DOCKER_PUBLISHED } from './setup-docker';
import { SETUP_LM_STUDIO_HOWTO_STEPS, SETUP_LM_STUDIO_PUBLISHED } from './setup-lm-studio';
import { SETUP_CODING_HOWTO_STEPS, SETUP_CODING_PUBLISHED } from './setup-coding-assistant';
import { SETUP_OLLAMA_HOWTO_STEPS, SETUP_OLLAMA_PUBLISHED } from './setup-ollama';
import { SETUP_LEMONADE_HOWTO_STEPS, SETUP_LEMONADE_PUBLISHED } from './setup-lemonade';
import { SETUP_OPEN_WEBUI_HOWTO_STEPS, SETUP_OPEN_WEBUI_PUBLISHED } from './setup-open-webui';
import { SETUP_WSL_HOWTO_STEPS, SETUP_WSL_PUBLISHED } from './setup-wsl';
import { SETUP_COMFYUI_HOWTO_STEPS, SETUP_COMFYUI_PUBLISHED } from './setup-comfyui';
import { SETUP_MULTI_GPU_HOWTO_STEPS, SETUP_MULTI_GPU_PUBLISHED } from './setup-multi-gpu';
import { SETUP_SERVER_FAQ, SETUP_SERVER_HOWTO_STEPS, SETUP_SERVER_PUBLISHED } from './setup-server';
import { BUYING_USED_FAQ, BUYING_USED_HOWTO_STEPS, BUYING_USED_PUBLISHED } from './buying-used-radeon';
import { QUANTIZE_GGUF_FAQ, QUANTIZE_GGUF_HOWTO_STEPS, QUANTIZE_GGUF_PUBLISHED } from './quantize-gguf';
import { IMAGE_GEN_HOWTO_STEPS, IMAGE_GEN_PUBLISHED } from './image-gen';
import { SPEECH_HOWTO_STEPS, SPEECH_PUBLISHED } from './speech';
import { LONG_CONTEXT_FAQ, LONG_CONTEXT_PUBLISHED } from './long-context';
import { CX_FAQ, CX_HOWTO_STEPS, CX_PUBLISHED } from './context-ceiling';
import { KV_CACHE_FAQ, KV_CACHE_HOWTO_STEPS, KV_CACHE_PUBLISHED } from './kv-cache';
import { RAG_FAQ, RAG_HOWTO_STEPS, RAG_PUBLISHED } from './rag';
import { POWER_FAQ, POWER_HOWTO_STEPS, POWER_PUBLISHED } from './power';
import { VISION_FAQ, VISION_HOWTO_STEPS, VISION_PUBLISHED } from './vision';
import { FINE_TUNING_FAQ, FINE_TUNING_HOWTO_STEPS, FINE_TUNING_PUBLISHED } from './fine-tuning';
import { TUNING_FAQ, TUNING_HOWTO_STEPS, TUNING_PUBLISHED } from './tuning';
import { SPEC_FAQ, SPEC_HOWTO_STEPS, SPEC_PUBLISHED } from './speculative-decoding';
import { CD_FAQ, CD_HOWTO_STEPS, CD_PUBLISHED } from './constrained-decoding';
import { TC_FAQ, TC_HOWTO_STEPS, TC_PUBLISHED } from './tool-calling';
import { THINK_FAQ, THINK_HOWTO_STEPS, THINK_PUBLISHED } from './thinking';
import { SAM_FAQ, SAM_HOWTO_STEPS, SAM_PUBLISHED } from './sampling';
import { CT_FAQ, CT_HOWTO_STEPS, CT_PUBLISHED } from './chat-templates';
import { NP_FAQ, NP_HOWTO_STEPS, NP_PUBLISHED } from './concurrency-ab';
import { FA_FAQ, FA_HOWTO_STEPS, FA_PUBLISHED } from './flash-attention';
import { PP_FAQ, PP_HOWTO_STEPS, PP_PUBLISHED } from './prefill';
import { PC_FAQ, PC_HOWTO_STEPS, PC_PUBLISHED } from './prompt-cache';
import { OOM_FAQ, OOM_HOWTO_STEPS, OOM_PUBLISHED } from './out-of-vram';
import { MM_FAQ, MM_HOWTO_STEPS, MM_PUBLISHED } from './mmap';
import { MOE_FAQ, MOE_HOWTO_STEPS, MOE_PUBLISHED } from './moe';
import { VULKAN_VS_ROCM_FAQ, VULKAN_VS_ROCM_HOWTO_STEPS, VULKAN_VS_ROCM_PUBLISHED } from './vulkan-vs-rocm';
import { ROCM_UPGRADE_FAQ, ROCM_UPGRADE_HOWTO_STEPS, ROCM_UPGRADE_PUBLISHED } from './rocm-upgrade';
import { CAN_RUN_HUB_FAQ, CAN_RUN_PUBLISHED, canRunPairPage, parseCanRunSlug } from './can-run';
import {
  TROUBLESHOOT_HOWTO_STEPS,
  TROUBLESHOOT_PUBLISHED,
  troubleshootFaqItems,
} from './troubleshoot';
import { ROCM_FAQ_ALL } from './rocm-faq';
import { ROCM_GLOSSARY } from './rocm-glossary';
import {
  articleDates,
  breadcrumbsFor,
  canonicalUrl,
  DATASET_CREATOR,
  DATASET_LICENSE,
  datasetCoverage,
  SEARCH_ACTION_TEMPLATE,
  SITE_ORIGIN,
  urlPath,
  type Crumb,
} from './seo';
import { BRAND } from './site';
import { RUN_SCHEMA } from './run-card';
import { TRUST_PUBLISHED } from './trust';
import { runs } from './run-card-data';
import {
  NEW_MODELS_MEASUREMENT,
  NEW_MODELS_TITLE,
  loadNewModelsFile,
  temporalCoverage,
} from './new-models';
import { LAB_LOG_PUBLISHED, LAB_LOG_TITLE, labLogAsOfDay, loadLabLogFile } from './lab-log';
import { parseBios, type BiosFile } from './bios';
import { parse } from 'yaml';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCHEMA = 'https://schema.org';
export const FORBIDDEN_JSONLD_KEYS = [
  'aggregateRating',
  'review',
  'offers',
  'price',
  'priceCurrency',
  'ratingValue',
  'reviewRating',
  'bestRating',
  'worstRating',
] as const;

export type JsonLd = Record<string, unknown>;

export function websiteJsonLd(): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_ORIGIN}/#website`,
    name: BRAND,
    url: SITE_ORIGIN,
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: SEARCH_ACTION_TEMPLATE,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationJsonLd(): JsonLd {
  return {
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}/#organization`,
    name: BRAND,
    url: SITE_ORIGIN,
    description: 'Independent consumer notes for local AI on AMD Radeon. Not affiliated with AMD.',
  };
}

export function webPageJsonLd(input: {
  name: string;
  description: string;
  url: string;
  published?: string;
  modified?: string;
}): JsonLd {
  const node: JsonLd = {
    '@type': 'WebPage',
    name: input.name,
    description: input.description,
    url: input.url,
    isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
  };
  if (input.published) node.datePublished = input.published;
  if (input.modified) node.dateModified = input.modified;
  return node;
}

/** Fail closed if any node is a schema.org Person. */
export function personJsonLdHits(value: unknown): string[] {
  const hits: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    const rec = node as Record<string, unknown>;
    const raw = rec['@type'];
    const types = Array.isArray(raw) ? raw.map(String) : raw ? [String(raw)] : [];
    if (types.includes('Person')) hits.push('Person');
    for (const child of Object.values(rec)) walk(child);
  };
  walk(value);
  return hits;
}

export function aboutPageJsonLd(input: {
  name: string;
  description: string;
  url: string;
  published: string;
  modified: string;
}): JsonLd {
  return {
    '@type': 'AboutPage',
    name: input.name,
    description: input.description,
    url: input.url,
    datePublished: input.published,
    dateModified: input.modified,
    about: { '@id': `${SITE_ORIGIN}/#organization` },
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    author: { '@id': `${SITE_ORIGIN}/#organization` },
  };
}

export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: canonicalUrl(crumb.href),
    })),
  };
}

export function faqPageJsonLd(items: { question: string; answer: string; links?: { href: string; label: string }[] }[], pageUrl: string): JsonLd {
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    url: pageUrl,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.links?.length
          ? `${item.answer} See ${item.links.map((link) => link.label).join(', ')}.`
          : item.answer,
      },
    })),
  };
}

export function definedTermSetJsonLd(
  name: string,
  terms: { term: string; definition: string }[],
  pageUrl: string,
): JsonLd {
  return {
    '@type': 'DefinedTermSet',
    name,
    url: pageUrl,
    hasDefinedTerm: terms.map((term) => ({
      '@type': 'DefinedTerm',
      name: term.term,
      description: term.definition,
      inDefinedTermSet: pageUrl,
    })),
  };
}

export function techArticleJsonLd(input: {
  headline: string;
  description: string;
  url: string;
  published: string;
  modified: string;
}): JsonLd {
  return {
    '@type': 'TechArticle',
    headline: input.headline,
    description: input.description,
    url: input.url,
    datePublished: input.published,
    dateModified: input.modified,
    author: { '@id': `${SITE_ORIGIN}/#organization` },
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
  };
}

export function softwareApplicationJsonLd(input: {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
}): JsonLd {
  return {
    '@type': 'SoftwareApplication',
    name: input.name,
    description: input.description,
    url: input.url,
    applicationCategory: input.applicationCategory,
    operatingSystem: input.operatingSystem,
    author: { '@id': `${SITE_ORIGIN}/#organization` },
  };
}

export function howToJsonLd(input: {
  name: string;
  description: string;
  url: string;
  published: string;
  modified: string;
  steps: { name: string; text: string }[];
}): JsonLd {
  return {
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    url: input.url,
    datePublished: input.published,
    dateModified: input.modified,
    step: input.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function datasetJsonLd(pageUrl: string, name: string, description: string): JsonLd {
  const coverage = datasetCoverage(runs);
  const temporalCoverage = coverage ? `${coverage.start}/${coverage.end}` : undefined;
  const node: JsonLd = {
    '@type': 'Dataset',
    name,
    description,
    url: pageUrl,
    creator: {
      '@type': 'Organization',
      name: DATASET_CREATOR.name,
      '@id': `${SITE_ORIGIN}/#organization`,
    },
    license: DATASET_LICENSE,
    measurementTechnique: `llama.cpp llama-bench recorded as ${RUN_SCHEMA} on AMD Radeon AI PRO R9700 at the local desktop`,
    variableMeasured: ['decode tokens per second', 'prefill tokens per second', 'peak VRAM GB', 'peak system RAM GB'],
    isAccessibleForFree: true,
  };
  if (temporalCoverage) node.temporalCoverage = temporalCoverage;
  return node;
}

function markdownHowToSteps(file: string): { name: string; text: string }[] {
  if (!existsSync(file)) return [];
  const body = readFileSync(file, 'utf8').replace(/^---[\s\S]*?---\n/, '');
  const parts = body.split(/^##\s+(.+)$/m);
  const steps: { name: string; text: string }[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const name = (parts[i] ?? '').trim();
    const text = (parts[i + 1] ?? '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`#]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 320);
    if (name && text) steps.push({ name, text });
  }
  return steps;
}

function firstExisting(candidates: string[]): string {
  for (const file of candidates) {
    if (existsSync(file)) return file;
  }
  throw new Error(`missing ${candidates[0]}`);
}

function loadBios(): BiosFile {
  const here = dirname(fileURLToPath(import.meta.url));
  const file = firstExisting([
    join(process.cwd(), 'src/data/bios.yaml'),
    join(here, '../data/bios.yaml'),
    join(here, '../../src/data/bios.yaml'),
  ]);
  return parseBios(parse(readFileSync(file, 'utf8')));
}

function biosHowToSteps(): { name: string; text: string }[] {
  return loadBios().settings.map((setting) => ({
    name: setting.title,
    text: setting.summary,
  }));
}

function installRocmFile(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return firstExisting([
    join(process.cwd(), 'src/content/tutorials/install-rocm.mdx'),
    join(here, '../content/tutorials/install-rocm.mdx'),
    join(here, '../../src/content/tutorials/install-rocm.mdx'),
  ]);
}

export function pageJsonLd(input: {
  pathname: string;
  title: string;
  description: string;
}): JsonLd[] {
  const path = urlPath(input.pathname);
  const url = canonicalUrl(path);
  const nodes: JsonLd[] = [websiteJsonLd(), organizationJsonLd()];

  if (path !== '/') {
    const crumbs = breadcrumbsFor(path);
    if (crumbs.length >= 2) nodes.push(breadcrumbJsonLd(crumbs));
  }

  if (path === '/faq') {
    nodes.push(faqPageJsonLd(FAQ_ITEMS, url));
    return nodes;
  }
  if (path === '/troubleshoot') {
    const dates = articleDates(path);
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? TROUBLESHOOT_PUBLISHED,
        modified: dates?.modified ?? TROUBLESHOOT_PUBLISHED,
        steps: TROUBLESHOOT_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(troubleshootFaqItems(), url));
    return nodes;
  }
  if (path === '/rocm/faq') {
    nodes.push(faqPageJsonLd(ROCM_FAQ_ALL, url));
    return nodes;
  }
  if (path === '/glossary') {
    nodes.push(
      definedTermSetJsonLd(
        `${BRAND} glossary`,
        GLOSSARY.map((entry) => ({ term: entry.term, definition: entry.definition })),
        url,
      ),
    );
    return nodes;
  }
  if (path === '/rocm/glossary') {
    nodes.push(
      definedTermSetJsonLd(
        `${BRAND} ROCm glossary`,
        ROCM_GLOSSARY.map((entry) => ({ term: entry.term, definition: entry.definition })),
        url,
      ),
    );
    return nodes;
  }
  if (path === '/results' || path === '/benchmarks') {
    nodes.push(
      datasetJsonLd(
        url,
        path === '/results' ? `${BRAND} amdai-bench/run@1 cards` : `${BRAND} R9700 benchmark set`,
        input.description,
      ),
    );
    return nodes;
  }
  if (path === '/new-models') {
    const file = loadNewModelsFile();
    nodes.push({
      '@type': 'Dataset',
      name: `${BRAND} ${NEW_MODELS_TITLE}`,
      description: input.description,
      url,
      creator: {
        '@type': 'Organization',
        name: DATASET_CREATOR.name,
        '@id': `${SITE_ORIGIN}/#organization`,
      },
      license: DATASET_LICENSE,
      measurementTechnique: NEW_MODELS_MEASUREMENT,
      temporalCoverage: temporalCoverage(file),
      variableMeasured: ['parameter count', 'context length', 'Q4_K_M GiB estimate', 'GGUF quant availability'],
      isAccessibleForFree: true,
    });
    return nodes;
  }
  if (path === '/lab-log') {
    const dates = articleDates(path);
    const file = loadLabLogFile();
    const modified = dates?.modified ?? labLogAsOfDay(file);
    const published = dates?.published ?? LAB_LOG_PUBLISHED;
    nodes.push({
      ...webPageJsonLd({
        name: `${BRAND} ${LAB_LOG_TITLE}`,
        description: input.description,
        url,
        published,
        modified,
      }),
      '@type': 'CollectionPage',
      isAccessibleForFree: true,
    });
    nodes.push({
      '@type': 'Dataset',
      name: `${BRAND} ${LAB_LOG_TITLE}`,
      description: input.description,
      url,
      creator: {
        '@type': 'Organization',
        name: DATASET_CREATOR.name,
        '@id': `${SITE_ORIGIN}/#organization`,
      },
      license: DATASET_LICENSE,
      measurementTechnique: 'Cited public sources and amdai-bench/run@1 cards recorded on AMD Radeon AI PRO R9700 at the local desktop',
      temporalCoverage: `${published}/${modified}`,
      variableMeasured: ['decode tokens per second', 'prefill tokens per second', 'peak VRAM GB'],
      isAccessibleForFree: true,
    });
    return nodes;
  }
  if (path === '/recipes') {
    const dates = articleDates(path);
    nodes.push({
      ...webPageJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published,
        modified: dates?.modified,
      }),
      '@type': 'CollectionPage',
      isAccessibleForFree: true,
    });
    return nodes;
  }

  const dates = articleDates(path);
  if (path === '/about') {
    nodes.push(
      aboutPageJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? TRUST_PUBLISHED,
        modified: dates?.modified ?? TRUST_PUBLISHED,
      }),
    );
    return nodes;
  }
  if (path === '/stack-lab') {
    nodes.push(
      softwareApplicationJsonLd({
        name: 'Radeon Stack Lab',
        description: input.description,
        url,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Linux',
      }),
    );
    return nodes;
  }
  if (path === '/setup') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_PUBLISHED,
        modified: dates?.modified ?? SETUP_PUBLISHED,
        steps: SETUP_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/setup/windows') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_WINDOWS_PUBLISHED,
        modified: dates?.modified ?? SETUP_WINDOWS_PUBLISHED,
        steps: SETUP_WINDOWS_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/setup/fedora') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_FEDORA_PUBLISHED,
        modified: dates?.modified ?? SETUP_FEDORA_PUBLISHED,
        steps: SETUP_FEDORA_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/setup/arch') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_ARCH_PUBLISHED,
        modified: dates?.modified ?? SETUP_ARCH_PUBLISHED,
        steps: SETUP_ARCH_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/setup/docker') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_DOCKER_PUBLISHED,
        modified: dates?.modified ?? SETUP_DOCKER_PUBLISHED,
        steps: SETUP_DOCKER_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/setup/lm-studio') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_LM_STUDIO_PUBLISHED,
        modified: dates?.modified ?? SETUP_LM_STUDIO_PUBLISHED,
        steps: SETUP_LM_STUDIO_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/setup/coding-assistant') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_CODING_PUBLISHED,
        modified: dates?.modified ?? SETUP_CODING_PUBLISHED,
        steps: SETUP_CODING_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/setup/ollama') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_OLLAMA_PUBLISHED,
        modified: dates?.modified ?? SETUP_OLLAMA_PUBLISHED,
        steps: SETUP_OLLAMA_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/setup/lemonade') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_LEMONADE_PUBLISHED,
        modified: dates?.modified ?? SETUP_LEMONADE_PUBLISHED,
        steps: SETUP_LEMONADE_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/setup/open-webui') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_OPEN_WEBUI_PUBLISHED,
        modified: dates?.modified ?? SETUP_OPEN_WEBUI_PUBLISHED,
        steps: SETUP_OPEN_WEBUI_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/setup/wsl') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_WSL_PUBLISHED,
        modified: dates?.modified ?? SETUP_WSL_PUBLISHED,
        steps: SETUP_WSL_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/setup/comfyui') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_COMFYUI_PUBLISHED,
        modified: dates?.modified ?? SETUP_COMFYUI_PUBLISHED,
        steps: SETUP_COMFYUI_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/setup/multi-gpu') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_MULTI_GPU_PUBLISHED,
        modified: dates?.modified ?? SETUP_MULTI_GPU_PUBLISHED,
        steps: SETUP_MULTI_GPU_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/setup/server') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SETUP_SERVER_PUBLISHED,
        modified: dates?.modified ?? SETUP_SERVER_PUBLISHED,
        steps: SETUP_SERVER_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(SETUP_SERVER_FAQ, url));
    return nodes;
  }
  if (path === '/guides/buying-used-radeon') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? BUYING_USED_PUBLISHED,
        modified: dates?.modified ?? BUYING_USED_PUBLISHED,
        steps: BUYING_USED_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(BUYING_USED_FAQ, url));
    return nodes;
  }
  if (path === '/guides/quantize-gguf') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? QUANTIZE_GGUF_PUBLISHED,
        modified: dates?.modified ?? QUANTIZE_GGUF_PUBLISHED,
        steps: QUANTIZE_GGUF_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(QUANTIZE_GGUF_FAQ, url));
    return nodes;
  }
  if (path === '/image-gen') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? IMAGE_GEN_PUBLISHED,
        modified: dates?.modified ?? IMAGE_GEN_PUBLISHED,
        steps: IMAGE_GEN_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/speech') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SPEECH_PUBLISHED,
        modified: dates?.modified ?? SPEECH_PUBLISHED,
        steps: SPEECH_HOWTO_STEPS,
      }),
    );
    return nodes;
  }
  if (path === '/long-context') {
    nodes.push(
      techArticleJsonLd({
        headline: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? LONG_CONTEXT_PUBLISHED,
        modified: dates?.modified ?? LONG_CONTEXT_PUBLISHED,
      }),
    );
    nodes.push(faqPageJsonLd(LONG_CONTEXT_FAQ, url));
    return nodes;
  }
  if (path === '/context-ceiling') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? CX_PUBLISHED,
        modified: dates?.modified ?? CX_PUBLISHED,
        steps: CX_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(CX_FAQ, url));
    return nodes;
  }
  if (path === '/kv-cache') {
    nodes.push(
      techArticleJsonLd({
        headline: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? KV_CACHE_PUBLISHED,
        modified: dates?.modified ?? KV_CACHE_PUBLISHED,
      }),
    );
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? KV_CACHE_PUBLISHED,
        modified: dates?.modified ?? KV_CACHE_PUBLISHED,
        steps: KV_CACHE_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(KV_CACHE_FAQ, url));
    return nodes;
  }
  if (path === '/vision') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? VISION_PUBLISHED,
        modified: dates?.modified ?? VISION_PUBLISHED,
        steps: VISION_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(VISION_FAQ, url));
    return nodes;
  }
  if (path === '/rag') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? RAG_PUBLISHED,
        modified: dates?.modified ?? RAG_PUBLISHED,
        steps: RAG_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(RAG_FAQ, url));
    return nodes;
  }
  if (path === '/power') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? POWER_PUBLISHED,
        modified: dates?.modified ?? POWER_PUBLISHED,
        steps: POWER_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(POWER_FAQ, url));
    return nodes;
  }
  if (path === '/fine-tuning') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? FINE_TUNING_PUBLISHED,
        modified: dates?.modified ?? FINE_TUNING_PUBLISHED,
        steps: FINE_TUNING_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(FINE_TUNING_FAQ, url));
    return nodes;
  }
  if (path === '/tuning') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? TUNING_PUBLISHED,
        modified: dates?.modified ?? TUNING_PUBLISHED,
        steps: TUNING_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(TUNING_FAQ, url));
    return nodes;
  }
  if (path === '/speculative-decoding') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SPEC_PUBLISHED,
        modified: dates?.modified ?? SPEC_PUBLISHED,
        steps: SPEC_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(SPEC_FAQ, url));
    return nodes;
  }
  if (path === '/constrained-decoding') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? CD_PUBLISHED,
        modified: dates?.modified ?? CD_PUBLISHED,
        steps: CD_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(CD_FAQ, url));
    return nodes;
  }
  if (path === '/rocm/upgrade') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? ROCM_UPGRADE_PUBLISHED,
        modified: dates?.modified ?? ROCM_UPGRADE_PUBLISHED,
        steps: ROCM_UPGRADE_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(ROCM_UPGRADE_FAQ, url));
    return nodes;
  }
  if (path === '/thinking') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? THINK_PUBLISHED,
        modified: dates?.modified ?? THINK_PUBLISHED,
        steps: THINK_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(THINK_FAQ, url));
    return nodes;
  }
  if (path === '/sampling') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? SAM_PUBLISHED,
        modified: dates?.modified ?? SAM_PUBLISHED,
        steps: SAM_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(SAM_FAQ, url));
    return nodes;
  }
  if (path === '/chat-templates') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? CT_PUBLISHED,
        modified: dates?.modified ?? CT_PUBLISHED,
        steps: CT_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(CT_FAQ, url));
    return nodes;
  }
  if (path === '/concurrency-ab') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? NP_PUBLISHED,
        modified: dates?.modified ?? NP_PUBLISHED,
        steps: NP_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(NP_FAQ, url));
    return nodes;
  }
  if (path === '/flash-attention') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? FA_PUBLISHED,
        modified: dates?.modified ?? FA_PUBLISHED,
        steps: FA_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(FA_FAQ, url));
    return nodes;
  }
  if (path === '/prefill') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? PP_PUBLISHED,
        modified: dates?.modified ?? PP_PUBLISHED,
        steps: PP_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(PP_FAQ, url));
    return nodes;
  }
  if (path === '/prompt-cache') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? PC_PUBLISHED,
        modified: dates?.modified ?? PC_PUBLISHED,
        steps: PC_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(PC_FAQ, url));
    return nodes;
  }
  if (path === '/out-of-vram') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? OOM_PUBLISHED,
        modified: dates?.modified ?? OOM_PUBLISHED,
        steps: OOM_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(OOM_FAQ, url));
    return nodes;
  }
  if (path === '/mmap') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? MM_PUBLISHED,
        modified: dates?.modified ?? MM_PUBLISHED,
        steps: MM_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(MM_FAQ, url));
    return nodes;
  }
  if (path === '/guides/tool-calling') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? TC_PUBLISHED,
        modified: dates?.modified ?? TC_PUBLISHED,
        steps: TC_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(TC_FAQ, url));
    return nodes;
  }
  if (path === '/compare/vulkan-vs-rocm') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? VULKAN_VS_ROCM_PUBLISHED,
        modified: dates?.modified ?? VULKAN_VS_ROCM_PUBLISHED,
        steps: VULKAN_VS_ROCM_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(VULKAN_VS_ROCM_FAQ, url));
    return nodes;
  }
  if (path === '/moe') {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published ?? MOE_PUBLISHED,
        modified: dates?.modified ?? MOE_PUBLISHED,
        steps: MOE_HOWTO_STEPS,
      }),
    );
    nodes.push(faqPageJsonLd(MOE_FAQ, url));
    return nodes;
  }
  if (path === '/can-run') {
    nodes.push(faqPageJsonLd(CAN_RUN_HUB_FAQ, url));
    return nodes;
  }
  if (path.startsWith('/can-run/')) {
    const parsed = parseCanRunSlug(path.slice('/can-run/'.length));
    if (parsed) {
      const page = canRunPairPage(parsed.modelId, parsed.gpuId);
      nodes.push(faqPageJsonLd(page.faq, url));
    }
    return nodes;
  }

  if (path === '/tutorials/install-rocm' && dates) {
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates.published,
        modified: dates.modified,
        steps: markdownHowToSteps(installRocmFile()),
      }),
    );
    return nodes;
  }
  if (path === '/bios') {
    const published = loadBios().as_of;
    nodes.push(
      howToJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published,
        modified: published,
        steps: biosHowToSteps(),
      }),
    );
    return nodes;
  }

  const article =
    path.startsWith('/tutorials/') ||
    path.startsWith('/blog/') ||
    (path.startsWith('/rocm') && path !== '/rocm/faq' && path !== '/rocm/glossary') ||
    path === '/start' ||
    path === '/hardware' ||
    path === '/labs' ||
    path === '/labs/shannon' ||
    path === '/secure-lab' ||
    path === '/autoresearch' ||
    path === '/software' ||
    path === '/troubleshooting' ||
    path === '/maintain' ||
    path === '/quants' ||
    path === '/gpus/r9700' ||
    path === '/gpus/strix-halo' ||
    path === '/gpus/ryzen-igpu' ||
    path === '/gpus/rx-9070-xt' ||
    path === '/gpus/rx-9070' ||
    path === '/gpus/rx-9070-gre' ||
    path === '/gpus/rx-9060-xt' ||
    path === '/gpus/rx-7900-gre' ||
    path === '/gpus/rx-7700-xt' ||
    path === '/gpus/rx-7600-xt' ||
    path === '/gpus/rx-7600' ||
    path === '/gpus/rx-7900-xtx' ||
    path === '/gpus/rx-7900-xt' ||
    path === '/gpus/rx-7800-xt' ||
    path === '/gpus/rx-6800-xt' ||
    path === '/gpus/rx-6950-xt' ||
    path === '/gpus/rx-6700-xt' ||
    path === '/gpus/w7900' ||
    path === '/gpus/w7800' ||
    path === '/gpus/w7700' ||
    path === '/gpus/w6800' ||
    path.startsWith('/models/') ||
    path === '/compare/radeon-vs-nvidia' ||
    path === '/compare/radeon-vs-mac' ||
    path === '/multi-gpu' ||
    path === '/motherboards' ||
    path === '/methodology' ||
    path === '/terms' ||
    path === '/contact' ||
    path === '/sponsor' ||
    path === '/amdai-bench';
  if (article && dates) {
    nodes.push(
      techArticleJsonLd({
        headline: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates.published,
        modified: dates.modified,
      }),
    );
  }

  const specific = nodes.some((node) => {
    const type = String(node['@type'] ?? '');
    return type !== 'WebSite' && type !== 'Organization' && type !== 'BreadcrumbList';
  });
  if (!specific) {
    nodes.push(
      webPageJsonLd({
        name: input.title.replace(/ · AMDai$/, ''),
        description: input.description,
        url,
        published: dates?.published,
        modified: dates?.modified,
      }),
    );
  }

  return nodes;
}

export function jsonLdScript(nodes: JsonLd[]): string {
  return JSON.stringify({
    '@context': SCHEMA,
    '@graph': nodes,
  });
}

export function collectJsonLdKeys(value: unknown, out = new Set<string>()): Set<string> {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    for (const item of value) collectJsonLdKeys(item, out);
    return out;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    out.add(key);
    collectJsonLdKeys(child, out);
  }
  return out;
}

export function forbiddenJsonLdHits(value: unknown): string[] {
  const keys = collectJsonLdKeys(value);
  return FORBIDDEN_JSONLD_KEYS.filter((key) => keys.has(key));
}
