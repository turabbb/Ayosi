import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Footer = () => {
  const [contactModal, setContactModal] = useState(false);
  const [shippingModal, setShippingModal] = useState(false);
  const [careGuideModal, setCareGuideModal] = useState(false);

  return (
    <>
      <footer id="contact" className="mt-16 border-t">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-16 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-lg">Ayosi</h3>
            <p className="mt-2 text-sm text-muted-foreground">Luxurious pieces, crafted to last.</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Shop</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/collections" className="hover:underline">Collections</Link></li>
              <li>
                <button 
                  onClick={() => setCareGuideModal(true)} 
                  className="hover:underline text-left"
                >
                  Care Guide
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium">Support</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/track-order" className="hover:underline">Track Your Order</Link></li>
              <li>
                <button 
                  onClick={() => setShippingModal(true)} 
                  className="hover:underline text-left"
                >
                  Shipping & Returns
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setContactModal(true)} 
                  className="hover:underline text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium">Follow</h4>
            <div className="mt-3 flex items-center gap-3">
              <a 
                aria-label="Instagram" 
                href="https://www.instagram.com/ayosibyarooj/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-muted"
              >
                <Instagram className="h-5 w-5"/>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t">
          <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-16 py-6 text-xs text-muted-foreground flex items-center justify-between">
            <span>© {new Date().getFullYear()} Ayosi Studio</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </footer>

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

      {/* Shipping & Returns Modal */}
      <Dialog open={shippingModal} onOpenChange={setShippingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Shipping & Returns</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Shipping Information</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Standard shipping typically takes 3-5 business days within Pakistan. All orders are carefully packaged to ensure safe delivery.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Returns Policy</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We take good care of our customers and every defected piece is returned. Each item is crafted with care and quality assurance. You can contact us at our instagram page incase of any issue.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Care Guide Modal */}
      <Dialog open={careGuideModal} onOpenChange={setCareGuideModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Jewelry Care Guide</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Proper care ensures your jewelry maintains its beauty and longevity. Follow these guidelines to keep your pieces in pristine condition.
            </p>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">General Care</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Store jewelry in a dry, clean place away from direct sunlight</li>
                <li>• Keep pieces separated to prevent scratching</li>
                <li>• Remove jewelry before swimming, exercising, or showering</li>
                <li>• Apply perfumes and lotions before putting on jewelry</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Cleaning Instructions</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use a soft, lint-free cloth to gently polish after each wear</li>
                <li>• Clean with mild soap and warm water when needed</li>
                <li>• Avoid harsh chemicals and abrasive materials</li>
                <li>• Dry thoroughly before storing</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Storage Tips</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use individual pouches or compartments for each piece</li>
                <li>• Keep chains and necklaces fastened to prevent tangling</li>
                <li>• Store in a jewelry box with soft lining</li>
                <li>• Consider anti-tarnish strips for long-term storage</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
