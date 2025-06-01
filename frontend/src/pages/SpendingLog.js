import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/spending.jpeg';
import axios from '../utils/axios';

function SpendingLog() {
    const [formData, setFormData] = useState({
        category: '',
        amount: ''
    });
    const [deleteCategory, setDeleteCategory] = useState('');
    const [spendingSummary, setSpendingSummary] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    const categories = ['Giyim', 'Hobi', 'Spor', 'Eğitim', 'Diğer'];

    // Kullanıcı bilgilerini kontrol et ve harcama özetini getir
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.email) {
            navigate('/login');
            return;
        }
        setUserEmail(user.email);
        fetchSpendingSummary(user.email);
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        setError('');
    };

    const handleDeleteChange = (e) => {
        setDeleteCategory(e.target.value);
        setError('');
    };

    const handleAddSpending = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!formData.category || !formData.amount) {
            setError('Lütfen tüm alanları doldurun.');
            setLoading(false);
            return;
        }

        try {
            await axios.post('/spending-log', {
                category: formData.category,
                amount: parseFloat(formData.amount)
            }, {
                headers: {
                    'X-User-Email': userEmail
                }
            });

            setSuccess('Harcama başarıyla eklendi!');
            setFormData({
                category: '',
                amount: ''
            });
            // Harcama özetini güncelle
            fetchSpendingSummary(userEmail);
        } catch (err) {
            console.error('Harcama ekleme hatası:', err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Harcama eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSpending = async () => {
        if (!deleteCategory) {
            setError('Lütfen silinecek kategoriyi seçin.');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await axios.delete('/spending-log', {
                data: {
                    category: deleteCategory
                },
                headers: {
                    'X-User-Email': userEmail
                }
            });

            setSuccess('Harcama başarıyla silindi!');
            setDeleteCategory('');
            // Harcama özetini güncelle
            fetchSpendingSummary(userEmail);
        } catch (err) {
            console.error('Harcama silme hatası:', err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Harcama silinirken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSpendingSummary = async (email) => {
        setError('');
        setLoading(true);

        try {
            const response = await axios.get('/spending-summary', {
                headers: {
                    'X-User-Email': email
                }
            });

            if (response.data?.spending_summary) {
                setSpendingSummary(response.data.spending_summary);
            }
        } catch (err) {
            console.error('Harcama özeti getirme hatası:', err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Harcama özeti alınırken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Logo ve Başlık */}
                <div className="text-center mb-8">
                    <img src={logo} alt="Logo" className="w-24 h-24 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900">Harcamalarım</h2>
                </div>

                {/* Hata ve Başarı Mesajları */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Yeni Harcama Ekleme */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Yeni Harcama Ekle</h3>
                        <form onSubmit={handleAddSpending} className="space-y-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                    Kategori
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                    required
                                >
                                    <option value="">Seçiniz</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                    Tutar
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        id="amount"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        className="block w-full pl-3 pr-12 py-2 border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                        placeholder="0.00"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">₺</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            İşlem Yapılıyor...
                                        </div>
                                    ) : (
                                        'Ekle'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Harcama Silme */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Harcama Sil</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="deleteCategory" className="block text-sm font-medium text-gray-700">
                                    Kategori
                                </label>
                                <select
                                    id="deleteCategory"
                                    value={deleteCategory}
                                    onChange={handleDeleteChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Seçiniz</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={handleDeleteSpending}
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            İşlem Yapılıyor...
                                        </div>
                                    ) : (
                                        'Sil'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Harcama Özeti */}
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Harcama Özeti</h3>
                        <button
                            onClick={() => fetchSpendingSummary(userEmail)}
                            disabled={loading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            Harcamaları Listele
                        </button>
                    </div>

                    {spendingSummary.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {spendingSummary.map((item) => (
                                <div key={item.category} className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-gray-900">{item.category}</h4>
                                    <p className="text-2xl font-bold text-green-600">{item.total_amount}₺</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">Henüz harcama kaydı bulunmuyor.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SpendingLog; 