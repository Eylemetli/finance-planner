import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpeg';
import axios from '../utils/axios';

const Home = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [budgetStatus, setBudgetStatus] = useState(null);
    const [upcomingPayments, setUpcomingPayments] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [totalPayments, setTotalPayments] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.email) {
                navigate('/login');
                return;
            }
            fetchData(user.email);
        };

        checkAuth();
    }, [navigate]);

    const fetchData = async (email) => {
        try {
            const headers = {
                'X-User-Email': email,
                'Content-Type': 'application/json'
            };

            // Kullanıcı mesajlarını al
            try {
                const messagesResponse = await axios.get('/home/messages', { headers });
                if (messagesResponse.data && messagesResponse.data.messages) {
                    setMessages(messagesResponse.data.messages);
                }
            } catch (err) {
                console.error('Mesajlar yüklenirken hata:', err);
            }

            // Bütçe durumunu al
            try {
                const budgetResponse = await axios.get('/budget', { headers });
                if (budgetResponse.data) {
                    setBudgetStatus(budgetResponse.data);
                }
            } catch (err) {
                console.error('Bütçe yüklenirken hata:', err);
            }

            // Toplam ödemeleri al
            try {
                const paymentsResponse = await axios.get('/payments', { headers });
                if (paymentsResponse.data && paymentsResponse.data.total_payments) {
                    setTotalPayments(paymentsResponse.data.total_payments);
                }
            } catch (err) {
                console.error('Ödemeler yüklenirken hata:', err);
            }

            // Yaklaşan ödemeleri al
            try {
                const upcomingResponse = await axios.get('/upcoming-payments', { headers });
                if (upcomingResponse.data && upcomingResponse.data.payments) {
                    setUpcomingPayments(upcomingResponse.data.payments);
                }
            } catch (err) {
                console.error('Yaklaşan ödemeler yüklenirken hata:', err);
            }

            // Son harcamaları al
            try {
                const expensesResponse = await axios.get('/recent-expenses', { headers });
                if (expensesResponse.data && expensesResponse.data.expenses) {
                    setRecentExpenses(expensesResponse.data.expenses);
                }
            } catch (err) {
                console.error('Harcamalar yüklenirken hata:', err);
            }

            setLoading(false);
        } catch (err) {
            console.error('Genel hata:', err);
            setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
            setLoading(false);
        }
    };

    // Ödeme tipine göre renk ve ikon belirleme
    const getPaymentStyle = (type) => {
        if (type === 'bill') {
            return {
                icon: '📄',
                color: 'text-amber-700'
            };
        } else {
            return {
                icon: '💳',
                color: 'text-amber-700'
            };
        }
    };

    // Kalan güne göre uyarı mesajı
    const getDueDateMessage = (days) => {
        if (days < 0) {
            return <span className="text-red-600">Gecikmiş!</span>;
        } else if (days === 0) {
            return <span className="text-orange-600">Bugün son gün!</span>;
        } else if (days <= 3) {
            return <span className="text-orange-600">{days} gün kaldı</span>;
        } else {
            return <span className="text-emerald-600">{days} gün kaldı</span>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center">
                <div className="text-green-600 text-xl">Yükleniyor...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center">
                <div className="text-red-600 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Logo and Title */}
                        <div className="flex flex-col items-center pt-4">
                            <img
                                className="h-24 w-auto"
                                src={logo}
                                alt="AkıllıBütçe Logo"
                            />
                            <h1 className="text-xl font-bold text-emerald-600 mt-2">
                                AkıllıBütçe
                            </h1>
                        </div>

                        {/* Navigation */}
                        <nav className="flex justify-center space-x-6 py-4">
                            <button
                                onClick={() => navigate('/budget')}
                                className="text-emerald-600 hover:text-emerald-700 px-3 py-2 text-sm font-medium"
                            >
                                Bütçe
                            </button>
                            <button
                                onClick={() => navigate('/cards')}
                                className="text-emerald-600 hover:text-emerald-700 px-3 py-2 text-sm font-medium"
                            >
                                Kredi Kartları
                            </button>
                            <button
                                onClick={() => navigate('/bills')}
                                className="text-emerald-600 hover:text-emerald-700 px-3 py-2 text-sm font-medium"
                            >
                                Faturalar
                            </button>
                            <button
                                onClick={() => navigate('/make-payment')}
                                className="text-emerald-600 hover:text-emerald-700 px-3 py-2 text-sm font-medium"
                            >
                                Ödemeler
                            </button>
                            <button
                                onClick={() => navigate('/spending-log')}
                                className="text-emerald-600 hover:text-emerald-700 px-3 py-2 text-sm font-medium"
                            >
                                Harcama Günlüğü
                            </button>
                            <button
                                onClick={() => navigate('/reports')}
                                className="text-emerald-600 hover:text-emerald-700 px-3 py-2 text-sm font-medium"
                            >
                                Raporlar
                            </button>
                        </nav>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Welcome Message */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-emerald-800 mb-4">
                            Hoş Geldiniz!
                        </h2>
                        <p className="text-lg text-emerald-600">
                            Finansal yolculuğunuzda size yardımcı olmaktan mutluluk duyuyoruz.
                        </p>
                    </div>

                    {/* Messages Section */}
                    <div className="text-center mb-12 min-h-[100px]">
                        {messages.map((message, index) => (
                            <p key={index} className="text-emerald-700 mb-2">
                                {message}
                            </p>
                        ))}
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        {/* Budget Status Card */}
                        <div className="bg-gradient-to-br from-emerald-100 to-green-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-semibold text-emerald-800 mb-4">
                                Bütçe Durumu
                            </h3>
                            <div className="space-y-2">
                                <p className="text-emerald-700">
                                    Toplam Bütçe: {budgetStatus?.initial_budget?.toLocaleString('tr-TR')} ₺
                                </p>
                                <p className="text-emerald-700">
                                    Harcanan: {totalPayments?.toLocaleString('tr-TR')} ₺
                                </p>
                                <p className="text-emerald-700">
                                    Kalan: {(budgetStatus?.initial_budget - totalPayments)?.toLocaleString('tr-TR')} ₺
                                </p>
                            </div>
                        </div>

                        {/* Upcoming Payments Card */}
                        <div className="bg-gradient-to-br from-amber-100 to-yellow-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-semibold text-amber-800 mb-4">
                                Yaklaşan Ödemeler
                            </h3>
                            <div className="space-y-3">
                                {upcomingPayments.map((payment, index) => {
                                    const style = getPaymentStyle(payment.type);
                                    return (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span>{style.icon}</span>
                                                <span className={style.color}>{payment.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className={style.color}>
                                                    {payment.amount?.toLocaleString('tr-TR')} ₺
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Son Ödeme: {new Date(payment.due_date).toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Expenses Card */}
                        <div className="bg-gradient-to-br from-emerald-100 to-green-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-semibold text-emerald-800 mb-4">
                                Son Harcamalar
                            </h3>
                            <div className="space-y-2">
                                {recentExpenses.map((expense, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div>
                                            <p className="text-emerald-700">{expense.description}</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(expense.date).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                        <p className="text-emerald-700">
                                            {parseFloat(expense.amount).toLocaleString('tr-TR')} ₺
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Home; 