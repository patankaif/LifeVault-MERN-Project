import { GridFSBucket, ObjectId } from 'mongodb';
import { getDB } from './db-mongo.js';

let gfsBucket;

/**
 * Initializes and returns the GridFSBucket instance.
 */
async function getGridFSBucket() {
  if (gfsBucket) return gfsBucket;
  
  const db = await getDB();
  gfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
  return gfsBucket;
}

/**
 * Uploads a file buffer to MongoDB GridFS.
 * @param {Buffer} fileBuffer - The file data as a Buffer
 * @param {string} filename - The original name of the file
 * @param {string} mimeType - The MIME type of the file
 * @returns {Promise<string>} - A relative URL for accessing the file internally
 */
export async function uploadFileToGridFS(fileBuffer, filename, mimeType) {
  return new Promise(async (resolve, reject) => {
    try {
      const bucket = await getGridFSBucket();
      
      // Open an upload stream for the file
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: mimeType,
      });

      // Handle stream finish
      uploadStream.on('finish', () => {
        // Return the MongoDB ObjectId as part of the internal URL string
        const fileId = uploadStream.id.toString();
        const url = `/api/media/${fileId}`;
        resolve(url);
      });

      // Handle stream error
      uploadStream.on('error', (err) => {
        console.error('[GridFS] Error uploading file:', err);
        reject(err);
      });

      // Write the buffer to the stream and close it
      uploadStream.write(fileBuffer);
      uploadStream.end();
      
    } catch (error) {
      console.error('[GridFS] Failed to initialize upload:', error);
      reject(error);
    }
  });
}

/**
 * Deletes a file from MongoDB GridFS given its internal URL ID.
 * @param {string} fileUrl - The internal URL (e.g., /api/media/5f9b1b2c1234567890abcdef)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export async function deleteFileFromGridFS(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('/api/media/')) {
    return false;
  }

  try {
    const fileIdStr = fileUrl.split('/api/media/')[1];
    const fileId = new ObjectId(fileIdStr);
    const bucket = await getGridFSBucket();

    await bucket.delete(fileId);
    return true;
  } catch (error) {
    if (error.message && error.message.includes('FileNotFound')) {
      console.log(`[GridFS] File not found for deletion: ${fileUrl}`);
      return true; // Consider it deleted if it's already gone
    }
    console.error('[GridFS] Failed to delete file:', error);
    return false;
  }
}

/**
 * Streams a file from MongoDB GridFS to the Express response.
 * @param {string} fileIdStr - The MongoDB ObjectId string of the file
 * @param {import('express').Response} res - The Express response object
 */
export async function streamFileFromGridFS(fileIdStr, res) {
  try {
    const fileId = new ObjectId(fileIdStr);
    const db = await getDB();
    const bucket = await getGridFSBucket();

    // First, check if the file exists and get its metadata (content type)
    const files = await db.collection('uploads.files').find({ _id: fileId }).toArray();
    
    if (files.length === 0) {
      return res.status(404).send('File not found');
    }
    
    const fileContent = files[0];
    res.set('Content-Type', fileContent.contentType);
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Open a download stream and pipe it to the response
    const downloadStream = bucket.openDownloadStream(fileId);
    
    downloadStream.on('error', (err) => {
      console.error('[GridFS] Error streaming file:', err);
      if (!res.headersSent) {
        res.status(500).send('Error streaming file');
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('[GridFS] Error fetching file:', error);
    if (error.name === 'BSONError' || error.message.includes('Invalid format')) {
      return res.status(400).send('Invalid file ID format');
    }
    res.status(500).send('Internal Server Error');
  }
}

export default {
  uploadFileToGridFS,
  deleteFileFromGridFS,
  streamFileFromGridFS
};
