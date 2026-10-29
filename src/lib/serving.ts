/**
 * /serving — several users on 1–2 Radeon cards.
 * llama.cpp first (-np, --split-mode). Third-party figures stay labeled.
 * Our-lab cells are the house 35B and Flash pair. No invented tok/s.
 */

import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';
import { PII_TEXT } from './pii-denylist';
import { officialLinks } from './site';

export const SERVING_PATH = '/serving';
export const SERVING_PUBLISHED = '2026-10-28';
export const SERVING_CHECKED = '2026-10-28';
export const SERVING_CITED_LABEL = 'Cited multi-user serving · llama.cpp first';

export const SERVING_TITLE = 'Serve many users on two Radeon cards';
export const SERVING_DESCRIPTION =
  'Serve several users on 1–2 Radeon cards. llama.cpp -np and --split-mode first. Third-party figures labeled. Our lab 35B and Flash. Q3 is a labeled estimate.';

export const SERVING_H1 = 'Serving many users on two Radeon cards: what works in 2026';
export const SERVING_PROJECT_HEADING = 'Open project: dual-Radeon serving kit (coming soon)';

export const SERVING_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const SERVING_LAB_35B = 102.39;
export const SERVING_LAB_FLASH_STRATA = 32.6;
export const SERVING_LAB_FLASH_LLAMA = 16;
export const SERVING_PORT = 8080;

export const LLAMA_SERVER_README =
  'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';
export const LLAMA_MULTI_GPU_MD =
  'https://github.com/ggml-org/llama.cpp/blob/master/docs/multi-gpu.md';

export type ServingLink = { href: string; label: string };

export type ServingSource = {
  id: string;
  title: string;
  href: string;
  checked: string;
  sourceDate: string;
  thirdParty: boolean;
};

export type ServingFaq = {
  id: string;
  question: string;
  answer: string;
  links: ServingLink[];
};

export type ServingStep = {
  id: string;
  title: string;
  body: string;
  links: ServingLink[];
};

export type ServingFigure = {
  id: string;
  label: string;
  value: string;
  source: string;
  thirdParty: boolean;
  ourLab: boolean;
};

export type ServingEngineRow = {
  id: string;
  engine: string;
  radeon: string;
  concurrency: string;
  source: string;
};

export type ServingGapRow = {
  need: string;
  llamacpp: string;
  strata: string;
  vllm: string;
  radiance: string;
};

