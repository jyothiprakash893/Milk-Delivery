import { useAuth } from '../context/AuthContext';
import { useCustomerBills } from '../hooks/useBilling';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyBills = () => {
  const { user } = useAuth();
  const { data: bills, isLoading } = useCustomerBills(user?.customerId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="mb-4"><i className="bi bi-cash-coin me-2"></i>My Bills</h4>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr><th>Month</th><th>Year</th><th>Days Delivered</th><th>Total Litres</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {(!bills || bills.length === 0) ? (
                  <tr><td colSpan="6" className="text-center py-4 text-muted">No bills found</td></tr>
                ) : (
                  bills.map((b, i) => (
                    <tr key={i}>
                      <td>{new Date(2000, b.month - 1).toLocaleString('en', { month: 'long' })}</td>
                      <td>{b.year}</td>
                      <td>{b.totalDaysDelivered}</td>
                      <td>{b.totalLitres} L</td>
                      <td><strong>₹{b.totalAmount}</strong></td>
                      <td>
                        {b.paid
                          ? <span className="badge bg-success">Paid</span>
                          : <span className="badge bg-warning text-dark">Unpaid</span>}
                      </td>
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
export default MyBills;
