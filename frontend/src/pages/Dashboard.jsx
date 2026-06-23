import { useState } from 'react';
import { useTodayDeliveries } from '../hooks/useDeliveries';
import { useActiveCustomers } from '../hooks/useCustomers';
import { useAllBills, useUnpaidBills } from '../hooks/useBilling';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const Dashboard = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: deliveries, isLoading: loadDel } = useTodayDeliveries();
  const { data: customers, isLoading: loadCust } = useActiveCustomers();
  const { data: bills, isLoading: loadBills } = useAllBills(month, year);
  const { data: unpaid } = useUnpaidBills();

  if (loadDel || loadCust || loadBills) return <LoadingSpinner />;

  const deliveredCount = deliveries?.filter(d => d.delivered).length || 0;
  const pendingCount = deliveries?.filter(d => !d.delivered && !d.skipped).length || 0;
  const skippedCount = deliveries?.filter(d => d.skipped).length || 0;

  const stats = [
    { label: 'Active Customers', value: customers?.length || 0, icon: 'bi-people', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', delay: 1 },
    { label: 'Today Delivered', value: deliveredCount, icon: 'bi-check-circle', color: '#10b981', bg: 'rgba(16,185,129,0.1)', delay: 2 },
    { label: 'Pending', value: pendingCount, icon: 'bi-clock', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', delay: 3 },
    { label: 'Skipped', value: skippedCount, icon: 'bi-x-circle', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', delay: 4 },
    { label: 'This Month Bills', value: bills?.length || 0, icon: 'bi-cash-coin', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', delay: 5 },
    { label: 'Unpaid Dues', value: unpaid?.length || 0, icon: 'bi-exclamation-triangle', color: '#ec4899', bg: 'rgba(236,72,153,0.1)', delay: 6 },
  ];

  const chartData = deliveries?.slice(0, 12).map(d => ({
    name: d.customerName?.split(' ')[0] || 'N/A',
    quantity: d.quantity || 0,
  })) || [];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const pieData = [
    { name: 'Delivered', value: deliveredCount },
    { name: 'Pending', value: pendingCount },
    { name: 'Skipped', value: skippedCount },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-speedometer2"></i> Dashboard</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="row g-3 mb-4">
        {stats.map((s, i) => (
          <div className="col-md-4 col-lg-2" key={i}>
            <div className={`stat-card animate-fade-in-up animate-delay-${s.delay}`}
              style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="stat-icon" style={{ background: s.color + '20', color: s.color }}>
                    <i className={`bi ${s.icon}`}></i>
                  </div>
                  <span className="stat-value">{s.value}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="glass-card p-4 animate-fade-in-up animate-delay-3">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--dark)' }}>
              <i className="bi bi-bar-chart me-2" style={{ color: 'var(--primary)' }}></i>Today's Quantities
            </h6>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="quantity" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a5b4fc" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card p-4 animate-fade-in-up animate-delay-4 h-100">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--dark)' }}>
              <i className="bi bi-pie-chart me-2" style={{ color: 'var(--secondary)' }}></i>Today's Status
            </h6>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <i className="bi bi-inbox"></i>
                <p>No data for today</p>
              </div>
            )}
            <div className="d-flex justify-content-center gap-3 mt-2">
              {pieData.map((d, i) => (
                <div key={i} className="d-flex align-items-center gap-1">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i] }}></div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