export const SERVING_SOURCES: ServingSource[] = [
  {
    id: 'S-19378',
    title: 'llama.cpp PR #19378 — --split-mode tensor (experimental)',
    href: 'https://github.com/ggml-org/llama.cpp/pull/19378',
    checked: SERVING_CHECKED,
    sourceDate: 'merged 2026-04-09',
    thirdParty: true,
  },
  {
    id: 'S-MGPU',
    title: 'llama.cpp multi-gpu.md — layer / row / tensor',
    href: LLAMA_MULTI_GPU_MD,
    checked: SERVING_CHECKED,
    sourceDate: 'master, read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-27825',
    title: 'llama.cpp PR #27825 — HIP internal AllReduce',
    href: 'https://github.com/ggml-org/llama.cpp/pull/27825',
    checked: SERVING_CHECKED,
    sourceDate: 'merged 2026-09-15',
    thirdParty: true,
  },
  {
    id: 'S-25197',
    title: 'llama.cpp Discussion #25197 — 2× R9700 ROCm tensor-split numbers',
    href: 'https://github.com/ggml-org/llama.cpp/discussions/25197',
    checked: SERVING_CHECKED,
    sourceDate: '2026-07-01',
    thirdParty: true,
  },
  {
    id: 'S-B9788',
    title: 'llama.cpp b9788 — SYCL tensor-parallel all-reduce template',
    href: 'https://github.com/ggml-org/llama.cpp/releases/tag/b9788',
    checked: SERVING_CHECKED,
    sourceDate: '2026-06-25',
    thirdParty: true,
  },
  {
    id: 'S-25051',
    title: 'llama.cpp PR #25051 — Vulkan tensor-parallel all-reduce (open)',
    href: 'https://github.com/ggml-org/llama.cpp/pull/25051',
    checked: SERVING_CHECKED,
    sourceDate: 'opened 2026-06-26, updated 2026-10-27',
    thirdParty: true,
  },
  {
    id: 'S-25356',
    title: 'llama.cpp issue #25356 — Vulkan MoE batch cliff, closed',
    href: 'https://github.com/ggml-org/llama.cpp/issues/25356',
    checked: SERVING_CHECKED,
    sourceDate: '2026-07-06, closed 2026-10-15',
    thirdParty: true,
  },
  {
    id: 'S-CSV',
    title: 'Strix Halo server shootout CSV — llama-server -np scaling',
    href: 'https://raw.githubusercontent.com/hogeheer499-commits/strix-halo-guide/main/data/server_shootout.csv',
    checked: SERVING_CHECKED,
    sourceDate: 'measured 2026-05-05',
    thirdParty: true,
  },
  {
    id: 'S-REDDIT',
    title: 'r/ROCm — dual 7900 XTX chipset RCCL and Windows tensor-mode notes',
    href: 'https://www.reddit.com/r/ROCm/comments/1vyfisx/',
    checked: SERVING_CHECKED,
    sourceDate: '2026, read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-PUGET',
    title: 'Puget Systems — dual R9700 AI inference (vLLM vs llama.cpp)',
    href: 'https://www.pugetsystems.com/labs/articles/amd-radeon-ai-pro-r9700-dual-gpu-ai-inference-performance/',
    checked: SERVING_CHECKED,
    sourceDate: 'published 2026-08-18, modified 2026-09-10',
    thirdParty: true,
  },
  {
    id: 'S-L1T',
    title: 'Level1Techs — R9700 Linux TP=2 and TP=4 guide',
    href: 'https://forum.level1techs.com/t/amd-radeon-r9700-linux-tp2-and-tp4-the-definitive-guide/250504',
    checked: SERVING_CHECKED,
    sourceDate: '2026-05-22',
    thirdParty: true,
  },
  {
    id: 'S-RCCL2166',
    title: 'ROCm/rccl PR #2166 — Navi4 default tuning (open)',
    href: 'https://github.com/ROCm/rccl/pull/2166',
    checked: SERVING_CHECKED,
    sourceDate: 'open as of 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-40980',
    title: 'vLLM issue #40980 — TP=2 deadlock on dual R9700',
    href: 'https://github.com/vllm-project/vllm/issues/40980',
    checked: SERVING_CHECKED,
    sourceDate: 'open; comments through 2026-10-17',
    thirdParty: true,
  },
  {
    id: 'S-46190',
    title: 'vLLM PR #46190 — GDN Triton miscompile hangs TP≥2 startup',
    href: 'https://github.com/vllm-project/vllm/pull/46190',
    checked: SERVING_CHECKED,
    sourceDate: '2026, read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-VLLM-INSTALL',
    title: 'vLLM docs — RX 9000 / gfx1200–1201 GPU install',
    href: 'https://docs.vllm.ai/en/stable/getting_started/installation/gpu/',
    checked: SERVING_CHECKED,
    sourceDate: 'read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-AMD-VLLM',
    title: 'AMD ROCm docs — vLLM on Radeon, gfx1201 wheels',
    href: officialLinks.vllmAmd,
    checked: SERVING_CHECKED,
    sourceDate: 'read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-ROCM-MATRIX',
    title: 'ROCm 10.1 compatibility matrix — R9700, vLLM 0.29.0, SGLang 0.5.18',
    href: officialLinks.rocm10Matrix,
    checked: SERVING_CHECKED,
    sourceDate: 'read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-38086',
    title: 'vLLM PR #38086 — Triton FP8 MoE for gfx12',
    href: 'https://github.com/vllm-project/vllm/pull/38086',
    checked: SERVING_CHECKED,
    sourceDate: 'merged 2026-04-02',
    thirdParty: true,
  },
  {
    id: 'S-36659',
    title: 'vLLM PR #36659 — R9700 FP8 MoE tuned config (open)',
    href: 'https://github.com/vllm-project/vllm/pull/36659',
    checked: SERVING_CHECKED,
    sourceDate: 'open as of 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-GGUF',
    title: 'vLLM GGUF plugin — experimental, under-optimized',
    href: 'https://docs.vllm.ai/en/latest/features/quantization/gguf/',
    checked: SERVING_CHECKED,
    sourceDate: 'read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-VLLM-RAD',
    title: 'vllm-radiance — deprecated R9700 vLLM fork',
    href: 'https://codeberg.org/StillDeadcode/vllm-radiance',
    checked: SERVING_CHECKED,
    sourceDate: 'read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-RAD',
    title: 'Radiance engine — Apache-2.0 C++/HIP README',
    href: 'https://codeberg.org/StillDeadcode/radiance',
    checked: SERVING_CHECKED,
    sourceDate: 'repo created 2026-09-25, updated 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-RAD-GUIDE',
    title: 'Radiance GUIDE.md — 2× R9700 serve flags and published numbers',
    href: 'https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/GUIDE.md',
    checked: SERVING_CHECKED,
    sourceDate: 'read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-STRATA-HIP',
    title: 'Strata AMD_HIP.md — R9700 maintainer-tested HIP backend',
    href: 'https://raw.githubusercontent.com/Niko1221/Strata/master/docs/AMD_HIP.md',
    checked: SERVING_CHECKED,
    sourceDate: 'read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-STRATA-MGPU',
    title: 'Strata MULTI_GPU.md — pipeline windows, not tensor parallelism',
    href: 'https://github.com/niko1221/strata',
    checked: SERVING_CHECKED,
    sourceDate: 'read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-STRATA-BATCH',
    title: 'Strata BATCHING.md — opt-in slots and batch-groups',
    href: 'https://raw.githubusercontent.com/Niko1221/Strata/main/docs/BATCHING.md',
    checked: SERVING_CHECKED,
    sourceDate: 'read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-STRATA-465',
    title: 'Strata issue #465 — batching shipped in 0.1.39',
    href: 'https://github.com/niko1221/strata/issues/465',
    checked: SERVING_CHECKED,
    sourceDate: '2026-10-02 / 2026-10-04',
    thirdParty: true,
  },
  {
    id: 'S-AMD-SGL',
    title: 'AMD ROCm docs — SGLang; disable AITER on Radeon',
    href: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/inference/sglang.html',
    checked: SERVING_CHECKED,
    sourceDate: 'read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-SGL30599',
    title: 'SGLang issue #30599 — consumer Radeon / Instinct-only ROCm path',
    href: 'https://github.com/sgl-project/sglang/issues/30599',
    checked: SERVING_CHECKED,
    sourceDate: 'opened 2026-07-09, updated 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-SGL-FORK',
    title: 'Community SGLang RDNA4 fork — 2× R9700 TP=2 notes',
    href: 'https://github.com/mattbucci/2x-R9700-RDNA4-GFX1201-sglang-inference',
    checked: SERVING_CHECKED,
    sourceDate: 'sweep 2026-10-19',
    thirdParty: true,
  },
  {
    id: 'S-MLC',
    title: 'MLC-LLM CLI — tensor_parallel_shards',
    href: 'https://llm.mlc.ai/docs/deploy/cli.html',
    checked: SERVING_CHECKED,
    sourceDate: 'read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-EXL3',
    title: 'ExLlamaV3 releases — preliminary ROCm (v1.6.0+)',
    href: 'https://github.com/turboderp-org/exllamav3/releases',
    checked: SERVING_CHECKED,
    sourceDate: 'v1.6.0 2026-10-07 … v1.6.5 2026-10-25',
    thirdParty: true,
  },
  {
    id: 'S-LEMON',
    title: 'Lemonade issues — gfx1201 vllm-rocm reports',
    href: 'https://github.com/lemonade-sdk/lemonade/issues/2302',
    checked: SERVING_CHECKED,
    sourceDate: 'read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-OLLAMA',
    title: 'Ollama FAQ — OLLAMA_NUM_PARALLEL and multi-GPU placement',
    href: 'https://github.com/ollama/ollama/blob/main/docs/faq.mdx',
    checked: SERVING_CHECKED,
    sourceDate: 'read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-LLAMA-SERVER',
    title: 'llama.cpp llama-server README — -np / --parallel',
    href: LLAMA_SERVER_README,
    checked: SERVING_CHECKED,
    sourceDate: 'master, read 2026-10-28',
    thirdParty: true,
  },
  {
    id: 'S-LAB-35B',
    title: 'AMDai overnight 35B llama.cpp card — one R9700 UD-Q5_K_XL at 4K',
    href: '/benchmarks',
    checked: SERVING_CHECKED,
    sourceDate: 'Measured on our rig, 2026-10',
    thirdParty: false,
  },
  {
    id: 'S-LAB-FLASH',
    title: 'AMDai first-party Flash Q6 pair — Strata vs llama.cpp',
    href: '/models/flash',
    checked: SERVING_CHECKED,
    sourceDate: 'Measured on our rig, 2026-10',
    thirdParty: false,
  },
];

