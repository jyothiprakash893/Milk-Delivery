import { useState } from 'react';
import { useAllBills, useGenerateBills, useUnpaidBills } from '../hooks/useBilling';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Billing = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: bills, isLoading } = useAllBills(month, year);
  const { data: unpaid } = useUnpaidBills();
  const generateMutation = useGenerateBills();

  const handleGenerate = () => {
    if (window.confirm(`Generate bills for ${month}/${year}?`)) {
      generateMutation.mutate({ month, year });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const totalAmount = (bills || []).reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPaid = (bills || []).filter(b => b.paid).reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalUnpaid = totalAmount - totalPaid;

  const summaryCards = [
    { label: 'Total Billed', value: totalAmount, icon: 'bi-cash-stack', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Collected', value: totalPaid, icon: 'bi-check-circle', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Outstanding', value: totalUnpaid, icon: 'bi-exclamation-triangle', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  ];

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center animate-fade-in flex-wrap gap-2">
        <div>
          <h4><i className="bi bi-cash-coin"></i> Billing</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{bills?.length || 0} bills for this month</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
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
          <button className="btn btn-modern btn-modern-primary px-4" onClick={handleGenerate}
            disabled={generateMutation.isLoading} style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-gear me-1"></i>{generateMutation.isLoading ? 'Generating...' : 'Generate Bills'}
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {summaryCards.map((s, i) => (
          <div className="col-md-4" key={i}>
            <div className="stat-card animate-fade-in-up animate-delay-1"
              style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: '0.25rem' }}>{s.label}</div>
                    <div className="fw-bold" style={{ fontSize: '1.5rem', color: s.color }}>₹{s.value.toFixed(2)}</div>
                  </div>
                  <div className="stat-icon" style={{ background: s.color + '15', color: s.color }}>
                    <i className={`bi ${s.icon}`}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card animate-fade-in-up">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <h6 className="fw-bold mb-0">
            <i className="bi bi-receipt me-2" style={{ color: 'var(--primary)' }}></i>
            Bills for {month}/{year}
          </h6>
        </div>
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Days</th>
                <th>Litres</th>
                <th>Price/L</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(!bills || bills.length === 0) ? (
                <tr><td colSpan="8">
                  <div className="empty-state">
                    <i className="bi bi-receipt"></i>
                    <p>No bills generated for this month</p>
                  </div>
                </td></tr>
              ) : (
                bills.map((b, i) => (
                  <tr key={b.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{i + 1}</td>
                    <td className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: 'linear-gradient(135deg, #6366f1, #a5b4fc)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '0.75rem'
                        }}>#{b.customerId}</div>
                        Customer #{b.customerId}
                      </div>
                    </td>
                    <td className="fw-semibold">{b.totalDaysDelivered}</td>
                    <td>{b.totalLitres} L</td>
                    <td>₹{b.pricePerLitre}</td>
                    <td className="fw-bold" style={{ color: 'var(--dark)' }}>₹{b.totalAmount}</td>
                    <td>
                      {b.paid
                        ? <span className="badge-modern badge-success-custom"><i className="bi bi-check me-1"></i>Paid</span>
                        : <span className="badge-modern badge-warning-custom"><i className="bi bi-clock me-1"></i>Unpaid</span>}
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm px-2 py-1" style={{
                        background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: 'none', borderRadius: '8px'
                      }} title="Download PDF">
                        <i className="bi bi-file-pdf"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {unpaid && unpaid.length > 0 && (
        <div className="glass-card mt-3 animate-fade-in-up"
          style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="px-4 py-3 d-flex align-items-center gap-2"
            style={{ borderBottom: '1px solid #f1f5f9' }}>
            <i className="bi bi-exclamation-triangle-fill text-danger"></i>
            <h6 className="fw-bold mb-0">Unpaid Bills ({unpaid.length})</h6>
          </div>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr><th>Customer</th><th>Amount</th><th>Period</th></tr>
              </thead>
              <tbody>
                {unpaid.map((b, i) => (
                  <tr key={b.id || i}>
                    <td className="fw-semibold">Customer #{b.customerId}</td>
                    <td className="fw-bold text-danger">₹{b.totalAmount}</td>
                    <td style={{ color: '#64748b' }}>{b.month}/{b.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default Billing;
