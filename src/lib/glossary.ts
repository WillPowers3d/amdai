/**
 * Consumer glossary for /glossary.
 * Plain-English jargon the rest of AMDai uses. No invented prices or tok/s.
 * Cite official local-desktop cards only when a figure helps; otherwise link /results.
 */

export type GlossaryLink = {
  href: string;
  label: string;
};

export type GlossaryEntry = {
  id: string;
  term: string;
  aliases: string[];
  letter: string;
  definition: string;
  why: string;
  /** Optional expert note. Shown under a collapsed “Go deeper” — keep the definition first. */
  deeper?: string;
  links: GlossaryLink[];
  seeAlso: string[];
};

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** Required consumer terms from the 2026-10-13 Lab Notes brief. */
export const REQUIRED_GLOSSARY_IDS = [
  'rocm',
  'rdna4',
  'gfx1201',
  'r9700',
  'vram',
  'system-ram',
  'kv-cache',
  'context-length',
  'gguf',
  'quant',
  'moe',
  'offload',
  'expert-offload',
  'llamacpp',
  'strata',
  'vllm',
  'prefill-decode',
  'amdai-bench',
  'run-card',
  'abliterated',
  'nvme',
  'dual-gpu',
  'vulkan',
  'hip',
  'rebar',
] as const;

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: 'abliterated',
    term: 'Abliterated',
    aliases: ['abliteration', 'refusal edit'],
    letter: 'A',
    definition:
      'A weight edit that weakens a model’s refusal behavior. The file still looks like a GGUF; the change is inside the tensors, not a different architecture.',
    why: 'On a home Radeon box it is educational only — never the default first file. Official instruct comes first; you are responsible for what you run. Quality can drop, and AMDai has no tested-on-our-rig abliterated pick.',
    deeper:
      'Abliteration is a tensor edit, not a new architecture. Vet the uploader and the file hash. Calculator share links exist only for the official control. Q3 is estimate/community unless measured; Q1/Q2 stay off.',
    links: [
      { href: '/abliterated', label: 'Abliterated hub' },
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
      { href: '/stacks', label: 'Recommended stacks' },
    ],
    seeAlso: ['instruct', 'gguf', 'house-rules'],
  },
  {
    id: 'amdai',
    term: 'AMDai',
    aliases: ['amdai.net', 'R9700 Lab Notes', 'og:site_name'],
    letter: 'A',
    definition:
      'The display wordmark for this notebook (AMDai · R9700 Lab Notes). Domain, URLs, package names, and amdai-bench stay lowercase. Open Graph site_name is the lowercase string amdai.',
    why: 'The header says AMDai; the address bar says amdai.net. Same project — mixed-case is display-only so it is not confused with AMD’s logo or an official AMD publication.',
    links: [
      { href: '/start', label: 'Getting started' },
      { href: '/credits', label: 'Credits' },
      { href: '/faq', label: 'FAQ' },
    ],
    seeAlso: ['amdai-bench', 'local-desktop'],
  },
  {
    id: 'amdai-bench',
    term: 'amdai-bench',
    aliases: ['amdai-bench/run@1', 'run@1', 'bench schema'],
    letter: 'A',
    definition:
      'The first-party measurement schema this site uses. A validating card is tagged amdai-bench/run@1 and records hardware, software pins, the launch command, and tok/s. The product name stays lowercase.',
    why: 'Home numbers on AMDai come from these cards, not from a scraped leaderboard. If a page cites 102.39 tok/s or 42.9 GB RAM, a run card is the source.',
    deeper:
      'Schema id is amdai-bench/run@1. Cards record GPU layout (single / split / dual-instance), the launch command, prefill and decode tok/s, VRAM per card, and peak_system_ram_gb when sampled. The 2026-10-12 overnight drop is 33 cards, pending re-verify after the DDR5 oops.',
    links: [
      { href: '/results', label: 'Official run cards' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/qwen', label: 'Qwen compare' },
    ],
    seeAlso: ['run-card', 'prefill-decode', 'local-desktop'],
  },
  {
    id: 'backend',
    term: 'Backend',
    aliases: ['inference engine', 'engine'],
    letter: 'B',
    definition:
      'The program that loads weights and emits tokens — llama.cpp, Strata, or vLLM on this site. A harness (Hermes, a chat UI) sits above a backend; it is not a substitute for one.',
    why: 'Pick the engine before you debug the card. AMDai’s consumer default is llama.cpp (Vulkan first). Strata is the Flash try; vLLM is a multi-client serve try.',
    deeper:
      'Chooser order: llama.cpp (Vulkan if HIP CMake sulks), then Strata for Flash, then vLLM only for several clients. Ollama and desktop GUIs are try-if-the-meter-moves. Compare them on /backends — no invented tok/s.',
    links: [
      { href: '/backends', label: 'Inference engines' },
      { href: '/software', label: 'AI software' },
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
    ],
    seeAlso: ['llamacpp', 'strata', 'vllm'],
  },
  {
    id: 'context-length',
    term: 'Context length',
    aliases: ['context', '4K', '32K', '128K', '256K', '262K', '-c'],
    letter: 'C',
    definition:
      'How many tokens of prompt plus conversation the model can keep in the KV cache. House daily driver on one R9700 is 262144 (262K). Tables on this site also show 4K, 32K, 128K, and 256K because speed and RAM change with length.',
    why: 'Longer context grows KV and usually slows decode. Official UD-Q5_K_XL on local-desktop: 102.39 tok/s at 4K and 44.4 tok/s at 256K — same file, one GPU, f16 KV. Size the window on the calculator before you set -c.',
    deeper:
      'House -c 262144 is the 262K daily-driver window. Tables also publish 4K, 32K, 128K, and 256K because KV and decode move. Official UD-Q5_K_XL 1-GPU: 102.39 / 90.52 / 66.43 / 44.4 tok/s at those four lengths.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/results', label: 'Run cards' },
    ],
    seeAlso: ['kv-cache', 'prefill-decode', 'quant'],
  },
  {
    id: 'daily-driver',
    term: 'Daily driver',
    aliases: ['qwen-reliable', 'house default'],
    letter: 'D',
    definition:
      'The stack AMDai tells a newcomer to run first: Qwen3.6-35B-A3B Unsloth UD-Q5_K_XL on one R9700, llama.cpp Vulkan, 262K context, f16 KV, no RAM offload.',
    why: 'It is the measured in-VRAM path on a 32 GB card. Official 1-GPU cards: 102.39 tok/s at 4K, 90.52 at 32K, 66.43 at 128K, 44.4 at 256K. Do not start with Flash, vLLM, or an abliterated file.',
    deeper:
      'Recipe id qwen36-35b.llamacpp-vulkan.262k — one R9700, Vulkan, 262K, UD-Q5_K_XL. Stack Lab profile qwen-reliable is the same pick. Q3 35B listings stay estimates unless a card says measured.',
    links: [
      { href: '/stacks', label: 'Stacks' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '262K recipe' },
    ],
    seeAlso: ['qwen36', 'llamacpp', 'quant'],
  },
  {
    id: 'dual-gpu',
    term: 'Dual-GPU',
    aliases: ['two cards', 'two copies', 'split', 'tensor parallel'],
    letter: 'D',
    definition:
      'Two R9700s can run two full copies of a model (two clients) or one split / tensor-parallel copy (one larger or shared request). They are different layouts; AMDai does not treat “two GPUs” as free 2× speed.',
    why: 'On local-desktop, two copies of UD-Q5_K_XL sit near 100 tok/s per request. A split 4K pass is 82.78 tok/s total versus 102.39 on one card. Prefer two copies unless you deliberately need one shared context. House rule: one LLM per GPU unless you combine on purpose.',
    deeper:
      'Layouts on amdai-bench cards: single, split, dual-instance. Two copies: about 100 tok/s per request, 172 at two concurrent, 177 at 4–8, 423 soak requests, 0 errors. Split 4K max total 82.78 versus 102.39 on one card.',
    links: [
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
      { href: '/calculator', label: 'Calculator' },
    ],
    seeAlso: ['r9700', 'offload', 'run-card'],
  },
  {
    id: 'expert-offload',
    term: 'Expert offload',
    aliases: ['-ot', '--n-cpu-moe', 'CPU MoE', 'tensor override'],
    letter: 'E',
    definition:
      'A llama.cpp MoE trick: keep attention on the GPU and park expert tensors in system RAM. The flags are -ot (tensor override regex) and --n-cpu-moe (how many experts stay on CPU).',
    why: 'Flash-class GGUFs do not fit 32 GB VRAM. The launch shape lives on Flash RAM offload — exact -ot regex and --n-cpu-moe N from the rig owner are not recorded. Do not invent flag values; copy the shape and measure.',
    deeper:
      'Shape only: llama-server -ngl 99 -c 262144 --n-cpu-moe not recorded -ot not recorded --cache-type-k/v f16. Copy that skeleton from Flash RAM offload; do not invent the regex or N.',
    links: [
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/flash-daily', label: 'Flash daily driver' },
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
    ],
    seeAlso: ['offload', 'moe', 'flash'],
  },
  {
    id: 'fast-agent',
    term: 'Fast agent',
    aliases: ['qwen-fast-agent', 'agent stack'],
    letter: 'F',
    definition:
      'The house speed path after the daily driver works: Qwen 3.8 Flash Unsloth UD-Q6_K_XL on Strata v0.1.42, usually with RAM offload, pointed at a harness.',
    why: 'First-party Flash on our rig is about 32.6 tok/s on Strata versus about 16 on llama.cpp (2026-10). It is not the first box you should build; get official instruct generating first.',
    deeper:
      'Stack Lab profile qwen-fast-agent is this path. Get official instruct generating on llama.cpp first; then point a harness at Strata :8083. Q3 Flash rows stay estimates unless measured.',
    links: [
      { href: '/stacks', label: 'Stacks' },
      { href: '/flash-daily', label: 'Flash daily driver' },
      { href: '/backends/strata', label: 'Strata' },
    ],
    seeAlso: ['flash', 'strata', 'daily-driver'],
  },
  {
    id: 'flash',
    term: 'Qwen 3.8 Flash',
    aliases: ['Flash', 'Flash-Next', 'UD-Q6_K_XL'],
    letter: 'F',
    definition:
      'The large fast-agent GGUF on this site (Unsloth UD-Q6_K_XL listing ~169 GB). It is a different model from the 35B daily driver and usually needs DDR5 expert offload on a pair of 32 GB cards.',
    why: 'Do not download Flash to “make the 35B faster.” Size it on Flash daily / RAM offload; Q3 Flash rows are estimates unless measured. Q1/Q2 stay off, including draft heads.',
    deeper:
      'Publisher UD-Q6_K_XL folder ~169 GB. Two-card Strata at 262K: 32.8 tok/s at 8K/32K, 31.8 at 100K on the Flash daily page. Recipe: qwen38-flash.strata.262k. Q3 Flash rows stay estimates unless measured.',
    links: [
      { href: '/flash-daily', label: 'Flash daily driver' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/recipes/qwen38-flash.strata.262k', label: 'Flash Strata recipe' },
    ],
    seeAlso: ['fast-agent', 'expert-offload', 'quant'],
  },
  {
    id: 'gfx1201',
    term: 'gfx1201',
    aliases: ['LLVM target', 'GFX1201', 'RDNA4 target'],
    letter: 'G',
    definition:
      'The LLVM / ISA target for RDNA 4 Radeon cards — Radeon AI PRO R9700 and the RX 9070 series on current ROCm tables. rocminfo and llama.cpp --list-devices should show it before you download 20 GB.',
    why: 'Wrong gfx means HIP kernels miss and you silently land on CPU. Confirm gfx1201 after install; do not use unofficial HSA_OVERRIDE on this SKU.',
    deeper:
      'HSA_OVERRIDE_GFX_VERSION is unofficial and not needed on official gfx1201 + current ROCm. Confirm with rocminfo and llama.cpp --list-devices before you download weights.',
    links: [
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/gpus', label: 'GPU directory' },
      { href: '/tutorials/verify-rocm', label: 'Verify GPU and ROCm' },
    ],
    seeAlso: ['rdna4', 'r9700', 'rocm'],
  },
  {
    id: 'gguf',
    term: 'GGUF',
    aliases: ['.gguf', 'ggml file'],
    letter: 'G',
    definition:
      'The llama.cpp weight-file format: one (or a few) files that already include a quant, tokenizer, and metadata. It is not a PyTorch checkpoint and not what vLLM wants by default.',
    why: 'Every house recipe on a Radeon box starts from a GGUF on NVMe. Pin a revision; prefer the Unsloth UD names on /stacks. Stage the file before you tune flags.',
    deeper:
      'Daily-driver file: unsloth/Qwen3.6-35B-A3B-GGUF · Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf (publisher 26.6 GB). Pin a revision. vLLM does not want GGUF as its default path.',
    links: [
      { href: '/quants', label: 'Quants' },
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
      { href: '/models', label: 'Models' },
    ],
    seeAlso: ['quant', 'unsloth-ud', 'nvme'],
  },
  {
    id: 'hip',
    term: 'HIP',
    aliases: ['AMD HIP', 'GGML_HIP', 'rocm backend'],
    letter: 'H',
    definition:
      'AMD’s C++ GPU compute API. llama.cpp can compile a HIP backend when /opt/rocm is clean. HIP is not CUDA and not a drop-in replacement.',
    why: 'On AMDai, HIP is optional — Vulkan llama.cpp is what we run for the 35B daily driver. Try HIP after rocminfo is boring; do not block first tokens on a HIP CMake fight.',
    deeper:
      'Compile GGML_HIP only after /opt/rocm and rocminfo show gfx1201. Family packages are gfx-specific; a gfx1100 tree is the wrong binary. HIPRTC and rocBLAS live on the ROCm-guide pages, not here.',
    links: [
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/backends', label: 'Backends' },
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
    ],
    seeAlso: ['vulkan', 'llamacpp', 'rocm'],
  },
  {
    id: 'house-rules',
    term: 'House rules',
    aliases: ['consumer house rules', 'how we pick'],
    letter: 'H',
    definition:
      'How AMDai picks a stack: llama.cpp first; prefer Q5 over Q4; Q3 listed as estimate or community unless measured; Q1/Q2 stay off; GGUFs on NVMe, not a spinning disk; one LLM per GPU unless you deliberately combine.',
    why: 'These rules keep a first Radeon box out of folklore. Q3 rows exist and are labeled estimate unless measured. They are also not a license to invent tok/s.',
    deeper:
      'llama.cpp over vLLM for a first box; Q5 over Q4 when both fit; Q3 listed; Q1/Q2 excluded; NVMe; one LLM per GPU. Budget and calculator follow the same list — Q3 rows appear as labeled estimates.',
    links: [
      { href: '/start', label: 'Getting started' },
      { href: '/budget', label: 'Budget' },
      { href: '/quants', label: 'Quants' },
    ],
    seeAlso: ['quant', 'llamacpp', 'nvme'],
  },
  {
    id: 'instruct',
    term: 'Official instruct',
    aliases: ['instruct GGUF', 'chat template', 'jinja'],
    letter: 'I',
    definition:
      'The publisher’s chat / instruct GGUF — official Qwen weights plus a Jinja template — not an abliterated merge or an unnamed “uncensored” file.',
    why: 'First tokens on a R9700 should come from official instruct. Enable --jinja on current Qwen templates. Abliterated files come after that pipe is boring.',
    links: [
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/models', label: 'Models' },
    ],
    seeAlso: ['abliterated', 'qwen36', 'gguf'],
  },
  {
    id: 'kv-cache',
    term: 'KV cache',
    aliases: ['f16 KV', 'q8_0 KV', 'cache-type-k', 'cache-type-v'],
    letter: 'K',
    definition:
      'Key/value attention memory that grows with context length. Separate from the weight file. House types: f16 (2 bytes, daily driver on our rig) and q8_0 (1 byte, smaller KV; quality trade not measured here).',
    why: 'At 262K, KV is a real VRAM line on a 32 GB card. Official 35B cards use f16. Do not confuse a KV type with a weight quant — q8_0 as cache is not “running Q8 weights.”',
    deeper:
      'The calculator’s KV estimate is 2 × kv_layers × kv_heads × head_dim × context × bytes. Hybrid Qwen cards only grow KV on full-attention layers — that count comes from the public model card. Official 35B sweep cards use f16.',
    links: [
      { href: '/quants', label: 'Quants · KV types' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/results', label: 'Run cards' },
    ],
    seeAlso: ['context-length', 'vram', 'quant'],
  },
  {
    id: 'llamacpp',
    term: 'llama.cpp',
    aliases: ['llama-server', 'llama-cli', 'llama-bench', 'ggml-org'],
    letter: 'L',
    definition:
      'The consumer default inference engine on AMDai: a C/C++ GGUF runner from ggml-org. You compile a backend, load a file, and optionally serve an OpenAI-shaped /v1 on llama-server (127.0.0.1:8080).',
    why: 'Vulkan first on our rig (commit c060ca974 on the official 35B sweep); HIP is optional. llama.cpp beats vLLM for a single-user Radeon box. Build it before you install a desktop app that might pull a CUDA binary.',
    deeper:
      'Official 35B sweep: llama.cpp c060ca974, Vulkan, f16 KV. llama-server is the same process as llama-cli plus HTTP on 127.0.0.1:8080. Do not let a desktop app download a CUDA llama.cpp on a Radeon.',
    links: [
      { href: '/backends', label: 'Backends' },
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
    ],
    seeAlso: ['vulkan', 'hip', 'gguf'],
  },
  {
    id: 'moe',
    term: 'MoE vs dense',
    aliases: ['mixture of experts', 'dense', 'A3B', 'active parameters'],
    letter: 'M',
    definition:
      'A mixture-of-experts (MoE) model activates a subset of experts per token; a dense model runs every layer. Qwen3.6-35B-A3B is MoE (the A3B names the active slice). Qwen 3.6 27B and Qwen 3.8 27B on this site are dense.',
    why: 'MoE is why a 35B-class GGUF fits one 32 GB R9700 at UD-Q5_K_XL (25.97 GB VRAM at 4K on the official card). Dense 27B files are a different fit; do not assume the same VRAM. Expert offload is an MoE-only lever.',
    deeper:
      'Qwen3.6-35B-A3B activates a 3B-class slice; that is why UD-Q5_K_XL fits one 32 GB card (25.97 GB VRAM at 4K). Flash is a different MoE and usually needs DDR5 expert offload. Dense 27B rows on /qwen are a separate fit.',
    links: [
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/models', label: 'Models' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
    ],
    seeAlso: ['expert-offload', 'qwen36', 'quant'],
  },
  {
    id: 'nvme',
    term: 'NVMe staging',
    aliases: ['NVMe', 'SSD', 'spinning disk', 'HDD'],
    letter: 'N',
    definition:
      'Putting the GGUF on a fast NVMe SSD before you run it. A spinning disk (HDD) can feed weights slower than the GPU can prefill, so the card sits idle while the file is paged.',
    why: 'House rule on a home Radeon box: NVMe, not HDD. If prefill looks broken and rocm-smi is idle, check the disk before you change quants. Staging is not the same as RAM offload.',
    deeper:
      'Prefill stalls with idle rocm-smi often mean the GGUF is still on a spinning disk. Staging to NVMe is not RAM offload and not a quant change. House rule: move the file before you tune flags.',
    links: [
      { href: '/start', label: 'Getting started' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
    ],
    seeAlso: ['gguf', 'prefill-decode', 'house-rules'],
  },
  {
    id: 'offload',
    term: 'Offload',
    aliases: ['RAM offload', 'layer offload', '-ngl', '--fit-target'],
    letter: 'O',
    definition:
      'Some weights or KV live in system RAM instead of VRAM. llama.cpp -ngl 99 means “offload what fits”; leftover layers spill to DDR5. Expert offload is the MoE-specific form (-ot, --n-cpu-moe).',
    why: 'The 35B daily driver on our rig uses 0% RAM offload. Q6_K 1-GPU 4K on the sweep is partly on DDR5 (--fit-target 1024) — decode there is not an in-VRAM figure. Flash usually needs offload; measure, do not guess tok/s.',
    deeper:
      '-ngl 99 means offload what fits. Q6_K 1-GPU 4K on the sweep used --fit-target 1024 and is partly on DDR5 — decode there is not in-VRAM. Expert offload (-ot, --n-cpu-moe) is the MoE form; exact values from the rig owner are not recorded.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/hardware', label: 'Hardware' },
    ],
    seeAlso: ['expert-offload', 'system-ram', 'vram'],
  },
  {
    id: 'prefill-decode',
    term: 'Prefill vs decode',
    aliases: ['prefill', 'decode', 'tok/s', 'tokens per second', 'pp', 'tg'],
    letter: 'P',
    definition:
      'Prefill (prompt processing) ingests the prompt in a burst — high tok/s, one shot. Decode (token generation) is the streaming rate people mean by “how fast is it.” AMDai cards report both.',
    why: 'They are not interchangeable. Official UD-Q5_K_XL 4K on one R9700: 2761.6 tok/s prefill and 102.39 tok/s decode. At 256K the same file is 519.2 / 44.4. Quote decode for chat feel; look at prefill when long prompts stall.',
    deeper:
      'Official UD-Q5_K_XL 4K: 2761.6 tok/s prefill, 102.39 decode. At 256K: 519.2 / 44.4. Q4_K_M 32K sibling: 1902.1 prefill, 117.69 decode. Quote the card, not a blended average.',
    links: [
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/results', label: 'Run cards' },
      { href: '/qwen', label: 'Qwen compare' },
    ],
    seeAlso: ['toks', 'context-length', 'amdai-bench'],
  },
  {
    id: 'quant',
    term: 'Quant',
    aliases: ['Q6', 'Q5', 'Q4', 'Q3', 'Q6_K', 'Q5_K_M', 'Q4_K_M', 'quantization', 'bpw'],
    letter: 'Q',
    definition:
      'A stored-weight encoding that shrinks the GGUF. AMDai lists Q3 through BF16. Q6 / Q5 / Q4 are measured on local-desktop for the 35B file. Q3 rows are options labeled estimate or community unless a run card says measured.',
    why: 'Prefer Q5 over Q4 when the file still fits; UD-Q5_K_XL is the daily driver. Q3 is a listed size step, not a secret “must stay at Q4” floor. This site never invents Q1 or Q2 guidance — those stay off, including draft heads.',
    deeper:
      'Nominal llama.cpp-family bits in the calculator: Q3_K_S 3.50, Q3_K_M / UD-Q3_K_XL 3.91, Q4_K_M 4.85, Q5 family 5.69, Q6 family 6.56, Q8_0 8.5, BF16 16. Q3 file sizes are Unsloth listings, not local-desktop quality scores. Q1/Q2 stay off.',
    links: [
      { href: '/quants', label: 'Quant explainer' },
      { href: '/compare/q4-q5-q6', label: 'Q6 vs Q5 vs Q4' },
      { href: '/budget', label: 'Budget' },
    ],
    seeAlso: ['gguf', 'unsloth-ud', 'kv-cache'],
  },
  {
    id: 'qwen36',
    term: 'Qwen3.6-35B-A3B',
    aliases: ['35B', 'Qwen 3.6', 'A3B'],
    letter: 'Q',
    definition:
      'The house daily-driver model: a 35B-class MoE instruct GGUF. The file we measure is Unsloth UD-Q5_K_XL (publisher listing 26.6 GB). Sibling 35B points on the same sweep include Q5_K_M, Q4_K_M, and Q6_K.',
    why: 'It is the first Qwen AMDai names — not a smaller “starter” from an older Qwen line. Fit and speed live on /qwen and the official cards; Q3 35B listings are estimates unless measured.',
    deeper:
      'Sibling 35B points on the same sweep include Q5_K_M, Q4_K_M, and Q6_K. Recipe qwen36-35b.llamacpp-vulkan.262k is the daily-driver launch. Q3 35B listings stay estimates unless measured.',
    links: [
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/models', label: 'Models' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
    ],
    seeAlso: ['daily-driver', 'moe', 'quant'],
  },
  {
    id: 'r9700',
    term: 'Radeon AI PRO R9700',
    aliases: ['R9700', 'R9700 Pro', 'AI PRO R9700'],
    letter: 'R',
    definition:
      'The AMD workstation / local-AI card this notebook is grounded in: 32 GB, gfx1201, RDNA 4. Official product name — there is no consumer “RX 9700.” The gaming sibling is the RX 9070 series (also gfx1201, 16 GB on the XT).',
    why: 'local-desktop has two of them. One card holds the daily-driver 35B Q5 in VRAM; two cards are for copies or Flash offload, not automatic 2× speed. Check the GPU directory before you buy a PSU.',
    deeper:
      '32 GB workstation SKU, gfx1201. Official product name is AMD Radeon AI PRO R9700. One card is the daily driver; two cards are copies or Flash offload, not automatic 2× decode. Size a PSU on /hardware — we do not invent a wattage.',
    links: [
      { href: '/gpus', label: 'GPU directory' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/budget', label: 'Budget' },
    ],
    seeAlso: ['rdna4', 'gfx1201', 'dual-gpu'],
  },
  {
    id: 'rdna4',
    term: 'RDNA 4',
    aliases: ['RDNA4', 'RDNA4/gfx1201', 'gfx12'],
    letter: 'R',
    definition:
      'The Radeon architecture family whose LLVM target is gfx1201 on current ROCm hardware tables. Covers the Radeon AI PRO R9700 and RX 9070-class cards — not RDNA 3 (gfx1100, 7900 XTX) and not Instinct CDNA.',
    why: 'ROCm packages and Vulkan drivers are family-specific. A 7900 XTX recipe is a different gfx; do not paste gfx1100 HIP flags onto a R9700 and expect them to be official.',
    deeper:
      'RDNA 3 (gfx1100, 7900 XTX) is a different ROCm family package. RX 9070 XT is gfx1201 with 16 GB — same generation, half the VRAM. There is no consumer RX 9700.',
    links: [
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/gpus', label: 'GPU directory' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
    ],
    seeAlso: ['gfx1201', 'r9700', 'rocm'],
  },
  {
    id: 'rebar',
    term: 'Resizable BAR',
    aliases: ['ReBAR', 'Smart Access Memory', 'SAM', 'Above 4G'],
    letter: 'R',
    definition:
      'A BIOS feature that lets the CPU see the GPU’s full VRAM window instead of a small aperture. AMD’s consumer name is Smart Access Memory. Menu labels vary by board.',
    why: 'On a home Radeon box, turn it on with Above 4G Decoding and CSM off — RDNA 4 is UEFI-only. AMDai has not measured llama.cpp or Strata tok/s with Resizable BAR on versus off on local-desktop, so do not invent a speed claim.',
    deeper:
      'ROCm BAR notes also mention keeping the high MMIO aperture inside the device physical-address limit. Two 32 GB cards plus a 256 GB host map a large prefetchable BAR. Record the exact BIOS string on a board row; do not assume one label.',
    links: [
      { href: '/bios', label: 'BIOS' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/start', label: 'Getting started' },
    ],
    seeAlso: ['r9700', 'vram', 'dual-gpu'],
  },
  {
    id: 'rocm',
    term: 'ROCm',
    aliases: ['Radeon Open Compute', 'Core SDK', 'TheRock'],
    letter: 'R',
    definition:
      'AMD’s open GPU compute platform: compilers, runtimes, and libraries for Linux (and a thinner Windows story). Historically Radeon Open Compute. It is not CUDA, and Canonical’s archive rocm is not the current Core SDK.',
    why: 'You need a current AMD pin for gfx1201 — Core SDK 10.x / ROCm CLI, not a mixed apt install. Vulkan llama.cpp can generate before HIP userspace is perfect; still verify rocminfo when you want HIP.',
    deeper:
      'Core SDK 10.x (ROCm CLI v0.2.0 or AMD’s 10.1 repo) is the current consumer pin for gfx1201. Do not mix those with Ubuntu archive rocm. The ROCm-guide glossary cites AMD sentences for HIP, ROCr, and TheRock.',
    links: [
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
      { href: '/rocm/glossary', label: 'ROCm-guide terms' },
    ],
    seeAlso: ['hip', 'vulkan', 'gfx1201'],
  },
  {
    id: 'run-card',
    term: 'Run card',
    aliases: ['test-run card', 'results card', 'official card'],
    letter: 'R',
    definition:
      'One official amdai-bench/run@1 measurement published on /results: who ran it, which GPU layout, the exact launch command, prefill/decode tok/s, VRAM, and peak system RAM when recorded.',
    why: 'AMDai does not invent a number to fill a table cell. If the 35B page shows 102.39 or 42.9 GB, click through to the card. The 2026-10-12 overnight sweep is 33 cards from local-desktop — measured, pending re-verify after the DDR5 oops.',
    deeper:
      'Each /results page shows the launch command and pins. The 35B table links cells to cards instead of inventing a missing figure. Q6_K 1-GPU 4K keeps both repeats (82.62 and 103.23); neither is averaged.',
    links: [
      { href: '/results', label: 'Results' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
    seeAlso: ['amdai-bench', 'local-desktop', 'prefill-decode'],
  },
  {
    id: 'stack-lab',
    term: 'Stack Lab',
    aliases: ['Radeon Stack Lab', 'qwen-reliable', 'companion app'],
    letter: 'S',
    definition:
      'The Ubuntu companion app that ships the same catalog as this site (Origin repo / local install — no public domain here). Profile qwen-reliable is the daily driver; qwen-fast-agent is Flash on Strata.',
    why: 'Use it when you want the YAML catalog on the box, not as a replacement for reading /start. It does not invent tok/s; it reads the same pins AMDai publishes.',
    deeper:
      'Profiles qwen-reliable (35B Q5 llama.cpp) and qwen-fast-agent (Flash on Strata) match /stacks. Origin repo / local install — no public domain here. It reads the same YAML catalog; it does not invent tok/s.',
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/stacks', label: 'Stacks' },
      { href: '/start', label: 'Getting started' },
    ],
    seeAlso: ['daily-driver', 'fast-agent', 'amdai'],
  },
  {
    id: 'strata',
    term: 'Strata',
    aliases: ['stratat', 'v0.1.42', ':8083'],
    letter: 'S',
    definition:
      'A GGUF server AMDai uses for the Flash fast-agent try. The pin on our rig is v0.1.42 (dated 2026-10-10). It is not the daily-driver engine.',
    why: 'First-party Flash is faster on Strata than on llama.cpp (~32.6 vs ~16 tok/s, 2026-10). Get llama.cpp generating official instruct first; then point a harness at Strata :8083 if you want the agent path.',
    deeper:
      'Pin v0.1.42 dated 2026-10-10. First-party Flash ~32.6 tok/s versus llama.cpp ~16. Draft / MTP heads that would be a Q1/Q2 path stay off. Point a harness at :8083 after llama.cpp already works.',
    links: [
      { href: '/backends/strata', label: 'Strata deep dive' },
      { href: '/backends', label: 'Backends' },
      { href: '/flash-daily', label: 'Flash daily driver' },
    ],
    seeAlso: ['fast-agent', 'flash', 'llamacpp'],
  },
  {
    id: 'system-ram',
    term: 'System RAM',
    aliases: ['DDR5', 'DIMM', 'host RAM', 'usable RAM'],
    letter: 'S',
    definition:
      'Memory on the motherboard (DDR5 on local-desktop: 4×64 GB, 256 GB kit). Separate from VRAM. It holds the OS, offloaded tensors, and some KV when the file does not fit the GPU.',
    why: 'Official UD-Q5_K_XL 1-GPU at 256K peaked at 42.9 GB system RAM — that is why the calculator can show a measured RAM line. Flash offload needs a much larger kit; spinning the DIMMs is not free speed.',
    deeper:
      'local-desktop kit is 256 GB (4×64 GB DDR5-5200); usable pool in the calculator is 249 GB. Daily-driver 256K peak 42.9 GB is a measured overlay, not an estimate. Flash offload kits are labeled estimates against that usable pool.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/hardware', label: 'Hardware' },
    ],
    seeAlso: ['vram', 'offload', 'kv-cache'],
  },
  {
    id: 'toks',
    term: 'tok/s',
    aliases: ['tokens per second', 'throughput'],
    letter: 'T',
    definition:
      'Tokens per second. Decode tok/s is chat feel; prefill tok/s is prompt ingest. AMDai never fills a missing cell with a guessed rate.',
    why: 'A home Radeon box should quote a card, not a viral screenshot. Short-context decode on the official 35B Q5 is 102.39 tok/s; that number does not apply to Flash, to Q3 estimates, or to a split layout.',
    links: [
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/results', label: 'Run cards' },
      { href: '/qwen', label: 'Qwen compare' },
    ],
    seeAlso: ['prefill-decode', 'run-card', 'amdai-bench'],
  },
  {
    id: 'unsloth-ud',
    term: 'Unsloth UD',
    aliases: ['UD-Q5_K_XL', 'UD-Q6_K_XL', 'UD-Q3_K_XL', 'dynamic quant'],
    letter: 'U',
    definition:
      'Unsloth’s dynamic GGUFs: a named bucket (UD-Q5_K_XL, UD-Q6_K_XL, UD-Q3_K_XL) that keeps some tensors at higher precision. When the publisher lists a file size, the calculator uses that size instead of params × bits.',
    why: 'UD-Q5_K_XL is the daily-driver 35B file; UD-Q6_K_XL is the Flash agent file. UD-Q3_K_XL is the Q3 size step on the same cards — labeled estimate unless measured. We do not invent a quality delta.',
    deeper:
      'When Unsloth lists a file size, the calculator uses that instead of params × bits. UD-Q3_K_XL 35B listing 16.8 GB is a size step, labeled estimate. Prefer the UD-Q5_K_XL / UD-Q6_K_XL names on /stacks.',
    links: [
      { href: '/quants', label: 'Quants' },
      { href: '/stacks', label: 'Stacks' },
      { href: '/calculator', label: 'Calculator' },
    ],
    seeAlso: ['quant', 'gguf', 'qwen36'],
  },
  {
    id: 'vllm',
    term: 'vLLM',
    aliases: ['vllm', 'ROCm vLLM', 'continuous batching'],
    letter: 'V',
    definition:
      'A high-throughput Python serving stack with continuous batching. Default pip install vllm is CUDA. ROCm builds are a separate pin — AMD’s conservative 10.0 combo is still 0.27; community 0.31 is this week’s serve try.',
    why: 'Not the daily driver on a home Radeon box. Use it when several clients need one server, after llama.cpp already works. Do not mix vLLM pins in one venv, and do not start a first box here.',
    deeper:
      'AMD’s 10.0 supported combo is still 0.27 + PyTorch 2.13. Community / ROCm 0.31 is this week’s serve try. Default pip install vllm is CUDA. Do not mix pins in one venv.',
    links: [
      { href: '/backends', label: 'Backends' },
      { href: '/software', label: 'AI software' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen (advanced)' },
    ],
    seeAlso: ['llamacpp', 'backend', 'rocm'],
  },
  {
    id: 'vram',
    term: 'VRAM vs system RAM',
    aliases: ['VRAM', 'GPU memory', '32 GB'],
    letter: 'V',
    definition:
      'VRAM is memory on the GPU; system RAM is DIMMs on the motherboard. A 32 GB R9700 holds weights + KV + overhead. Overflow goes to DDR5 and decode usually drops.',
    why: 'Official 35B UD-Q5_K_XL on one card: 25.97 GB VRAM at 4K and 29.34 GB at 256K. That is in-VRAM. Flash and Q6-with-fit-target are not the same story — read the card before you assume the file “fits in 32.”',
    deeper:
      'Official UD-Q5_K_XL 1-GPU VRAM: 25.97 GB at 4K, 26.7 at 32K, 28.82 at 128K, 29.34 at 256K. Peak system RAM at 256K is 42.9 GB. Size a different file on the calculator; do not reuse these as a universal 32 GB rule.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/gpus', label: 'GPU directory' },
    ],
    seeAlso: ['system-ram', 'kv-cache', 'offload'],
  },
  {
    id: 'vulkan',
    term: 'Vulkan',
    aliases: ['GGML_VULKAN', 'RADV', 'Mesa', 'build-vk'],
    letter: 'V',
    definition:
      'A Khronos graphics/compute API. llama.cpp can use it instead of HIP. On our rig that is Mesa RADV 25.2.8 talking to gfx1201 — the build-vk tree, not a consolation prize.',
    why: 'Vulkan is the daily-driver path for the official 35B sweep. If HIP configure is a mess, generate on Vulkan first. After --list-devices, hide the iGPU if two devices appear.',
    deeper:
      'House 35B cards use Mesa RADV 25.2.8. After llama.cpp --list-devices, pick the RADV GFX1201 device and hide the iGPU if two Vulkan devices appear. Vulkan is an on-ramp, not a fallback — it is what we run.',
    links: [
      { href: '/backends', label: 'Backends' },
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
      { href: '/rocm', label: 'What is ROCm' },
    ],
    seeAlso: ['llamacpp', 'hip', 'gfx1201'],
  },
  {
    id: 'local-desktop',
    term: 'local-desktop',
    aliases: ['amdai', 'AMDai', 'house rig'],
    letter: 'W',
    definition:
      'The house test host: Ryzen 9 9950X, 4×64 GB DDR5-5200, two Radeon AI PRO R9700 32 GB, Ubuntu 24.04.5. Official 35B cards credit amdai / AMDai and llama.cpp c060ca974 Vulkan, ROCm 7.2.0, Mesa RADV 25.2.8.',
    why: 'Every “measured on our rig” figure on AMDai is this box. The 2026-10-12 overnight sweep is 33 cards — measured, pending re-verify after a DDR5-5200 oops at 00:14 CT. Do not treat a different kit as the same RAM line.',
    deeper:
      'Software on the official 35B cards: Ubuntu 24.04.5, llama.cpp c060ca974 Vulkan, ROCm 7.2.0, Mesa RADV 25.2.8, f16 KV. Whole sweep labeled measured, pending re-verify after RAM fix. Flash / Strata / Q3 were excluded from that drop.',
    links: [
      { href: '/credits', label: 'Credits' },
      { href: '/results', label: 'Run cards' },
      { href: '/qwen', label: 'Qwen compare' },
    ],
    seeAlso: ['r9700', 'run-card', 'amdai-bench'],
  },
];

