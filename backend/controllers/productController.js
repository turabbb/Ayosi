const Product = require('../model/Product');
const { deleteImage, extractPublicId } = require('../config/cloudinary');

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true });
    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Failed to fetch featured products' });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

// Create product with Cloudinary image upload
const createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    console.log('Uploaded files:', req.files);
    
    // Validate required fields
    const { title, description, price, category, isFeatured, quantity } = req.body;
    
    if (!title || !description || !price || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, description, price, category' 
      });
    }

    // Check if images were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        message: 'At least one image is required' 
      });
    }

    // Get Cloudinary URLs from uploaded files
    const imageUrls = req.files.map(file => file.path);

    const productData = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      images: imageUrls,
      isFeatured: Boolean(isFeatured),
      quantity: Number(quantity) || 0
    };

    const product = await Product.create(productData);
    
    console.log('Product created successfully:', product._id);
    res.status(201).json({
      success: true,
      product: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    // If product creation failed, clean up uploaded images
    if (req.files && req.files.length > 0) {
      console.log('Cleaning up uploaded images due to error...');
      for (const file of req.files) {
        try {
          const publicId = extractPublicId(file.path);
          if (publicId) {
            await deleteImage(publicId);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up image:', cleanupError);
        }
      }
    }
    
    res.status(500).json({ 
      message: 'Failed to create product',
      error: error.message 
    });
  }
};

// Update product with Cloudinary image handling
const updateProduct = async (req, res) => {
  try {
    console.log('Updating product with data:', req.body);
    console.log('New uploaded files:', req.files);
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Store old images for potential cleanup
    const oldImages = [...product.images];

    // Process the update data
    const updateData = { ...req.body };
    
    // Trim string fields if they exist
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.description) updateData.description = updateData.description.trim();
    if (updateData.category) updateData.category = updateData.category.trim();
    
    // Convert boolean and number fields
    if (updateData.isFeatured !== undefined) updateData.isFeatured = Boolean(updateData.isFeatured);
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.quantity !== undefined) updateData.quantity = Number(updateData.quantity);

    // Handle image updates
    let newImageUrls = [];
    
    // Keep existing images that weren't removed
    if (updateData.existingImages) {
      const existingImages = Array.isArray(updateData.existingImages) 
        ? updateData.existingImages 
        : [updateData.existingImages];
      newImageUrls = [...existingImages];
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const uploadedUrls = req.files.map(file => file.path);
      newImageUrls = [...newImageUrls, ...uploadedUrls];
    }

    // Update images array if there are changes
    if (newImageUrls.length > 0) {
      updateData.images = newImageUrls;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );

    // Clean up removed images from Cloudinary
    if (updateData.images) {
      const removedImages = oldImages.filter(oldImg => !newImageUrls.includes(oldImg));
      for (const removedImg of removedImages) {
        try {
          const publicId = extractPublicId(removedImg);
          if (publicId) {
            await deleteImage(publicId);
            console.log('Deleted old image:', publicId);
          }
        } catch (cleanupError) {
          console.error('Error deleting old image:', cleanupError);
        }
      }
    }
    
    console.log('Product updated successfully:', updatedProduct._id);
    res.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    // Clean up newly uploaded images if update failed
    if (req.files && req.files.length > 0) {
      console.log('Cleaning up uploaded images due to error...');
      for (const file of req.files) {
        try {
          const publicId = extractPublicId(file.path);
          if (publicId) {
            await deleteImage(publicId);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up image:', cleanupError);
        }
      }
    }
    
    res.status(500).json({ 
      message: 'Failed to update product', 
      error: error.message 
    });
  }
};

// Delete product and its images
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      console.log('Deleting product images from Cloudinary...');
      for (const imageUrl of product.images) {
        try {
          const publicId = extractPublicId(imageUrl);
          if (publicId) {
            await deleteImage(publicId);
            console.log('Deleted image:', publicId);
          }
        } catch (cleanupError) {
          console.error('Error deleting image:', cleanupError);
        }
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);
    
    console.log('Product deleted successfully:', req.params.id);
    res.json({ 
      success: true,
      message: 'Product and images deleted successfully' 
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      message: 'Failed to delete product', 
      error: error.message 
    });
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
