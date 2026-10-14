/**
 * Cited /rocm/upgrade chapter: move between ROCm versions, pin a known-good
 * tree, or cleanly reinstall after a half-upgraded Radeon box.
 * Official AMD install / upgrade / uninstall docs + llama.cpp build.md only
 * for commands and version claims. apt-mark is Ubuntu, labeled unofficial.
 * No invented versions, dates, tok/s, or prices. llama.cpp Vulkan first.
 */

export const ROCM_UPGRADE_PATH = '/rocm/upgrade';
export const ROCM_UPGRADE_PUBLISHED = '2026-10-14';
export const ROCM_UPGRADE_CITED_LABEL = 'Cited AMD + llama.cpp docs · Linux first';

export type RocmUpgradeLink = { href: string; label: string };

export type RocmUpgradeSource = {
  id: string;
  title: string;
  href: string;
  official: boolean;
};

export type RocmUpgradeFaq = {
  id: string;
  question: string;
  answer: string;
  links: RocmUpgradeLink[];
};

export type RocmUpgradeRecovery = {
  id: string;
  title: string;
  body: string;
  href: string;
};

export const ROCM_UPGRADE_TITLE = 'Upgrade, pin, or reinstall ROCm';
export const ROCM_UPGRADE_DESCRIPTION =
  'Upgrade, pin, or cleanly reinstall ROCm on a Radeon GPU (Linux). Ubuntu 24.04 first. Cited AMD install docs only.';

export const ROCM_UPGRADE_LEAD = `
  Shoppers search “how do I upgrade ROCm” and “ROCm broke after an update.”
  This AMDai chapter is the step-by-step for a Radeon box on Linux — Ubuntu 24.04+
  as the main path. It does not replace the first-install walkthrough or the
  versions cadence page. llama.cpp Vulkan (Mesa RADV) is the house default and
  usually survives a ROCm userspace swap. HIP / ROCm is the alternate you rebuild
  after the stack moves. Copy wget, repo, amdgpu-install, and package names from
  the official page for the version you chose — do not invent a .deb filename.
`.replace(/\s+/g, ' ').trim();

export const ROCM_UPGRADE_HEADINGS = [
  { depth: 2, slug: 'check', text: 'Check what you have now' },
  { depth: 2, slug: 'in-place', text: 'In-place upgrade (official method)' },
  { depth: 2, slug: 'pin', text: 'Pin or hold a known-good version' },
  { depth: 2, slug: 'reinstall', text: 'Clean uninstall and reinstall' },
  { depth: 2, slug: 'rebuild', text: 'What to rebuild afterwards' },
  { depth: 2, slug: 'fedora-arch', text: 'Fedora and Arch' },
  { depth: 2, slug: 'smoke', text: 'Post-upgrade smoke test' },
  { depth: 2, slug: 'recovery', text: 'Recovery checklist' },
];

export const LLAMA_BUILD_MD = 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md';
export const MESA_RADV = 'https://docs.mesa3d.org/drivers/radv.html';
export const APT_MARK_MAN = 'https://manpages.ubuntu.com/manpages/noble/man8/apt-mark.8.html';
export const ROCM_101_INSTALL = 'https://rocm.docs.amd.com/en/docs-10.1.0/install/rocm.html';
export const ROCM_101_RUNFILE = 'https://rocm.docs.amd.com/en/docs-10.1.0/install/rocm-runfile-installer.html';
export const ROCM_101_THEROCK = 'https://rocm.docs.amd.com/en/docs-10.1.0/about/transition-guide-TheRock.html';
export const RADEON_INSTALL =
  'https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/install/installrad/native_linux/install-radeon.html';
export const PYTORCH_ROCM =
  'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/frameworks/pytorch/install.html';

