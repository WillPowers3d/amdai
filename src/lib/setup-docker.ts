/**
 * Cited Docker / Podman path for llama.cpp on Radeon.
 * Not measured on local-desktop. Official sources only: llama.cpp docker.md,
 * AMD ROCm 10.1 container docs, Docker/Podman device docs.
 * Do not invent image tags, versions, tok/s, prices, or container overhead.
 */

import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';

export const SETUP_DOCKER_PUBLISHED = '2026-10-14';
export const SETUP_DOCKER_CITED_LABEL = 'Cited, not measured on local-desktop';

export const SETUP_DOCKER_VULKAN_IMAGE = 'ghcr.io/ggml-org/llama.cpp:server-vulkan';
export const SETUP_DOCKER_ROCM_IMAGE = 'ghcr.io/ggml-org/llama.cpp:server-rocm';

export type SetupDockerLink = { href: string; label: string };

export type SetupDockerSource = {
  id: string;
  title: string;
  href: string;
};

export type SetupDockerTrack = {
  id: 'vulkan' | 'rocm';
  title: string;
  recommend: boolean;
  body: string;
};

export type SetupDockerStep = {
  id: string;
  title: string;
  body: string;
  links: SetupDockerLink[];
};

export const SETUP_DOCKER_SOURCES: SetupDockerSource[] = [
  {
    id: 'llamacpp-docker',
    title: 'llama.cpp — docker.md (official GHCR images)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/docker.md',
  },
  {
    id: 'llamacpp-server',
    title: 'llama.cpp — llama-server README (OpenAI-shaped /v1)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md',
  },
  {
    id: 'rocm-docker-101',
    title: 'AMD — Run ROCm Docker containers (ROCm 10.1.0)',
    href: 'https://rocm.docs.amd.com/en/docs-10.1.0/install/docker-containers.html',
  },
  {
    id: 'rocm-prereq',
    title: 'AMD — Linux prerequisites (render and video groups)',
    href: 'https://rocm.docs.amd.com/projects/install-on-linux/en/latest/install/prerequisites.html',
  },
  {
    id: 'docker-device',
    title: 'Docker — docker run --device',
    href: 'https://docs.docker.com/reference/cli/docker/container/run/#device',
  },
  {
    id: 'docker-publish',
    title: 'Docker — publish a port on a host IP',
    href: 'https://docs.docker.com/reference/cli/docker/container/run/#publish',
  },
  {
    id: 'docker-security-opt',
    title: 'Docker — --security-opt (seccomp)',
    href: 'https://docs.docker.com/reference/cli/docker/container/run/#security-opt',
  },
  {
    id: 'podman-run',
    title: 'Podman — podman-run --device, keep-groups, SELinux :z / :Z',
    href: 'https://docs.podman.io/en/stable/markdown/podman-run.1.html',
  },
];

