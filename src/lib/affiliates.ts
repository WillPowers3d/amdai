import { parse } from 'yaml';
import retailersRaw from '../data/retailers.yaml?raw';
import productsRaw from '../data/products.yaml?raw';

export type RetailerProgram = 'amazon_associates' | 'rakuten' | 'bhphoto' | 'none';

export type Retailer = {
  id: string;
  name: string;
  program: RetailerProgram;
  affiliate: boolean;
  id_env?: string;
  default_id?: string;
  query_param?: string;
  rakuten_mid_env?: string;
  template_env?: string;
  query_param_env?: string;
  default_query_param?: string;
  hosts: string[];
  note: string;
};

export type RetailersFile = {
  as_of: string;
  rakuten: {
    publisher_id_env: string;
    deeplink: string;
  };
  retailers: Retailer[];
};

export type Product = {
  id: string;
  name: string;
  kind: 'gpu' | 'part';
  vram_gb?: number;
  calculator_gpu?: string;
  note?: string;
  urls: Partial<Record<string, string>>;
};

export type ProductsFile = {
  as_of: string;
  products: Product[];
};

export const retailersFile = parse(retailersRaw) as RetailersFile;
export const productsFile = parse(productsRaw) as ProductsFile;
export const retailers = retailersFile.retailers;
export const products = productsFile.products;

const TRACKING_PARAMS = [
  'tag',
  'ascsubtag',
  'ref',
  'ref_',
  'linkCode',
  'camp',
  'creative',
  'creativeASIN',
  'irclickid',
  'irgwc',
  'ranMID',
  'ranEAID',
  'ranSiteID',
  'SiteID',
  'clickid',
  'u1',
  'sid',
  'subid',
  'BI',
  'apid',
  'affiliate',
];

export function readEnv(name: string | undefined): string {
  if (!name) return '';
  const meta = (import.meta.env as Record<string, string | undefined>)[name];
  if (meta && String(meta).trim()) return String(meta).trim();
  if (typeof process !== 'undefined' && process.env[name]) return String(process.env[name]).trim();
  return '';
}

export function retailerById(id: string): Retailer | undefined {
  return retailers.find((row) => row.id === id);
}

export function productById(id: string): Product | undefined {
  return products.find((row) => row.id === id);
}

export function destinationUrl(productId: string, retailerId: string): string | null {
  const product = productById(productId);
  const url = product?.urls[retailerId];
  return url ? url : null;
}

export function stripTracking(raw: string): string {
  const url = new URL(raw);
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.includes(key) || key.toLowerCase().startsWith('utm_')) {
      url.searchParams.delete(key);
    }
  }
  return url.toString();
}

/** Generic Rakuten Advertising deep link. Reuse for any merchant MID. */
export function buildRakutenDeepLink(destination: string, mid: string, publisherId = readEnv(retailersFile.rakuten.publisher_id_env)): string {
  if (!publisherId || !mid) return stripTracking(destination);
  const deeplink = new URL(retailersFile.rakuten.deeplink);
  deeplink.searchParams.set('id', publisherId);
  deeplink.searchParams.set('mid', mid);
  deeplink.searchParams.set('murl', destination);
  return deeplink.toString();
}

export function rakutenMidFor(retailer: Retailer): string {
  return readEnv(retailer.rakuten_mid_env);
}

/** Public default lives in retailers.yaml. AMAZON_ASSOCIATE_TAG overrides it. */
export function amazonTag(): string {
  const amazon = retailerById('amazon');
  return readEnv(amazon?.id_env ?? 'AMAZON_ASSOCIATE_TAG') || amazon?.default_id || '';
}

export const AMAZON_ASSOCIATE_DISCLOSURE = 'As an Amazon Associate I earn from qualifying purchases.';

export function wrapAmazon(destination: string, tag = amazonTag()): string {
  const clean = stripTracking(destination);
  if (!tag) return clean;
  const url = new URL(clean);
  url.searchParams.set('tag', tag);
  return url.toString();
}

export function wrapBhphoto(destination: string): string {
  const id = readEnv('BHPHOTO_AFFILIATE_ID');
  const template = readEnv('BHPHOTO_LINK_TEMPLATE');
  const param = readEnv('BHPHOTO_QUERY_PARAM') || 'BI';
  const clean = stripTracking(destination);
  if (!id) return clean;
  if (template) {
    return template
      .replaceAll('{id}', encodeURIComponent(id))
      .replaceAll('{url}', encodeURIComponent(clean))
      .replaceAll('{murl}', encodeURIComponent(clean));
  }
  const url = new URL(clean);
  url.searchParams.set(param, id);
  return url.toString();
}

export function wrapRetailer(destination: string, retailer: Retailer): { href: string; affiliate: boolean } {
  if (retailer.program === 'amazon_associates') {
    const href = wrapAmazon(destination);
    return { href, affiliate: href !== stripTracking(destination) };
  }
  if (retailer.program === 'rakuten') {
    const mid = rakutenMidFor(retailer);
    const publisher = readEnv(retailersFile.rakuten.publisher_id_env);
    if (publisher && mid) {
      return { href: buildRakutenDeepLink(destination, mid, publisher), affiliate: true };
    }
    return { href: stripTracking(destination), affiliate: false };
  }
  if (retailer.program === 'bhphoto') {
    const href = wrapBhphoto(destination);
    return { href, affiliate: Boolean(readEnv('BHPHOTO_AFFILIATE_ID')) };
  }
  return { href: stripTracking(destination), affiliate: false };
}

export function resolveGo(retailerId: string, productId: string): { href: string; affiliate: boolean; retailer: Retailer; product: Product } | null {
  const retailer = retailerById(retailerId);
  const product = productById(productId);
  const dest = destinationUrl(productId, retailerId);
  if (!retailer || !product || !dest) return null;
  const wrapped = wrapRetailer(dest, retailer);
  return { ...wrapped, retailer, product };
}

export function goPath(retailerId: string, productId: string): string {
  return `/go/${retailerId}/${productId}`;
}

export function productHasRetailer(product: Product, retailerId: string): boolean {
  return Boolean(product.urls[retailerId]);
}

export function affiliateProgramsActive(): { amazon: boolean; rakuten: boolean; bhphoto: boolean } {
  return {
    amazon: Boolean(amazonTag()),
    rakuten: Boolean(readEnv(retailersFile.rakuten.publisher_id_env)),
    bhphoto: Boolean(readEnv('BHPHOTO_AFFILIATE_ID')),
  };
}

export type FitCard = {
  id: string;
  name: string;
  vram_gb: number;
  href: string;
};

export function gpuProducts(): Product[] {
  return products.filter((row) => row.kind === 'gpu' && typeof row.vram_gb === 'number');
}