export const ROCM_UPGRADE_SOURCES: RocmUpgradeSource[] = [
  {
    id: 'rocm-101-install',
    title: 'AMD — Install ROCm 10.1.0',
    href: ROCM_101_INSTALL,
    official: true,
  },
  {
    id: 'radeon-install',
    title: 'AMD — Install Radeon software for Linux with ROCm',
    href: RADEON_INSTALL,
    official: true,
  },
  {
    id: 'therock-101',
    title: 'AMD — TheRock transition guide (ROCm 10.1.0)',
    href: ROCM_101_THEROCK,
    official: true,
  },
  {
    id: 'rocm-runfile',
    title: 'AMD — ROCm runfile installer (10.1.0)',
    href: ROCM_101_RUNFILE,
    official: true,
  },
  {
    id: 'pytorch-rocm',
    title: 'AMD — Install PyTorch for ROCm',
    href: PYTORCH_ROCM,
    official: true,
  },
  {
    id: 'llama-build',
    title: 'llama.cpp — build.md (GGML_VULKAN / GGML_HIP)',
    href: LLAMA_BUILD_MD,
    official: true,
  },
  {
    id: 'mesa-radv',
    title: 'Mesa — RADV Vulkan driver',
    href: MESA_RADV,
    official: true,
  },
  {
    id: 'apt-mark',
    title: 'Ubuntu man-pages — apt-mark (package hold)',
    href: APT_MARK_MAN,
    official: false,
  },
];

export const ROCM_UPGRADE_CHECK_COMMANDS = `# Kernel, OS, and the card
uname -r
. /etc/os-release && echo "$PRETTY_NAME"
lspci -nn | grep -Ei 'vga|display|3d'
lsmod | grep amdgpu

# One amdgpu source — leftover DKMS + distro module + old runfile is the mix /rocm/stack warns about
dkms status

# Which tree landed: TheRock 10.x uses /opt/rocm/core-10.1; legacy often /opt/rocm-7.2/
ls -ld /opt/rocm /opt/rocm-* /opt/rocm/core-* 2>/dev/null

# Inventory — do not copy a purge list from memory
dpkg -l | grep -Ei 'rocm|amdrocm|hip|hsa-runtime|amdgpu-install'

# Userspace tools. 10.1: amd-smi succeeds rocm-smi.
which rocminfo rocm-smi amd-smi
rocminfo
amd-smi || rocm-smi`;

export const ROCM_UPGRADE_APT_UPDATE = `# Copy the Ubuntu 24.04 (or 26.04 / 22.04) repo snippet from the 10.1 install page,
# then:
sudo apt update
apt-cache search amdrocm-core-sdk
# Install ONE gfx family that matches rocminfo. Example shape only — confirm the suffix:
# sudo apt install amdrocm-core-sdk10.1-gfx1201`;

export const ROCM_UPGRADE_RADEON_UNINSTALL = `sudo amdgpu-uninstall
# Then install from the official Radeon / amdgpu-install page for the version you chose.
# Copy the amdgpu-install .deb URL from that page. 7.2.1 and 31.60 both appear in
# official docs for different products — do not mix filenames from memory.`;

export const ROCM_UPGRADE_RUNFILE_UNINSTALL = `# Copy the current .run name from the 10.1 runfile page — do not invent a filename.
# Shape from the 10.1.0 docs:
bash rocm-installer-10.1.0-5.run uninstall-rocm gfx=all
bash rocm-installer-10.1.0-5.run uninstall-amdgpu`;

export const ROCM_UPGRADE_APT_PURGE_INSTALLER = `sudo apt purge amdgpu-install
sudo apt autoremove
sudo rm -rf /var/cache/apt/*
sudo apt clean
sudo apt update`;

export const ROCM_UPGRADE_PIN_UNOFFICIAL = `# Unofficial for ROCm — Ubuntu apt-mark, not an AMD-published pin.
apt-mark showhold
# Hold the packages you inventoried (amdrocm-* or the amdgpu-install set), not a name from memory:
# sudo apt-mark hold PACKAGE
# sudo apt-mark unhold PACKAGE`;

export const ROCM_UPGRADE_SMOKE = `# House daily-driver shape on one R9700. Measured decode lives on /gpus/r9700
# and /benchmarks — do not copy tok/s from memory.
# Vulkan binary (build-vk) usually survives a ROCm userspace swap.
./build-vk/bin/llama-cli \\
  -m /path/to/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\
  -c 262144 \\
  -ngl 99 \\
  -ctk f16 \\
  -ctv f16`;

