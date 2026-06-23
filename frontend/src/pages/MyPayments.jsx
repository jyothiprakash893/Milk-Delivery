import { useAuth } from '../context/AuthContext';
import { usePaymentHistory } from '../hooks/usePayments';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyPayments = () => {
  const { user } = useAuth();
  const { data: payments, isLoading } = usePaymentHistory(user?.customerId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="mb-4"><i className="bi bi-wallet2 me-2"></i>My Payments</h4>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr><th>Date</th><th>Amount</th><th>Mode</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {(!payments || payments.length === 0) ? (
                  <tr><td colSpan="4" className="text-center py-4 text-muted">No payments found</td></tr>
                ) : (
                  payments.map((p, i) => (
                    <tr key={i}>
                      <td>{p.paymentDate}</td>
                      <td><strong>₹{p.amountPaid}</strong></td>
                      <td><span className="badge bg-info">{p.paymentMode}</span></td>
                      <td>{p.notes || '-'}</td>
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
export default MyPayments;
