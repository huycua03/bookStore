import React, { useEffect, useState } from "react";
import Cards from "./Cards";
import SearchBar from "./SearchBar";
import axios from "axios";

function Course() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [booksRes, categoriesRes] = await Promise.all([
        axios.get("http://localhost:4001/api/book"),
        axios.get("http://localhost:4001/api/category")
      ]);
      setBooks(booksRes.data);
      setFilteredBooks(booksRes.data);
      setCategories(categoriesRes.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    setIsSearching(true);
    setCurrentPage(1); // Reset to first page when searching
    
    setTimeout(() => {
      let result = [...books];

      if (filters.searchTerm) {
        result = result.filter(book =>
          book.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }

      if (filters.category) {
        result = result.filter(book => {
          const categoryId = typeof book.category === 'object' ? book.category._id : book.category;
          return categoryId === filters.category;
        });
      }

      if (filters.priceRange !== 'all') {
        if (filters.priceRange === '500000+') {
          result = result.filter(book => book.price >= 500000);
        } else {
          const [min, max] = filters.priceRange.split('-').map(Number);
          result = result.filter(book => book.price >= min && book.price <= max);
        }
      }

      switch (filters.sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'name-asc':
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'name-desc':
          result.sort((a, b) => b.title.localeCompare(a.title));
          break;
        default:
          break;
      }

      setFilteredBooks(result);
      setIsSearching(false);
    }, 300);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const BookSkeleton = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 animate-pulse">
      <div className="h-72 bg-gray-300 dark:bg-slate-700"></div>
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-1/2"></div>
        <div className="h-10 bg-gray-300 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4">
        <div className="mt-28 text-center mb-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Đang tải...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[...Array(8)].map((_, i) => (
            <BookSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4">
        <div className="mt-28 text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            Sách mở ra cánh cửa tri thức
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Khám phá hàng trăm đầu sách hay từ nhiều thể loại
          </p>
          
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-500">{books.length}+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Đầu sách</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">{categories.length}+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Danh mục</div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} categories={categories} />
        </div>

        <div className="flex justify-between items-center mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {totalPages > 1 ? (
              <>Hiển thị <span className="text-blue-600 font-bold">{startIndex + 1}-{Math.min(endIndex, filteredBooks.length)}</span> / {filteredBooks.length} sách (Tổng {books.length} sách)</>
            ) : (
              <>Hiển thị <span className="text-blue-600 font-bold">{filteredBooks.length}</span> / {books.length} sách</>
            )}
          </span>
        </div>

        {isSearching ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-500"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-300">Đang tìm kiếm...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {currentBooks.length > 0 ? (
                currentBooks.map((item, index) => (
                  <div
                    key={item._id}
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <Cards item={item} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="text-8xl mb-4">📚</div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Không tìm thấy sách
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Thử điều chỉnh bộ lọc hoặc từ khóa khác
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mb-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    currentPage === 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
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
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
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
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Sau
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mb-6 text-center text-gray-600 dark:text-gray-400">
                Trang {currentPage} / {totalPages} - Hiển thị {currentBooks.length} / {filteredBooks.length} sách
              </div>
            )}
          </>
        )}

        {filteredBooks.length > 8 && (
          <div className="fixed bottom-8 right-8 z-40">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Course;
