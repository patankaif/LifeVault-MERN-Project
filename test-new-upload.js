// Test if we can create a simple test file in the uploads directory
import fs from 'fs';
import path from 'path';

const testFile = () => {
  const uploadsDir = process.env.RENDER ? '/opt/render/project/uploads' : path.join(process.cwd(), 'uploads');
  
  console.log('=== TESTING UPLOAD DIRECTORY ===');
  console.log('Environment:', process.env.RENDER ? 'Render' : 'Local');
  console.log('Uploads directory:', uploadsDir);
  console.log('Directory exists:', fs.existsSync(uploadsDir));
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('Creating directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Create a test file
  const testFilePath = path.join(uploadsDir, 'test.txt');
  fs.writeFileSync(testFilePath, 'This is a test file');
  console.log('Test file created:', testFilePath);
  console.log('Test file exists:', fs.existsSync(testFilePath));
  
  // Read directory contents
  try {
    const files = fs.readdirSync(uploadsDir);
    console.log('Files in directory:', files);
  } catch (error) {
    console.log('Error reading directory:', error.message);
  }
  
  // Clean up
  try {
    fs.unlinkSync(testFilePath);
    console.log('Test file cleaned up');
  } catch (error) {
    console.log('Error cleaning up:', error.message);
  }
};

testFile();
