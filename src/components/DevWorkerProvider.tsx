'use client';

import { useEffect } from 'react';
import { startDevWorker } from '@/lib/devWorker';

export default function DevWorkerProvider() {
  useEffect(() => {
    // Start the dev worker when component mounts (client-side only)
    startDevWorker();
  }, []);

  return null; // This component doesn't render anything
}
