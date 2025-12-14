import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import toast from "react-hot-toast";
import api from "../config/api";

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash"); // "cash" or "vnpay"
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    address: "",
    note: ""
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống!');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order first
      const orderData = {
        ...formData,
        items: cartItems,
        total: total,
        status: "Pending"
      };

      console.log("Creating order with data:", {
        fullname: orderData.fullname,
        phone: orderData.phone,
        address: orderData.address,
        itemsCount: orderData.items.length,
        total: orderData.total
      });

      const orderResponse = await api.post("/order", orderData);
      console.log("Order created response:", orderResponse.data);
      
      if (!orderResponse.data || !orderResponse.data._id) {
        throw new Error("Order không được tạo thành công");
      }
      
      const orderId = orderResponse.data._id;
      console.log("Order ID:", orderId);

      // Handle payment based on selected method
      if (paymentMethod === "vnpay") {
        // Create VnPay payment
        console.log("Creating VnPay payment for order:", orderId);
        const paymentResponse = await api.post("/payment/vnpay/create", {
          orderId: orderId,
          amount: total,
          orderInfo: `Thanh toan don hang #${orderId}`
        });

        console.log("Payment response:", paymentResponse.data);
        
        if (!paymentResponse.data || !paymentResponse.data.paymentUrl) {
          throw new Error("Không thể tạo URL thanh toán VNPAY");
        }

        // Redirect to VnPay
        // Cart will be cleared in PaymentSuccess component after successful payment
        window.location.href = paymentResponse.data.paymentUrl;
      } else {
        // Cash on delivery - create payment record
        await api.post("/payment", {
          orderId: orderId,
          paymentMethod: "Cash",
          amount: total
        });
      
      localStorage.removeItem('cart');
      toast.success('Đặt hàng thành công!');
      navigate("/book");
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để đặt hàng');
        navigate('/');
      } else {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
      }
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen container mx-auto px-4 md:px-20 py-10 mt-20">
        <h1 className="text-2xl font-bold text-white mb-6">Thanh toán</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form thông tin */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Họ tên</label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Địa chỉ</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  rows="3"
                />
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-white mb-3 font-semibold">Phương thức thanh toán</label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all bg-gray-800 hover:bg-gray-700"
                    style={{ borderColor: paymentMethod === 'cash' ? '#ec4899' : '#4b5563' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-5 h-5 text-pink-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-white">💰 Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-gray-400">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all bg-gray-800 hover:bg-gray-700"
                    style={{ borderColor: paymentMethod === 'vnpay' ? '#ec4899' : '#4b5563' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vnpay"
                      checked={paymentMethod === "vnpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-5 h-5 text-pink-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-white">💳 Thanh toán online qua VnPay</div>
                      <div className="text-sm text-gray-400">Thanh toán an toàn qua cổng VnPay</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                  isProcessing
                    ? 'bg-gray-500 cursor-not-allowed text-white'
                    : paymentMethod === 'vnpay'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isProcessing ? 'Đang xử lý...' : paymentMethod === 'vnpay' ? 'Thanh toán qua VnPay' : 'Đặt hàng'}
              </button>
            </form>
          </div>

          {/* Thông tin đơn hàng */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img
                      src={`http://localhost:4001${item.image}`}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                      }}
                    />
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                  <p>{item.price * item.quantity}Đ</p>
                </div>
              ))}
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(total)}₫</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Phí vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-pink-500 dark:text-pink-400 pt-2 border-t">
                  <span>Tổng tiền:</span>
                  <span>{formatPrice(total)}₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Checkout; 