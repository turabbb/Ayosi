import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEO } from "@/components/SEO";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ordersAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader2, Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PageTransition from "@/components/PageTransition";

const useQuery = () => new URLSearchParams(useLocation().search);

const TrackOrder = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const q = useQuery();

  useEffect(() => {
    const ref = q.get("ref");
    if (ref && !order && !loading) {
      setTrackingNumber(ref);
      handleSearch(ref);
    }
  }, [q]);

  const handleSearch = async (trackingNum?: string) => {
    const searchTerm = trackingNum || trackingNumber.trim();
    
    if (!searchTerm) {
      toast({
        title: "Please enter a tracking number",
        variant: "destructive"
      });
      return;
    }

    // Prevent duplicate searches
    if (loading) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      // First try to get from backend
      const response = await ordersAPI.getByTrackingNumber(searchTerm);
      
      if (response.success) {
        setOrder(response.order);
        setLoading(false);
        return;
      }
    } catch (error: any) {
      console.log("Backend search failed, trying localStorage:", error);
    }

    // If backend fails, try localStorage
    try {
      const localOrders = JSON.parse(localStorage.getItem("jewel_orders") || "[]");
      const localOrder = localOrders.find((o: any) => o.id === searchTerm);
      
      if (localOrder) {
        // Convert localStorage order to backend format
        const convertedOrder = {
          trackingNumber: localOrder.id,
          customerName: localOrder.customer?.name || "Unknown Customer",
          email: localOrder.customer?.email || "unknown@email.com",
          phone: localOrder.customer?.phone || "N/A",
          shippingAddress: localOrder.customer?.address || "N/A",
          city: localOrder.customer?.city || "N/A",
          zip: localOrder.customer?.zip || "N/A",
          totalAmount: localOrder.total || 0,
          status: localOrder.status || "Processing",
          createdAt: localOrder.createdAt || new Date().toISOString(),
          orderItems: localOrder.items?.map((item: any) => ({
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })) || [],
          courierCompany: "",
          shipmentDescription: "",
          statusHistory: []
        };
        
        setOrder(convertedOrder);
        setLoading(false);
        return;
      }
    } catch (localError) {
      console.error("localStorage search error:", localError);
    }

    // If not found anywhere
    setError("Order not found with this tracking number");
    setLoading(false);
  };

  // Add proper cleanup for loading state
  useEffect(() => {
    const cleanup = () => {
      setLoading(false);
    };

    return cleanup;
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Received':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'Processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Shipping':
        return <Truck className="h-5 w-5 text-orange-500" />;
      case 'Delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <PageTransition className="pt-16 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SEO title="Track Your Order | Ayosi" description="Enter your tracking number to view your order status and estimated delivery." canonical="/track-order" />
      
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 lg:px-16 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your tracking number to see the latest updates on your jewelry order</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input 
                placeholder="Enter tracking number (e.g., AYOSI-12345678-ABCD)" 
                value={trackingNumber} 
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
                disabled={loading}
              />
              <Button 
                onClick={() => handleSearch()} 
                disabled={loading || !trackingNumber.trim()}
                className="px-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Track Order'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-600 text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">Order Details</CardTitle>
                    <p className="text-gray-200">Tracking Number: <span className="font-mono font-medium">{order.trackingNumber}</span></p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} border-0`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{order.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{order.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 mt-1" />
                      <div>
                        <p>{order.shippingAddress}</p>
                        <p>{order.city}, {order.zip}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p><span className="font-medium">Order Date:</span> {formatDate(order.createdAt)}</p>
                    <p><span className="font-medium">Total Amount:</span> <span className="text-xl font-bold text-green-600">Rs. {Math.round(order.totalAmount)}</span></p>
                    {order.estimatedDelivery && (
                      <p><span className="font-medium">Estimated Delivery:</span> {formatDateOnly(order.estimatedDelivery)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            {order.courierCompany && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p><span className="font-medium">Courier Company:</span> {order.courierCompany}</p>
                    {order.shipmentDescription && (
                      <div>
                        <p className="font-medium mb-2">Shipment Details:</p>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{order.shipmentDescription}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.orderItems.map((item: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="h-16 w-16 object-cover rounded-lg border"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-gray-900 font-medium">Rs. {Math.round(item.price)} each</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">Rs. {Math.round(item.price * item.quantity)}</p>
                        </div>
                      </div>
                      {index < order.orderItems.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status History */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Tracking History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(order.statusHistory && order.statusHistory.length > 0 ? order.statusHistory : [{
                    status: order.status || 'Received',
                    description: 'Order placed',
                    timestamp: order.createdAt
                  }]).slice().reverse().map((history: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 pb-4 border-l-2 border-gray-200 pl-4 ml-2 last:border-l-0">
                      <div className="bg-white border-2 border-gray-200 rounded-full p-1 -ml-6">
                        {getStatusIcon(history.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${getStatusColor(history.status)} border-0 text-xs`}>
                            {history.status}
                          </Badge>
                          <span className="text-sm text-gray-500">{formatDate(history.timestamp)}</span>
                        </div>
                        {history.description && (
                          <p className="text-gray-600 text-sm">{history.description}</p>
                        )}
                        {history.courierCompany && (
                          <p className="text-gray-500 text-xs">via {history.courierCompany}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        {!order && !loading && (
          <Card className="mt-8 shadow-lg">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                If you're having trouble finding your order, please contact our customer support team.
              </p>
              <p className="text-sm text-gray-500">
                Your tracking number was provided in your order confirmation email.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};

export default TrackOrder;
