import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import toast from "react-hot-toast";

function PaymentFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message") || "Thanh toán thất bại";

  useEffect(() => {
    toast.error(message);
  }, [message]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-20">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Thanh toán thất bại
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {message}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
            </p>

            <div className="space-y-3">
              <Link
                to="/checkout"
                className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Thử lại thanh toán
              </Link>
              <button
                onClick={() => navigate("/cart")}
                className="block w-full px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white rounded-lg font-semibold transition-all duration-200"
              >
                Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PaymentFailed;

