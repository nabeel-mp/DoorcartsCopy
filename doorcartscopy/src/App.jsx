import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your components
import Login from './Pages/Login';
import Register from './Pages/Register';
import Home from './Pages/Home';
import ProductDetails from './Pages/ProductDetails';
import Cart from './Pages/Cart';
import Payment from './Pages/Payment';
import OrderHistory from './Pages/OrderHistory';
import OrderStatus from './Pages/OrderStatus';
import Wallet from './Pages/Wallet';

// 1. Define ProtectedRoute directly in this file
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulating an initial auth check
  useEffect(() => {
    const checkAuth = async () => {
      // Replace with actual token validation logic
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []); ;

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center font-['Plus_Jakarta_Sans'] text-[#004AAD]">Loading...</div>; 
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          // element={
          //   isAuthenticated ? <Navigate to="/home" replace /> : <Login />
          // }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <Register />
          }
        />

        {/* Protected Routes */}
        {/* <Route
          path="/home"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Home />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/product"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProductDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-status"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <OrderStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Wallet />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}