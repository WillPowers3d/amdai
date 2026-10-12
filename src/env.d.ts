/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly AMAZON_ASSOCIATE_TAG?: string;
  readonly RAKUTEN_PUBLISHER_ID?: string;
  readonly RAKUTEN_MID_NEWEGG?: string;
  readonly BHPHOTO_AFFILIATE_ID?: string;
  readonly BHPHOTO_LINK_TEMPLATE?: string;
  readonly BHPHOTO_QUERY_PARAM?: string;
  readonly AFFILIATE_CLICK_BEACON?: string;
  readonly ACCOUNTS_ENABLED?: string;
  readonly FORUM_ENABLED?: string;
  readonly SITE_URL?: string;
  readonly AUTH_SECRET?: string;
  readonly AUTH_URL?: string;
  readonly DATABASE_URL?: string;
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string;
  readonly SMTP_USER?: string;
  readonly SMTP_PASS?: string;
  readonly SMTP_FROM?: string;
  readonly SMTP_SECURE?: string;
  readonly GITHUB_ID?: string;
  readonly GITHUB_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*?raw' {
  const content: string;
  export default content;
}
