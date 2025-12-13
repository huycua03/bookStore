import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import api from "../config/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import toast from "react-hot-toast";

function UserProfile() {
  const [authUser] = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullname: authUser.fullname || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        address: authUser.address || ""
      });
    }
  }, [authUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/customer/${authUser._id}`, formData);
      toast.success("Cập nhật thông tin thành công!");
      
      // Update localStorage
      const updatedUser = { ...authUser, ...formData };
      localStorage.setItem("customer", JSON.stringify(updatedUser));
      
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật thông tin");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen container mx-auto px-4 md:px-20 py-10 mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="card bg-base-100 shadow-xl dark:bg-slate-800">
            <div className="card-body">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Thông tin tài khoản</h1>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary btn-sm"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="avatar placeholder">
                    <div className="bg-pink-500 text-white rounded-full w-24">
                      <span className="text-3xl">
                        {authUser?.fullname?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Họ và tên</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      className="input input-bordered"
                      required
                    />
                  ) : (
                    <p className="p-3 bg-base-200 rounded-lg">
                      {formData.fullname}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Email</span>
                  </label>
                  <p className="p-3 bg-base-200 rounded-lg">
                    {formData.email}
                  </p>
                  <label className="label">
                    <span className="label-text-alt text-gray-500">
                      Email không thể thay đổi
                    </span>
                  </label>
                </div>

                {/* Phone */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Số điện thoại</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input input-bordered"
                      required
                    />
                  ) : (
                    <p className="p-3 bg-base-200 rounded-lg">
                      {formData.phone}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Địa chỉ</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="textarea textarea-bordered"
                      rows="3"
                      required
                    />
                  ) : (
                    <p className="p-3 bg-base-200 rounded-lg">
                      {formData.address}
                    </p>
                  )}
                </div>

                {/* Admin Badge */}
                {authUser?.isAdmin && (
                  <div className="alert alert-info">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-current shrink-0 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>Bạn là quản trị viên</span>
                  </div>
                )}

                {/* Action Buttons */}
                {isEditing && (
                  <div className="card-actions justify-end mt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn btn-ghost"
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Lưu thay đổi
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <a href="/order-history" className="card bg-base-100 shadow-xl hover:shadow-2xl transition dark:bg-slate-800">
              <div className="card-body items-center text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-pink-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h2 className="card-title">Đơn hàng</h2>
                <p className="text-sm">Xem lịch sử mua hàng</p>
              </div>
            </a>

            <a href="/wishlist" className="card bg-base-100 shadow-xl hover:shadow-2xl transition dark:bg-slate-800">
              <div className="card-body items-center text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-pink-500 mb-2"
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
                <h2 className="card-title">Yêu thích</h2>
                <p className="text-sm">Sách đã lưu</p>
              </div>
            </a>

            <a href="/cart" className="card bg-base-100 shadow-xl hover:shadow-2xl transition dark:bg-slate-800">
              <div className="card-body items-center text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-pink-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h2 className="card-title">Giỏ hàng</h2>
                <p className="text-sm">Xem giỏ hàng</p>
              </div>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default UserProfile;








