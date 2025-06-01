import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpeg';
import axios from '../utils/axios';

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
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
        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler uyuşmuyor.');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/register', {
                email: formData.email,
                password: formData.password,
                username: formData.email.split('@')[0] // backend otomatik oluşturuyor
            });
            setLoading(false);
            alert('Kayıt başarılı! Giriş yapabilirsiniz.');
            navigate('/login');
        } catch (err) {
            setLoading(false);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Bir hata oluştu.');
            }
        }
    };

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
                        AkıllıBütçe - Kayıt
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
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Şifre</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Şifre"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Şifre Tekrar</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Şifre Tekrar"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
                        </button>
                    </div>
                    <div className="text-center">
                        <Link
                            to="/login"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Zaten hesabınız var mı? Giriş Yapın
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register; 