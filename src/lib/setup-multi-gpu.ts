/**
 * Cited llama.cpp multi-GPU how-to at /setup/multi-gpu.
 * Flags from llama.cpp docs/multi-gpu.md and AMD mGPU / isolation pages.
 * 35B split and Flash two-card speeds are existing local desktop cards — do not invent tok/s.
 * Do not invent flags, prices, Q2/Q1, or a dual-card PSU SKU.
 */

import { officialLinks } from './site';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const SETUP_MULTI_GPU_PUBLISHED = '2026-10-14';
export const SETUP_MULTI_GPU_CITED_LABEL = 'Cited how-to; 35B split measured on the local desktop';

export const SETUP_MULTI_GPU_PORT_A = '127.0.0.1:8080';
export const SETUP_MULTI_GPU_PORT_B = '127.0.0.1:8081';
export const SETUP_MULTI_GPU_PORT_STRATA = '127.0.0.1:8083';
export const SETUP_MULTI_GPU_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const SETUP_MULTI_GPU_LIST = 'llama-cli --list-devices';
export const SETUP_MULTI_GPU_OVERNIGHT =
  '-dev Vulkan1 -sm layer -ngl 99 -fitt 1024 -fa 1 -ctk f16 -ctv f16';
export const SETUP_MULTI_GPU_SPLIT =
  `llama-server -m /path/to/nvme/${SETUP_MULTI_GPU_HOUSE_FILE} -sm layer -ngl 99 -ctk f16 -ctv f16 --host 127.0.0.1 --port 8080`;
export const SETUP_MULTI_GPU_TS_EXAMPLE = 'llama-cli -m model.gguf -ts 3,1';
export const SETUP_MULTI_GPU_PIN_A =
  `GGML_VK_VISIBLE_DEVICES=0 llama-server -m /path/to/nvme/${SETUP_MULTI_GPU_HOUSE_FILE} --split-mode none --main-gpu 0 -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --host 127.0.0.1 --port 8080`;
export const SETUP_MULTI_GPU_PIN_B =
  'GGML_VK_VISIBLE_DEVICES=1 llama-server -m /path/to/nvme/other.gguf --split-mode none --main-gpu 0 -ngl 99 --host 127.0.0.1 --port 8081';
export const SETUP_MULTI_GPU_HIP_A =
  `HIP_VISIBLE_DEVICES=0 llama-server -m /path/to/nvme/${SETUP_MULTI_GPU_HOUSE_FILE} --split-mode none --main-gpu 0 -ngl 99 --host 127.0.0.1 --port 8080`;
export const SETUP_MULTI_GPU_HIP_B =
  'HIP_VISIBLE_DEVICES=1 llama-server -m /path/to/nvme/other.gguf --split-mode none --main-gpu 0 -ngl 99 --host 127.0.0.1 --port 8081';

export const SETUP_MULTI_GPU_ONE_4K = 102.39;
export const SETUP_MULTI_GPU_SPLIT_4K = 82.78;
export const SETUP_MULTI_GPU_FLASH_8K = 32.8;
export const SETUP_MULTI_GPU_FLASH_32K = 32.8;
export const SETUP_MULTI_GPU_FLASH_100K = 31.8;
export const SETUP_MULTI_GPU_FLASH_LLAMA = [18.5, 18.2, 17.9] as const;
export const SETUP_MULTI_GPU_VRAM_4K = 25.97;
export const SETUP_MULTI_GPU_VRAM_256K = 29.34;
export const SETUP_MULTI_GPU_RAM_4K = 37.32;
export const SETUP_MULTI_GPU_RAM_256K = 42.9;
export const SETUP_MULTI_GPU_Q5_LISTING_GB = 26.6;
export const SETUP_MULTI_GPU_Q3_LISTING_GB = 16.8;
export const SETUP_MULTI_GPU_FLASH_Q6_GB = 169;

export const SETUP_MULTI_GPU_SYSTEMD_SPLIT = `# Example only — not a measured local desktop unit.
# /etc/systemd/system/llama-split.service
[Unit]
Description=llama-server layer split across visible Radeon GPUs
After=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/llama-server -m /path/to/nvme/${SETUP_MULTI_GPU_HOUSE_FILE} -sm layer -ngl 99 -ctk f16 -ctv f16 --host 127.0.0.1 --port 8080
Restart=on-failure

[Install]
WantedBy=multi-user.target`;

