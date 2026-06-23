import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getAllRequests, getPendingRequests, approveRequest, rejectRequest } from '../api/serviceRequestApi';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';

const statusBadge = (status) => {
  const map = {
    PENDING: { cls: 'badge-warning-custom', label: 'Pending' },
    APPROVED: { cls: 'badge-success-custom', label: 'Approved' },
    REJECTED: { cls: 'badge-danger-custom', label: 'Rejected' },
  };
  const s = map[status] || { cls: 'badge-info-custom', label: status };
  return <span className={`badge-modern ${s.cls}`}>{s.label}</span>;
};

const ManageServiceRequests = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('pending');
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');

  const { data: allRequests, isLoading } = useQuery(
    ['allServiceRequests', tab],
    () => tab === 'pending' ? getPendingRequests() : getAllRequests(),
    { select: (res) => res.data }
  );

  const approveMutation = useMutation(
    ({ id, adminNote }) => approveRequest(id, { adminNote }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allServiceRequests');
        toast.success('Service request approved');
        setApproveModal(null);
        setNote('');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to approve'),
    }
  );

  const rejectMutation = useMutation(
    ({ id, adminNote }) => rejectRequest(id, { adminNote }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allServiceRequests');
        toast.success('Service request rejected');
        setRejectModal(null);
        setReason('');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to reject'),
    }
  );

  if (isLoading) return <LoadingSpinner />;

  const pending = (allRequests || []).filter((r) => r.status === 'PENDING');
  const processed = (allRequests || []).filter((r) => r.status !== 'PENDING');
  const displayList = tab === 'pending' ? pending : processed;

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-clipboard-check"></i> Manage Service Requests</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
          {pending.length} pending requests
        </p>
      </div>

      <div className="glass-card animate-fade-in-up">
        <div className="p-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div className="d-flex gap-2">
            <button
              className={`btn ${tab === 'pending' ? 'btn-modern btn-modern-primary' : 'btn-modern-outline'}`}
              style={{ borderRadius: '50px', padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}
              onClick={() => setTab('pending')}
            >
              <i className="bi bi-hourglass-split me-1"></i> Pending ({pending.length})
            </button>
            <button
              className={`btn ${tab === 'all' ? 'btn-modern btn-modern-primary' : 'btn-modern-outline'}`}
              style={{ borderRadius: '50px', padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}
              onClick={() => setTab('all')}
            >
              <i className="bi bi-list-ul me-1"></i> Approved / Rejected
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Date</th>
                <th>Status</th>
                {(tab === 'all' || tab === 'pending') && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {displayList.length === 0 ? (
                <tr><td colSpan="7">
                  <div className="empty-state">
                    <i className="bi bi-inbox"></i>
                    <p>{tab === 'pending' ? 'No pending requests' : 'No processed requests'}</p>
                  </div>
                </td></tr>
              ) : (
                displayList.map((r, i) => (
                  <tr key={r.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: 'linear-gradient(135deg, #6366f1, #a5b4fc)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '0.85rem'
                        }}>
                          {r.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="fw-semibold">{r.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{r.phone || '-'}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>{r.address || '-'}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td>{statusBadge(r.status)}</td>
                    {(tab === 'all' || tab === 'pending') && (
                      <td className="text-end">
                        {r.status === 'PENDING' && (
                          <>
                            <button className="btn btn-sm me-1" style={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: '#fff', border: 'none', borderRadius: '8px',
                              fontSize: '0.8rem', padding: '0.35rem 0.85rem'
                            }} onClick={() => setApproveModal(r)}>
                              <i className="bi bi-check-lg me-1"></i> Approve
                            </button>
                            <button className="btn btn-sm" style={{
                              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                              border: 'none', borderRadius: '8px',
                              fontSize: '0.8rem', padding: '0.35rem 0.85rem'
                            }} onClick={() => { setRejectModal(r); setReason(''); }}>
                              <i className="bi bi-x-lg me-1"></i> Reject
                            </button>
                          </>
                        )}
                        {r.adminNote && (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            Note: {r.adminNote}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {approveModal && (
        <div className="modern-modal-overlay" onClick={() => setApproveModal(null)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header">
              <h6 className="fw-bold mb-0"><i className="bi bi-check-circle text-success me-2"></i>Approve Request</h6>
              <button className="btn btn-sm" style={{ border: 'none', background: 'none', fontSize: '1.25rem' }}
                onClick={() => setApproveModal(null)}><i className="bi bi-x"></i></button>
            </div>
            <div className="modern-modal-body">
              <p style={{ fontSize: '0.9rem', color: '#475569' }} className="mb-3">
                Approve request from <strong>{approveModal.name}</strong>?
              </p>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Admin Note (optional)
                </label>
                <textarea
                  className="form-control form-control-modern"
                  rows="3"
                  placeholder="Add a note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="modern-modal-footer">
              <button className="btn btn-modern-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => { setApproveModal(null); setNote(''); }}>Cancel</button>
              <button className="btn btn-modern btn-modern-success"
                onClick={() => approveMutation.mutate({ id: approveModal.id, adminNote: note })}
                disabled={approveMutation.isLoading}>
                {approveMutation.isLoading ? 'Approving...' : 'Confirm Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="modern-modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header">
              <h6 className="fw-bold mb-0"><i className="bi bi-x-circle text-danger me-2"></i>Reject Request</h6>
              <button className="btn btn-sm" style={{ border: 'none', background: 'none', fontSize: '1.25rem' }}
                onClick={() => setRejectModal(null)}><i className="bi bi-x"></i></button>
            </div>
            <div className="modern-modal-body">
              <p style={{ fontSize: '0.9rem', color: '#475569' }} className="mb-3">
                Reject request from <strong>{rejectModal.name}</strong>?
              </p>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Reason <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control form-control-modern ${!reason.trim() && rejectModal.touched ? 'is-invalid' : ''}`}
                  rows="3"
                  placeholder="Please provide a reason for rejection..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
                {!reason.trim() && rejectModal.touched && (
                  <div className="text-danger" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Reason is required</div>
                )}
              </div>
            </div>
            <div className="modern-modal-footer">
              <button className="btn btn-modern-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => { setRejectModal(null); setReason(''); }}>Cancel</button>
              <button className="btn btn-modern btn-modern-danger"
                onClick={() => {
                  if (!reason.trim()) {
                    setRejectModal({ ...rejectModal, touched: true });
                    return;
                  }
                  rejectMutation.mutate({ id: rejectModal.id, adminNote: reason });
                }}
                disabled={rejectMutation.isLoading}>
                {rejectMutation.isLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageServiceRequests;
