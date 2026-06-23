import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getAllOrders, assignOrder, updateOrderStatus } from '../api/orderApi';
import { getAvailableBoys } from '../api/deliveryBoyApi';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';

const statusBadge = (status) => {
  const map = {
    PENDING: { cls: 'badge-warning-custom', label: 'Pending' },
    ASSIGNED: { cls: 'badge-info-custom', label: 'Assigned' },
    PICKED_UP: { cls: 'badge-primary-custom', label: 'Picked Up' },
    DELIVERED: { cls: 'badge-success-custom', label: 'Delivered' },
    CANCELLED: { cls: 'badge-danger-custom', label: 'Cancelled' },
  };
  const s = map[status] || { cls: 'badge-info-custom', label: status };
  return <span className={`badge-modern ${s.cls}`}>{s.label}</span>;
};

const ManageOrders = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [assignModal, setAssignModal] = useState(null);
  const [selectedBoyId, setSelectedBoyId] = useState('');

  const { data: orders, isLoading } = useQuery(
    'allOrders',
    getAllOrders,
    { select: (res) => res.data }
  );

  const { data: availableBoys } = useQuery(
    'availableBoys',
    getAvailableBoys,
    { select: (res) => res.data }
  );

  const assignMutation = useMutation(
    ({ id, deliveryBoyId }) => assignOrder(id, { deliveryBoyId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allOrders');
        toast.success('Order assigned');
        setAssignModal(null);
        setSelectedBoyId('');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to assign'),
    }
  );

  const statusMutation = useMutation(
    ({ id, status }) => updateOrderStatus(id, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allOrders');
        toast.success('Order status updated');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
    }
  );

  if (isLoading) return <LoadingSpinner />;

  const statuses = ['ALL', 'PENDING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];

  const filtered = (orders || []).filter((o) => {
    const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchSearch = !search ||
      o.id?.toString().includes(search) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.deliveryBoyName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-truck"></i> Manage Orders</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{filtered.length} orders</p>
      </div>

      <div className="glass-card animate-fade-in-up">
        <div className="p-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div className="row align-items-center g-2">
            <div className="col-md-4">
              <div className="search-bar">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  className="form-control form-control-modern"
                  placeholder="Search by ID, customer or boy..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem', borderRadius: '50px' }}
                />
              </div>
            </div>
            <div className="col-md-8">
              <div className="d-flex gap-2 flex-wrap justify-content-md-end">
                {statuses.map((s) => (
                  <button
                    key={s}
                    className={`btn ${filterStatus === s ? 'btn-modern btn-modern-primary' : 'btn-modern-outline'}`}
                    style={{ borderRadius: '50px', padding: '0.3rem 1rem', fontSize: '0.8rem' }}
                    onClick={() => setFilterStatus(s)}
                  >
                    {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Milk</th>
                <th>Qty</th>
                <th>Date</th>
                <th>Status</th>
                <th>Assigned Boy</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9">
                  <div className="empty-state">
                    <i className="bi bi-inbox"></i>
                    <p>No orders found</p>
                  </div>
                </td></tr>
              ) : (
                filtered.map((o, i) => (
                  <tr key={o.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{i + 1}</td>
                    <td className="fw-semibold" style={{ fontSize: '0.85rem' }}>#{o.id}</td>
                    <td>
                      <span style={{ fontSize: '0.9rem' }}>{o.customerName || 'N/A'}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{o.milkType || '-'}</td>
                    <td className="fw-semibold">{o.quantity ? `${o.quantity} L` : '-'}</td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td>{statusBadge(o.status)}</td>
                    <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                      {o.deliveryBoyName || <span className="text-muted fst-italic">Unassigned</span>}
                    </td>
                    <td className="text-end">
                      {o.status === 'PENDING' && (
                        <button className="btn btn-sm me-1" style={{
                          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                          color: '#fff', border: 'none', borderRadius: '8px',
                          fontSize: '0.8rem', padding: '0.35rem 0.85rem'
                        }} onClick={() => { setAssignModal(o); setSelectedBoyId(''); }}>
                          <i className="bi bi-person-plus me-1"></i> Assign
                        </button>
                      )}
                      {o.status === 'PENDING' && (
                        <button className="btn btn-sm" style={{
                          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                          border: 'none', borderRadius: '8px',
                          fontSize: '0.8rem', padding: '0.35rem 0.85rem'
                        }} onClick={() => {
                          if (window.confirm(`Cancel order #${o.id}?`)) {
                            statusMutation.mutate({ id: o.id, status: 'CANCELLED' });
                          }
                        }}>
                          <i className="bi bi-x-lg me-1"></i> Cancel
                        </button>
                      )}
                      {(o.status === 'ASSIGNED' || o.status === 'PICKED_UP') && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          <i className="bi bi-check2 me-1"></i>In progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {assignModal && (
        <div className="modern-modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header">
              <h6 className="fw-bold mb-0"><i className="bi bi-person-check me-2" style={{ color: 'var(--primary)' }}></i>Assign Order #{assignModal.id}</h6>
              <button className="btn btn-sm" style={{ border: 'none', background: 'none', fontSize: '1.25rem' }}
                onClick={() => setAssignModal(null)}><i className="bi bi-x"></i></button>
            </div>
            <div className="modern-modal-body">
              <p style={{ fontSize: '0.9rem', color: '#475569' }} className="mb-3">
                Assign order from <strong>{assignModal.customerName || 'Unknown'}</strong> to a delivery boy:
              </p>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Delivery Boy <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control form-control-modern"
                  value={selectedBoyId}
                  onChange={(e) => setSelectedBoyId(e.target.value)}
                >
                  <option value="">Select delivery boy...</option>
                  {(availableBoys || []).map((boy) => (
                    <option key={boy.id} value={boy.id}>
                      {boy.name} {boy.vehicleNumber ? `(${boy.vehicleNumber})` : ''} - {boy.area || 'N/A'}
                    </option>
                  ))}
                </select>
                {(!availableBoys || availableBoys.length === 0) && (
                  <div className="text-warning mt-2" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-exclamation-triangle me-1"></i>No delivery boys available
                  </div>
                )}
              </div>
            </div>
            <div className="modern-modal-footer">
              <button className="btn btn-modern-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="btn btn-modern btn-modern-primary"
                onClick={() => {
                  if (!selectedBoyId) {
                    toast.warn('Please select a delivery boy');
                    return;
                  }
                  assignMutation.mutate({ id: assignModal.id, deliveryBoyId: Number(selectedBoyId) });
                }}
                disabled={assignMutation.isLoading}>
                {assignMutation.isLoading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageOrders;
