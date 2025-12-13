import React, { useState } from "react";
import { Link } from "react-router-dom";
import banner from "/Banner.png";
import toast from "react-hot-toast";

function Banner() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      toast.success('✓ Cảm ơn bạn đã đăng ký!', { duration: 2500 });
      setEmail("");
    }
  };

  return (
    <div className="max-w-screen-2xl container mx-auto md:px-20 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 py-12 md:py-20">
        
        <div className="w-full md:w-1/2 order-2 md:order-1 space-y-8 animate-fade-in">
          <div className="inline-block">
            <span className="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm font-semibold">
              📚 Chào mừng đến với BookStore
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Khám phá thế giới{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              tri thức
            </span>
            {" "}qua từng trang sách
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Nơi hội tụ hàng ngàn đầu sách hay từ nhiều lĩnh vực khác nhau. 
            Bắt đầu hành trình đọc của bạn ngay hôm nay!
          </p>

          <div className="flex gap-8 py-4">
            <div>
              <div className="text-3xl font-bold text-pink-500">1000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Đầu sách</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-500">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Khách hàng</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-500">4.8⭐</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Đánh giá</div>
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn..."
              className="flex-1 px-4 py-4 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Đăng ký
            </button>
          </form>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span>Khám phá sách</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 order-1 md:order-2 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-300/20 to-purple-300/20 dark:from-pink-500/10 dark:to-purple-500/10 rounded-3xl blur-3xl"></div>
            <img
              src={banner}
              className="relative w-full h-auto max-w-[550px] mx-auto drop-shadow-2xl"
              alt="BookStore Banner"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
