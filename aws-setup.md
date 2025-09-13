# AWS Environment Setup for resolver2

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# OpenAI API Key (for text generation and fallback images)
OPENAI_API_KEY=sk-your-openai-key-here

# AWS Configuration
AWS_REGION=us-west-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# SQS Queue for job processing
AWS_SQS_QUEUE_URL=https://sqs.us-west-1.amazonaws.com/your-account/resolver2-processing-queue

# RDS PostgreSQL Database
AWS_RDS_HOST=your-rds-endpoint.amazonaws.com
AWS_RDS_PORT=5432
AWS_RDS_DATABASE=resolver2
AWS_RDS_USER=postgres
AWS_RDS_PASSWORD=your-db-password
```

## AWS Resources Needed

## Step-by-Step AWS Console Setup (us-west-1)

### 1. Create SQS Queue
1. Go to **SQS** in AWS Console
2. Click **Create queue**
3. Choose **Standard queue**
4. Name: `resolver2-processing-queue`
5. Keep default settings
6. Click **Create queue**
7. Copy the queue URL for your `.env.local`

### 2. Create RDS PostgreSQL Database
1. Go to **RDS** in AWS Console
2. Click **Create database**
3. Choose **PostgreSQL**
4. Template: **Free tier** (for testing)
5. Settings:
   - DB instance identifier: `resolver2-db`
   - Master username: `postgres`
   - Master password: (create secure password)
6. Instance configuration:
   - DB instance class: `db.t3.micro` (free tier)
7. Storage: 20 GB (default)
8. Connectivity:
   - Public access: **Yes** (for development)
   - VPC security group: Create new
9. **Click "Additional configuration"** to expand
   - Initial database name: `resolver2`
10. Click **Create database**
11. Wait ~10 minutes for creation
12. Copy endpoint URL for your `.env.local`

### 3. Create Secrets Manager Secret
1. Go to **Secrets Manager** in AWS Console
2. Click **Store a new secret**
3. Choose **Other type of secret**
4. Key/value pairs:
   - Key: `openai-api-key`
   - Value: `your-openai-api-key`
5. Secret name: `resolver2/openai-api-key`
6. Click **Store**

### 4. Create Lambda Function
1. Go to **Lambda** in AWS Console
2. Click **Create function**
3. Choose **Author from scratch**
4. Function name: `resolver2-ai-processor`
5. Runtime: **Node.js 20.x**
6. Click **Create function**
7. Upload your code:
   - Zip the `lambda/ai-processor/` folder
   - Upload via console or use AWS CLI
8. **Configure IAM Permissions FIRST**:
   - Go to **IAM Console** → **Policies** (not Roles)
   - Search for `AmazonSQSFullAccess` to verify it exists
   - Then go to **IAM** → **Roles** 
   - Find your Lambda execution role: `resolver2-ai-processor-role-r7ysyoii`
   - Click on the role name to open it
   - Click **Permissions** tab
   - Click **Add permissions** → **Attach policies**
   - Search and select:
     - `AmazonSQSFullAccess`
     - `SecretsManagerReadWrite` 
     - `AmazonBedrockFullAccess`
     - `AmazonRDSDataFullAccess`
   - Click **Add permissions**

9. Set environment variables:
   ```
   AWS_RDS_HOST=your-rds-endpoint
   AWS_RDS_PORT=5432
   AWS_RDS_DATABASE=resolver2
   AWS_RDS_USER=postgres
   AWS_RDS_PASSWORD=your-password
   ```

10. **Fix SQS Queue Visibility Timeout FIRST**:
   - Go to **SQS Console**
   - Click on your `resolver2-processing-queue`
   - Click **Edit**
   - Change **Visibility timeout** from 30 seconds to **5 minutes (300 seconds)**
   - Click **Save**

11. Add SQS trigger:
   - Click **Add trigger**
   - Choose **SQS**
   - Select your `resolver2-processing-queue`
   - Batch size: 1

11. Set Lambda timeout:
   - In your Lambda function, click **Configuration** tab
   - Look for **General configuration** section (may need to scroll down)
   - Click **Edit** button
   - Find **Timeout** field and change from 3 seconds to **5 min 0 sec**
   - Click **Save**
   
   *Alternative locations if not found:*
   - Try **Configuration** → **Function configuration**
   - Or look in the **Basic settings** section

### 6. Run Database Migration
Connect to your RDS instance and run:
```sql
-- From: src/lib/db/migrations/001_add_image_fields.sql
ALTER TABLE content_drafts 
ADD COLUMN image_url TEXT,
ADD COLUMN image_provider VARCHAR(50),
ADD COLUMN image_cost DECIMAL(10,4);

CREATE INDEX idx_content_drafts_image_provider ON content_drafts(image_provider);
```

## Testing the Workflow

1. **Create Brand Profile** → Uses local storage/database
2. **Create Content Request** → Stored in database  
3. **Click Process** → Queues job to SQS
4. **Lambda processes** → Generates text + images
5. **Check results** → View in dashboard with images

## Cost Estimation

- **Text Generation**: ~$0.02 per request (GPT-4 mini)
- **Image Generation**: ~$0.008 per image (AWS Bedrock Titan)
- **Total per content piece**: ~$0.05 (3 variations with images)
