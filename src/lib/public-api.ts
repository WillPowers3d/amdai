/**
 * Public static JSON API at /api/v1/.
 * Built from catalogs already in this repo. No invented prices, benches, or specs.
 * Q1/Q2/Q3 and IQ1–IQ3 stay off this surface. llama.cpp is the default backend.
 * Tests load YAML from the filesystem — do not import Vite ?raw modules here.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  BACKENDS,
  DEFAULT_INPUT,
  GPU_PRESETS,
  MODEL_PRESETS,
  QUANTS,
  applyGpuPreset,
  applyModelPreset,
  compute,
  currentPickerPresets,
  gpuById,
  inputToQuery,
  isOlderModel,
  olderPickerPresets,
  type CalcInput,
  type GpuId,
  type ModelId,
  type QuantId,
} from './calculator';
import { parseBackends, type BackendsFile } from './backends';
import { gpuCardId } from './gpu-ids';
import { entryAnchor, LAB_LOG_PATH, loadLabLogFile } from './lab-log';
import { PII_TEXT } from './pii-denylist';
import { isQ3Quant, isQ4PlusQuant } from './quant-guard';
import { liveRecipes, pickRecipes, type Recipe } from './recipes';
import { recipes } from './recipes-data';
import { r9700StreetPrice, R9700_STREET_LOG_HREF, R9700_STREET_POLICY } from './r9700-street-price';
import { parseRocmProblems, problemPath, type RocmProblemsFile } from './rocm-problems';
import { SITE_ORIGIN } from './seo';
import type { GpuDirectory, StacksGuide } from './status';

export const API_SCHEMA_VERSION = '1.0';
export const API_DOCS_PATH = '/api';
export const API_BASE_PATH = '/api/v1';
export const API_MCP_PATH = '/api/#mcp';
export const DEFAULT_BACKEND_ID = 'llamacpp';
export const DEFAULT_BACKEND_NAME = 'llama.cpp';

export const API_JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Cache-Control': 'public, max-age=300',
} as const;

const HOME_PATH = /\/home\/|\/Users\/|C:\\Users\\/i;
const SUB_Q4 = /(?:^|[^a-z0-9])(?:ud-)?(?:iq[123]|q[123])(?:[_-]|$)/i;

const MODEL_PAGE_IDS = [
  'qwen36',
  'flash',
  'gpt-oss-20b',
  'gemma3-27b',
  'llama33-70b',
  'glm-53-flash',
  'qwen36-27b',
  'qwen38-27b',
] as const;

const CONSUMER_SLUG: Record<string, string> = {
  rx7900xtx: 'rx-7900-xtx',
  rx7900xt: 'rx-7900-xt',
  rx7800xt: 'rx-7800-xt',
  rx9070xt: 'rx-9070-xt',
  rx9060xt: 'rx-9060-xt',
  rx7900gre: 'rx-7900-gre',
  rx7700xt: 'rx-7700-xt',
  rx7600xt: 'rx-7600-xt',
  rx7600: 'rx-7600',
  rx6800xt: 'rx-6800-xt',
  rx6700xt: 'rx-6700-xt',
  rx9070: 'rx-9070',
  rx9070gre: 'rx-9070-gre',
  rx6950xt: 'rx-6950-xt',
};

function dataFile(name: string): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, '../data', name), join(process.cwd(), 'src/data', name)];
  for (const file of candidates) {
    if (existsSync(file)) return file;
  }
  throw new Error(`${name} missing`);
}

function readYaml<T>(name: string): T {
  return parse(readFileSync(dataFile(name), 'utf8')) as T;
}

export function loadGpuDirectory(): GpuDirectory {
  return readYaml<GpuDirectory>('gpus.yaml');
}

export function loadStacksGuide(): StacksGuide {
  return readYaml<StacksGuide>('stacks.yaml');
}

export function loadBackendsFile(): BackendsFile {
  return parseBackends(readYaml('backends.yaml'));
}

export function loadRocmProblems(): RocmProblemsFile {
  return parseRocmProblems(readYaml('rocm-problems.yaml'));
}

type ProductRow = { id: string; name: string; kind?: string; calculator_gpu?: string; urls: Record<string, string> };
type RetailerRow = {
  id: string;
  name: string;
  program: string;
  affiliate?: boolean;
  id_env?: string;
  default_id?: string;
};

function loadProducts(): ProductRow[] {
  return readYaml<{ products: ProductRow[] }>('products.yaml').products ?? [];
}

function loadRetailers(): RetailerRow[] {
  return readYaml<{ retailers: RetailerRow[] }>('retailers.yaml').retailers ?? [];
}

function readEnv(name: string | undefined): string {
  if (!name) return '';
  if (typeof process !== 'undefined' && process.env[name]) return String(process.env[name]).trim();
  return '';
}

function retailerIsAffiliate(retailer: RetailerRow): boolean {
  if (retailer.program === 'amazon_associates') return Boolean(readEnv(retailer.id_env) || retailer.default_id);
  if (retailer.program === 'rakuten') return Boolean(readEnv('RAKUTEN_PUBLISHER_ID') && readEnv('RAKUTEN_MID_NEWEGG'));
  if (retailer.program === 'bhphoto') return Boolean(readEnv('BHPHOTO_AFFILIATE_ID'));
  return false;
}

export type ApiEndpoint = {
  path: string;
  href: string;
  description: string;
};

export type ApiBuyLink = {
  retailer_id: string;
  retailer: string;
  href: string;
  path: string;
  affiliate: boolean;
  affiliate_label: string | null;
  label: string;
};

export type ApiPrice = {
  usd: string;
  retailer: string;
  listing: string;
  date: string;
  source: string;
  source_href: string;
  region: string;
  condition: string;
  tax: string;
  scope: string;
  note: string;
  buy: ApiBuyLink | null;
};

export type ApiGpu = {
  id: string;
  name: string;
  family: string;
  arch: string;
  gfx: string;
  vram_gb: number | null;
  bandwidth_gbs: number | null;
  bandwidth_note: string | null;
  support: string;
  rocm_note: string;
  hsa_override: string;
  href: string;
  prices: ApiPrice[];
  buy: ApiBuyLink[];
};

export type ApiQuant = {
  id: string;
  label: string;
  short: string;
  bpw: number;
  publisher_decimal_gb: number | null;
  publisher_label: string | null;
};

export type ApiModel = {
  id: string;
  name: string;
  group: string;
  official: string;
  gguf: string;
  older: boolean;
  href: string;
  total_params_b: number | null;
  active_params_b: number | null;
  layers: number | null;
  kv_layers: number | null;
  kv_heads: number | null;
  head_dim: number | null;
  default_quant: string;
  default_ctx: number;
  quants: ApiQuant[];
};

export type ApiStack = {
  id: string;
  title: string;
  kicker: string;
  model: string;
  official: string;
  gguf: string;
  quant: string;
  engine: string;
  backend_id: string;
  gpus: string;
  context: string | number;
  kv: string;
  offload: string;
  why: string;
  measured: string[];
  calculator: string;
  href: string;
  launch: { family: string; todo_flags: boolean; env: string[]; lines: string[] } | null;
};

export type ApiMeasured = {
  id: string;
  date: string;
  project: string;
  kind: string;
  title: string;
  summary: string;
  setup: Record<string, string> | null;
  metrics: Array<{ label: string; value: number | string; unit?: string }>;
  sources: string[];
  href: string;
};

export type ApiRocmIssue = {
  id: string;
  title: string;
  summary: string;
  impact: string;
  status: string;
  fixed_in: string | null;
  workaround: string;
  affected_gpus: string[];
  affected_gfx: string[];
  affected_os: string[];
  affected_backends: string[];
  affected_versions: string[];
  last_checked: string;
  href: string;
  upstream: Array<{ title: string; href: string; repo?: string }>;
};

export type ApiBackend = {
  id: string;
  name: string;
  short: string;
  verdict: string;
  default: boolean;
  used_on_our_rig: boolean;
  href: string;
  homepage: string;
  well: string;
  badly: string;
  when: string;
  run: string;
};

export function abs(path: string, origin = SITE_ORIGIN): string {
  if (path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${clean}`;
}

export function jsonResponse(data: unknown): Response {
  return new Response(`${JSON.stringify(data, null, 2)}\n`, { headers: API_JSON_HEADERS });
}

export function isPublicQuant(quant: string): boolean {
  const q = quant.trim();
  if (!q) return false;
  if (SUB_Q4.test(q) || isQ3Quant(q)) return false;
  return isQ4PlusQuant(q);
}

export function publicQuants() {
  return QUANTS.filter((row) => isPublicQuant(row.id) || isPublicQuant(row.label));
}

function latestDay(values: Array<string | undefined | null>): string {
  const days = values
    .map((value) => {
      if (!value) return '';
      const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
      return match?.[1] ?? '';
    })
    .filter(Boolean)
    .sort();
  return days[days.length - 1] || loadGpuDirectory().as_of;
}

export function apiAsOf(): string {
  const log = loadLabLogFile();
  return latestDay([
    loadGpuDirectory().as_of,
    loadStacksGuide().as_of,
    loadBackendsFile().as_of,
    loadRocmProblems().as_of,
    r9700StreetPrice.checked,
    log.as_of,
  ]);
}

export function gpuPageHref(id: string): string {
  const slug = CONSUMER_SLUG[id];
  return slug ? `/gpus/${slug}` : `/gpus/${id}`;
}

export function modelPageHref(id: string): string {
  if ((MODEL_PAGE_IDS as readonly string[]).includes(id)) return `/models/${id}`;
  return `/calculator?model=${encodeURIComponent(id)}`;
}

export function calculatorShareUrl(input: CalcInput): string {
  return abs(`/calculator?${inputToQuery({ ...input, backendId: 'llamacpp' })}`);
}

function goPath(retailerId: string, productId: string): string {
  return `/go/${retailerId}/${productId}`;
}

function buyLinksForProduct(productId: string): ApiBuyLink[] {
  const product = loadProducts().find((row) => row.id === productId);
  if (!product) return [];
  return loadRetailers()
    .filter((retailer) => Boolean(product.urls[retailer.id]))
    .map((retailer) => {
      const path = goPath(retailer.id, product.id);
      const affiliate = retailerIsAffiliate(retailer);
      return {
        retailer_id: retailer.id,
        retailer: retailer.name,
        href: abs(path),
        path,
        affiliate,
        affiliate_label: affiliate ? 'Affiliate link. A commission does not change the price you pay.' : null,
        label: affiliate ? `Check price at ${retailer.name}` : `Also at ${retailer.name}`,
      };
    });
}

function productIdForGpu(gpuId: string): string | null {
  const products = loadProducts();
  return products.find((row) => row.id === gpuId || row.calculator_gpu === gpuId)?.id ?? null;
}

function r9700Prices(): ApiPrice[] {
  const file = r9700StreetPrice;
  const buy = buyLinksForProduct('r9700');
  const sourceHref = abs(R9700_STREET_LOG_HREF);
  const note = `${R9700_STREET_POLICY} ${file.scope}, ${file.condition}, ${file.tax}, ${file.region}.`;
  return [file.cheapest_new, file.newegg].map((quote) => {
    const match = buy.find((row) => row.retailer.toLowerCase().includes(quote.retailer.toLowerCase()));
    return {
      usd: quote.usd,
      retailer: quote.retailer,
      listing: quote.listing,
      date: file.checked,
      source: 'src/data/r9700-street-price.yaml',
      source_href: sourceHref,
      region: file.region,
      condition: file.condition,
      tax: file.tax,
      scope: file.scope,
      note,
      buy: match ?? null,
    };
  });
}

export function buildGpusPayload() {
  const directory = loadGpuDirectory();
  const gpus: ApiGpu[] = directory.cards.map((card) => {
    const id = gpuCardId(card);
    const preset = GPU_PRESETS.find((gpu) => gpu.id === id);
    const productId = productIdForGpu(id);
    return {
      id,
      name: card.name,
      family: card.family,
      arch: card.arch,
      gfx: card.gfx,
      vram_gb: card.vram_gb,
      bandwidth_gbs: preset && preset.bandwidthGBs > 0 ? preset.bandwidthGBs : null,
      bandwidth_note: preset?.bandwidthNote ?? null,
      support: card.support,
      rocm_note: card.rocm_note,
      hsa_override: card.hsa_override,
      href: abs(gpuPageHref(id)),
      prices: id === 'r9700' ? r9700Prices() : [],
      buy: productId ? buyLinksForProduct(productId) : [],
    };
  });
  return {
    schema_version: API_SCHEMA_VERSION,
    as_of: apiAsOf(),
    href: abs('/gpus'),
    notes: directory.notes,
    matrix: directory.matrix,
    linux_reqs: directory.linux_reqs,
    gpus,
  };
}

function modelQuants(id: ModelId): ApiQuant[] {
  const model = MODEL_PRESETS.find((row) => row.id === id);
  if (!model) return [];
  return publicQuants().map((quant) => {
    const pub = model.publisherFiles[quant.id as QuantId];
    return {
      id: quant.id,
      label: quant.label,
      short: quant.short,
      bpw: quant.bpw,
      publisher_decimal_gb: pub?.decimalGb ?? null,
      publisher_label: pub?.label ?? null,
    };
  });
}

function apiModelFromPreset(model: (typeof MODEL_PRESETS)[number]): ApiModel {
  const defaultQuant = isPublicQuant(model.defaultQuant) ? model.defaultQuant : 'q4_k_m';
  return {
    id: model.id,
    name: model.name,
    group: model.group,
    official: model.official,
    gguf: model.gguf,
    older: isOlderModel(model.id),
    href: abs(modelPageHref(model.id)),
    total_params_b: model.totalParamsB,
    active_params_b: model.activeParamsB,
    layers: model.layers,
    kv_layers: model.kvLayers,
    kv_heads: model.kvHeads,
    head_dim: model.headDim,
    default_quant: defaultQuant,
    default_ctx: model.defaultCtx,
    quants: modelQuants(model.id),
  };
}

export function buildModelsPayload() {
  const current = currentPickerPresets().filter((row) => row.id !== 'custom');
  const older = olderPickerPresets();
  const models = [...current, ...older].map(apiModelFromPreset);
  return {
    schema_version: API_SCHEMA_VERSION,
    as_of: apiAsOf(),
    href: abs('/models'),
    default_family: 'Qwen',
    note: 'Qwen first. Older families set older: true. Quants below Q4 are omitted.',
    quants: publicQuants().map((row) => ({ id: row.id, label: row.label, short: row.short, bpw: row.bpw })),
    models,
  };
}

function backendIdFromEngine(engine: string): string {
  const lower = engine.toLowerCase();
  if (lower.includes('llama.cpp') || lower.includes('llamacpp')) return 'llamacpp';
  if (lower.includes('strata')) return 'strata';
  if (lower.includes('vllm')) return 'vllm';
  return DEFAULT_BACKEND_ID;
}

function stackLaunch(stackId: string, quant: string): ApiStack['launch'] {
  const live = liveRecipes(recipes).filter((row) => isPublicQuant(row.weights.quant));
  const match =
    live.find((row) => {
      if (stackId === 'daily-driver') {
        return row.model_id === 'qwen36' && row.backend === 'llamacpp' && /Q5/i.test(row.weights.quant);
      }
      if (stackId === 'fast-agent') {
        return row.model_id === 'flash' && isPublicQuant(row.weights.quant);
      }
      return false;
    }) ?? live.find((row) => row.weights.quant.includes(quant.replace(/^UD-/, '')) || row.weights.quant === quant);
  if (!match) return null;
  return {
    family: match.launch.family,
    todo_flags: match.launch.todo_flags,
    env: match.launch.env,
    lines: match.launch.lines,
  };
}

export function buildStacksPayload() {
  const guide = loadStacksGuide();
  const stacks: ApiStack[] = guide.stacks.map((row) => {
    const backendId = row.id === 'vllm-try' ? 'vllm' : backendIdFromEngine(row.engine);
    const quant = isPublicQuant(row.quant) ? row.quant : 'UD-Q5_K_XL';
    return {
      id: row.id,
      title: row.title,
      kicker: row.kicker,
      model: row.model,
      official: row.official,
      gguf: row.gguf,
      quant,
      engine: row.id === 'daily-driver' || backendId === 'llamacpp' ? DEFAULT_BACKEND_NAME : row.engine,
      backend_id: row.id === 'vllm-try' ? 'vllm' : DEFAULT_BACKEND_ID,
      gpus: row.gpus,
      context: row.context,
      kv: row.kv,
      offload: row.offload,
      why: row.why,
      measured: row.measured.filter((line) => !SUB_Q4.test(line) || /Q[4-8]|BF16/i.test(line)),
      calculator: row.calculator.startsWith('http') ? row.calculator : abs(row.calculator),
      href: abs('/stacks'),
      launch: stackLaunch(row.id, quant),
    };
  });
  return {
    schema_version: API_SCHEMA_VERSION,
    as_of: guide.as_of,
    href: abs('/stacks'),
    default_backend: DEFAULT_BACKEND_NAME,
    test_rig: guide.test_rig,
    stacks,
  };
}

function setupQuantAllowed(setup?: Record<string, string> | null): boolean {
  const quant = setup?.quant;
  if (!quant) return true;
  if (SUB_Q4.test(quant) && !/Q[4-8]|BF16|FP8|AWQ/i.test(quant)) return false;
  return true;
}

export function buildMeasuredPayload() {
  const log = loadLabLogFile();
  const runs: ApiMeasured[] = log.entries
    .filter((entry) => entry.kind === 'result' || entry.kind === 'progress')
    .filter((entry) => setupQuantAllowed(entry.setup))
    .map((entry) => ({
      id: entry.id,
      date: entry.date,
      project: String(entry.project),
      kind: entry.kind,
      title: entry.title,
      summary: entry.summary,
      setup: entry.setup ?? null,
      metrics: entry.metrics ?? [],
      sources: entry.sources ?? [],
      href: abs(`${LAB_LOG_PATH}#${entryAnchor(entry.id)}`),
    }));
  return {
    schema_version: API_SCHEMA_VERSION,
    as_of: log.as_of,
    href: abs(LAB_LOG_PATH),
    note: 'Measured and cited lab-log rows. Numbers keep their original dates. Quants below Q4 are omitted.',
    runs,
  };
}

export function buildRocmIssuesPayload() {
  const file = loadRocmProblems();
  const issues: ApiRocmIssue[] = file.problems.map((row) => ({
    id: row.id,
    title: row.title,
    summary: row.summary,
    impact: row.impact,
    status: row.status,
    fixed_in: row.fixed_in ?? null,
    workaround: row.workaround,
    affected_gpus: row.affected_gpus,
    affected_gfx: row.affected_gfx,
    affected_os: row.affected_os,
    affected_backends: row.affected_backends,
    affected_versions: row.affected_versions,
    last_checked: row.last_checked,
    href: abs(problemPath(row.id)),
    upstream: row.upstream,
  }));
  return {
    schema_version: API_SCHEMA_VERSION,
    as_of: file.as_of,
    href: abs('/rocm-problems'),
    issues,
  };
}

export function buildBackendsPayload() {
  const file = loadBackendsFile();
  const engines: ApiBackend[] = file.engines.map((row) => ({
    id: row.id,
    name: row.name,
    short: row.short,
    verdict: row.verdict,
    default: row.id === file.default_id || row.id === DEFAULT_BACKEND_ID,
    used_on_our_rig: row.used_on_our_rig,
    href: abs(`/backends/${row.id}`),
    homepage: row.homepage,
    well: row.well,
    badly: row.badly,
    when: row.when,
    run: row.run,
  }));
  engines.sort((a, b) => Number(b.default) - Number(a.default) || a.id.localeCompare(b.id));
  return {
    schema_version: API_SCHEMA_VERSION,
    as_of: file.as_of,
    href: abs('/backends'),
    default_id: DEFAULT_BACKEND_ID,
    default_name: DEFAULT_BACKEND_NAME,
    notes: file.notes,
    engines,
  };
}

export function apiEndpoints(): ApiEndpoint[] {
  const rows = [
    { path: `${API_BASE_PATH}/index.json`, description: 'Endpoint list, schema version, and as_of' },
    { path: `${API_BASE_PATH}/gpus.json`, description: 'Radeon GPU directory, VRAM, bandwidth, dated prices, buy links' },
    { path: `${API_BASE_PATH}/models.json`, description: 'Models and Q4+ quants. Qwen first; older families flagged' },
    { path: `${API_BASE_PATH}/stacks.json`, description: 'Recommended stack picks and launch configs' },
    { path: `${API_BASE_PATH}/measured.json`, description: 'Measured runs from the lab log' },
    { path: `${API_BASE_PATH}/rocm-issues.json`, description: 'Consumer ROCm problem tracker' },
    { path: `${API_BASE_PATH}/backends.json`, description: 'Inference engines. llama.cpp is the default' },
    { path: `${API_BASE_PATH}/catalog.json`, description: 'First-party launch recipes' },
    { path: `${API_BASE_PATH}/pick.json`, description: 'Static per-GPU recipe pick table' },
  ];
  return rows.map((row) => ({ ...row, href: abs(row.path) }));
}

export function buildIndexPayload() {
  return {
    schema_version: API_SCHEMA_VERSION,
    as_of: apiAsOf(),
    name: 'AMDai public API',
    docs: abs(`${API_DOCS_PATH}/`),
    mcp: abs(API_MCP_PATH),
    license: 'MIT',
    attribution:
      'Cite https://amdai.net. Numbers are measured on a local desktop, cited from a public doc, or labeled estimates. Not affiliated with AMD.',
    cors: 'GET /api/v1/*.json is static. Caddy sends Access-Control-Allow-Origin: * so browser fetch works.',
    default_backend: DEFAULT_BACKEND_NAME,
    quant_floor: 'Q4',
    endpoints: apiEndpoints(),
  };
}

export type PublicApiCatalog = {
  index: ReturnType<typeof buildIndexPayload>;
  gpus: ReturnType<typeof buildGpusPayload>;
  models: ReturnType<typeof buildModelsPayload>;
  stacks: ReturnType<typeof buildStacksPayload>;
  measured: ReturnType<typeof buildMeasuredPayload>;
  'rocm-issues': ReturnType<typeof buildRocmIssuesPayload>;
  backends: ReturnType<typeof buildBackendsPayload>;
};

export function buildPublicApi(): PublicApiCatalog {
  return {
    index: buildIndexPayload(),
    gpus: buildGpusPayload(),
    models: buildModelsPayload(),
    stacks: buildStacksPayload(),
    measured: buildMeasuredPayload(),
    'rocm-issues': buildRocmIssuesPayload(),
    backends: buildBackendsPayload(),
  };
}

export function apiFilenames(): Array<keyof PublicApiCatalog> {
  return ['index', 'gpus', 'models', 'stacks', 'measured', 'rocm-issues', 'backends'];
}

function clampQuant(id: string): QuantId {
  if (isPublicQuant(id) && QUANTS.some((row) => row.id === id)) return id as QuantId;
  return 'q4_k_m';
}

export function planFitInput(opts: {
  gpu?: string;
  vram_gb?: number;
  ram_gb?: number;
  model?: string;
  quant?: string;
  context?: number;
  gpu_count?: number;
}): CalcInput {
  const gpuId = (GPU_PRESETS.some((gpu) => gpu.id === opts.gpu) ? opts.gpu : 'r9700') as GpuId;
  const modelId = (MODEL_PRESETS.some((model) => model.id === opts.model) ? opts.model : 'qwen36') as ModelId;
  let input = applyModelPreset(modelId, applyGpuPreset(gpuId, { ...DEFAULT_INPUT, backendId: 'llamacpp' }));
  if (opts.vram_gb && opts.vram_gb > 0) input = { ...input, vramGb: opts.vram_gb };
  if (opts.ram_gb != null && opts.ram_gb >= 0) input = { ...input, ramGb: opts.ram_gb };
  if (opts.context && opts.context > 0) input = { ...input, context: opts.context };
  if (opts.gpu_count && opts.gpu_count > 0) input = { ...input, gpuCount: Math.min(4, Math.round(opts.gpu_count)) };
  if (opts.quant) input = { ...input, quantId: clampQuant(opts.quant) };
  else input = { ...input, quantId: clampQuant(input.quantId) };
  return input;
}

export function bestPublicQuant(input: CalcInput): { id: QuantId; label: string } | null {
  const ranked = publicQuants()
    .slice()
    .sort((a, b) => b.bpw - a.bpw);
  for (const quant of ranked) {
    const next = { ...input, quantId: quant.id as QuantId, backendId: 'llamacpp' as const };
    const result = compute(next);
    if (result.verdict === 'fits' || result.verdict === 'tight') {
      return { id: quant.id as QuantId, label: quant.label };
    }
  }
  return null;
}

export type StackRecommendInput = {
  gpus?: string[] | string;
  vram_gb?: number;
  ram_gb?: number;
  goal?: string;
};

export type StackRecommend = {
  stack_id: string;
  title: string;
  goal: string;
  model: string;
  model_id: string;
  quant: string;
  backend: string;
  backend_id: string;
  launch: string;
  calculator: string;
  href: string;
  note: string;
  verdict: string;
};

function normalizeGpuToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function resolveGpuId(raw?: string | string[]): string {
  const tokens = (Array.isArray(raw) ? raw : raw ? [raw] : []).map(normalizeGpuToken);
  if (!tokens.length) return 'r9700';
  for (const gpu of GPU_PRESETS) {
    const id = normalizeGpuToken(gpu.id);
    const name = normalizeGpuToken(gpu.name);
    if (tokens.some((token) => token === id || name.includes(token) || token.includes(id))) return gpu.id;
  }
  for (const card of loadGpuDirectory().cards) {
    const id = gpuCardId(card);
    if (tokens.some((token) => token === normalizeGpuToken(id) || normalizeGpuToken(card.name).includes(token))) {
      return id;
    }
  }
  return 'r9700';
}

function goalKind(goal?: string): 'daily' | 'agent' | 'serve' {
  const g = (goal ?? 'daily').toLowerCase();
  if (/agent|flash|fast|speed/.test(g)) return 'agent';
  if (/vllm|serv|batch|multi.?client/.test(g)) return 'serve';
  return 'daily';
}

export function recommendStack(opts: StackRecommendInput): StackRecommend {
  const goal = goalKind(opts.goal);
  const gpuId = resolveGpuId(opts.gpus);
  const gpu = gpuById((GPU_PRESETS.some((row) => row.id === gpuId) ? gpuId : 'r9700') as GpuId);
  const vram = opts.vram_gb && opts.vram_gb > 0 ? opts.vram_gb : gpu.vramGb;
  const ram = opts.ram_gb != null && opts.ram_gb >= 0 ? opts.ram_gb : DEFAULT_INPUT.ramGb;
  const stacks = buildStacksPayload().stacks;
  const daily = stacks.find((row) => row.id === 'daily-driver') ?? stacks[0]!;
  const agent = stacks.find((row) => row.id === 'fast-agent') ?? daily;
  const serve = stacks.find((row) => row.id === 'vllm-try') ?? daily;

  let picked = daily;
  let modelId: ModelId = 'qwen36';
  let quantId: QuantId = 'q5_k_m';
  let note = 'House daily driver on llama.cpp. Q5 when the file fits.';

  if (goal === 'agent' && vram >= 32 && ram >= 64) {
    picked = agent;
    modelId = 'flash';
    quantId = 'q6_k';
    note = 'Site fast-agent card. llama.cpp remains the default engine recommendation; Strata is the cited Flash try.';
  } else if (goal === 'serve') {
    picked = serve;
    modelId = 'qwen36';
    quantId = 'q5_k_m';
    note = 'vLLM is a cited try. Consumers still start on llama.cpp.';
  }

  const input = planFitInput({ gpu: gpuId, vram_gb: vram, ram_gb: ram, model: modelId, quant: quantId });
  const result = compute(input);
  let usedQuant = quantId;
  if (result.verdict === 'no') {
    const best = bestPublicQuant(input);
    if (best) {
      usedQuant = best.id;
      note = `${note} Selected ${best.label} so the file fits this VRAM.`;
    } else {
      note = `${note} This VRAM does not hold a Q4+ copy of the house model at the default context — see the calculator.`;
    }
  }

  const fitted = { ...input, quantId: usedQuant, backendId: 'llamacpp' as const };
  const fittedResult = compute(fitted);
  const recipe = pickRecipes(recipes, gpuId, vram).find(
    (row) => row.model_id === modelId && isPublicQuant(row.weights.quant) && row.backend === 'llamacpp',
  );
  const launch = recipe?.launch.lines.join('\n') ?? BACKENDS[0]?.note ?? 'Compile llama.cpp with Vulkan and serve on 127.0.0.1:8080.';

  return {
    stack_id: picked.id,
    title: picked.title,
    goal,
    model: picked.model,
    model_id: modelId,
    quant: publicQuants().find((row) => row.id === usedQuant)?.label ?? usedQuant,
    backend: DEFAULT_BACKEND_NAME,
    backend_id: DEFAULT_BACKEND_ID,
    launch,
    calculator: calculatorShareUrl(fitted),
    href: abs('/stacks'),
    note,
    verdict: fittedResult.verdict,
  };
}

export function compareGpus(ids: string[]) {
  const catalog = buildGpusPayload();
  const wanted = ids.map((id) => resolveGpuId(id));
  const rows = wanted.map((id) => catalog.gpus.find((gpu) => gpu.id === id)).filter((row): row is ApiGpu => Boolean(row));
  return {
    href: abs('/compare/gpus'),
    gpus: rows,
  };
}

export function gpuPrices(id?: string) {
  const catalog = buildGpusPayload();
  const gpus = id ? catalog.gpus.filter((gpu) => gpu.id === resolveGpuId(id)) : catalog.gpus.filter((gpu) => gpu.prices.length);
  return {
    href: abs('/gpus'),
    disclosure: 'Buy links that say Check price may be affiliate links. Dated snapshots only — not live quotes.',
    gpus: gpus.map((gpu) => ({
      id: gpu.id,
      name: gpu.name,
      href: gpu.href,
      prices: gpu.prices,
      buy: gpu.buy,
    })),
  };
}

export function lookupRocmIssue(query: string) {
  const needle = query.trim().toLowerCase();
  const catalog = buildRocmIssuesPayload();
  const hits = catalog.issues.filter((row) => {
    const blob = [row.id, row.title, row.summary, row.impact, row.workaround, ...row.affected_gpus, ...row.affected_gfx, ...row.affected_backends]
      .join(' ')
      .toLowerCase();
    const parts = needle.split(/\s+/).filter((part) => part.length > 2);
    return parts.length ? parts.every((part) => blob.includes(part)) : blob.includes(needle);
  });
  return {
    href: abs('/rocm-problems'),
    query,
    issues: hits,
  };
}

export function assertPublicApiValid(catalog = buildPublicApi()): string[] {
  const errors: string[] = [];
  if (!catalog.index.endpoints.length) errors.push('index endpoints empty');
  for (const name of apiFilenames()) {
    const payload = catalog[name] as { as_of?: string; schema_version?: string };
    if (payload.schema_version !== API_SCHEMA_VERSION) errors.push(`${name} schema`);
    if (!payload.as_of) errors.push(`${name} as_of`);
    const blob = JSON.stringify(payload);
    if (PII_TEXT.test(blob)) errors.push(`${name} PII`);
    if (HOME_PATH.test(blob)) errors.push(`${name} home path`);
  }
  if (!catalog.gpus.gpus.length) errors.push('gpus empty');
  if (!catalog.models.models.length) errors.push('models empty');
  if (!catalog.stacks.stacks.length) errors.push('stacks empty');
  if (!catalog.measured.runs.length) errors.push('measured empty');
  if (!catalog['rocm-issues'].issues.length) errors.push('rocm-issues empty');
  if (!catalog.backends.engines.length) errors.push('backends empty');
  const qwenFirst = catalog.models.models[0];
  if (!qwenFirst || !/qwen/i.test(qwenFirst.name)) errors.push('models must start with Qwen');
  if (!catalog.models.models.some((row) => row.older)) errors.push('older models missing flag');
  if (catalog.models.models.some((row) => row.quants.some((quant) => !isPublicQuant(quant.id)))) {
    errors.push('model quant below Q4');
  }
  const r9700 = catalog.gpus.gpus.find((row) => row.id === 'r9700');
  if (!r9700) errors.push('r9700 missing');
  if (r9700 && !r9700.prices.length) errors.push('r9700 prices missing');
  if (r9700 && r9700.prices.some((price) => !price.date || !price.source)) errors.push('r9700 price source/date');
  if (r9700 && !r9700.buy.some((link) => link.path.startsWith('/go/'))) errors.push('r9700 buy urls');
  if (catalog.backends.default_id !== DEFAULT_BACKEND_ID) errors.push('default backend');
  const rec = recommendStack({ gpus: 'r9700', vram_gb: 32, ram_gb: 256, goal: 'daily' });
  if (rec.backend_id !== DEFAULT_BACKEND_ID) errors.push('recommend backend');
  if (!isPublicQuant(rec.quant)) errors.push('recommend quant');
  if (!rec.calculator.includes('/calculator?')) errors.push('recommend calculator');
  return [...new Set(errors)];
}

export function recipeLaunchFor(card: string, modelId: string): Recipe | undefined {
  return liveRecipes(recipes).find(
    (row) => row.card === card && row.model_id === modelId && row.backend === 'llamacpp' && isPublicQuant(row.weights.quant),
  );
}
