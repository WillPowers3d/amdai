/**
 * Harness / frontend catalog. Logic lives here so tests never import YAML via ?raw.
 */

export type HarnessCategory = 'agent' | 'chat' | 'image';
export type HarnessSurface = 'cli' | 'ide' | 'desktop' | 'web';

export type HarnessSource = {
  title: string;
  href: string;
};

export type Harness = {
  id: string;
  title: string;
  category: HarnessCategory;
  vendor: string;
  used_on_our_rig: boolean;
  summary: string;
  what_for: string;
  homepage: string;
  docs: string;
  local_docs?: string;
  llama_docs?: string;
  repo?: string;
  version_note: string;
  llama_base: string;
  strata_base: string;
  model_field: string;
  api_key: string;
  tools: string;
  long_context: string;
  rocm: string;
  hybrid: string;
  local_ok: boolean;
  hybrid_ok: boolean;
  surfaces: HarnessSurface[];
  snippet: string;
  sources: HarnessSource[];
};

export type HarnessesFile = {
  as_of: string;
  llama_server_port: number;
  strata_port: number;
  vllm_port: number;
  model_placeholder: string;
  api_key_placeholder: string;
  notes: string[];
  harnesses: Harness[];
};

export const HARNESS_PAGE_SLUGS = ['compare', 'quiz', 'connect', 'agents', 'chat', 'image'] as const;

export const HARNESS_CATEGORIES: HarnessCategory[] = ['agent', 'chat', 'image'];

export const HARNESS_SURFACES: HarnessSurface[] = ['cli', 'ide', 'desktop', 'web'];

export const CATEGORY_COPY: Record<HarnessCategory, { label: string; href: string; lede: string }> = {
  agent: {
    label: 'Agent harnesses',
    href: '/harnesses/agents',
    lede: 'Tool loops on top of an OpenAI-compatible /v1. Coding agents, CLIs, and IDE extensions. Structured JSON: /constrained-decoding.',
  },
  chat: {
    label: 'Chat UIs',
    href: '/harnesses/chat',
    lede: 'Talk to the same server without an agent loop. Browser and desktop frontends.',
  },
  image: {
    label: 'Image / video',
    href: '/harnesses/image',
    lede: 'Diffusion graphs on ROCm PyTorch. Not an LLM /v1 client.',
  },
};

const RESERVED = new Set<string>(HARNESS_PAGE_SLUGS);
const CATEGORY_SET = new Set<string>(HARNESS_CATEGORIES);
const SURFACE_SET = new Set<string>(HARNESS_SURFACES);

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function asSources(value: unknown): HarnessSource[] {
  if (!Array.isArray(value)) return [];
  const sources: HarnessSource[] = [];
  for (const row of value) {
    if (!row || typeof row !== 'object') continue;
    const rec = row as Record<string, unknown>;
    if (typeof rec.title !== 'string' || typeof rec.href !== 'string') continue;
    sources.push({ title: rec.title, href: rec.href });
  }
  return sources;
}

function asSurfaces(value: unknown): HarnessSurface[] {
  return asStringList(value).filter((item): item is HarnessSurface => SURFACE_SET.has(item));
}

export function normalizeHarness(row: Partial<Harness> & Pick<Harness, 'id' | 'title' | 'summary'>): Harness {
  const category = CATEGORY_SET.has(row.category as string) ? (row.category as HarnessCategory) : 'agent';
  return {
    id: row.id,
    title: row.title,
    category,
    vendor: row.vendor ?? '',
    used_on_our_rig: Boolean(row.used_on_our_rig),
    summary: row.summary,
    what_for: row.what_for ?? '',
    homepage: row.homepage ?? '',
    docs: row.docs ?? '',
    local_docs: row.local_docs,
    llama_docs: row.llama_docs,
    repo: row.repo,
    version_note: row.version_note ?? '',
    llama_base: row.llama_base ?? '',
    strata_base: row.strata_base ?? '',
    model_field: row.model_field ?? '',
    api_key: row.api_key ?? '',
    tools: row.tools ?? '',
    long_context: row.long_context ?? '',
    rocm: row.rocm ?? '',
    hybrid: row.hybrid ?? '',
    local_ok: row.local_ok !== false,
    hybrid_ok: row.hybrid_ok !== false,
    surfaces: asSurfaces(row.surfaces),
    snippet: row.snippet ?? '',
    sources: asSources(row.sources),
  };
}

