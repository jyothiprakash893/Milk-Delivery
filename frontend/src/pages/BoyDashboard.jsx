import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const BoyDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const deliveryBoyId = user?.deliveryBoyId;

  const { data: profile, isLoading: profileLoading } = useQuery(
    ['deliveryBoyProfile', deliveryBoyId],
    () => axiosInstance.get(`/delivery-boys/${deliveryBoyId}`),
    { select: (res) => res.data, enabled: !!deliveryBoyId }
  );

  const { data: assignedOrders, isLoading: ordersLoading } = useQuery(
    ['assignedOrders', deliveryBoyId],
    () => axiosInstance.get(`/orders/assigned/${deliveryBoyId}`),
    { select: (res) => res.data, enabled: !!deliveryBoyId }
  );

  const toggleAvailability = useMutation(
    () => axiosInstance.put(`/delivery-boys/${deliveryBoyId}/toggle-availability`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['deliveryBoyProfile', deliveryBoyId]);
        toast.success('Availability updated');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
    }
  );

  if (profileLoading || ordersLoading) return <LoadingSpinner />;

  const orders = assignedOrders || [];
  const assignedCount = orders.filter((o) => o.status === 'ASSIGNED').length;
  const pickedUpCount = orders.filter((o) => o.status === 'PICKED_UP').length;
  const deliveredToday = orders.filter(
    (o) => o.status === 'DELIVERED' && new Date(o.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  const isOnline = profile?.isAvailable ?? true;

  const stats = [
    { label: 'Assigned Orders', value: assignedCount, icon: 'bi-clipboard-check', color: '#f59e0b' },
    { label: 'Pending Pickups', value: pickedUpCount, icon: 'bi-box-seam', color: '#f97316' },
    { label: 'Delivered Today', value: deliveredToday, icon: 'bi-check-circle', color: '#10b981' },
    { label: 'Rating', value: profile?.rating ? `${profile.rating.toFixed(1)} ⭐` : 'N/A', icon: 'bi-star', color: '#eab308' },
  ];

  const recentActivity = [...orders]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center animate-fade-in">
        <div>
          <h4><i className="bi bi-speedometer2 me-2" style={{ color: '#f59e0b' }}></i>Delivery Dashboard</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          className="btn px-4 py-2 fw-semibold"
          onClick={() => toggleAvailability.mutate()}
          disabled={toggleAvailability.isLoading}
          style={{
            background: isOnline
              ? 'linear-gradient(135deg, #10b981, #34d399)'
              : 'linear-gradient(135deg, #ef4444, #f87171)',
            color: '#fff', border: 'none', borderRadius: '12px', fontSize: '0.85rem',
            boxShadow: isOnline
              ? '0 4px 15px rgba(16,185,129,0.3)'
              : '0 4px 15px rgba(239,68,68,0.3)',
            transition: 'all 0.3s ease',
          }}>
          <i className={`bi ${isOnline ? 'bi-toggle-on' : 'bi-toggle-off'} me-2`}></i>
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      <div className="row g-3 mb-4">
        {stats.map((s, i) => (
          <div className="col-md-3 col-6" key={i}>
            <div
              className="glass-card p-3 animate-fade-in-up"
              style={{
                border: `1px solid ${s.color}25`,
                background: `linear-gradient(135deg, ${s.color}10, ${s.color}05)`,
                animationDelay: `${(i + 1) * 0.1}s`,
              }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `linear-gradient(135deg, ${s.color}25, ${s.color}10)`,
                    color: s.color, fontSize: '1.2rem',
                  }}>
                  <i className={`bi ${s.icon}`}></i>
                </div>
                <span className="fw-bold" style={{ fontSize: '1.5rem', color: s.color }}>{s.value}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-md-7">
          <div className="glass-card p-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h6 className="fw-bold mb-3" style={{ color: 'var(--dark)' }}>
              <i className="bi bi-clock-history me-2" style={{ color: '#f59e0b' }}></i>Recent Activity
            </h6>
            {recentActivity.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-inbox"></i>
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {recentActivity.map((o, i) => {
                  const statusIcon = o.status === 'ASSIGNED' ? 'bi-clock' : o.status === 'PICKED_UP' ? 'bi-box-seam' : 'bi-check-circle';
                  const statusColor = o.status === 'ASSIGNED' ? '#f59e0b' : o.status === 'PICKED_UP' ? '#f97316' : '#10b981';
                  return (
                    <div
                      key={o.id || i}
                      className="d-flex align-items-center gap-3 p-2 animate-fade-in"
                      style={{
                        borderRadius: '10px', background: 'rgba(245,158,11,0.04)',
                        animationDelay: `${i * 0.05}s`,
                      }}>
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: `${statusColor}15`, color: statusColor, fontSize: '0.9rem',
                        }}>
                        <i className={`bi ${statusIcon}`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{o.customerName || 'Customer'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{o.milkType || 'Milk'} · {o.quantity || 0}L</div>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: `${statusColor}15`, color: statusColor,
                          borderRadius: '8px', fontSize: '0.7rem', fontWeight: 500,
                        }}>
                        {o.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-5">
          <div
            className="glass-card p-4 animate-fade-in-up h-100 d-flex flex-column justify-content-center align-items-center text-center"
            style={{
              animationDelay: '0.4s',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(251,146,60,0.05))',
              border: '1px solid rgba(245,158,11,0.2)',
            }}>
            <div
              className="d-flex align-items-center justify-content-center mb-3"
              style={{
                width: 80, height: 80, borderRadius: 20,
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                color: '#fff', fontSize: '2rem',
                boxShadow: '0 8px 25px rgba(245,158,11,0.3)',
              }}>
              <i className="bi bi-person-badge"></i>
            </div>
            <h5 className="fw-bold mb-1">{profile?.name || 'Delivery Boy'}</h5>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{profile?.email || ''}</p>
            <div className="d-flex gap-2 mt-2">
              {profile?.rating && (
                <span
                  className="badge px-3 py-2"
                  style={{ background: 'rgba(234,179,8,0.15)', color: '#ca8a04', borderRadius: '10px', fontSize: '0.8rem' }}>
                  <i className="bi bi-star-fill me-1"></i>{profile.rating.toFixed(1)}
                </span>
              )}
              <span
                className="badge px-3 py-2"
                style={{
                  background: isOnline ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: isOnline ? '#10b981' : '#ef4444',
                  borderRadius: '10px', fontSize: '0.8rem',
                }}>
                <i className={`bi ${isOnline ? 'bi-circle-fill' : 'bi-circle'} me-1`}></i>
                {isOnline ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BoyDashboard;
