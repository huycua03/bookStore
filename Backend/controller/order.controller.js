import Order from "../model/order.model.js";
import Customer from "../model/customer.model.js";
import { sendOrderStatusEmail } from "../services/emailService.js";

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
    try {
        const { fullname, phone, address, note, items, total, status } = req.body;
        const customer = req.user; // Get customer from authenticated user
        
        console.log("Creating order with data:", {
            customerId: customer?._id,
            fullname,
            phone,
            address,
            itemsCount: items?.length,
            total
        });

        // Validate required fields
        if (!fullname || !phone || !address) {
            return res.status(400).json({ 
                message: "Thiếu thông tin bắt buộc: fullname, phone, address" 
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                message: "Giỏ hàng trống" 
            });
        }

        if (!total || total <= 0) {
            return res.status(400).json({ 
                message: "Tổng tiền không hợp lệ" 
            });
        }

        const newOrder = new Order({
            customer: customer?._id || null, // Link to customer if authenticated
            fullname,
            phone,
            address,
            note: note || "",
            items,
            total,
            status: status || "Pending"
        });

        const savedOrder = await newOrder.save();
        console.log("Order created successfully:", savedOrder._id);
        
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Create order error:", error);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            errors: error.errors
        });
        res.status(500).json({ 
            message: error.message || "Không thể tạo đơn hàng",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Lấy danh sách đơn hàng (Admin)
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách đơn hàng của user
export const getMyOrders = async (req, res) => {
    try {
        const customer = req.user;
        console.log("Getting orders for customer:", {
            id: customer._id,
            email: customer.email,
            phone: customer.phone,
            fullname: customer.fullname
        });

        // Build query: First try to match by customer ID, then fallback to phone/fullname
        const queryConditions = [];
        
        // Primary: Match by customer ID (most reliable)
        if (customer._id) {
            queryConditions.push({ customer: customer._id });
        }
        
        // Fallback: Also match by phone or fullname (for backward compatibility with old orders)
        if (customer.phone || customer.fullname) {
            const orConditions = [];
            if (customer.phone) {
                // Try exact match
                orConditions.push({ phone: customer.phone });
                // Try normalized phone (remove spaces, dashes)
                const normalizedPhone = customer.phone.replace(/[\s\-\(\)]/g, '');
                if (normalizedPhone !== customer.phone) {
                    orConditions.push({ phone: normalizedPhone });
                }
            }
            if (customer.fullname) {
                // Case-insensitive match for fullname
                orConditions.push({ 
                    fullname: { $regex: new RegExp(`^${customer.fullname.trim()}$`, 'i') }
                });
            }
            if (orConditions.length > 0) {
                queryConditions.push({ $or: orConditions });
            }
        }

        // Build final query
        let finalQuery = {};
        if (queryConditions.length === 1) {
            finalQuery = queryConditions[0];
        } else if (queryConditions.length > 1) {
            finalQuery = { $or: queryConditions };
        } else {
            console.log("No matching criteria found for customer");
            return res.status(200).json([]);
        }

        console.log("Query:", JSON.stringify(finalQuery));
        const orders = await Order.find(finalQuery).sort({ orderDate: -1 });
        console.log(`Found ${orders.length} orders`);
        
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error getting my orders:", error);
        res.status(500).json({ message: error.message });
    }
};

// Lấy chi tiết đơn hàng
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const oldOrder = await Order.findById(req.params.id);
        
        if (!oldOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );

        // Send email notification if status changed
        if (oldOrder.status !== status) {
            try {
                // Try to find customer by order.customer (ObjectId) or by email/phone
                let customer = null;
                
                if (order.customer) {
                    customer = await Customer.findById(order.customer);
                }
                
                // If not found by customer ID, try to find by email or phone
                if (!customer) {
                    // Try to find customer by email (if we have email in order)
                    // Or by phone number
                    customer = await Customer.findOne({ 
                        $or: [
                            { phone: order.phone },
                            { fullname: order.fullname }
                        ]
                    });
                }

                if (customer && customer.email) {
                    await sendOrderStatusEmail(
                        customer.email,
                        customer.fullname || order.fullname,
                        order._id.toString(),
                        status,
                        order.orderDate
                    );
                    console.log(`✅ Order status email sent to: ${customer.email}`);
                } else {
                    console.log('⚠️ Customer not found or no email for order:', order._id);
                }
            } catch (emailError) {
                console.error('❌ Error sending order status email:', emailError);
                // Don't fail the order update if email fails
            }
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: error.message });
    }
};

// Xóa đơn hàng
export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