export const SETUP_MULTI_GPU_SYSTEMD_COMBO_A = `# Example only — not a measured local desktop unit.
# /etc/systemd/system/llama-35b.service
[Unit]
Description=llama-server 35B pinned to one Radeon
After=network-online.target

[Service]
Type=simple
Environment=GGML_VK_VISIBLE_DEVICES=0
ExecStart=/usr/local/bin/llama-server -m /path/to/nvme/${SETUP_MULTI_GPU_HOUSE_FILE} --split-mode none --main-gpu 0 -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --host 127.0.0.1 --port 8080
Restart=on-failure

[Install]
WantedBy=multi-user.target`;

export const SETUP_MULTI_GPU_SYSTEMD_COMBO_B = `# Example only — not a measured local desktop unit.
# /etc/systemd/system/llama-second.service
[Unit]
Description=llama-server second model pinned to the other Radeon
After=network-online.target

[Service]
Type=simple
Environment=GGML_VK_VISIBLE_DEVICES=1
ExecStart=/usr/local/bin/llama-server -m /path/to/nvme/other.gguf --split-mode none --main-gpu 0 -ngl 99 --host 127.0.0.1 --port 8081
Restart=on-failure

[Install]
WantedBy=multi-user.target`;

export type SetupMultiGpuLink = { href: string; label: string };

export type SetupMultiGpuSource = {
  id: string;
  title: string;
  href: string;
};

export type SetupMultiGpuTrack = {
  id: 'split' | 'combo';
  title: string;
  recommend: boolean;
  body: string;
};

export type SetupMultiGpuStep = {
  id: string;
  title: string;
  body: string;
  links: SetupMultiGpuLink[];
};

export type SetupMultiGpuQuant = {
  quant: string;
  role: string;
  note: string;
  estimate: boolean;
};

export type SetupMultiGpuTrouble = {
  id: string;
  title: string;
  body: string;
};

export const SETUP_MULTI_GPU_SOURCES: SetupMultiGpuSource[] = [
  {
    id: 'llama-multi',
    title: 'llama.cpp — Using multiple GPUs',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/multi-gpu.md',
  },
  {
    id: 'llama-repo',
    title: 'llama.cpp repository',
    href: officialLinks.llamaCpp,
  },
  {
    id: 'amd-mgpu',
    title: 'AMD — mGPU setup and configuration (ROCm on Radeon)',
    href: 'https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/install/installrad/native_linux/mgpu.html',
  },
  {
    id: 'amd-isolation',
    title: 'AMD — GPU isolation environment variables',
    href: 'https://rocm.docs.amd.com/en/latest/conceptual/gpu-isolation.html',
  },
  {
    id: 'amd-am5',
    title: 'AMD Socket AM5 Chipset',
    href: 'https://www.amd.com/en/products/processors/chipsets/am5.html',
  },
  {
    id: 'amd-r9700',
    title: 'AMD Radeon AI PRO R9700 product page',
    href: officialLinks.product,
  },
  {
    id: 'qwen36-gguf',
    title: 'Qwen3.6-35B-A3B GGUF (Unsloth)',
    href: officialLinks.qwen36Gguf,
  },
];

