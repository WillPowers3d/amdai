/**
 * schema.org JSON-LD builders. Numbers and dates come from existing data only.
 * Never emit AggregateRating, Review, Offer, or price fields.
 */

import { GLOSSARY } from './glossary';
import { FAQ_ITEMS } from './faq';
import { SETUP_HOWTO_STEPS, SETUP_PUBLISHED } from './setup';
import { SETUP_WINDOWS_HOWTO_STEPS, SETUP_WINDOWS_PUBLISHED } from './setup-windows';
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
import { RUN_SCHEMA, amdai, amdai } from './run-card';
import { TRUST_PUBLISHED } from './trust';
import { runs } from './run-card-data';
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
    founder: {
      '@type': 'Person',
      name: amdai.display,
      alternateName: [amdai.handle, amdai.rig, amdai.handle, amdai.display],
    },
  };
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
    author: { '@type': 'Person', name: amdai.display },
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
    author: { '@type': 'Person', name: amdai.display },
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
      '@type': 'Person',
      name: DATASET_CREATOR.name,
      alternateName: [...DATASET_CREATOR.alternateName],
    },
    license: DATASET_LICENSE,
    measurementTechnique: `llama.cpp llama-bench recorded as ${RUN_SCHEMA} on AMD Radeon AI PRO R9700 at ${amdai.rig}`,
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
    path === '/models/qwen36' ||
    path === '/models/flash' ||
    path === '/compare/radeon-vs-nvidia' ||
    path === '/multi-gpu' ||
    path === '/methodology' ||
    path === '/terms' ||
    path === '/contact' ||
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
