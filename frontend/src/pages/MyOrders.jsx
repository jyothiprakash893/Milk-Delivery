import { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import axiosInstance from '../api/axiosInstance';

const TABS = ['All', 'Pending', 'Delivered', 'Cancelled'];

const statusBadge = (status) => {
  const map = {
    PENDING: 'badge-warning-custom',
    ASSIGNED: 'badge-info-custom',
    PICKED_UP: 'badge-primary-custom',
    DELIVERED: 'badge-success-custom',
    CANCELLED: 'badge-danger-custom',
  };
  return map[status] || 'badge-warning-custom';
};

const MyOrders = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');

  const { data: orders, isLoading } = useQuery(
    ['myOrders', user?.customerId],
    () => axiosInstance.get(`/orders/my/${user.customerId}`),
    { select: (res) => res.data, enabled: !!user?.customerId }
  );

  if (isLoading) return <LoadingSpinner />;

  const filtered = activeTab === 'All'
    ? (orders || [])
    : (orders || []).filter((o) => o.status === activeTab.toUpperCase());

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-box-seam"></i> My Orders</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
          {(orders || []).length} total orders
        </p>
      </div>

      <div className="glass-card animate-fade-in-up">
        <div className="px-4 pt-3 pb-2">
          <div className="d-flex gap-2 flex-wrap">
            {TABS.map((tab) => (
              <button key={tab} className={`btn btn-sm px-3 py-1 ${activeTab === tab ? 'btn-modern btn-modern-primary' : ''}`}
                style={{
                  borderRadius: '20px', fontSize: '0.82rem',
                  background: activeTab === tab ? '' : '#f1f5f9',
                  color: activeTab === tab ? '#fff' : '#64748b',
                  border: 'none'
                }}
                onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Milk Type</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <i className="bi bi-inbox"></i>
                      <p>No orders yet. Place your first order!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((o, i) => (
                  <tr key={o.id || i} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>#{o.id}</td>
                    <td style={{ fontSize: '0.85rem' }}>{o.deliveryDate}</td>
                    <td><span className="badge-modern badge-info-custom">{o.milkType}</span></td>
                    <td className="fw-semibold">{o.quantity} L</td>
                    <td>
                      <span className={`badge-modern ${statusBadge(o.status)}`}>
                        <i className={`bi ${o.status === 'DELIVERED' ? 'bi-check-circle' : o.status === 'CANCELLED' ? 'bi-x-circle' : 'bi-clock'} me-1`}></i>
                        {o.status}
                      </span>
                    </td>
                    <td className="fw-bold" style={{ color: 'var(--dark)' }}>
                      {o.totalAmount != null ? `₹${o.totalAmount}` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default MyOrders;