export function parseHarnesses(raw: unknown): HarnessesFile {
  const parsed = raw as Partial<HarnessesFile> & {
    harnesses?: Array<Partial<Harness> & Pick<Harness, 'id' | 'title' | 'summary'>>;
  };
  return {
    as_of: parsed.as_of ?? '',
    llama_server_port: typeof parsed.llama_server_port === 'number' ? parsed.llama_server_port : 8080,
    strata_port: typeof parsed.strata_port === 'number' ? parsed.strata_port : 8083,
    vllm_port: typeof parsed.vllm_port === 'number' ? parsed.vllm_port : 8000,
    model_placeholder: parsed.model_placeholder ?? 'qwen',
    api_key_placeholder: parsed.api_key_placeholder ?? 'local-not-a-secret',
    notes: asStringList(parsed.notes),
    harnesses: (parsed.harnesses ?? []).map((row) => normalizeHarness(row)),
  };
}

export function harnessPath(id: string): string {
  return `/harnesses/${id}`;
}

export function harnessesByCategory(list: Harness[], category: HarnessCategory): Harness[] {
  return list.filter((row) => row.category === category);
}

export function usedOnOurRig(list: Harness[]): Harness[] {
  return list.filter((row) => row.used_on_our_rig);
}

export function hybridLabel(row: Harness): string {
  if (row.local_ok && row.hybrid_ok) return 'Local + hybrid';
  if (row.hybrid_ok && !row.local_ok) return 'Hybrid-shaped';
  if (row.local_ok && !row.hybrid_ok) return 'Local only';
  return 'Not documented';
}

export function surfaceLabel(surface: HarnessSurface): string {
  if (surface === 'ide') return 'IDE';
  if (surface === 'cli') return 'CLI';
  if (surface === 'desktop') return 'Desktop';
  return 'Web';
}

export type QuizJob = HarnessCategory;
export type QuizUsage = 'local' | 'hybrid';
export type QuizSurface = HarnessSurface;
export type QuizTools = 'yes' | 'no';

export type QuizAnswers = {
  job?: QuizJob;
  usage?: QuizUsage;
  surface?: QuizSurface;
  tools?: QuizTools;
};

export type QuizResult = {
  primary: Harness;
  alternates: Harness[];
  reason: string;
  usageNote: string;
};

function requireId(list: Harness[], id: string): Harness {
  const found = list.find((row) => row.id === id);
  if (!found) {
    throw new Error(`harness catalog is missing required id ${id}`);
  }
  return found;
}

function present(list: Harness[], ids: string[]): Harness[] {
  return ids.map((id) => list.find((row) => row.id === id)).filter((row): row is Harness => Boolean(row));
}

const QUIZ_JOBS: QuizJob[] = ['agent', 'chat', 'image'];
const QUIZ_USAGES: QuizUsage[] = ['local', 'hybrid'];
const QUIZ_SURFACES: QuizSurface[] = ['cli', 'ide', 'desktop', 'web'];
const QUIZ_TOOLS: QuizTools[] = ['yes', 'no'];

function asJob(value: string | null | undefined): QuizJob | undefined {
  return value === 'agent' || value === 'chat' || value === 'image' ? value : undefined;
}

function asUsage(value: string | null | undefined): QuizUsage | undefined {
  return value === 'local' || value === 'hybrid' ? value : undefined;
}

function asSurface(value: string | null | undefined): QuizSurface | undefined {
  return value === 'cli' || value === 'ide' || value === 'desktop' || value === 'web' ? value : undefined;
}

function asTools(value: string | null | undefined): QuizTools | undefined {
  return value === 'yes' || value === 'no' ? value : undefined;
}

export function parseQuizAnswers(search: string): QuizAnswers {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return {
    job: asJob(q.get('job')),
    usage: asUsage(q.get('usage')),
    surface: asSurface(q.get('surface')),
    tools: asTools(q.get('tools')),
  };
}

export function parseQuizCombo(combo: string): QuizAnswers {
  const [job, usage, surface, tools] = combo.split('-');
  return {
    job: asJob(job),
    usage: asUsage(usage),
    surface: asSurface(surface),
    tools: asTools(tools),
  };
}

