import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../config/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import toast from "react-hot-toast";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/order/my/list");
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải lịch sử đơn hàng");
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
        <h1 className="text-3xl font-bold mb-8">Lịch sử đơn hàng</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
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
        ) : (
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
                      <div key={index} className="flex items-center gap-4">
                        <img
                          src={`http://localhost:4001${item.image}`}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.quantity} x {item.price.toLocaleString()}đ
                          </p>
                        </div>
                        <p className="font-semibold">
                          {(item.quantity * item.price).toLocaleString()}đ
                        </p>
                      </div>
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
        )}
      </div>
      <Footer />
    </>
  );
}

export default OrderHistory;

