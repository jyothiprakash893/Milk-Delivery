import { useAuth } from '../context/AuthContext';
import { useDeliveryHistory } from '../hooks/useDeliveries';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyDeliveries = () => {
  const { user } = useAuth();
  const { data: history, isLoading } = useDeliveryHistory(user?.customerId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="mb-4"><i className="bi bi-truck me-2"></i>My Delivery History</h4>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr><th>Date</th><th>Quantity</th><th>Status</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {(!history || history.length === 0) ? (
                  <tr><td colSpan="4" className="text-center py-4 text-muted">No delivery records found</td></tr>
                ) : (
                  history.map((d, i) => (
                    <tr key={i} className={d.delivered ? 'table-success' : 'table-danger'}>
                      <td>{d.deliveryDate}</td>
                      <td>{d.quantity || '-'} L</td>
                      <td>
                        {d.delivered
                          ? <span className="badge bg-success">Delivered</span>
                          : <span className="badge bg-danger">Skipped</span>}
                      </td>
                      <td>{d.skipReason || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MyDeliveries;
