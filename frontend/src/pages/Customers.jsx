import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomers, useDeleteCustomer } from '../hooks/useCustomers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Customers = () => {
  const { data: customers, isLoading } = useCustomers();
  const deleteMutation = useDeleteCustomer();
  const [search, setSearch] = useState('');

  if (isLoading) return <LoadingSpinner />;

  const filtered = (customers || []).filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.area?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete customer "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const statusBadge = (status) => {
    const map = {
      ACTIVE: { cls: 'badge-success-custom', label: 'Active' },
      HOLD: { cls: 'badge-warning-custom', label: 'Hold' },
      INACTIVE: { cls: 'badge-danger-custom', label: 'Inactive' },
    };
    const s = map[status] || map.ACTIVE;
    return <span className={`badge-modern ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center animate-fade-in">
        <div>
          <h4><i className="bi bi-people"></i> Customers</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{filtered.length} customers</p>
        </div>
        <Link to="/customers/add" className="btn btn-modern btn-modern-primary">
          <i className="bi bi-plus-lg me-1"></i> Add Customer
        </Link>
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
                  placeholder="Search by name, phone or area..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem', borderRadius: '50px' }}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end mt-2 mt-md-0">
              <span className="badge-modern badge-info-custom">
                <i className="bi bi-people me-1"></i> {filtered.length} customers
              </span>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Area</th>
                <th>Qty</th>
                <th>₹/L</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8">
                  <div className="empty-state">
                    <i className="bi bi-search"></i>
                    <p>No customers found</p>
                  </div>
                </td></tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: 'linear-gradient(135deg, #6366f1, #a5b4fc)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '0.85rem'
                        }}>
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{c.phone}</div>
                      {c.email && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.email}</div>}
                    </td>
                    <td><span style={{ fontSize: '0.85rem', color: '#475569' }}>{c.area || '-'}</span></td>
                    <td className="fw-semibold">{c.milkQuantity} L</td>
                    <td>₹{c.pricePerLitre}</td>
                    <td>{statusBadge(c.status)}</td>
                    <td className="text-end">
                      <button className="btn btn-sm px-2 py-1 me-1" style={{
                        background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: 'none', borderRadius: '8px',
                        fontSize: '0.8rem'
                      }} title="Edit">
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm px-2 py-1" style={{
                        background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px',
                        fontSize: '0.8rem'
                      }} title="Delete" onClick={() => handleDelete(c.id, c.name)}>
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
    </div>
  );
};
export default Customers;
