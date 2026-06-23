import { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import Deliveries from './pages/Deliveries';
import Billing from './pages/Billing';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import MyDeliveries from './pages/MyDeliveries';
import MyBills from './pages/MyBills';
import MyPayments from './pages/MyPayments';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/dashboard' : '/my-deliveries'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'ADMIN' ? '/dashboard' : '/my-deliveries'} replace /> : <Register />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/customers" element={<AdminRoute><Customers /></AdminRoute>} />
        <Route path="/customers/add" element={<AdminRoute><AddCustomer /></AdminRoute>} />
        <Route path="/deliveries" element={<AdminRoute><Deliveries /></AdminRoute>} />
        <Route path="/billing" element={<AdminRoute><Billing /></AdminRoute>} />
        <Route path="/payments" element={<AdminRoute><Payments /></AdminRoute>} />
        <Route path="/notifications" element={<AdminRoute><Notifications /></AdminRoute>} />
        <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />

        <Route path="/my-deliveries" element={<MyDeliveries />} />
        <Route path="/my-bills" element={<MyBills />} />
        <Route path="/my-payments" element={<MyPayments />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
