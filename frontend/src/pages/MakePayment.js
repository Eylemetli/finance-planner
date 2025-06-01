import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/make-payment.jpeg';
import axios from '../utils/axios';

function MakePayment() {
    const [formData, setFormData] = useState({
        odeme_turu: '',
        isim: '',
        odeme_tutari: ''
    });
    const [bills, setBills] = useState([]);
    const [cards, setCards] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    // Kullanıcı bilgilerini kontrol et
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.email) {
            navigate('/login');
            return;
        }
        setUserEmail(user.email);
    }, [navigate]);

    // Ödenmemiş faturaları ve kartları getir
    useEffect(() => {
        const fetchData = async () => {
            if (!userEmail) return;

            setLoading(true);
            setError('');
            try {
                // Ödenmemiş faturaları getir
                const billsResponse = await axios.get('/unpaid-bills', {
                    headers: {
                        'X-User-Email': userEmail
                    }
                });
                if (billsResponse.data && billsResponse.data.unpaid_bills) {
                    setBills(billsResponse.data.unpaid_bills);
                }

                // Kartları getir
                const cardsResponse = await axios.get('/unpaid-cards', {
                    headers: {
                        'X-User-Email': userEmail
                    }
                });
                if (cardsResponse.data && cardsResponse.data.credit_cards) {
                    setCards(cardsResponse.data.credit_cards);
                }
            } catch (err) {
                console.error('Veri yükleme hatası:', err);
                if (err.response && err.response.data && err.response.data.error) {
                    setError(err.response.data.error);
                } else {
                    setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userEmail]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Hata mesajını temizle
        setError('');
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setDataLoading(true);

        // Form validasyonu
        if (!formData.odeme_turu || !formData.isim || !formData.odeme_tutari) {
            setError('Lütfen tüm alanları doldurun.');
            setDataLoading(false);
            return;
        }

        try {
            const response = await axios.post('/make-payment', {
                email: userEmail,
                odeme_turu: formData.odeme_turu,
                isim: formData.isim,
                odeme_tutari: parseFloat(formData.odeme_tutari)
            }, {
                headers: {
                    'X-User-Email': userEmail
                }
            });

            setSuccess('Ödeme başarıyla gerçekleştirildi!');
            setFormData({
                odeme_turu: '',
                isim: '',
                odeme_tutari: ''
            });

            // Faturaları güncelle
            if (formData.odeme_turu === 'bill') {
                const billsResponse = await axios.get('/unpaid-bills', {
                    headers: {
                        'X-User-Email': userEmail
                    }
                });
                if (billsResponse.data && billsResponse.data.unpaid_bills) {
                    setBills(billsResponse.data.unpaid_bills);
                }
            }
        } catch (err) {
            console.error('Ödeme hatası:', err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setDataLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                {/* Logo ve Başlık */}
                <div className="text-center mb-8">
                    <img src={logo} alt="Logo" className="w-24 h-24 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900">Ödemelerim</h2>
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

                {/* Ödeme Formu */}
                <form onSubmit={handlePayment} className="space-y-6">
                    {/* Ödeme Türü */}
                    <div>
                        <label htmlFor="odeme_turu" className="block text-sm font-medium text-gray-700">
                            Ödeme Türü
                        </label>
                        <select
                            id="odeme_turu"
                            name="odeme_turu"
                            value={formData.odeme_turu}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                            required
                        >
                            <option value="">Seçiniz</option>
                            <option value="bill">Fatura</option>
                            <option value="card">Kart</option>
                        </select>
                    </div>

                    {/* İsim (Fatura/Kart) */}
                    <div>
                        <label htmlFor="isim" className="block text-sm font-medium text-gray-700">
                            {formData.odeme_turu === 'bill' ? 'Fatura' : 'Kart'}
                        </label>
                        <select
                            id="isim"
                            name="isim"
                            value={formData.isim}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                            required
                        >
                            <option value="">Seçiniz</option>
                            {formData.odeme_turu === 'bill' ? (
                                bills.map((bill) => (
                                    <option key={bill.bill_name} value={bill.bill_name}>
                                        {bill.bill_name} - {bill.amount}₺
                                    </option>
                                ))
                            ) : (
                                cards.map((card) => (
                                    <option key={card.bank_name} value={card.bank_name}>
                                        {card.bank_name} - {card.card_number ? card.card_number.slice(-4) : '****'}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Ödeme Tutarı */}
                    <div>
                        <label htmlFor="odeme_tutari" className="block text-sm font-medium text-gray-700">
                            Ödeme Tutarı
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                id="odeme_tutari"
                                name="odeme_tutari"
                                value={formData.odeme_tutari}
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

                    {/* Ödeme Yap Butonu */}
                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={dataLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {dataLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    İşlem Yapılıyor...
                                </div>
                            ) : (
                                'Ödeme Yap'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MakePayment; 