import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { productsAPI, ordersAPI } from "@/lib/api";
import { SEO } from "@/components/SEO";
import { toast } from "@/hooks/use-toast";
import { Upload, X, Plus, Package, Truck, Clock, CheckCircle, RefreshCw } from "lucide-react";
import { Product } from "@/context/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import PageTransition from "@/components/PageTransition";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Product states
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("Rings");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Orders states
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [courierCompany, setCourierCompany] = useState("");
  const [shipmentDescription, setShipmentDescription] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/admin");
    }
  }, [user, navigate]);

  // Function to refresh products list
  const refreshProducts = async () => {
    setLoadingProducts(true);
    try {
      console.log('🔄 Fetching products for admin dashboard...');
      const response = await productsAPI.getAll();
      console.log('📦 Raw API Response:', response);
      
      // Handle different response formats from backend
      let productsData = [];
      
      if (Array.isArray(response)) {
        // Backend returns products directly as array
        productsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        // Backend returns {success: true, data: products}
        productsData = response.data;
      } else if (response && response.success && Array.isArray(response.data)) {
        // Backend returns {success: true, data: products}
        productsData = response.data;
      }
      
      console.log('📋 Products data to set:', productsData);
      
      if (productsData.length > 0) {
        const apiProducts: Product[] = productsData.map((product: any) => ({
          id: product._id?.toString() || product.id?.toString(),
          _id: product._id?.toString() || product.id?.toString(),
          title: product.title,
          price: product.price,
          category: product.category,
          images: product.images || [],
          description: product.description,
          isFeatured: product.isFeatured || false
        }));
        
        console.log('✅ Setting products in admin:', apiProducts);
        setProducts(apiProducts);
        toast({
          title: "Success",
          description: `Loaded ${apiProducts.length} products`,
          variant: "default",
        });
      } else {
        console.log('❌ No products found');
        setProducts([]);
      }
    } catch (error) {
      console.error("💥 Failed to fetch products:", error);
      setProducts([]);
      toast({
        title: "Error",
        description: "Failed to fetch products from server. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Function to refresh orders list
  const refreshOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await ordersAPI.getAllOrders();
      if (response.success) {
        setOrders(response.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast({
        title: "Failed to fetch orders",
        description: "Please check if the backend is running",
        variant: "destructive"
      });
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    console.log('🚀 AdminDashboard useEffect triggered, user:', user);
    if (user) {
      console.log('👤 User authenticated, fetching data...');
      refreshProducts();
      refreshOrders();
    }
  }, [user]);

  // Calculate total sales excluding shipping fees
  const sales = orders.reduce((a: number, o: any) => {
    // Use subtotal from order if available, otherwise calculate it
    const subtotalAmount = o.subtotal || (o.totalAmount - (o.subtotal >= 5000 ? 0 : 300));
    return a + subtotalAmount;
  }, 0);

  // Order management functions
  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order);
    setOrderStatus(order.status || 'Received');
    setCourierCompany(order.courierCompany || "");
    setShipmentDescription(order.shipmentDescription || "");
    setEstimatedDelivery(order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : "");
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder) return;

    setUpdatingOrder(true);
    try {
      const response = await ordersAPI.updateStatus(selectedOrder._id, {
        status: orderStatus,
        courierCompany,
        shipmentDescription,
        estimatedDelivery: estimatedDelivery || undefined
      });

      if (response.success) {
        toast({
          title: "Order updated successfully",
          description: `Order ${selectedOrder.trackingNumber} has been updated to ${orderStatus}.`,
        });
        
        await refreshOrders();
        setSelectedOrder(null);
        setOrderStatus("");
        setCourierCompany("");
        setShipmentDescription("");
        setEstimatedDelivery("");
      } else {
        throw new Error("Failed to update order");
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      toast({
        title: "Failed to update order",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setUpdatingOrder(false);
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      const response = await ordersAPI.updatePaymentStatus(orderId, paymentStatus);
      
      if (response.success) {
        toast({
          title: "Payment status updated",
          description: `Payment has been ${paymentStatus}`,
        });
        
        await refreshOrders();
        // Update the selected order to reflect the change
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            paymentStatus: paymentStatus
          });
        }
      } else {
        throw new Error("Failed to update payment status");
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
      toast({
        title: "Failed to update payment status",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Received':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'Processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Shipping':
        return <Truck className="h-4 w-4 text-orange-500" />;
      case 'Delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipping':
        return 'bg-orange-100 text-orange-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Product management functions (keeping existing logic)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalImages = existingImages.length + uploadedImages.length + files.length;

    if (totalImages > 5) {
      toast({ title: "Maximum 5 images allowed", variant: "destructive" });
      return;
    }

    const newUploadedImages = [...uploadedImages, ...files];
    setUploadedImages(newUploadedImages);

    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    if (editingProduct) {
      const newExistingImages = [...existingImages];
      const newUploadedImages = [...uploadedImages];
      const newPreviewUrls = [...imagePreviewUrls];

      const isExistingImage = index < existingImages.length;

      if (isExistingImage) {
        newExistingImages.splice(index, 1);
        setExistingImages(newExistingImages);
      } else {
        const uploadedIndex = index - existingImages.length;
        newUploadedImages.splice(uploadedIndex, 1);
        setUploadedImages(newUploadedImages);
      }

      newPreviewUrls.splice(index, 1);
      setImagePreviewUrls(newPreviewUrls);
    } else {
      const newImages = uploadedImages.filter((_, i) => i !== index);
      const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
      setUploadedImages(newImages);
      setImagePreviewUrls(newPreviewUrls);
    }
  };

  const addProduct = async () => {
    if (!title?.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    if (!price || price <= 0) {
      toast({ title: "Valid price is required", variant: "destructive" });
      return;
    }

    if (!description?.trim()) {
      toast({ title: "Description is required", variant: "destructive" });
      return;
    }

    if (!editingProduct && uploadedImages.length === 0) {
      toast({ title: "Please upload at least one image", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', price.toString());
      formData.append('category', category.trim());
      formData.append('isFeatured', isFeatured.toString());

      // Add new uploaded images
      uploadedImages.forEach((file) => {
        formData.append('images', file);
      });

      // For editing, add existing images that should be kept
      if (editingProduct) {
        existingImages.forEach((imageUrl) => {
          formData.append('existingImages', imageUrl);
        });
      }

      let response;
      if (editingProduct) {
        response = await productsAPI.update(editingProduct.id, formData);
        toast({ title: "Product updated successfully!" });
      } else {
        response = await productsAPI.create(formData);
        toast({ title: "Product added successfully!" });
      }

      await refreshProducts();
      clearForm();
    } catch (error: any) {
      console.error('Product operation error:', error);
      
      if (error.response?.data?.message) {
        toast({ 
          title: "Operation failed", 
          description: error.response.data.message,
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: editingProduct ? "Failed to update product" : "Failed to add product", 
          description: "Please check your backend connection and try again",
          variant: "destructive" 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProduct = addProduct;

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setPrice(product.price);
    setCategory(product.category);
    setDescription(product.description || "");
    setIsFeatured(product.isFeatured || false);
    setExistingImages(product.images || []);
    setUploadedImages([]);
    setImagePreviewUrls([]);
  };

  const cancelEdit = () => {
    clearForm();
  };

  const clearForm = () => {
    setEditingProduct(null);
    setTitle("");
    setPrice(0);
    setCategory("Rings");
    setDescription("");
    setIsFeatured(false);
    setUploadedImages([]);
    setImagePreviewUrls([]);
    setExistingImages([]);
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productsAPI.delete(productId);
      toast({ title: "Product deleted successfully" });
      await refreshProducts();
    } catch (error) {
      console.error("Delete product error:", error);
      toast({ 
        title: "Failed to delete product", 
        variant: "destructive" 
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <PageTransition className="pt-16 min-h-screen bg-gray-50">
      <SEO title="Admin Dashboard | Ayosi" description="Manage products, orders and store overview." canonical="/admin/dashboard" />
      <div className="mx-auto max-w-7xl px-4 py-12 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.username}</span>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-gray-600 uppercase tracking-wider">Total Sales</p>
              <p className="text-2xl font-bold text-green-600">Rs. {Math.round(sales)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-gray-600 uppercase tracking-wider">Orders</p>
              <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-gray-600 uppercase tracking-wider">Products</p>
              <p className="text-2xl font-bold text-purple-600">{products.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-gray-600 uppercase tracking-wider">Featured</p>
              <p className="text-2xl font-bold text-orange-600">{products.filter(p => p.isFeatured).length}</p>
            </CardContent>
          </Card>
        </section>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Products Management</TabsTrigger>
            <TabsTrigger value="orders">Orders Management</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Form */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Diamond Ring"
                      className={!title && isSubmitting ? "border-red-500" : ""}
                    />
                  </div>
                  <div>
                    <Label>Price *</Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className={(!price || price <= 0) && isSubmitting ? "border-red-500" : ""}
                    />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Rings">Rings</option>
                      <option value="Necklaces">Necklaces</option>
                      <option value="Earrings">Earrings</option>
                      <option value="Bracelets">Bracelets</option>
                    </select>
                  </div>
                  <div>
                    <Label>Description *</Label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Beautiful handcrafted..."
                      rows={3}
                      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${!description && isSubmitting ? "border-red-500" : ""}`}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                  <div>
                    <Label>Images ({existingImages.length + uploadedImages.length}/5)</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {existingImages.map((url, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img src={url} alt={`Product ${index + 1}`} className="w-full h-20 object-cover rounded border" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {imagePreviewUrls.map((url, index) => (
                        <div key={`new-${index}`} className="relative">
                          <img src={url} alt={`New ${index + 1}`} className="w-full h-20 object-cover rounded border" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => removeImage(existingImages.length + index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {(existingImages.length + uploadedImages.length) < 5 && (
                        <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                          <Upload className="h-6 w-6 text-gray-400" />
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={editingProduct ? updateProduct : addProduct}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Processing..." : editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                    {editingProduct && (
                      <Button variant="secondary" onClick={cancelEdit} className="w-full">
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Products List */}
              <Card>
                <CardHeader>
                  <CardTitle>Manage Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[500px] overflow-auto">
                    {loadingProducts ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading products...</p>
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">No products found</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={refreshProducts}
                        >
                          Refresh Products
                        </Button>
                      </div>
                    ) : (
                      products.map((p) => (
                        <div key={p.id} className="flex items-center justify-between border rounded-md p-3 hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={`${p.title} thumbnail`}
                              className="h-12 w-12 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://dummyimage.com/48x48/cccccc/000000.png&text=No+Image';
                              }}
                            />
                            <div>
                              <p className="text-sm font-medium">{p.title || 'Untitled Product'}</p>
                              <p className="text-xs text-gray-600 flex items-center gap-2">
                                Rs. {Math.round(p.price || 0)} • {p.category} 
                                {p.isFeatured && <Badge className="text-xs">Featured</Badge>}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditProduct(p)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteProduct(p.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Orders List */}
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>All Orders</CardTitle>
                    <Button onClick={refreshOrders} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingOrders ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No orders found</p>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-auto">
                        {orders.map((order) => (
                          <div
                            key={order._id}
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                              selectedOrder?._id === order._id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleOrderSelect(order)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(order.status)}
                                <span className="font-mono text-sm font-medium">{order.trackingNumber}</span>
                              </div>
                              <div className="flex gap-1">
                                <Badge className={`${getStatusColor(order.status)} border-0 text-xs`}>
                                  {order.status}
                                </Badge>
                                <Badge 
                                  variant={order.paymentMethod === 'bank_transfer' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {order.paymentMethod === 'bank_transfer' ? 'Transfer' : 'COD'}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p><strong>{order.customerName}</strong> • {order.email}</p>
                              <div className="flex items-center justify-between">
                                <span>Rs. {order.totalAmount.toFixed(2)} • {order.orderItems.length} item(s)</span>
                                {order.paymentMethod === 'bank_transfer' && (
                                  <Badge 
                                    variant={
                                      order.paymentStatus === 'verified' ? 'default' : 
                                      order.paymentStatus === 'rejected' ? 'destructive' : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {order.paymentStatus || 'pending'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Details & Update */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedOrder ? 'Update Order Status' : 'Select an Order'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!selectedOrder ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Click on an order from the list to view details and update status
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium">{selectedOrder.customerName || 'Unknown Customer'}</p>
                          <p className="text-sm text-gray-600">{selectedOrder.email || 'No email'}</p>
                          <p className="text-xs text-gray-500 font-mono">{selectedOrder.trackingNumber || 'No tracking number'}</p>
                        </div>

                        <Separator />

                        {/* Payment Information */}
                        <div className="space-y-3">
                          <h4 className="font-medium">Payment Information</h4>
                          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Payment Method:</span>
                              <Badge variant={selectedOrder.paymentMethod === 'bank_transfer' ? 'default' : 'secondary'}>
                                {selectedOrder.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
                              </Badge>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Payment Status:</span>
                              <Badge 
                                variant={
                                  selectedOrder.paymentStatus === 'verified' ? 'default' : 
                                  selectedOrder.paymentStatus === 'rejected' ? 'destructive' : 'secondary'
                                }
                              >
                                {selectedOrder.paymentStatus || 'pending'}
                              </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Total Amount:</span>
                              <span className="font-semibold">Rs. {selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                            </div>

                            {selectedOrder.paymentMethod === 'bank_transfer' && (
                              <>
                                {selectedOrder.selectedAccount && (
                                  <div>
                                    <span className="text-sm font-medium">Selected Account:</span>
                                    <p className="text-sm text-gray-600">{selectedOrder.selectedAccount}</p>
                                  </div>
                                )}
                                
                                {selectedOrder.paymentDetails && (
                                  <div>
                                    <span className="text-sm font-medium">Account Details:</span>
                                    <div className="text-sm text-gray-600">
                                      <p>Account: {selectedOrder.paymentDetails.accountName}</p>
                                      <p>Number: {selectedOrder.paymentDetails.accountNumber}</p>
                                      <p>Holder: {selectedOrder.paymentDetails.accountHolder}</p>
                                    </div>
                                  </div>
                                )}

                                {selectedOrder.transactionProof && (
                                  <div>
                                    <span className="text-sm font-medium">Transaction Proof:</span>
                                    <div className="mt-2">
                                      <img
                                        src={selectedOrder.transactionProof}
                                        alt="Transaction Proof"
                                        className="max-w-full h-32 object-contain border rounded cursor-pointer"
                                        onClick={() => window.open(selectedOrder.transactionProof, '_blank')}
                                      />
                                      <p className="text-xs text-gray-500 mt-1">Click to view full size</p>
                                    </div>
                                  </div>
                                )}

                                {selectedOrder.paymentStatus === 'pending' && (
                                  <div className="flex gap-2 mt-3">
                                    <Button
                                      size="sm"
                                      onClick={() => updatePaymentStatus(selectedOrder._id, 'verified')}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Verify Payment
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updatePaymentStatus(selectedOrder._id, 'rejected')}
                                    >
                                      Reject Payment
                                    </Button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div>
                            <Label>Order Status</Label>
                            <Select value={orderStatus} onValueChange={setOrderStatus}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Received">Received</SelectItem>
                                <SelectItem value="Processing">Processing</SelectItem>
                                <SelectItem value="Shipping">Shipping</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Courier Company</Label>
                            <Input
                              value={courierCompany}
                              onChange={(e) => setCourierCompany(e.target.value)}
                              placeholder="e.g., FedEx, UPS, DHL"
                            />
                          </div>

                          <div>
                            <Label>Estimated Delivery</Label>
                            <Input
                              type="date"
                              value={estimatedDelivery}
                              onChange={(e) => setEstimatedDelivery(e.target.value)}
                            />
                          </div>

                          <div>
                            <Label>Shipment Description</Label>
                            <Textarea
                              value={shipmentDescription}
                              onChange={(e) => setShipmentDescription(e.target.value)}
                              placeholder="Add details about the shipment, tracking info, or special instructions..."
                              rows={3}
                            />
                          </div>

                          <Button
                            onClick={updateOrderStatus}
                            disabled={updatingOrder}
                            className="w-full"
                          >
                            {updatingOrder ? "Updating..." : "Update Order Status"}
                          </Button>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-2">Order Items</h4>
                          <div className="space-y-2">
                            {selectedOrder?.orderItems?.map((item: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <img
                                  src={item.image || '/placeholder.svg'}
                                  alt={item.title || 'Product'}
                                  className="h-8 w-8 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">{item.title || 'Untitled Product'}</p>
                                  <p className="text-gray-600">Qty: {item.quantity || 1} • Rs. {Math.round(item.price || 0)}</p>
                                </div>
                              </div>
                            )) || <p className="text-gray-500 text-sm">No items found</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
