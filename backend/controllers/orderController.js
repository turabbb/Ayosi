const Order = require('../model/Order');
const Product = require('../model/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const {
      customerName,
      email,
      phone,
      shippingAddress,
      city,
      province,
      country,
      subtotal,
      shippingCost,
      orderItems,
      totalAmount,
      paymentMethod,
      selectedAccount,
      paymentDetails
    } = req.body;

    // Parse JSON strings sent via FormData
    let parsedOrderItems = orderItems;
    let parsedPaymentDetails = paymentDetails;

    try {
      if (typeof orderItems === 'string') {
        parsedOrderItems = JSON.parse(orderItems);
      }
      if (typeof paymentDetails === 'string') {
        parsedPaymentDetails = JSON.parse(paymentDetails);
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return res.status(400).json({
        message: 'Invalid JSON data in request'
      });
    }

    // Validate required fields
    if (!customerName || !email || !phone || !shippingAddress || !city || !province || !country || !parsedOrderItems || !subtotal || !totalAmount || !paymentMethod) {
      console.log('Missing fields:', {
        customerName: !!customerName,
        email: !!email,
        phone: !!phone,
        shippingAddress: !!shippingAddress,
        city: !!city,
        province: !!province,
        country: !!country,
        orderItems: !!parsedOrderItems,
        subtotal: !!subtotal,
        totalAmount: !!totalAmount,
        paymentMethod: !!paymentMethod
      });
      return res.status(400).json({
        message: 'Missing required fields'
      });
    }

    // Additional validation for bank transfer
    if (paymentMethod === 'bank_transfer' && !selectedAccount) {
      return res.status(400).json({
        message: 'Selected account is required for bank transfer'
      });
    }

    // Validate and populate order items
    const populatedOrderItems = [];
    for (const item of parsedOrderItems) {
      try {
        // Try to find the product in MongoDB first
        const product = await Product.findById(item.product);
        if (product) {
          // Check if enough stock is available
          if (product.category === 'Rings' && !product.isAdjustable && item.selectedSize) {
            // For sized rings, check stock for the specific size
            const sizeKey = item.selectedSize === '5-6' ? 'small' : item.selectedSize === '7-8' ? 'medium' : 'large';
            const sizeStock = product.sizedStock?.[sizeKey] || 0;
            if (sizeStock < item.quantity) {
              return res.status(400).json({
                success: false,
                message: `Insufficient stock for ${product.title} in size ${item.selectedSize}. Only ${sizeStock} items available.`
              });
            }
          } else {
            // For regular products and adjustable rings
            if (product.quantity < item.quantity) {
              return res.status(400).json({
                success: false,
                message: `Insufficient stock for ${product.title}. Only ${product.quantity} items available.`
              });
            }
          }
          
          populatedOrderItems.push({
            product: product._id,
            title: product.title,
            price: product.price,
            quantity: item.quantity,
            image: product.images[0] || '',
            selectedSize: item.selectedSize || null
          });
        } else {
          // If not found in MongoDB, it might be a hardcoded product
          // For hardcoded products, we'll store the data directly without product reference
          populatedOrderItems.push({
            product: null, // No MongoDB reference for hardcoded products
            title: item.title || `Product ${item.product}`, // Use provided title or fallback
            price: item.price || 0, // Use price from order item
            quantity: item.quantity,
            image: item.image || '', // Use image from order item
            selectedSize: item.selectedSize || null
          });
        }
      } catch (error) {
        // If there's an error (like invalid ObjectId), treat as hardcoded product
        populatedOrderItems.push({
          product: null,
          title: item.title || `Product ${item.product}`, // Use provided title or fallback
          price: item.price || 0,
          quantity: item.quantity,
          image: item.image || '',
          selectedSize: item.selectedSize || null
        });
      }
    }

    // Get transaction proof URL if file was uploaded
    const transactionProof = req.file ? req.file.path : null;

    const order = await Order.create({
      customerName,
      email,
      phone,
      shippingAddress,
      city,
      province,
      country,
      shippingCost: parseFloat(shippingCost) || 0,
      orderItems: populatedOrderItems,
      subtotal: parseFloat(subtotal),
      totalAmount: parseFloat(totalAmount),
      paymentMethod,
      selectedAccount: paymentMethod === 'bank_transfer' ? selectedAccount : undefined,
      paymentDetails: paymentMethod === 'bank_transfer' ? parsedPaymentDetails : undefined,
      transactionProof,
      paymentStatus: paymentMethod === 'cod' ? 'verified' : 'pending',
      status: 'Received',
      statusHistory: [{
        status: 'Received',
        description: 'Order placed successfully',
        courierCompany: '',
        timestamp: new Date()
      }]
    });

    // Reduce stock quantity for each product in the order
    for (const item of parsedOrderItems) {
      try {
        const product = await Product.findById(item.product);
        if (product) {
          if (product.category === 'Rings' && !product.isAdjustable && item.selectedSize) {
            // For sized rings, reduce stock for the specific size
            const sizeKey = item.selectedSize === '5-6' ? 'small' : item.selectedSize === '7-8' ? 'medium' : 'large';
            const updatePath = `sizedStock.${sizeKey}`;
            const currentStock = product.sizedStock?.[sizeKey] || 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            
            await Product.findByIdAndUpdate(item.product, { 
              [updatePath]: newStock 
            });
            console.log(`Sized stock updated for ${product.title} (${sizeKey}): ${currentStock} -> ${newStock}`);
          } else {
            // For regular products and adjustable rings
            const newQuantity = Math.max(0, product.quantity - item.quantity);
            await Product.findByIdAndUpdate(item.product, { quantity: newQuantity });
            console.log(`Stock updated for ${product.title}: ${product.quantity} -> ${newQuantity}`);
          }
        }
      } catch (stockError) {
        console.error('Error updating stock:', stockError);
        // Don't fail the order if stock update fails
      }
    }

    // Return the created order with tracking number
    res.status(201).json({
      success: true,
      order: order,
      trackingNumber: order.trackingNumber,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create order',
      error: error.message 
    });
  }
};
// Admin Controllers
// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('orderItems.product').sort({ createdAt: -1 });
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// @desc    Get order by tracking number
// @route   GET /api/orders/track/:trackingNumber
// @access  Public
const getOrderByTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    const order = await Order.findOne({ trackingNumber }).populate('orderItems.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found with this tracking number'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order by tracking number error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private/Admin
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('orderItems.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, courierCompany, shipmentDescription, estimatedDelivery } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const updateData = {
      status,
      courierCompany: courierCompany || '',
      shipmentDescription: shipmentDescription || ''
    };

    // Add estimated delivery if provided
    if (estimatedDelivery) {
      updateData.estimatedDelivery = new Date(estimatedDelivery);
    }

    // Set actual delivery date if status is 'Delivered'
    if (status === 'Delivered') {
      updateData.actualDelivery = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('orderItems.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      message: 'Failed to update order status',
      error: error.message 
    });
  }
};

// @desc    Update payment status for bank transfer orders
// @route   PUT /api/orders/:id/payment-status
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!paymentStatus || !['pending', 'verified', 'rejected'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment status is required (pending, verified, rejected)'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    ).populate('orderItems.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ 
      message: 'Failed to update payment status',
      error: error.message 
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderByTrackingNumber,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus
};