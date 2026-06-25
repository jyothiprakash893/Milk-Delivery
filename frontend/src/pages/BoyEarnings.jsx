import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BoyEarnings = () => {
  const { user } = useAuth();
  const deliveryBoyId = user?.deliveryBoyId;

  const { data: orders, isLoading } = useQuery(
    ['assignedOrders', deliveryBoyId],
    () => axiosInstance.get(`/orders/assigned/${deliveryBoyId}`),
    {
      select: (res) => res.data || [],
      enabled: !!deliveryBoyId,
    }
  );

  const stats = useMemo(() => {
    const delivered = (orders || []).filter((o) => o.status === 'DELIVERED');
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const today = delivered.filter((o) => new Date(o.updatedAt) >= startOfDay);
    const week = delivered.filter((o) => new Date(o.updatedAt) >= startOfWeek);
    const month = delivered.filter((o) => new Date(o.updatedAt) >= startOfMonth);

    const totalLitres = (arr) => arr.reduce((s, o) => s + (o.quantity || 0), 0);
    const avgPerLitre = 55;

    return [
      {
        label: "Today's Earnings",
        deliveries: today.length,
        litres: totalLitres(today),
        earnings: totalLitres(today) * avgPerLitre,
        icon: 'bi-sun',
        gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
        glow: 'rgba(245,158,11,0.3)',
      },
      {
        label: "This Week",
        deliveries: week.length,
        litres: totalLitres(week),
        earnings: totalLitres(week) * avgPerLitre,
        icon: 'bi-calendar-week',
        gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
        glow: 'rgba(217,119,6,0.3)',
      },
      {
        label: "This Month",
        deliveries: month.length,
        litres: totalLitres(month),
        earnings: totalLitres(month) * avgPerLitre,
        icon: 'bi-calendar-month',
        gradient: 'linear-gradient(135deg, #b45309, #d97706)',
        glow: 'rgba(180,83,9,0.3)',
      },
    ];
  }, [orders]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-cash-coin me-2" style={{ color: '#f59e0b' }}></i>My Earnings</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
          Track your delivery earnings at a glance
        </p>
      </div>

      <div className="row g-3">
        {stats.map((s, i) => (
          <div className="col-md-4" key={s.label}>
            <div
              className="glass-card p-4 animate-fade-in-up h-100 position-relative overflow-hidden"
              style={{
                border: 'none',
                background: s.gradient,
                animationDelay: `${(i + 1) * 0.12}s`,
                boxShadow: `0 8px 32px ${s.glow}`,
              }}>
              <div
                className="position-absolute"
                style={{
                  top: '-20px', right: '-20px', fontSize: '6rem',
                  color: 'rgba(255,255,255,0.08)', lineHeight: 1,
                }}>
                <i className={`bi ${s.icon}`}></i>
              </div>
              <div className="d-flex justify-content-between align-items-start mb-3 position-relative">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff', fontSize: '1.3rem',
                  }}>
                  <i className={`bi ${s.icon}`}></i>
                </div>
                <span
                  className="badge fw-semibold"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff', borderRadius: '10px', fontSize: '0.75rem',
                  }}>
                  {s.deliveries} delivery{s.deliveries !== 1 ? 'ies' : 'y'}
                </span>
              </div>
              <div className="position-relative">
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                  ₹{s.earnings.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>
                  {s.litres}L delivered
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <div
            className="glass-card p-4 animate-fade-in-up"
            style={{
              border: '1px solid rgba(245,158,11,0.2)',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(251,146,60,0.03))',
              animationDelay: '0.5s',
            }}>
            <h6 className="fw-bold mb-3" style={{ color: 'var(--dark)' }}>
              <i className="bi bi-pie-chart me-2" style={{ color: '#f59e0b' }}></i>Performance
            </h6>
            <div className="d-flex justify-content-around text-center">
              <div>
                <div className="fw-bold" style={{ fontSize: '1.3rem', color: '#f59e0b' }}>{stats[2].deliveries}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Month Total</div>
              </div>
              <div>
                <div className="fw-bold" style={{ fontSize: '1.3rem', color: '#f97316' }}>{stats[2].litres}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Litres This Month</div>
              </div>
              <div>
                <div className="fw-bold" style={{ fontSize: '1.3rem', color: '#d97706' }}>
                  {stats[2].deliveries > 0 ? (stats[2].litres / stats[2].deliveries).toFixed(1) : '0'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Avg L/Delivery</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div
            className="glass-card p-4 animate-fade-in-up"
            style={{
              border: '1px solid rgba(245,158,11,0.2)',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(251,146,60,0.03))',
              animationDelay: '0.6s',
            }}>
            <h6 className="fw-bold mb-3" style={{ color: 'var(--dark)' }}>
              <i className="bi bi-currency-rupee me-2" style={{ color: '#f59e0b' }}></i>Earnings Breakdown
            </h6>
            <div className="d-flex justify-content-around text-center">
              <div>
                <div className="fw-bold" style={{ fontSize: '1.3rem', color: '#10b981' }}>₹{stats[0].earnings.toFixed(0)}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Today</div>
              </div>
              <div>
                <div className="fw-bold" style={{ fontSize: '1.3rem', color: '#f59e0b' }}>₹{stats[1].earnings.toFixed(0)}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>This Week</div>
              </div>
              <div>
                <div className="fw-bold" style={{ fontSize: '1.3rem', color: '#d97706' }}>₹{stats[2].earnings.toFixed(0)}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>This Month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BoyEarnings;
