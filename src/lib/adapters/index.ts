/**
 * Adapter interfaces for extensibility
 * These define contracts for external integrations and services
 */

// Notification Adapter
export interface INotificationAdapter {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendSMS(to: string, message: string): Promise<void>;
  sendPush(userId: string, title: string, body: string): Promise<void>;
}

// Storage Adapter (for exports, backups)
export interface IStorageAdapter {
  upload(key: string, data: Buffer | string): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// AI Provider Adapter
export interface AIGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IAtAdapter {
  generateText(prompt: string, options?: AIGenerationOptions): Promise<string>;
  generateJSON<T = unknown>(prompt: string, options?: AIGenerationOptions): Promise<T>;
}

// Search Adapter (for full-text search)
export interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface ISearchAdapter {
  index(id: string, type: string, content: string, metadata?: Record<string, unknown>): Promise<void>;
  search(query: string, options?: { type?: string; limit?: number }): Promise<SearchResult[]>;
  delete(id: string): Promise<void>;
}

// External Integration Adapter
export interface IntegrationCredentials {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: unknown;
}

export interface ImportResult {
  itemsImported: number;
  itemsFailed: number;
  errors?: string[];
}

export interface IExternalIntegrationAdapter {
  authenticate(credentials: IntegrationCredentials): Promise<boolean>;
  import(userId: string, options?: Record<string, unknown>): Promise<ImportResult>;
  export(userId: string, data: unknown[]): Promise<void>;
}

// Cache Adapter
export interface ICacheAdapter {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Metrics Reporter Adapter
export interface IMetricsReporter {
  reportCounter(name: string, value: number, labels?: Record<string, string>): void;
  reportGauge(name: string, value: number, labels?: Record<string, string>): void;
  reportHistogram(name: string, value: number, labels?: Record<string, string>): void;
}
