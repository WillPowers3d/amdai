import { parse } from 'yaml';
import whatWorksRaw from '../data/what-works.yaml?raw';
import qwenRaw from '../data/qwen-recommendations.yaml?raw';
import abliteratedRaw from '../data/abliterated.yaml?raw';

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
  recommendations: QwenRec[];
  smoke_tests: { name: string; prompt: string; expect: string }[];
};

export type AbliteratedRow = {
  name: string;
  repo: string;
  method: string;
  size: string;
  quant_example: string;
  vram_32gb: string;
  backends: string;
  reliability: string;
  notes: string;
};

export type AbliteratedGuide = {
  as_of: string;
  search_patterns: string[];
  rows: AbliteratedRow[];
  trust: string[];
};

export const whatWorks = parse(whatWorksRaw) as WhatWorks;
export const qwenGuide = parse(qwenRaw) as QwenGuide;
export const abliteratedGuide = parse(abliteratedRaw) as AbliteratedGuide;
