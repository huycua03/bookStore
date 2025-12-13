import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";
import api from "../config/api";

function CustomerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    password: ""
  });

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/customer/${id}`);
      const { fullname, email, phone, address } = res.data;
      setFormData({ fullname, email, phone, address, password: "" });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        const { password, ...updateData } = formData;
        await api.put(`/customer/${id}`, updateData);
      } else {
        await api.post("/customer", formData);
      }
      navigate("/admin/customers");
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
          {id ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl" autoComplete="off">
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Họ tên</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Địa chỉ</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                rows="3"
                required
                autoComplete="off"
              />
            </div>

            {!id && (
              <div>
                <label className="block text-white mb-2">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required={!id}
                  autoComplete="off"
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {id ? "Cập nhật" : "Thêm mới"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/customers")}
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

export default CustomerForm; 