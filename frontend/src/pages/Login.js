import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpeg';
import axios from '../utils/axios';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loginAttempts, setLoginAttempts] = useState(3);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('/login', {
                email: formData.email,
                password: formData.password
            });
            setLoading(false);
            // Başarılı giriş
            localStorage.setItem('user', JSON.stringify(response.data.user));
            alert('Giriş başarılı!');
            navigate('/home'); // Anasayfa yönlendirmesi düzeltildi
        } catch (err) {
            setLoading(false);
            setLoginAttempts(prev => prev - 1);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Bir hata oluştu.');
            }
        }
    };

    const isButtonDisabled = loginAttempts <= 0 || loading;

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Blurred background logo */}
            <img
                src={logo}
                alt="Logo"
                className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 blur-sm pointer-events-none select-none z-0"
            />
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md relative z-10">
                <div>
                    <img src={logo} alt="Logo" className="w-16 h-16 mx-auto mb-2" />
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                        AkıllıBütçe - Giriş
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">E-posta</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="E-posta"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isButtonDisabled}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Şifre</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Şifre"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isButtonDisabled}
                            />
                        </div>
                    </div>
                    {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                    <div className="text-center text-gray-500 text-sm mb-2">
                        {loginAttempts > 0 ? `Kalan giriş hakkı: ${loginAttempts}` : 'Giriş hakkınız doldu. Lütfen daha sonra tekrar deneyin.'}
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isButtonDisabled}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </button>
                    </div>
                    <div className="text-center">
                        <Link
                            to="/register"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Hesabınız yok mu? Kayıt Olun
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login; 