export function servingSource(id: string): ServingSource {
  const row = SERVING_SOURCES.find((item) => item.id === id);
  if (!row) throw new Error(`unknown serving source ${id}`);
  return row;
}

export const SERVING_LEAD = `
  Several clients on one or two Radeon AI PRO R9700 cards is a llama.cpp
  problem first. On one GPU, llama-server -np / --parallel plus continuous
  batching already scales. On two GPUs, the documented default is
  --split-mode layer (pipeline). --split-mode tensor is experimental.
  vLLM TP=2 and the Radiance engine can raise aggregate tok/s under load,
  and they carry gfx1201 bugs and format limits. Third-party numbers stay
  labeled. Our lab cells are the house 35B and Flash pair. ${COMPARE_Q3}
  is a labeled estimate (${COMPARE_Q3_CITE}). Q1/Q2 stay off.
`.replace(/\s+/g, ' ').trim();

export const SERVING_ANSWER = `
  llama.cpp handles concurrent requests well on one GPU. A third-party
  Strix Halo shootout (Qwen3.6-35B-A3B UD-Q4_K_M) saw aggregate tok/s
  climb from 58.8 at 1 slot to 189.7 at 16 on Vulkan, and from 48.6 to
  207.8 on a Lemonade ROCm build. Per-token latency rose with load:
  Vulkan p95 inter-token latency went from 16.2 ms to 81.9 ms. That is
  third-party, not an AMDai R9700 card. What llama.cpp lacks is fast
  multi-GPU serving. Puget’s third-party 2× R9700 layer-split run
  (Qwen3.6-27B Q4_K_M, --parallel 8) flattened at about 56 tok/s from
  4 to 8 users. The same article’s vLLM TP=2 stock build went from
  15.88 tok/s at 1 user to 156.21 at 8. Try vLLM or Radiance when a
  model does not fit one card and you need tensor-parallel throughput
  on bare metal — not as the daily driver.
`.replace(/\s+/g, ' ').trim();

export const SERVING_LAB = `
  Our lab, one R9700, llama.cpp Vulkan, ${SERVING_HOUSE_FILE}, 4K
  context: ${SERVING_LAB_35B} tok/s. That is a one-client overnight
  card, not a multi-user slot A/B. Our lab Flash Q6 pair at 262K:
  Strata about ${SERVING_LAB_FLASH_STRATA} tok/s versus llama.cpp
  about ${SERVING_LAB_FLASH_LLAMA} tok/s. Those Flash cells are not
  a 16-user serving table. Two copies of the 35B on two cards live
  on /qwen36-dual.
`.replace(/\s+/g, ' ').trim();

export const SERVING_LLAMA = `
  Start with one llama-server. Official -np / --parallel sets slot
  count (default -1 = auto; env LLAMA_ARG_N_PARALLEL). Continuous
  batching (-cb) is on unless you pass --no-cont-batching. GET /health
  prints total_slots. Usable context per client is total ctx / np
  unless you raise -c or set --kv-unified-per-slot. House daily driver
  stays -np 1 until several clients share the unit. Shopper flags for
  two cards are --split-mode layer (default, best batch throughput)
  and --split-mode tensor (experimental, aims at lower single-stream
  latency). Official docs: pipeline-parallel maximizes batch
  throughput; tensor-parallel minimizes latency. Tensor mode needs
  flash attention, an unquantized KV cache, and no --fit. Only CUDA
  is optimized. ROCm works through HIP. Vulkan tensor split is still
  an open PR. Tensor mode is not available on Windows (no P2P).
`.replace(/\s+/g, ' ').trim();

export const SERVING_SPLIT = `
  Pipeline (layer) split parks some layers on GPU 0 and the rest on
  GPU 1. One user’s decode still waits on both cards in sequence, so
  a single stream does not get faster. Extra users can fill the idle
  card, which is why layer split is the throughput layout. Tensor
  (row / experimental tensor) split cuts each layer across both cards
  and all-reduces activations. That can cut single-stream latency when
  the interconnect and all-reduce are healthy. On this desktop the
  cards sit on PCIe 5.0 x8/x8. Puget’s third-party P2P bandwidth on
  2× R9700 was 27.6 GB/s. RCCL hangs under KVM/VFIO in that article
  and works on bare metal. A GPU behind the chipset (no PCIe atomics)
  breaks RCCL.
`.replace(/\s+/g, ' ').trim();

export const SERVING_WHEN = `
  Stay on llama.cpp when the GGUF fits one 32 GB card, when you want
  the widest model list, or when gfx1201 has to stay boring. Raise
  -np on one process when Open WebUI, Hermes, and a phone share one
  unit. Pin one llama-server per card behind a router when two copies
  of a model that already fits beat a split — that is the measured
  /qwen36-dual layout. Try vLLM TP=2 on bare metal with
  NCCL_PROTO=Simple when you need continuous batching plus tensor
  parallel on a dense ~27B that does not fit one card, and you can
  live with FP8 (GGUF is an experimental plugin). Try Radiance when
  you want an Apache-2.0 C++/HIP server written for two 32 GB R9700s,
  you can convert off GGUF, and the architecture is on its curated
  list. Do not start a private vLLM gfx1201 fork — the deprecated
  vllm-radiance tree is the cautionary tale.
`.replace(/\s+/g, ' ').trim();

