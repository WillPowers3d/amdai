/**
 * Consumer FAQ for /faq. Short answers that point at measured pages.
 * Do not invent tok/s, prices, or Q3 speeds. Q1/Q2 stay off the table.
 */

import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const FAQ_NAME = 'AMDai FAQ';

export const FAQ_GROUPS = [
  {
    id: 'about',
    label: 'About AMDai',
    description: 'Who writes this notebook, measured vs estimate, affiliates, and the Lab Notes feed.',
  },
  {
    id: 'getting-started',
    label: 'Getting started',
    description: 'Which GPU, Ubuntu vs Windows, and Vulkan vs ROCm HIP.',
  },
  {
    id: 'models-quants',
    label: 'Models & quants',
    description: '35B vs Flash, llama.cpp vs Strata, Q6 / Q5 / Q4, and when Q3 is only an estimate.',
  },
  {
    id: 'speed-vram',
    label: 'Speed & VRAM',
    description: 'How to read the overnight matrix and one GPU vs both cards.',
  },
  {
    id: 'context-ram',
    label: 'Context & system RAM',
    description: 'Minimum system RAM needed vs RAM needed at full context.',
  },
  {
    id: 'stack-lab',
    label: 'Stack Lab',
    description: 'Open in Stack Lab, recipes, amdai-bench cards, and when a harness comes later.',
  },
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    description: 'Cited ROCm problems, BIOS, and the glossary.',
  },
] as const;

export type FaqGroupId = (typeof FAQ_GROUPS)[number]['id'];

export type FaqLink = { href: string; label: string };

export type FaqItem = {
  id: string;
  group: FaqGroupId;
  question: string;
  answer: string;
  links: FaqLink[];
};