export const SETUP_MULTI_GPU_TRACKS: SetupMultiGpuTrack[] = [
  {
    id: 'split',
    title: 'One model split across both cards',
    recommend: true,
    body: `
      Official llama.cpp default is --split-mode layer (short -sm layer): each
      GPU holds a contiguous slice of layers. The KV cache for layer l lives
      on the GPU that owns layer l. Reach for a split when the file does not
      fit one card. Overnight 35B cards on the local desktop recorded
      ${SETUP_MULTI_GPU_OVERNIGHT} on llama-bench, not llama-server. That
      UD-Q5 split at 4K is ${SETUP_MULTI_GPU_SPLIT_4K} tok/s versus
      ${SETUP_MULTI_GPU_ONE_4K} on one R9700 — a topology tax, not 2× chat.
      --split-mode row is deprecated in the current docs. --split-mode tensor
      is experimental; official docs say it is not implemented for many MoE
      architectures (LLAMA_SPLIT_MODE_TENSOR not implemented). House 35B is
      a MoE file. We have not measured row or tensor tok/s on the local desktop.
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'combo',
    title: 'Two llama-server copies, one card each',
    recommend: false,
    body: `
      House rule: one LLM per GPU unless you deliberately split. the house
      combo preset is Flash on one card and the 35B daily driver on the
      other — two processes, two visible-device pins, two ports. Official
      --split-mode none confines a process to one GPU; pick it with
      --main-gpu / -mg or --device / -dev after ${SETUP_MULTI_GPU_LIST}.
      House ports: llama-server ${SETUP_MULTI_GPU_PORT_A}, a second
      llama-server copy ${SETUP_MULTI_GPU_PORT_B}, Strata Flash
      ${SETUP_MULTI_GPU_PORT_STRATA}. That is concurrency or two models,
      not a faster single chat. Combo llama-server tok/s is not measured
      on the local desktop — point a new card at amdai-bench / Stack Lab.
    `.replace(/\s+/g, ' ').trim(),
  },
];

export const SETUP_MULTI_GPU_QUANTS: SetupMultiGpuQuant[] = [
  {
    quant: 'Q6_K',
    role: '35B measured sibling',
    note: 'Overnight one-vs-split table on /compare/one-vs-two-gpu. This 35B file already fits one 32 GB R9700. A split is not the faster chat.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    role: 'House 35B daily driver on one R9700',
    note: `Hugging Face listing ${SETUP_MULTI_GPU_Q5_LISTING_GB} GB for ${SETUP_MULTI_GPU_HOUSE_FILE}. Measured one-card peak VRAM ${SETUP_MULTI_GPU_VRAM_4K} GB at 4K and ${SETUP_MULTI_GPU_VRAM_256K} GB at 256K; peak system RAM ${SETUP_MULTI_GPU_RAM_4K} GB and ${SETUP_MULTI_GPU_RAM_256K} GB (Linux GiB labeled GB). Split 4K decode ${SETUP_MULTI_GPU_SPLIT_4K} tok/s versus ${SETUP_MULTI_GPU_ONE_4K} on one card.`,
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    role: 'Smaller measured 35B sibling',
    note: 'Same overnight 35B matrix. Still a one-card fit on 32 GB. Do not invent a two-card Q4 tok/s that is not on those cards.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    role: 'Cited Q3 option — labeled estimate',
    note: `${COMPARE_Q3_CITE}. Not a local desktop run. Q3 stays a labeled estimate. Nothing below Q3.`,
    estimate: true,
  },
];

export const SETUP_MULTI_GPU_STEPS: SetupMultiGpuStep[] = [
  {
    id: 'os',
    title: 'Ubuntu 24.04+ first — see every GPU before you split',
    body: `Bare-metal Ubuntu 24.04+ is the AMDai measured ROCm path. Confirm both discrete cards before you invent a pin. Vulkan: ${SETUP_MULTI_GPU_LIST} and pick RADV GFX1201 / the R9700, not the iGPU. HIP: rocminfo first and confirm /dev/kfd and /dev/dri. Windows Vulkan is a cited second path at /setup/windows — we do not have Windows multi-GPU tok/s. AMD’s mGPU page: Microsoft does not currently support mGPU setup in WSL — /setup/wsl stays a single-GPU preview. Fedora and Arch have their own first-run pages; we do not invent a split tok/s on those.`,
    links: [
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/setup/wsl', label: 'WSL2' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'devices-vulkan',
    title: 'Vulkan — list devices, then --device or GGML_VK_VISIBLE_DEVICES',
    body: `Official llama.cpp multi-GPU page: run ${SETUP_MULTI_GPU_LIST} first, then restrict with --device / -dev (comma-separated names, or none). --device works for any backend. CUDA_VISIBLE_DEVICES is the CUDA-only env that page names. This site’s Vulkan pin after that list is GGML_VK_VISIBLE_DEVICES (and VK_ICD_FILENAMES if the ICD is messy) — set it only after the list shows the confusion. Overnight 35B split named Vulkan1. Do not copy Vulkan1 onto a box you have not listed. One process, one index, when you pin a model to a card.`,
    links: [
      { href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/multi-gpu.md', label: 'llama.cpp multi-GPU docs' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU (why)' },
    ],
  },
  {
    id: 'devices-hip',
    title: 'ROCm / HIP — rocminfo, then HIP_VISIBLE_DEVICES / ROCR_VISIBLE_DEVICES',
    body: `Official llama.cpp --device still applies on a HIP build. AMD’s GPU isolation page documents HIP_VISIBLE_DEVICES and ROCR_VISIBLE_DEVICES (and CUDA_VISIBLE_DEVICES, which PyTorch-on-ROCm still also reads). rocminfo first. Same rule as Vulkan: one model process per card unless you split on purpose. AMD’s mGPU page: PCIe slots the GPUs use must have identical width (x16+x16 or x8+x8); mixed x16+x8 is not recommended; keep GPUs on CPU-connected slots. RCCL for the HIP backend is a compile-time -DGGML_HIP_RCCL=ON — official docs say it is disabled by default. We do not invent a house RCCL pin.`,
    links: [
      { href: 'https://rocm.docs.amd.com/en/latest/conceptual/gpu-isolation.html', label: 'AMD GPU isolation' },
      { href: 'https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/install/installrad/native_linux/mgpu.html', label: 'AMD mGPU setup' },
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
      { href: '/rocm/versions', label: 'ROCm versions' },
    ],
  },
  {
    id: 'split-flags',
    title: '--split-mode, --tensor-split, --main-gpu, and KV',
    body: `Official flags (same for llama-cli and llama-server): --split-mode / -sm none | layer (default) | tensor. Current docs mark row deprecated (older tensor-parallel-shaped path; superseded by tensor). --tensor-split / -ts is comma-separated proportions in --device order; official example ${SETUP_MULTI_GPU_TS_EXAMPLE} puts 75 % on GPU 0 and 25 % on GPU 1 (same as 75,25). Omit -ts and layer splits proportional to memory. Do not invent a local desktop ratio — overnight named -sm layer, not a -ts pair. --main-gpu / -mg (default 0) is the single GPU in --split-mode none. Layer mode: KV for layer l lives on the GPU that owns layer l. Tensor mode also splits KV; official docs require non-quantized KV (f16 / bf16 / f32) and flash-attn on. House cards used f16 KV. --n-gpu-layers / -ngl 999 or all to push layers to the GPUs. --fit is on by default except in tensor mode.`,
    links: [
      { href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/multi-gpu.md', label: 'llama.cpp flag table' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
    ],
  },
  {
    id: 'split-run',
    title: 'Pattern A — one llama-server, layer split',
    body: `Cited shape: ${SETUP_MULTI_GPU_SPLIT}. Keep the GGUF on fast NVMe, not /mnt/bulk. Bind 127.0.0.1. Overnight recorded llama-bench with ${SETUP_MULTI_GPU_OVERNIGHT} — those are bench flags, not a llama-server promise. A 35B that already fits one 32 GB card is faster on one card. Split the file that does not fit. systemd-style unit is an example only, not a measured local desktop service.`,
    links: [
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/flash-daily', label: 'Flash daily' },
    ],
  },
  {
    id: 'combo-run',
    title: 'Pattern B — two servers, one card each (combo)',
    body: `Pin each process. Vulkan example: ${SETUP_MULTI_GPU_PIN_A} and ${SETUP_MULTI_GPU_PIN_B}. HIP example: ${SETUP_MULTI_GPU_HIP_A} and ${SETUP_MULTI_GPU_HIP_B}. After an env pin the process only sees one GPU, so --main-gpu 0 is that visible device. Or pass --device names from ${SETUP_MULTI_GPU_LIST} and skip the env. House combo is Flash (often Strata on ${SETUP_MULTI_GPU_PORT_STRATA}) plus 35B llama-server on ${SETUP_MULTI_GPU_PORT_A}. A second llama-server copy uses ${SETUP_MULTI_GPU_PORT_B} — same port /setup/docker already uses for a second container. Two copies of the same 35B are concurrency, measured on /qwen36-dual, not 2× one chat. Combo-preset tok/s is not measured — use amdai-bench / Stack Lab.`,
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU (why)' },
      { href: '/flash-daily', label: 'Flash daily' },
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/setup/docker', label: 'Docker / Podman' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
    ],
  },
  {
    id: 'fit',
    title: 'VRAM fit — existing 35B and Flash numbers only',
    body: `Q6 / Q5 / Q4 first. Q3 stays a labeled estimate. Nothing below Q3. House 35B UD-Q5 already fits one 32 GB R9700 (publisher ${SETUP_MULTI_GPU_Q5_LISTING_GB} GB; measured peak VRAM ${SETUP_MULTI_GPU_VRAM_4K} GB at 4K, ${SETUP_MULTI_GPU_VRAM_256K} GB at 256K). Buy the second card for a file that does not fit, or to run two models. Flash UD-Q6_K_XL is the measured house two-card job — publisher folder ~${SETUP_MULTI_GPU_FLASH_Q6_GB} GB; expect RAM / expert offload even with two 32 GB cards. Flash Q5 / Q4 listings live on /flash-daily. ${COMPARE_Q3} listing is ${SETUP_MULTI_GPU_Q3_LISTING_GB} GB — ${COMPARE_Q3_CITE}. Size both cards on the calculator before you seat the second SKU.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4' },
      { href: '/flash-daily', label: 'Flash daily' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
    ],
  },
  {
    id: 'ram',
    title: 'System RAM — both shopper labels wherever offload appears',
    body: `${RAM_MIN_LABEL} is the load at the context you picked (a kit estimate rounded to a real size unless a card measured the peak). ${RAM_FULL_LABEL} is the 262144 line for the house 35B and Flash. 35B daily driver is 0% system-RAM offload on one 32 GB card — measured peaks ${SETUP_MULTI_GPU_RAM_4K} GB at 4K and ${SETUP_MULTI_GPU_RAM_256K} GB at 256K. Flash Q6 two-card still offloads experts; those RAM lines are calculator estimates unless a card is measured. Desktop 2 is planned as dual R9700 + 192 GB DDR5 — not measured. local desktop kit is 256 GB. GB here is Linux GiB printed as GB.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/long-context', label: 'Long context' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
    ],
  },
  {
    id: 'speed',
    title: 'Speed — only numbers already on this site',
    body: `35B llama.cpp Vulkan UD-Q5_K_XL at 4K: one R9700 ${SETUP_MULTI_GPU_ONE_4K} tok/s, two-card layer split ${SETUP_MULTI_GPU_SPLIT_4K} tok/s. Full matrix: /compare/one-vs-two-gpu and /benchmarks. Flash Q6 two-card Strata: ${SETUP_MULTI_GPU_FLASH_8K} tok/s at 8K and 32K, ${SETUP_MULTI_GPU_FLASH_100K} at 100K. Same Flash file on llama.cpp DDR5-5200: ${SETUP_MULTI_GPU_FLASH_LLAMA[0]} / ${SETUP_MULTI_GPU_FLASH_LLAMA[1]} / ${SETUP_MULTI_GPU_FLASH_LLAMA[2]} tok/s. We do not have a measured combo-preset tok/s, a row-split tok/s, a tensor-split tok/s, or a Desktop 2 number. Do not guess — record a card with amdai-bench or open Stack Lab (packages are not published yet).`,
    links: [
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/flash-daily', label: 'Flash daily' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/wanted', label: 'Wanted' },
    ],
  },
  {
    id: 'hardware',
    title: 'Hardware — PCIe split, PSU, airflow, mixing generations',
    body: `AMD AM5 chipset table: CPU graphics is 1×16 or 2×8 (PCIe 5.0 on X870E and X670E; PCIe 4.0 on B650). AMD’s mGPU page wants identical width on the slots the GPUs use (x16+x16 or x8+x8); mixed x16+x8 is not recommended; use CPU-connected slots, not chipset leftovers. R9700 product page: 300 W TBP and a 750 W minimum PSU recommendation per card. Two 300 W cards plus 750 W minimum per card is not a dual-card PSU SKU we will invent — check the unit you buy; /power and /budget keep the existing /go/ links, no prices here. Double-slot active cooling; leave the adjacent slot empty. Mixing RDNA 2 / 3 / 4 is not measured on the local desktop. Identical PCIe width still applies. HSA_OVERRIDE_GFX_VERSION is unofficial — do not spray it on gfx1201. BIOS notes (Above 4G, ReBAR/SAM, CSM) stay on /bios.`,
    links: [
      { href: '/hardware', label: 'Hardware' },
      { href: '/power', label: 'Power and PSU' },
      { href: '/budget', label: 'Budget' },
      { href: '/bios', label: 'BIOS' },
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
    ],
  },
  {
    id: 'breaks',
    title: 'When the second card never lights up',
    body: `Paste the log in /troubleshoot/errors. Common multi-GPU misses: the process grabbed the iGPU (list devices, then pin); --n-gpu-layers is 0; visible-device env hid every GPU; --split-mode tensor on a MoE file (official: LLAMA_SPLIT_MODE_TENSOR not implemented — use layer); OOM because --fit is off in tensor mode (lower -c first); split slower than one card (measured 35B tax, not a broken install); HIP no binary for the gfx; unofficial HSA override. AMD mGPU: IOMMU hangs, chipset-slot HIP errors, and WSL mGPU unsupported. Start from /troubleshoot.`,
    links: [
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/rocm-problems/hip-no-binary-for-gpu', label: 'HIP no binary' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
];

export const SETUP_MULTI_GPU_TROUBLE: SetupMultiGpuTrouble[] = [
  {
    id: 'igpu',
    title: 'Process attached to the iGPU',
    body: `${SETUP_MULTI_GPU_LIST} and pick the discrete RADV / gfx name. Set GGML_VK_VISIBLE_DEVICES, HIP_VISIBLE_DEVICES, or ROCR_VISIBLE_DEVICES only after that list. Same row as /troubleshoot/errors (iGPU vs dGPU).`,
  },
  {
    id: 'tensor-moe',
    title: 'LLAMA_SPLIT_MODE_TENSOR not implemented',
    body: 'Official llama.cpp docs: tensor mode is experimental and missing for many MoE architectures. House 35B is MoE. Use --split-mode layer. We have not measured tensor on the local desktop.',
  },
  {
    id: 'split-tax',
    title: 'Split is slower than one card',
    body: `Measured 35B UD-Q5 4K: ${SETUP_MULTI_GPU_ONE_4K} tok/s on one R9700 versus ${SETUP_MULTI_GPU_SPLIT_4K} on a layer split. That is the topology tax on /compare/one-vs-two-gpu, not a missing flag.`,
  },
  {
    id: 'oom',
    title: 'OOM at startup or during prefill',
    body: 'Official tensor-mode note: --fit is off, so lower --ctx-size first, then llama-server --parallel, then -ngl. Layer mode still OOMs if the file plus KV does not fit the split. Calculator first.',
  },
];

export const SETUP_MULTI_GPU_HOWTO_STEPS = SETUP_MULTI_GPU_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SETUP_MULTI_GPU_HUB_LINKS: SetupMultiGpuLink[] = [
  { href: '/multi-gpu', label: 'Dual / multi-GPU (why)' },
  { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
  { href: '/qwen36-dual', label: '35B on two cards' },
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/setup/server', label: 'Always-on server' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/flash-daily', label: 'Flash daily' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/out-of-vram', label: 'Out of VRAM' },
  { href: '/amdai-bench', label: 'amdai-bench' },
];

export const REQUIRED_SETUP_MULTI_GPU_HREFS = [
  '/setup',
  '/setup/windows',
  '/setup/wsl',
  '/setup/docker',
  '/multi-gpu',
  '/compare/one-vs-two-gpu',
  '/qwen36-dual',
  '/backends/llamacpp',
  '/gpus/r9700',
  '/gpus/rx-7900-xtx',
  '/flash-daily',
  '/flash-ram-offload',
  '/calculator',
  '/out-of-vram',
  '/benchmarks',
  '/amdai-bench',
  '/stack-lab',
  '/troubleshoot',
  '/troubleshoot/errors',
  '/rocm-problems',
  '/hardware',
  '/power',
  '/budget',
  '/faq',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function setupMultiGpuBlob(): string {
  return [
    SETUP_MULTI_GPU_CITED_LABEL,
    ...SETUP_MULTI_GPU_TRACKS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_MULTI_GPU_STEPS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_MULTI_GPU_QUANTS.map((row) => `${row.quant} ${row.role} ${row.note}`),
    ...SETUP_MULTI_GPU_TROUBLE.map((row) => `${row.title} ${row.body}`),
    SETUP_MULTI_GPU_LIST,
    SETUP_MULTI_GPU_SPLIT,
    SETUP_MULTI_GPU_PIN_A,
    SETUP_MULTI_GPU_PIN_B,
    SETUP_MULTI_GPU_SYSTEMD_SPLIT,
    SETUP_MULTI_GPU_SYSTEMD_COMBO_A,
    SETUP_MULTI_GPU_SYSTEMD_COMBO_B,
  ].join('\n');
}

export function setupMultiGpuHrefs(): string[] {
  const links = [
    ...SETUP_MULTI_GPU_HUB_LINKS,
    ...SETUP_MULTI_GPU_STEPS.flatMap((step) => step.links),
    ...SETUP_MULTI_GPU_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSetupMultiGpuValid(): string[] {
  const errors: string[] = [];
  const blob = setupMultiGpuBlob();
  const hrefs = new Set(setupMultiGpuHrefs());
  if (SETUP_MULTI_GPU_CITED_LABEL !== 'Cited how-to; 35B split measured on the local desktop') {
    errors.push('cited label drifted');
  }
  if (SETUP_MULTI_GPU_TRACKS.length !== 2) errors.push('need split and combo tracks');
  if (!SETUP_MULTI_GPU_TRACKS.find((row) => row.id === 'split')?.recommend) {
    errors.push('split should be the fit try');
  }
  if (SETUP_MULTI_GPU_TRACKS.find((row) => row.id === 'combo')?.recommend) {
    errors.push('combo must not be the default split try');
  }
  if (SETUP_MULTI_GPU_STEPS.length < 9) errors.push('checklist too short');
  if (SETUP_MULTI_GPU_QUANTS.length !== 4) errors.push('need Q6 Q5 Q4 Q3 rows');
  if (!SETUP_MULTI_GPU_QUANTS.some((row) => row.quant === COMPARE_Q3 && row.estimate)) {
    errors.push('Q3 must be a labeled estimate');
  }
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b|\bUSD\b/i.test(blob)) errors.push('invented price');
  if (/\/two-r9700/.test(blob)) errors.push('invented /two-r9700');
  if (!/llama\.cpp/i.test(blob)) errors.push('must name llama.cpp');
  if (!blob.includes('--split-mode') || !blob.includes('--tensor-split') || !blob.includes('--main-gpu')) {
    errors.push('must name official split flags');
  }
  if (!blob.includes('--device') || !blob.includes('--list-devices')) {
    errors.push('must name --device and --list-devices');
  }
  if (!blob.includes('GGML_VK_VISIBLE_DEVICES')) errors.push('missing Vulkan env pin');
  if (!blob.includes('HIP_VISIBLE_DEVICES') || !blob.includes('ROCR_VISIBLE_DEVICES')) {
    errors.push('missing HIP env pins');
  }
  if (!blob.includes('CUDA_VISIBLE_DEVICES')) errors.push('must cite official CUDA env');
  if (!/deprecated/i.test(blob)) errors.push('row must be cited as deprecated');
  if (!/experimental/i.test(blob)) errors.push('tensor must stay experimental');
  if (!blob.includes(String(SETUP_MULTI_GPU_ONE_4K)) || !blob.includes(String(SETUP_MULTI_GPU_SPLIT_4K))) {
    errors.push('must cite measured 35B 4K pair');
  }
  if (!blob.includes(String(SETUP_MULTI_GPU_FLASH_8K)) || !blob.includes(String(SETUP_MULTI_GPU_FLASH_100K))) {
    errors.push('must cite measured Flash two-card Strata');
  }
  if (!blob.includes(String(SETUP_MULTI_GPU_FLASH_LLAMA[0]))) {
    errors.push('must cite measured Flash llama.cpp two-card');
  }
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!blob.includes('300 W') || !blob.includes('750 W')) {
    errors.push('must cite AMD 300 W TBP and 750 W min PSU');
  }
  if (!/1×16 or 2×8/.test(blob)) errors.push('must cite AM5 1×16 or 2×8');
  if (!blob.includes(SETUP_MULTI_GPU_PORT_A) || !blob.includes(SETUP_MULTI_GPU_PORT_B)) {
    errors.push('must cite house ports');
  }
  if (!blob.includes('ExecStart=')) errors.push('must include systemd-style ExecStart');
  if (!/not measured/i.test(blob)) errors.push('unmeasured claims must stay labeled');
  if (!/amdai-bench/.test(blob)) errors.push('must point leftover speeds at amdai-bench');
  if (!/NVMe/.test(blob)) errors.push('must mention NVMe');
  if (!blob.includes('/mnt/bulk')) errors.push('must warn off /mnt/bulk');
  for (const source of SETUP_MULTI_GPU_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_SETUP_MULTI_GPU_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