export const SERVING_PITFALLS = `
  RCCL 7.2.x has no gfx1201 tuning entry, so the LL protocol can
  deadlock. The third-party workaround is NCCL_PROTO=Simple. The
  ROCm/rccl Navi4 tuning PR is still open. vLLM issue #40980 (TP=2
  deadlock on dual R9700) is still open as of 2026-10-17; a maintainer
  wrote there is no official AITER support for gfx1201. A GDN Triton
  miscompile hangs TP≥2 startup for Qwen3.6 and Qwen3-Next. shm_broadcast
  hangs appear in vLLM ≥0.21.0 on that Level1Techs thread. A GPU behind
  the chipset fails RCCL. VMs hang RCCL; bare metal is the cited path.
  Windows has no tensor-mode P2P. Do not copy a one-client 35B tok/s
  onto an 8-user cell.
`.replace(/\s+/g, ' ').trim();

export const SERVING_STRATA = `
  Strata’s HIP backend lists the R9700 as maintainer-tested. Multi-GPU
  is layer split — explicitly not tensor parallelism. Pipeline windows
  took a third-party 2× R9700 decode from 103 to 125 tok/s. Batching
  is opt-in since 0.1.39 (issue #465: “not planned” on 2026-10-02,
  shipped 2026-10-04). Up to 8 slots per window; --batch-groups
  pipelines slot groups across cards. Third-party owner figures:
  4× R9700 and 8 clients, 166 vs 86 tok/s; on 2 GPUs, 109 vs 78;
  16 slots on 4× R9700, 324 tok/s. --batch-mtp on 2× R9700: 80.2 to
  62.7 tok/s. Showcase packs often sit below Q4, so they are not a
  house recipe. Batch windows have no sampling penalties.
`.replace(/\s+/g, ' ').trim();

export const SERVING_VLLM = `
  vLLM’s docs list RX 9000 / gfx1200–1201. AMD’s ROCm 10.1 matrix
  lists the R9700 with vLLM 0.29.0. AMD ships gfx1201 wheels. Puget’s
  third-party 2× R9700 table (Qwen3.6-27B, 500 in / 200 out) at
  concurrency 1 / 4 / 8: stock v0.20.2 FP8 TP=2 was 15.88 / 69.34 /
  156.21 tok/s; a tuned “vllm-radiance” build 32.0 / 110.6 / 198.8;
  tuned plus MTP 62.8 / 186.3 / 320.2. Wendell’s third-party 4× R9700
  notes: Llama-3.1-8B BF16 38.1 tok/s at TP1 and 65.1 at TP2;
  Qwen3.6-35B-A3B-FP8 17.2 at TP2 and 15.6 at TP4. That last pair is
  far below our lab one-card 35B Q5. FP8 MoE on gfx12 landed through
  Triton. An R9700-tuned config PR is still open. AWQ/GPTQ on AMD is
  patchy. GGUF moved to vllm-gguf-plugin; the docs call it experimental
  and under-optimized. The vllm-radiance Docker fork is deprecated.
`.replace(/\s+/g, ' ').trim();

export const SERVING_RADIANCE = `
  Radiance is an Apache-2.0 C++/HIP inference server. Bundled kernels
  target RDNA4 (gfx1200/1201). Serve flags are written for two 32 GB
  R9700s. APIs: OpenAI, Anthropic, and llama-server-compatible.
  Features: --tp 2/3/4/8, up to 32 sequences per step, FP8 / int8 /
  int4 / MXFP4 KV and weights, MTP/DFlash, and a lossy compressed TP
  wire (--tp-wire wht6). Published third-party 2× R9700 numbers:
  Qwen3.8-27B MXFP4 134–140 tok/s at 1 stream and 550–555 at 16;
  TranslateGemma 27B MXFP4 56 tok/s per stream and 205 at four. The
  guide notes MoE aggregate decode roughly doubles at batch 8 because
  routed-expert reads are per token. It does not serve GGUF directly;
  Q4_K / Q6_K / Q8_0 import through rad-convert for supported
  architectures. Model support is a curated list. The Codeberg repo
  was created 2026-09-25.
`.replace(/\s+/g, ' ').trim();

export const SERVING_PROJECT = `
  The dual-Radeon serving kit is an open project, coming soon. Milestone
  1 is a thin OpenAI-compatible router in front of one llama-server per
  card, plus an open benchmark harness. The router will use
  least-outstanding-tokens balancing with prefix and session affinity
  so prompt caches stay warm, health checks, and /metrics passthrough.
  Optional spill will route a model that does not fit one card to a
  TP or layer-split instance. The harness will drive 1, 2, 4, 8, and
  16 concurrent users and record TTFT, inter-token latency, and total
  tok/s. Weight files stay Q4 through Q6. Engines in the same harness:
  llama-server on ROCm and Vulkan (1 card, -sm layer, -sm tensor, and
  2 replicas plus the router), Strata when a Q4+ pack exists, vLLM
  ROCm FP8 TP=2 with NCCL_PROTO=Simple, and Radiance FP8 or 4-bit.
  No public repository is linked yet.
`.replace(/\s+/g, ' ').trim();

export const SERVING_ONE = `# One interactive user on one R9700 (house daily driver).
# llama-server README: -np / --parallel N (default -1 = auto).
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${SERVING_HOUSE_FILE} \\
  -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja \\
  -np 1 --host 127.0.0.1 --port ${SERVING_PORT}`;

export const SERVING_SLOTS = `# Shared server on one GPU: size per-slot context first.
# Official --kv-unified-per-slot N is the context limit per slot.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${SERVING_HOUSE_FILE} \\
  -ngl 99 --kv-unified-per-slot 32768 -np 4 \\
  --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port ${SERVING_PORT}`;

