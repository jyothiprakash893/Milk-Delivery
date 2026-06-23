import { useState } from 'react';
import { useTodayDeliveries, useMarkDelivered, useMarkSkipped, useDeliveryHistory } from '../hooks/useDeliveries';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const Deliveries = () => {
  const { data: deliveries, isLoading } = useTodayDeliveries();
  const markDelivered = useMarkDelivered();
  const markSkipped = useMarkSkipped();
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipCustId, setSkipCustId] = useState(null);
  const [skipReason, setSkipReason] = useState('');
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

  const statusBadge = (d) => {
    if (d.delivered) return <span className="badge-modern badge-success-custom"><i className="bi bi-check-circle me-1"></i>Delivered</span>;
    if (d.skipped) return <span className="badge-modern badge-danger-custom"><i className="bi bi-x-circle me-1"></i>Skipped</span>;
    return <span className="badge-modern badge-warning-custom"><i className="bi bi-clock me-1"></i>Pending</span>;
  };

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center animate-fade-in">
        <div>
          <h4><i className="bi bi-truck"></i> Today's Deliveries</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className="badge-modern badge-info-custom fs-6 px-3 py-2">
          {deliveries?.filter(d => d.delivered).length || 0}/{deliveries?.length || 0} done
        </span>
      </div>

      <div className="glass-card animate-fade-in-up">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Area</th>
                <th>Qty</th>
                <th>Time</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(!deliveries || deliveries.length === 0) ? (
                <tr><td colSpan="8">
                  <div className="empty-state">
                    <i className="bi bi-inbox"></i>
                    <p>No deliveries for today</p>
                  </div>
                </td></tr>
              ) : (
                deliveries.map((d, i) => (
                  <tr key={d.customerId || i} className={`animate-fade-in ${d.delivered ? 'table-success' : d.skipped ? '' : ''}`}
                    style={{
                      animationDelay: `${i * 0.03}s`,
                      background: d.delivered ? 'rgba(16,185,129,0.03)' : d.skipped ? 'rgba(239,68,68,0.03)' : ''
                    }}>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: 34, height: 34, borderRadius: 9,
                          background: d.delivered
                            ? 'linear-gradient(135deg, #10b981, #6ee7b7)'
                            : d.skipped
                              ? 'linear-gradient(135deg, #ef4444, #fca5a5)'
                              : 'linear-gradient(135deg, #f59e0b, #fde68a)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '0.8rem'
                        }}>
                          {d.customerName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>{d.customerName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{d.phone || '-'}</td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{d.area || '-'}</td>
                    <td className="fw-semibold">{d.quantity || '-'} L</td>
                    <td style={{ fontSize: '0.85rem' }}>{d.deliveryTime || '7:00 AM'}</td>
                    <td>{statusBadge(d)}</td>
                    <td className="text-end">
                      {!d.delivered && !d.skipped && (
                        <>
                          <button className="btn btn-sm px-3 py-1 me-1 btn-modern btn-modern-success"
                            onClick={() => handleMarkDelivered(d.customerId)}
                            disabled={markDelivered.isLoading}
                            style={{ fontSize: '0.78rem' }}>
                            <i className="bi bi-check-lg me-1"></i> Done
                          </button>
                          <button className="btn btn-sm px-3 py-1 me-1 btn-modern btn-modern-danger"
                            onClick={() => { setSkipCustId(d.customerId); setShowSkipModal(true); }}
                            style={{ fontSize: '0.78rem' }}>
                            <i className="bi bi-x-lg me-1"></i> Skip
                          </button>
                        </>
                      )}
                      <button className="btn btn-sm px-2 py-1" style={{
                        background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: 'none',
                        borderRadius: '8px', fontSize: '0.8rem'
                      }} onClick={() => setViewHistoryId(viewHistoryId === d.customerId ? null : d.customerId)}>
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

      {/* Skip Modal */}
      {showSkipModal && (
        <div className="modern-modal-overlay" onClick={() => setShowSkipModal(false)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header">
              <h6 className="fw-bold mb-0"><i className="bi bi-x-circle text-danger me-2"></i>Skip Delivery</h6>
              <button className="btn p-0 border-0" style={{ color: '#94a3b8' }}
                onClick={() => setShowSkipModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modern-modal-body">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Reason for skipping:</label>
              <textarea className="form-control form-control-modern" rows="3"
                value={skipReason} onChange={(e) => setSkipReason(e.target.value)}
                placeholder="e.g., Customer out of town, holiday, etc."></textarea>
            </div>
            <div className="modern-modal-footer">
              <button className="btn btn-modern px-4" style={{
                background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px'
              }} onClick={() => setShowSkipModal(false)}>Cancel</button>
              <button className="btn btn-modern btn-modern-danger px-4"
                onClick={handleSkip}>Confirm Skip</button>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {viewHistoryId && history && (
        <div className="glass-card mt-3 animate-slide-right">
          <div className="px-4 py-3 d-flex justify-content-between align-items-center"
            style={{ borderBottom: '1px solid #f1f5f9' }}>
            <h6 className="fw-bold mb-0"><i className="bi bi-clock-history me-2" style={{ color: 'var(--primary)' }}></i>Delivery History</h6>
            <button className="btn btn-sm px-3 py-1" style={{
              background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px'
            }} onClick={() => setViewHistoryId(null)}>Close</button>
          </div>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr><th>Date</th><th>Status</th><th>Reason</th></tr>
              </thead>
              <tbody>
                {(history || []).length === 0 ? (
                  <tr><td colSpan="3"><div className="empty-state"><i className="bi bi-inbox"></i><p>No history</p></div></td></tr>
                ) : (
                  (history || []).map((h, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: '0.85rem' }}>{h.deliveryDate}</td>
                      <td>{h.delivered
                        ? <span className="badge-modern badge-success-custom">Delivered</span>
                        : <span className="badge-modern badge-danger-custom">Skipped</span>}</td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{h.skipReason || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default Deliveries;
