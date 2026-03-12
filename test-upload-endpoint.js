// Test the upload endpoint directly
const testUpload = async () => {
  try {
    // Simulate a file upload (base64 encoded 1x1 pixel red PNG)
    const testFileBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggP/GOwAAAABJRU5ErkJggg==';
    
    const payload = {
      file: testFileBase64,
      mediaType: 'image'
    };
    
    console.log('Testing upload endpoint...');
    console.log('Payload size:', JSON.stringify(payload).length);
    
    const response = await fetch('http://localhost:3001/api/slots/test-slot-id/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('Test upload failed:', error);
  }
};

testUpload();