export const SERVING_LAYER = `# Two cards, pipeline split (documented default).
# llama.cpp multi-gpu.md: layer maximizes batch throughput.
./build-hip/bin/llama-server \\
  -m /path/to/nvme/${SERVING_HOUSE_FILE} \\
  -ngl 99 -c 32768 --split-mode layer --parallel 8 \\
  --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port ${SERVING_PORT}`;

export const SERVING_TENSOR = `# Two cards, experimental tensor split. CUDA is the optimized path.
# Requires flash attention, unquantized KV, and no --fit.
./build-hip/bin/llama-server \\
  -m /path/to/nvme/${SERVING_HOUSE_FILE} \\
  -ngl 99 -c 32768 --split-mode tensor -fa on \\
  --cache-type-k f16 --cache-type-v f16 --parallel 4 --jinja \\
  --host 127.0.0.1 --port ${SERVING_PORT}`;

export const SERVING_FIGURES: ServingFigure[] = [
  {
    id: 'lab-35b',
    label: 'Our lab · 35B UD-Q5_K_XL · one R9700 · 4K · llama.cpp Vulkan',
    value: `${SERVING_LAB_35B} tok/s`,
    source: 'S-LAB-35B',
    thirdParty: false,
    ourLab: true,
  },
  {
    id: 'lab-flash',
    label: 'Our lab · Flash Q6 at 262K · Strata vs llama.cpp',
    value: `${SERVING_LAB_FLASH_STRATA} vs ${SERVING_LAB_FLASH_LLAMA} tok/s`,
    source: 'S-LAB-FLASH',
    thirdParty: false,
    ourLab: true,
  },
  {
    id: 'strix-vk',
    label: 'Third-party · Strix Halo Vulkan · Qwen3.6-35B Q4_K_M · np 1→16',
    value: '58.8 → 96.1 → 138.8 → 170.9 → 189.7 tok/s',
    source: 'S-CSV',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'strix-rocm',
    label: 'Third-party · Strix Halo ROCm (Lemonade) · same file · np 1→16',
    value: '48.6 → 82.2 → 127.0 → 177.2 → 207.8 tok/s',
    source: 'S-CSV',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'strix-itl',
    label: 'Third-party · Strix Halo Vulkan p95 inter-token latency · np 1→16',
    value: '16.2 → 81.9 ms',
    source: 'S-CSV',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'puget-llama',
    label: 'Third-party · Puget 2× R9700 llama.cpp layer · Qwen3.6-27B Q4_K_M · c=1/4/8',
    value: '23.4 / 55.7 / 56.0 tok/s (TTFT 2,668 ms at c=8)',
    source: 'S-PUGET',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'puget-vllm',
    label: 'Third-party · Puget 2× R9700 vLLM 0.20.2 FP8 TP=2 · c=1/4/8',
    value: '15.88 / 69.34 / 156.21 tok/s',
    source: 'S-PUGET',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'puget-tuned',
    label: 'Third-party · Puget tuned vllm-radiance · c=1/4/8',
    value: '32.0 / 110.6 / 198.8 tok/s',
    source: 'S-PUGET',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'puget-mtp',
    label: 'Third-party · Puget tuned + MTP · c=1/4/8',
    value: '62.8 / 186.3 / 320.2 tok/s',
    source: 'S-PUGET',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'puget-p2p',
    label: 'Third-party · Puget 2× R9700 measured P2P bandwidth',
    value: '27.6 GB/s',
    source: 'S-PUGET',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'tp-27b',
    label: 'Third-party · 2× R9700 ROCm 7.2.4 · Qwen3-27B Q8_0 tg128',
    value: '1 GPU 19.50 → stock TP 28.30 → P2P AllReduce 30.43 tok/s',
    source: 'S-25197',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'tp-11b',
    label: 'Third-party · 2× R9700 ROCm 7.2.4 · Bielik-11B Q8_0 tg128',
    value: '45.09 → 55.06 → 61.22 tok/s',
    source: 'S-25197',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'hip-ar',
    label: 'Third-party · HIP AllReduce · RX 6800 XT + RX 9070 · gemma4 31B Q6_K',
    value: 'pp +15.9%, tg +2.2%',
    source: 'S-27825',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'sycl-tp',
    label: 'Third-party · SYCL TP template · dual Arc Pro B70 · 70B Q4_K_M',
    value: 'tg 17.40 vs 9.74 layer (+78.6%)',
    source: 'S-B9788',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'moe-cliff',
    label: 'Third-party · Vulkan MoE batch cliff fix (closed 2026-10-15)',
    value: '+56% at B=9, +34% at B=16 after raising thresholds',
    source: 'S-25356',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'strata-pipe',
    label: 'Third-party · Strata pipeline windows · 2× R9700 decode',
    value: '103 → 125 tok/s',
    source: 'S-STRATA-MGPU',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'strata-2gpu',
    label: 'Third-party · Strata batching · 2 GPUs, 8 clients',
    value: '109 vs 78 tok/s',
    source: 'S-STRATA-BATCH',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'strata-4gpu',
    label: 'Third-party · Strata batching · 4× R9700, 8 clients',
    value: '166 vs 86 tok/s',
    source: 'S-STRATA-BATCH',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'strata-16',
    label: 'Third-party · Strata · 16 slots on 4× R9700',
    value: '324 tok/s',
    source: 'S-STRATA-BATCH',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'strata-mtp',
    label: 'Third-party · Strata --batch-mtp · 2× R9700',
    value: '80.2 → 62.7 tok/s',
    source: 'S-STRATA-BATCH',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'l1t-8b',
    label: 'Third-party · Level1Techs · Llama-3.1-8B BF16 on R9700',
    value: '38.1 tok/s TP1, 65.1 tok/s TP2',
    source: 'S-L1T',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'l1t-35b',
    label: 'Third-party · Level1Techs · Qwen3.6-35B-A3B-FP8',
    value: '17.2 tok/s TP2, 15.6 tok/s TP4',
    source: 'S-L1T',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'rad-27b',
    label: 'Third-party · Radiance · Qwen3.8-27B MXFP4 · 2× R9700',
    value: '134–140 tok/s at 1 stream, 550–555 at 16',
    source: 'S-RAD-GUIDE',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'rad-gemma',
    label: 'Third-party · Radiance · TranslateGemma 27B MXFP4 · 2× R9700',
    value: '56 tok/s per stream, 205 at four',
    source: 'S-RAD',
    thirdParty: true,
    ourLab: false,
  },
  {
    id: 'sgl-fork',
    label: 'Third-party · community SGLang fork · Qwen3.6-35B-A3B AWQ short context',
    value: '67.0 tok/s',
    source: 'S-SGL-FORK',
    thirdParty: true,
    ourLab: false,
  },
];

