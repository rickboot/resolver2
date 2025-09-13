-- Migration: Add image generation fields to content_drafts table
-- This adds support for storing AI-generated images with metadata

ALTER TABLE content_drafts 
ADD COLUMN image_url TEXT,
ADD COLUMN image_provider VARCHAR(50),
ADD COLUMN image_cost DECIMAL(10, 6) DEFAULT 0.00;

-- Add index for querying by provider
CREATE INDEX idx_content_drafts_image_provider ON content_drafts(image_provider);

-- Add comment for documentation
COMMENT ON COLUMN content_drafts.image_url IS 'URL or base64 data of generated image';
COMMENT ON COLUMN content_drafts.image_provider IS 'AI provider used for image generation (bedrock, openai, azure)';
COMMENT ON COLUMN content_drafts.image_cost IS 'Cost in USD for generating this image';
