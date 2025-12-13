import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Cards({ item }) {
  const [isHovered, setIsHovered] = useState(false);

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

          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
              {stockStatus.text}
            </span>
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
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform ${
              item.stock === 0
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md hover:shadow-xl hover:-translate-y-1'
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

