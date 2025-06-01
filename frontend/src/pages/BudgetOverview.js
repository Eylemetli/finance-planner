import React, { useState, useEffect } from 'react';
import cuzdanLogo from '../assets/cuzdan.jpeg';
import krediLogo from '../assets/kredi.jpeg';
import toplamLogo from '../assets/toplam.jpeg';
import axios from '../utils/axios';

const BudgetOverview = () => {
    const [income, setIncome] = useState('');
    const [walletAmount, setWalletAmount] = useState(0);
    const [totalAssets, setTotalAssets] = useState(0);
    const [totalResources, setTotalResources] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.email) {
                throw new Error('Kullanıcı bilgisi bulunamadı');
            }

            const headers = {
                'X-User-Email': user.email,
                'Content-Type': 'application/json'
            };

            // Bütçe bilgisini al
            const budgetResponse = await axios.get('/budget', { headers });
            const currentBudget = budgetResponse.data?.initial_budget || 0;
            setWalletAmount(currentBudget);

            // Kredi kartı limitlerini al
            const creditCardsResponse = await axios.get('/unpaid-cards', { headers });

            // Toplam kalan limiti hesapla
            let totalRemainingLimit = 0;
            if (creditCardsResponse.data && creditCardsResponse.data.credit_cards) {
                totalRemainingLimit = creditCardsResponse.data.credit_cards.reduce((total, card) => {
                    const remainingLimit = parseFloat(card.card_limit || 0) - parseFloat(card.current_balance || 0);
                    return total + (remainingLimit > 0 ? remainingLimit : 0);
                }, 0);
            }

            setTotalAssets(totalRemainingLimit);
            setTotalResources(currentBudget + totalRemainingLimit);
            setLoading(false);
        } catch (err) {
            console.error('Veri yüklenirken hata:', err);
            if (err.message === 'Kullanıcı bilgisi bulunamadı') {
                setError('Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.');
            } else {
                setError(err.response?.data?.message || 'Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleIncomeChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setIncome(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        if (!income || parseInt(income) <= 0) {
            setError('Lütfen geçerli bir bütçe miktarı giriniz.');
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.email) {
                throw new Error('Kullanıcı bilgisi bulunamadı');
            }

            const headers = {
                'X-User-Email': user.email,
                'Content-Type': 'application/json'
            };

            const response = await axios.post('/budget', {
                email: user.email,
                initial_budget: parseInt(income)
            }, { headers });

            if (response.data && response.data.message) {
                setSuccessMessage(response.data.message);
            } else {
                setSuccessMessage('Bütçe başarıyla güncellendi');
            }

            setIncome('');
            await fetchData(); // Verileri yeniden yükle
        } catch (err) {
            console.error('Bütçe güncellenirken hata:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.message === 'Kullanıcı bilgisi bulunamadı') {
                setError('Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.');
            } else {
                setError('Bütçe güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
                <div className="text-emerald-600 text-xl">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Ana Başlık */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-emerald-800 mb-8">
                        Finansal Durumum
                    </h1>

                    {/* Hata ve Başarı Mesajları */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 max-w-md mx-auto">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 max-w-md mx-auto">
                            {successMessage}
                        </div>
                    )}

                    {/* Gelir Girişi Formu */}
                    <div className="bg-gradient-to-br from-emerald-100 to-green-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
                        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
                            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <label htmlFor="income" className="text-lg font-medium text-emerald-700">
                                    Geliriniz
                                </label>
                                <input
                                    type="text"
                                    id="income"
                                    value={income}
                                    onChange={handleIncomeChange}
                                    placeholder="Gelir miktarını giriniz"
                                    className="w-full sm:w-48 px-4 py-2 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors w-full sm:w-auto"
                            >
                                Onayla
                            </button>
                        </form>
                    </div>
                </div>

                {/* Kartlar Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {/* Cüzdan Kartı */}
                    <div className="bg-gradient-to-br from-emerald-100 to-green-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-center mb-4">
                            <img src={cuzdanLogo} alt="Cüzdan" className="w-12 h-12" />
                        </div>
                        <h2 className="text-lg font-semibold text-emerald-800 text-center mb-2">Cüzdan</h2>
                        <p className="text-2xl font-bold text-emerald-600 text-center">
                            {walletAmount.toLocaleString('tr-TR')} TL
                        </p>
                    </div>

                    {/* Varlıklar Kartı */}
                    <div className="bg-gradient-to-br from-emerald-100 to-green-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-center mb-4">
                            <img src={krediLogo} alt="Kredi" className="w-12 h-12" />
                        </div>
                        <h2 className="text-lg font-semibold text-emerald-800 text-center mb-2">Varlıklar</h2>
                        <p className="text-2xl font-bold text-emerald-600 text-center">
                            {totalAssets.toLocaleString('tr-TR')} TL
                        </p>
                    </div>

                    {/* Toplam Kaynaklar Kartı */}
                    <div className="bg-gradient-to-br from-emerald-100 to-green-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-center mb-4">
                            <img src={toplamLogo} alt="Toplam" className="w-12 h-12" />
                        </div>
                        <h2 className="text-lg font-semibold text-emerald-800 text-center mb-2">Toplam Kaynaklar</h2>
                        <p className="text-2xl font-bold text-emerald-600 text-center">
                            {totalResources.toLocaleString('tr-TR')} TL
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetOverview; 