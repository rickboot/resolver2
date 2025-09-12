import fs from 'fs';
import path from 'path';
import { JobMessage } from './types';

// File-based queue for cross-process communication in development
const QUEUE_FILE = path.join(process.cwd(), '.queue.json');

interface QueueData {
  items: Array<{
    id: string;
    message: JobMessage;
    timestamp: number;
  }>;
}

function readQueue(): QueueData {
  try {
    if (fs.existsSync(QUEUE_FILE)) {
      const data = fs.readFileSync(QUEUE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading queue file:', error);
  }
  return { items: [] };
}

function writeQueue(data: QueueData): void {
  try {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing queue file:', error);
  }
}

export function enqueueMessage(message: JobMessage): void {
  console.log('=== FILE QUEUE ENQUEUE ===');
  console.log('Enqueuing message:', message);
  
  const queue = readQueue();
  const item = {
    id: crypto.randomUUID(),
    message,
    timestamp: Date.now()
  };
  
  queue.items.push(item);
  writeQueue(queue);
  
  console.log('Queue size after enqueue:', queue.items.length);
  console.log('=== END FILE QUEUE ENQUEUE ===');
}

export function dequeueMessage(): JobMessage | null {
  const queue = readQueue();
  
  if (queue.items.length === 0) {
    return null;
  }
  
  const item = queue.items.shift()!;
  writeQueue(queue);
  
  console.log('Dequeued message:', item.message);
  console.log('Queue size after dequeue:', queue.items.length);
  
  return item.message;
}

export function getQueueSize(): number {
  const queue = readQueue();
  return queue.items.length;
}
