import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAllProducts, createProduct, updateProduct, deleteProduct, updateStock } from '../api/productApi';

const initialForm = {
  name: '',
  description: '',
  price: '',
  quantity: '',
  unit: 'Liter',
  imageUrl: '',
};

const units = ['Liter', 'Packet', '250g', '500g', 'Kg'];

const stockBadge = (qty) => {
  if (qty <= 0) return <span className="badge-modern badge-danger-custom"><i className="bi bi-exclamation-circle me-1"></i>Out of Stock</span>;
  if (qty <= 10) return <span className="badge-modern badge-warning-custom"><i className="bi bi-exclamation-triangle me-1"></i>{qty}</span>;
  return <span className="badge-modern badge-success-custom"><i className="bi bi-check-circle me-1"></i>{qty}</span>;
};

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllProducts();
      setProducts(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price ?? '',
      quantity: p.quantity ?? '',
      unit: p.unit || 'Liter',
      imageUrl: p.imageUrl || '',
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.price === '' || Number(form.price) < 0) errs.price = 'Valid price is required';
    if (form.quantity === '' || Number(form.quantity) < 0) errs.quantity = 'Valid quantity is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
        unit: form.unit,
        imageUrl: form.imageUrl.trim(),
      };
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (p) => {
    try {
      await updateProduct(p.id, { isActive: !p.isActive });
      toast.success(`Product ${p.isActive ? 'deactivated' : 'activated'}`);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header animate-fade-in d-flex flex-wrap align-items-center justify-content-between">
        <div>
          <h4><i className="bi bi-box-seam"></i> Manage Products</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{products.length} products</p>
        </div>
        <button className="btn btn-modern btn-modern-primary" onClick={openAdd}
          style={{ borderRadius: '50px', padding: '0.5rem 1.5rem' }}>
          <i className="bi bi-plus-lg me-1"></i> Add Product
        </button>
      </div>

      <div className="glass-card animate-fade-in-up">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="7">
                  <div className="empty-state">
                    <i className="bi bi-box-seam"></i>
                    <p>No products found</p>
                  </div>
                </td></tr>
              ) : (
                products.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name}
                            style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
                        ) : (
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg, #6366f1, #a5b4fc)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: '0.85rem'
                          }}>
                            {p.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <span className="fw-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.9rem', fontWeight: 600, color: '#059669' }}>
                      ₹{Number(p.price).toFixed(2)}
                    </td>
                    <td>{stockBadge(p.quantity)}</td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{p.unit || '-'}</td>
                    <td>
                      <span className={`badge-modern ${p.isActive ? 'badge-success-custom' : 'badge-danger-custom'}`}>
                        <i className={`bi ${p.isActive ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <div className="form-check form-switch mb-0" style={{ paddingLeft: '2.5em' }}>
                          <input className="form-check-input" type="checkbox" role="switch"
                            checked={!!p.isActive}
                            onChange={() => toggleActive(p)}
                            style={{ cursor: 'pointer' }} />
                        </div>
                        <button className="btn btn-sm" style={{
                          background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                          border: 'none', borderRadius: '8px',
                          fontSize: '0.8rem', padding: '0.35rem 0.75rem'
                        }} onClick={() => openEdit(p)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm" style={{
                          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                          border: 'none', borderRadius: '8px',
                          fontSize: '0.8rem', padding: '0.35rem 0.75rem'
                        }} onClick={() => setDeleteTarget(p)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modern-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px' }}>
            <div className="modern-modal-header">
              <h6 className="fw-bold mb-0">
                <i className={`bi ${editing ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}
                  style={{ color: editing ? '#6366f1' : '#10b981' }}></i>
                {editing ? 'Edit Product' : 'Add Product'}
              </h6>
              <button className="btn btn-sm" style={{ border: 'none', background: 'none', fontSize: '1.25rem' }}
                onClick={() => setShowModal(false)}><i className="bi bi-x"></i></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modern-modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Product Name <span className="text-danger">*</span>
                  </label>
                  <input className={`form-control form-control-modern ${errors.name ? 'is-invalid' : ''}`}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter product name" />
                  {errors.name && <div className="text-danger" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.name}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Description
                  </label>
                  <textarea className="form-control form-control-modern" rows="3"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Enter product description"></textarea>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>
                      Price (₹) <span className="text-danger">*</span>
                    </label>
                    <input type="number" step="0.01" min="0"
                      className={`form-control form-control-modern ${errors.price ? 'is-invalid' : ''}`}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="0.00" />
                    {errors.price && <div className="text-danger" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.price}</div>}
                  </div>
                  <div className="col">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>
                      Quantity <span className="text-danger">*</span>
                    </label>
                    <input type="number" min="0"
                      className={`form-control form-control-modern ${errors.quantity ? 'is-invalid' : ''}`}
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      placeholder="0" />
                    {errors.quantity && <div className="text-danger" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.quantity}</div>}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Unit
                  </label>
                  <select className="form-control form-control-modern"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    {units.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Image URL
                  </label>
                  <input className="form-control form-control-modern"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg" />
                </div>
              </div>
              <div className="modern-modal-footer">
                <button type="button" className="btn btn-modern-outline"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                  onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-modern btn-modern-primary"
                  disabled={saving}>
                  {saving ? (
                    <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</>
                  ) : (
                    <><i className={`bi ${editing ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>{editing ? 'Update' : 'Create'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modern-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header">
              <h6 className="fw-bold mb-0"><i className="bi bi-exclamation-triangle text-danger me-2"></i>Delete Product</h6>
              <button className="btn btn-sm" style={{ border: 'none', background: 'none', fontSize: '1.25rem' }}
                onClick={() => setDeleteTarget(null)}><i className="bi bi-x"></i></button>
            </div>
            <div className="modern-modal-body">
              <p style={{ fontSize: '0.9rem', color: '#475569' }} className="mb-0">
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modern-modal-footer">
              <button className="btn btn-modern-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-modern btn-modern-danger"
                onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
