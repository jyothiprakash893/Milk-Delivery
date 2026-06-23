import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomers, useDeleteCustomer } from '../hooks/useCustomers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0"><i className="bi bi-people me-2"></i>Customers</h4>
        <Link to="/customers/add" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>Add Customer
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <div className="row align-items-center">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, phone or area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-6 text-md-end mt-2 mt-md-0">
              <span className="text-muted">{filtered.length} customers found</span>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Area</th>
                  <th>Qty (L)</th>
                  <th>Price/L</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No customers found</td></tr>
                ) : (
                  filtered.map((c, i) => (
                    <tr key={c.id}>
                      <td>{i + 1}</td>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.phone}</td>
                      <td>{c.area || '-'}</td>
                      <td>{c.milkQuantity}</td>
                      <td>₹{c.pricePerLitre}</td>
                      <td>
                        <span className={`badge bg-${c.status === 'ACTIVE' ? 'success' : c.status === 'HOLD' ? 'warning' : 'secondary'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" title="Delete"
                          onClick={() => handleDelete(c.id, c.name)}>
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
    </div>
  );
};
export default Customers;