export const SERVING_GAP: ServingGapRow[] = [
  {
    need: 'GGUF Q4–Q6 served directly',
    llamacpp: 'Yes',
    strata: 'Yes (own packs; many sit below Q4)',
    vllm: 'Plugin; docs call it experimental',
    radiance: 'Convert only',
  },
  {
    need: 'Single-GPU continuous batching',
    llamacpp: 'Yes (-np + -cb)',
    strata: 'Opt-in since 0.1.39 (Oct 2026)',
    vllm: 'Yes',
    radiance: 'Yes (up to 32 sequences)',
  },
  {
    need: 'Multi-GPU throughput under load',
    llamacpp: 'Layer split plateaus (third-party ~56 tok/s at 4–8 users)',
    strata: 'Pipelined groups',
    vllm: 'TP=2 (fragile on gfx1201)',
    radiance: 'TP=2',
  },
  {
    need: 'Multi-GPU latency (TP) on HIP',
    llamacpp: 'Experimental tensor; unquantized KV only',
    strata: 'No (pipeline only)',
    vllm: 'Yes, with open RCCL / AITER / Triton bugs',
    radiance: 'Yes',
  },
  {
    need: 'Vulkan tensor parallel',
    llamacpp: 'Open PR #25051 (2-device)',
    strata: 'Not applicable',
    vllm: 'Not applicable',
    radiance: 'Not applicable',
  },
  {
    need: 'Stability on gfx1201',
    llamacpp: 'House daily driver',
    strata: 'Maintainer-tested HIP',
    vllm: 'RCCL / AITER / Triton bugs',
    radiance: 'Young project (repo 2026-09-25)',
  },
  {
    need: 'Model breadth',
    llamacpp: 'Widest GGUF list',
    strata: 'Narrow showcase list',
    vllm: 'Wide, not GGUF-first',
    radiance: 'Curated architectures',
  },
];

export const SERVING_OTHER: ServingEngineRow[] = [
  {
    id: 'sglang',
    engine: 'SGLang',
    radeon:
      'AMD docs list the R9700 and say to disable AITER on Radeon. Upstream issue #30599 (updated 2026-10-28) says the ROCm path is Instinct-only.',
    concurrency:
      'TP plus radix batching on paper. A community fork with 73 patches runs TP=2 on 2× R9700 and targets single-user; Qwen3.6-35B-A3B AWQ 67.0 tok/s at short context (third-party).',
    source: 'S-AMD-SGL',
  },
  {
    id: 'mlc',
    engine: 'MLC-LLM',
    radeon: 'tensor_parallel_shards on ROCm and Vulkan. Docs reference ROCm 6.x. Vulkan TP has a Windows bug.',
    concurrency: 'Tensor parallel yes.',
    source: 'S-MLC',
  },
  {
    id: 'exl3',
    engine: 'ExLlamaV3',
    radeon:
      'Preliminary ROCm support (ROCm 10 only, gfx1100+) since v1.6.0 (2026-10-07). Later fixes for gfx11; TP/shmem fixes landed 2026-10-20.',
    concurrency: 'TP plus concurrent scheduling.',
    source: 'S-EXL3',
  },
  {
    id: 'lemonade',
    engine: 'Lemonade',
    radeon:
      'Ships llama.cpp ROCm builds. Its vllm-rocm gfx120X build is reported broken on gfx1201 (issues #2302 and vllm-rocm #19).',
    concurrency: 'llama.cpp or vLLM wrapper.',
    source: 'S-LEMON',
  },
  {
    id: 'ollama',
    engine: 'Ollama',
    radeon:
      'A model that fits one GPU loads on one GPU; otherwise it spreads across GPUs. No tensor parallel.',
    concurrency: 'OLLAMA_NUM_PARALLEL (default 1). Slots, no TP.',
    source: 'S-OLLAMA',
  },
];

