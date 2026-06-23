import { useAuth } from '../context/AuthContext';
import { usePaymentHistory } from '../hooks/usePayments';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyPayments = () => {
  const { user } = useAuth();
  const { data: payments, isLoading } = usePaymentHistory(user?.customerId);

  if (isLoading) return <LoadingSpinner />;

  const totalPaid = (payments || []).reduce((s, p) => s + (p.amountPaid || 0), 0);

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center animate-fade-in">
        <div>
          <h4><i className="bi bi-wallet2"></i> My Payments</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Your payment history</p>
        </div>
        {totalPaid > 0 && (
          <div className="stat-card p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Paid</div>
            <div className="fw-bold text-success" style={{ fontSize: '1.2rem' }}>₹{totalPaid.toFixed(2)}</div>
          </div>
        )}
      </div>
      <div className="glass-card animate-fade-in-up">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr><th>Date</th><th>Amount</th><th>Mode</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {(!payments || payments.length === 0) ? (
                <tr><td colSpan="4"><div className="empty-state"><i className="bi bi-inbox"></i><p>No payments found</p></div></td></tr>
              ) : (
                payments.map((p, i) => (
                  <tr key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td style={{ fontSize: '0.85rem' }}>{p.paymentDate}</td>
                    <td className="fw-bold" style={{ color: '#10b981' }}>₹{p.amountPaid}</td>
                    <td><span className="badge-modern badge-info-custom">{p.paymentMode}</span></td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{p.notes || '-'}</td>
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
export default MyPayments;
