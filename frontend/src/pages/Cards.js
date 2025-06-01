import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import krediImage from '../assets/kredi.jpeg';
import axios from '../utils/axios';

const Cards = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [cards, setCards] = useState([]);

    // Form state'leri
    const [newCard, setNewCard] = useState({
        bank_name: '',
        card_limit: '',
        current_balance: '',
        due_date_start: '',
        due_date_end: ''
    });

    const [updateCard, setUpdateCard] = useState({
        bank_name: '',
        card_limit: '',
        current_balance: '',
        due_date_start: '',
        due_date_end: ''
    });

    const [deleteCard, setDeleteCard] = useState({
        bank_name: ''
    });

    const [paymentCard, setPaymentCard] = useState({
        bank_name: '',
        amount: ''
    });

    useEffect(() => {
        const checkAuth = () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.email) {
                navigate('/login');
                return;
            }
            fetchCards(user.email);
            setLoading(false);
        };

        checkAuth();
    }, [navigate]);

    const fetchCards = async (email) => {
        try {
            const response = await axios.get('/unpaid-cards', {
                headers: {
                    'X-User-Email': email
                }
            });
            if (response.data && response.data.credit_cards) {
                setCards(response.data.credit_cards);
            }
        } catch (err) {
            console.error('Kartlar yüklenirken hata:', err);
            setError('Kartlar yüklenirken bir hata oluştu');
        }
    };

    // Form değişikliklerini yöneten fonksiyonlar
    const handleNewCardChange = (e) => {
        setNewCard({ ...newCard, [e.target.name]: e.target.value });
    };

    const handleUpdateCardChange = (e) => {
        setUpdateCard({ ...updateCard, [e.target.name]: e.target.value });
    };

    const handleDeleteCardChange = (e) => {
        setDeleteCard({ ...deleteCard, [e.target.name]: e.target.value });
    };

    const handlePaymentCardChange = (e) => {
        setPaymentCard({ ...paymentCard, [e.target.name]: e.target.value });
    };

    // Form submit fonksiyonları
    const handleAddCard = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.email) {
                throw new Error('Kullanıcı bilgisi bulunamadı');
            }

            const headers = {
                'X-User-Email': user.email,
                'Content-Type': 'application/json'
            };

            await axios.post('/credit-card', {
                email: user.email,
                bank_name: newCard.bank_name,
                card_limit: parseFloat(newCard.card_limit),
                current_balance: parseFloat(newCard.current_balance),
                due_date_start: newCard.due_date_start,
                due_date_end: newCard.due_date_end
            }, { headers });

            setSuccessMessage('Kart başarıyla eklendi');
            setNewCard({
                bank_name: '',
                card_limit: '',
                current_balance: '',
                due_date_start: '',
                due_date_end: ''
            });
            fetchCards(user.email);
        } catch (err) {
            console.error('Kart eklenirken hata:', err);
            setError(err.response?.data?.message || 'Kart eklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCard = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.email) {
                throw new Error('Kullanıcı bilgisi bulunamadı');
            }

            const headers = {
                'X-User-Email': user.email,
                'Content-Type': 'application/json'
            };

            await axios.put('/credit-card', {
                email: user.email,
                bank_name: updateCard.bank_name,
                card_limit: updateCard.card_limit ? parseFloat(updateCard.card_limit) : undefined,
                current_balance: updateCard.current_balance ? parseFloat(updateCard.current_balance) : undefined,
                due_date_start: updateCard.due_date_start || undefined,
                due_date_end: updateCard.due_date_end || undefined
            }, { headers });

            setSuccessMessage('Kart başarıyla güncellendi');
            setUpdateCard({
                bank_name: '',
                card_limit: '',
                current_balance: '',
                due_date_start: '',
                due_date_end: ''
            });
            fetchCards(user.email);
        } catch (err) {
            console.error('Kart güncellenirken hata:', err);
            setError(err.response?.data?.message || 'Kart güncellenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCard = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.email) {
                throw new Error('Kullanıcı bilgisi bulunamadı');
            }

            const headers = {
                'X-User-Email': user.email,
                'Content-Type': 'application/json'
            };

            await axios.delete('/credit-card', {
                data: {
                    email: user.email,
                    bank_name: deleteCard.bank_name
                },
                headers
            });

            setSuccessMessage('Kart başarıyla silindi');
            setDeleteCard({ bank_name: '' });
            fetchCards(user.email);
        } catch (err) {
            console.error('Kart silinirken hata:', err);
            setError(err.response?.data?.message || 'Kart silinirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.email) {
                throw new Error('Kullanıcı bilgisi bulunamadı');
            }

            const headers = {
                'X-User-Email': user.email,
                'Content-Type': 'application/json'
            };

            await axios.post('/make-payment', {
                email: user.email,
                odeme_turu: 'card',
                isim: paymentCard.bank_name,
                odeme_tutari: parseFloat(paymentCard.amount)
            }, { headers });

            setSuccessMessage('Ödeme başarıyla gerçekleştirildi');
            setPaymentCard({ bank_name: '', amount: '' });
            fetchCards(user.email);
        } catch (err) {
            console.error('Ödeme yapılırken hata:', err);
            setError(err.response?.data?.message || 'Ödeme yapılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center">
                <div className="text-green-600 text-xl">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <img
                        src={krediImage}
                        alt="Kredi Kartı Logo"
                        className="h-24 w-auto mx-auto mb-4"
                    />
                    <h1 className="text-3xl font-bold text-emerald-800">
                        Kredi Kartlarım
                    </h1>
                </div>

                {/* Error and Success Messages */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {successMessage}
                    </div>
                )}

                {/* Card Form */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-emerald-800 mb-4">Kart Bilgileri</h2>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Banka Adı</label>
                                <input
                                    type="text"
                                    name="bank_name"
                                    value={newCard.bank_name}
                                    onChange={handleNewCardChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kart Limiti</label>
                                <input
                                    type="number"
                                    name="card_limit"
                                    value={newCard.card_limit}
                                    onChange={handleNewCardChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Bakiye</label>
                                <input
                                    type="number"
                                    name="current_balance"
                                    value={newCard.current_balance}
                                    onChange={handleNewCardChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
                                <input
                                    type="date"
                                    name="due_date_start"
                                    value={newCard.due_date_start}
                                    onChange={handleNewCardChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
                                <input
                                    type="date"
                                    name="due_date_end"
                                    value={newCard.due_date_end}
                                    onChange={handleNewCardChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="submit"
                                onClick={handleAddCard}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                                Kart Ekle
                            </button>
                        </div>
                    </form>
                </div>

                {/* Update Card Form */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-emerald-800 mb-4">Kart Güncelle</h2>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Banka Adı</label>
                                <input
                                    type="text"
                                    name="bank_name"
                                    value={updateCard.bank_name}
                                    onChange={handleUpdateCardChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Limit</label>
                                <input
                                    type="number"
                                    name="card_limit"
                                    value={updateCard.card_limit}
                                    onChange={handleUpdateCardChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Bakiye</label>
                                <input
                                    type="number"
                                    name="current_balance"
                                    value={updateCard.current_balance}
                                    onChange={handleUpdateCardChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Başlangıç Tarihi</label>
                                <input
                                    type="date"
                                    name="due_date_start"
                                    value={updateCard.due_date_start}
                                    onChange={handleUpdateCardChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Bitiş Tarihi</label>
                                <input
                                    type="date"
                                    name="due_date_end"
                                    value={updateCard.due_date_end}
                                    onChange={handleUpdateCardChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="submit"
                                onClick={handleUpdateCard}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                                Kartı Güncelle
                            </button>
                        </div>
                    </form>
                </div>

                {/* Delete Card Form */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-emerald-800 mb-4">Kart Sil</h2>
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Banka Adı</label>
                            <input
                                type="text"
                                name="bank_name"
                                value={deleteCard.bank_name}
                                onChange={handleDeleteCardChange}
                                className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="submit"
                                onClick={handleDeleteCard}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Kartı Sil
                            </button>
                        </div>
                    </form>
                </div>

                {/* Payment Form */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-emerald-800 mb-4">Kart Ödemesi</h2>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Banka Adı</label>
                                <input
                                    type="text"
                                    name="bank_name"
                                    value={paymentCard.bank_name}
                                    onChange={handlePaymentCardChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Tutarı</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={paymentCard.amount}
                                    onChange={handlePaymentCardChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="submit"
                                onClick={handlePayment}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                                Ödeme Yap
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Cards;
