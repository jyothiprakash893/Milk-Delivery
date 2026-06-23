import { useState } from 'react';
import { useTodayDeliveries, useMarkDelivered, useMarkSkipped, useDeliveryHistory } from '../hooks/useDeliveries';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const Deliveries = () => {
  const { data: deliveries, isLoading } = useTodayDeliveries();
  const markDelivered = useMarkDelivered();
  const markSkipped = useMarkSkipped();
  const [selectedCust, setSelectedCust] = useState(null);
  const [skipReason, setSkipReason] = useState('');
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipCustId, setSkipCustId] = useState(null);
  const [viewHistoryId, setViewHistoryId] = useState(null);
  const { data: history } = useDeliveryHistory(viewHistoryId);

  if (isLoading) return <LoadingSpinner />;

  const handleMarkDelivered = (custId) => {
    if (window.confirm('Mark this delivery as done?')) {
      markDelivered.mutate({ custId, quantity: 1 });
    }
  };

  const handleSkip = () => {
    if (!skipReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    markSkipped.mutate({ custId: skipCustId, reason: skipReason });
    setShowSkipModal(false);
    setSkipReason('');
    setSkipCustId(null);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0"><i className="bi bi-truck me-2"></i>Today's Deliveries</h4>
        <span className="badge bg-primary fs-6">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Area</th>
                  <th>Qty (L)</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!deliveries || deliveries.length === 0) ? (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No deliveries for today</td></tr>
                ) : (
                  deliveries.map((d, i) => (
                    <tr key={d.customerId || i} className={d.delivered ? 'table-success' : d.skipped ? 'table-danger' : ''}>
                      <td>{i + 1}</td>
                      <td><strong>{d.customerName || 'Unknown'}</strong></td>
                      <td>{d.phone || '-'}</td>
                      <td>{d.area || '-'}</td>
                      <td>{d.quantity || '-'}</td>
                      <td>{d.deliveryTime || '7:00 AM'}</td>
                      <td>
                        {d.delivered ? (
                          <span className="badge bg-success">Delivered</span>
                        ) : d.skipped ? (
                          <span className="badge bg-danger" title={d.skipReason}>Skipped</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Pending</span>
                        )}
                      </td>
                      <td>
                        {!d.delivered && !d.skipped && (
                          <>
                            <button className="btn btn-sm btn-success me-1"
                              onClick={() => handleMarkDelivered(d.customerId)}
                              disabled={markDelivered.isLoading}>
                              <i className="bi bi-check-lg"></i> Done
                            </button>
                            <button className="btn btn-sm btn-danger"
                              onClick={() => { setSkipCustId(d.customerId); setShowSkipModal(true); }}>
                              <i className="bi bi-x-lg"></i> Skip
                            </button>
                          </>
                        )}
                        <button className="btn btn-sm btn-outline-info ms-1"
                          onClick={() => setViewHistoryId(viewHistoryId === d.customerId ? null : d.customerId)}>
                          <i className="bi bi-clock-history"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showSkipModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Skip Delivery</h5>
                <button type="button" className="btn-close" onClick={() => setShowSkipModal(false)}></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Reason for skipping:</label>
                <textarea className="form-control" rows="3"
                  value={skipReason} onChange={(e) => setSkipReason(e.target.value)}
                  placeholder="e.g., Customer out of town"></textarea>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowSkipModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleSkip}>Confirm Skip</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewHistoryId && history && (
        <div className="card mt-3 shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0"><i className="bi bi-clock-history me-2"></i>Delivery History</h6>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setViewHistoryId(null)}>Close</button>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead className="table-light">
                  <tr><th>Date</th><th>Status</th><th>Reason</th></tr>
                </thead>
                <tbody>
                  {(history || []).map((h, i) => (
                    <tr key={i}>
                      <td>{h.deliveryDate}</td>
                      <td>{h.delivered ? <span className="badge bg-success">Delivered</span> : <span className="badge bg-danger">Skipped</span>}</td>
                      <td>{h.skipReason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Deliveries;