export const SETUP_DOCKER_TRACKS: SetupDockerTrack[] = [
  {
    id: 'vulkan',
    title: 'Official llama.cpp server-vulkan — the first container',
    recommend: true,
    body: `
      ggml-org publishes ${SETUP_DOCKER_VULKAN_IMAGE} on GHCR. That is the llama.cpp
      first-token image on AMDai: Mesa RADV through /dev/dri. Use it on RDNA 2, RDNA 3,
      and RDNA 4 the same way the bare-metal path uses Vulkan first — see Vulkan vs HIP.
      docker.md lists server-vulkan / full-vulkan / light-vulkan and says GPU-enabled
      images are not currently tested by CI beyond being built. This container path is
      not measured on local-desktop. We do not invent a speed delta versus bare metal.
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'rocm',
    title: 'Official llama.cpp server-rocm — HIP after Vulkan tokens',
    recommend: false,
    body: `
      ${SETUP_DOCKER_ROCM_IMAGE} is the same GHCR catalog, compiled with ROCm. AMD’s
      ROCm 10.1 container page documents --device /dev/kfd --device /dev/dri and
      optional --security-opt seccomp=unconfined. Confirm rocminfo inside the
      container prints this card’s gfx (gfx1201 on an R9700 / 9070-class card,
      gfx110x on 7900 / 7800, gfx1030 on the official RDNA 2 row). If the image’s
      HIP build omits that gfx, stay on Vulkan or build locally from docker.md —
      do not invent an HSA override on gfx1201. AMD also publishes rocm/llama.cpp
      tags; those validated tags on AMD’s llama.cpp-on-ROCm page were a ROCm 7.0.0
      line as of this cite, not a house 10.1 pin, so we do not paste one. Not
      measured on local-desktop. Strata has no cited container recipe here.
    `.replace(/\s+/g, ' ').trim(),
  },
];

export const SETUP_DOCKER_STEPS: SetupDockerStep[] = [
  {
    id: 'host',
    title: 'Host first — Ubuntu is still the measured path',
    body:
      'A container does not replace a working host GPU stack. Ubuntu 24.04+ on bare metal is the measured AMDai path. The host login still needs render and video so /dev/kfd and /dev/dri exist. Fedora and Arch have their own cited guides; they are not on the ROCm 10.1 OSID row. Windows is not this page. Not measured on local-desktop.',
    links: [
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/setup/fedora', label: 'Fedora setup' },
      { href: '/setup/arch', label: 'Arch setup' },
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
    ],
  },
  {
    id: 'images',
    title: 'Pick the official llama.cpp image',
    body: `First token: docker pull ${SETUP_DOCKER_VULKAN_IMAGE}. HIP second: docker pull ${SETUP_DOCKER_ROCM_IMAGE}. Those tag names are from llama.cpp docker.md — we do not invent a digest or a dated pin. full-* and light-* siblings exist on the same page if you want llama-cli. CUDA tags are the wrong family on a Radeon. Not measured on local-desktop.`,
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/backends', label: 'Backends' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
    ],
  },
  {
    id: 'devices',
    title: 'Pass /dev/dri — and /dev/kfd for ROCm',
    body:
      'Vulkan: docker run --device /dev/dri --group-add video --group-add render. ROCm / HIP: add --device /dev/kfd. AMD’s ROCm 10.1 container page documents both nodes and optional --security-opt seccomp=unconfined (memory mapping; they mark it optional). Our error matcher already cites --device /dev/kfd --device /dev/dri --group-add video. Passing all of /dev/dri exposes every GPU; AMD shows renderD128 / renderD129 when you want to restrict. Not measured on local-desktop.',
    links: [
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
      { href: '/rocm', label: 'What is ROCm' },
    ],
  },
  {
    id: 'podman',
    title: 'Podman rootless, groups, and Fedora SELinux',
    body:
      'podman run accepts the same --device paths. Official podman-run notes: in rootless mode a device is bind-mounted, and if access is only via a group you need --group-add keep-groups. On SELinux (Fedora), device bind-mounts can get permission denied until sudo setsebool -P container_use_devices=true. Volume labels :z (shared) and :Z (private) are for the model mount, not for /dev. Link the Fedora guide for distro packages; this page is the container layer. Not measured on local-desktop.',
    links: [
      { href: '/setup/fedora', label: 'Fedora setup' },
      { href: '/setup/arch', label: 'Arch setup' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
    ],
  },
  {
    id: 'gfx1031',
    title: 'RDNA 2 gfx1031 — HSA_OVERRIDE stays unofficial',
    body:
      'RX 6700 XT is gfx1031. That is not the official gfx1030 W6800 row. Inside a ROCm container the same unofficial HSA_OVERRIDE_GFX_VERSION=10.3.0 community note applies — it is not a recommendation. Prefer server-vulkan. Do not set an override on gfx1201. Not measured on local-desktop.',
    links: [
      { href: '/rocm-problems/gfx1031-hsa-override', label: 'gfx1031 HSA_OVERRIDE' },
      { href: '/gpus/rx-6700-xt', label: 'RX 6700 XT sheet' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
    ],
  },
  {
    id: 'nvme',
    title: 'Mount the GGUF from NVMe, not a spinning disk',
    body:
      'docker.md uses -v /path/to/models:/models. Point that host path at the fast NVMe the house rule already names — not a bulk HDD. The file inside the container is /models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf for the daily-driver shape. On Fedora/Podman add :Z (this container) or :z (shared) on that volume. Staging is not RAM offload. Not measured on local-desktop.',
    links: [
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/glossary', label: 'Glossary' },
    ],
  },
  {
    id: 'quant',
    title: 'Pick Q6, Q5, or Q4 — Q3 is a labeled estimate',
    body:
      'Serve the same official-instruct GGUF the Ubuntu recipes name. Start at Q6, Q5, or Q4 and check VRAM + KV on the calculator. A cited Q3 file is a labeled estimate unless a container run card exists — none does in this repo. Q1/Q2 stay off. Tok/s on /benchmarks and /results are Ubuntu llama-bench on local-desktop, not a Docker or Podman promise.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/quants', label: 'Quants' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
    ],
  },
  {
    id: 'fit',
    title: 'Fit VRAM and the two RAM lines',
    body: `The calculator prints ${RAM_MIN_LABEL} (the load at the context you picked) and ${RAM_FULL_LABEL} (262144 for the house 35B). Overnight UD-Q5 one-GPU Ubuntu peaks are 37.32 GB at 4K and 42.9 GB at 256K — measured on local-desktop, not inside a container. When a file spills to system RAM, round ${RAM_MIN_LABEL} to a real kit (192 or 256 GB) with a breakdown and keep it a labeled estimate until measured. Flash offload notes live on Flash RAM offload. Not measured on local-desktop.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
  {
    id: 'first-token',
    title: 'First-run command (Ubuntu-measured flags, container not measured)',
    body: `House daily-driver flags from the 35B recipe / tuning guide, wrapped in the official server-vulkan image: docker run --rm --device /dev/dri --group-add video --group-add render -v /path/to/nvme/models:/models:ro -p 127.0.0.1:8080:8080 ${SETUP_DOCKER_VULKAN_IMAGE} -m /models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --host 0.0.0.0 --port 8080. docker.md publishes --host 0.0.0.0 inside the container; the host publish is 127.0.0.1:8080 so the OpenAI-shaped /v1 stays on loopback. HIP swap: add --device /dev/kfd --security-opt seccomp=unconfined and ${SETUP_DOCKER_ROCM_IMAGE}. Confirm tokens, then curl -s http://127.0.0.1:8080/v1/models. That curl shape is already on this site. Do not copy Ubuntu tok/s onto the container. Not measured on local-desktop.`,
    links: [
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/results/local-desktop-20261012-2311-35b-udq5kxl-1gpu-4k-llamacpp-f16', label: '4K run card' },
      { href: '/tuning', label: 'Tuning flags' },
      { href: '/harnesses', label: 'Harnesses' },
    ],
  },
  {
    id: 'compose',
    title: 'Compose, two cards, and a loopback check',
    body:
      'AMD’s ROCm 10.1 container page shows a Compose devices list of /dev/kfd and /dev/dri. The Vulkan first file on this page uses /dev/dri only. Publish 127.0.0.1:8080:8080. Two cards: AMD documents passing renderD128 and renderD129 to restrict GPUs. House preference is two copies, not an automatic split — see Dual / multi-GPU. Two containers, one render node each, different host ports, is the two-copy shape; we do not invent --tensor-split values or a container tok/s. Check readiness with curl -s http://127.0.0.1:8080/v1/models. A Compose healthcheck that hits that URL is the same check, not a measured SLA. Not measured on local-desktop.',
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
    ],
  },
  {
    id: 'bind',
    title: 'Keep /v1 on localhost, then pick a harness',
    body:
      'Bind the published port to 127.0.0.1. Do not publish 0.0.0.0:8080 unless you mean to share the LAN. Harnesses that run in a second container need host.docker.internal, not 127.0.0.1 — that note is already on the harness pages. llama.cpp stays first. Not measured on local-desktop.',
    links: [
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
      { href: '/backends', label: 'Backends' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'breaks',
    title: 'When it breaks',
    body:
      'Permission denied on /dev/kfd: host groups, missing --device, or rootless Podman without keep-groups / container_use_devices. No Vulkan device: host mesa-vulkan-drivers / vulkaninfo first, then pass /dev/dri. Wrong gfx: rocminfo inside the ROCm image; do not invent an override on gfx1201. Start from /troubleshoot and paste a log in the error matcher. Cited rows live on /rocm-problems. Stack Lab remains the Ubuntu companion — packages are not published yet and there is no container package. Not measured on local-desktop.',
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/faq', label: 'FAQ' },
      { href: '/glossary', label: 'Glossary' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
  },
];

export const SETUP_DOCKER_HOWTO_STEPS = SETUP_DOCKER_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SETUP_DOCKER_HUB_LINKS: SetupDockerLink[] = [
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/setup/fedora', label: 'Fedora setup' },
  { href: '/setup/arch', label: 'Arch setup' },
  { href: '/setup/windows', label: 'Windows setup' },
  { href: '/setup/lm-studio', label: 'LM Studio' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/start', label: 'Getting started' },
];

export const SETUP_DOCKER_COMPOSE = `# Cited shape — not measured on local-desktop.
# Replace /path/to/nvme/models with the NVMe directory that holds the GGUF.
# Image tag from llama.cpp docker.md. Host publish stays on 127.0.0.1.
services:
  llama:
    image: ${SETUP_DOCKER_VULKAN_IMAGE}
    devices:
      - /dev/dri
    group_add:
      - video
      - render
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - /path/to/nvme/models:/models:ro
    command:
      - -m
      - /models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf
      - -ngl
      - "99"
      - -c
      - "262144"
      - --cache-type-k
      - f16
      - --cache-type-v
      - f16
      - --host
      - 0.0.0.0
      - --port
      - "8080"
`;

export const SETUP_DOCKER_COMPOSE_DUAL = `# Two copies — one render node per container. Not measured on local-desktop.
# Confirm ls -l /dev/dri on the host. AMD documents renderD128 / renderD129.
# Do not invent --tensor-split or a 2× tok/s. See /multi-gpu.
services:
  llama-a:
    image: ${SETUP_DOCKER_VULKAN_IMAGE}
    devices:
      - /dev/dri/renderD128
    group_add:
      - video
      - render
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - /path/to/nvme/models:/models:ro
    command: ["-m", "/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf", "-ngl", "99", "-c", "262144", "--cache-type-k", "f16", "--cache-type-v", "f16", "--host", "0.0.0.0", "--port", "8080"]
  llama-b:
    image: ${SETUP_DOCKER_VULKAN_IMAGE}
    devices:
      - /dev/dri/renderD129
    group_add:
      - video
      - render
    ports:
      - "127.0.0.1:8081:8080"
    volumes:
      - /path/to/nvme/models:/models:ro
    command: ["-m", "/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf", "-ngl", "99", "-c", "262144", "--cache-type-k", "f16", "--cache-type-v", "f16", "--host", "0.0.0.0", "--port", "8080"]
`;

export const REQUIRED_SETUP_DOCKER_HREFS = [
  '/setup',
  '/setup/fedora',
  '/setup/arch',
  '/setup/windows',
  '/gpus/r9700',
  '/benchmarks',
  '/calculator',
  '/backends/llamacpp',
  '/backends',
  '/harnesses',
  '/rocm/vulkan-hip',
  '/rocm-problems/gfx1031-hsa-override',
  '/stack-lab',
  '/troubleshoot',
  '/troubleshoot/errors',
  '/faq',
  '/glossary',
  '/multi-gpu',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function setupDockerBlob(): string {
  return [
    SETUP_DOCKER_CITED_LABEL,
    ...SETUP_DOCKER_TRACKS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_DOCKER_STEPS.map((row) => `${row.title} ${row.body}`),
    SETUP_DOCKER_COMPOSE,
    SETUP_DOCKER_COMPOSE_DUAL,
  ].join('\n');
}

export function setupDockerHrefs(): string[] {
  const links = [
    ...SETUP_DOCKER_HUB_LINKS,
    ...SETUP_DOCKER_STEPS.flatMap((step) => step.links),
    ...SETUP_DOCKER_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSetupDockerValid(): string[] {
  const errors: string[] = [];
  const blob = setupDockerBlob();
  const hrefs = new Set(setupDockerHrefs());
  if (SETUP_DOCKER_CITED_LABEL !== 'Cited, not measured on local-desktop') errors.push('cited label drifted');
  if (SETUP_DOCKER_TRACKS.length !== 2) errors.push('need vulkan and rocm tracks');
  if (!SETUP_DOCKER_TRACKS.find((row) => row.id === 'vulkan')?.recommend) {
    errors.push('Vulkan image should be the try');
  }
  if (SETUP_DOCKER_TRACKS.find((row) => row.id === 'rocm')?.recommend) {
    errors.push('ROCm image must not be the first-run try');
  }
  if (SETUP_DOCKER_STEPS.length < 10) errors.push('checklist too short');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (!/llama\.cpp/i.test(blob)) errors.push('must say llama.cpp');
  if (!blob.includes(SETUP_DOCKER_VULKAN_IMAGE)) errors.push('must cite server-vulkan');
  if (!blob.includes(SETUP_DOCKER_ROCM_IMAGE)) errors.push('must cite server-rocm');
  if (!/not measured on local-desktop/i.test(blob)) errors.push('must say not measured on local-desktop');
  if (!/Q3 is a labeled estimate/i.test(blob) && !/Q3 file is a labeled estimate/i.test(blob)) {
    errors.push('Q3 must stay a labeled estimate');
  }
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!/\/dev\/kfd/.test(blob) || !/\/dev\/dri/.test(blob)) errors.push('must cite device nodes');
  if (!/seccomp/.test(blob)) errors.push('must cite seccomp');
  if (!/keep-groups/.test(blob)) errors.push('must cite podman keep-groups');
  if (!/container_use_devices/.test(blob)) errors.push('must cite Fedora SELinux boolean');
  if (!/127\.0\.0\.1:8080/.test(blob)) errors.push('must bind localhost');
  if (!/HSA_OVERRIDE/.test(blob)) errors.push('must mention gfx1031 override');
  if (!/not currently tested by CI/.test(blob)) errors.push('must cite docker.md CI note');
  if (!/do not invent a speed delta/i.test(blob) && !/not a Docker or Podman promise/.test(blob)) {
    errors.push('must refuse invented container speed');
  }
  if (/no meaningful speed change|no overhead|same tok\/s as bare metal/i.test(blob)) {
    errors.push('do not invent container overhead claims');
  }
  if (!SETUP_DOCKER_COMPOSE.includes('127.0.0.1:8080:8080')) errors.push('compose must bind localhost');
  if (!SETUP_DOCKER_COMPOSE_DUAL.includes('renderD128')) errors.push('dual compose must cite render nodes');
  for (const source of SETUP_DOCKER_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_SETUP_DOCKER_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
