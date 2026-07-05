import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

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

// Redirects to /login if there is no authenticated session.
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
      <div className="flex h-screen items-center justify-center font-['Plus_Jakarta_Sans'] text-[#004AAD]">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Register /> : <Navigate to="/login" replace />}
        />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category/:slug"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CategoryProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:slug"
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
          path="/order-status/:id"
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
          element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />}
        />
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