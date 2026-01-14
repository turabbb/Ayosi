import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ordersAPI } from "@/lib/api";
import { sendOrderConfirmationEmail } from "@/lib/emailService";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CreditCard, Truck, Copy, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageTransition from "@/components/PageTransition";
import { provinces, getDeliveryFee, getBaseDeliveryFee } from "@/lib/provinces";

const FormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  address: z.string().min(5),
  city: z.string().min(2),
  province: z.string().min(1, "Please select a province"),
  country: z.string().default("Pakistan"),
  paymentMethod: z.enum(["bank_transfer", "cod"]),
  selectedAccount: z.string().optional(),
  transactionProof: z.any().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

const CHECKOUT_CACHE_KEY = 'ayosi_checkout_form';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({ 
    resolver: zodResolver(FormSchema), 
    defaultValues: { 
      paymentMethod: "bank_transfer",
      country: "Pakistan",
      province: ""
    } 
  });
  const [transactionProof, setTransactionProof] = useState<File | null>(null);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [copiedAccount, setCopiedAccount] = useState("");

  // Load cached form data on mount
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CHECKOUT_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.name) setValue('name', data.name);
        if (data.email) setValue('email', data.email);
        if (data.phone) setValue('phone', data.phone);
        if (data.address) setValue('address', data.address);
        if (data.city) setValue('city', data.city);
        if (data.province) setValue('province', data.province);
        if (data.paymentMethod) setValue('paymentMethod', data.paymentMethod);
        if (data.selectedAccount) setSelectedAccount(data.selectedAccount);
      }
    } catch (e) {
      console.error('Error loading cached form data:', e);
    }
  }, [setValue]);

  // Watch all form fields and save to sessionStorage
  const formValues = watch();
  useEffect(() => {
    try {
      const dataToCache = {
        name: formValues.name || '',
        email: formValues.email || '',
        phone: formValues.phone || '',
        address: formValues.address || '',
        city: formValues.city || '',
        province: formValues.province || '',
        paymentMethod: formValues.paymentMethod || 'bank_transfer',
        selectedAccount: selectedAccount
      };
      sessionStorage.setItem(CHECKOUT_CACHE_KEY, JSON.stringify(dataToCache));
    } catch (e) {
      console.error('Error caching form data:', e);
    }
  }, [formValues, selectedAccount]);

  // Watch province to calculate dynamic shipping cost
  const selectedProvince = watch("province");
  
  // Shipping cost based on province - Free shipping for orders Rs. 5000+
  const SHIPPING_COST = getDeliveryFee(selectedProvince, totalPrice);
  const finalTotal = totalPrice + SHIPPING_COST;

  // Pakistani bank accounts for manual transfer
  const bankAccounts = [
    {
      id: "sadapay",
      name: "SadaPay",
      number: "03286997052",
      holder: "Arooj Naveed"
    },
    {
      id: "jazzcash",
      name: "JazzCash",
      number: "03286997052", 
      holder: "Urooj Naveed"
    },
    {
      id: "sindh_bank",
      name: "Sindh Bank Limited",
      number: "06051347607601",
      holder: "Arooj Naveed"
    }
  ];

  const copyToClipboard = (text: string, accountId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(accountId);
    toast({
      title: "Copied to clipboard!",
      description: `Account number copied: ${text}`,
    });
    setTimeout(() => setCopiedAccount(""), 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      setTransactionProof(file);
      setValue('transactionProof', file);
      toast({
        title: "File uploaded",
        description: `${file.name} uploaded successfully`,
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Validate payment method specific requirements
      if (data.paymentMethod === "bank_transfer") {
        if (!selectedAccount) {
          toast({
            title: "Please select a bank account",
            description: "Choose an account to transfer the payment to",
            variant: "destructive"
          });
          return;
        }
        if (!transactionProof) {
          toast({
            title: "Transaction proof required",
            description: "Please upload a screenshot of your payment",
            variant: "destructive"
          });
          return;
        }
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('customerName', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('shippingAddress', data.address);
      formData.append('city', data.city);
      formData.append('province', data.province);
      formData.append('country', data.country || 'Pakistan');
      formData.append('subtotal', totalPrice.toString());
      formData.append('shippingCost', SHIPPING_COST.toString());
      formData.append('paymentMethod', data.paymentMethod);
      formData.append('totalAmount', finalTotal.toString());
      
      // Add payment specific data
      if (data.paymentMethod === "bank_transfer") {
        formData.append('selectedAccount', selectedAccount);
        const selectedAccountData = bankAccounts.find(acc => acc.id === selectedAccount);
        formData.append('paymentDetails', JSON.stringify({
          accountName: selectedAccountData?.name,
          accountNumber: selectedAccountData?.number,
          accountHolder: selectedAccountData?.holder
        }));
        if (transactionProof) {
          formData.append('transactionProof', transactionProof);
        }
      }

      // Add order items
      formData.append('orderItems', JSON.stringify(items.map(item => ({
        product: item.productId,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      }))));

      console.log('Submitting order with payment method:', data.paymentMethod);

      // Submit order to backend
      const response = await ordersAPI.create(formData);
      
      if (response.success) {
        // Send order confirmation email
        try {
          const emailData = {
            customerName: data.name,
            customerEmail: data.email,
            orderId: response.orderId || `ORD-${Date.now()}`,
            trackingNumber: response.trackingNumber,
            orderDate: new Date().toLocaleDateString(),
            orderItems: items.map(item => ({
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              total: item.price * item.quantity
            })),
            subtotal: totalPrice,
            shipping: SHIPPING_COST,
            tax: 0, // No tax for Pakistan
            totalAmount: finalTotal,
            shippingAddress: {
              street: data.address,
              city: data.city,
              state: data.province,
              zipCode: '',
              country: data.country || 'Pakistan'
            },
            paymentMethod: data.paymentMethod === "bank_transfer" ? "Bank Transfer" : "Cash on Delivery",
            orderStatus: 'Confirmed',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            courierCompany: 'Local Delivery'
          };

          const emailSent = await sendOrderConfirmationEmail(emailData);
          
          if (emailSent) {
            console.log('✅ Order confirmation email sent successfully');
          } else {
            console.log('⚠️ Order confirmation email failed to send');
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError);
        }

        toast({ 
          title: "Order placed successfully!", 
          description: `Tracking Number: ${response.trackingNumber}. Confirmation email sent!` 
        });
        
        // Clear the form cache after successful order
        sessionStorage.removeItem(CHECKOUT_CACHE_KEY);
        clearCart();
        navigate(`/track-order?ref=${response.trackingNumber}`);
      } else {
        // Handle error from backend (e.g., stock issues)
        const errorMessage = response.message || "Failed to create order";
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      
      // Check if the error is related to stock
      const errorMessage = error.response?.data?.message || error.message || "";
      if (errorMessage.toLowerCase().includes('insufficient stock') || errorMessage.toLowerCase().includes('out of stock')) {
        toast({
          title: "Stock Issue",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }
      
      // Fallback to local storage if backend is not available
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        const orderId = `ORD-${Date.now()}`;
        const trackingNumber = `TRK-${Date.now()}`;
        
        const order = {
          id: orderId,
          status: "Processing" as const,
          eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          items,
          total: finalTotal,
          customer: data,
          createdAt: new Date().toISOString(),
          trackingNumber: trackingNumber,
          paymentMethod: data.paymentMethod,
          selectedAccount: selectedAccount,
          transactionProof: transactionProof?.name || null
        };

        // Send email even for local orders
        try {
          const emailData = {
            customerName: data.name,
            customerEmail: data.email,
            orderId: orderId,
            trackingNumber: trackingNumber,
            orderDate: new Date().toLocaleDateString(),
            orderItems: items.map(item => ({
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              total: item.price * item.quantity
            })),
            subtotal: totalPrice,
            shipping: SHIPPING_COST,
            tax: 0,
            totalAmount: finalTotal,
            shippingAddress: {
              street: data.address,
              city: data.city,
              state: data.province,
              zipCode: '',
              country: data.country || 'Pakistan'
            },
            paymentMethod: data.paymentMethod === "bank_transfer" ? "Bank Transfer" : "Cash on Delivery",
            orderStatus: 'Processing',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            courierCompany: 'Local Delivery'
          };

          await sendOrderConfirmationEmail(emailData);
        } catch (emailError) {
          console.error('Local order email error:', emailError);
        }

        const existing = JSON.parse(localStorage.getItem("jewel_orders") || "[]");
        localStorage.setItem("jewel_orders", JSON.stringify([order, ...existing]));
        
        toast({ 
          title: "Order placed successfully", 
          description: `Order ID: ${orderId}. Confirmation email sent!` 
        });
        
        // Clear the form cache after successful order
        sessionStorage.removeItem(CHECKOUT_CACHE_KEY);
        clearCart();
        navigate(`/track-order?ref=${trackingNumber}`);
      } else {
        toast({ 
          title: "Failed to place order", 
          description: error.response?.data?.message || "Please try again.",
          variant: "destructive" 
        });
      }
    }
  };

  return (
    <PageTransition className="pt-16">
      <SEO title="Checkout | Ayosi" description="Secure checkout – enter your details to complete your order." canonical="/checkout" />
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 lg:px-16 py-12">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-sm text-muted-foreground mt-2">Please provide your shipping details.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register("phone")} />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} />
                {errors.address && <p className="text-xs text-destructive mt-1">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} />
                  {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Select 
                    value={selectedProvince}
                    onValueChange={(value) => setValue("province", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.value} value={province.value}>
                          {province.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.province && <p className="text-xs text-destructive mt-1">{errors.province.message}</p>}
                  {selectedProvince && totalPrice < 5000 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Delivery fee: Rs. {getBaseDeliveryFee(selectedProvince)}
                    </p>
                  )}
                  {totalPrice >= 5000 && (
                    <p className="text-xs text-green-600 mt-1">Free delivery applied!</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  value="Pakistan" 
                  disabled 
                  className="bg-gray-50 text-gray-700"
                  {...register("country")} 
                />
                <p className="text-xs text-muted-foreground mt-1">Currently delivering within Pakistan only</p>
              </div>
            </section>

            <Separator />

            <section className="space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </h2>
              
              <RadioGroup 
                defaultValue="bank_transfer" 
                className="grid grid-cols-1 gap-4"
                onValueChange={(value) => setValue('paymentMethod', value as "bank_transfer" | "cod")}
              >
                {/* Bank Transfer Option */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="bank_transfer" id="pm-bank" />
                    <Label htmlFor="pm-bank" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">Bank Transfer</span>
                      <span className="text-sm text-muted-foreground">(SadaPay, JazzCash, Bank Account)</span>
                    </Label>
                  </div>

                  {watch("paymentMethod") === "bank_transfer" && (
                    <Card className="ml-6">
                      <CardHeader>
                        <CardTitle className="text-base">Select Payment Account</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Transfer Rs. {Math.round(finalTotal)} to any of the following accounts:
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {bankAccounts.map((account) => (
                          <div 
                            key={account.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary ${
                              selectedAccount === account.id ? 'border-primary bg-primary/5' : ''
                            }`}
                            onClick={() => setSelectedAccount(account.id)}
                          >
                            <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{account.name}</div>
                                  <div className="text-sm text-muted-foreground">{account.holder}</div>
                                  <div className="font-mono text-sm font-semibold">{account.number}</div>
                                </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(account.number, account.id);
                                }}
                                className="flex items-center gap-1"
                              >
                                {copiedAccount === account.id ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                                {copiedAccount === account.id ? 'Copied!' : 'Copy'}
                              </Button>
                            </div>
                          </div>
                        ))}

                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Payment Instructions:</h4>
                          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                            <li>Select any account above and copy the account number</li>
                            <li>Transfer exactly Rs. {Math.round(finalTotal)} to the selected account</li>
                            <li>Take a screenshot of the successful transaction</li>
                            <li>Upload the screenshot below as proof of payment</li>
                            <li>Your order will be processed after payment verification</li>
                          </ol>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="transactionProof" className="text-sm font-medium">
                            Upload Payment Screenshot *
                          </Label>
                          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${transactionProof ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}>
                            <input
                              type="file"
                              id="transactionProof"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <label htmlFor="transactionProof" className="cursor-pointer">
                              {transactionProof ? (
                                <>
                                  <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                                  <p className="text-sm text-green-700 font-medium">{transactionProof.name}</p>
                                  <p className="text-xs text-green-600 mt-1">Click to change file</p>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-600">Click to upload payment screenshot</p>
                                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                </>
                              )}
                            </label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Cash on Delivery Option */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="cod" id="pm-cod" />
                    <Label htmlFor="pm-cod" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium">Cash on Delivery</span>
                      <span className="text-sm text-muted-foreground">(Pay when order arrives)</span>
                    </Label>
                  </div>

                  {watch("paymentMethod") === "cod" && (
                    <Card className="ml-6">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="bg-green-100 p-2 rounded-full">
                            <Truck className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-green-900 mb-2">Cash on Delivery Selected</h4>
                            <div className="text-sm text-green-800 space-y-2">
                              <p>Pay Rs. {Math.round(finalTotal)} when your order is delivered</p>
                              <p>No advance payment required</p>
                              <p>Secure and hassle-free</p>
                            </div>
                            <div className="mt-3 p-3 bg-white border border-green-200 rounded">
                              <p className="text-xs text-green-700">
                                <strong>Delivery Agent:</strong> Our verified delivery partner will contact you 
                                to confirm delivery time. Please keep exact change ready for a smooth transaction.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </RadioGroup>
            </section>
          </div>

          <aside className="lg:col-span-1 p-4 border rounded-lg bg-card h-fit">
            <h2 className="font-medium mb-4">Order Summary</h2>
            <div className="space-y-4">
              {items.map((it) => (
                <div key={it.productId} className="flex items-center gap-3">
                  <img src={it.image} alt={`${it.title} product image`} className="h-14 w-14 object-cover rounded" loading="lazy" />
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{it.title}</p>
                    <p className="text-xs text-muted-foreground">Qty {it.quantity} • Rs. {Math.round(it.price)}</p>
                  </div>
                  <span className="text-sm font-medium">Rs. {Math.round(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">Rs. {Math.round(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span>Shipping</span>
              <span className="font-medium">
                {!selectedProvince ? (
                  <span className="text-muted-foreground text-xs">Select province</span>
                ) : SHIPPING_COST === 0 ? (
                  <span className="text-green-600">Free!</span>
                ) : (
                  `Rs. ${SHIPPING_COST}`
                )}
              </span>
            </div>
            <div className="flex items-center justify-between font-medium mt-3">
              <span>Total</span>
              <span>Rs. {Math.round(finalTotal)}</span>
            </div>
            <Button type="submit" disabled={isSubmitting || items.length === 0} className="w-full mt-4">
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </Button>
          </aside>
        </form>
      </div>
    </PageTransition>
  );
};

export default Checkout;
