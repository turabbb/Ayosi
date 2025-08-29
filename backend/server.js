const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load environment variables
//other than that uu might hv seen that there is a order tracking portion. what i want to do here is when someone places an order, right after they click place order, they should see a tracking number which you should know an approach to generate. then the admin can see the placed orders in the dashboard and should be able to see all the order and update their tracking as well from like recieved, processing, shipping and delivered. this way when a user enters their tracking number, they can see the update on their order. make it according to the vibe of the overall store and also add a small desription section to it so that user can see the description or details of any company or courier company that is handling the shipment. this description section will also be updated by the admin when he is updating the tracking of the order. the user must also see their order details when checking their order tracking. also, when i add any product from admin dashboard, it should be displayed on my store frontend right away. also add a slider to the images of every product so that when i click on a product to see it, it should be able to slide among the images of it or click on it too zoom it smoothly and close it if it wants to. also, when in the collections page, i click on the layout to be list, the products appear as rectangles but in those rectangles the product details are not very cleanly displayed like they are just magnetted to the left side with the picture. the rest of the rectangle is empty as hell. make a fix so that the details etc is smoothly spreaded out through the whole rectangle evenly coverin the whole area. we will work on the order placement and validations etc integration of stripe after you mke these changes
dotenv.config();
//okay so its good now. few more things you have to do. as you can see on my home page that there are featured products. make this something like this for every product that on my admin dashboard, i am able to edit everything about a product that is saved in database and all the products have like an option of isFeatured which if true, will show the product on homepage and if false then it wont be displayed in the homepage featured section. instead of just allowing the admin to delete a product, make it so that the admin can edit everything about a product as well. 

// Connect to database
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoute');
const orderRoutes = require('./routes/orderRoute');

// Use routes
app.use('/api/users', userRoutes);  
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected',
    cors: 'Enabled'
  });
});

// A simple test route
app.get('/', (req, res) => {
  res.send('The Express server is running and the database is connected!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`🚀 Server is listening on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔗 API base: http://localhost:${port}/api`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin.join(', ')}`);
});