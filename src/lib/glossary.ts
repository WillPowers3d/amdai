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
  'lora',
  'qlora',
  'adapter',
  'imatrix',
  'kl-divergence',
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
    id: 'adapter',
    term: 'Adapter',
    aliases: ['LoRA adapter', 'PEFT adapter', 'merge_and_unload'],
    letter: 'A',
    definition:
      'The small trained matrices from LoRA or QLoRA. The base model stays frozen. After training you merge the adapter into the base (PEFT merge_and_unload) before converting to GGUF for llama.cpp.',
    why: 'On AMDai, training is a cited side path — inference stays llama.cpp first. Speeds are not yet measured on our R9700s. Q3 stays a labeled estimate after you quantize the merged file.',
    deeper:
      'AMD’s Radeon playbook merges with merge_and_unload then save_pretrained. llama.cpp convert_hf_to_gguf.py turns that folder into a GGUF. Quantize Q6_K / Q5_K_M / Q4_K_M; Q3_K_M is a labeled estimate.',
    links: [
      { href: '/fine-tuning', label: 'Fine-tuning on Radeon' },
      { href: '/guides/quantize-gguf', label: 'Make GGUF quants' },
      { href: '/quants', label: 'Quants' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
    seeAlso: ['lora', 'qlora', 'gguf', 'imatrix'],
  },
  {
    id: 'amdai',
    term: 'AMDai',
    aliases: ['amdai.net', 'R9700 Lab Notes', 'og:site_name'],
    letter: 'A',
    definition:
      'The display wordmark for this notebook (AMDai · R9700 Lab Notes). Domain, URLs, package names, and amdai-bench stay lowercase. Open Graph site_name is AMDai.',
    why: 'The header says AMDai; the address bar says amdai.net. Same project — mixed-case is display-only so it is not confused with AMD’s logo or an official AMD publication.',
    links: [
      { href: '/start', label: 'Getting started' },
      { href: '/credits', label: 'Credits' },
      { href: '/faq', label: 'FAQ' },
    ],
    seeAlso: ['amdai-bench', 'local-desktop'],
  },
  {
    id: 'apu',
    term: 'APU',
    aliases: ['Strix Halo', 'Ryzen AI Max', 'Ryzen AI Max+ 395', 'Radeon 8060S', 'gfx1151', '780M', '890M', 'Ryzen iGPU'],
    letter: 'A',
    definition:
      'A chip that combines CPU and GPU and shares one memory pool. There is no discrete VRAM sticker. The shopper box on AMDai is Ryzen AI Max+ 395 with Radeon 8060S (gfx1151) — Strix Halo in mini-PCs and laptops.',
    why: 'A 64 GB or 128 GB kit is both system RAM and GPU memory. Size the file on the calculator before you assume a 35B Q5 “fits like an R9700.” Official tok/s on this site are still the discrete R9700 cards.',
    deeper:
      'AMD’s ROCm 10.1.0 GPU table prints VRAM for this SKU as Dynamic + carveout. BIOS UMA reserves a slice; GTT / dynamic allocation grows into the rest of the same kit. llama.cpp Vulkan first. Not measured on local-desktop.',
    links: [
      { href: '/gpus/strix-halo', label: 'Strix Halo guide' },
      { href: '/gpus/ryzen-igpu', label: 'Ryzen iGPU' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus', label: 'GPU directory' },
    ],
    seeAlso: ['uma', 'gtt', 'vram', 'system-ram'],
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
    id: 'constrained-decoding',
    term: 'Constrained decoding',
    aliases: ['grammar sampling', 'JSON schema decode', 'structured JSON'],
    letter: 'C',
    definition:
      'llama.cpp grammar sampling so every next token still matches a GBNF grammar or a JSON Schema converted to GBNF. Used for tool args, calculator output, and recipe export.',
    why: 'Hermes and coding tools need JSON that parses. Official flags are --grammar / --json-schema and response_format. Grammar decode versus free-form is not measured on local-desktop — run Stack Lab grammar-ab/1. The schema is not injected into the prompt except during tool calling.',
    deeper:
      'llama.cpp server README (checked 2026-10-14): --grammar, --grammar-file, -j / --json-schema, -jf / --json-schema-file, plus grammar / json_schema body fields. grammars/README.md: JSON Schemas → GBNF; performance gotchas on issue #4218. Shopper how-to: /constrained-decoding.',
    links: [
      { href: '/constrained-decoding', label: 'Constrained decoding' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
    ],
    seeAlso: ['gbnf', 'llamacpp', 'instruct'],
  },
  {
    id: 'container',
    term: 'Container (Docker / Podman)',
    aliases: ['Docker', 'Podman', 'container image'],
    letter: 'C',
    definition:
      'An isolated process that runs an official llama.cpp image instead of a host build. On AMDai that is ggml-org’s GHCR server-vulkan first, server-rocm second. The host still owns /dev/dri and, for HIP, /dev/kfd.',
    why: 'People search “rocm docker llama.cpp.” The cited path is /setup/docker. It is not a measured local-desktop card. We do not invent a container tok/s or a speed delta versus bare metal. Bind the published port to 127.0.0.1.',
    deeper:
      'docker.md names ghcr.io/ggml-org/llama.cpp:server-vulkan and :server-rocm and says GPU images are not currently tested by CI beyond being built. AMD’s ROCm 10.1 container page documents --device /dev/kfd --device /dev/dri and optional seccomp=unconfined. Rootless Podman needs --group-add keep-groups; Fedora SELinux needs container_use_devices plus :z / :Z on the model volume.',
    links: [
      { href: '/setup/docker', label: 'Docker / Podman' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
    seeAlso: ['llamacpp', 'device-passthrough', 'nvme'],
  },
  {
    id: 'comfyui',
    term: 'ComfyUI',
    aliases: ['Comfy', 'image gen UI'],
    letter: 'C',
    definition:
      'A node-graph UI for local diffusion checkpoints on HIP/ROCm PyTorch. On AMDai it is the first image-gen path. It does not speak llama-server /v1.',
    why: 'People search “ComfyUI ROCm Radeon.” First-run install is /setup/comfyui. Fit tables stay on /image-gen. Speeds are not yet measured by AMDai. llama.cpp stays first for LLMs. Q3 stays a labeled estimate on any LLM that shares the box.',
    deeper:
      'AMD documents git clone, pip install -r ComfyUI/requirements.txt, then python ComfyUI/main.py → http://127.0.0.1:8188. Checkpoints go in models/checkpoints. The official Windows AMD portable is ComfyUI_windows_portable_amd.7z; the Nvidia zip is not a Radeon path. Instinct Docker tags are not R9700 pins.',
    links: [
      { href: '/setup/comfyui', label: 'ComfyUI on Radeon' },
      { href: '/image-gen', label: 'Image gen' },
      { href: '/harnesses/image', label: 'ComfyUI harness' },
    ],
    seeAlso: ['hip', 'rocm', 'nvme'],
  },
  {
    id: 'chat-template',
    term: 'Chat template',
    aliases: ['--jinja', '--chat-template', '--chat-template-file', 'chat_template_tool_use'],
    letter: 'C',
    definition:
      'The Jinja string llama-server uses to wrap messages, tools, and reasoning. It usually ships in the GGUF metadata. --jinja turns the engine on; --chat-template and --chat-template-file override the file.',
    why: 'OpenAI-style tool calls need a tools-aware template. Inspect GET /props for chat_template and chat_template_tool_use. A mismatch is the usual “tools ignored” or “markup in content” cause. House pin still passes --jinja.',
    deeper:
      'llama.cpp function-calling.md: native handlers exist for several families (Llama 3.1 / 3.3, GPT-OSS Harmony, Hermes 2/3, …). Unrecognized templates log Chat format: Generic. --chat-template chatml is the documented YMMV fallback. --skip-chat-parsing dumps markup into content.',
    links: [
      { href: '/guides/tool-calling', label: 'Tool calling' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
    seeAlso: ['tool-calling', 'instruct', 'llamacpp', 'gbnf'],
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
    id: 'device-passthrough',
    term: 'Device passthrough',
    aliases: ['--device', '/dev/kfd', '/dev/dri', 'keep-groups'],
    letter: 'D',
    definition:
      'Giving a container the host GPU nodes it needs. Vulkan llama.cpp uses /dev/dri. ROCm / HIP also needs /dev/kfd. The login (or --group-add) must match render and video.',
    why: 'Permission denied on /dev/kfd is the usual container miss. AMD’s ROCm 10.1 container page documents both nodes and optional seccomp=unconfined. Rootless Podman bind-mounts devices and needs --group-add keep-groups; Fedora SELinux may need container_use_devices.',
    deeper:
      'Passing all of /dev/dri exposes every GPU. AMD shows renderD128 / renderD129 to restrict. Volume labels :z / :Z are for the GGUF mount, not for /dev. Full walk: /setup/docker.',
    links: [
      { href: '/setup/docker', label: 'Docker / Podman' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/rocm', label: 'What is ROCm' },
    ],
    seeAlso: ['container', 'rocm', 'hip'],
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
      'Layouts on amdai-bench cards: single, split, dual-instance. Two copies: about 100 tok/s per request, 172 at two concurrent, 177 at 4–8, 423 soak requests, 0 errors. Split 4K max total 82.78 versus 102.39 on one card. Consumer why: /multi-gpu. Hands-on llama.cpp flags: /setup/multi-gpu.',
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp how-to' },
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
      { href: '/moe', label: 'MoE on Radeon' },
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
      { href: '/models/flash', label: 'Flash model page' },
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
    id: 'gbnf',
    term: 'GBNF',
    aliases: ['GGML BNF', '.gbnf', 'grammar file'],
    letter: 'G',
    definition:
      'GGML Backus–Naur Form — the grammar language llama.cpp uses to constrain decode. A JSON Schema is converted to GBNF. Samples live in llama.cpp grammars/.',
    why: 'Use GBNF when the output is not JSON, or the official schema subset cannot express the shape. Use a JSON Schema when the output is a JSON object. Shopper how-to: /constrained-decoding.',
    deeper:
      'Official grammars/README.md: production rules, a root rule, and --grammar / --grammar-file. Server README also accepts -j / --json-schema. Do not invent a tok/s cost; measure Stack Lab grammar-ab/1.',
    links: [
      { href: '/constrained-decoding', label: 'Constrained decoding' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
    ],
    seeAlso: ['constrained-decoding', 'llamacpp', 'instruct'],
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
      { href: '/guides/quantize-gguf', label: 'Make GGUF quants' },
      { href: '/can-run', label: 'Can my Radeon run it?' },
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
      { href: '/models', label: 'Models' },
    ],
    seeAlso: ['quant', 'unsloth-ud', 'nvme', 'imatrix'],
  },
  {
    id: 'gtt',
    term: 'GTT',
    aliases: ['Graphics Translation Table', 'dynamic allocation', 'dynamic VRAM'],
    letter: 'G',
    definition:
      'The path where the driver maps more of the same system-memory kit to the iGPU after boot, instead of living only inside a fixed BIOS carve-out.',
    why: 'On Strix Halo, a tiny UMA reserve plus GTT can still load a large GGUF — and it can also starve the OS if the model plus KV eat the kit. The calculator’s 70% slice is an estimate of that split, not a firmware reading.',
    deeper:
      'AMD’s ROCm 10.1.0 APU table calls this Dynamic + carveout. Change the calculator usable percent if your BIOS printout disagrees. We do not invent a megabyte GTT cap.',
    links: [
      { href: '/gpus/strix-halo', label: 'Strix Halo guide' },
      { href: '/gpus/ryzen-igpu', label: 'Ryzen iGPU' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/bios', label: 'BIOS' },
    ],
    seeAlso: ['uma', 'apu', 'vram'],
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
      { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
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
    seeAlso: ['abliterated', 'qwen36', 'gguf', 'chat-template'],
  },
  {
    id: 'json-schema',
    term: 'JSON schema',
    aliases: ['json_schema', '--json-schema', 'response_format', 'json_object'],
    letter: 'J',
    definition:
      'A JSON Schema object that llama-server can turn into a GBNF grammar. Send it as response_format or -j / --json-schema when the whole reply must be one JSON object.',
    why: 'Different from a tools array. Tools + --jinja produce tool_calls for Hermes, Cline, and Continue. Schema / GBNF constrain the message body. Official grammars/README.md: the schema is not injected except during tool calling, so describe the fields in the prompt.',
    deeper:
      'Server README: {"type":"json_object"} or a schema-constrained object. Measure free-form versus grammar on Stack Lab grammar-ab/1. Do not copy a free-form 35B tok/s as a grammar figure.',
    links: [
      { href: '/guides/tool-calling', label: 'Tool calling' },
      { href: '/glossary#gbnf', label: 'GBNF' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ],
    seeAlso: ['gbnf', 'tool-calling', 'chat-template', 'llamacpp'],
  },
  {
    id: 'imatrix',
    term: 'imatrix',
    aliases: ['importance matrix', 'llama-imatrix'],
    letter: 'I',
    definition:
      'An importance matrix llama.cpp builds from a model and a calibration text, then feeds to llama-quantize to reduce quality loss versus a naive quant.',
    why: 'Use it when you convert a new GGUF and want your own calibration text. It does not turn a stock Q5_K_M into an Unsloth UD-Q5_K_XL file. The how-to is /guides/quantize-gguf.',
    deeper:
      'Official llama-imatrix needs -m and -f. Default output is imatrix.gguf. Unsloth Dynamic docs describe a different calibration set and per-layer mix — download UD-*_XL; do not claim stock tools reproduce it.',
    links: [
      { href: '/guides/quantize-gguf', label: 'Make GGUF quants' },
      { href: '/quants', label: 'Quants' },
      { href: '/fine-tuning', label: 'Fine-tuning' },
    ],
    seeAlso: ['quant', 'unsloth-ud', 'kl-divergence', 'gguf'],
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
      { href: '/kv-cache', label: 'KV cache on a Radeon GPU' },
      { href: '/concurrency-ab', label: 'Parallel slots' },
      { href: '/quants', label: 'Quants · KV types' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/results', label: 'Run cards' },
    ],
    seeAlso: ['context-length', 'vram', 'quant', 'parallel-slots'],
  },
  {
    id: 'parallel-slots',
    term: 'Parallel slots (-np)',
    aliases: ['-np', '--parallel', 'llama-server slots', 'concurrency-ab'],
    letter: 'P',
    definition:
      'How many concurrent sequences one llama-server accepts. Official flag is -np / --parallel (default auto). Each slot needs KV. Usable context per client is total ctx / np unless you raise -c or set --kv-unified-per-slot.',
    why: 'Hermes, Open WebUI, and a coding tool often share one always-on unit. House daily driver stays one slot. AMDai has not measured -np 2/4/8 on one R9700 — run Stack Lab concurrency-ab/1. Two GPU copies are a different layout.',
    deeper:
      'llama.cpp server README: -np / --parallel N, --kv-unified-per-slot N, GET /health total_slots. Pack concurrency-ab/1 is amdai-bench ab-concurrency. That pack is not an allowlisted Open-in-Stack-Lab deep link. Do not copy a one-client 35B tok/s as an -np 4 figure.',
    links: [
      { href: '/concurrency-ab', label: 'Parallel slots' },
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
    seeAlso: ['kv-cache', 'llamacpp', 'context-length'],
  },
  {
    id: 'kl-divergence',
    term: 'KL-divergence',
    aliases: ['KLD', 'Kullback–Leibler', 'kl-divergence-base'],
    letter: 'K',
    definition:
      'A llama.cpp perplexity metric that compares a quantized model’s token distribution to an f16 / bf16 baseline. Zero means the distributions match.',
    why: 'Use it after you make a GGUF to measure accuracy loss. Record baseline logits with --kl-divergence-base, then rerun the quant with --kl-divergence. AMDai has no house KLD score — run the tool.',
    deeper:
      'The llama.cpp perplexity README also reports PPL. The logit file is very large (11 GiB for LLaMA 2, 37 GiB for LLaMA 3 on Wikitext-2). Stage leftover on NVMe. Then record an amdai-bench card for speed.',
    links: [
      { href: '/guides/quantize-gguf', label: 'Make GGUF quants' },
      { href: '/quants', label: 'Quants' },
      { href: '/compare/q4-q5-q6', label: 'Q6 vs Q5 vs Q4' },
    ],
    seeAlso: ['quant', 'imatrix', 'amdai-bench'],
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
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/setup/server', label: 'Always-on llama-server' },
    ],
    seeAlso: ['vulkan', 'hip', 'gguf', 'mmproj', 'lm-studio', 'lemonade'],
  },
  {
    id: 'lm-studio',
    term: 'LM Studio',
    aliases: ['lms', 'lmstudio', ':1234'],
    letter: 'L',
    definition:
      'A desktop chat app that wraps llama.cpp. You download a Vulkan or ROCm llama.cpp runtime, load a GGUF, and optionally serve an OpenAI-compatible /v1 on 127.0.0.1:1234.',
    why: 'People search “LM Studio Radeon.” The cited first-run is /setup/lm-studio. It is not a measured local-desktop card. Decode numbers on this site are Ubuntu llama.cpp llama-bench, not measured inside LM Studio. Vulkan first; bundled ROCm only if the picker lists this gfx.',
    deeper:
      'AMD’s playbook documents Ctrl+Shift+R runtime picker, GPU Offload max, Flash Attention On, and http://127.0.0.1:1234. Linux is an AppImage (libfuse2); Ubuntu newer than 22 is not well tested per LM Studio. House file is still Qwen3.6-35B-A3B UD-Q5_K_XL at 262K. Leave the app for compile flags and matching cards — /setup and /backends/llamacpp.',
    links: [
      { href: '/setup/lm-studio', label: 'LM Studio on Radeon' },
      { href: '/backends/lmstudio', label: 'LM Studio backend' },
      { href: '/harnesses/lm-studio', label: 'LM Studio harness' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
    ],
    seeAlso: ['llamacpp', 'vulkan', 'offload', 'coding-assistant', 'ollama'],
  },
  {
    id: 'ollama',
    term: 'Ollama',
    aliases: [':11434', 'ollama serve', 'ollama ps'],
    letter: 'O',
    definition:
      'A pull-and-run daemon that wraps a packaged llama.cpp / ROCm or Vulkan runtime. Local API on 127.0.0.1:11434, including an OpenAI-shaped /v1.',
    why: 'People search “Ollama AMD GPU.” The cited first-run is /setup/ollama. It is not a measured local-desktop card. Decode numbers on this site are Ubuntu llama.cpp llama-bench, not measured inside Ollama. llama.cpp you compile stays the daily driver.',
    deeper:
      'Official Linux install is their script plus an AMD ROCm tarball. gpu.mdx lists R9700 / 9070 XT on Linux ROCm v7; the Windows ROCm table does not. ollama ps is how you prove GPU vs CPU. Default context is 4096; KV grows with OLLAMA_NUM_PARALLEL. House family is still Qwen3.6-35B-A3B. gfx1201 tensiles and Windows R9700 CPU fallback live on /rocm-problems.',
    links: [
      { href: '/setup/ollama', label: 'Ollama on Radeon' },
      { href: '/backends/ollama', label: 'Ollama backend' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm-problems/ollama-gfx1201-tensile', label: 'gfx1201 tensiles' },
    ],
    seeAlso: ['llamacpp', 'lm-studio', 'lemonade', 'open-webui', 'context-length'],
  },
  {
    id: 'lemonade',
    term: 'Lemonade Server',
    aliases: ['lemonade', ':13305', 'lemonade-server', '/api/v1'],
    letter: 'L',
    definition:
      'AMD’s own local AI server. The primary LLM recipe wraps llama.cpp (Vulkan or ROCm). OpenAI-compatible API on 127.0.0.1:13305/api/v1 — note /api/v1, not /v1.',
    why: 'People search “Lemonade AMD GPU.” The cited first-run is /setup/lemonade. It is not a measured local-desktop card. Decode numbers on this site are Ubuntu llama.cpp llama-bench, not measured inside Lemonade. llama.cpp you compile stays the daily driver. Vulkan first; ROCm only on the gfx their docs name.',
    deeper:
      'Ubuntu 24.04+ PPA is ppa:lemonade-team/stable; Windows is the MSI. Latest GitHub tag we checked is v2026.41.1 (2026-10-07) — ROCm backends move to ROCm 10. lemonade backends install llamacpp:vulkan or llamacpp:rocm. Nightly ROCm bins: gfx1150, gfx1151, gfx103X, gfx110X, gfx120X. House family is still Qwen3.6-35B-A3B. amdai runs Lemonade on local-desktop; there is still no Lemonade tok/s card.',
    links: [
      { href: '/setup/lemonade', label: 'Lemonade on Radeon' },
      { href: '/backends/lemonade', label: 'Lemonade backend' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm/gfx', label: 'gfx targets' },
    ],
    seeAlso: ['llamacpp', 'ollama', 'lm-studio', 'open-webui'],
  },
  {
    id: 'open-webui',
    term: 'Open WebUI',
    aliases: ['openwebui', ':3000', 'self-hosted chat UI'],
    letter: 'O',
    definition:
      'A self-hosted browser chat UI. It talks to an OpenAI-compatible /v1. On AMDai that server is llama.cpp llama-server on 127.0.0.1:8080. The UI itself does not run the GGUF.',
    why: 'People search “Open WebUI AMD GPU.” The cited first-run is /setup/open-webui. It is not a measured local-desktop card. Decode numbers on this site are Ubuntu llama.cpp llama-bench, not measured inside Open WebUI. llama.cpp you compile stays the daily driver.',
    deeper:
      'Official Docker maps host 3000 to container 8080. pip defaults to :8080 — use --port 3000 so it does not steal house llama-server. Admin → Connections → OpenAI, Provider llama.cpp. Do not pull the :cuda image on a Radeon. Ollama :11434 is a secondary path. House file is still Qwen3.6-35B-A3B UD-Q5_K_XL.',
    links: [
      { href: '/setup/open-webui', label: 'Open WebUI on Radeon' },
      { href: '/harnesses/open-webui', label: 'Open WebUI harness' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/setup/ollama', label: 'Ollama' },
    ],
    seeAlso: ['llamacpp', 'ollama', 'lm-studio'],
  },
  {
    id: 'coding-assistant',
    term: 'Coding assistant',
    aliases: ['Aider', 'Cline', 'Continue', 'local coding agent'],
    letter: 'C',
    definition:
      'An editor or CLI agent that talks to a local OpenAI-compatible /v1. On AMDai that server is llama.cpp llama-server on 127.0.0.1:8080. Aider, Cline, and Continue are the cited first three.',
    why: 'People search “aider llama.cpp radeon” and “cline local model.” The cited walk is /setup/coding-assistant. Decode numbers on this site are Ubuntu llama.cpp llama-bench, not Aider tok/s. Vulkan llama-server first; LM Studio :1234 is secondary.',
    deeper:
      'Aider prefixes the model with openai/ and requires a non-empty API key. Cline uses the OpenAI Compatible provider — do not append /chat/completions. Continue openai provider wants apiBase including /v1. House file is still Qwen3.6-35B-A3B UD-Q5_K_XL. Hermes is the house agent on local-desktop against the same :8080.',
    links: [
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/harnesses/aider', label: 'Aider' },
      { href: '/harnesses/cline', label: 'Cline' },
      { href: '/harnesses/continue', label: 'Continue' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
    seeAlso: ['llamacpp', 'lm-studio', 'context-length'],
  },
  {
    id: 'lora',
    term: 'LoRA',
    aliases: ['Low-Rank Adaptation', 'PEFT LoRA'],
    letter: 'L',
    definition:
      'Parameter-efficient fine-tuning: freeze the base weights and train small low-rank matrices. Unsloth’s table treats LoRA as 16-bit. Hugging Face PEFT/TRL and AMD’s Radeon playbook document it.',
    why: 'Cheaper than a full retrain, hungrier than QLoRA. Unsloth’s 27B LoRA minimum is 64 GB — not a 16 GB card. Training speed is not yet measured on our R9700s.',
    deeper:
      'AMD’s playbook (Gemma 3 4B) lists LoRA typical VRAM 24–32 GB and requires at least 16 GB dedicated VRAM plus 32 GB system RAM on Linux. That is their 4B example, not a 35B number we invent.',
    links: [
      { href: '/fine-tuning', label: 'Fine-tuning on Radeon' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
    seeAlso: ['qlora', 'adapter', 'vram'],
  },
  {
    id: 'mmproj',
    term: 'mmproj',
    aliases: ['multimodal projector', 'libmtmd', 'llama-mtmd-cli'],
    letter: 'M',
    definition:
      'The multimodal projector GGUF that llama.cpp uses to encode an image into embeddings the text model can read. You typically need two files: the text GGUF and a matching mmproj. libmtmd is the current llama.cpp path.',
    why: 'Local vision on AMDai is image in, text out — not ComfyUI. Pairing is architecture-specific. Speeds are not yet measured by AMDai. The house 35B daily driver is text-only; do not invent an mmproj for that file. Q3 stays a labeled estimate.',
    deeper:
      'Cited tools: llama-mtmd-cli -m model.gguf --mmproj mmproj.gguf --image file.jpg, or llama-server --mmproj. --no-mmproj-offload keeps the projector off the GPU. ggml-org publishes ready multimodal GGUFs. Start from that collection, not a retired Qwen family.',
    links: [
      { href: '/vision', label: 'Local vision' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/models', label: 'House models' },
    ],
    seeAlso: ['llamacpp', 'gguf', 'quant'],
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
      { href: '/moe', label: 'MoE on Radeon' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/models', label: 'Models' },
      { href: '/models/qwen36-27b', label: 'Qwen3.6 27B' },
      { href: '/models/qwen38-27b', label: 'Qwen3.8 27B' },
      { href: '/models/glm-53-flash', label: 'GLM 5.3 Flash' },
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
      { href: '/tuning', label: 'Speed up llama.cpp' },
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
      { href: '/tuning', label: 'Speed up llama.cpp' },
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
      { href: '/guides/quantize-gguf', label: 'Make GGUF quants' },
      { href: '/compare/q4-q5-q6', label: 'Q6 vs Q5 vs Q4' },
      { href: '/budget', label: 'Budget' },
    ],
    seeAlso: ['gguf', 'unsloth-ud', 'kv-cache', 'imatrix'],
  },
  {
    id: 'qlora',
    term: 'QLoRA',
    aliases: ['Quantized LoRA', '4-bit LoRA', 'load_in_4bit'],
    letter: 'Q',
    definition:
      'LoRA plus a 4-bit quantized base. Unsloth’s table treats QLoRA as 4-bit. bitsandbytes is the usual loader. AMD’s Radeon playbook: QLoRA is Linux-only because bitsandbytes is not well supported on Windows.',
    why: 'The memory-efficient path on a home Radeon. Unsloth 27B QLoRA minimum is 22 GB; 70B is 41 GB. Those are Unsloth minima, not local-desktop runs. Training speed is not yet measured on our R9700s.',
    deeper:
      'HF TRL documents load_in_4bit with peft_config. Unsloth documents bitsandbytes QLoRA on Radeon and CDNA. After training, merge the adapter and convert to GGUF — llama.cpp first for tokens.',
    links: [
      { href: '/fine-tuning', label: 'Fine-tuning on Radeon' },
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/quants', label: 'Quants' },
    ],
    seeAlso: ['lora', 'adapter', 'quant'],
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
      { href: '/models/qwen36', label: '35B model page' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/compare/models', label: 'Compare models' },
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
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT sheet' },
      { href: '/compare/gpus', label: 'Compare GPUs' },
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
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT sheet' },
      { href: '/compare/gpus', label: 'Compare GPUs' },
      { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX sheet' },
      { href: '/gpus/rx-7900-xt', label: 'RX 7900 XT sheet' },
      { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT sheet' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
    ],
    seeAlso: ['gfx1201', 'r9700', 'rocm', 'used-radeon'],
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
      'Core SDK 10.x (ROCm CLI v0.2.0 or AMD’s 10.1 repo) is the current consumer pin for gfx1201. Do not mix those with Ubuntu archive rocm. Moving versions, pinning, or recovering a half-upgraded box is /rocm/upgrade. The ROCm-guide glossary cites AMD sentences for HIP, ROCr, and TheRock.',
    links: [
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
      { href: '/rocm/upgrade', label: 'Upgrade or reinstall' },
      { href: '/rocm/glossary', label: 'ROCm-guide terms' },
      { href: '/setup/fedora', label: 'Fedora setup' },
      { href: '/setup/arch', label: 'Arch setup' },
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
      'Each /results page shows the launch command and pins. The 35B table links cells to cards instead of inventing a missing figure. Q6_K 1-GPU 4K uses the 23:55 card (103.23 tok/s). The earlier 82.62 card stays on /results and is not averaged.',
    links: [
      { href: '/results', label: 'Results' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
    seeAlso: ['amdai-bench', 'local-desktop', 'prefill-decode'],
  },
  {
    id: 'speculative-decoding',
    term: 'Speculative decoding',
    aliases: ['draft model', 'model-draft', '--model-draft', '-md', 'spec decode'],
    letter: 'S',
    definition:
      'A smaller draft GGUF guesses the next tokens; the target accepts or rejects them. llama.cpp documents -md / --model-draft on the server README. AMDai has not measured a draft pair on local-desktop.',
    why: 'A good draft can raise decode. A bad one wastes VRAM. Draft files stay Q4 and up. Q3 is a labeled estimate for the main file, not a house draft. MTP heads stay off.',
    deeper:
      'Official current flags are --spec-draft-model, --spec-draft-n-max, --spec-draft-n-min, and -ngld. Old --draft-max / --draft-min were removed. Measure draft off vs on with the Stack Lab A/B. House 35B launches have no draft. Hermes’s Flash path is Strata with no MTP.',
    links: [
      { href: '/speculative-decoding', label: 'Speculative decoding' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
    seeAlso: ['llamacpp', 'quant', 'prefill-decode', 'strata'],
  },
  {
    id: 'stack-lab',
    term: 'Stack Lab',
    aliases: ['Radeon Stack Lab', 'qwen-reliable', 'companion app'],
    letter: 'S',
    definition:
      'The Ubuntu 24.04+ companion that ships the same catalog as this site (Origin repo / local install — packages not published yet, no public download URL). Profile qwen-reliable is the daily driver; qwen-fast-agent is Flash on Strata.',
    why: 'Use it when you want the YAML catalog on the box, not as a replacement for reading /setup. It does not invent tok/s; it records amdai-bench cards AMDai publishes.',
    deeper:
      'Jobs: check my rig, setup doctor, model manager, apply recipes, start a profile, live dashboard, amdai-bench, share cards. Profiles qwen-reliable (35B Q5 llama.cpp) and qwen-fast-agent (Flash on Strata) match /stacks. Packages are not published yet.',
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
    seeAlso: ['vram', 'offload', 'kv-cache', 'apu'],
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
    seeAlso: ['prefill-decode', 'run-card', 'amdai-bench', 'thinking'],
  },
  {
    id: 'thinking',
    term: 'Thinking mode',
    aliases: ['reasoning mode', '--reasoning', 'enable_thinking', 'reasoning_effort'],
    letter: 'T',
    definition:
      'A chat-template behavior where the model writes a hidden thought block, then a final answer. llama.cpp documents --reasoning on|off|auto, --reasoning-effort, --reasoning-budget, and chat_template_kwargs.enable_thinking.',
    why: 'Official Qwen3.6 cards think by default. Hidden tokens burn context and wall-clock. Turn it off with --reasoning off or reasoning_effort none. Thinking-token counts are not measured on local-desktop.',
    deeper:
      'Server README (checked 2026-10-14): reasoning_effort none disables thinking when the template honors it. Official Qwen3.6 card does not support /think or /nothink. --reasoning-format deepseek fills message.reasoning_content. Strata Flash thinking is not verified here.',
    links: [
      { href: '/thinking', label: 'Thinking mode' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
    seeAlso: ['instruct', 'llamacpp', 'prefill-decode', 'toks'],
  },
  {
    id: 'tool-calling',
    term: 'Tool calling',
    aliases: ['function calling', 'tools array', 'tool_calls', 'parallel_tool_calls'],
    letter: 'T',
    definition:
      'An OpenAI-shaped /v1/chat/completions request that includes a tools array. The model returns tool_calls when --jinja is on and the chat template understands tools.',
    why: 'Hermes, Cline, Continue, and Roo need this path. Official docs are llama.cpp function-calling.md and the server README. Parallel / multiple tool calls stay off unless the payload sets parallel_tool_calls: true. Success is not measured on local-desktop.',
    deeper:
      'Native handlers exist for several families; unrecognized templates fall back to Generic. House 35B: start llama-server with --jinja on :8080. Strata :8083 tool calls are not verified here. Structured JSON is a different knob — response_format / GBNF. Measure grammar-ab/1.',
    links: [
      { href: '/guides/tool-calling', label: 'Tool calling' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/harnesses/hermes', label: 'Hermes' },
    ],
    seeAlso: ['chat-template', 'gbnf', 'json-schema', 'llamacpp'],
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
      { href: '/guides/quantize-gguf', label: 'Make GGUF quants' },
      { href: '/stacks', label: 'Stacks' },
      { href: '/calculator', label: 'Calculator' },
    ],
    seeAlso: ['quant', 'gguf', 'qwen36', 'imatrix'],
  },
  {
    id: 'uma',
    term: 'UMA',
    aliases: ['UMA frame buffer', 'VRAM carve-out', 'dedicated GPU memory'],
    letter: 'U',
    definition:
      'A BIOS reserve that hands the iGPU a fixed slice of system memory at boot. The rest of the kit stays with the OS unless GTT / dynamic allocation grows into it.',
    why: 'A huge carve-out on a 64 GB Strix Halo box leaves little for the desktop. A tiny carve-out leans on GTT. Check the board menu; AMDai does not pin a megabyte number.',
    deeper:
      'Same pool as system RAM. The two shopper labels stay Minimum system RAM needed and RAM needed at full context, adapted for what is left after the GPU share. Link /bios, /gpus/strix-halo, and /gpus/ryzen-igpu.',
    links: [
      { href: '/gpus/strix-halo', label: 'Strix Halo guide' },
      { href: '/gpus/ryzen-igpu', label: 'Ryzen iGPU' },
      { href: '/compare/radeon-vs-mac', label: 'Radeon vs Mac' },
      { href: '/bios', label: 'BIOS' },
      { href: '/calculator', label: 'Calculator' },
    ],
    seeAlso: ['gtt', 'apu', 'system-ram'],
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
      { href: '/can-run', label: 'Can my Radeon run it?' },
      { href: '/compare/gpus', label: 'Compare GPUs' },
      { href: '/guides/buying-used-radeon', label: 'Buying a used Radeon' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/gpus', label: 'GPU directory' },
    ],
    seeAlso: ['system-ram', 'kv-cache', 'offload', 'apu', 'used-radeon'],
  },
  {
    id: 'used-radeon',
    term: 'Used Radeon',
    aliases: ['used GPU', 'used 7900 XTX', 'buying used Radeon'],
    letter: 'U',
    definition:
      'A second-hand consumer or workstation Radeon bought for local LLMs. AMDai sizes it by VRAM and gfx first — not by a street price — and vets it with lspci, rocminfo, rocm-smi or amd-smi, and vulkaninfo.',
    why: 'Shoppers search “used 7900 XTX for llama.cpp.” The cited how-to is /guides/buying-used-radeon. Sheets stay on /gpus. llama.cpp Vulkan is the always-works path. Official ROCm follows the 10.1 matrix; consumer RDNA 2 and gfx1031 HSA_OVERRIDE stay unofficial. No invented prices or failure rates.',
    deeper:
      'Used-market sheets on this site include RX 6800 XT, 6700 XT, 6950 XT / 6900 XT, 7900 XTX / XT, and 7800 XT. 32 GB measured recipes stay on the R9700. Q6/Q5/Q4 plus a labeled UD-Q3_K_XL estimate. Both RAM lines print where the file spills.',
    links: [
      { href: '/guides/buying-used-radeon', label: 'Buying a used Radeon' },
      { href: '/budget', label: 'Budget' },
      { href: '/compare/gpus', label: 'Compare GPUs' },
      { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
      { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT' },
    ],
    seeAlso: ['vram', 'rdna4', 'vulkan', 'r9700'],
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
      { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
      { href: '/backends', label: 'Backends' },
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/setup/fedora', label: 'Fedora setup' },
      { href: '/setup/arch', label: 'Arch setup' },
    ],
    seeAlso: ['llamacpp', 'hip', 'gfx1201'],
  },
  {
    id: 'wsl2',
    term: 'WSL2',
    aliases: ['WSL', 'Windows Subsystem for Linux', 'ROCm WSL2'],
    letter: 'W',
    definition:
      'Windows Subsystem for Linux 2. ROCm 10.1.0 lists it as a technical preview: Ubuntu guest, Windows host Adrenalin, GPU via /dev/dxg. Profiling, debugging, and KFD-dependent tools are out of scope. AMD SMI is discovery and monitoring only.',
    why: 'People search “ROCm WSL2 Radeon” and “llama.cpp WSL AMD GPU.” The cited walk is /setup/wsl. It is not a measured local-desktop card. Native Linux stays the measured path. Native Windows first token is llama.cpp Vulkan.',
    deeper:
      'TheRock artifacts ship Ubuntu .deb and Python wheels, not RPM. rocminfo prints “WSL2 environment detected.” Missing /dev/kfd is a cited preview limit. Microsoft documents .wslconfig memory= (default 50% of Windows RAM). llama.cpp’s documented GPU path in a Linux guest is HIP (GGML_HIP=ON). We do not invent Vulkan-in-WSL.',
    links: [
      { href: '/setup/wsl', label: 'WSL2 on Radeon' },
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/rocm-problems/windows-wsl-preview', label: 'Windows / WSL2 preview' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
    seeAlso: ['rocm', 'hip', 'vulkan', 'llamacpp'],
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
