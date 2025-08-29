import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { productsAPI } from '@/lib/api';

interface Product {
  _id: string;
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isFeatured: boolean;
  inStock: boolean;
  tags: string[];
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
        const mappedProducts: Product[] = response.map((p: any) => ({
          _id: p._id,
          id: p._id, // Use _id as id for consistency
          title: p.title,
          description: p.description || "A beautiful piece of jewellery.",
          price: p.price,
          images: p.images || [],
          category: p.category,
          isFeatured: p.isFeatured || false,
          inStock: p.inStock !== undefined ? p.inStock : true,
          tags: p.tags || [p.category?.toLowerCase()].filter(Boolean)
        }));
        
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
        const mappedFeatured: Product[] = response.map((p: any) => ({
          _id: p._id,
          id: p._id,
          title: p.title,
          description: p.description || "A beautiful piece of jewellery.",
          price: p.price,
          images: p.images || [],
          category: p.category,
          isFeatured: true,
          inStock: p.inStock !== undefined ? p.inStock : true,
          tags: p.tags || [p.category?.toLowerCase()].filter(Boolean)
        }));
        
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
          product = {
            _id: response._id,
            id: response._id,
            title: response.title,
            description: response.description || "A beautiful piece of jewellery.",
            price: response.price,
            images: response.images || [],
            category: response.category,
            isFeatured: response.isFeatured || false,
            inStock: response.inStock !== undefined ? response.inStock : true,
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
