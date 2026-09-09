/// <reference types="node" />

export class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  dump(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [k, v] of this.store.entries()) {
      result[k] = v;
    }
    return result;
  }
}

export class MockWindow {
  private listeners: Map<string, Set<(e: unknown) => void>> = new Map();

  addEventListener(event: string, cb: (e: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(cb);
  }

  removeEventListener(event: string, cb: (e: unknown) => void): void {
    this.listeners.get(event)?.delete(cb);
  }

  dispatchEvent(event: { type: string; [k: string]: unknown }): boolean {
    const set = this.listeners.get(event.type);
    if (set) {
      set.forEach((cb) => cb(event));
    }
    return true;
  }

  hasListener(event: string): boolean {
    const set = this.listeners.get(event);
    return !!set && set.size > 0;
  }
}

export const mockStorage = new MockLocalStorage();
export const mockWindow = new MockWindow();

// Install on globalThis before any state modules evaluate
const g = globalThis as unknown as { localStorage: unknown; window: unknown };
g.localStorage = mockStorage;
g.window = mockWindow;
