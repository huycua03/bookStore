import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Lấy giỏ hàng từ localStorage khi component mount
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const removeFromCart = (bookId) => {
    const updatedCart = cartItems.filter(item => item._id !== bookId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity < 0) return; // Ngăn số lượng âm
    
    if (newQuantity === 0) {
      // Nếu số lượng = 0, xóa sản phẩm khỏi giỏ hàng
      const updatedCart = cartItems.filter(item => item._id !== bookId);
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      // Nếu số lượng > 0, cập nhật số lượng
      const updatedCart = cartItems.map(item => {
        if (item._id === bookId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen container mx-auto px-4 md:px-20 py-10 mt-20">
        <h1 className="text-2xl font-bold text-white mb-6">Giỏ hàng</h1>
        
        {cartItems.length === 0 ? (
          <p className="text-white">Giỏ hàng trống</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-6 py-3 text-left">Sản phẩm</th>
                    <th className="px-6 py-3 text-left">Giá</th>
                    <th className="px-6 py-3 text-left">Số lượng</th>
                    <th className="px-6 py-3 text-left">Tổng</th>
                    <th className="px-6 py-3 text-left">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id} className="border-b dark:border-gray-600">
                      <td className="px-6 py-4 flex items-center gap-4">
                        <img 
                          src={`http://localhost:4001${item.image}`}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                          }}
                        />
                        <span>{item.title}</span>
                      </td>
                      <td className="px-6 py-4">{item.price}Đ</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="px-2 py-1 bg-gray-200 rounded"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="px-2 py-1 bg-gray-200 rounded"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">{item.price * item.quantity}Đ</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <p className="text-xl font-semibold mb-4">
                  Tổng tiền: {total}Đ
                </p>
                <button 
                  onClick={() => navigate("/checkout")}
                  className="w-full px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  Thanh toán
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Cart; 