import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const STATUS_META = {
  ASSIGNED: { label: 'Assigned', color: '#f59e0b', icon: 'bi-clock' },
  PICKED_UP: { label: 'Picked Up', color: '#f97316', icon: 'bi-box-seam' },
  DELIVERED: { label: 'Delivered', color: '#10b981', icon: 'bi-check-circle' },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', icon: 'bi-x-circle' },
};

const MyAssignedOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const deliveryBoyId = user?.deliveryBoyId;
  const [confirmAction, setConfirmAction] = useState(null);

  const { data: orders, isLoading } = useQuery(
    ['assignedOrders', deliveryBoyId],
    () => axiosInstance.get(`/orders/assigned/${deliveryBoyId}`),
    {
      select: (res) => (res.data || []).filter((o) => o.status === 'ASSIGNED' || o.status === 'PICKED_UP'),
      enabled: !!deliveryBoyId,
    }
  );

  const updateStatus = useMutation(
    ({ id, status }) => axiosInstance.put(`/orders/${id}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['assignedOrders', deliveryBoyId]);
        toast.success('Order status updated');
        setConfirmAction(null);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to update order'),
    }
  );

  if (isLoading) return <LoadingSpinner />;

  const handleConfirm = () => {
    if (confirmAction) {
      updateStatus.mutate(confirmAction);
    }
  };

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-list-task me-2" style={{ color: '#f59e0b' }}></i>My Assigned Orders</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
          Manage your pickups and deliveries
        </p>
      </div>

      {(!orders || orders.length === 0) ? (
        <div className="glass-card animate-fade-in-up d-flex flex-column align-items-center justify-content-center py-5">
          <div
            className="d-flex align-items-center justify-content-center mb-3"
            style={{
              width: 80, height: 80, borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,146,60,0.1))',
              color: '#f59e0b', fontSize: '2rem',
            }}>
            <i className="bi bi-box-seam"></i>
          </div>
          <p className="fw-semibold mb-1" style={{ color: '#475569' }}>No orders assigned</p>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Check back later!</p>
        </div>
      ) : (
        <div className="row g-3">
          {orders.map((o, i) => {
            const meta = STATUS_META[o.status] || STATUS_META.ASSIGNED;
            return (
              <div className="col-md-6 col-lg-4" key={o.id || i}>
                <div
                  className="glass-card p-4 animate-fade-in-up h-100"
                  style={{
                    border: `1px solid ${meta.color}20`,
                    background: `linear-gradient(135deg, ${meta.color}08, transparent)`,
                    animationDelay: `${i * 0.05}s`,
                  }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="fw-bold mb-1" style={{ color: 'var(--dark)' }}>{o.customerName || 'Customer'}</h6>
                      <p className="mb-0" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        <i className="bi bi-telephone me-1"></i>{o.customerPhone || '-'}
                      </p>
                    </div>
                    <span
                      className="badge px-3 py-2"
                      style={{
                        background: `${meta.color}15`,
                        color: meta.color, borderRadius: '10px',
                        fontSize: '0.75rem', fontWeight: 600,
                      }}>
                      <i className={`bi ${meta.icon} me-1`}></i>{meta.label}
                    </span>
                  </div>

                  <div className="mb-3" style={{ fontSize: '0.85rem', color: '#475569' }}>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-geo-alt me-2" style={{ color: '#f59e0b' }}></i>
                      <span>{o.address || 'No address'}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-droplet me-2" style={{ color: '#f59e0b' }}></i>
                      <span>{o.milkType || 'Milk'} — <strong>{o.quantity || 0}L</strong></span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-clock me-2" style={{ color: '#f59e0b' }}></i>
                      <span>{o.deliveryTime || '7:00 AM'}</span>
                    </div>
                  </div>

                  {o.notes && (
                    <p className="mb-3 p-2" style={{
                      fontSize: '0.78rem', color: '#64748b',
                      background: 'rgba(245,158,11,0.06)', borderRadius: '8px',
                      border: '1px solid rgba(245,158,11,0.1)',
                    }}>
                      <i className="bi bi-chat-square-text me-1"></i>{o.notes}
                    </p>
                  )}

                  <div className="d-flex gap-2">
                    {o.status === 'ASSIGNED' && (
                      <button
                        className="btn btn-sm flex-fill py-2 fw-semibold"
                        onClick={() => setConfirmAction({ id: o.id, status: 'PICKED_UP', name: o.customerName })}
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                          color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.8rem',
                          boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                        }}>
                        <i className="bi bi-box-seam me-1"></i> Picked Up
                      </button>
                    )}
                    {o.status === 'PICKED_UP' && (
                      <button
                        className="btn btn-sm flex-fill py-2 fw-semibold"
                        onClick={() => setConfirmAction({ id: o.id, status: 'DELIVERED', name: o.customerName })}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #34d399)',
                          color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.8rem',
                          boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                        }}>
                        <i className="bi bi-check-circle me-1"></i> Delivered
                      </button>
                    )}
                    {o.status !== 'ASSIGNED' && o.status !== 'PICKED_UP' && (
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>Completed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmAction && (
        <div className="modern-modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-exclamation-circle me-2" style={{ color: '#f59e0b' }}></i>
                Confirm Status Update
              </h6>
              <button className="btn p-0 border-0" style={{ color: '#94a3b8' }}
                onClick={() => setConfirmAction(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modern-modal-body">
              <p className="mb-0" style={{ fontSize: '0.9rem', color: '#475569' }}>
                Are you sure you want to mark order for <strong>{confirmAction.name}</strong> as{' '}
                <strong>{STATUS_META[confirmAction.status]?.label}</strong>?
              </p>
            </div>
            <div className="modern-modal-footer">
              <button
                className="btn btn-modern px-4"
                style={{
                  background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px',
                }}
                onClick={() => setConfirmAction(null)}>
                Cancel
              </button>
              <button
                className="btn btn-modern px-4 fw-semibold"
                onClick={handleConfirm}
                disabled={updateStatus.isLoading}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                  color: '#fff', border: 'none', borderRadius: '10px',
                }}>
                {updateStatus.isLoading ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MyAssignedOrders;
