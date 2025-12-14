import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../config/api";
import { useAuth } from "../context/AuthProvider";

function Cards({ item }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isCheckingWishlist, setIsCheckingWishlist] = useState(false);
  const [authUser] = useAuth();
  const navigate = useNavigate();

  // Check if book is in wishlist
  useEffect(() => {
    if (authUser && item?._id) {
      checkWishlistStatus();
    }
  }, [authUser, item?._id]);

  const checkWishlistStatus = async () => {
    if (!authUser) return;
    
    try {
      setIsCheckingWishlist(true);
      const res = await api.get(`/wishlist/check/${item._id}`);
      setIsInWishlist(res.data.inWishlist);
    } catch (error) {
      // If error, assume not in wishlist
      setIsInWishlist(false);
    } finally {
      setIsCheckingWishlist(false);
    }
  };

  const addToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartItem = {
      _id: item._id,
      title: item.title,
      price: item.price,
      image: item.image,
      quantity: 1
    };

    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = currentCart.findIndex(item => item._id === cartItem._id);
    
    if (existingItemIndex !== -1) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    toast.success('✓ Đã thêm vào giỏ hàng!', { duration: 2000 });
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authUser) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
      navigate('/');
      return;
    }

    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${item._id}`);
        setIsInWishlist(false);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        await api.post('/wishlist', { bookId: item._id });
        setIsInWishlist(true);
        toast.success('Đã thêm vào danh sách yêu thích ❤️');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already')) {
        setIsInWishlist(true);
        toast.error('Sách đã có trong danh sách yêu thích');
      } else {
        toast.error('Không thể cập nhật danh sách yêu thích');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Hết hàng', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    if (stock < 10) return { text: `Còn ${stock}`, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
    return { text: `Còn ${stock}`, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
  };

  const stockStatus = getStockStatus(item.stock);

  return (
    <div 
      className="group relative bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-slate-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/book/${item._id}`} className="block">
        <div className="relative h-72 overflow-hidden bg-gray-100 dark:bg-slate-800">
          <img 
            src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:4001${item.image}`) : 'https://via.placeholder.com/300x400?text=No+Image'}
            alt={item.title || "Book"} 
            className={`w-full h-full object-cover transition-all duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
            }}
          />
          
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}></div>

          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
              {stockStatus.text}
            </span>
            {/* Heart Icon for Wishlist */}
            <button
              onClick={toggleWishlist}
              className={`p-2 rounded-full shadow-lg transition-all duration-300 ${
                isInWishlist
                  ? 'bg-pink-500 text-white hover:bg-pink-600'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-slate-700 hover:text-pink-500'
              }`}
              title={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            >
              {isCheckingWishlist ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill={isInWishlist ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <span className="bg-white dark:bg-slate-800 text-gray-800 dark:text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              👁 Xem chi tiết
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-lg mb-3 line-clamp-2 min-h-[3.5rem] text-gray-800 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
            {item.title}
          </h3>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {formatPrice(item.price)}₫
            </span>
          </div>

          <button 
            onClick={addToCart}
            disabled={item.stock === 0}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
              item.stock === 0
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {item.stock === 0 ? '🚫 Hết hàng' : '🛒 Thêm vào giỏ'}
          </button>
        </div>
      </Link>
    </div>
  );
}

export default Cards;

