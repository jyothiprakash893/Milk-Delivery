import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAddCustomer } from '../hooks/useCustomers';

const AddCustomer = () => {
  const navigate = useNavigate();
  const addMutation = useAddCustomer();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      area: '',
      milkQuantity: 1,
      pricePerLitre: 60,
      deliveryTime: '7:00 AM',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
      status: 'ACTIVE',
    },
  });

  const watchQty = watch('milkQuantity');
  const watchPrice = watch('pricePerLitre');

  const onSubmit = (data) => {
    addMutation.mutate(data, {
      onSuccess: () => navigate('/customers'),
    });
  };

  return (
    <div>
      <h4 className="mb-4"><i className="bi bi-person-plus me-2"></i>Add Customer</h4>
      <div className="row g-4">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Name *</label>
                    <input className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      {...register('name', { required: 'Name is required' })} />
                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone *</label>
                    <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      {...register('phone', { required: 'Phone is required', pattern: { value: /^\d{10,15}$/, message: 'Invalid phone' } })} />
                    {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" {...register('email')} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Area</label>
                    <input className="form-control" {...register('area')} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address *</label>
                    <textarea className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                      rows="2" {...register('address', { required: 'Address is required' })}></textarea>
                    {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Milk Quantity (L) *</label>
                    <input type="number" step="0.1" min="0.5" max="50"
                      className={`form-control ${errors.milkQuantity ? 'is-invalid' : ''}`}
                      {...register('milkQuantity', { required: true, min: 0.5 })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Price per Litre (₹)</label>
                    <input type="number" step="0.5" min="1"
                      className="form-control" {...register('pricePerLitre')} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Delivery Time</label>
                    <input className="form-control" {...register('deliveryTime')} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Start Date *</label>
                    <input type="date" className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                      {...register('startDate', { required: true })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select className="form-select" {...register('status')}>
                      <option value="ACTIVE">Active</option>
                      <option value="HOLD">Hold</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Notes</label>
                    <textarea className="form-control" rows="2" {...register('notes')}></textarea>
                  </div>
                </div>
                <div className="mt-4 d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={addMutation.isLoading}>
                    {addMutation.isLoading ? 'Saving...' : 'Save Customer'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => navigate('/customers')}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Live Preview</h6></div>
            <div className="card-body text-center">
              <i className="bi bi-person-circle text-primary" style={{ fontSize: '4rem' }}></i>
              <h5 className="mt-2">{watch('name') || 'Customer Name'}</h5>
              <hr />
              <div className="text-start small">
                <p className="mb-1"><strong>Quantity:</strong> {watchQty || 0} L/day</p>
                <p className="mb-1"><strong>Price:</strong> ₹{watchPrice || 0}/L</p>
                <p className="mb-1"><strong>Daily Cost:</strong> ₹{((watchQty || 0) * (watchPrice || 0)).toFixed(2)}</p>
                <p className="mb-1"><strong>Monthly Est:</strong> ₹{((watchQty || 0) * (watchPrice || 0) * 30).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AddCustomer;
