import React, { useState } from 'react';

function SearchBar({ onSearch, categories }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({
      searchTerm,
      category: selectedCategory,
      priceRange,
      sortBy
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange('all');
    setSortBy('default');
    onSearch({
      searchTerm: '',
      category: '',
      priceRange: 'all',
      sortBy: 'default'
    });
  };

  const hasActiveFilters = selectedCategory || priceRange !== 'all' || sortBy !== 'default';

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      <form onSubmit={handleSearch} className="p-6 space-y-6">
        
        {/* Main Search Bar */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sách..."
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 text-lg"
              />
            </div>
            
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Tìm
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative px-4 py-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-300"
            >
              <svg className={`h-6 w-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-pink-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pt-4 border-t dark:border-slate-700 space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <span>📚</span>
                  <span>Danh mục</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories && categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <span>💰</span>
                  <span>Khoảng giá</span>
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white"
                >
                  <option value="all">Tất cả</option>
                  <option value="0-100000">Dưới 100,000đ</option>
                  <option value="100000-200000">100,000đ - 200,000đ</option>
                  <option value="200000-500000">200,000đ - 500,000đ</option>
                  <option value="500000+">Trên 500,000đ</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <span>⬇️</span>
                  <span>Sắp xếp</span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white"
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="name-asc">Tên A → Z</option>
                  <option value="name-desc">Tên Z → A</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-all font-semibold"
              >
                🔄 Đặt lại
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
              >
                ✓ Áp dụng
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SearchBar;
