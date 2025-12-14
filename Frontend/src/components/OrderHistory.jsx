import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../config/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authUser] = useAuth();

  useEffect(() => {
    if (authUser) {
      console.log("User authenticated, fetching orders for:", authUser.email);
      fetchOrders();
    } else {
      console.log("No user authenticated");
      setLoading(false);
    }
  }, [authUser]);

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders...");
      const res = await api.get("/order/my/list");
      console.log("Orders response:", res.data);
      console.log("Orders count:", res.data?.length);
      console.log("Orders data:", JSON.stringify(res.data, null, 2));
      
      const ordersData = Array.isArray(res.data) ? res.data : [];
      console.log("Setting orders:", ordersData.length);
      setOrders(ordersData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      console.error("Error response:", error.response);
      if (error.response?.status === 401) {
        toast.error("Vui lòng đăng nhập để xem đơn hàng");
      } else {
        toast.error(error.response?.data?.message || "Không thể tải lịch sử đơn hàng");
      }
      setOrders([]);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'badge-warning',
      'Processing': 'badge-info',
      'Shipped': 'badge-primary',
      'Delivered': 'badge-success',
      'Cancelled': 'badge-error'
    };
    return colors[status] || 'badge-ghost';
  };

  const getStatusText = (status) => {
    const texts = {
      'Pending': 'Chờ xử lý',
      'Processing': 'Đang xử lý',
      'Shipped': 'Đang giao',
      'Delivered': 'Đã giao',
      'Cancelled': 'Đã hủy'
    };
    return texts[status] || status;
  };

  // Debug: Log orders when they change (must be before any conditional returns)
  useEffect(() => {
    console.log("Orders state updated:", orders.length, orders);
  }, [orders]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen container mx-auto px-4 md:px-20 py-10 mt-20">
        <h1 className="text-3xl font-bold mb-8">
          Lịch sử đơn hàng {orders.length > 0 && `(${orders.length})`}
        </h1>

        {!loading && orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Bạn chưa có đơn hàng nào
            </p>
            <Link 
              to="/book" 
              className="btn btn-primary"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : !loading && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="card bg-base-100 shadow-xl dark:bg-slate-800"
              >
                <div className="card-body">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="card-title text-lg">
                        Đơn hàng #{order._id.slice(-8)}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`badge ${getStatusColor(order.status)} badge-lg`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="divider"></div>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <Link
                        key={index}
                        to={`/book/${item._id || item.bookId || index}`}
                        className="flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors"
                      >
                        <img
                          src={
                            item.image 
                              ? (item.image.startsWith('http') 
                                  ? item.image 
                                  : item.image.startsWith('/') 
                                    ? `http://localhost:4001${item.image}`
                                    : `http://localhost:4001/images/${item.image}`)
                              : 'https://via.placeholder.com/64?text=No+Image'
                          }
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.quantity} x {item.price.toLocaleString()}đ
                          </p>
                        </div>
                        <p className="font-semibold">
                          {(item.quantity * item.price).toLocaleString()}đ
                        </p>
                      </Link>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="divider"></div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Địa chỉ: {order.address}
                      </p>
                      {order.note && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Ghi chú: {order.note}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tổng cộng
                      </p>
                      <p className="text-2xl font-bold text-pink-500">
                        {order.total.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <Footer />
    </>
  );
}

export default OrderHistory;

