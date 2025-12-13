import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import toast from "react-hot-toast";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (orderId) {
      toast.success("Thanh toán thành công!");
    }
  }, [orderId]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-20">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Thanh toán thành công!
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Cảm ơn bạn đã mua sắm tại BookStore. Đơn hàng của bạn đã được xác nhận và sẽ được xử lý sớm nhất.
            </p>

            {orderId && (
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Mã đơn hàng
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  #{orderId}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/book"
                className="block w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all"
              >
                Tiếp tục mua sắm
              </Link>
              <button
                onClick={() => navigate("/")}
                className="block w-full px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white rounded-lg font-semibold transition-all"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PaymentSuccess;

