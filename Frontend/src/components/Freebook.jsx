import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

import axios from "axios";
import Cards from "./Cards";

function Freebook() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBooks = async () => {
      try {
        const res = await axios.get("http://localhost:4001/api/book");
        const featuredBooks = res.data.slice(0, 10);
        setBooks(featuredBooks);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    getBooks();
  }, []);

  const settings = {
    dots: true,
    infinite: books.length > 3,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  };

  const BookSkeleton = () => (
    <div className="px-3">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg overflow-hidden border animate-pulse">
        <div className="h-72 bg-gray-300 dark:bg-slate-700"></div>
        <div className="p-5 space-y-3">
          <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded"></div>
          <div className="h-10 bg-gray-300 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 py-16 bg-gradient-to-b from-transparent to-gray-50 dark:to-slate-900">
      <div className="text-center mb-12">
        <div className="inline-block mb-4">
          <span className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm font-semibold">
            ⭐ Nổi bật
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-600 dark:text-blue-400">
          Sách Đề Xuất
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Khám phá những cuốn sách được yêu thích nhất
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <BookSkeleton key={i} />
          ))}
        </div>
      ) : books.length > 0 ? (
        <div className="relative px-4">
          <Slider {...settings}>
            {books.map((item) => (
              <div key={item._id} className="px-3">
                <Cards item={item} />
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-600 dark:text-gray-300">Chưa có sách nào</p>
        </div>
      )}

      {books.length > 0 && (
        <div className="text-center mt-12">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <span>Xem tất cả</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Freebook;
