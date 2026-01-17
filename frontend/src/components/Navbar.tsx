import { Link } from "react-router-dom";
import { ShoppingCart, Search, UserCog, Menu, ChevronDown, Settings, LogOut, Plus } from "lucide-react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { CartDrawer } from "@/components/CartDrawer";
import { SearchDialog } from "@/components/SearchDialog";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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

export const Navbar = () => {
  const dir = useScrollDirection();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Collections dropdown states
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const collectionsRef = useRef<HTMLDivElement>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (collectionsRef.current && !collectionsRef.current.contains(event.target)) {
        setCollectionsDropdownOpen(false);
        setExpandedCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle collections dropdown hover
  const handleCollectionsMouseEnter = () => {
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }
    setCollectionsDropdownOpen(true);
  };

  const handleCollectionsMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setCollectionsDropdownOpen(false);
      setExpandedCategory(null);
    }, 150);
  };

  const handleCategoryHover = (category: string) => {
    setExpandedCategory(category);
  };

  const navigateToCategory = (category: string, subcategory?: string) => {
    setCollectionsDropdownOpen(false);
    setExpandedCategory(null);
    if (subcategory) {
      navigate(`/collections?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`);
    } else {
      navigate(`/collections?category=${encodeURIComponent(category)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      toast({ title: "Logged out successfully" });
      navigate("/");
    } catch (error) {
      toast({ title: "Logout failed", variant: "destructive" });
    }
  };

  const handleDashboard = () => {
    setIsDropdownOpen(false);
    navigate("/admin/dashboard");
  };

  const handleContactClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setContactModal(true);
  };

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
      className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ${
        dir === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="backdrop-blur-md bg-background/80 border-b">
        <nav className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger className="md:hidden p-2">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 overflow-y-auto">
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <div className="mt-8 flex flex-col gap-4">
                  <Link to="/" className="hover:underline" onClick={handleMobileNavClick}>Home</Link>
                  
                  {/* Mobile Collections with Categories */}
                  <div className="space-y-2">
                    <Link 
                      to="/collections" 
                      className="hover:underline font-medium"
                      onClick={handleMobileNavClick}
                    >
                      All Collections
                    </Link>
                    <div className="pl-4 space-y-2">
                      {allCategories.map((cat) => (
                        <div key={cat} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/collections?category=${encodeURIComponent(cat)}`}
                              className="hover:underline text-sm"
                              onClick={handleMobileNavClick}
                            >
                              {cat}
                            </Link>
                            {categorySubcategories[cat]?.length > 0 && (
                              <button
                                onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
                                className="p-1"
                              >
                                <Plus className={`h-3 w-3 transition-transform ${expandedCategory === cat ? 'rotate-45' : ''}`} />
                              </button>
                            )}
                          </div>
                          {expandedCategory === cat && categorySubcategories[cat]?.length > 0 && (
                            <div className="pl-4 space-y-1">
                              {categorySubcategories[cat].map((subcat) => (
                                <Link
                                  key={subcat}
                                  to={`/collections?category=${encodeURIComponent(cat)}&subcategory=${encodeURIComponent(subcat)}`}
                                  className="block text-xs text-muted-foreground hover:text-foreground"
                                  onClick={handleMobileNavClick}
                                >
                                  {subcat}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button onClick={() => handleContactClick()} className="hover:underline text-left">Contact Us</button>
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/" className="font-serif text-2xl tracking-tight">Ayosi</Link>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/" className="hover:opacity-80 transition-opacity">Home</Link>
            
            {/* Collections with Dropdown */}
            <div 
              ref={collectionsRef}
              className="relative"
              onMouseEnter={handleCollectionsMouseEnter}
              onMouseLeave={handleCollectionsMouseLeave}
            >
              <button 
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                onClick={() => navigate('/collections')}
              >
                Collections
                <ChevronDown 
                  className={`h-3 w-3 transition-transform duration-200 ${
                    collectionsDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {/* Collections Dropdown */}
              <AnimatePresence>
                {collectionsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full mt-2 bg-background border rounded-lg shadow-lg min-w-[200px] z-50"
                  >
                    <div className="py-2">
                      {/* All Collections option */}
                      <button
                        onClick={() => navigateToCategory('')}
                        className="w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors font-medium border-b"
                      >
                        All Collections
                      </button>
                      
                      {allCategories.map((cat) => (
                        <div 
                          key={cat}
                          className="relative"
                          onMouseEnter={() => handleCategoryHover(cat)}
                        >
                          <div className="flex items-center justify-between px-4 py-2 hover:bg-muted transition-colors cursor-pointer">
                            <button
                              onClick={() => navigateToCategory(cat)}
                              className="text-sm text-left flex-1"
                            >
                              {cat}
                            </button>
                            {categorySubcategories[cat]?.length > 0 && (
                              <Plus className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
                                expandedCategory === cat ? 'rotate-45' : ''
                              }`} />
                            )}
                          </div>
                          
                          {/* Subcategory dropdown */}
                          <AnimatePresence>
                            {expandedCategory === cat && categorySubcategories[cat]?.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-full top-0 ml-1 bg-background border rounded-lg shadow-lg min-w-[150px]"
                              >
                                <div className="py-2">
                                  {categorySubcategories[cat].map((subcat) => (
                                    <button
                                      key={subcat}
                                      onClick={() => navigateToCategory(cat, subcat)}
                                      className="w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors"
                                    >
                                      {subcat}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button onClick={handleContactClick} className="hover:opacity-80 transition-opacity">Contact Us</button>
          </div>

          <div className="flex items-center gap-2">
            <SearchDialog>
              <button aria-label="Search" className="p-2 rounded-md hover:bg-muted transition-colors">
                <Search className="h-5 w-5" />
              </button>
            </SearchDialog>

            <CartDrawer>
              <button aria-label="Cart" className="relative p-2 rounded-md hover:bg-muted transition-colors">
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-foreground text-background"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </CartDrawer>

            {/* Admin Section - Only show if user is logged in */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 p-2 rounded-md hover:bg-muted transition-colors"
                  aria-label="Admin Menu"
                >
                  <UserCog className="h-5 w-5" />
                  <ChevronDown 
                    className={`h-3 w-3 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {/* Dropdown Menu */}
                <div
                  className={`absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg transition-all duration-200 ${
                    isDropdownOpen
                      ? 'opacity-100 translate-y-0 visible'
                      : 'opacity-0 -translate-y-2 invisible'
                  }`}
                  style={{ zIndex: 1000 }}
                >
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-muted-foreground border-b">
                      Welcome, {user.username}
                    </div>
                    
                    <button
                      onClick={handleDashboard}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <Settings className="h-4 w-4" />
                      Dashboard
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors text-left text-red-600 hover:text-red-700"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </nav>
      </div>
    </header>

    {/* Contact Modal */}
    <Dialog open={contactModal} onOpenChange={setContactModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Contact Us</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We're here to help with any questions or concerns you may have. Feel free to reach out to us anytime.
          </p>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Email</p>
              <a 
                href="mailto:ayosi.pk@gmail.com" 
                className="text-sm text-primary hover:underline"
              >
                ayosi.pk@gmail.com
              </a>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Instagram</p>
              <a 
                href="https://www.instagram.com/ayosibyarooj/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Message us on Instagram
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};