#!/bin/sh
# Collect versions for an amdai / ROCm bug report.
# Prints to stdout. Does not upload anything.
# Avoids GPU UUIDs and the hostname. Still read the output before you paste.

set -eu

section() {
  printf '\n======== %s ========\n' "$1"
}

have() {
  command -v "$1" >/dev/null 2>&1
}

echo "amdai ROCm report — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Redact anything you do not want public. Skip this script's output if it looks like serials."

section "OS (no hostname)"
uname -srm
if [ -r /etc/os-release ]; then
  # shellcheck disable=SC1091
  . /etc/os-release
  echo "PRETTY_NAME=${PRETTY_NAME:-unknown}"
  echo "ID=${ID:-unknown} VERSION_ID=${VERSION_ID:-unknown}"
fi

section "Kernel / amdgpu"
if have lsmod; then
  lsmod | grep -E '^amdgpu|^amdkfd' || echo "(amdgpu/amdkfd not in lsmod)"
fi
if [ -r /sys/module/amdgpu/version ]; then
  echo "amdgpu module version: $(cat /sys/module/amdgpu/version)"
fi

section "ROCm / HIP tools"
if have rocminfo; then
  echo "rocminfo: $(command -v rocminfo)"
  rocminfo 2>/dev/null | grep -E 'Agent [0-9]|Device Type:|Name:|Marketing Name:|Vendor Name:|Chip ID:|Feature:' | grep -vi uuid || true
else
  echo "rocminfo: not on PATH"
fi

if have hipconfig; then
  hipconfig --version 2>/dev/null || true
  echo "HIP_PATH=${HIP_PATH:-unset}"
else
  echo "hipconfig: not on PATH"
fi

if have amd-smi; then
  echo "amd-smi: $(command -v amd-smi)"
  amd-smi version 2>/dev/null || true
elif have rocm-smi; then
  echo "rocm-smi: $(command -v rocm-smi) (amd-smi is the successor on current ROCm)"
  rocm-smi --showhw 2>/dev/null | head -n 40 || true
else
  echo "amd-smi / rocm-smi: not on PATH"
fi

section "OpenCL (optional)"
if have clinfo; then
  clinfo -l 2>/dev/null || clinfo 2>/dev/null | grep -E 'Platform|Device Name|Device Version' | head -n 40
else
  echo "clinfo: not on PATH"
fi

section "Inference binaries (if present)"
for bin in llama-cli llama-server ollama; do
  if have "$bin"; then
    echo "$bin: $(command -v "$bin")"
    "$bin" --version 2>/dev/null | head -n 5 || true
  fi
done

section "Relevant env (values you set)"
for key in HSA_OVERRIDE_GFX_VERSION HIP_VISIBLE_DEVICES ROCR_VISIBLE_DEVICES \
  CUDA_VISIBLE_DEVICES GGML_VK_VISIBLE_DEVICES OLLAMA_VULKAN \
  TORCH_BLAS_PREFER_HIPBLASLT AMDGPU_TARGETS; do
  eval "val=\${$key-}"
  if [ -n "${val}" ]; then
    echo "$key=$val"
  else
    echo "$key=unset"
  fi
done

echo
echo "Done. Paste into https://amdai.net/rocm-problems/report or the upstream issue."
echo "Do not +1 an existing issue with this dump unless you add a new repro."
