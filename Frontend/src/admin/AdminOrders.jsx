import { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import api from "../config/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/order");
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/order/${orderId}`, {
        status: newStatus
      });
      
      // Cập nhật state để hiển thị ngay lập tức
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      toast.success('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const statusOptions = [
    'Pending',
    'Paid',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen container mx-auto px-4 md:px-20 py-10 mt-20">
        <h1 className="text-2xl font-bold text-white mb-6">Danh sách đơn hàng</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-6 py-3 text-left">Mã đơn hàng</th>
                <th className="px-6 py-3 text-left">Khách hàng</th>
                <th className="px-6 py-3 text-left">Số điện thoại</th>
                <th className="px-6 py-3 text-left">Địa chỉ</th>
                <th className="px-6 py-3 text-left">Tổng tiền</th>
                <th className="px-6 py-3 text-left">Trạng thái</th>
                <th className="px-6 py-3 text-left">Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order._id} className="border-b dark:border-gray-600">
                  <td className="px-6 py-4">{order._id}</td>
                  <td className="px-6 py-4">{order.fullname}</td>
                  <td className="px-6 py-4">{order.phone}</td>
                  <td className="px-6 py-4">{order.address}</td>
                  <td className="px-6 py-4">{order.total}Đ</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`px-2 py-1 rounded border ${
                        order.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                        order.status === 'Paid' ? 'bg-green-200 text-green-800' :
                        order.status === 'Processing' ? 'bg-blue-200 text-blue-800' :
                        order.status === 'Shipped' ? 'bg-purple-200 text-purple-800' :
                        order.status === 'Delivered' ? 'bg-green-200 text-green-800' :
                        'bg-red-200 text-red-800'
                      }`}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                currentPage === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Trước
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                currentPage === totalPages
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Sau
            </button>
          </div>
        )}

        <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Trang {currentPage} / {totalPages} - Tổng {orders.length} đơn hàng
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminOrders; 