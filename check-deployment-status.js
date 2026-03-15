// Check deployment status by testing API endpoint
const checkDeployment = async () => {
  try {
    console.log('=== CHECKING DEPLOYMENT STATUS ===');
    
    // Test basic API endpoint
    const apiResponse = await fetch('https://lifevault-api-cmmw.onrender.com/api/health');
    console.log('API Health:', apiResponse.status);
    
    // Test uploads directory existence via a simple file request
    const uploadTest = await fetch('https://lifevault-api-cmmw.onrender.com/uploads/test.txt');
    console.log('Uploads test:', uploadTest.status);
    
    // Check if we can get any recent slots
    const slotsResponse = await fetch('https://lifevault-api-cmmw.onrender.com/api/slots', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    console.log('Slots API:', slotsResponse.status);
    
    // Test a specific broken URL
    const imageTest = await fetch('https://lifevault-api-cmmw.onrender.com/uploads/1773422055045-qnldmu4s7.jpg');
    console.log('Image test status:', imageTest.status);
    console.log('Image test content-type:', imageTest.headers.get('content-type'));
    
  } catch (error) {
    console.error('Deployment check failed:', error);
  }
};

checkDeployment();