export function glossaryHaystack(entry: GlossaryEntry): string {
  return [
    entry.id,
    entry.term,
    entry.letter,
    ...entry.aliases,
    entry.definition,
    entry.why,
    entry.deeper ?? '',
    ...entry.links.map((link) => `${link.label} ${link.href}`),
    ...entry.seeAlso,
  ]
    .join('\n')
    .toLowerCase();
}

export function matchesEntry(entry: GlossaryEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return glossaryHaystack(entry).includes(q);
}

export function filterGlossary(query: string, entries: readonly GlossaryEntry[] = GLOSSARY): GlossaryEntry[] {
  return entries.filter((entry) => matchesEntry(entry, query));
}

export function parseGlossaryQuery(input: string | URLSearchParams): string {
  const params =
    typeof input === 'string'
      ? new URLSearchParams(input.startsWith('?') ? input.slice(1) : input)
      : input;
  return (params.get('q') ?? '').trim();
}

export function groupByLetter(
  entries: readonly GlossaryEntry[] = GLOSSARY,
): { letter: string; entries: GlossaryEntry[] }[] {
  return ALPHABET.map((letter) => ({
    letter,
    entries: entries.filter((entry) => entry.letter === letter),
  }));
}

export function activeLetters(entries: readonly GlossaryEntry[] = GLOSSARY): Set<string> {
  return new Set(entries.map((entry) => entry.letter));
}

