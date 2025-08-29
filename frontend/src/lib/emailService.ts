import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  trackingNumber?: string;
  orderDate: string;
  orderItems: Array<{
    title: string;
    price: number;
    quantity: number;
    image: string;
    total: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  orderStatus: string;
  estimatedDelivery?: string;
  courierCompany?: string;
}

// Generate order confirmation email HTML
const generateOrderConfirmationHTML = (data: OrderEmailData): string => {
  const itemsHTML = data.orderItems.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 15px; vertical-align: top;">
        <img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
      </td>
      <td style="padding: 15px; vertical-align: top;">
        <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${item.title}</div>
        <div style="color: #666; font-size: 14px;">Quantity: ${item.quantity}</div>
        <div style="color: #666; font-size: 14px;">Price: Rs. ${item.price.toFixed(0)}</div>
      </td>
      <td style="padding: 15px; text-align: right; vertical-align: top;">
        <div style="font-weight: 600; color: #333;">Rs. ${item.total.toFixed(0)}</div>
      </td>
    </tr>
  `).join('');

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Order Confirmation</h1>
        <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Thank you for your order, ${data.customerName}!</p>
      </div>

      <!-- Order Details -->
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #667eea;">
          <h2 style="margin: 0 0 15px; color: #333; font-size: 20px;">Order Information</h2>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #666;">Order ID:</span>
            <span style="font-weight: 600; color: #333;">#${data.orderId}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #666;">Order Date:</span>
            <span style="font-weight: 600; color: #333;">${data.orderDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #666;">Status:</span>
            <span style="font-weight: 600; color: #28a745;">${data.orderStatus}</span>
          </div>
          ${data.trackingNumber ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #666;">Tracking Number:</span>
            <span style="font-weight: 600; color: #333; background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${data.trackingNumber}</span>
          </div>
          ` : ''}
          ${data.estimatedDelivery ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #666;">Estimated Delivery:</span>
            <span style="font-weight: 600; color: #333;">${data.estimatedDelivery}</span>
          </div>
          ` : ''}
          ${data.courierCompany ? `
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Courier:</span>
            <span style="font-weight: 600; color: #333;">${data.courierCompany}</span>
          </div>
          ` : ''}
        </div>

        <!-- Order Items -->
        <h2 style="margin: 0 0 20px; color: #333; font-size: 20px;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #333;">Product</th>
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #333;">Details</th>
              <th style="padding: 15px; text-align: right; font-weight: 600; color: #333;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <!-- Order Summary -->
        <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px; color: #333; font-size: 18px;">Order Summary</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #666;">Subtotal:</span>
            <span style="color: #333;">Rs. ${data.subtotal.toFixed(0)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #666;">Shipping:</span>
            <span style="color: #333;">Rs. ${data.shipping.toFixed(0)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="color: #666;">Tax:</span>
            <span style="color: #333;">Rs. ${data.tax.toFixed(0)}</span>
          </div>
          <hr style="border: none; border-top: 2px solid #667eea; margin: 15px 0;">
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700;">
            <span style="color: #333;">Total:</span>
            <span style="color: #667eea;">Rs. ${data.totalAmount.toFixed(0)}</span>
          </div>
        </div>

        <!-- Shipping Address -->
        <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px; color: #333; font-size: 18px;">Shipping Address</h3>
          <div style="color: #666; line-height: 1.6;">
            ${data.customerName}<br>
            ${data.shippingAddress.street}<br>
            ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}<br>
            ${data.shippingAddress.country}
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
            Thank you for choosing Ayosi! We appreciate your business.
          </p>
          <p style="margin: 0; color: #999; font-size: 12px;">
            If you have any questions about your order, please contact our customer service team.
          </p>
        </div>
      </div>
    </div>
  `;
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (orderData: OrderEmailData): Promise<boolean> => {
  try {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS configuration missing. Please check your environment variables.');
      return false;
    }

    // Validate required fields
    if (!orderData.customerEmail || !orderData.customerName) {
      console.error('❌ Missing required email data:', { 
        customerEmail: orderData.customerEmail, 
        customerName: orderData.customerName 
      });
      return false;
    }

    // Create simplified template parameters (avoid large HTML)
    const templateParams = {
      // EmailJS recipient settings
      to_email: orderData.customerEmail,
      to_name: orderData.customerName,
      from_name: 'Ayosi',
      from_email: 'noreply@ayosi.com', // Add sender email
      reply_to: 'ayosi.pk@gmail.com', // Add reply-to
      subject: `Order Confirmation - #${orderData.orderId}`,
      
      // Order details
      order_id: orderData.orderId,
      customer_name: orderData.customerName,
      order_date: orderData.orderDate,
      order_status: orderData.orderStatus,
      tracking_number: orderData.trackingNumber || 'Will be provided soon',
      
      // Amounts with Rs. prefix and no decimals
      total_amount: `Rs. ${Math.round(orderData.totalAmount)}`,
      subtotal: `Rs. ${Math.round(orderData.subtotal)}`,
      shipping_cost: `Rs. ${Math.round(orderData.shipping)}`,
      tax_amount: `Rs. ${Math.round(orderData.tax)}`,
      
      // Delivery info
      estimated_delivery: orderData.estimatedDelivery || 'To be confirmed',
      courier_company: orderData.courierCompany || 'To be assigned',
      
      // Items as simple text
      order_items_text: orderData.orderItems.map(item => 
        `• ${item.title} (Qty: ${item.quantity}) - Rs. ${item.total.toFixed(0)}`
      ).join('\n'),
      
      // Address as simple text
      shipping_address: `${orderData.customerName}\n${orderData.shippingAddress.street}\n${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode}\n${orderData.shippingAddress.country}`,
      
      // Payment method
      payment_method: orderData.paymentMethod,
      
      // Simple message
      message: `Thank you for your order! Your order #${orderData.orderId} has been confirmed and will be processed soon.`,
      
      // Store info
      store_name: 'Ayosi',
      support_message: 'If you have any questions about your order, please contact our customer service team.'
    };

    console.log('📧 Sending order confirmation email to:', orderData.customerEmail);
    console.log('📋 Template params validation:', {
      to_email: templateParams.to_email,
      to_name: templateParams.to_name,
      subject: templateParams.subject,
      order_id: templateParams.order_id
    });
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Email sent successfully:', response.status, response.text);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error details:', error);
    }
    
    return false;
  }
};

