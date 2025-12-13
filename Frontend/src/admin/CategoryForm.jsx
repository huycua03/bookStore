import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";
import api from "../config/api";

function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const res = await api.get(`/category/${id}`);
      setFormData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/category/${id}`, formData);
      } else {
        await api.post("/category", formData);
      }
      navigate("/admin/categories");
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
          {id ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Tên danh mục</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
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

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {id ? "Cập nhật" : "Thêm mới"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/categories")}
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

export default CategoryForm; 