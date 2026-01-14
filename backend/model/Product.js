const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    enum: ['Rings', 'Bracelets', 'Earrings', 'Necklaces']
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;