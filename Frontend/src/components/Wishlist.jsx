import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../config/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import toast from "react-hot-toast";

function Wishlist() {
  const [wishlist, setWishlist] = useState({ books: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      setWishlist(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách yêu thích");
      setLoading(false);
    }
  };

  const removeFromWishlist = async (bookId) => {
    try {
      await api.delete(`/wishlist/${bookId}`);
      toast.success("Đã xóa khỏi danh sách yêu thích");
      fetchWishlist();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa sách");
    }
  };

  const addToCart = async (book) => {
    try {
      const cartItem = {
        _id: book._id,
        title: book.title,
        price: book.price,
        image: book.image,
        quantity: 1
      };

      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = currentCart.findIndex(item => item._id === book._id);
      
      if (existingItemIndex !== -1) {
        currentCart[existingItemIndex].quantity += 1;
      } else {
        currentCart.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(currentCart));
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error(error);
      toast.error('Không thể thêm vào giỏ hàng');
    }
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
        <h1 className="text-3xl font-bold mb-8">
          Danh sách yêu thích ({wishlist.books.length})
        </h1>

        {wishlist.books.length === 0 ? (
          <div className="text-center py-12">
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Danh sách yêu thích trống
            </p>
            <Link to="/book" className="btn btn-primary">
              Khám phá sách hay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {wishlist.books.map((book) => (
              <div 
                key={book._id} 
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition dark:bg-slate-800"
              >
                <Link to={`/book/${book._id}`}>
                  <figure className="relative">
                    <img
                      src={`http://localhost:4001${book.image}`}
                      alt={book.title}
                      className="w-full h-60 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                      }}
                    />
                  </figure>
                </Link>
                
                <div className="card-body">
                  <h2 className="card-title text-base min-h-[3rem]">
                    {book.title}
                  </h2>
                  
                  <div className="flex items-center justify-between my-2">
                    <span className="text-xl font-bold text-pink-500">
                      {book.price.toLocaleString()}đ
                    </span>
                    <span className="badge badge-outline">
                      Kho: {book.stock}
                    </span>
                  </div>

                  {book.category && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {book.category.name}
                    </p>
                  )}

                  <div className="card-actions justify-between mt-4">
                    <button
                      onClick={() => addToCart(book)}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      Thêm vào giỏ
                    </button>
                    <button
                      onClick={() => removeFromWishlist(book._id)}
                      className="btn btn-error btn-sm btn-outline"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
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

export default Wishlist;

