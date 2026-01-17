import { Product } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Eye, AlertTriangle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const quickViewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if product is out of stock (handle both regular and sized rings)
  const isSizedRing = product.category === 'Rings' && !(product as any).isAdjustable;
  const totalSizedStock = isSizedRing 
    ? ((product as any).sizedStock?.small || 0) + ((product as any).sizedStock?.medium || 0) + ((product as any).sizedStock?.large || 0)
    : 0;
  const effectiveStock = isSizedRing ? totalSizedStock : (product.quantity ?? 0);
  const isOutOfStock = effectiveStock === 0;
  const isLowStock = effectiveStock > 0 && effectiveStock <= 10;

  // Auto-cycle through images when hovered (faster timing)
  useEffect(() => {
    if (isHovered && product.images.length > 1) {
      // Start cycling after 800ms (reduced delay)
      const startDelay = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          setCurrentImageIndex((prevIndex) => 
            (prevIndex + 1) % product.images.length
          );
        }, 700); // Change image every 700ms (faster)
      }, 800);

      return () => {
        clearTimeout(startDelay);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Reset to first image when not hovered
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentImageIndex(0);
    }
  }, [isHovered, product.images.length]);

  // Show quick view with delay
  useEffect(() => {
    if (isHovered) {
      quickViewTimeoutRef.current = setTimeout(() => {
        setShowQuickView(true);
      }, 300); // Show after 300ms of hovering
    } else {
      if (quickViewTimeoutRef.current) {
        clearTimeout(quickViewTimeoutRef.current);
      }
      setShowQuickView(false);
    }

    return () => {
      if (quickViewTimeoutRef.current) {
        clearTimeout(quickViewTimeoutRef.current);
      }
    };
  }, [isHovered]);

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  return (
    <Card 
      className={`group overflow-hidden transition-all duration-500 border-0 shadow-sm transform ${
        isOutOfStock 
          ? 'opacity-75 grayscale-[30%]' 
          : 'hover:shadow-2xl hover:border hover:border-primary/20 hover:-translate-y-1'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative cursor-pointer overflow-hidden" onClick={() => navigate(`/product/${product.id}`)}>
        {/* Image with loading skeleton */}
        <div className="aspect-square relative bg-gray-100">
          <img 
            src={product.images[currentImageIndex] || product.images[0]} 
            alt={`${product.title} product image`} 
            className={`aspect-square w-full object-cover transition-all duration-700 ${
              isOutOfStock ? '' : 'group-hover:scale-105'
            } ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
          />
          
          {/* Loading skeleton with shimmer */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          )}
          
          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
              <div className="bg-white/95 px-4 py-2 rounded-lg shadow-lg">
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Out of Stock
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Overlay effects - only when in stock */}
        {!isOutOfStock && (
          <>
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[0.5px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          </>
        )}
        
        {/* Quick view button */}
        <div className={`absolute top-3 right-3 transition-all duration-300 ${
          showQuickView ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-75'
        }`}>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm border-0 hover:scale-110 transition-all duration-200"
            onClick={handleQuickView}
            title="Quick View"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Badges container */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {/* Featured badge */}
          {product.isFeatured && !isOutOfStock && (
            <div className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
              Featured
            </div>
          )}
          
          {/* Low stock badge */}
          {isLowStock && (
            <Badge variant="outline" className="text-xs bg-orange-50 border-orange-400 text-orange-600 shadow-sm">
              Only {effectiveStock} left
            </Badge>
          )}
          
          {/* Adjustable ring badge */}
          {product.category === 'Rings' && (product as any).isAdjustable && (
            <Badge variant="outline" className="text-xs bg-blue-50 border-blue-400 text-blue-600 shadow-sm">
              Adjustable
            </Badge>
          )}
        </div>

        {/* Dot indicators (cleaner look) */}
        {product.images.length > 1 && !isOutOfStock && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {product.images.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-white shadow-lg' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
            <h3 className={`text-sm font-medium transition-colors duration-200 line-clamp-2 leading-tight ${
              isOutOfStock ? 'text-gray-500' : 'group-hover:text-primary'
            }`}>
              {product.title}
            </h3>
            <p className={`text-sm font-bold mt-1 ${isOutOfStock ? 'text-gray-400' : 'text-primary'}`}>
              Rs. {Math.round(product.price)}
            </p>
          </div>
          {isOutOfStock ? (
            <Button 
              size="icon" 
              variant="ghost" 
              aria-label="Out of stock" 
              className="opacity-50 cursor-not-allowed"
              disabled
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              size="icon" 
              variant="ghost" 
              aria-label="Add to cart" 
              className="opacity-70 hover:opacity-100 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
