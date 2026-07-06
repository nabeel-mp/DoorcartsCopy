import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';

// Import your components
import Login from './Pages/Login';
import Register from './Pages/Register';
import Home from './Pages/Home';
import CategoryProducts from './Pages/CategoryProducts';
import ProductDetails from './Pages/ProductDetails';
import Cart from './Pages/Cart';
import Payment from './Pages/Payment';
import OrderHistory from './Pages/OrderHistory';
import OrderStatus from './Pages/OrderStatus';
import Wallet from './Pages/Wallet';
import Support from './Pages/Support';
import Account from './Pages/Account';
import OrderSuccess from './Pages/OrderSuccess';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center font-sans text-[#004AAD]">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Register /> : <Navigate to="/login" replace />} />

        <Route path="/home" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Home /></ProtectedRoute>} />
        <Route path="/category/:slug" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CategoryProducts /></ProtectedRoute>} />
        <Route path="/product/:slug" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProductDetails /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Cart /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Payment /></ProtectedRoute>} />
        <Route path="/order-history" element={<ProtectedRoute isAuthenticated={isAuthenticated}><OrderHistory /></ProtectedRoute>} />
        <Route path="/order-status" element={<ProtectedRoute isAuthenticated={isAuthenticated}><OrderStatus /></ProtectedRoute>} />
        <Route path="/order-status/:id" element={<ProtectedRoute isAuthenticated={isAuthenticated}><OrderStatus /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute isAuthenticated={isAuthenticated}><OrderSuccess /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Wallet /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Support /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Account /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}