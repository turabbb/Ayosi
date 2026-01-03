const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  shippingAddress: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true,
    enum: ['punjab', 'sindh', 'balochistan', 'kpk', 'gilgit', 'islamabad'],
    default: 'punjab'
  },
  country: {
    type: String,
    required: true,
    default: 'Pakistan'
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 250
  },
  // Remove zip field as it's not needed for Pakistan
  orderItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false // Allow null for hardcoded products
    },
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    image: String
  }],
  subtotal: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cod'],
    required: true,
    default: 'cod'
  },
  selectedAccount: {
    type: String,
    required: false // Only for bank transfers
  },
  paymentDetails: {
    accountName: String,
    accountNumber: String,
    accountHolder: String
  },
  transactionProof: {
    type: String, // Cloudinary URL for uploaded screenshot
    required: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['Received', 'Processing', 'Shipping', 'Delivered'],
    default: 'Received'
  },
  courierCompany: {
    type: String,
    default: ''
  },
  shipmentDescription: {
    type: String,
    default: ''
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['Received', 'Processing', 'Shipping', 'Delivered']
    },
    description: String,
    courierCompany: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Generate tracking number before saving
orderSchema.pre('save', function(next) {
  if (!this.trackingNumber) {
    this.trackingNumber = 'AYOSI-' + Date.now().toString().slice(-8) + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Update status history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status) {
    this.statusHistory.push({
      status: this.status,
      description: this.shipmentDescription || '',
      courierCompany: this.courierCompany || '',
      timestamp: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);