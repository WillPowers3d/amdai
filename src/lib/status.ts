import { parse } from 'yaml';
import whatWorksRaw from '../data/what-works.yaml?raw';
import qwenRaw from '../data/qwen-recommendations.yaml?raw';
import abliteratedRaw from '../data/abliterated.yaml?raw';
import stacksRaw from '../data/stacks.yaml?raw';
import gpusRaw from '../data/gpus.yaml?raw';

export type WhatWorks = {
  as_of: string;
  status: string;
  headline: string;
  summary: string;
  rocm: {
    recommended: string;
    install_prefix: string;
    avoid: string;
    also_current: string;
  };
  inference: {
    least_pain: string;
    serving: string;
    amd_supported_combo: string;
    known_good_this_week: string;
    do_not: string;
  };
  qwen: {
    reliability_first: string;
    build: string;
    quant: string;
    serve: string;
    then_capability: string;
    abliterated: string;
  };
  verify: string[];
  honesty: string[];
};

export type QwenRec = {
  id: string;
  role: string;
  name: string;
  why: string;
  serve: string;
  vram_32gb: string;
  notes: string;
};

export type QwenGuide = {
  as_of: string;
  principle: string;
  house_rules?: string[];
  recommendations: QwenRec[];
  smoke_tests: { name: string; prompt: string; expect: string }[];
};

export type AbliteratedStatus = 'tested' | 'community' | 'untested';

export type AbliteratedQuant = {
  label: string;
  note: string;
};

export type AbliteratedCalculator = {
  starter: string;
  mid: string;
  enthusiast: string;
  pro: string;
} | null;

export type AbliteratedRow = {
  id?: string;
  name: string;
  kind?: 'control' | 'abliterated';
  base_model?: string;
  base_model_url?: string | null;
  uploader?: string;
  uploader_url?: string | null;
  repo: string;
  repo_url?: string | null;
  method: string;
  size: string;
  quant_example: string;
  quants?: AbliteratedQuant[];
  vram_32gb: string;
  backends: string;
  backend?: string;
  status?: AbliteratedStatus;
  status_note?: string;
  reliability: string;
  notes: string;
  calculator?: AbliteratedCalculator;
};

export type AbliteratedGuide = {
  as_of: string;
  tested_pick?: string;
  search_patterns: string[];
  rows: AbliteratedRow[];
  trust: string[];
};

export type StackCard = {
  id: string;
  title: string;
  kicker: string;
  model: string;
  official: string;
  gguf: string;
  quant: string;
  engine: string;
  gpus: string;
  context: string | number;
  kv: string;
  offload: string;
  measured: string[];
  why: string;
  calculator: string;
};

export type StacksGuide = {
  as_of: string;
  test_rig: {
    label: string;
    gpus: string;
    ram: string;
    note: string;
  };
  stacks: StackCard[];
};

export type GpuCard = {
  name: string;
  family: string;
  arch: string;
  gfx: string;
  vram_gb: number | null;
  support: 'official' | 'unofficial';
  rocm_note: string;
  hsa_override: string;
};

export type GpuDirectory = {
  as_of: string;
  matrix: string;
  linux_reqs: string;
  notes: string[];
  cards: GpuCard[];
};

export const whatWorks = parse(whatWorksRaw) as WhatWorks;
export const qwenGuide = parse(qwenRaw) as QwenGuide;
export const abliteratedGuide = parse(abliteratedRaw) as AbliteratedGuide;
export const stacksGuide = parse(stacksRaw) as StacksGuide;
export const gpuDirectory = parse(gpusRaw) as GpuDirectory;
