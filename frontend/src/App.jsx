import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import BoyLayout from './components/layout/BoyLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';

// Admin pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import Deliveries from './pages/Deliveries';
import Billing from './pages/Billing';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import ManageServiceRequests from './pages/ManageServiceRequests';
import ManageDeliveryBoys from './pages/ManageDeliveryBoys';
import ManageOrders from './pages/ManageOrders';
import ManageProducts from './pages/ManageProducts';

// Customer pages
import CustomerDashboard from './pages/CustomerDashboard';
import PlaceOrder from './pages/PlaceOrder';
import MyOrders from './pages/MyOrders';
import MyDeliveries from './pages/MyDeliveries';
import MyBills from './pages/MyBills';
import MyPayments from './pages/MyPayments';
import MyServiceRequest from './pages/MyServiceRequest';
import Products from './pages/Products';

// Delivery Boy pages
import BoyDashboard from './pages/BoyDashboard';
import MyAssignedOrders from './pages/MyAssignedOrders';
import BoyDeliveries from './pages/BoyDeliveries';
import BoyEarnings from './pages/BoyEarnings';

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

const roleRedirects = {
  ADMIN: '/dashboard',
  CUSTOMER: '/my-dashboard',
  DELIVERY_BOY: '/boy-dashboard',
};

function AppRoutes() {
  const { user } = useAuth();

  if (user) {
    const redirect = roleRedirects[user.role] || '/login';
    return (
      <Routes>
        <Route path="/login" element={<Navigate to={redirect} replace />} />
        <Route path="/register" element={<Navigate to={redirect} replace />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        {user.role === 'ADMIN' && (
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/add" element={<AddCustomer />} />
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/service-requests" element={<ManageServiceRequests />} />
            <Route path="/delivery-boys" element={<ManageDeliveryBoys />} />
            <Route path="/orders" element={<ManageOrders />} />
            <Route path="/products" element={<ManageProducts />} />
          </Route>
        )}
        {user.role === 'CUSTOMER' && (
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/my-dashboard" element={<CustomerDashboard />} />
            <Route path="/place-order" element={<PlaceOrder />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/my-deliveries" element={<MyDeliveries />} />
            <Route path="/my-bills" element={<MyBills />} />
            <Route path="/my-payments" element={<MyPayments />} />
            <Route path="/my-service-request" element={<MyServiceRequest />} />
            <Route path="/products" element={<Products />} />
          </Route>
        )}
        {user.role === 'DELIVERY_BOY' && (
          <Route element={<ProtectedRoute><BoyLayout /></ProtectedRoute>}>
            <Route path="/boy-dashboard" element={<BoyDashboard />} />
            <Route path="/boy-assigned" element={<MyAssignedOrders />} />
            <Route path="/boy-deliveries" element={<BoyDeliveries />} />
            <Route path="/boy-earnings" element={<BoyEarnings />} />
          </Route>
        )}
        <Route path="*" element={<Navigate to={redirect} replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
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
