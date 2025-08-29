// Backend health check script
const axios = require('axios');

async function checkBackendHealth() {
  const BASE_URL = 'http://localhost:5000';
  
  try {
    console.log('🔍 Checking backend health...');
    
    // Test basic connectivity
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test orders endpoint
    try {
      const ordersResponse = await axios.get(`${BASE_URL}/api/orders`);
      console.log('✅ Orders endpoint accessible');
      console.log('Orders found:', ordersResponse.data.orders?.length || 0);
    } catch (ordersError) {
      if (ordersError.response?.status === 401) {
        console.log('⚠️  Orders endpoint requires authentication (expected)');
      } else {
        console.log('❌ Orders endpoint error:', ordersError.message);
      }
    }
    
    // Test order creation endpoint
    const testOrder = {
      customerName: "Test Customer",
      email: "test@example.com", 
      phone: "1234567890",
      shippingAddress: "123 Test St",
      city: "Test City",
      zip: "12345",
      orderItems: [
        {
          product: "test",
          title: "Test Product",
          quantity: 1,
          price: 99.99,
          image: "/test.jpg"
        }
      ],
      totalAmount: 99.99
    };
    
    console.log('🧪 Testing order creation...');
    const createResponse = await axios.post(`${BASE_URL}/api/orders`, testOrder);
    console.log('✅ Order creation successful!');
    console.log('Order ID:', createResponse.data.order._id);
    console.log('Tracking Number:', createResponse.data.trackingNumber);
    
  } catch (error) {
    console.error('❌ Backend health check failed:');
    if (error.code === 'ECONNREFUSED') {
      console.error('   - Backend server is not running on port 5000');
      console.error('   - Please start the backend with: npm start');
    } else {
      console.error('   - Error:', error.message);
      if (error.response) {
        console.error('   - Status:', error.response.status);
        console.error('   - Data:', error.response.data);
      }
    }
  }
}

checkBackendHealth();
