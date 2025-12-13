import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Cards from "../components/Cards";
import toast from "react-hot-toast";

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBookData();
  }, [id]);

  const fetchBookData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4001/api/book/${id}`);
      setBook(res.data);
      
      if (res.data.category) {
        const categoryId = typeof res.data.category === 'object' 
          ? res.data.category._id 
          : res.data.category;
        
        const booksRes = await axios.get('http://localhost:4001/api/book');
        const related = booksRes.data
          .filter(b => {
            const bCategoryId = typeof b.category === 'object' ? b.category._id : b.category;
            return bCategoryId === categoryId && b._id !== id;
          })
          .slice(0, 4);
        setRelatedBooks(related);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (book.stock === 0) return;
    
    const cartItem = {
      _id: book._id,
      title: book.title,
      price: book.price,
      image: book.image,
      quantity: quantity
    };

    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = currentCart.findIndex(item => item._id === book._id);
    
    if (existingItemIndex !== -1) {
      currentCart[existingItemIndex].quantity += quantity;
    } else {
      currentCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    toast.success(`✓ Đã thêm ${quantity} sản phẩm vào giỏ!`, { duration: 2500 });
  };

  const buyNow = () => {
    if (book.stock === 0) return;
    addToCart();
    setTimeout(() => navigate('/cart'), 500);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Hết hàng', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: '🚫' };
    if (stock < 10) return { text: `Chỉ còn ${stock}`, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: '⚠️' };
    return { text: `Còn ${stock}`, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '✓' };
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Đang tải...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!book) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Không tìm thấy sách</h2>
            <Link to="/book" className="text-pink-500 hover:text-pink-600">← Quay lại</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const stockStatus = getStockStatus(book.stock);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 mt-16">
        <div className="container mx-auto px-4 md:px-20">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <li><Link to="/" className="hover:text-pink-500">Trang chủ</Link></li>
              <li>/</li>
              <li><Link to="/book" className="hover:text-pink-500">Sách</Link></li>
              <li>/</li>
              <li className="text-gray-900 dark:text-white truncate">{book.title}</li>
            </ol>
          </nav>

          {/* Main Product */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-10">
              
              <div className="space-y-4">
                <div className="relative bg-gray-100 dark:bg-slate-700 rounded-2xl overflow-hidden aspect-[3/4] max-h-[600px]">
                  <img 
                    src={book.image ? (book.image.startsWith('http') ? book.image : `http://localhost:4001${book.image}`) : 'https://via.placeholder.com/300x400?text=No+Image'}
                    alt={book.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                    }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {book.title}
                  </h1>
                  {book.category && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium text-sm">
                      📚 {typeof book.category === 'object' ? book.category.name : book.category}
                    </span>
                  )}
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-6 rounded-2xl">
                  <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-3">
                    {formatPrice(book.price)}₫
                  </div>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${stockStatus.color}`}>
                    <span>{stockStatus.icon}</span>
                    <span>{stockStatus.text}</span>
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Số lượng:</span>
                  <div className="flex items-center border-2 border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                      disabled={book.stock === 0}
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(book.stock, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold"
                      disabled={book.stock === 0}
                    />
                    <button 
                      onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                      className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                      disabled={book.stock === 0}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={buyNow}
                    disabled={book.stock === 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                      book.stock === 0
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1'
                    }`}
                  >
                    {book.stock === 0 ? '🚫 Hết hàng' : '⚡ Mua ngay'}
                  </button>
                  
                  <button 
                    onClick={addToCart}
                    disabled={book.stock === 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg border-2 transition-all duration-300 ${
                      book.stock === 0
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white'
                    }`}
                  >
                    {book.stock === 0 ? 'Tạm hết' : '🛒 Thêm vào giỏ'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-slate-700">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">🚚</span>
                    <span className="text-gray-600 dark:text-gray-300">Giao hàng nhanh</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">Chính hãng</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">↩️</span>
                    <span className="text-gray-600 dark:text-gray-300">Đổi trả 7 ngày</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">💳</span>
                    <span className="text-gray-600 dark:text-gray-300">Thanh toán linh hoạt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="flex border-b dark:border-slate-700">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'description'
                    ? 'text-pink-500 border-b-2 border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-pink-500'
                }`}
              >
                📝 Mô tả
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'details'
                    ? 'text-pink-500 border-b-2 border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-pink-500'
                }`}
              >
                ℹ️ Chi tiết
              </button>
            </div>

            <div className="p-6 md:p-10">
              {activeTab === 'description' && (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {book.description || 'Chưa có mô tả.'}
                  </p>
                </div>
              )}
              
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Giá bán</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(book.price)}₫</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-2xl">📦</span>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Kho</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{book.stock} cuốn</p>
                    </div>
                  </div>
                  
                  {book.category && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-2xl">📚</span>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Danh mục</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {typeof book.category === 'object' ? book.category.name : book.category}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedBooks.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  📖 Sách liên quan
                </h2>
                <Link to="/book" className="text-pink-500 hover:text-pink-600 font-medium">
                  Xem tất cả →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedBooks.map((item) => (
                  <Cards key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default BookDetail;