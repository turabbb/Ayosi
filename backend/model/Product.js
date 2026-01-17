const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define categories and their subcategories
const categorySubcategories = {
  'Rings': ['Golden', 'Silver'],
  'Necklaces': ['Golden', 'Silver'],
  'Bracelets': ['Golden', 'Silver', 'Arm Cuffs'],
  'Earrings': ['Golden', 'Silver', 'Jhumkay'],
  'Jewellery Box': ['Box', 'Gift Boxes'],
  'Accessories': []
};

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  images: {
    type: [String], // An array of strings for image URLs
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['Rings', 'Bracelets', 'Earrings', 'Necklaces', 'Jewellery Box', 'Accessories']
  },
  subcategory: {
    type: String,
    trim: true,
    default: ''
  },
  quantity: {
    type: Number,
    required: function() {
      // Only required if not a ring OR if it's an adjustable ring
      return this.category !== 'Rings' || this.isAdjustable === true;
    },
    default: 0,
    min: 0
  },
  // For Rings only - whether it's adjustable or sized
  isAdjustable: {
    type: Boolean,
    default: false
  },
  // Stock for each ring size (only used when category is Rings and isAdjustable is false)
  sizedStock: {
    small: { type: Number, default: 0, min: 0 },    // Size 5-6
    medium: { type: Number, default: 0, min: 0 },   // Size 7-8
    large: { type: Number, default: 0, min: 0 }     // Size 9-10
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true
});

// Virtual to get total stock for sized rings
productSchema.virtual('totalSizedStock').get(function() {
  if (this.category === 'Rings' && !this.isAdjustable) {
    return (this.sizedStock?.small || 0) + (this.sizedStock?.medium || 0) + (this.sizedStock?.large || 0);
  }
  return this.quantity;
});

// Ensure virtuals are included when converting to JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

// Export both the model and the category-subcategory mapping
module.exports = Product;
module.exports.categorySubcategories = categorySubcategories;