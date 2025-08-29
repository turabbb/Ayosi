import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const CartDrawer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { items, totalPrice, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col w-[92vw] sm:w-[480px]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <SheetHeader>
            <SheetTitle>Your Cart</SheetTitle>
          </SheetHeader>
        </motion.div>
        <div className="flex-1 overflow-auto space-y-4 py-4">
          {items.length === 0 && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted-foreground"
            >
              Your cart is empty.
            </motion.p>
          )}
          <AnimatePresence>
            {items.map((it, index) => (
              <motion.div 
                key={it.productId} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <img src={it.image} alt={`${it.title} product image`} className="h-16 w-16 object-cover rounded-md" loading="lazy" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium pr-2 line-clamp-2">{it.title}</p>
                    <span className="text-sm font-medium">Rs. {Math.round(it.price * it.quantity)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rs. {Math.round(it.price)} each</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Decrease ${it.title}`}
                      onClick={() => updateQuantity(it.productId, Math.max(1, it.quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center text-sm">{it.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Increase ${it.title}`}
                      onClick={() => updateQuantity(it.productId, it.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${it.title}`}
                      onClick={() => removeFromCart(it.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Free shipping notifications - positioned at bottom */}
        {totalPrice >= 5000 && totalPrice > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="px-1 pb-2"
          >
            <div className="bg-muted/50 rounded-lg px-3 py-2 border border-border/50">
              <p className="text-xs text-muted-foreground text-center font-medium">
                You've qualified for free shipping!
              </p>
              <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                <div 
                  className="bg-foreground h-1.5 rounded-full transition-all duration-300"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </motion.div>
        )}
        
        {totalPrice < 5000 && totalPrice > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="px-1 pb-2"
          >
            <div className="bg-muted/50 rounded-lg px-3 py-2 border border-border/50">
              <p className="text-xs text-muted-foreground text-center font-medium">
                Add Rs. {Math.round(5000 - totalPrice)} more for free shipping
              </p>
              <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                <div 
                  className="bg-foreground h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((totalPrice / 5000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
        
        <Separator />
        <SheetFooter>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">Rs. {Math.round(totalPrice)}</span>
            </div>
            <Button className="w-full" disabled={items.length === 0} onClick={() => { setOpen(false); setTimeout(() => navigate("/checkout"), 250); }}>Checkout</Button>
          </motion.div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
