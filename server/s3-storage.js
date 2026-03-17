import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import env from 'dotenv';
env.config();

// Create an S3 client instance
// The credentials will automatically be picked up from the environment variables:
// AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

/**
 * Uploads a file buffer to S3 and returns the public URL.
 * @param {Buffer} fileBuffer - The file data as a Buffer
 * @param {string} originalFileName - The original name of the file
 * @param {string} mimeType - The MIME type of the file (e.g., 'image/jpeg', 'video/mp4')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export async function uploadFileToS3(fileBuffer, originalFileName, mimeType) {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME environment variable is missing.');
  }

  // Generate a unique filename to prevent collisions
  const fileExtension = originalFileName.includes('.') ? originalFileName.split('.').pop() : mimeType.split('/')[1];
  const uniqueFileName = `${Date.now()}-${uuidv4()}.${fileExtension}`;
  
  // Create the PutObject command
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `uploads/${uniqueFileName}`,
    Body: fileBuffer,
    ContentType: mimeType,
    // Note: To make the object publicly accessible outright, you could use ACL: 'public-read' 
    // IF the bucket allows it. Otherwise, it inherits bucket policies.
    // ACL: 'public-read', 
  });

  try {
    await s3Client.send(command);
    
    // Construct and return the public URL
    // Format: https://[bucket-name].s3.[region].amazonaws.com/[key]
    const region = process.env.AWS_REGION || 'us-east-1';
    const publicUrl = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/uploads/${uniqueFileName}`;
    
    return publicUrl;
  } catch (error) {
    console.error('[S3 Storage] Failed to upload file to S3:', error);
    throw error;
  }
}

/**
 * Deletes a file from S3 given its public URL.
 * @param {string} fileUrl - The public URL of the file to delete
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export async function deleteFileFromS3(fileUrl) {
  if (!BUCKET_NAME) {
    console.warn('[S3 Storage] AWS_S3_BUCKET_NAME missing, cannot delete from S3.');
    return false;
  }
  
  if (!fileUrl) return false;

  try {
    // Extract the object key from the URL
    // Expected URL format: https://[bucket-name].s3.[region].amazonaws.com/uploads/[filename]
    const urlParts = new URL(fileUrl);
    // Remove the leading '/' from the pathname to get the Key
    const key = urlParts.pathname.startsWith('/') ? urlParts.pathname.substring(1) : urlParts.pathname;

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('[S3 Storage] Failed to delete file from S3:', error);
    return false;
  }
}

export default {
  uploadFileToS3,
  deleteFileFromS3,
};
