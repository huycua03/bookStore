import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function ActivateAccount() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        const activate = async () => {
            try {
                const response = await axios.get(`http://localhost:4001/api/activate/${token}`);
                
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.customer));
                
                // Also save in customer format for compatibility
                localStorage.setItem('customer', JSON.stringify({
                    ...response.data.customer,
                    token: response.data.token
                }));
                
                setStatus('success');
                setMessage(response.data.message);
                setCustomer(response.data.customer);
                
                setTimeout(() => {
                    navigate('/');
                    window.location.reload();
                }, 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Activation failed. Please try again.');
                console.error('Activation error:', error);
            }
        };

        if (token) {
            activate();
        } else {
            setStatus('error');
            setMessage('Invalid activation link');
        }
    }, [token, navigate]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-pink-500 mb-6"></div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        Đang kích hoạt tài khoản...
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Vui lòng đợi trong giây lát
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="text-8xl mb-6 animate-bounce">🎉</div>
                    <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                        Kích hoạt thành công!
                    </h2>
                    <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
                        {message}
                    </p>
                    {customer && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6 shadow-lg">
                            <p className="text-gray-600 dark:text-gray-400 mb-2">Chào mừng,</p>
                            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                                {customer.fullname}
                            </p>
                        </div>
                    )}
                    <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-400">
                            Đang chuyển hướng về trang chủ...
                        </p>
                        <div className="flex justify-center gap-2">
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                        <Link 
                            to="/" 
                            className="inline-block mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Đi đến trang chủ ngay
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
            <div className="text-center max-w-md mx-auto p-8">
                <div className="text-8xl mb-6">❌</div>
                <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
                    Kích hoạt thất bại
                </h2>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
                    {message}
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6 text-left">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Có thể do:</strong><br/>
                        • Link đã hết hạn (24 giờ)<br/>
                        • Link đã được sử dụng<br/>
                        • Link không hợp lệ
                    </p>
                </div>
                <div className="space-y-3">
                    <Link
                        to="/signup"
                        className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Đăng ký lại
                    </Link>
                    <Link
                        to="/"
                        className="block w-full px-6 py-3 border-2 border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition"
                    >
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ActivateAccount;

