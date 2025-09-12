// Simple standalone worker process for development
const fs = require('fs');
const path = require('path');

const QUEUE_FILE = path.join(__dirname, '.queue.json');

function readQueue() {
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

function writeQueue(data) {
  try {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing queue file:', error);
  }
}

function dequeueMessage() {
  const queue = readQueue();
  
  if (queue.items.length === 0) {
    return null;
  }
  
  const item = queue.items.shift();
  writeQueue(queue);
  
  console.log('Dequeued message:', item.message);
  console.log('Queue size after dequeue:', queue.items.length);
  
  return item.message;
}

async function processMessage(message) {
  console.log('Processing message:', message);
  
  try {
    // Extract requestId and accountId from the message
    const { requestId, accountId } = message;
    
    // Make API call to process the request
    const response = await fetch(`http://localhost:3000/api/process-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, accountId })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Message processed successfully:', result);
    } else {
      const error = await response.text();
      console.error('Failed to process message:', response.status, error);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
}

async function workerLoop() {
  console.log('Worker started, polling for messages...');
  
  while (true) {
    try {
      const message = dequeueMessage();
      if (message) {
        await processMessage(message);
      }
      
      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error in worker loop:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Start the worker
workerLoop();