export function quizCombo(answers: QuizAnswers): string {
  return [
    answers.job ?? 'agent',
    answers.usage ?? 'local',
    answers.surface ?? 'cli',
    answers.tools ?? 'yes',
  ].join('-');
}

export function quizCombos(): string[] {
  const out: string[] = [];
  for (const job of QUIZ_JOBS) {
    for (const usage of QUIZ_USAGES) {
      for (const surface of QUIZ_SURFACES) {
        for (const tools of QUIZ_TOOLS) {
          out.push(`${job}-${usage}-${surface}-${tools}`);
        }
      }
    }
  }
  return out;
}

export function quizResultPath(answers: QuizAnswers): string {
  return `/harnesses/quiz/${quizCombo(answers)}`;
}

export function quizHasAnswers(answers: QuizAnswers): boolean {
  return Boolean(answers.job || answers.usage || answers.surface || answers.tools);
}

function usageNote(usage: QuizUsage | undefined): string {
  if (usage === 'hybrid') {
    return 'Hybrid (the same toggle as /calculator?usage=hybrid): keep private or always-on turns on the Radeon; send token-heavy reasoning to a cloud model the harness already supports. This page does not quote cloud prices.';
  }
  return 'Fully local (the same toggle as /calculator?usage=local): the box on the desk does the whole job. Prefer a harness that talks to 127.0.0.1 without a vendor proxy.';
}

export function pickHarness(answers: QuizAnswers, list: Harness[]): QuizResult {
  const usage = answers.usage;

  if (answers.job === 'image') {
    return {
      primary: requireId(list, 'comfyui'),
      alternates: [],
      reason:
        'Image and video graphs on ROCm PyTorch. ComfyUI does not speak llama-server /v1 — it is a different stack from the daily-driver GGUF.',
      usageNote: usageNote(usage),
    };
  }

  if (answers.job === 'chat') {
    if (answers.surface === 'desktop') {
      return {
        primary: requireId(list, 'lm-studio'),
        alternates: present(list, ['jan', 'anythingllm']),
        reason:
          'Desktop chat apps that also expose a local /v1. LM Studio’s documented server port is 1234; Jan’s is 1337. Pointing either *at* our llama-server is a UI check — Jan’s API-server page does not document that client path.',
        usageNote: usageNote(usage),
      };
    }
    const webAlts =
      usage === 'local' && answers.tools === 'no'
        ? present(list, ['llamacpp-webui', 'librechat', 'sillytavern'])
        : present(list, ['librechat', 'anythingllm', 'sillytavern', 'llamacpp-webui']);
    return {
      primary: requireId(list, 'open-webui'),
      alternates: webAlts,
      reason:
        'Browser chat against any OpenAI-compatible server. Open WebUI is the usual self-hosted pick. The llama.cpp built-in web UI is the zero-extra-process option on :8080.',
      usageNote: usageNote(usage),
    };
  }

  if (answers.surface === 'ide') {
    const alts = present(list, ['cline', 'roo', usage === 'hybrid' ? 'cursor' : '']);
    return {
      primary: requireId(list, 'continue'),
      alternates: alts,
      reason:
        'In-editor chat/edit/apply. Continue documents both an openai apiBase (…/v1) and a native llama.cpp provider. Cline and Roo are the other OpenAI-compatible IDE agents. Cursor’s Override OpenAI Base URL is BYOK and not a first-class localhost attach.',
      usageNote: usageNote(usage),
    };
  }

  if (answers.surface === 'web') {
    return {
      primary: requireId(list, 'openhands'),
      alternates: present(list, ['openclaw']),
      reason:
        'A browser software agent (OpenHands) or a multi-channel gateway (OpenClaw). Both attach to LLM_BASE_URL / a /v1 you already curled.',
      usageNote: usageNote(usage),
    };
  }

  if (answers.surface === 'desktop') {
    return {
      primary: requireId(list, 'hermes'),
      alternates: present(list, ['goose']),
      reason:
        'Hermes Agent is amdai’s daily setup on local-desktop — desktop/CLI on top of Strata :8083 and llama-server. Goose is the other local-first desktop/CLI agent with an OpenAI host override.',
      usageNote: usageNote(usage),
    };
  }

  return {
    primary: requireId(list, 'hermes'),
    alternates: present(list, ['aider', 'opencode', 'goose']),
    reason:
      'CLI agent on a local /v1. Hermes is used on our rig (local-desktop), pointed at Strata :8083 and llama-server. Aider and OpenCode are the other well-documented terminal attaches.',
    usageNote: usageNote(usage),
  };
}

