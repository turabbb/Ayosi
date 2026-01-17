import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { productsAPI } from '@/lib/api';

interface SizedStock {
  small: number;
  medium: number;
  large: number;
}

interface Product {
  _id: string;
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subcategory?: string;
  isFeatured: boolean;
  inStock: boolean;
  quantity: number;
  tags: string[];
  // Ring-specific fields
  isAdjustable?: boolean;
  sizedStock?: SizedStock;
  totalSizedStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductsContextType {
  products: Product[];
  featuredProducts: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  getProductById: (id: string) => Promise<Product | undefined>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

interface ProductsProviderProps {
  children: ReactNode;
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching products from API...');
      const response = await productsAPI.getAll();
      console.log('📦 API Response:', response);
      
      // The backend returns products directly, not wrapped in success/data
      if (response && Array.isArray(response)) {
        console.log('✅ Products found:', response.length);
        const mappedProducts: Product[] = response.map((p: any) => {
          // Calculate total stock for sized rings
          const isSizedRing = p.category === 'Rings' && !p.isAdjustable;
          const totalSizedStock = isSizedRing 
            ? (p.sizedStock?.small || 0) + (p.sizedStock?.medium || 0) + (p.sizedStock?.large || 0)
            : 0;
          const effectiveQuantity = isSizedRing ? totalSizedStock : (p.quantity ?? 0);
          
          return {
            _id: p._id,
            id: p._id, // Use _id as id for consistency
            title: p.title,
            description: p.description || "A beautiful piece of jewellery.",
            price: p.price,
            images: p.images || [],
            category: p.category,
            subcategory: p.subcategory || '',
            isFeatured: p.isFeatured || false,
            inStock: effectiveQuantity > 0,
            quantity: p.quantity ?? 0,
            isAdjustable: p.isAdjustable ?? false,
            sizedStock: p.sizedStock || { small: 0, medium: 0, large: 0 },
            totalSizedStock: totalSizedStock,
            tags: p.tags || [p.category?.toLowerCase()].filter(Boolean)
          };
        });
        
        console.log('📋 Mapped products:', mappedProducts);
        setProducts(mappedProducts);
      } else {
        console.log('❌ No products in response or invalid response format');
        setProducts([]);
      }
    } catch (err) {
      console.error('💥 Error fetching products:', err);
      setError('Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      setError(null);
      
      console.log('🔄 Fetching featured products from API...');
      const response = await productsAPI.getFeatured();
      console.log('🌟 Featured API Response:', response);
      
      if (response && Array.isArray(response)) {
        console.log('✅ Featured products found:', response.length);
        const mappedFeatured: Product[] = response.map((p: any) => {
          const isSizedRing = p.category === 'Rings' && !p.isAdjustable;
          const totalSizedStock = isSizedRing 
            ? (p.sizedStock?.small || 0) + (p.sizedStock?.medium || 0) + (p.sizedStock?.large || 0)
            : 0;
          const effectiveQuantity = isSizedRing ? totalSizedStock : (p.quantity ?? 0);
          
          return {
            _id: p._id,
            id: p._id,
            title: p.title,
            description: p.description || "A beautiful piece of jewellery.",
            price: p.price,
            images: p.images || [],
            category: p.category,
            subcategory: p.subcategory || '',
            isFeatured: true,
            inStock: effectiveQuantity > 0,
            quantity: p.quantity ?? 0,
            isAdjustable: p.isAdjustable ?? false,
            sizedStock: p.sizedStock || { small: 0, medium: 0, large: 0 },
            totalSizedStock: totalSizedStock,
            tags: p.tags || [p.category?.toLowerCase()].filter(Boolean)
          };
        });
        
        console.log('🌟 Mapped featured products:', mappedFeatured);
        setFeaturedProducts(mappedFeatured);
      } else {
        console.log('❌ No featured products in response');
        setFeaturedProducts([]);
      }
    } catch (err) {
      setError('Failed to fetch featured products');
      console.error('💥 Error fetching featured products:', err);
      setFeaturedProducts([]);
    }
  };

  const getProductById = async (id: string): Promise<Product | undefined> => {
    // First try to find in current products state
    let product = products.find(product => product._id === id || product.id === id);
    
    // If not found, try to fetch directly from API
    if (!product) {
      try {
        console.log('🔍 Fetching product by ID from API:', id);
        const response = await productsAPI.getById(id);
        console.log('📦 Product API Response:', response);
        
        if (response && response._id) {
          const isSizedRing = response.category === 'Rings' && !response.isAdjustable;
          const totalSizedStock = isSizedRing 
            ? (response.sizedStock?.small || 0) + (response.sizedStock?.medium || 0) + (response.sizedStock?.large || 0)
            : 0;
          const effectiveQuantity = isSizedRing ? totalSizedStock : (response.quantity ?? 0);
          
          product = {
            _id: response._id,
            id: response._id,
            title: response.title,
            description: response.description || "A beautiful piece of jewellery.",
            price: response.price,
            images: response.images || [],
            category: response.category,
            subcategory: response.subcategory || '',
            isFeatured: response.isFeatured || false,
            inStock: effectiveQuantity > 0,
            quantity: response.quantity ?? 0,
            isAdjustable: response.isAdjustable ?? false,
            sizedStock: response.sizedStock || { small: 0, medium: 0, large: 0 },
            totalSizedStock: totalSizedStock,
            tags: response.tags || [response.category?.toLowerCase()].filter(Boolean)
          };
          console.log('✅ Product found and mapped:', product);
        }
      } catch (error) {
        console.error('💥 Error fetching product by ID:', error);
      }
    } else {
      console.log('✅ Product found in local state:', product);
    }
    
    return product;
  };

  useEffect(() => {
    fetchProducts();
    fetchFeaturedProducts();
  }, []);

  const value: ProductsContextType = {
    products,
    featuredProducts,
    isLoading,
    error,
    fetchProducts,
    fetchFeaturedProducts,
    getProductById,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};