// Send order status update email
export const sendOrderStatusUpdateEmail = async (orderData: Partial<OrderEmailData>): Promise<boolean> => {
  try {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS configuration missing.');
      return false;
    }

    const templateParams = {
      to_email: orderData.customerEmail,
      to_name: orderData.customerName,
      from_name: 'Ayosi',
      subject: `Order Update - #${orderData.orderId}`,
      
      // Order details
      order_id: orderData.orderId,
      customer_name: orderData.customerName,
      order_status: orderData.orderStatus,
      tracking_number: orderData.trackingNumber || 'Not assigned yet',
      estimated_delivery: orderData.estimatedDelivery || 'To be confirmed',
      courier_company: orderData.courierCompany || 'To be assigned',
      
      // Update message
      message: `Your order #${orderData.orderId} status has been updated to: ${orderData.orderStatus}`,
      update_message: `Order Status Update: ${orderData.orderStatus}`,
      
      // Store info
      store_name: 'Ayosi',
      support_message: 'If you have any questions about your order, please contact our customer service team.'
    };

    console.log('📧 Sending order status update email to:', orderData.customerEmail);
    console.log('📋 Update template params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Order status update email sent:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Failed to send status update email:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Status update error message:', error.message);
      console.error('Status update error details:', error);
    }
    
    return false;
  }
};

export default {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
};
