import { SEO } from "@/components/SEO";
import { ProductCard } from "@/components/ProductCard";
import { useMemo, useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronRight } from "lucide-react";

// Category and subcategory definitions
const categorySubcategories: Record<string, string[]> = {
  'Rings': ['Golden', 'Silver'],
  'Necklaces': ['Golden', 'Silver'],
  'Bracelets': ['Golden', 'Silver', 'Arm Cuffs'],
  'Earrings': ['Golden', 'Silver', 'Jhumkay'],
  'Jewellery Box': ['Box', 'Gift Boxes'],
  'Accessories': []
};

const allCategories = Object.keys(categorySubcategories);

type Layout = "grid" | "list";

const Collections = () => {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial values from URL params
  const initialCategory = searchParams.get('category') || null;
  const initialSubcategory = searchParams.get('subcategory') || null;
  
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [subcategory, setSubcategory] = useState<string | null>(initialSubcategory);
  const [price, setPrice] = useState<[number, number]>([0, 2000]);
  const [layout, setLayout] = useState<Layout>("grid");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(initialCategory);

  // Update state when URL params change
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlSubcategory = searchParams.get('subcategory');
    setCategory(urlCategory);
    setSubcategory(urlSubcategory);
    if (urlCategory) {
      setExpandedCategory(urlCategory);
    }
  }, [searchParams]);

  // Update URL when category/subcategory changes
  const handleCategoryChange = (newCategory: string | null, newSubcategory?: string | null) => {
    const params = new URLSearchParams();
    if (newCategory) {
      params.set('category', newCategory);
      if (newSubcategory) {
        params.set('subcategory', newSubcategory);
      }
    }
    setSearchParams(params);
    setCategory(newCategory);
    setSubcategory(newSubcategory || null);
  };

  const toggleCategoryExpand = (cat: string) => {
    setExpandedCategory(expandedCategory === cat ? null : cat);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const inCat = !category || p.category === category;
      const inSubcat = !subcategory || (p as any).subcategory === subcategory;
      const inPrice = p.price >= price[0] && p.price <= price[1];
      return inCat && inSubcat && inPrice;
    });
  }, [products, category, subcategory, price]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <PageTransition className="pt-16">
      <SEO title="Collections | Ayosi" description="Browse all jewellery collections – rings, necklaces, earrings and more." canonical="/collections" />
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-16 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Category</h3>
            <div className="space-y-1">
              {/* All Products Button */}
              <Button 
                size="sm" 
                variant={category === null ? "default" : "ghost"} 
                onClick={() => handleCategoryChange(null)}
                className="w-full justify-start"
              >
                All Products
              </Button>
              
              {/* Category list with expandable subcategories */}
              {allCategories.map((cat) => (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      variant={category === cat && !subcategory ? "default" : "ghost"} 
                      onClick={() => handleCategoryChange(cat)}
                      className="flex-1 justify-start"
                    >
                      {cat}
                    </Button>
                    {categorySubcategories[cat]?.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategoryExpand(cat);
                        }}
                      >
                        <Plus className={`h-4 w-4 transition-transform duration-200 ${
                          expandedCategory === cat ? 'rotate-45' : ''
                        }`} />
                      </Button>
                    )}
                  </div>
                  
                  {/* Subcategories */}
                  <AnimatePresence>
                    {expandedCategory === cat && categorySubcategories[cat]?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-4 space-y-1 overflow-hidden"
                      >
                        {categorySubcategories[cat].map((subcat) => (
                          <Button
                            key={subcat}
                            size="sm"
                            variant={category === cat && subcategory === subcat ? "default" : "ghost"}
                            onClick={() => handleCategoryChange(cat, subcat)}
                            className="w-full justify-start text-sm"
                          >
                            <ChevronRight className="h-3 w-3 mr-1" />
                            {subcat}
                          </Button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium">Price</h3>
            <div className="mt-3">
              <Slider 
                min={0} 
                max={2000} 
                step={50} 
                value={price}
                onValueChange={(value) => setPrice(value as [number, number])} 
                className="w-full" 
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Rs. {price[0]}</span>
                <span>Rs. {price[1]}</span>
              </div>
            </div>
          </div>
        </aside>
        <section className="md:col-span-3">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                {category ? (
                  <>
                    {category}
                    {subcategory && <span className="text-muted-foreground"> / {subcategory}</span>}
                  </>
                ) : 'All Products'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{filtered.length} products found</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <div className="flex gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={layout === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLayout("grid")}
                  >
                    Grid
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={layout === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLayout("list")}
                  >
                    List
                  </Button>
                </motion.div>
              </div>
            </div>
          </header>
          <AnimatePresence mode="wait">
            <motion.div 
              key={layout}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={layout === "grid" ? "grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6" : "space-y-4"}
            >
              {filtered.map((p, index) => (
                <motion.div 
                  key={`${layout}-${p.id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {layout === "list" ? (
                  <div 
                    onClick={() => handleProductClick(p.id)} 
                    className="group border rounded-lg p-3 md:p-4 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200 bg-card"
                  >
                    {/* Mobile: Stack layout, Desktop: Row layout */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-full sm:w-24 h-32 sm:h-24 rounded-md overflow-hidden">
                          <img 
                            src={p.images[0]} 
                            alt={`${p.title} product image`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            loading="lazy" 
                          />
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                          {p.title}
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1 mb-2">
                          <p className="text-lg sm:text-xl font-bold text-primary">Rs. {Math.round(p.price)}</p>
                          <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-0.5 sm:py-1 rounded-full">
                            {p.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed hidden sm:block">
                          {p.description || "A beautiful piece of jewellery."}
                        </p>
                      </div>
                      
                      {/* Add to Cart Button */}
                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto opacity-100 sm:opacity-70 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(p, 1);
                          }}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ProductCard product={p} />
                )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => { handleCategoryChange(null); setPrice([0, 2000]); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
};

export default Collections;
