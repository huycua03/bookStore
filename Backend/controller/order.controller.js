import Order from "../model/order.model.js";

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
    try {
        const { fullname, phone, address, note, items, total, status } = req.body;
        
        const newOrder = new Order({
            fullname,
            phone,
            address,
            note,
            items,
            total,
            status
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ message: error.message });
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
        // In the order schema, we don't have customer reference, but we have fullname, phone, address
        // We'll need to match by email from customer data
        const customer = req.user;
        const orders = await Order.find({ 
            $or: [
                { phone: customer.phone },
                { fullname: customer.fullname }
            ]
        }).sort({ orderDate: -1 });
        
        res.status(200).json(orders);
    } catch (error) {
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
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(order);
    } catch (error) {
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
