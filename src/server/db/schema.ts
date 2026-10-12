import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  githubId: text('github_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  notifyInstant: integer('notify_instant', { mode: 'boolean' }).notNull().default(false),
  notifyWeekly: integer('notify_weekly', { mode: 'boolean' }).notNull().default(false),
  unsubToken: text('unsub_token').notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const magicLinks = sqliteTable('magic_links', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const oauthStates = sqliteTable('oauth_states', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const rigs = sqliteTable('rigs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  gpu: text('gpu').notNull(),
  gpuCount: integer('gpu_count').notNull(),
  vramGb: integer('vram_gb').notNull(),
  ramGb: integer('ram_gb').notNull(),
  gfx: text('gfx'),
  cpu: text('cpu'),
  os: text('os'),
  distro: text('distro'),
  rocmVersion: text('rocm_version'),
  backend: text('backend').notNull(),
  backendVersion: text('backend_version'),
  modelsJson: text('models_json').notNull(),
  context: integer('context').notNull(),
  priority: text('priority').notNull(),
  usage: text('usage').notNull(),
  style: text('style').notNull(),
  shareQuery: text('share_query'),
  rssToken: text('rss_token').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const notificationLog = sqliteTable('notification_log', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  updateId: text('update_id').notNull(),
  channel: text('channel').notNull(),
  sentAt: integer('sent_at', { mode: 'timestamp' }).notNull(),
});
