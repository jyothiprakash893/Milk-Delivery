import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getAllDeliveryBoys, createDeliveryBoy, updateDeliveryBoy, updateBoyStatus, toggleBoyAvailability, deleteDeliveryBoy } from '../api/deliveryBoyApi';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';

const statusBadge = (status) => {
  const map = {
    ACTIVE: { cls: 'badge-success-custom', label: 'Active' },
    INACTIVE: { cls: 'badge-warning-custom', label: 'Inactive' },
    SUSPENDED: { cls: 'badge-danger-custom', label: 'Suspended' },
  };
  const s = map[status] || { cls: 'badge-info-custom', label: status };
  return <span className={`badge-modern ${s.cls}`}>{s.label}</span>;
};

const ManageDeliveryBoys = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', vehicleNumber: '', area: '' });

  const { data: boys, isLoading } = useQuery(
    'allDeliveryBoys',
    getAllDeliveryBoys,
    { select: (res) => res.data }
  );

  const createMutation = useMutation(createDeliveryBoy, {
    onSuccess: () => {
      queryClient.invalidateQueries('allDeliveryBoys');
      toast.success('Delivery boy added');
      closeForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add'),
  });

  const updateMutation = useMutation(({ id, data }) => updateDeliveryBoy(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries('allDeliveryBoys');
      toast.success('Delivery boy updated');
      closeForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const statusMutation = useMutation(({ id, status }) => updateBoyStatus(id, { status }), {
    onSuccess: () => {
      queryClient.invalidateQueries('allDeliveryBoys');
      toast.success('Status updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  const toggleMutation = useMutation((id) => toggleBoyAvailability(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('allDeliveryBoys');
      toast.success('Availability toggled');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to toggle'),
  });

  const deleteMutation = useMutation((id) => deleteDeliveryBoy(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('allDeliveryBoys');
      toast.success('Delivery boy deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  if (isLoading) return <LoadingSpinner />;

  const filtered = (boys || []).filter(
    (b) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.phone?.includes(search) ||
      b.area?.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicleNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', vehicleNumber: '', area: '' });
    setShowForm(true);
  };

  const openEdit = (boy) => {
    setEditing(boy);
    setForm({ name: boy.name || '', phone: boy.phone || '', email: boy.email || '', vehicleNumber: boy.vehicleNumber || '', area: boy.area || '' });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.warn('Name and Phone are required');
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete delivery boy "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id, status) => {
    statusMutation.mutate({ id, status });
  };

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center animate-fade-in">
        <div>
          <h4><i className="bi bi-bicycle"></i> Manage Delivery Boys</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{filtered.length} delivery boys</p>
        </div>
        <button className="btn btn-modern btn-modern-primary" onClick={openAdd}>
          <i className="bi bi-plus-lg me-1"></i> Add Delivery Boy
        </button>
      </div>

      <div className="glass-card animate-fade-in-up">
        <div className="p-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="search-bar">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  className="form-control form-control-modern"
                  placeholder="Search by name, phone, area or vehicle..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem', borderRadius: '50px' }}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end mt-2 mt-md-0">
              <span className="badge-modern badge-info-custom">
                <i className="bi bi-person-badge me-1"></i> {filtered.length} boys
              </span>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>Area</th>
                <th>Status</th>
                <th>Available</th>
                <th>Rating</th>
                <th>Deliveries</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="10">
                  <div className="empty-state">
                    <i className="bi bi-search"></i>
                    <p>No delivery boys found</p>
                  </div>
                </td></tr>
              ) : (
                filtered.map((b, i) => (
                  <tr key={b.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: 'linear-gradient(135deg, #8b5cf6, #c084fc)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '0.85rem'
                        }}>
                          {b.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{b.name}</div>
                          {b.email && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{b.phone || '-'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{b.vehicleNumber || '-'}</td>
                    <td><span style={{ fontSize: '0.85rem', color: '#475569' }}>{b.area || '-'}</span></td>
                    <td>
                      <select className="form-control form-control-modern"
                        style={{ width: '130px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        value={b.status || 'ACTIVE'}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleMutation.mutate(b.id)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '50px',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: b.available ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)',
                          color: b.available ? '#10b981' : '#ef4444',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        disabled={toggleMutation.isLoading}
                      >
                        <i className={`bi ${b.available ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`}></i>
                        {b.available ? 'Available' : 'Busy'}
                      </button>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#f59e0b' }}>
                        <i className="bi bi-star-fill me-1"></i>{(b.rating || 0).toFixed(1)}
                      </span>
                    </td>
                    <td className="fw-semibold">{b.deliveriesCount || 0}</td>
                    <td className="text-end">
                      <button className="btn btn-sm px-2 py-1 me-1" style={{
                        background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: 'none', borderRadius: '8px',
                        fontSize: '0.8rem'
                      }} title="Edit" onClick={() => openEdit(b)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm px-2 py-1" style={{
                        background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px',
                        fontSize: '0.8rem'
                      }} title="Delete" onClick={() => handleDelete(b.id, b.name)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modern-modal-overlay" onClick={closeForm}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modern-modal-header">
              <h6 className="fw-bold mb-0">
                <i className={`bi ${editing ? 'bi-pencil' : 'bi-person-plus'} me-2`}
                  style={{ color: 'var(--primary)' }}></i>
                {editing ? 'Edit Delivery Boy' : 'Add Delivery Boy'}
              </h6>
              <button className="btn btn-sm" style={{ border: 'none', background: 'none', fontSize: '1.25rem' }}
                onClick={closeForm}><i className="bi bi-x"></i></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modern-modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Name <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control form-control-modern"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Phone <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control form-control-modern"
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Email</label>
                  <input type="email" className="form-control form-control-modern"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Vehicle Number</label>
                    <input type="text" className="form-control form-control-modern"
                      placeholder="e.g. MH-01-AB-1234"
                      value={form.vehicleNumber}
                      onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Area</label>
                    <input type="text" className="form-control form-control-modern"
                      placeholder="Service area"
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modern-modal-footer">
                <button type="button" className="btn btn-modern-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                  onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn btn-modern btn-modern-primary"
                  disabled={createMutation.isLoading || updateMutation.isLoading}>
                  <i className="bi bi-check-lg me-1"></i>
                  {editing ? 'Update' : 'Save'} {createMutation.isLoading || updateMutation.isLoading ? '...' : ''}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageDeliveryBoys;