export const FAQ_ENTRIES: FaqItem[] = [
  {
    id: 'what-is-amdai',
    group: 'about',
    question: 'What is AMDai?',
    answer:
      'AMDai is an independent consumer notebook for local AI on AMD Radeon and ROCm. It is not an AMD publication, not a store, and not a scraped leaderboard. Official numbers come from amdai-bench/run@1 cards on the local-desktop R9700 rig unless a cell says estimate or cited. Who runs it and how we test live on About and Methodology.',
    links: [
      { href: '/about', label: 'About' },
      { href: '/methodology', label: 'How we test' },
      { href: '/contact', label: 'Contact' },
      { href: '/start', label: 'Getting started' },
    ],
  },
  {
    id: 'measured-vs-estimate',
    group: 'about',
    question: 'How do you label measured vs estimate?',
    answer:
      'A measured cell cites an official amdai-bench/run@1 card. Calculator totals, Q3 35B rows, and Windows paths stay labeled estimate unless a card says measured. Empty stays not measured. We do not invent tok/s or prices to fill a hole. The full rule set is on How we test.',
    links: [
      { href: '/methodology', label: 'How we test' },
      { href: '/results', label: 'Run cards' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/compare', label: 'Compare 35B' },
    ],
  },
  {
    id: 'affiliate-links',
    group: 'about',
    question: 'Do store buttons earn affiliate commission?',
    answer:
      'Some Check-price buttons are Amazon Associates, Rakuten (Newegg), or B&H when those IDs are set. A commission does not change the price you pay and does not change the recommendation. We do not show a live or stale price. Full program notes are on the affiliate disclosure.',
    links: [
      { href: '/disclosure', label: 'Affiliate disclosure' },
      { href: '/budget', label: 'Setup by budget' },
      { href: '/about', label: 'About' },
    ],
  },
  {
    id: 'lab-notes-rss',
    group: 'about',
    question: 'How do I follow Lab Notes without an account?',
    answer:
      'Subscribe to the Lab Notes RSS feed for posts, dated updates, and official run cards. The email digest is optional and email-only. We do not invent a social account.',
    links: [
      { href: '/rss.xml', label: 'RSS feed' },
      { href: '/newsletter', label: 'Lab Notes digest' },
      { href: '/blog', label: 'Blog' },
      { href: '/updates', label: 'Updates' },
    ],
  },
  {
    id: 'which-gpu',
    group: 'getting-started',
    question: 'Which GPU should I start with?',
    answer:
      'The measured house box is one AMD Radeon AI PRO R9700 (32 GB, gfx1201). There is no consumer RX 9700. A 16 GB RX 9070 XT is the same generation with half the VRAM — see the RX 9070 XT recipe sheet for calculator fit estimates, not local-desktop tok/s. The non-XT RX 9070 is the 16 GB / 220 W gfx1201 sheet next to it; the 12 GB RX 9070 GRE is the 192-bit / 432 GB/s GRE sheet. The cheaper 16 GB RDNA 4 pick is the RX 9060 XT (gfx1200) — same estimate-sheet rules, different family package. The 24 GB RX 7900 XTX is the RDNA 3 gfx1100 used-card sheet — AMD cites 24 GB GDDR6 and 355 W typical board power; official on the cited ROCm 10.1 matrix. The 20 GB RX 7900 XT is the same gfx1100 family with AMD citing 315 W TBP — not the 24 GB XTX and not the 16 GB 7900 GRE. The 16 GB RX 7800 XT is the gfx1101 used-card sheet — AMD cites 16 GB GDDR6 and 263 W typical board power; official on that same 10.1 matrix. The 16 GB 7900 GRE sits between the 7900 XT and 7800 XT on the gfx1100 pin. The 12 GB 7700 XT is the next smaller gfx1101 sheet after the 7800 XT. The 16 GB 7600 XT is the gfx1102 budget 16 GB sheet — not the 8 GB RX 7600, which has its own estimate sheet. The 16 GB RX 6800 XT is the RDNA 2 gfx1030 estimate sheet — unofficial on the current Radeon ROCm row, Vulkan first. The shared RX 6950 XT / 6900 XT sheet is the other 16 GB gfx1030 consumer pair (335 W / 576 GB/s vs 300 W / 512 GB/s). The 12 GB RX 6700 XT is the RDNA 2 gfx1031 used-card sheet — not the 6800 XT and not the 10 GB non-XT 6700; AMD cites 12 GB GDDR6 and 230 W typical board power. Workstation PRO sheets: W7900 is 48 GB gfx1100 (864 GB/s, 295 W TBP); W7800 is 32 GB gfx1100 (576 GB/s, 260 W TBP) with a separate AMD-listed 48 GB SKU; W7700 is 16 GB gfx1101 (576 GB/s, 190 W TBP); W6800 is the official 32 GB gfx1030 RDNA 2 row (512 GB/s, 250 W TBP). None of those four are measured on local-desktop. Mini-PCs on Ryzen AI Max / Strix Halo (Radeon 8060S, gfx1151) are a shared-memory APU, not a discrete VRAM card — see that cited guide. Confirm the SKU on the R9700 measured page and the GPU directory, then size the file on the calculator before you buy a second card.',
    links: [
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/compare/gpus', label: 'Compare GPUs' },
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT sheet' },
      { href: '/gpus/rx-9070', label: 'RX 9070 sheet' },
      { href: '/gpus/rx-9070-gre', label: 'RX 9070 GRE sheet' },
      { href: '/gpus/rx-9060-xt', label: 'RX 9060 XT sheet' },
      { href: '/gpus/strix-halo', label: 'Strix Halo / Ryzen AI Max' },
      { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX sheet' },
      { href: '/gpus/rx-7900-xt', label: 'RX 7900 XT sheet' },
      { href: '/gpus/rx-7900-gre', label: 'RX 7900 GRE sheet' },
      { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT sheet' },
      { href: '/gpus/rx-7700-xt', label: 'RX 7700 XT sheet' },
      { href: '/gpus/rx-7600-xt', label: 'RX 7600 XT sheet' },
      { href: '/gpus/rx-7600', label: 'RX 7600 sheet' },
      { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT sheet' },
      { href: '/gpus/rx-6950-xt', label: 'RX 6950 XT / 6900 XT sheet' },
      { href: '/gpus/rx-6700-xt', label: 'RX 6700 XT sheet' },
      { href: '/gpus/w7900', label: 'PRO W7900 sheet' },
      { href: '/gpus/w7800', label: 'PRO W7800 sheet' },
      { href: '/gpus/w7700', label: 'PRO W7700 sheet' },
      { href: '/gpus/w6800', label: 'PRO W6800 sheet' },
      { href: '/gpus', label: 'GPU directory' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/start', label: 'Getting started' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/power', label: 'Power and PSU' },
      { href: '/budget', label: 'Setup by budget' },
    ],
  },
  {
    id: 'pick-a-budget',
    group: 'getting-started',
    question: 'How do I pick a budget tier?',
    answer:
      'Setup by budget is four tiers from a ~16 GB card to the two-R9700 Pro rig. Size vs speed changes the pick. Buttons say Check price — we do not invent a street price. Consumer 7900 / 7800 sheets are estimates; the R9700 page is the measured north star.',
    links: [
      { href: '/budget', label: 'Setup by budget' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/disclosure', label: 'Affiliate disclosure' },
    ],
  },
  {
    id: 'psu-sizing',
    group: 'getting-started',
    question: 'How do I size a PSU for a Radeon local-AI box?',
    answer:
      'Read AMD’s published TBP on the product page. The R9700 is 300 W TBP with a 750 W minimum PSU recommendation (product page). Other directory cards stay not recorded until we cite that page. Two 300 W TBP cards plus 750 W minimum per card is not a dual-card PSU SKU we invent. 1000W-class is search guidance, not a SKU. The cited shopper guide is /power. llama.cpp first for tokens. Q3 stays a labeled estimate. Nothing below Q3.',
    links: [
      { href: '/power', label: 'Power and PSU' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/budget', label: 'Budget' },
    ],
  },
  {
    id: 'radeon-vs-nvidia',
    group: 'getting-started',
    question: 'Radeon or NVIDIA for a local LLM?',
    answer:
      'Radeon wins the VRAM class we shop — 32 GB on the R9700, 24 / 20 / 16 GB on the RX 7900 / 7800 sheets, two-card layouts we measured on local-desktop, and our cited llama.cpp numbers. NVIDIA wins CUDA day-one: vLLM and a longer tail of engines and models land there first. Specs cite the vendor page. NVIDIA tok/s stay “no cited number yet” unless a third-party figure is linked. Buttons say Check price — we do not print a figure. The shopper page is Radeon vs NVIDIA.',
    links: [
      { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/backends', label: 'Backends' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'strix-halo-apu',
    group: 'getting-started',
    question: 'Can I run a local Qwen on a Ryzen AI Max / Strix Halo mini-PC?',
    answer:
      'Yes as a cited path, not a measured local-desktop card. Ryzen AI Max+ 395 with Radeon 8060S is gfx1151 on AMD’s ROCm 10.1 matrix. It is an APU: the GPU uses shared system memory (we size 64 GB and 128 GB kits). llama.cpp Vulkan is the first token. HIP is second. The MES REMOVE_QUEUE hang is on the ROCm problems tracker. Size the file on the calculator. We do not invent tok/s for this box.',
    links: [
      { href: '/gpus/strix-halo', label: 'Strix Halo guide' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/rocm-problems/strix-halo-mes-remove-queue', label: 'MES hang' },
      { href: '/bios', label: 'BIOS' },
      { href: '/setup', label: 'First-run setup' },
    ],
  },
  {
    id: 'ubuntu-or-windows',
    group: 'getting-started',
    question: 'Ubuntu or Windows for a first local LLM box?',
    answer:
      'Ubuntu LTS named on AMD’s current ROCm matrix is the path we write. First-run setup walks Ubuntu 24.04+ to the first token. Linux Mint, Pop!_OS, and Kubuntu are Ubuntu-based but are not on that 10.1 OS row — follow /setup only as unofficial, not verified on our rig. Cited Fedora and Arch guides live at /setup/fedora and /setup/arch. Docker or Podman is a cited isolated path at /setup/docker — official llama.cpp images, not a container tok/s card. LM Studio is a cited desktop llama.cpp wrapper at /setup/lm-studio — Vulkan runtime first on Radeon, local /v1 on :1234, not an LM Studio tok/s card. The Windows guide at /setup/windows is cited vendor docs, not measured on local-desktop. The WSL2 guide at /setup/wsl is the same preview AMD names in the 10.1 notes — KFD tools out of scope, AMD SMI monitoring-only, not a measured local-desktop daily driver. Radeon Stack Lab follows that Ubuntu path — packages are not published yet. Vulkan llama.cpp is the honest Windows path for tokens. Full ROCm userspace is a Linux product. We do not have Windows, WSL, Fedora, Arch, container, or LM Studio tok/s cards.',
    links: [
      { href: '/setup', label: 'First-run setup' },
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/setup/wsl', label: 'WSL2 setup' },
      { href: '/setup/fedora', label: 'Fedora setup' },
      { href: '/setup/arch', label: 'Arch setup' },
      { href: '/setup/docker', label: 'Docker / Podman' },
      { href: '/setup/lm-studio', label: 'LM Studio' },
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/start', label: 'Getting started' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
      { href: '/rocm-problems/windows-wsl-preview', label: 'Windows / WSL2 preview' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'docker-or-podman',
    group: 'getting-started',
    question: 'Can I run llama.cpp on Radeon in Docker or Podman?',
    answer:
      'Yes as a cited path, not a measured local-desktop card. Official ggml-org images are server-vulkan first and server-rocm second. Pass /dev/dri for Vulkan; add /dev/kfd and optional seccomp=unconfined for ROCm. Bind the published port to 127.0.0.1. Rootless Podman needs keep-groups; Fedora SELinux needs container_use_devices. Q6/Q5/Q4 first; Q3 stays a labeled estimate. We do not invent container tok/s or a speed delta versus bare metal.',
    links: [
      { href: '/setup/docker', label: 'Docker / Podman' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
    ],
  },
  {
    id: 'lm-studio-on-radeon',
    group: 'getting-started',
    question: 'Can I run LM Studio on a Radeon GPU?',
    answer:
      'Yes as a cited path, not a measured local-desktop card. LM Studio is a desktop llama.cpp wrapper. AMD’s playbook documents Vulkan and ROCm runtimes; Vulkan is the first pick on RDNA 2 / 3 / 4 and the R9700. Official LM Studio docs do not publish a per-SKU Radeon list — if the ROCm runtime is missing or the GPU meter stays idle, stay Vulkan or move to /setup. Windows installer or Linux AppImage (Ubuntu 20.04+; versions newer than 22 are not well tested). GPU offload max, house file Qwen3.6-35B-A3B UD-Q5_K_XL at 262K. Q6/Q5/Q4 first; Q3 stays a labeled estimate. Local OpenAI-compatible /v1 is http://127.0.0.1:1234/v1 for harnesses like Hermes. Decode numbers on this site are Ubuntu llama.cpp llama-bench, not measured inside LM Studio. We do not invent an LM Studio tok/s.',
    links: [
      { href: '/setup/lm-studio', label: 'LM Studio on Radeon' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/backends/lmstudio', label: 'LM Studio backend' },
      { href: '/harnesses/lm-studio', label: 'LM Studio harness' },
      { href: '/harnesses/hermes', label: 'Hermes' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
    ],
  },
  {
    id: 'local-coding-assistant',
    group: 'getting-started',
    question: 'Can I run Aider, Cline, or Continue on a Radeon GPU?',
    answer:
      'Yes. Start llama.cpp llama-server first (Vulkan on Ubuntu 24.04+), then point the tool at http://127.0.0.1:8080/v1. House file is Qwen3.6-35B-A3B UD-Q5_K_XL at 262K on one R9700. Aider prefixes the model with openai/ and needs a non-empty API key. Cline uses the OpenAI Compatible provider — do not append /chat/completions to the base URL. Continue sets apiBase including /v1. LM Studio :1234 is a secondary path. Q6/Q5/Q4 first; Q3 stays a labeled estimate. Decode numbers on this site are Ubuntu llama.cpp llama-bench, not Aider/Cline/Continue tok/s. We do not invent a harness speed.',
    links: [
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/harnesses/aider', label: 'Aider' },
      { href: '/harnesses/cline', label: 'Cline' },
      { href: '/harnesses/continue', label: 'Continue' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/setup/lm-studio', label: 'LM Studio' },
    ],
  },
  {
    id: 'ollama-on-radeon',
    group: 'getting-started',
    question: 'Can I run Ollama on a Radeon GPU?',
    answer:
      'Yes as a cited path, not a measured local-desktop card. Ollama is a packaged llama.cpp / ROCm (or Vulkan) runtime. Linux first: curl -fsSL https://ollama.com/install.sh | sh, then the AMD ROCm tarball. Official gpu.mdx lists R9700 / 9070 XT on Linux ROCm v7; the Windows ROCm table does not name those cards. Prove the GPU with ollama ps. Default context is 4096 — set OLLAMA_CONTEXT_LENGTH. KV grows with OLLAMA_NUM_PARALLEL. House family is Qwen3.6-35B-A3B; official library Q4 is qwen3.6:35b-a3b-q4_K_M; import the house UD-Q5 GGUF for the file we measure. Q3 stays a labeled estimate. Decode numbers on this site are Ubuntu llama.cpp llama-bench, not Ollama tok/s. llama.cpp you compile remains the daily driver. gfx1201 tensiles and Windows R9700 CPU fallback live on /rocm-problems.',
    links: [
      { href: '/setup/ollama', label: 'Ollama on Radeon' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/backends/ollama', label: 'Ollama backend' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm-problems/ollama-gfx1201-tensile', label: 'gfx1201 tensiles' },
      { href: '/rocm-problems/ollama-r9700-windows', label: 'R9700 Windows' },
      { href: '/setup/lm-studio', label: 'LM Studio' },
    ],
  },
  {
    id: 'open-webui-on-radeon',
    group: 'getting-started',
    question: 'Can I run Open WebUI on a Radeon GPU?',
    answer:
      'Yes as a cited path, not a measured local-desktop card. Open WebUI is a browser chat UI. It does not run the GGUF. Start llama.cpp llama-server first (Vulkan on Ubuntu 24.04+), then Docker or pip. Official Docker maps 3000:8080; pip defaults to :8080 so use --port 3000 or it collides with house llama-server. Connections → OpenAI URL http://127.0.0.1:8080/v1 (host.docker.internal from a container). House file is Qwen3.6-35B-A3B UD-Q5_K_XL. Q6/Q5/Q4 first; Q3 stays a labeled estimate. Do not pull the :cuda image on a Radeon. Decode numbers on this site are Ubuntu llama.cpp llama-bench, not Open WebUI. Ollama is a secondary connection.',
    links: [
      { href: '/setup/open-webui', label: 'Open WebUI on Radeon' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/harnesses/open-webui', label: 'Open WebUI harness' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/setup/docker', label: 'Docker / Podman' },
      { href: '/setup/ollama', label: 'Ollama' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
    ],
  },
  {
    id: 'wsl-on-radeon',
    group: 'getting-started',
    question: 'Can I run local AI on a Radeon under Windows WSL2?',
    answer:
      'Yes as a cited technical preview, not a measured local-desktop card. ROCm 10.1.0 lists WSL2 in TheRock artifacts: Ubuntu 26.04 / 24.04 / 22.04 guests, host Adrenalin then guest ROCm via /dev/dxg. Profiling, debugging, and KFD-dependent tools are out of scope; AMD SMI is monitoring-only. Native Linux at /setup is still the measured path. Native Windows first token is llama.cpp Vulkan at /setup/windows. Inside the guest, llama.cpp HIP (GGML_HIP=ON) is the documented GPU build — we do not invent Vulkan-in-WSL. Q6/Q5/Q4 first; Q3 stays a labeled estimate. Nothing on /setup/wsl was measured on local-desktop.',
    links: [
      { href: '/setup/wsl', label: 'WSL2 on Radeon' },
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/rocm-problems/windows-wsl-preview', label: 'Windows / WSL2 preview' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
    ],
  },
  {
    id: 'local-image-gen',
    group: 'getting-started',
    question: 'Can I run Stable Diffusion or Flux on a Radeon, not just a local LLM?',
    answer:
      'Yes. ComfyUI is the AMDai first image-gen path — HIP/ROCm PyTorch, not llama.cpp Vulkan, and it does not speak llama-server /v1. First-run install is /setup/comfyui. Fit tables stay on /image-gen. Linux Ubuntu 24.04+ first. Image-gen speeds are not yet measured by AMDai. llama.cpp stays first for LLMs. Q3 stays a labeled estimate. Nothing below Q3.',
    links: [
      { href: '/setup/comfyui', label: 'ComfyUI on Radeon' },
      { href: '/image-gen', label: 'Image gen on Radeon' },
      { href: '/harnesses/image', label: 'ComfyUI harness' },
      { href: '/setup', label: 'First-run setup' },
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
    ],
  },
  {
    id: 'comfyui-on-radeon',
    group: 'getting-started',
    question: 'How do I install ComfyUI on a Radeon GPU?',
    answer:
      'Cited walk is /setup/comfyui: Ubuntu 24.04+ git clone, a ROCm PyTorch venv, pip install -r requirements.txt, then python ComfyUI/main.py at http://127.0.0.1:8188. Fit and family tables stay on /image-gen. ComfyUI does not speak llama-server /v1. Image-gen speeds are not yet measured by AMDai. Q3 stays a labeled estimate on any LLM that shares the box. Nothing below Q3.',
    links: [
      { href: '/setup/comfyui', label: 'ComfyUI on Radeon' },
      { href: '/image-gen', label: 'Image gen on Radeon' },
      { href: '/harnesses/image', label: 'ComfyUI harness' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/rocm-problems', label: 'ROCm problems' },
    ],
  },
  {
    id: 'llamacpp-multi-gpu',
    group: 'getting-started',
    question: 'How do I run llama.cpp across two Radeon GPUs?',
    answer:
      'Cited walk is /setup/multi-gpu. llama.cpp first: --list-devices, then --device or GGML_VK_VISIBLE_DEVICES on Vulkan and HIP_VISIBLE_DEVICES / ROCR_VISIBLE_DEVICES on HIP. Official default is --split-mode layer; --split-mode row is deprecated; --split-mode tensor is experimental. Two patterns: one model split across both cards, or two llama-server copies pinned one per card (house ports :8080 and :8081). Overnight 35B UD-Q5 at 4K is 102.39 tok/s on one R9700 and 82.78 on a layer split. Combo-preset tok/s is not measured — use amdai-bench. Q3 stays a labeled estimate. Nothing below Q3.',
    links: [
      { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp how-to' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU (why)' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs two GPU' },
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ],
  },
  {
    id: 'local-speech',
    group: 'getting-started',
    question: 'Can I run speech-to-text or TTS on a Radeon, not just a local LLM?',
    answer:
      'Yes. whisper.cpp Vulkan is the AMDai first STT path — ggml family, not llama-server /v1. Piper is the first TTS path (pip install piper-tts). The cited shopper guide is /speech. Linux Ubuntu 24.04+ first. Memory cells copy the official whisper.cpp README table. Speech speeds are not yet measured by AMDai. llama.cpp stays first for LLMs. Q3 stays a labeled estimate. Nothing below Q3.',
    links: [
      { href: '/speech', label: 'Speech on Radeon' },
      { href: '/setup', label: 'First-run setup' },
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'local-rag',
    group: 'getting-started',
    question: 'Can I chat with my own PDFs and notes on a Radeon, not just a local LLM?',
    answer:
      'Yes. Local RAG on AMDai is chunk → embed → retrieve → answer. The first embed path is llama.cpp --embeddings and /v1/embeddings with a dedicated embedding GGUF. The chat sidecar stays llama.cpp Vulkan. The cited shopper guide is /rag. Linux Ubuntu 24.04+ first. Official nomic-embed-text-v1.5 Q6_K is 108 MiB; Q5_K_M 95 MiB; Q4_K_M 81 MiB. Q3_K_M (65 MiB) is a labeled estimate. Speeds and retrieval quality are not yet measured by AMDai. There is no house Stack Lab recipe. Nothing below Q3.',
    links: [
      { href: '/rag', label: 'RAG on Radeon' },
      { href: '/harnesses/anythingllm', label: 'AnythingLLM' },
      { href: '/setup', label: 'First-run setup' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/long-context', label: 'Long context' },
    ],
  },
  {
    id: 'local-vision',
    group: 'getting-started',
    question: 'Can I pass a picture to a local LLM on a Radeon?',
    answer:
      'Yes. Local vision on AMDai is llama.cpp multimodal: a text GGUF plus a matching mmproj GGUF, served by llama-mtmd-cli or llama-server --mmproj. That is image in, text out — not ComfyUI image gen. The cited shopper guide is /vision. Linux Ubuntu 24.04+ first. Speeds are not yet measured by AMDai. The house 35B daily driver is text-only; we do not invent an mmproj for that file. Q3 stays a labeled estimate. Nothing below Q3.',
    links: [
      { href: '/vision', label: 'Vision on Radeon' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/image-gen', label: 'Image gen' },
      { href: '/setup', label: 'First-run setup' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'vulkan-or-hip',
    group: 'getting-started',
    question: 'Vulkan or ROCm HIP?',
    answer:
      'Consumer default on AMDai is llama.cpp Vulkan for the daily-driver 35B. HIP is the ROCm compile when you need it, and it is also where gfx1201 “no binary for GPU” reports show up. If HIP configure is a mess, try Vulkan first and read the cited problem row. Engine notes live on the backends pages — llama.cpp first.',
    links: [
      { href: '/backends', label: 'Backends' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/rocm-problems/hip-no-binary-for-gpu', label: 'HIP no binary' },
    ],
  },
  {
    id: 'will-rocm-work',
    group: 'getting-started',
    question: 'Will ROCm work for a local LLM on Ubuntu in 2026?',
    answer:
      'Yes for single-GPU inference if you pin a current AMD Core SDK (10.1 line as of the weekly card) and a matching runtime. It is still not CUDA. Packaging is the hard part. Longer answers stay on What is ROCm and the ROCm FAQ — this page does not repeat those guides.',
    links: [
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/rocm/faq', label: 'ROCm FAQ' },
      { href: '/', label: 'Weekly card' },
    ],
  },
  {
    id: 'apt-install-rocm',
    group: 'getting-started',
    question: 'Can I apt install rocm from Ubuntu?',
    answer:
      'You can. You should not, if you want Core SDK 10.0/10.1, gfx1201, or a current vLLM ROCm image. Canonical’s archive has lagged. Add AMD’s 10.1 repo or use ROCm CLI v0.2.0 — never both plus archive rocm. Walkthrough: Install ROCm.',
    links: [
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
      { href: '/rocm-problems/ubuntu-rocm-package-shadow', label: 'Archive shadow' },
      { href: '/start', label: 'Getting started' },
    ],
  },
  {
    id: 'r9700-pro-sku',
    group: 'getting-started',
    question: 'Is “R9700 Pro” a real SKU?',
    answer:
      'The product is the AMD Radeon AI PRO R9700. There is no consumer RX 9700 in AMD’s current lineup. The gaming sibling is the RX 9070 series. Names and gfx IDs: GPU directory.',
    links: [
      { href: '/gpus', label: 'GPU directory' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'should-i-start-with-vllm',
    group: 'getting-started',
    question: 'Should I start with vLLM?',
    answer:
      'No. Consumers start on llama.cpp. vLLM is the multi-client serve try. AMD’s 10.0 supported combo is still 0.27 + PyTorch 2.13. Community / ROCm 0.31 is this week’s serve try. Default pip install vllm is CUDA. We do not invent a local-desktop 0.31 tok/s.',
    links: [
      { href: '/backends', label: 'Backends' },
      { href: '/software', label: 'AI software' },
      { href: '/updates/matrix', label: 'Version matrix' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/can-run', label: 'Can my Radeon run it?' },
    ],
  },
  {
    id: 'can-radeon-run-it',
    group: 'models-quants',
    question: 'Can my Radeon run this model?',
    answer:
      'Use /can-run. Each cited GPU sheet × cited /models page has a calculator verdict: fits fully on GPU, fits with RAM offload, needs 2 GPUs, or does not fit. Q6 / Q5 / Q4 plus a labeled Q3 estimate. Measured decode is only the official local-desktop 35B llama.cpp Vulkan sweep on R9700. Everything else stays not measured yet. llama.cpp first.',
    links: [
      { href: '/can-run', label: 'Can my Radeon run it?' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus', label: 'GPU directory' },
      { href: '/models', label: 'Models' },
    ],
  },
  {
    id: 'speed-up-llamacpp',
    group: 'models-quants',
    question: 'How do I speed up llama.cpp on Radeon?',
    answer:
      'Fit the file first, then turn one cited knob at a time: -ngl, --threads, --threads-batch, -b / -ub, -fa, KV type, --split-mode, a Q4+ draft, or a vendor power cap. The shopper guide is /tuning. Measured decode is the official local-desktop 35B llama.cpp Vulkan sweep. Everything else stays not measured yet. Q3 is a labeled estimate. Draft models stay Q4 and up. llama.cpp first.',
    links: [
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ],
  },
  {
    id: '35b-or-flash',
    group: 'models-quants',
    question: '35B or Flash — which Qwen should I run first?',
    answer:
      'Daily driver: Qwen3.6-35B-A3B Unsloth UD-Q5_K_XL on one R9700, llama.cpp Vulkan, 262144 context, f16 KV, no RAM offload. Measured on our rig, 2026-10, llama-bench: 102.39 tok/s at 4K, 90.52 at 32K, 66.43 at 128K, 44.4 at 256K. Fast agents: Qwen 3.8 Flash UD-Q6_K_XL on Strata — cited pair ~32.6 tok/s versus llama.cpp ~16 tok/s at 262K. House models only. Recipe and cards: stacks, recipes, /qwen.',
    links: [
      { href: '/stacks', label: 'Stacks' },
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/recipes/qwen38-flash.strata.262k', label: 'Flash recipe' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/models', label: 'Models' },
      { href: '/models/qwen36-27b', label: 'Qwen3.6 27B' },
      { href: '/models/qwen38-27b', label: 'Qwen3.8 27B' },
      { href: '/models/glm-53-flash', label: 'GLM 5.3 Flash' },
      { href: '/compare/models', label: 'Compare models' },
      { href: '/start', label: 'Getting started' },
    ],
  },
  {
    id: 'llamacpp-vs-strata',
    group: 'models-quants',
    question: 'Why llama.cpp first instead of Strata?',
    answer:
      'AMDai’s consumer default is llama.cpp (Vulkan first) for the daily-driver 35B. Strata is the first-party Flash try on the house Pro rig — the cited pair is ~32.6 tok/s versus llama.cpp ~16 tok/s at 262K on Qwen 3.8 Flash UD-Q6_K_XL. Start on llama.cpp unless the job is that Flash pin.',
    links: [
      { href: '/backends', label: 'Backends' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/backends/strata', label: 'Strata' },
      { href: '/stacks', label: 'Stacks' },
      { href: '/harnesses', label: 'Harnesses' },
    ],
  },
  {
    id: 'q6-q5-q4',
    group: 'models-quants',
    question: 'Q6, Q5, or Q4 — what should I pick?',
    answer:
      'Those letters are GGUF quant recipes, not a speed ranking we invent. The overnight local-desktop sweep measured UD-Q5_K_XL, Q5_K_M, Q4_K_M, and Q6_K on llama.cpp Vulkan. Read the cells on /benchmarks and the side-by-side on /compare. Q6 on one card at 32K and up is partly on DDR5 — that row says so. Fit the file on the calculator.',
    links: [
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/compare', label: 'Compare 35B' },
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4' },
      { href: '/quants', label: 'Quants' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'when-is-q3-an-estimate',
    group: 'models-quants',
    question: 'When is Q3 only an estimate?',
    answer: `UD-Q3_K_XL may appear in comparison chrome as a labeled estimate. The cited file listing is ${COMPARE_Q3_CITE}. We do not invent a Q3 tok/s. A measured Qwen 3.8 Flash Q3 run is the approved one-time exception and is labeled on that card. Q3 is not a measured 35B overnight row.`,
    links: [
      { href: '/compare', label: 'Compare 35B' },
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4 + Q3 estimate' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/quants', label: 'Quants' },
    ],
  },
  {
    id: 'why-no-q1-q2',
    group: 'models-quants',
    question: 'Why don’t you list Q1 or Q2?',
    answer:
      'AMDai does not offer or recommend Q1 or Q2 quants. The calculator and compare pages list Q3 and up. Q3 stays a labeled estimate unless a card is measured. We will not invent a missing smaller file’s tok/s to fill a table.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/quants', label: 'Quants' },
      { href: '/glossary', label: 'Glossary' },
    ],
  },
  {
    id: 'how-to-read-benchmarks',
    group: 'speed-vram',
    question: 'How do I read /benchmarks and /results?',
    answer:
      'llama.cpp llama-bench prints pp (prefill) and tg (decode). Decode is the chat tok/s. /benchmarks is the 33-card local-desktop overnight matrix: UD-Q5, Q5, Q4, Q6 × 4K / 32K / 128K / 256K × one GPU and split. Each cell links to its amdai-bench/run@1 card on /results — launch command, VRAM per card, VRAM total, peak system RAM. Empty stays not measured. The overnight cards recorded llama-bench, not llama-server.',
    links: [
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/results', label: 'Run cards' },
      { href: '/compare', label: 'Compare 35B' },
      { href: '/glossary', label: 'Glossary' },
    ],
  },
  {
    id: 'two-gpus-double-speed',
    group: 'speed-vram',
    question: 'Will two R9700s double decode speed?',
    answer:
      'Not automatically. On the overnight cards, one R9700 UD-Q5_K_XL at 4K decodes 102.39 tok/s; the two-card split is 82.78 tok/s. A split pays an RCCL / topology tax. Two copies of the same server can serve two requests; that is not “double one chat.” Read /multi-gpu for the why and /setup/multi-gpu for the llama.cpp flags, then measure on /compare/one-vs-two-gpu and /qwen36-dual before you buy a second card for speed.',
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp how-to' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs two GPU' },
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'two-gpu-combo',
    group: 'speed-vram',
    question: 'What is a two-GPU Combo versus a split?',
    answer:
      'A split is one model cut across two cards (llama.cpp -sm layer on the overnight rows). A Combo on this site is two models at once — Flash on one card and 35B on the other — not a promise of 2× decode. Hands-on flags, ports, and systemd-style pins are /setup/multi-gpu. Read Dual / multi-GPU before you buy a second card for speed.',
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp how-to' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs two GPU' },
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/flash-daily', label: 'Flash daily' },
    ],
  },
  {
    id: 'q6-4k-two-numbers',
    group: 'speed-vram',
    question: 'Why does Q6_K 1-GPU 4K show 82.62 and 103.23 tok/s?',
    answer:
      'The 35B table cell is 103.23 tok/s from the 23:55 card — the 4K point in the complete Q6_K single-GPU series. The earlier 23:26 card at 82.62 tok/s stays on /results and is not averaged into the cell. The whole sweep is measured, pending re-verify after the DDR5-5200 oops. Read both cards on /results and the caveat on /benchmarks.',
    links: [
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/results', label: 'Run cards' },
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4' },
    ],
  },
  {
    id: 'min-ram-vs-full-context',
    group: 'context-ram',
    question: 'How much system RAM do I need at short context vs full context?',
    answer:
      'The calculator prints two lines: “Minimum system RAM needed” (the load at the context you picked) and “RAM needed at full context” (262144 for the house 35B). Overnight UD-Q5_K_XL llama-bench on one R9700 recorded peak system RAM 37.32 GB at 4K and 42.9 GB at 256K (Linux GiB labeled GB). Those are measured peaks, pending re-verify after the RAM fix — not a kit you must buy. Change context on the calculator and read the pair.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/results/local-desktop-20261012-2311-35b-udq5kxl-1gpu-4k-llamacpp-f16', label: '4K run card' },
      { href: '/results/local-desktop-20261012-2314-35b-udq5kxl-1gpu-256k-llamacpp-f16', label: '256K run card' },
      { href: '/compare', label: 'Compare 35B' },
    ],
  },
  {
    id: 'what-is-ram-offload',
    group: 'context-ram',
    question: 'What is RAM offload and when do I use it?',
    answer:
      'When the GGUF plus KV will not stay in VRAM, layers or experts spill to DDR5 and decode falls. Q6 35B on one R9700 at 32K and up is partly offloaded on the overnight cards. Qwen 3.8 Flash does not fit in one 32 GB card — hot experts stay in VRAM, the rest on DDR5. Kit sizes and measured DIMM-speed rows live on Flash RAM offload. We do not invent an offload tok/s when the card omitted one.',
    links: [
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/flash-daily', label: 'Flash daily driver' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
  {
    id: 'long-context-radeon',
    group: 'context-ram',
    question: 'Can I run 128K–262K locally on a Radeon?',
    answer:
      'Yes on the measured house path: Qwen3.6-35B-A3B on llama.cpp Vulkan, f16 KV, one R9700 at 262144. Official UD-Q5_K_XL decode is 66.43 tok/s at 128K and 44.4 tok/s at 256K. The shopper guide is /long-context. Empty cells stay not measured yet. Q3 is a labeled estimate. We do not publish a planted-token recall score. llama.cpp first.',
    links: [
      { href: '/long-context', label: 'Long context on Radeon' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/compare', label: 'Compare 35B' },
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/troubleshoot#oom-context', label: 'Long-context OOM' },
    ],
  },
  {
    id: 'what-is-stack-lab',
    group: 'stack-lab',
    question: 'What is Radeon Stack Lab?',
    answer:
      'An Ubuntu 24.04+ companion (Origin repo / local install — packages not published yet, no public download URL) with the same catalog as this site’s YAML. Jobs: check my rig, setup doctor, model manager, apply recipes, start a profile, live dashboard, amdai-bench, then share cards back. Profile qwen-reliable is the daily-driver 35B Q5. qwen-fast-agent is Flash on Strata. Lab Notes is the notebook; Stack Lab is the local app that records runs.',
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/stacks', label: 'Stacks' },
      { href: '/maintain', label: 'Weekday scrape' },
    ],
  },
  {
    id: 'open-in-stack-lab',
    group: 'stack-lab',
    question: 'How does Open in Stack Lab work?',
    answer:
      'Allowlisted Lab Notes buttons use the documented amdai-stack-lab: screens (recipes, doctor, planner, library, support, profile). If the app is not installed, they fall back to Stack Lab install notes — packages are not published yet, and there is no public download URL. If Stack Lab is already running on this machine, the local app is 127.0.0.1:47321. House profiles qwen-reliable and qwen-fast-agent are the measured R9700 daily and Flash pins. They do not apply to untested consumer cards.',
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/stack-lab#install', label: 'Install notes' },
      { href: '/recipes.json', label: 'recipes.json' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
    ],
  },
  {
    id: 'recipes-and-amdai-bench',
    group: 'stack-lab',
    question: 'How do recipes and amdai-bench connect?',
    answer:
      'A recipe is a pinned launch on a named GPU — model, quant, engine, context, gates. Stack Lab’s amdai-bench emitter writes one official test-run card per line (schema amdai-bench/run@1). Lab Notes ingests those cards onto /results. The 35B matrix on /benchmarks is built only from those cards. Do not invent tok/s in a recipe; attach a log.',
    links: [
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/results', label: 'Run cards' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/contribute', label: 'Contribute a recipe' },
    ],
  },
  {
    id: 'do-i-need-a-harness',
    group: 'stack-lab',
    question: 'Do I need a harness?',
    answer:
      'No. You need tokens on the GPU first. Hermes or OpenClaw come after a loopback /v1 works. Local Hermes on local-desktop points at Strata :8083 and llama-server. Snippets: connect. Catalog: harnesses. A slow harness is usually a backend problem, not a card-reputation problem.',
    links: [
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/harnesses/connect', label: 'Connect' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/backends', label: 'Backends' },
    ],
  },
  {
    id: 'gpu-not-seen',
    group: 'troubleshooting',
    question: 'The GPU is not seen or HIP configure is a mess — where do I start?',
    answer:
      'Start from a symptom on /troubleshoot, or paste the log in the error matcher. Cited rows live on /rocm-problems: HIP no binary for GPU, Ubuntu archive packages shadowing AMD’s install, MODE1 reset / MES hang on gfx12, unofficial HSA overrides. Do not treat a community HSA_OVERRIDE as a measured fix. Walkthroughs: verify ROCm, then troubleshooting.',
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/troubleshooting', label: 'Troubleshooting' },
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
    ],
  },
  {
    id: 'bios-settings',
    group: 'troubleshooting',
    question: 'Which BIOS settings matter for local AI?',
    answer:
      'Cited chipset notes: Above 4G, ReBAR/SAM, CSM off, and matching GPU lane widths (x8/x8 or x16/x16 — not a leftover x4). The per-board table is empty until submissions. We do not invent a motherboard for local-desktop. Read /bios before you file “ROCm is broken” on a firmware miss.',
    links: [
      { href: '/bios', label: 'BIOS' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/rocm-problems', label: 'ROCm problems' },
    ],
  },
  {
    id: 'can-i-fine-tune',
    group: 'troubleshooting',
    question: 'Can I fine-tune like a 4090 blog post?',
    answer:
      'PyTorch ROCm exists. The cited shopper guide is /fine-tuning — LoRA / QLoRA on consumer Radeon, then export to llama.cpp. ROCm 10.0 has a known issue: training / fine-tune GPU resets on R9700 — try TORCH_BLAS_PREFER_HIPBLASLT=0. That row is cited, not a measured tokens-per-second. Community training writeups often use older ROCm; keep inference on the pin you actually run. Training speed is not yet measured on our R9700s. Q3 stays a labeled estimate.',
    links: [
      { href: '/fine-tuning', label: 'Fine-tuning on Radeon' },
      { href: '/rocm-problems/rocm-10-0-finetune-reset', label: 'Fine-tune reset' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/rocm', label: 'What is ROCm' },
    ],
  },
  {
    id: 'jargon-glossary',
    group: 'troubleshooting',
    question: 'What do ROCm, GGUF, and tok/s mean?',
    answer:
      'Plain-English definitions live in the glossary — A–Z, searchable, same jargon the rest of AMDai uses. ROCm-stack citations stay on the ROCm-guide glossary. This FAQ does not duplicate those entries.',
    links: [
      { href: '/glossary', label: 'Glossary' },
      { href: '/rocm/glossary', label: 'ROCm glossary' },
    ],
  },
  {
    id: 'community-labs',
    group: 'about',
    question: 'Do you cite other people’s home labs?',
    answer:
      'Yes, labeled Cited, not measured by AMDai. Shannon’s How I run my Lab is the first community write-up — Herdr, Coolify, a secure-lab layout, and an amdai-bench idea. We do not invent tok/s from those notes. House cards stay on /results. llama.cpp first. Q3 stays a labeled estimate. Nothing below Q3.',
    links: [
      { href: '/labs/shannon', label: 'Shannon’s lab' },
      { href: '/credits', label: 'Credits' },
      { href: '/results', label: 'Run cards' },
    ],
  },
];

export const FAQ_ITEMS: FaqItem[] = FAQ_ENTRIES;

export const REQUIRED_FAQ_HREFS = [
  '/glossary',
  '/compare',
  '/compare/gpus',
  '/compare/models',
  '/benchmarks',
  '/results',
  '/calculator',
  '/start',
  '/harnesses',
  '/backends',
  '/rocm-problems',
  '/bios',
  '/flash-ram-offload',
  '/stack-lab',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
  '/gpus/r9700',
  '/about',
  '/methodology',
  '/contact',
  '/disclosure',
  '/rss.xml',
  '/budget',
  '/multi-gpu',
  '/amdai-bench',
  '/compare/radeon-vs-nvidia',
  '/troubleshoot',
  '/image-gen',
  '/speech',
  '/long-context',
  '/rag',
  '/vision',
  '/power',
  '/fine-tuning',
  '/tuning',
  '/can-run',
  '/setup/fedora',
  '/setup/arch',
  '/setup/docker',
  '/setup/lm-studio',
  '/setup/coding-assistant',
  '/setup/ollama',
  '/setup/open-webui',
  '/setup/wsl',
  '/setup/comfyui',
  '/setup/multi-gpu',
] as const;

const BANNED_VISIBLE = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function faqPlainAnswer(item: FaqItem): string {
  const see = item.links.map((link) => link.label).join(', ');
  return see ? `${item.answer} See ${see}.` : item.answer;
}

export function faqHaystack(item: FaqItem): string {
  const group = FAQ_GROUPS.find((row) => row.id === item.group);
  return [item.id, item.question, item.answer, group?.label, group?.description, ...item.links.map((link) => `${link.label} ${link.href}`)]
    .join(' ')
    .toLowerCase();
}

export function parseFaqQuery(raw: string | URLSearchParams): string {
  const q = typeof raw === 'string' ? new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw).get('q') : raw.get('q');
  return (q ?? '').trim();
}

export function filterFaq(query: string, items: FaqItem[] = FAQ_ENTRIES): FaqItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => faqHaystack(item).includes(q));
}

export function groupFaq(items: FaqItem[] = FAQ_ENTRIES): { group: (typeof FAQ_GROUPS)[number]; items: FaqItem[] }[] {
  return FAQ_GROUPS.map((group) => ({
    group,
    items: items.filter((item) => item.group === group.id),
  })).filter((row) => row.items.length > 0);
}

export function assertFaqValid(items: FaqItem[] = FAQ_ENTRIES): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const questions = new Set<string>();
  const hrefs = new Set<string>();
  const blob = items.map((item) => `${item.question} ${item.answer} ${item.links.map((link) => link.href).join(' ')}`).join('\n');
  if (items.length < 16) errors.push(`expected at least 16 questions, got ${items.length}`);
  for (const group of FAQ_GROUPS) {
    const count = items.filter((item) => item.group === group.id).length;
    if (count < 2) errors.push(`${group.id} needs at least 2 questions`);
  }
  for (const item of items) {
    if (ids.has(item.id)) errors.push(`duplicate id ${item.id}`);
    ids.add(item.id);
    if (questions.has(item.question)) errors.push(`duplicate question ${item.question}`);
    questions.add(item.question);
    if (item.answer.length < 40) errors.push(`${item.id} answer too short`);
    if (!item.links.length) errors.push(`${item.id} has no links`);
    if (BANNED_VISIBLE.test(`${item.question} ${item.answer}`)) errors.push(`${item.id} banned model`);
    if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
    if (item.id !== 'why-no-q1-q2' && Q1Q2.test(item.answer)) errors.push(`${item.id} lists Q1/Q2`);
    if (item.id === 'when-is-q3-an-estimate') {
      if (!item.answer.includes(COMPARE_Q3)) errors.push('Q3 estimate missing UD-Q3_K_XL');
      if (!/estimate/i.test(item.answer)) errors.push('Q3 must be labeled estimate');
    }
    for (const link of item.links) {
      if (!link.href.startsWith('/') && !link.href.startsWith('http')) errors.push(`${item.id} bad href ${link.href}`);
      hrefs.add(link.href.split('?')[0] ?? link.href);
    }
  }
  for (const required of REQUIRED_FAQ_HREFS) {
    const hit = [...hrefs].some((href) => href === required || href.startsWith(`${required}/`) || href.startsWith(`${required}#`));
    if (!hit) errors.push(`missing required href ${required}`);
  }
  if (BANNED_VISIBLE.test(blob)) errors.push('banned model in FAQ');
  if (/TODO|TBD|FIXME|lorem ipsum/i.test(blob)) errors.push('leftover copy');
  for (const required of [
    'what-is-amdai',
    'measured-vs-estimate',
    'affiliate-links',
    'lab-notes-rss',
    'open-in-stack-lab',
    'llamacpp-vs-strata',
    'min-ram-vs-full-context',
    'when-is-q3-an-estimate',
    'radeon-vs-nvidia',
  ]) {
    if (!items.some((item) => item.id === required)) errors.push(`missing ${required}`);
  }
  const about = items.find((item) => item.id === 'what-is-amdai');
  if (about && !/AMDai/.test(about.answer)) errors.push('what-is-amdai must name AMDai');
  const open = items.find((item) => item.id === 'open-in-stack-lab');
  if (open && !/amdai-stack-lab:/.test(open.answer)) errors.push('Open in Stack Lab must name the documented scheme');
  if (open && !/not published yet/i.test(open.answer)) errors.push('Open in Stack Lab must stay unpublished');
  const ram = items.find((item) => item.id === 'min-ram-vs-full-context');
  if (ram && !ram.answer.includes('Minimum system RAM needed')) errors.push('RAM answer missing min label');
  if (ram && !ram.answer.includes('RAM needed at full context')) errors.push('RAM answer missing full label');
  return [...new Set(errors)];
}