export type SnippetTarget = 'llama' | 'strata';

export type EndpointSet = {
  target: SnippetTarget;
  label: string;
  port: number;
  host: string;
  v1: string;
  model: string;
  key: string;
};

export function endpointSet(file: HarnessesFile, target: SnippetTarget): EndpointSet {
  const port = target === 'strata' ? file.strata_port : file.llama_server_port;
  const host = `http://127.0.0.1:${port}`;
  return {
    target,
    label: target === 'strata' ? `Strata :${port}` : `llama-server :${port}`,
    port,
    host,
    v1: `${host}/v1`,
    model: file.model_placeholder,
    key: file.api_key_placeholder,
  };
}

export type HarnessSnippet = {
  id: string;
  title: string;
  language: string;
  filename?: string;
  note?: string;
  applicable: boolean;
  code: string;
};

function block(id: string, title: string, language: string, code: string, extra?: Partial<HarnessSnippet>): HarnessSnippet {
  return {
    id,
    title,
    language,
    applicable: extra?.applicable ?? true,
    code: code.replace(/^\n+/, '').replace(/\n+$/, '') + '\n',
    filename: extra?.filename,
    note: extra?.note,
  };
}

export function harnessSnippet(row: Harness, ep: EndpointSet): HarnessSnippet {
  const { v1, host, port, model, key, target, label } = ep;
  const strataTodo =
    target === 'strata'
      ? 'Exact Strata flags for our rig stay not recorded in stacks.yaml. This is the port only.'
      : 'Exact llama-server flags for our daily driver stay not recorded in stacks.yaml. This is the port only.';

  switch (row.snippet) {
    case 'hermes-yaml':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'yaml',
        `
# Hermes custom / OpenAI-compatible provider.
# Default probe is :8080. For Strata, set this URL or add detect_ports: [${port}].
# Re-check field names on the live providers + local-models pages if a key 404s.
model:
  default: ${model}   # must match llama-server --alias / GET /v1/models id
providers:
  custom:
    base_url: ${v1}
    # api_key is optional on custom; OPENAI_API_KEY is only for provider openai-api
# local_runtime.backend: auto | cuda | metal | vulkan | hip | cpu
# auto prefers Vulkan on AMD. Do not take the CUDA managed download on a Radeon.
# Docs require context ≥ 65536 or Hermes rejects the model at startup.
`,
        {
          filename: 'hermes config (custom provider)',
          note: `${strataTodo} 64K context minimum is documented.`,
        },
      );

    case 'openhands-env':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'bash',
        `
# Docs: LLM_BASE_URL + openai/<id> prefix. Docker must use host.docker.internal.
export LLM_BASE_URL=${v1}
export LLM_API_KEY=local-llm
export LLM_MODEL=openai/${model}
`,
        { filename: 'environment', note: strataTodo },
      );

    case 'aider-cli':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'bash',
        `
# --openai-api-key must be non-empty even locally.
aider --openai-api-base ${v1} \\
  --openai-api-key ${key} \\
  --model openai/${model}
`,
        { note: strataTodo },
      );

    case 'cline-fields':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'text',
        `
Provider: OpenAI Compatible
Base URL: ${v1}
API Key: ${key}
Model ID: ${model}
# Do not append /chat/completions to the base URL.
`,
        { note: strataTodo },
      );

    case 'roo-fields':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'text',
        `
Provider: OpenAI Compatible
Base URL: ${v1}
API Key: ${key}
Model ID: ${model}
# Roo docs: native OpenAI tool calling is required.
# Official local-models page names Ollama and LM Studio specifically.
`,
        { note: strataTodo },
      );

    case 'continue-yaml':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'yaml',
        `
# openai provider — apiBase includes /v1
name: Local ${target === 'strata' ? 'Strata' : 'llama-server'}
provider: openai
model: ${model}
apiBase: ${v1}
apiKey: ${key}
# capabilities: [tool_use]   # only if the server actually implements tools

# Native llama.cpp provider (docs: apiBase *without* /v1):
# provider: llama.cpp
# apiBase: ${host}
`,
        { filename: 'config.yaml', note: strataTodo },
      );

    case 'opencode-json':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'json',
        `
{
  "provider": {
    "llama": {
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "${v1}"
      },
      "models": {
        "${model}": {
          "limit": { "context": 128000 }
        }
      }
    }
  }
}
`,
        {
          filename: 'opencode.json',
          note: `${strataTodo} Docs example uses 128000 for limit.context — set yours to the server -c. Do not invent 262K here.`,
        },
      );

    case 'goose-env':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'bash',
        `
# OPENAI_HOST is the host root, not a BASE_URL. Default path is v1/chat/completions.
export OPENAI_HOST=${host}
export OPENAI_BASE_PATH=v1/chat/completions
export OPENAI_API_KEY=not-needed
export GOOSE_MODEL=${model}
`,
        { note: strataTodo },
      );

    case 'claude-code-env':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'bash',
        `
# Official path is Anthropic Messages. The client appends /v1/messages — do not put /v1 on the base.
# llama.cpp documents /v1/messages. We have not measured this pair on the rig.
export ANTHROPIC_BASE_URL=${host}
export ANTHROPIC_AUTH_TOKEN=${key}
claude --model ${model}
`,
        {
          note: `${strataTodo} Local attach is “where supported.” Completeness of Claude Code tools against llama.cpp Messages is not documented here.`,
        },
      );

    case 'codex-toml':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'toml',
        `
model = "${model}"
model_provider = "llama_local"

[model_providers.llama_local]
name = "${target === 'strata' ? 'Strata' : 'llama-server'}"
base_url = "${v1}"
wire_api = "responses"
env_key = "LOCAL_NOT_A_SECRET"
`,
        {
          filename: '~/.codex/config.toml',
          note:
            target === 'strata'
              ? 'Current official wire_api is responses only. llama.cpp documents POST /v1/responses. Strata Responses support is not documented — treat as not recorded.'
              : 'Current official wire_api is responses only. Reserved provider ids: openai, ollama, lmstudio. llama.cpp documents POST /v1/responses.',
        },
      );

    case 'cursor-override':
      return block(
        row.snippet,
        `${row.title} → custom OpenAI URL`,
        'text',
        `
Settings → Models
  OpenAI API Key: ${key}          # required to save the override
  Override OpenAI Base URL: https://your-reachable-host/v1
  Model: ${model}

# Forum staff (checked 2026-10-12): requests still go through Cursor’s backend,
# so http://127.0.0.1:${port} often fails. A public HTTPS URL is the workaround
# they describe — that is not air-gapped. Tab/autocomplete stay on Cursor models.
`,
        {
          applicable: false,
          note: 'Not a first-class localhost attach. local_ok is false; this is hybrid-shaped even when weights are local.',
        },
      );

    case 'openclaw-json':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'json',
        `
# ~/.openclaw/openclaw.json — attach keys from our earlier notes; re-check live docs.
{
  "models": {
    "providers": {
      "llama": {
        "baseUrl": "${v1}",
        "apiKey": "${key}",
        "models": [{ "id": "${model}" }]
      }
    }
  }
}
# vLLM path (different port): openai-completions at http://127.0.0.1:8000/v1
# Set VLLM_API_KEY even if dummy. Follow OpenClaw allowlists — do not bind to the internet for a first test.
`,
        {
          filename: '~/.openclaw/openclaw.json',
          note: `${strataTodo} Exact JSON shape: re-verify attach keys on https://docs.openclaw.ai/`,
        },
      );

    case 'open-webui-fields':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'text',
        `
Admin → Settings → Connections
  URL: ${v1}
  API Key: ${key}
# Docs show the same pattern with LM Studio at http://localhost:1234/v1.
# Docker: use host.docker.internal, not 127.0.0.1.
`,
        { note: strataTodo },
      );

    case 'lmstudio-url':
      return block(
        row.snippet,
        `${row.title} — documented server vs our :${port}`,
        'text',
        `
# Documented OpenAI-compat path: LM Studio *serves* on port 1234.
# Other clients call: http://127.0.0.1:1234/v1
#
# Pointing LM Studio *at* our ${label} (${v1}) is a current-UI check,
# not the documented server recipe.
`,
        {
          note: 'LM Studio’s own engine on Linux/Windows AMD is a separate stack from this site’s llama.cpp Vulkan daily driver.',
        },
      );

    case 'jan-url':
      return block(
        row.snippet,
        `${row.title} — documented server vs our :${port}`,
        'text',
        `
# Documented desktop API server: http://127.0.0.1:1337/v1
# Prefix /v1. Optional API key in Settings.
#
# Pointing Jan *at* our ${label} (${v1}) is not documented on the
# API-server page we opened — treat as check the current UI.
`,
        { note: 'Jan’s llama.cpp backend on AMD / HIP gfx1201 is not documented on that page.' },
      );

    case 'sillytavern-fields':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'text',
        `
API: Chat Completion
Source: Custom / OpenAI Compatible
Server URL: ${v1}
API Key: ${key}
`,
        { note: strataTodo },
      );

    case 'librechat-yaml':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'yaml',
        `
# librechat.yaml — endpoints.custom
endpoints:
  custom:
    - name: "${target === 'strata' ? 'Strata' : 'llama-server'}"
      apiKey: "\${LLAMA_KEY}"
      baseURL: "${v1}"
      models:
        default: ["${model}"]
        fetch: false
# Put LLAMA_KEY=${key} in .env (placeholder locally).
# Docker: host.docker.internal, not 127.0.0.1.
`,
        { filename: 'librechat.yaml', note: strataTodo },
      );

    case 'anythingllm-env':
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'bash',
        `
# docker/.env.example — generic OpenAI provider
LLM_PROVIDER=generic-openai
GENERIC_OPEN_AI_BASE_PATH=${v1}
GENERIC_OPEN_AI_MODEL_PREF=${model}
GENERIC_OPEN_AI_API_KEY=sk-123abc
# GENERIC_OPEN_AI_MODEL_TOKEN_LIMIT=   # set to the server window; do not invent 262K
`,
        { filename: '.env', note: strataTodo },
      );

    case 'llamacpp-webui':
      if (target === 'strata') {
        return block(
          row.snippet,
          `${row.title} → Strata`,
          'text',
          `
# not documented — Strata is a different server; do not assume it ships this UI.
# Open the llama-server UI on http://127.0.0.1:8080 instead, or use a chat harness against :8083/v1.
`,
          { applicable: false, note: 'Strata web UI is not documented.' },
        );
      }
      return block(
        row.snippet,
        `${row.title} → ${label}`,
        'text',
        `
# Same process as /v1. Open ${host}
# Disable with: llama-server --no-webui
# Bind 127.0.0.1 unless you mean to share.
`,
        { note: 'Daily-driver context is 262144; exact flags not recorded in stacks.yaml.' },
      );

    case 'herdr':
      return block(
        row.snippet,
        `${row.title} — not an LLM /v1 client`,
        'text',
        `
# Cited, not measured by AMDai.
# Herdr is a terminal workspace for coding agents you already run.
# It does not speak llama-server ${v1} or Strata.
# Official docs: https://herdr.dev/docs
# Shannon’s lab write-up is why this row exists: /labs/shannon
`,
        {
          applicable: false,
          note: 'Not a llama-server /v1 attach. Cited from Shannon’s How I run my Lab — not used on local-desktop.',
        },
      );

    case 'coolify':
      return block(
        row.snippet,
        `${row.title} — not an LLM /v1 client`,
        'text',
        `
# Cited, not measured by AMDai.
# Coolify is a self-hosted control plane for Docker workloads.
# It does not speak llama-server ${v1} or Strata.
# Official docs: https://coolify.io/docs/core/what-is-coolify
# Shannon’s lab write-up is why this row exists: /labs/shannon
`,
        {
          applicable: false,
          note: 'Not a llama-server /v1 attach. Cited from Shannon’s How I run my Lab — not used on local-desktop.',
        },
      );

    case 'comfyui':
      return block(
        row.snippet,
        `${row.title} — not an LLM /v1 client`,
        'bash',
        `
# AMD AI-ecosystem page: ROCm-enabled PyTorch, then:
python ComfyUI/main.py
# UI: http://127.0.0.1:8188
# Does not speak llama-server ${v1} or Strata. Instinct Docker tags are not R9700 pins.
`,
        {
          applicable: false,
          note: 'HIP/ROCm PyTorch, not llama.cpp Vulkan. Consumer gfx1201 support follows the PyTorch wheel.',
        },
      );

    default:
      return block(
        row.snippet || row.id,
        `${row.title} → ${label}`,
        'text',
        `# not documented — no first-party snippet id for ${row.id}.\n# Try base URL ${v1} and model ${model} only if the current UI offers an OpenAI-compatible field.\n`,
        { applicable: false, note: 'not documented' },
      );
  }
}

