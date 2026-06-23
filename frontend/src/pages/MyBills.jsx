import { useAuth } from '../context/AuthContext';
import { useCustomerBills } from '../hooks/useBilling';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyBills = () => {
  const { user } = useAuth();
  const { data: bills, isLoading } = useCustomerBills(user?.customerId);

  if (isLoading) return <LoadingSpinner />;

  const totalDue = (bills || []).filter(b => !b.paid).reduce((s, b) => s + (b.totalAmount || 0), 0);

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center animate-fade-in">
        <div>
          <h4><i className="bi bi-cash-coin"></i> My Bills</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{bills?.length || 0} bills</p>
        </div>
        {totalDue > 0 && (
          <div className="stat-card p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Due</div>
            <div className="fw-bold text-danger" style={{ fontSize: '1.2rem' }}>₹{totalDue.toFixed(2)}</div>
          </div>
        )}
      </div>
      <div className="glass-card animate-fade-in-up">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr><th>Month</th><th>Year</th><th>Days</th><th>Litres</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {(!bills || bills.length === 0) ? (
                <tr><td colSpan="6"><div className="empty-state"><i className="bi bi-receipt"></i><p>No bills found</p></div></td></tr>
              ) : (
                bills.map((b, i) => (
                  <tr key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                      {new Date(2000, b.month - 1).toLocaleString('en', { month: 'long' })}
                    </td>
                    <td style={{ color: '#64748b' }}>{b.year}</td>
                    <td>{b.totalDaysDelivered}</td>
                    <td>{b.totalLitres} L</td>
                    <td className="fw-bold">₹{b.totalAmount}</td>
                    <td>
                      {b.paid
                        ? <span className="badge-modern badge-success-custom"><i className="bi bi-check me-1"></i>Paid</span>
                        : <span className="badge-modern badge-warning-custom"><i className="bi bi-clock me-1"></i>Unpaid</span>}
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
export default MyBills;
