import { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders, isLoading: loadingOrders } = useQuery(
    ['myOrders', user?.customerId],
    () => axiosInstance.get(`/orders/my/${user.customerId}`),
    { select: (res) => res.data, enabled: !!user?.customerId }
  );

  const { data: serviceReq, isLoading: loadingService } = useQuery(
    ['myServiceReq', user?.id],
    () => axiosInstance.get(`/service-requests/user/${user.id}`),
    { select: (res) => res.data, enabled: !!user?.id }
  );

  if (loadingOrders || loadingService) return <LoadingSpinner />;

  const recentOrders = (orders || []).slice(0, 5);
  const sr = Array.isArray(serviceReq) ? serviceReq[serviceReq.length - 1] : serviceReq;

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

  const quickActions = [
    { label: 'Place Order', icon: 'bi-cart-plus', color: '#6366f1', path: '/place-order' },
    { label: 'My Orders', icon: 'bi-box-seam', color: '#10b981', path: '/my-orders' },
    { label: 'My Deliveries', icon: 'bi-truck', color: '#f59e0b', path: '/my-deliveries' },
  ];

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-person-circle text-success"></i> My Dashboard</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
          Welcome back, {user?.username || 'Customer'}
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="glass-card p-4 animate-fade-in-up"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))',
              border: '1px solid rgba(16,185,129,0.15)'
            }}>
            <div className="d-flex align-items-center gap-3">
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'linear-gradient(135deg, #10b981, #6ee7b7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff'
              }}>
                <i className="bi bi-person"></i>
              </div>
              <div>
                <h5 className="fw-bold mb-1" style={{ color: 'var(--dark)' }}>{user?.username || 'Customer'}</h5>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-shield-check text-success me-1"></i>Active Customer
                  <span className="mx-2">|</span>
                  <i className="bi bi-box-seam me-1"></i>{(orders || []).length} total orders
                </p>
              </div>
            </div>
          </div>
        </div>

        {quickActions.map((a, i) => (
          <div className="col-md-4" key={i}>
            <div className="glass-card p-4 text-center animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${(i + 1) * 0.1}s`, cursor: 'pointer', border: `1px solid ${a.color}20` }}
              onClick={() => navigate(a.path)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: a.color + '15', color: a.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', margin: '0 auto 12px'
              }}>
                <i className={`bi ${a.icon}`}></i>
              </div>
              <h6 className="fw-bold mb-1" style={{ color: 'var(--dark)' }}>{a.label}</h6>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Click to {a.label.toLowerCase()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-md-7">
          <div className="glass-card p-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h6 className="fw-bold mb-3" style={{ color: 'var(--dark)' }}>
              <i className="bi bi-clock-history me-2" style={{ color: '#10b981' }}></i>Recent Orders
            </h6>
            {recentOrders.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-inbox"></i>
                <p>No orders yet. Place your first order!</p>
                <button className="btn btn-modern btn-modern-success px-4 mt-2"
                  onClick={() => navigate('/place-order')}>
                  <i className="bi bi-plus-lg me-1"></i>Place Order
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr><th>Order ID</th><th>Date</th><th>Type</th><th>Qty</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o, i) => (
                      <tr key={o.id || i} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                        <td style={{ fontSize: '0.82rem', color: '#64748b' }}>#{o.id}</td>
                        <td style={{ fontSize: '0.85rem' }}>{o.deliveryDate}</td>
                        <td><span className="badge-modern badge-info-custom">{o.milkType}</span></td>
                        <td className="fw-semibold">{o.quantity} L</td>
                        <td><span className={`badge-modern ${statusBadge(o.status)}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-5">
          <div className="glass-card p-4 animate-fade-in-up h-100" style={{ animationDelay: '0.4s' }}>
            <h6 className="fw-bold mb-3" style={{ color: 'var(--dark)' }}>
              <i className="bi bi-headset me-2" style={{ color: '#f59e0b' }}></i>Service Request Status
            </h6>
            {!sr ? (
              <div className="empty-state">
                <i className="bi bi-ticket"></i>
                <p>No service request submitted</p>
              </div>
            ) : sr.status === 'PENDING' ? (
              <div className="text-center py-3">
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem', margin: '0 auto 12px'
                }}>
                  <i className="bi bi-hourglass-split"></i>
                </div>
                <h6 className="fw-bold" style={{ color: '#f59e0b' }}>Pending Approval</h6>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Your request is under review</p>
              </div>
            ) : sr.status === 'APPROVED' ? (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge-modern badge-success-custom fs-6 px-3 py-2">
                    <i className="bi bi-check-circle me-1"></i>Approved
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Your request has been approved</p>
              </div>
            ) : sr.status === 'REJECTED' ? (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge-modern badge-danger-custom fs-6 px-3 py-2">
                    <i className="bi bi-x-circle me-1"></i>Rejected
                  </span>
                </div>
                {sr.adminNote && (
                  <div className="p-3 rounded-3" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 0 }}>
                      <i className="bi bi-chat-dots text-danger me-1"></i>
                      {sr.adminNote}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerDashboard;
