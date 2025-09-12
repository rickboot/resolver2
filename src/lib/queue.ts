import { JobMessage } from './types';

export interface QueuedMessage<T> {
  message: T;
  receipt: string; // handle used to complete/abandon
  attempts: number;
}

export interface QueueAdapter<T> {
  enqueue(message: T, opts?: { delayMs?: number }): Promise<void>;

  dequeue(options?: {
    visibilityTimeoutMs?: number;
  }): Promise<QueuedMessage<T> | null>;

  complete(receipt: string): Promise<void>;
  abandon(receipt: string): Promise<void>;
}

type Entry<T> = {
  payload: T;
  receipt: string;
  visibleAt: number; // epoch ms when message becomes visible
  attempts: number;
};

class InMemoryQueue<T> implements QueueAdapter<T> {
  private items: Entry<T>[] = [];
  private indexByReceipt = new Map<string, number>();
  private visibilityTimeoutMs: number;

  constructor(defaultVisibilityTimeoutMs: number = 30_000) {
    this.visibilityTimeoutMs = defaultVisibilityTimeoutMs;
  }

  async enqueue(message: T, opts?: { delayMs?: number }): Promise<void> {
    const receipt = crypto.randomUUID();
    const entry: Entry<T> = {
      payload: message,
      receipt,
      visibleAt: Date.now() + (opts?.delayMs ?? 0),
      attempts: 0,
    };
    this.items.push(entry);
    console.log('=== QUEUE ENQUEUE ===');
    console.log('Enqueued message:', message);
    console.log('Queue size after enqueue:', this.items.length);
    console.log('All queue items:', this.items.map(e => ({ receipt: e.receipt, payload: e.payload, visibleAt: e.visibleAt })));
    console.log('=== END ENQUEUE ===');
  }

  async dequeue(options?: {
    visibilityTimeoutMs?: number;
  }): Promise<QueuedMessage<T> | null> {
    const now = Date.now();
    console.log(`Queue dequeue: ${this.items.length} items, checking visibility at ${now}`);
    
    const idx = this.items.findIndex((e) => e.visibleAt <= now);
    if (idx === -1) {
      console.log('No visible items in queue');
      return null;
    }

    const entry = this.items[idx];
    console.log(`Found visible item at index ${idx}:`, entry);
    entry.attempts += 1;

    const vt = options?.visibilityTimeoutMs ?? this.visibilityTimeoutMs;
    entry.visibleAt = now + vt;

    this.indexByReceipt.set(entry.receipt, idx);

    return {
      message: entry.payload,
      receipt: entry.receipt,
      attempts: entry.attempts,
    };
  }

  async complete(receipt: string): Promise<void> {
    const idx = this.indexByReceipt.get(receipt);
    if (idx === undefined) return;
    this.items.splice(idx, 1);
    this.indexByReceipt.delete(receipt);
    this.reindex();
  }

  async abandon(receipt: string): Promise<void> {
    const idx = this.indexByReceipt.get(receipt);
    if (idx === undefined) return;
    this.items[idx].visibleAt = Date.now();
  }

  private reindex() {
    this.indexByReceipt.clear();
    for (let i = 0; i < this.items.length; i++) {
      this.indexByReceipt.set(this.items[i].receipt, i);
    }
  }
}

const queueId = Math.random().toString(36).substring(7);
console.log(`Creating queue instance ${queueId}...`);
export const queue: QueueAdapter<JobMessage> = new InMemoryQueue<JobMessage>();
console.log(`Queue instance ${queueId} created:`, queue);

// Placeholder for Azure Storage Queue adapter interface shape
export class AzureStorageQueueAdapter<T> implements QueueAdapter<T> {
  async enqueue(_message: T, _opts?: { delayMs?: number }): Promise<void> {
    throw new Error('AzureStorageQueueAdapter not implemented');
  }
  async dequeue(_options?: {
    visibilityTimeoutMs?: number;
  }): Promise<QueuedMessage<T> | null> {
    throw new Error('AzureStorageQueueAdapter not implemented');
  }
  async complete(_receipt: string): Promise<void> {
    throw new Error('AzureStorageQueueAdapter not implemented');
  }
  async abandon(_receipt: string): Promise<void> {
    throw new Error('AzureStorageQueueAdapter not implemented');
  }
}