export function curlSnippet(file: HarnessesFile, target: SnippetTarget): HarnessSnippet {
  const ep = endpointSet(file, target);
  return block(
    `curl-${target}`,
    `Prove ${ep.label} before you debug the harness`,
    'bash',
    `
curl -s ${ep.v1}/models
curl -s ${ep.v1}/chat/completions \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${ep.key}' \\
  -d '{"model":"${ep.model}","messages":[{"role":"user","content":"Reply with the single word READY and nothing else."}],"max_tokens":8}'
`,
    {
      note:
        target === 'strata'
          ? 'Strata port 8083 is this site’s convention for the fast-agent stack. Exact serve flags stay not recorded.'
          : 'llama-server default in llama.cpp docs is 8080. Exact daily-driver flags stay not recorded.',
    },
  );
}

export function assertHarnessesValid(file: HarnessesFile): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const snippets = new Set<string>();
  let hermesUsed = false;

  if (!file.as_of) errors.push('missing as_of');
  if (file.llama_server_port !== 8080) errors.push('llama_server_port must be 8080');
  if (file.strata_port !== 8083) errors.push('strata_port must be 8083');

  for (const row of file.harnesses) {
    if (RESERVED.has(row.id)) errors.push(`${row.id} collides with a page slug`);
    if (ids.has(row.id)) errors.push(`duplicate id ${row.id}`);
    ids.add(row.id);
    if (!/^[a-z0-9-]+$/.test(row.id)) errors.push(`${row.id} is not a kebab slug`);
    if (!CATEGORY_SET.has(row.category)) errors.push(`${row.id} bad category`);
    if (!row.sources.length) errors.push(`${row.id} has no sources`);
    for (const source of row.sources) {
      if (!/^https:\/\//.test(source.href)) errors.push(`${row.id} non-https ${source.href}`);
    }
    if (!row.snippet) errors.push(`${row.id} missing snippet id`);
    if (snippets.has(row.snippet)) errors.push(`duplicate snippet ${row.snippet}`);
    snippets.add(row.snippet);
    if (row.id === 'hermes' && row.used_on_our_rig) hermesUsed = true;
    if (row.used_on_our_rig && row.id !== 'hermes') {
      errors.push(`${row.id} is marked used_on_our_rig — only hermes is`);
    }
    if (!row.homepage.startsWith('https://')) errors.push(`${row.id} homepage is not https`);
  }

  const required = [
    'hermes',
    'openhands',
    'aider',
    'cline',
    'roo',
    'continue',
    'opencode',
    'goose',
    'claude-code',
    'codex-cli',
    'cursor',
    'open-webui',
    'lm-studio',
    'jan',
    'sillytavern',
    'librechat',
    'anythingllm',
    'llamacpp-webui',
    'comfyui',
    'herdr',
    'coolify',
  ];
  for (const id of required) {
    if (!ids.has(id)) errors.push(`missing required harness ${id}`);
  }
  if (!hermesUsed) errors.push('hermes must be marked used_on_our_rig');

  const cursor = file.harnesses.find((row) => row.id === 'cursor');
  if (cursor?.local_ok) errors.push('cursor must not claim local_ok');
  if (cursor && !cursor.hybrid_ok) errors.push('cursor must be hybrid_ok');

  const comfy = file.harnesses.find((row) => row.id === 'comfyui');
  if (comfy && comfy.category !== 'image') errors.push('comfyui must be category image');

  return errors;
}
