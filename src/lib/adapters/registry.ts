/**
 * Adapter Registry
 * Central registry for all adapter implementations
 */

import type {
  INotificationAdapter,
  IStorageAdapter,
  IAIAdapter,
  ISearchAdapter,
  ICacheAdapter,
  IMetricsReporter,
} from './index';

import { InMemoryCacheAdapter } from './implementations/in-memory-cache';
import { ConsoleNotificationAdapter } from './implementations/console-logger-notification';

class AdapterRegistry {
  private adapters: Map<string, unknown> = new Map();

  register<T>(name: string, adapter: T): void {
    this.adapters.set(name, adapter);
  }

  get<T>(name: string): T | null {
    return (this.adapters.get(name) as T) || null;
  }

  has(name: string): boolean {
    return this.adapters.has(name);
  }
}

export const registry = new AdapterRegistry();

// Register default implementations
registry.register<ICacheAdapter>('cache', new InMemoryCacheAdapter());
registry.register<INotificationAdapter>('notification', new ConsoleNotificationAdapter());

// Helper functions for easy access
export function getCacheAdapter(): ICacheAdapter {
  return registry.get<ICacheAdapter>('cache')!;
}

export function getNotificationAdapter(): INotificationAdapter {
  return registry.get<INotificationAdapter>('notification')!;
}
