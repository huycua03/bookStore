import { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import api from "../config/api";

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get("/book");
      setBooks(res.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sách này?")) {
      try {
        await api.delete(`/book/${id}`);
        fetchBooks(); // Refresh danh sách sau khi xóa
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen container mx-auto px-4 md:px-20 py-10 mt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Quản lý sách</h1>
          <button 
            onClick={() => navigate("/admin/books/new")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Thêm sách mới
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-6 py-3 text-left">Hình ảnh</th>
                <th className="px-6 py-3 text-left">Tên sách</th>
                <th className="px-6 py-3 text-left">Giá</th>
                <th className="px-6 py-3 text-left">Kho</th>
                <th className="px-6 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id} className="border-b dark:border-gray-600">
                  <td className="px-6 py-4">
                    <img
                      src={`http://localhost:4001${book.image}`}
                      alt={book.title}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">{book.title}</td>
                  <td className="px-6 py-4">{book.price}Đ</td>
                  <td className="px-6 py-4">{book.stock}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => navigate(`/admin/books/edit/${book._id}`)}
                      className="px-3 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(book._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminBooks; 