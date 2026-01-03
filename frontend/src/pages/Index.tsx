import { SEO } from "@/components/SEO";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/context/ProductsContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/PageTransition";
import heroImage from "@/assets/hero-3.jpg";

const HomePage = () => {
  const { products, featuredProducts, isLoading } = useProducts();
  const [featuredStartIndex, setFeaturedStartIndex] = useState(0);
  const [allStartIndex, setAllStartIndex] = useState(0);

  const [visible, setVisible] = useState(8);
  const categories = ["All","Rings","Bracelets","Earrings","Necklaces"] as const;
  type Category = typeof categories[number];
  const [category, setCategory] = useState<Category>("All");
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const list = category === "All" ? products : products.filter((p) => p.category === category);  const handleCategoryChange = (c: Category) => {
    if (c === category) return;
    setIsCategoryLoading(true);
    setCategory(c);
    setVisible(8);
    setTimeout(() => setIsCategoryLoading(false), 350);
  };

  // Slider navigation functions
  const nextFeatured = () => {
    setFeaturedStartIndex((prev) => 
      prev + 1 >= featuredProducts.length - 3 ? featuredProducts.length - 4 : prev + 1
    );
  };

  const prevFeatured = () => {
    setFeaturedStartIndex((prev) => 
      prev - 1 < 0 ? 0 : prev - 1
    );
  };

  const nextAll = () => {
    setAllStartIndex((prev) => 
      prev + 1 >= list.length - 3 ? list.length - 4 : prev + 1
    );
  };

  const prevAll = () => {
    setAllStartIndex((prev) => 
      prev - 1 < 0 ? 0 : prev - 1
    );
  };

  const visibleFeatured = featuredProducts.slice(featuredStartIndex, featuredStartIndex + 4);
  const visibleAll = list.slice(allStartIndex, allStartIndex + 4);

  // Check if navigation should be disabled
  const canGoNextFeatured = featuredStartIndex < featuredProducts.length - 4;
  const canGoPrevFeatured = featuredStartIndex > 0;
  const canGoNextAll = allStartIndex < list.length - 4;
  const canGoPrevAll = allStartIndex > 0;

  return (
    <PageTransition>
      <SEO title="Ayosi" description="Premium rings, necklaces, earrings – shop luxurious jewellery in a refined, modern experience." canonical="/" />
      <main className="pt-16">
        <HeroSlider />

        <section className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-16 py-12">
          <header className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold">Featured Pieces</h2>
            <p className="mt-2 text-muted-foreground">Curated favourites from our collection</p>
          </header>
          
          {/* Featured Products Slider */}
          <div className="relative">
            {/* Left Navigation Button - positioned outside */}
            {featuredProducts.length > 4 && (
              <Button
                variant="outline"
                size="icon"
                className={`absolute -left-16 top-1/2 -translate-y-1/2 z-10 transition-all duration-200 ${
                  canGoPrevFeatured 
                    ? 'bg-white shadow-lg hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 cursor-pointer' 
                    : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-50'
                }`}
                onClick={canGoPrevFeatured ? prevFeatured : undefined}
                disabled={!canGoPrevFeatured}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            
            {/* Right Navigation Button - positioned outside */}
            {featuredProducts.length > 4 && (
              <Button
                variant="outline"
                size="icon"
                className={`absolute -right-16 top-1/2 -translate-y-1/2 z-10 transition-all duration-200 ${
                  canGoNextFeatured 
                    ? 'bg-white shadow-lg hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 cursor-pointer' 
                    : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-50'
                }`}
                onClick={canGoNextFeatured ? nextFeatured : undefined}
                disabled={!canGoNextFeatured}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
            
            {/* Products Container with smooth transitions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 transition-all duration-500 ease-in-out">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={`featured-skeleton-${i}`} className="space-y-3">
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))
              ) : (
                visibleFeatured.map((p) => (
                  <ProductCard key={`featured-${p.id}`} product={p} />
                ))
              )}
            </div>
            
            {/* Slider Indicators */}
            {featuredProducts.length > 4 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: featuredProducts.length - 3 }).map((_, index) => (
                  <button
                    key={`featured-indicator-${index}`}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === featuredStartIndex 
                        ? 'bg-primary w-4' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => setFeaturedStartIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-16 py-12">
          <header className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold">All Categories</h2>
            <p className="mt-2 text-muted-foreground">Explore our full selection</p>
          </header>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-6">
            {categories.map((c) => (
              <Button
                key={`category-${c}`}
                variant={category === c ? "default" : "secondary"}
                size="sm"
                onClick={() => handleCategoryChange(c)}
                aria-pressed={category === c}
              >
                {c}
              </Button>
            ))}
          </div>
          
          {/* All Products Slider */}
          <div className="relative">
            {/* Left Navigation Button - positioned outside */}
            {list.length > 4 && (
              <Button
                variant="outline"
                size="icon"
                className={`absolute -left-16 top-1/2 -translate-y-1/2 z-10 transition-all duration-200 ${
                  canGoPrevAll 
                    ? 'bg-white shadow-lg hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 cursor-pointer' 
                    : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-50'
                }`}
                onClick={canGoPrevAll ? prevAll : undefined}
                disabled={!canGoPrevAll}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            
            {/* Right Navigation Button - positioned outside */}
            {list.length > 4 && (
              <Button
                variant="outline"
                size="icon"
                className={`absolute -right-16 top-1/2 -translate-y-1/2 z-10 transition-all duration-200 ${
                  canGoNextAll 
                    ? 'bg-white shadow-lg hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 cursor-pointer' 
                    : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-50'
                }`}
                onClick={canGoNextAll ? nextAll : undefined}
                disabled={!canGoNextAll}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
            
            {/* Products Container with smooth transitions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 transition-all duration-500 ease-in-out">
              {isCategoryLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={`category-skeleton-${i}`} className="space-y-3">
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))
              ) : (
                visibleAll.map((p) => (
                  <ProductCard key={`all-${p.id}`} product={p} />
                ))
              )}
            </div>
            
            {/* Slider Indicators */}
            {list.length > 4 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: list.length - 3 }).map((_, index) => (
                  <button
                    key={`all-indicator-${index}`}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === allStartIndex 
                        ? 'bg-primary w-4' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => setAllStartIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-16 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="overflow-hidden rounded-lg">
              <img src={heroImage} alt="About Ayosi studio" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div>
              <header className="mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-semibold text-center md:text-left">About Ayosi</h2>
                <p className="mt-2 text-muted-foreground text-center md:text-left">Modern luxury crafted with precision. Founded with a mission to blend timeless design with responsible sourcing and exceptional service.</p>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <article className="p-4 rounded-lg border bg-card shadow-sm animate-fade-in">
                  <h3 className="font-medium mb-1">Craftsmanship</h3>
                  <p className="text-sm text-muted-foreground">Meticulously hand-finished pieces with premium materials and enduring comfort.</p>
                </article>
                <article className="p-4 rounded-lg border bg-card shadow-sm animate-fade-in">
                  <h3 className="font-medium mb-1">Ethical Sourcing</h3>
                  <p className="text-sm text-muted-foreground">Recycled metals and conflict-free stones from trusted partners.</p>
                </article>
                <article className="p-4 rounded-lg border bg-card shadow-sm animate-fade-in">
                  <h3 className="font-medium mb-1">Lifetime Support</h3>
                  <p className="text-sm text-muted-foreground">Care guides, cleaning, and repairs to keep your jewellery shining.</p>
                </article>
                <article className="p-4 rounded-lg border bg-card shadow-sm animate-fade-in">
                  <h3 className="font-medium mb-1">Our Story</h3>
                  <p className="text-sm text-muted-foreground">Born from a small studio, now serving customers worldwide with pride.</p>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
};

export default HomePage;