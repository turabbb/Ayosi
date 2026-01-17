import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Minus, Plus, ChevronLeft, ChevronRight, X, ZoomIn, AlertTriangle } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PageTransition from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";

// Ring sizes with their stock keys
const ringSizes = [
  { value: "5-6", label: "Small (5–6)", stockKey: "small" as const },
  { value: "7-8", label: "Medium (7–8)", stockKey: "medium" as const },
  { value: "9-10", label: "Large (9–10)", stockKey: "large" as const }
];

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById } = useProducts();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const foundProduct = await getProductById(id);
        setProduct(foundProduct || null);
      } catch (error) {
        console.error('Error loading product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, getProductById]);

  // Loading state
  if (loading) {
    return (
      <div className="pt-16 mx-auto max-w-4xl px-2 md:px-4 py-12">
        <p className="text-sm text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="pt-16 mx-auto max-w-4xl px-2 md:px-4 py-12">
        <p className="text-sm text-muted-foreground">Product not found.</p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  // Check if ring is adjustable or sized
  const isRing = product.category === "Rings";
  const isAdjustable = isRing && product.isAdjustable;
  const isSizedRing = isRing && !product.isAdjustable;
  
  // Get stock for the selected size (for sized rings)
  const getStockForSize = (stockKey: 'small' | 'medium' | 'large') => {
    return product.sizedStock?.[stockKey] ?? 0;
  };
  
  // Calculate total stock for the product
  const getTotalStock = () => {
    if (isSizedRing) {
      return (product.sizedStock?.small || 0) + (product.sizedStock?.medium || 0) + (product.sizedStock?.large || 0);
    }
    return product.quantity || 0;
  };
  
  // Get maximum quantity user can add based on selection
  const getMaxQuantity = () => {
    if (isSizedRing && selectedSize) {
      const sizeData = ringSizes.find(s => s.value === selectedSize);
      if (sizeData) {
        return getStockForSize(sizeData.stockKey);
      }
    }
    return product.quantity || 0;
  };

  const handleAddToCart = () => {
    // For sized rings, require size selection
    if (isSizedRing && !selectedSize) {
      alert("Please select a size for this ring");
      return;
    }
    addToCart(product, qty, isSizedRing ? selectedSize : undefined);
  };

  // Handle image error with better fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== 'https://dummyimage.com/400x400/cccccc/000000.png&text=No+Image') {
      target.src = 'https://dummyimage.com/400x400/cccccc/000000.png&text=No+Image';
    }
  };

  // Image navigation functions
  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  // Zoom functionality
  const handleZoomClick = () => {
    setIsZoomed(true);
  };

  const handleZoomMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <PageTransition className="pt-16">
      <SEO title={`${product.title} | Ayosi`} description={`Shop ${product.title} – luxurious, modern design.`} canonical={`/product/${product.id}`} />
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 lg:px-16 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* Main Image with Navigation */}
          <div className="relative group">
            <div 
              className="aspect-square overflow-hidden rounded-md cursor-zoom-in relative"
              onClick={handleZoomClick}
            >
              <img 
                src={product.images[selectedImage] || product.images[0]} 
                alt={`${product.title} image ${selectedImage + 1}`} 
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                onError={handleImageError}
              />
              {/* Zoom icon overlay */}
              <div className="absolute top-4 right-4 bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ZoomIn className="h-4 w-4 text-white" />
              </div>
            </div>
            
            {/* Navigation arrows for multiple images */}
            {product.images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Image counter */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {selectedImage + 1} / {product.images.length}
              </div>
            )}
          </div>
          
          {/* Thumbnail Navigation */}
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  aria-label={`View image ${idx + 1}`}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square overflow-hidden rounded border-2 transition-all duration-200 ${
                    selectedImage === idx 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.title} thumbnail ${idx + 1}`} 
                    className="h-full w-full object-cover" 
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== 'https://dummyimage.com/80x80/cccccc/000000.png&text=No+Image') {
                        target.src = 'https://dummyimage.com/80x80/cccccc/000000.png&text=No+Image';
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">{product.title}</h1>
          <p className="mt-2 text-lg">Rs. {Math.round(product.price)}</p>
          
          {/* Category/Subcategory display */}
          {product.subcategory && (
            <p className="text-sm text-muted-foreground mt-1">
              {product.category} / {product.subcategory}
            </p>
          )}
          
          {/* Stock Status Display */}
          <div className="mt-3">
            {getTotalStock() === 0 ? (
              <Badge variant="destructive" className="text-sm px-3 py-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Out of Stock
              </Badge>
            ) : getTotalStock() <= 10 ? (
              <Badge variant="outline" className="text-sm px-3 py-1 border-orange-400 text-orange-600 bg-orange-50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Low Stock - order soon!
              </Badge>
            ) : (
              <Badge variant="outline" className="text-sm px-3 py-1 border-green-400 text-green-600 bg-green-50">
                In Stock
              </Badge>
            )}
            
            {/* Show Adjustable badge for adjustable rings */}
            {isAdjustable && (
              <Badge variant="outline" className="text-sm px-3 py-1 ml-2 border-blue-400 text-blue-600 bg-blue-50">
                Adjustable Ring
              </Badge>
            )}
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>

          <div className="mt-6 space-y-4">
            {/* Size selection for SIZED rings only (not adjustable) */}
            {isSizedRing && (
              <div>
                <p className="text-sm font-medium mb-2">Select Size *</p>
                <div className="flex flex-wrap gap-2">
                  {ringSizes.map((size) => {
                    const stockForSize = getStockForSize(size.stockKey);
                    const isOutOfStock = stockForSize === 0;
                    
                    return (
                      <div key={size.value} className="relative">
                        <Button 
                          variant={selectedSize === size.value ? 'default' : 'secondary'} 
                          size="sm" 
                          onClick={() => !isOutOfStock && setSelectedSize(size.value)} 
                          aria-pressed={selectedSize === size.value}
                          disabled={isOutOfStock}
                          className={`${isOutOfStock ? 'opacity-50 cursor-not-allowed relative' : ''}`}
                        >
                          {size.label}
                          {!isOutOfStock && stockForSize <= 5 && stockForSize > 0 && (
                            <span className="ml-1 text-xs text-orange-500">(Low Stock)</span>
                          )}
                        </Button>
                        {isOutOfStock && (
                          <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-red-500 whitespace-nowrap">
                            Out of stock
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!selectedSize && getTotalStock() > 0 && (
                  <p className="text-xs text-red-500 mt-4">Size selection is required</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              {getTotalStock() > 0 && (!isSizedRing || (isSizedRing && selectedSize && getMaxQuantity() > 0)) && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-6 text-center">{qty}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    aria-label="Increase quantity" 
                    onClick={() => setQty(Math.min(getMaxQuantity() || 1, qty + 1))}
                    disabled={qty >= (getMaxQuantity() || 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {getTotalStock() === 0 ? (
                <Button disabled className="bg-gray-400 cursor-not-allowed">
                  Out of Stock
                </Button>
              ) : isSizedRing && !selectedSize ? (
                <Button disabled className="bg-gray-300 cursor-not-allowed">
                  Select a Size
                </Button>
              ) : isSizedRing && selectedSize && getMaxQuantity() === 0 ? (
                <Button disabled className="bg-gray-400 cursor-not-allowed">
                  Size Out of Stock
                </Button>
              ) : (
                <Button onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              )}
            </div>
            {getTotalStock() > 0 && qty > getMaxQuantity() && (
              <p className="text-xs text-orange-600">Maximum available quantity: {getMaxQuantity()}</p>
            )}
          </div>

          <div className="mt-8 text-sm text-muted-foreground space-y-2">
            <p>• Free shipping over Rs. 5000</p>
            <p>• Hypoallergenic materials</p>
          </div>

          <div className="mt-10 space-y-3">
            <h2 className="text-lg font-semibold">Details</h2>
            <p className="text-sm text-muted-foreground">Designed for everyday wear, this piece pairs effortlessly with your wardrobe. Nickel-free and gentle on skin, with a brilliant finish that resists tarnish.</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Premium-grade materials</li>
              <li>Comfort-fit design</li>
              <li>Polished by hand</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-6xl w-full h-[80vh] p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setIsZoomed(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Navigation arrows in zoom mode */}
            {product.images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
            
            {/* Zoomable image */}
            <div 
              className="w-full h-full overflow-hidden cursor-move relative"
              onMouseMove={handleZoomMouseMove}
            >
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={`${product.title} zoomed image`}
                className="w-full h-full object-contain transition-transform duration-200 hover:scale-150"
                style={{
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
                onError={handleImageError}
              />
            </div>
            
            {/* Image counter in zoom mode */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                {selectedImage + 1} / {product.images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default ProductPage;