import { startDevWorker } from './devWorker';

// Initialize dev worker when this module is imported
// This ensures it starts once when the server process starts
console.log('worker-init.ts loaded, NODE_ENV:', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  console.log('Initializing dev worker from worker-init.ts');
  startDevWorker();
} else {
  console.log('Not in development, skipping worker init');
}
