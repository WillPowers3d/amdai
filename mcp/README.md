# amdai-fit-mcp

stdio MCP server that answers “will this GGUF fit on my Radeon cards?” for [AMDai](https://amdai.net).

It reads GGUF **headers only** from Hugging Face (HTTP Range — weights are never downloaded), sums real tensor bytes, and estimates VRAM vs DDR5 expert offload (`-ncmoe`) for llama.cpp. A `radeon_measured` tool searches the public AMDai lab-log feed so clients can quote logged R9700 numbers instead of guessing tok/s.

**This server never recommends a quant below Q4.** Q1–Q3 and IQ1–IQ3 are hidden from `list_quants` and refused by `plan_fit` / `best_quant`.

Requires Node 18+. Zero npm dependencies.

## Install

### Claude Code

```bash
claude mcp add --transport stdio amdai-fit -- npx -y amdai-fit-mcp
```

### Cursor / Claude Desktop

```json
{
  "mcpServers": {
    "amdai-fit": {
      "command": "npx",
      "args": ["-y", "amdai-fit-mcp"]
    }
  }
}
```

Local checkout: `npx --prefix . amdai-fit-mcp` from this directory, or `node server.mjs`.

## Tools

| Tool | What it does |
| --- | --- |
| `list_quants` | Lists GGUF files/folders in a Hugging Face repo. Hides anything below Q4, plus mmproj and imatrix files. |
| `plan_fit` | Reads one quant’s headers and returns exact tensor sizes by category, KV at the given context, a VRAM vs DDR5 placement estimate, a verdict, and starter llama.cpp flags. Refuses quants below Q4. |
| `best_quant` | Plans every Q4-or-better quant and returns the highest-precision one that fits fully in VRAM, plus the highest that fits with DDR5 expert offload. Optional `include_full_precision` for BF16/F16. |
| `radeon_measured` | Searches the public AMDai lab log for measured or cited R9700 results. |

Default rig: 2× Radeon AI PRO R9700 (32 GiB each), 128 GiB system RAM, 32K context, f16 KV.

## Limits (estimates)

Tensor byte counts are exact from the file headers. Everything else is an **estimate**:

- Compute reserve 2.5 GiB/card and OS 12 GiB are assumptions (calibrated on one measured 35B config).
- Whole expert layers only. No `--moe-cache-mib`, tensor-split ratios, or desktop VRAM tax.
- Speed is not estimated. `radeon_measured` returns logged results only.
- `ram_gib` defaults to 128. KV for exotic attention is approximated.
- Verify with `llama-server --fit` or a real load before you treat a verdict as a measurement.

## Tests

```bash
npm test
```

Protocol checks (`tools/list`, `plan_fit` refusing a Q3 file, legacy `initialize`) run offline. Hugging Face Range reads and the lab-log feed are skipped when `AMDAI_SKIP_NETWORK=1` (set this in CI so those calls cannot flake).

## Source

Package lives in the `mcp/` directory of [https://github.com/WillPowers3d/amdai](https://github.com/WillPowers3d/amdai). Registry name: `io.github.WillPowers3d/amdai-fit`.
