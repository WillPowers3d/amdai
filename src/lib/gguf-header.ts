/**
 * Read a GGUF header in the browser (or in tests). Never uploads.
 * Only the header is parsed; weight bytes are not decoded.
 */

export type GgufMeta = {
  architecture: string;
  name: string;
  parameterCount: number | null;
  layers: number | null;
  embedHidden: number | null;
  kvHeads: number | null;
  headDim: number | null;
  fileBytes: number;
};

export type GgufParseResult =
  | { ok: true; meta: GgufMeta }
  | { ok: false; error: string };

const MAGIC = 0x46554747; // GGUF little-endian

const GGUF = {
  UINT8: 0,
  INT8: 1,
  UINT16: 2,
  INT16: 3,
  UINT32: 4,
  INT32: 5,
  FLOAT32: 6,
  BOOL: 7,
  STRING: 8,
  ARRAY: 9,
  UINT64: 10,
  INT64: 11,
  FLOAT64: 12,
} as const;

class Reader {
  view: DataView;
  offset = 0;
  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
  }
  remain() {
    return this.view.byteLength - this.offset;
  }
  need(n: number) {
    if (this.remain() < n) throw new Error('GGUF header is truncated');
  }
  u8() {
    this.need(1);
    const v = this.view.getUint8(this.offset);
    this.offset += 1;
    return v;
  }
  u32() {
    this.need(4);
    const v = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return v;
  }
  i32() {
    this.need(4);
    const v = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return v;
  }
  u64() {
    this.need(8);
    const lo = this.view.getUint32(this.offset, true);
    const hi = this.view.getUint32(this.offset + 4, true);
    this.offset += 8;
    return hi * 2 ** 32 + lo;
  }
  f32() {
    this.need(4);
    const v = this.view.getFloat32(this.offset, true);
    this.offset += 4;
    return v;
  }
  f64() {
    this.need(8);
    const v = this.view.getFloat64(this.offset, true);
    this.offset += 8;
    return v;
  }
  str() {
    const len = this.u64();
    if (len > 1_000_000) throw new Error('GGUF string is too long');
    this.need(len);
    const bytes = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, len);
    this.offset += len;
    return new TextDecoder().decode(bytes);
  }
  skipValue(type: number): unknown {
    switch (type) {
      case GGUF.UINT8:
      case GGUF.INT8:
      case GGUF.BOOL:
        return this.u8();
      case GGUF.UINT16:
      case GGUF.INT16:
        this.need(2);
        this.offset += 2;
        return 0;
      case GGUF.UINT32:
        return this.u32();
      case GGUF.INT32:
        return this.i32();
      case GGUF.FLOAT32:
        return this.f32();
      case GGUF.UINT64:
      case GGUF.INT64:
        return this.u64();
      case GGUF.FLOAT64:
        return this.f64();
      case GGUF.STRING:
        return this.str();
      case GGUF.ARRAY: {
        const item = this.u32();
        const n = this.u64();
        if (n > 100_000) throw new Error('GGUF array is too long');
        for (let i = 0; i < n; i++) this.skipValue(item);
        return null;
      }
      default:
        throw new Error(`Unknown GGUF type ${type}`);
    }
  }
  readValue(type: number): unknown {
    if (type === GGUF.ARRAY) return this.skipValue(type);
    return this.skipValue(type);
  }
}

function num(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
}

export function parseGgufHeader(buffer: ArrayBuffer, fileBytes = buffer.byteLength): GgufParseResult {
  try {
    const r = new Reader(buffer);
    if (r.u32() !== MAGIC) return { ok: false, error: 'Not a GGUF file (missing magic).' };
    const version = r.u32();
    if (version < 2 || version > 3) return { ok: false, error: `Unsupported GGUF version ${version}.` };
    r.u64(); // tensor count
    const kvCount = r.u64();
    if (kvCount > 10_000) return { ok: false, error: 'GGUF metadata count looks invalid.' };

    const meta: Record<string, unknown> = {};
    for (let i = 0; i < kvCount; i++) {
      const key = r.str();
      const type = r.u32();
      meta[key] = r.readValue(type);
    }

    const architecture = typeof meta['general.architecture'] === 'string' ? String(meta['general.architecture']) : '';
    const name =
      (typeof meta['general.name'] === 'string' && String(meta['general.name'])) ||
      (typeof meta['general.basename'] === 'string' && String(meta['general.basename'])) ||
      'GGUF file';
    const prefix = architecture || 'unknown';
    const layers = num(meta[`${prefix}.block_count`]);
    const embedHidden = num(meta[`${prefix}.embedding_length`]);
    const kvHeads = num(meta[`${prefix}.attention.head_count_kv`]) ?? num(meta[`${prefix}.attention.head_count`]);
    const keyLen = num(meta[`${prefix}.attention.key_length`]);
    const headCount = num(meta[`${prefix}.attention.head_count`]);
    const headDim = keyLen ?? (embedHidden && headCount ? Math.round(embedHidden / headCount) : null);

    const lower = `${name} ${architecture}`.toLowerCase();
    if (/\bqwen2\.5\b/.test(lower) || /\bqwen3-8b\b/.test(lower) || /\bqwen3 8b\b/.test(lower)) {
      return { ok: false, error: 'This site does not size Qwen2.5 or Qwen3-8B. Pick another file.' };
    }

    return {
      ok: true,
      meta: {
        architecture,
        name,
        parameterCount: num(meta['general.parameter_count']),
        layers,
        embedHidden,
        kvHeads,
        headDim,
        fileBytes,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not read GGUF header.' };
  }
}

export function ggufToBillions(parameterCount: number | null): number | null {
  if (parameterCount == null || !(parameterCount > 0)) return null;
  return parameterCount / 1e9;
}

/** Build a tiny GGUF header for tests. */
export function buildTestGguf(fields: Record<string, string | number>): ArrayBuffer {
  const parts: Uint8Array[] = [];
  const pushU32 = (n: number) => {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, n, true);
    parts.push(b);
  };
  const pushU64 = (n: number) => {
    const b = new Uint8Array(8);
    new DataView(b.buffer).setUint32(0, n >>> 0, true);
    new DataView(b.buffer).setUint32(4, Math.floor(n / 2 ** 32), true);
    parts.push(b);
  };
  const pushStr = (s: string) => {
    const enc = new TextEncoder().encode(s);
    pushU64(enc.length);
    parts.push(enc);
  };
  const entries = Object.entries(fields);
  pushU32(MAGIC);
  pushU32(3);
  pushU64(0);
  pushU64(entries.length);
  for (const [key, value] of entries) {
    pushStr(key);
    if (typeof value === 'string') {
      pushU32(GGUF.STRING);
      pushStr(value);
    } else if (Number.isInteger(value)) {
      pushU32(GGUF.UINT64);
      pushU64(value);
    } else {
      pushU32(GGUF.FLOAT64);
      const b = new Uint8Array(8);
      new DataView(b.buffer).setFloat64(0, value, true);
      parts.push(b);
    }
  }
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out.buffer;
}
