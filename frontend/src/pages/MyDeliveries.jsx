import { useAuth } from '../context/AuthContext';
import { useDeliveryHistory } from '../hooks/useDeliveries';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyDeliveries = () => {
  const { user } = useAuth();
  const { data: history, isLoading } = useDeliveryHistory(user?.customerId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-truck"></i> My Delivery History</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Track all your daily milk deliveries</p>
      </div>
      <div className="glass-card animate-fade-in-up">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr><th>Date</th><th>Quantity</th><th>Status</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {(!history || history.length === 0) ? (
                <tr><td colSpan="4"><div className="empty-state"><i className="bi bi-inbox"></i><p>No delivery records found</p></div></td></tr>
              ) : (
                history.map((d, i) => (
                  <tr key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td style={{ fontSize: '0.85rem' }}>{d.deliveryDate}</td>
                    <td className="fw-semibold">{d.quantity || '-'} L</td>
                    <td>
                      {d.delivered
                        ? <span className="badge-modern badge-success-custom"><i className="bi bi-check-circle me-1"></i>Delivered</span>
                        : <span className="badge-modern badge-danger-custom"><i className="bi bi-x-circle me-1"></i>Skipped</span>}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{d.skipReason || '-'}</td>
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
export default MyDeliveries;