export const ROCM_UPGRADE_HIP_REBUILD = `# After rocminfo still lists this gfx. Pin AMDGPU_TARGETS to that id.
# llama.cpp build.md: GGML_HIP=ON
cmake -B build-hip -DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1201
cmake --build build-hip -j`;

export const ROCM_UPGRADE_FAQ: RocmUpgradeFaq[] = [
  {
    id: 'how-upgrade',
    question: 'How do I upgrade ROCm on a Radeon GPU without breaking the box?',
    answer:
      'Inventory first (rocminfo, amd-smi or rocm-smi, dpkg, dkms, /opt/rocm). On the Radeon Software / amdgpu-install path, AMD says there is no in-place upgrade — uninstall, then install. On the ROCm 10.1 apt path, AMD documents install-and-update after you register the repo; if you still have ROCm 7.2.4 or older, uninstall first. Keep one method. llama.cpp Vulkan is the AMDai default and usually survives a userspace swap.',
    links: [
      { href: '/rocm/upgrade', label: 'Upgrade or reinstall ROCm' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
      { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
    ],
  },
  {
    id: 'vulkan-survives',
    question: 'Does llama.cpp Vulkan break when I upgrade ROCm?',
    answer:
      'Usually no. llama.cpp GGML_VULKAN=ON talks to a Vulkan ICD. On Linux that is typically Mesa RADV, packaged by the distro, not /opt/rocm. A ROCm userspace swap does not replace RADV. HIP (GGML_HIP=ON) must be rebuilt. If you also replaced the kernel amdgpu module and the desktop stack broke, Vulkan can break too — that is a mixed driver, not “ROCm userspace.”',
    links: [
      { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'pin-hold',
    question: 'How do I pin a known-good ROCm version?',
    answer:
      'AMD does not publish apt-mark as the ROCm pin. On Ubuntu, apt-mark hold is the distro tool that stops apt from upgrading a package — unofficial for this job, cited from the Ubuntu noble man-page. Inventory first, then hold the packages you actually installed. Fedora versionlock and Arch ignorepkg are not documented here as AMD pins.',
    links: [
      { href: '/rocm/upgrade', label: 'Upgrade or reinstall ROCm' },
      { href: '/rocm/versions', label: 'ROCm versions' },
    ],
  },
];

export const ROCM_UPGRADE_HOWTO_STEPS = [
  {
    name: 'Check what you have now',
    text: 'Record uname, OS, lspci, lsmod amdgpu, dkms status, /opt/rocm trees, dpkg inventory, rocminfo, and amd-smi or rocm-smi. One amdgpu source. One userspace method.',
  },
  {
    name: 'Upgrade with the official method you already use',
    text: 'Radeon Software / amdgpu-install: uninstall, then install — no in-place upgrade. ROCm 10.1 apt: register the repo from the official page, apt update, install one gfx family. ROCm 7.2.4 or older: uninstall first.',
  },
  {
    name: 'Or pin the tree that already works',
    text: 'Ubuntu apt-mark hold is unofficial for ROCm. Hold the packages you inventoried. Do not invent a hold list.',
  },
  {
    name: 'Or uninstall cleanly and reinstall',
    text: 'Use the same method you installed: amdgpu-uninstall, runfile uninstall-rocm gfx=all plus uninstall-amdgpu, or apt purge amdgpu-install. Clear leftover DKMS, mixed repos, and runfile remnants. Then follow the first-install tutorial with one method.',
  },
  {
    name: 'Rebuild HIP and smoke-test Vulkan',
    text: 'Rebuild llama.cpp HIP after rocminfo still lists this gfx. Reinstall PyTorch ROCm wheels from AMD’s page for ComfyUI or fine-tuning. The house Vulkan build usually survives. Smoke-test Qwen3.6-35B-A3B UD-Q5_K_XL, one R9700, 262144 context, f16 KV — link measured numbers, do not restate tok/s.',
  },
];

export const ROCM_UPGRADE_RECOVERY: RocmUpgradeRecovery[] = [
  {
    id: 'ubuntu-rocm-package-shadow',
    title: 'Archive HIP/HSA shadows AMD’s install',
    body: 'Ubuntu archive rocm / libamdhip64-dev / libhsa-runtime* mixed with AMD’s repo. Purge the archive set, then one method.',
    href: '/rocm-problems/ubuntu-rocm-package-shadow',
  },
  {
    id: 'hip-no-binary-for-gpu',
    title: 'HIP no binary for GPU',
    body: 'Userspace or HIP build does not list this gfx. Confirm rocminfo, rebuild HIP with the printed target, or stay on Vulkan.',
    href: '/rocm-problems/hip-no-binary-for-gpu',
  },
  {
    id: 'hsa-override-unofficial',
    title: 'HSA_OVERRIDE is unofficial',
    body: 'Do not spray HSA_OVERRIDE_GFX_VERSION after an upgrade. Unset it on official gfx1201. Vulkan does not need it.',
    href: '/rocm-problems/hsa-override-unofficial',
  },
  {
    id: 'mode1-reset-gfx12',
    title: 'MODE1 reset / MES hang',
    body: 'A hang after a kernel or userspace swap can be MES / MODE1, not a missing package. Capture dmesg. Try Vulkan. Do not add a third driver.',
    href: '/rocm-problems/mode1-reset-gfx12',
  },
];

export const ROCM_UPGRADE_LINKS: RocmUpgradeLink[] = [
  { href: '/rocm/stack', label: 'The ROCm stack' },
  { href: '/rocm/versions', label: 'Versions and support' },
  { href: '/rocm/gfx', label: 'gfx IDs' },
  { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
  { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
  { href: '/tutorials/install-rocm', label: 'Install ROCm' },
  { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
  { href: '/rocm-problems', label: 'ROCm problems' },
  { href: '/setup', label: 'Ubuntu setup' },
  { href: '/setup/fedora', label: 'Fedora setup' },
  { href: '/setup/arch', label: 'Arch setup' },
  { href: '/setup/comfyui', label: 'ComfyUI' },
  { href: '/fine-tuning', label: 'Fine-tuning' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/gpus/r9700', label: 'R9700 measured page' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/troubleshoot', label: 'Troubleshoot' },
];

export function rocmUpgradeBlob(): string {
  return [
    ROCM_UPGRADE_TITLE,
    ROCM_UPGRADE_DESCRIPTION,
    ROCM_UPGRADE_LEAD,
    ROCM_UPGRADE_CITED_LABEL,
    ROCM_UPGRADE_CHECK_COMMANDS,
    ROCM_UPGRADE_APT_UPDATE,
    ROCM_UPGRADE_RADEON_UNINSTALL,
    ROCM_UPGRADE_RUNFILE_UNINSTALL,
    ROCM_UPGRADE_APT_PURGE_INSTALLER,
    ROCM_UPGRADE_PIN_UNOFFICIAL,
    ROCM_UPGRADE_SMOKE,
    ROCM_UPGRADE_HIP_REBUILD,
    ...ROCM_UPGRADE_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...ROCM_UPGRADE_HOWTO_STEPS.map((row) => `${row.name} ${row.text}`),
    ...ROCM_UPGRADE_RECOVERY.map((row) => `${row.title} ${row.body}`),
    ...ROCM_UPGRADE_SOURCES.map((row) => `${row.title} ${row.official ? 'official' : 'unofficial'}`),
  ].join('\n');
}

export function rocmUpgradeHrefs(): string[] {
  const hrefs = [
    ...ROCM_UPGRADE_LINKS.map((link) => link.href),
    ...ROCM_UPGRADE_FAQ.flatMap((row) => row.links.map((link) => link.href)),
    ...ROCM_UPGRADE_RECOVERY.map((row) => row.href),
    ...ROCM_UPGRADE_SOURCES.map((row) => row.href),
  ];
  return [...new Set(hrefs.map((href) => (href.split('?')[0] ?? href).split('#')[0] ?? href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');
const INVENTED_SPEED = /\b\d+(?:\.\d+)?\s*tok\/s\b/i;
const INVENTED_PRICE = /\$\d/;

export function assertRocmUpgradeValid(): string[] {
  const errors: string[] = [];
  const blob = rocmUpgradeBlob();
  if (ROCM_UPGRADE_PATH !== '/rocm/upgrade') errors.push('path');
  if (ROCM_UPGRADE_PUBLISHED !== '2026-10-14') errors.push('published');
  if (ROCM_UPGRADE_TITLE.length < 10) errors.push('title short');
  if (ROCM_UPGRADE_DESCRIPTION.length < 70 || ROCM_UPGRADE_DESCRIPTION.length > 160) {
    errors.push(`description length ${ROCM_UPGRADE_DESCRIPTION.length}`);
  }
  if (!/AMDai/.test(blob)) errors.push('must say AMDai');
  if (!/llama\.cpp/.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/.test(blob)) errors.push('must say Vulkan');
  if (!/Ubuntu 24\.04/.test(blob)) errors.push('must name Ubuntu 24.04');
  if (!/Qwen3\.6-35B-A3B/.test(blob)) errors.push('must name house 35B');
  if (!/UD-Q5_K_XL/.test(blob)) errors.push('must name house quant');
  if (!/262144/.test(blob)) errors.push('must name house context');
  if (!/f16 KV/.test(blob)) errors.push('must name f16 KV');
  if (!/unofficial/.test(blob)) errors.push('must mark unofficial holds');
  if (!/apt-mark/.test(blob)) errors.push('must mention apt-mark');
  if (!/amdgpu-uninstall/.test(blob)) errors.push('must cite amdgpu-uninstall');
  if (!/does not support in-place/.test(blob) && !/no in-place upgrade/.test(blob)) {
    errors.push('must state Radeon path has no in-place upgrade');
  }
  if (!/7\.2\.4 or older/.test(blob)) errors.push('must cite 7.2.4-or-older uninstall-first');
  if (!/Mesa RADV/.test(blob)) errors.push('must cite Mesa RADV');
  if (!/GGML_VULKAN/.test(blob)) errors.push('must cite GGML_VULKAN');
  if (!/GGML_HIP/.test(blob)) errors.push('must cite GGML_HIP');
  if (!/do not invent/.test(blob.toLowerCase()) && !/do not mix filenames/.test(blob)) {
    errors.push('must warn against invented installer names');
  }
  if (BANNED.test(blob)) errors.push('banned model name');
  if (Q1Q2.test(blob)) errors.push('q1/q2 visible');
  if (Q4_FLOOR.test(blob)) errors.push('q4-floor wording');
  if (INVENTED_SPEED.test(blob)) errors.push('must not restate tok/s');
  if (INVENTED_PRICE.test(blob)) errors.push('must not invent prices');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  for (const source of ROCM_UPGRADE_SOURCES) {
    if (!source.href.startsWith('https://')) errors.push(`source ${source.id} url`);
  }
  const unofficial = ROCM_UPGRADE_SOURCES.filter((row) => !row.official);
  if (unofficial.length !== 1 || unofficial[0]?.id !== 'apt-mark') {
    errors.push('apt-mark must be the only unofficial source');
  }
  const hrefs = rocmUpgradeHrefs();
  for (const required of [
    '/rocm/stack',
    '/rocm/versions',
    '/compare/vulkan-vs-rocm',
    '/tutorials/install-rocm',
    '/tutorials/verify-rocm',
    '/rocm-problems',
    '/rocm-problems/ubuntu-rocm-package-shadow',
    '/rocm-problems/hip-no-binary-for-gpu',
    '/rocm-problems/hsa-override-unofficial',
    '/rocm-problems/mode1-reset-gfx12',
    '/setup/fedora',
    '/setup/arch',
    '/gpus/r9700',
    '/backends/llamacpp',
    '/fine-tuning',
    '/setup/comfyui',
  ] as const) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}
