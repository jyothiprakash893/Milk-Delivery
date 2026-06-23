import { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RANGE_FILTERS = [
  { key: 'today', label: 'Today', icon: 'bi-calendar-day' },
  { key: 'week', label: 'This Week', icon: 'bi-calendar-week' },
  { key: 'month', label: 'This Month', icon: 'bi-calendar-month' },
];

const BoyDeliveries = () => {
  const { user } = useAuth();
  const deliveryBoyId = user?.deliveryBoyId;
  const [activeRange, setActiveRange] = useState('today');

  const { data: orders, isLoading } = useQuery(
    ['assignedOrders', deliveryBoyId],
    () => axiosInstance.get(`/orders/assigned/${deliveryBoyId}`),
    {
      select: (res) => (res.data || []).filter((o) => o.status === 'DELIVERED'),
      enabled: !!deliveryBoyId,
    }
  );

  if (isLoading) return <LoadingSpinner />;

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const isInRange = (dateStr, range) => {
    const d = new Date(dateStr);
    if (range === 'today') return d >= startOfDay;
    if (range === 'week') return d >= startOfWeek;
    if (range === 'month') return d >= startOfMonth;
    return true;
  };

  const filtered = (orders || []).filter((o) => isInRange(o.updatedAt, activeRange));
  const totalDeliveries = filtered.length;

  return (
    <div>
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center animate-fade-in">
        <div>
          <h4><i className="bi bi-truck me-2" style={{ color: '#f59e0b' }}></i>Delivery History</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Completed deliveries overview</p>
        </div>
        {totalDeliveries > 0 && (
          <div
            className="px-4 py-2 fw-bold"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,146,60,0.1))',
              color: '#d97706', borderRadius: '12px', fontSize: '0.9rem',
              border: '1px solid rgba(245,158,11,0.25)',
            }}>
            <i className="bi bi-check-circle me-1"></i> {totalDeliveries} Delivery{totalDeliveries !== 1 ? 'ies' : 'y'}
          </div>
        )}
      </div>

      <div className="d-flex gap-2 mb-3 animate-fade-in-up">
        {RANGE_FILTERS.map((f) => (
          <button
            key={f.key}
            className="btn btn-sm px-3 py-2 fw-semibold"
            onClick={() => setActiveRange(f.key)}
            style={{
              background: activeRange === f.key
                ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                : 'rgba(245,158,11,0.08)',
              color: activeRange === f.key ? '#fff' : '#d97706',
              border: activeRange === f.key
                ? 'none'
                : '1px solid rgba(245,158,11,0.25)',
              borderRadius: '10px', fontSize: '0.8rem',
              transition: 'all 0.2s ease',
            }}>
            <i className={`bi ${f.icon} me-1`}></i> {f.label}
          </button>
        ))}
      </div>

      <div className="glass-card animate-fade-in-up">
        {filtered.length === 0 ? (
          <div className="empty-state py-5">
            <div
              className="d-flex align-items-center justify-content-center mb-3 mx-auto"
              style={{
                width: 70, height: 70, borderRadius: 18,
                background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,146,60,0.08))',
                color: '#f59e0b', fontSize: '1.6rem',
              }}>
              <i className="bi bi-truck"></i>
            </div>
            <p style={{ color: '#475569' }}>No deliveries in this period</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Milk Type</th>
                  <th>Quantity</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => (
                  <tr key={o.id || i} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {new Date(o.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: '0.75rem',
                          }}>
                          {o.customerName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>{o.customerName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{o.milkType || 'Milk'}</td>
                    <td className="fw-semibold">{o.quantity || 0} L</td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{o.deliveryTime || '-'}</td>
                    <td>
                      <span
                        className="badge px-3 py-2"
                        style={{
                          background: 'rgba(16,185,129,0.12)',
                          color: '#10b981', borderRadius: '10px',
                          fontSize: '0.75rem', fontWeight: 600,
                        }}>
                        <i className="bi bi-check-circle me-1"></i> Delivered
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default BoyDeliveries;