export function entryById(
  id: string,
  entries: readonly GlossaryEntry[] = GLOSSARY,
): GlossaryEntry | undefined {
  return entries.find((entry) => entry.id === id);
}

const BANNED_MODELS = /Qwen2\.5|Qwen3-8B/;

export function assertGlossaryValid(entries: readonly GlossaryEntry[] = GLOSSARY): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const id of REQUIRED_GLOSSARY_IDS) {
    if (!entries.some((entry) => entry.id === id)) errors.push(`missing required entry ${id}`);
  }
  for (const entry of entries) {
    if (ids.has(entry.id)) errors.push(`duplicate id ${entry.id}`);
    ids.add(entry.id);
    if (!/^[a-z][a-z0-9-]*$/.test(entry.id)) errors.push(`bad id ${entry.id}`);
    if (!/^[A-Z]$/.test(entry.letter)) errors.push(`${entry.id} has a bad letter`);
    if (!entry.term.trim()) errors.push(`${entry.id} needs a term`);
    if (!entry.definition.trim()) errors.push(`${entry.id} needs a definition`);
    if (!entry.why.trim()) errors.push(`${entry.id} needs a why`);
    if (entry.links.length < 1) errors.push(`${entry.id} needs an internal link`);
    for (const link of entry.links) {
      if (!link.href.startsWith('/')) errors.push(`${entry.id} link ${link.href} is not internal`);
    }
    for (const see of entry.seeAlso) {
      if (!entries.some((other) => other.id === see)) errors.push(`${entry.id} seeAlso missing ${see}`);
    }
    const blob = [
      entry.term,
      entry.definition,
      entry.why,
      entry.deeper ?? '',
      ...entry.aliases,
      ...entry.links.map((l) => l.label),
    ].join('\n');
    if (BANNED_MODELS.test(blob)) errors.push(`${entry.id} names a banned model`);
  }
  const bench = entries.find((entry) => entry.id === 'amdai-bench');
  if (bench && !bench.term.includes('amdai-bench')) errors.push('amdai-bench term must stay lowercase');
  if (bench && /AMDAI-BENCH|Amdai-Bench/.test(bench.term)) errors.push('amdai-bench term casing');
  const brand = entries.find((entry) => entry.id === 'amdai');
  if (brand && brand.term !== 'AMDai') errors.push('brand entry must be AMDai');
  const quant = entries.find((entry) => entry.id === 'quant');
  if (quant && !/estimate/i.test(quant.definition + quant.why)) errors.push('quant must label Q3 as estimate');
  if (quant && !/\bQ3\b/.test(quant.definition + quant.why)) errors.push('quant must mention Q3');
  return errors;
}
