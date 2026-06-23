import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAddCustomer } from '../hooks/useCustomers';

const AddCustomer = () => {
  const navigate = useNavigate();
  const addMutation = useAddCustomer();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '', phone: '', email: '', address: '', area: '',
      milkQuantity: 1, pricePerLitre: 60, deliveryTime: '7:00 AM',
      startDate: new Date().toISOString().split('T')[0], notes: '', status: 'ACTIVE',
    },
  });

  const watchQty = watch('milkQuantity');
  const watchPrice = watch('pricePerLitre');

  const onSubmit = (data) => {
    addMutation.mutate(data, { onSuccess: () => navigate('/customers') });
  };

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-person-plus"></i> Add Customer</h4>
      </div>
      <div className="row g-4">
        <div className="col-md-8">
          <div className="glass-card p-4 animate-fade-in-up">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Name *</label>
                  <input className={`form-control form-control-modern ${errors.name ? 'is-invalid' : ''}`}
                    {...register('name', { required: 'Name is required' })} />
                  {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Phone *</label>
                  <input className={`form-control form-control-modern ${errors.phone ? 'is-invalid' : ''}`}
                    {...register('phone', { required: 'Phone is required', pattern: { value: /^\d{10,15}$/, message: 'Invalid phone' } })} />
                  {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Email</label>
                  <input type="email" className="form-control form-control-modern" {...register('email')} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Area</label>
                  <input className="form-control form-control-modern" {...register('area')} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Address *</label>
                  <textarea className={`form-control form-control-modern ${errors.address ? 'is-invalid' : ''}`}
                    rows="2" {...register('address', { required: 'Address is required' })}></textarea>
                  {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Milk (L) *</label>
                  <input type="number" step="0.1" min="0.5" max="50"
                    className={`form-control form-control-modern ${errors.milkQuantity ? 'is-invalid' : ''}`}
                    {...register('milkQuantity', { required: true, min: 0.5 })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>₹ per Litre</label>
                  <input type="number" step="0.5" min="1" className="form-control form-control-modern"
                    {...register('pricePerLitre')} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Delivery Time</label>
                  <input className="form-control form-control-modern" {...register('deliveryTime')} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Start Date *</label>
                  <input type="date" className={`form-control form-control-modern ${errors.startDate ? 'is-invalid' : ''}`}
                    {...register('startDate', { required: true })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Status</label>
                  <select className="form-control form-control-modern" {...register('status')}>
                    <option value="ACTIVE">Active</option>
                    <option value="HOLD">Hold</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Notes</label>
                  <textarea className="form-control form-control-modern" rows="2" {...register('notes')}></textarea>
                </div>
              </div>
              <div className="mt-4 d-flex gap-2">
                <button type="submit" className="btn btn-modern btn-modern-primary px-4" disabled={addMutation.isLoading}>
                  {addMutation.isLoading ? 'Saving...' : 'Save Customer'}
                </button>
                <button type="button" className="btn btn-modern px-4" style={{
                  background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 600
                }} onClick={() => navigate('/customers')}>Cancel</button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card p-4 animate-fade-in-up animate-delay-1">
            <h6 className="fw-bold mb-3 text-center"><i className="bi bi-eye me-2" style={{ color: 'var(--primary)' }}></i>Live Preview</h6>
            <div className="text-center">
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: 'linear-gradient(135deg, #6366f1, #a5b4fc)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', fontSize: '2rem', fontWeight: 700, color: '#fff'
              }}>
                {(watch('name') || '?').charAt(0).toUpperCase()}
              </div>
              <h5 className="fw-bold">{watch('name') || 'Customer Name'}</h5>
              <hr />
              <div className="text-start">
                <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.85rem' }}>
                  <span className="text-muted">Quantity</span>
                  <span className="fw-semibold">{watchQty || 0} L/day</span>
                </div>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.85rem' }}>
                  <span className="text-muted">Price</span>
                  <span className="fw-semibold">₹{watchPrice || 0}/L</span>
                </div>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.85rem' }}>
                  <span className="text-muted">Daily Cost</span>
                  <span className="fw-bold" style={{ color: 'var(--primary)' }}>₹{((watchQty || 0) * (watchPrice || 0)).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.85rem' }}>
                  <span className="text-muted">Monthly Est.</span>
                  <span className="fw-bold" style={{ color: '#10b981' }}>₹{((watchQty || 0) * (watchPrice || 0) * 30).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AddCustomer;
