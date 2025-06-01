import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/reports.jpg';
import axios from '../utils/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Reports() {
    const [reportType, setReportType] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    const reportTypes = [
        { value: 'monthly_balance', label: 'Gelir-Gider Dengesi' },
        { value: 'category_spending', label: 'Kategori Bazlı Harcama' }
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.email) {
            navigate('/login');
            return;
        }
        setUserEmail(user.email);
    }, [navigate]);

    const handleGenerateReport = async () => {
        if (!reportType) {
            setError('Lütfen rapor tipini seçin.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/generate_report', {
                report_type: reportType,
                year: parseInt(year),
                email: userEmail
            }, {
                headers: {
                    'X-User-Email': userEmail
                }
            });

            setReportData(response.data);
        } catch (err) {
            console.error('Rapor oluşturma hatası:', err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Rapor oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderMonthlyBalanceChart = () => {
        if (!reportData?.monthly_data) return null;

        return (
            <div className="h-[400px] w-full">
                <h4 className="text-xl font-semibold text-center mb-4" style={{ color: '#2196f3' }}>
                    Gelir - Gider Dengesi
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.monthly_data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: '#2196f3' }}
                            axisLine={{ stroke: '#2196f3' }}
                        />
                        <YAxis
                            tick={{ fill: '#2196f3' }}
                            axisLine={{ stroke: '#2196f3' }}
                        />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#4caf50"
                            name="Gelir"
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="expense"
                            stroke="#f44336"
                            name="Gider"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderCategorySpendingChart = () => {
        if (!reportData?.category_data) return null;

        return (
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={reportData.category_data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                            {reportData.category_data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₺${value.toFixed(2)}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Logo ve Başlık */}
                <div className="text-center mb-8">
                    <img
                        src={logo}
                        alt="Logo"
                        className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-md"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                    />
                    <h2 className="text-3xl font-bold text-emerald-800">Raporlar</h2>
                </div>

                {/* Hata Mesajı */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Rapor Formu */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
                                Rapor Tipi
                            </label>
                            <select
                                id="reportType"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                            >
                                <option value="">Seçiniz</option>
                                {reportTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                                Yıl
                            </label>
                            <input
                                type="number"
                                id="year"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                min="2000"
                                max="2100"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                            />
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Rapor Oluşturuluyor...
                                </div>
                            ) : (
                                'Raporu Oluştur'
                            )}
                        </button>
                    </div>
                </div>

                {/* Grafik */}
                {reportData && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-emerald-800 mb-4">
                            {reportType === 'monthly_balance' ? 'Aylık Gelir-Gider Dengesi' : 'Kategori Bazlı Harcama Dağılımı'}
                        </h3>
                        {reportType === 'monthly_balance' ? renderMonthlyBalanceChart() : renderCategorySpendingChart()}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reports; 