// Product interface for type safety
export interface Product {
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

// Note: All products are now managed through the admin panel and API.
// This file now only contains type definitions.
export const products: Product[] = [];

// These functions are deprecated - use ProductsContext instead
export const getAllProducts = () => products;
export const getFeaturedProducts = () => products;
export const getProductById = (id: string) => products.find(p => p.id === id);
export const getProductsByCategory = (category: string) => products;
