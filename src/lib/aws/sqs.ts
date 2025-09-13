import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const client = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL;

export interface ProcessingJob {
  requestId: string;
  accountId: string;
  priority?: 'high' | 'normal' | 'low';
}

export async function enqueueProcessingJob(job: ProcessingJob): Promise<void> {
  if (!QUEUE_URL) {
    throw new Error('AWS_SQS_QUEUE_URL environment variable is not set');
  }

  const command = new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(job),
    MessageAttributes: {
      priority: {
        DataType: 'String',
        StringValue: job.priority || 'normal',
      },
      requestId: {
        DataType: 'String',
        StringValue: job.requestId,
      },
    },
  });

  try {
    await client.send(command);
    console.log('✅ Job enqueued successfully:', job.requestId);
  } catch (error) {
    console.error('❌ Failed to enqueue job:', error);
    throw error;
  }
}

export async function dequeueProcessingJob(): Promise<{ job: ProcessingJob; receiptHandle: string } | null> {
  if (!QUEUE_URL) {
    throw new Error('AWS_SQS_QUEUE_URL environment variable is not set');
  }

  const command = new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 20, // Long polling
    MessageAttributeNames: ['All'],
  });

  try {
    const response = await client.send(command);
    
    if (!response.Messages || response.Messages.length === 0) {
      return null;
    }

    const message = response.Messages[0];
    const job = JSON.parse(message.Body || '{}') as ProcessingJob;
    
    return {
      job,
      receiptHandle: message.ReceiptHandle!,
    };
  } catch (error) {
    console.error('❌ Failed to dequeue job:', error);
    throw error;
  }
}

export async function deleteProcessingJob(receiptHandle: string): Promise<void> {
  if (!QUEUE_URL) {
    throw new Error('AWS_SQS_QUEUE_URL environment variable is not set');
  }

  const command = new DeleteMessageCommand({
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle,
  });

  try {
    await client.send(command);
    console.log('✅ Job deleted from queue');
  } catch (error) {
    console.error('❌ Failed to delete job from queue:', error);
    throw error;
  }
}
