import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";
import api from "../config/api";
import axios from "axios";

function BookForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy id từ URL nếu là chỉnh sửa
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    stock: "",
    description: "",
    image: "",
    categoryId: ""
  });

  useEffect(() => {
    // Fetch categories
    fetchCategories();
    // Nếu có id, fetch dữ liệu sách để chỉnh sửa
    if (id) {
      fetchBook();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category");
      setCategories(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBook = async () => {
    try {
      const res = await api.get(`/book/${id}`);
      const bookData = res.data;
      setFormData({
        title: bookData.title,
        price: bookData.price,
        stock: bookData.stock,
        description: bookData.description,
        categoryId: bookData.category?._id || bookData.category,
        image: bookData.image
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo FormData để gửi file
      const formDataWithImage = new FormData();
      formDataWithImage.append('image', file);
      
      // Cập nhật preview ảnh
      setFormData({
        ...formData,
        imagePreview: URL.createObjectURL(file),
        imageFile: file
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('categoryId', formData.categoryId);

      // Chỉ append file khi có file mới được chọn
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      // Get token from localStorage
      const customer = localStorage.getItem('customer');
      if (customer) {
        const customerData = JSON.parse(customer);
        if (customerData.token) {
          config.headers.Authorization = `Bearer ${customerData.token}`;
        }
      }

      if (id) {
        const response = await axios.put(`${api.defaults.baseURL}/book/${id}`, formDataToSend, config);
        console.log('Update Response:', response.data);
      } else {
        const response = await axios.post(`${api.defaults.baseURL}/book`, formDataToSend, config);
        console.log('Create Response:', response.data);
      }
      navigate("/admin/books");
    } catch (error) {
      console.error('Error:', error.response?.data || error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen container mx-auto px-4 md:px-20 py-10 mt-20">
        <h1 className="text-2xl font-bold text-white mb-6">
          {id ? "Chỉnh sửa sách" : "Thêm sách mới"}
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Tên sách</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Giá</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Số lượng trong kho</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Danh mục</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Hình ảnh</label>
              <div className="flex flex-col gap-4">
                {/* Show current image when editing */}
                {id && formData.image && !formData.imagePreview && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Hình ảnh hiện tại:</p>
                    <img
                      src={`http://localhost:4001${formData.image}`}
                      alt="Current"
                      className="w-40 h-40 object-cover rounded border-2 border-gray-600"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/160?text=No+Image';
                      }}
                    />
                  </div>
                )}
                {/* Show preview of new image */}
                {formData.imagePreview && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Hình ảnh mới:</p>
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="w-40 h-40 object-cover rounded border-2 border-green-500"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 rounded bg-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600"
                  required={!id} // Chỉ bắt buộc khi thêm mới
                />
                {id && (
                  <p className="text-sm text-gray-400">
                    Để giữ nguyên hình ảnh hiện tại, không chọn file mới
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {id ? "Cập nhật" : "Thêm mới"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/books")}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Hủy
              </button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default BookForm; 