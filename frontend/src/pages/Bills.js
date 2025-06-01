import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import logo from '../assets/fatura.jpeg';

const Bills = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [bills, setBills] = useState([]);

    // Form state'leri
    const [billForm, setBillForm] = useState({
        bill_name: '',
        amount: '',
        category: '',
        start_date: '',
        end_date: '',
        is_paid: false,
        is_notification_enabled: true
    });

    const [paymentForm, setPaymentForm] = useState({
        odeme_turu: 'bill',
        isim: '',
        odeme_tutari: ''
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.email) {
            navigate('/login');
            return;
        }
        fetchBills(user.email);
    }, [navigate]);

    const fetchBills = async (email) => {
        try {
            const response = await axios.get('/unpaid-bills', {
                headers: {
                    'X-User-Email': email
                }
            });
            if (response.data && response.data.unpaid_bills) {
                setBills(response.data.unpaid_bills);
            }
        } catch (err) {
            console.error('Faturalar yüklenirken hata:', err);
            setError('Faturalar yüklenirken bir hata oluştu');
        }
    };

    const handleBillFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBillForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePaymentFormChange = (e) => {
        const { name, value } = e.target;
        setPaymentForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddBill = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await axios.post('/bill', {
                ...billForm,
                email: user.email
            });

            setSuccess('Fatura başarıyla eklendi');
            setBillForm({
                bill_name: '',
                amount: '',
                category: '',
                start_date: '',
                end_date: '',
                is_paid: false,
                is_notification_enabled: true
            });
            fetchBills(user.email);
        } catch (err) {
            setError(err.response?.data?.error || 'Fatura eklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBill = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await axios.put('/bill', {
                ...billForm,
                email: user.email
            });

            setSuccess('Fatura başarıyla güncellendi');
            fetchBills(user.email);
        } catch (err) {
            setError(err.response?.data?.error || 'Fatura güncellenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBill = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await axios.delete('/bill', {
                data: {
                    email: user.email,
                    bill_name: billForm.bill_name
                }
            });

            setSuccess('Fatura başarıyla silindi');
            setBillForm({
                bill_name: '',
                amount: '',
                category: '',
                start_date: '',
                end_date: '',
                is_paid: false,
                is_notification_enabled: true
            });
            fetchBills(user.email);
        } catch (err) {
            setError(err.response?.data?.error || 'Fatura silinirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleMakePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await axios.post('/make-payment', {
                ...paymentForm,
                email: user.email
            });

            setSuccess('Ödeme başarıyla gerçekleştirildi');
            setPaymentForm({
                odeme_turu: 'bill',
                isim: '',
                odeme_tutari: ''
            });
            fetchBills(user.email);
        } catch (err) {
            setError(err.response?.data?.error || 'Ödeme yapılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <img
                        src={logo}
                        alt="Fatura Logo"
                        className="h-24 w-auto mx-auto mb-4"
                    />
                    <h1 className="text-3xl font-bold text-emerald-800">
                        Faturalarım
                    </h1>
                </div>

                {/* Error and Success Messages */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                {/* Bill Form */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-emerald-800 mb-4">Fatura Bilgileri</h2>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fatura Adı</label>
                                <input
                                    type="text"
                                    name="bill_name"
                                    value={billForm.bill_name}
                                    onChange={handleBillFormChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tutar</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={billForm.amount}
                                    onChange={handleBillFormChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={billForm.category}
                                    onChange={handleBillFormChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={billForm.start_date}
                                    onChange={handleBillFormChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={billForm.end_date}
                                    onChange={handleBillFormChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-md border-2 border-gray-300">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_paid"
                                        checked={billForm.is_paid}
                                        onChange={handleBillFormChange}
                                        className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Ödendi mi?</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_notification_enabled"
                                        checked={billForm.is_notification_enabled}
                                        onChange={handleBillFormChange}
                                        className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Bildirim Gönderilsin mi?</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={handleAddBill}
                                disabled={loading}
                                className="bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 font-medium"
                            >
                                Fatura Ekle
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdateBill}
                                disabled={loading}
                                className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 font-medium"
                            >
                                Güncelle
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteBill}
                                disabled={loading}
                                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
                            >
                                Sil
                            </button>
                        </div>
                    </form>
                </div>

                {/* Payment Form */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-emerald-800 mb-4">Ödeme Yap</h2>
                    <form className="space-y-6" onSubmit={handleMakePayment}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Türü</label>
                                <select
                                    name="odeme_turu"
                                    value={paymentForm.odeme_turu}
                                    onChange={handlePaymentFormChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="bill">Fatura</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fatura Adı</label>
                                <select
                                    name="isim"
                                    value={paymentForm.isim}
                                    onChange={handlePaymentFormChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="">Fatura Seçin</option>
                                    {bills.map((bill, index) => (
                                        <option key={index} value={bill.bill_name}>
                                            {bill.bill_name} - {bill.amount} TL
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Tutarı</label>
                                <input
                                    type="number"
                                    name="odeme_tutari"
                                    value={paymentForm.odeme_tutari}
                                    onChange={handlePaymentFormChange}
                                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-emerald-600 text-white px-8 py-3 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 font-medium"
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

export default Bills; 