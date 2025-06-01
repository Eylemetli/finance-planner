import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import BudgetOverview from './pages/BudgetOverview';
import Cards from './pages/Cards';
import Bills from './pages/Bills';
import MakePayment from './pages/MakePayment';
import SpendingLog from './pages/SpendingLog';
import Reports from './pages/Reports';

// Protected Route bileşeni
const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/home" element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />
                    <Route path="/cards" element={
                        <ProtectedRoute>
                            <Cards />
                        </ProtectedRoute>
                    } />
                    <Route path="/bills" element={
                        <ProtectedRoute>
                            <Bills />
                        </ProtectedRoute>
                    } />
                    <Route path="/budget" element={
                        <ProtectedRoute>
                            <BudgetOverview />
                        </ProtectedRoute>
                    } />
                    <Route path="/make-payment" element={
                        <ProtectedRoute>
                            <MakePayment />
                        </ProtectedRoute>
                    } />
                    <Route path="/spending-log" element={
                        <ProtectedRoute>
                            <SpendingLog />
                        </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App; 