export const SERVING_STEPS: ServingStep[] = [
  {
    id: 'one-gpu-slots',
    title: 'Serve several users on one card with -np',
    body: `Vulkan llama-server, ${SERVING_HOUSE_FILE}, f16 KV, loopback :${SERVING_PORT}. Start at -np 1. Raise -np only when several clients stream at once, and size --kv-unified-per-slot first. Slot tok/s on one R9700 stay not measured here — see /concurrency-ab. Q6/Q5/Q4 first. ${COMPARE_Q3} is a labeled estimate.`,
    links: [
      { href: '/concurrency-ab', label: 'Parallel slots' },
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'layer-or-copies',
    title: 'On two cards, prefer copies or layer split',
    body: 'If the GGUF fits one 32 GB card, two independent llama-server processes beat a split for aggregate tok/s. That is the measured /qwen36-dual soak. --split-mode layer is the documented default when one file must span both cards. It does not speed up one user.',
    links: [
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
    ],
  },
  {
    id: 'tensor-try',
    title: 'Treat --split-mode tensor as an experiment',
    body: 'PR #19378 merged 2026-04-09. CUDA is the optimized path. HIP works and was slower than layer split on the author’s mixed AMD setups. Requires -fa, f16 KV, and no --fit. Third-party 2× R9700 ROCm tg128: Qwen3-27B Q8_0 19.50 → 28.30 → 30.43 with a P2P AllReduce hack. Windows has no tensor mode.',
    links: [
      { href: '/flash-attention', label: 'Flash Attention' },
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
    ],
  },
  {
    id: 'when-vllm',
    title: 'Try vLLM TP=2 only on bare metal',
    body: 'Worth a try when you need continuous batching plus tensor parallel on a dense file that does not fit one card, and you can run FP8. Set NCCL_PROTO=Simple. Expect open RCCL, AITER, and Triton issues. GGUF is an experimental plugin. The vllm-radiance fork is deprecated.',
    links: [
      { href: '/backends', label: 'Backends' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/software', label: 'AI software' },
    ],
  },
  {
    id: 'when-radiance',
    title: 'Try Radiance for an R9700-native TP server',
    body: 'Apache-2.0 C++/HIP, flags written for two 32 GB R9700s, up to 32 sequences, --tp 2. Convert GGUF with rad-convert. Model list is curated. Published third-party 27B MXFP4 numbers are far above llama.cpp layer split — they are not our lab.',
    links: [
      { href: '/backends', label: 'Backends' },
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/methodology', label: 'How we test' },
    ],
  },
  {
    id: 'measure',
    title: 'Do not invent a 16-user tok/s',
    body: 'Our lab 35B and Flash cells are one-client or first-party Flash pairs. Multi-user tables on this page are third-party and linked. The coming dual-Radeon serving kit ships a harness for 1/2/4/8/16 users, TTFT, inter-token latency, and total tok/s on Q4–Q6 only. No repository is linked yet.',
    links: [
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/results', label: 'Run cards' },
      { href: '/methodology', label: 'How we test' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
  },
];

export const SERVING_HOWTO_STEPS = SERVING_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SERVING_FAQ: ServingFaq[] = [
  {
    id: 'what-works',
    question: 'What works today for several users on 1–2 Radeon cards?',
    answer:
      'llama.cpp first. On one GPU use llama-server -np / --parallel. On two GPUs use --split-mode layer, or two pinned servers when the file fits one card. --split-mode tensor is experimental. vLLM TP=2 and Radiance are tries when you need tensor parallel and can live with their limits. Q3 is a labeled estimate. llama.cpp first.',
    links: [
      { href: '/serving', label: 'Serving' },
      { href: '/concurrency-ab', label: 'Parallel slots' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'which-flags',
    question: 'Which llama.cpp flags should I set for multi-user serving?',
    answer:
      'Slots: -np / --parallel, plus --kv-unified-per-slot so each client keeps a usable window. Two cards: --split-mode layer (default) or experimental --split-mode tensor with -fa on and f16 KV. Continuous batching stays on unless you pass --no-cont-batching. House recipes stay Q4 and up.',
    links: [
      { href: '/serving', label: 'Serving' },
      { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
      { href: '/flash-attention', label: 'Flash Attention' },
    ],
  },
  {
    id: 'when-others',
    question: 'When are vLLM or Radiance worth trying on two R9700s?',
    answer:
      'When a model does not fit one card and you need tensor-parallel throughput under several users. vLLM: bare metal, NCCL_PROTO=Simple, FP8, open gfx1201 bugs. Radiance: Apache-2.0 C++/HIP for two 32 GB R9700s, convert off GGUF, curated models. Stay on llama.cpp for GGUF breadth and gfx1201 stability. Third-party tok/s stay labeled.',
    links: [
      { href: '/serving', label: 'Serving' },
      { href: '/backends', label: 'Backends' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
    ],
  },
];

export const SERVING_HUB_LINKS: ServingLink[] = [
  { href: '/backends', label: 'Backends' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/backends/strata', label: 'Strata' },
  { href: '/concurrency-ab', label: 'Parallel slots' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU' },
  { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
  { href: '/qwen36-dual', label: '35B on two cards' },
  { href: '/flash-attention', label: 'Flash Attention' },
  { href: '/kv-cache', label: 'KV cache' },
  { href: '/setup/server', label: 'Always-on server' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/models/flash', label: 'Flash' },
  { href: '/stack-lab', label: 'Stack Lab' },
];

export const REQUIRED_SERVING_HREFS = [
  '/backends',
  '/backends/llamacpp',
  '/backends/strata',
  '/concurrency-ab',
  '/multi-gpu',
  '/setup/multi-gpu',
  '/qwen36-dual',
  '/flash-attention',
  '/kv-cache',
  '/setup/server',
  '/gpus/r9700',
  '/benchmarks',
  '/models/flash',
  '/stack-lab',
  '/methodology',
  '/results',
  '/software',
  '/rocm-problems',
  '/compare/vulkan-vs-rocm',
] as const;

export function servingBlob(): string {
  return [
    SERVING_TITLE,
    SERVING_DESCRIPTION,
    SERVING_H1,
    SERVING_CITED_LABEL,
    SERVING_LEAD,
    SERVING_ANSWER,
    SERVING_LAB,
    SERVING_LLAMA,
    SERVING_SPLIT,
    SERVING_WHEN,
    SERVING_PITFALLS,
    SERVING_STRATA,
    SERVING_VLLM,
    SERVING_RADIANCE,
    SERVING_PROJECT,
    SERVING_PROJECT_HEADING,
    SERVING_ONE,
    SERVING_SLOTS,
    SERVING_LAYER,
    SERVING_TENSOR,
    ...SERVING_STEPS.map((row) => `${row.title} ${row.body}`),
    ...SERVING_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...SERVING_FIGURES.map((row) => `${row.label} ${row.value} ${row.ourLab ? 'our lab' : ''} ${row.thirdParty ? 'third-party' : ''}`),
    ...SERVING_GAP.map((row) => `${row.need} ${row.llamacpp} ${row.strata} ${row.vllm} ${row.radiance}`),
    ...SERVING_OTHER.map((row) => `${row.engine} ${row.radeon} ${row.concurrency}`),
    ...SERVING_SOURCES.map((row) => `${row.title} ${row.checked} ${row.sourceDate} ${row.thirdParty ? 'third-party' : 'our lab'}`),
  ].join('\n');
}

export function servingHrefs(): string[] {
  const links = [
    ...SERVING_HUB_LINKS,
    ...SERVING_STEPS.flatMap((step) => step.links),
    ...SERVING_FAQ.flatMap((row) => row.links),
    ...SERVING_SOURCES.filter((row) => row.href.startsWith('/')).map((row) => ({
      href: row.href,
      label: row.title,
    })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function buildServingPayload() {
  return {
    schema_version: '1.0',
    as_of: SERVING_CHECKED,
    href: 'https://amdai.net/serving',
    title: SERVING_TITLE,
    recommendation:
      'llama.cpp first. Use -np / --parallel on one GPU. Use --split-mode layer or two pinned servers on two cards. Try vLLM TP=2 or Radiance only when tensor-parallel throughput is the job.',
    flags: [
      { flag: '-np / --parallel', when: 'Several clients on one llama-server' },
      { flag: '--kv-unified-per-slot', when: 'Size context per slot before raising -np' },
      { flag: '--split-mode layer', when: 'One file across two GPUs; best batch throughput' },
      { flag: '--split-mode tensor', when: 'Experimental TP; needs -fa and f16 KV; CUDA-optimized' },
    ],
    our_lab: SERVING_FIGURES.filter((row) => row.ourLab).map((row) => ({
      label: row.label,
      value: row.value,
      href: servingSource(row.source).href,
      checked: servingSource(row.source).checked,
    })),
    third_party: SERVING_FIGURES.filter((row) => row.thirdParty).map((row) => ({
      label: row.label,
      value: row.value,
      source: servingSource(row.source).href,
      checked: servingSource(row.source).checked,
      source_date: servingSource(row.source).sourceDate,
    })),
    engines: SERVING_GAP,
    other_engines: SERVING_OTHER.map((row) => ({
      engine: row.engine,
      radeon: row.radeon,
      concurrency: row.concurrency,
      source: servingSource(row.source).href,
      checked: servingSource(row.source).checked,
    })),
    project: {
      name: 'Dual-Radeon serving kit',
      status: 'coming soon',
      router: 'OpenAI-compatible router in front of one llama-server per card',
      harness: 'Open benchmark at 1/2/4/8/16 users: TTFT, inter-token latency, total tok/s',
      quants: 'Q4 through Q6',
      repository: null,
    },
    sources: SERVING_SOURCES.map((row) => ({
      id: row.id,
      title: row.title,
      href: row.href.startsWith('http') ? row.href : `https://amdai.net${row.href}`,
      checked: row.checked,
      source_date: row.sourceDate,
      third_party: row.thirdParty,
    })),
  };
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');
const HOME_PATH = /\/home\/|\/Users\/|C:\\Users\\/i;

export function assertServingValid(): string[] {
  const errors: string[] = [];
  const blob = servingBlob();
  if (SERVING_PATH !== '/serving') errors.push('path');
  if (SERVING_PUBLISHED !== '2026-10-28') errors.push('published');
  if (SERVING_TITLE.length < 8) errors.push('title short');
  if (SERVING_DESCRIPTION.length < 70 || SERVING_DESCRIPTION.length > 160) {
    errors.push(`description length ${SERVING_DESCRIPTION.length}`);
  }
  if (!/AMDai/.test(blob)) errors.push('must say AMDai');
  if (!/llama\.cpp/.test(blob)) errors.push('must say llama.cpp');
  if (!/--parallel/.test(blob)) errors.push('must cite --parallel');
  if (!/-np/.test(blob)) errors.push('must cite -np');
  if (!/--split-mode/.test(blob)) errors.push('must cite --split-mode');
  if (!/tensor/.test(blob)) errors.push('must cite tensor');
  if (!/vLLM/.test(blob)) errors.push('must mention vLLM');
  if (!/Radiance/.test(blob)) errors.push('must mention Radiance');
  if (!/Strata/.test(blob)) errors.push('must mention Strata');
  if (!blob.includes(SERVING_PROJECT_HEADING)) errors.push('project heading');
  if (!/coming soon/i.test(blob)) errors.push('project coming soon');
  if (!/router/.test(blob)) errors.push('must describe router');
  if (!/1, 2, 4, 8, and 16/.test(blob) && !/1\/2\/4\/8\/16/.test(blob)) {
    errors.push('must list 1/2/4/8/16 users');
  }
  if (!/TTFT/.test(blob)) errors.push('must mention TTFT');
  if (!/inter-token/.test(blob)) errors.push('must mention inter-token latency');
  if (!/Q4 through Q6|Q4–Q6|Q4 through Q6/.test(blob)) errors.push('must keep Q4–Q6 harness');
  if (!blob.includes(String(SERVING_LAB_35B))) errors.push('our lab 35B');
  if (!blob.includes(String(SERVING_LAB_FLASH_STRATA))) errors.push('our lab Flash Strata');
  if (!/\bour lab\b/i.test(blob)) errors.push('must say our lab');
  if (!/third-party/i.test(blob)) errors.push('must label third-party');
  if (!blob.includes(COMPARE_Q3)) errors.push('q3 row');
  if (!/labeled estimate/.test(blob)) errors.push('q3 labeled');
  if (/needs? re-?measure/i.test(blob)) errors.push('must omit re-measure notes');
  if (/archived 2026-03-21|TGI archive/i.test(blob)) errors.push('unverified TGI archive date');
  if (/Aphrodite/i.test(blob)) errors.push('unverified Aphrodite status');
  if (BANNED.test(blob)) errors.push('banned model name');
  if (Q1Q2.test(blob)) errors.push('q1/q2 visible');
  if (Q4_FLOOR.test(blob)) errors.push('q4-floor wording');
  if (/TODO|TBD|FIXME|lorem ipsum/i.test(blob)) errors.push('leftover copy');
  if (PII_TEXT.test(blob) || HOME_PATH.test(blob)) errors.push('PII');
  if (SERVING_FIGURES.some((row) => row.ourLab === row.thirdParty)) {
    errors.push('figure must be our lab or third-party, not both');
  }
  if (!SERVING_FIGURES.every((row) => SERVING_SOURCES.some((source) => source.id === row.source))) {
    errors.push('figure missing source');
  }
  if (SERVING_SOURCES.some((row) => !row.checked || !row.sourceDate || !row.href)) {
    errors.push('source missing date or href');
  }
  const hrefs = servingHrefs();
  for (const required of REQUIRED_SERVING_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}
