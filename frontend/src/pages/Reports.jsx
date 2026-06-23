import { useState } from 'react';
import { useMonthlyReport } from '../hooks/useDeliveries';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const Reports = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { data: report, isLoading } = useMonthlyReport(month, year);

  if (isLoading) return <LoadingSpinner />;

  const data = report?.customerReports || report || [];
  const chartData = (Array.isArray(data) ? data : []).slice(0, 15).map(d => ({
    name: d.customerName?.split(' ')[0] || `#${d.customerId}`,
    delivered: d.totalDelivered || 0,
    skipped: d.totalSkipped || 0,
    litres: d.totalLitres || 0,
  }));

  const totalDeliveries = (Array.isArray(data) ? data : []).reduce((s, d) => s + (d.totalDelivered || 0), 0);
  const totalSkipped = (Array.isArray(data) ? data : []).reduce((s, d) => s + (d.totalSkipped || 0), 0);
  const totalLitres = (Array.isArray(data) ? data : []).reduce((s, d) => s + (d.totalLitres || 0), 0);
  const deliveryRate = totalDeliveries + totalSkipped > 0
    ? ((totalDeliveries / (totalDeliveries + totalSkipped)) * 100).toFixed(1)
    : 'N/A';

  const summaryCards = [
    { label: 'Customers', value: (Array.isArray(data) ? data : []).length, icon: 'bi-people', color: '#6366f1' },
    { label: 'Total Delivered', value: totalDeliveries, icon: 'bi-check-circle', color: '#10b981' },
    { label: 'Skipped', value: totalSkipped, icon: 'bi-x-circle', color: '#ef4444' },
    { label: 'Total Litres', value: totalLitres + ' L', icon: 'bi-droplet', color: '#06b6d4' },
    { label: 'Delivery Rate', value: deliveryRate !== 'N/A' ? deliveryRate + '%' : 'N/A', icon: 'bi-graph-up', color: '#f59e0b' },
  ];

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2 animate-fade-in">
        <div>
          <h4><i className="bi bi-graph-up"></i> Monthly Reports</h4>
        </div>
        <div className="d-flex gap-2">
          <select className="form-select form-control-modern" style={{ width: '100px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('en', { month: 'short' })}</option>
            ))}
          </select>
          <select className="form-select form-control-modern" style={{ width: '90px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {summaryCards.map((s, i) => (
          <div className="col" key={i} style={{ minWidth: '160px' }}>
            <div className="stat-card animate-fade-in-up animate-delay-1"
              style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color, width: 36, height: 36, fontSize: '1rem' }}>
                    <i className={`bi ${s.icon}`}></i>
                  </div>
                  <span className="fw-bold" style={{ fontSize: '1.3rem', color: s.color }}>{s.value}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="glass-card p-4 animate-fade-in-up animate-delay-2">
            <h6 className="fw-bold mb-3"><i className="bi bi-bar-chart me-2" style={{ color: 'var(--primary)' }}></i>Delivery Overview</h6>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey="delivered" fill="#10b981" name="Delivered" radius={[4, 4, 0, 0]} />
                <Bar dataKey="skipped" fill="#ef4444" name="Skipped" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-12">
          <div className="glass-card p-4 animate-fade-in-up animate-delay-3">
            <h6 className="fw-bold mb-3"><i className="bi bi-droplet me-2" style={{ color: '#06b6d4' }}></i>Litres Supplied</h6>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="litres" stroke="#06b6d4" name="Litres" strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Reports;
