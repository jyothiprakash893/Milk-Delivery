import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUnpaidBills } from '../hooks/useBilling';
import { usePaymentHistory } from '../hooks/usePayments';
import { useCustomers } from '../hooks/useCustomers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { collectPayment } from '../api/paymentApi';
import { useQueryClient } from 'react-query';

const Payments = () => {
  const { data: unpaid } = useUnpaidBills();
  const { data: customers } = useCustomers();
  const queryClient = useQueryClient();
  const [selectedCust, setSelectedCust] = useState(null);
  const { data: paymentHistory } = usePaymentHistory(selectedCust);
  const [collecting, setCollecting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { billId: '', customerId: '', amountPaid: '', paymentMode: 'CASH', notes: '' }
  });

  const customerMap = {};
  (customers || []).forEach(c => { customerMap[c.id] = c; });

  const onSubmit = async (data) => {
    setCollecting(true);
    try {
      await collectPayment({ ...data, amountPaid: parseFloat(data.amountPaid) });
      toast.success('Payment recorded successfully');
      queryClient.invalidateQueries('unpaidBills');
      queryClient.invalidateQueries(['paymentHistory', selectedCust]);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setCollecting(false);
    }
  };

  if (!unpaid || !customers) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="mb-4"><i className="bi bi-wallet2 me-2"></i>Payments</h4>
      <div className="row g-4">
        <div className="col-md-5">
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Record Payment</h6></div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label className="form-label">Customer</label>
                  <select className={`form-select ${errors.customerId ? 'is-invalid' : ''}`}
                    {...register('customerId', { required: true })}>
                    <option value="">Select customer...</option>
                    {unpaid.map(b => (
                      <option key={b.id} value={b.customerId}>
                        {customerMap[b.customerId]?.name || `ID: ${b.customerId}`} - ₹{b.totalAmount}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Amount Paid (₹)</label>
                  <input type="number" step="0.01" className={`form-control ${errors.amountPaid ? 'is-invalid' : ''}`}
                    {...register('amountPaid', { required: true, min: 0.01 })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Payment Mode</label>
                  <select className="form-select" {...register('paymentMode')}>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK">Bank Transfer</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" rows="2" {...register('notes')}></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={collecting}>
                  {collecting ? 'Recording...' : 'Record Payment'}
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-7">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Payment History</h6>
              <select className="form-select form-select-sm" style={{ width: '200px' }}
                value={selectedCust || ''} onChange={(e) => setSelectedCust(e.target.value ? Number(e.target.value) : null)}>
                <option value="">Select customer...</option>
                {(customers || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr><th>Date</th><th>Amount</th><th>Mode</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {!paymentHistory || paymentHistory.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-3 text-muted">No payment history</td></tr>
                    ) : (
                      paymentHistory.map((p, i) => (
                        <tr key={i}>
                          <td>{p.paymentDate}</td>
                          <td><strong>₹{p.amountPaid}</strong></td>
                          <td><span className="badge bg-info">{p.paymentMode}</span></td>
                          <td>{p.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-header bg-white"><h6 className="mb-0">Outstanding Dues</h6></div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr><th>Customer</th><th>Amount Due</th><th>Month</th></tr>
                  </thead>
                  <tbody>
                    {(unpaid || []).length === 0 ? (
                      <tr><td colSpan="3" className="text-center py-3 text-muted">No outstanding dues</td></tr>
                    ) : (
                      unpaid.map((b, i) => (
                        <tr key={b.id || i}>
                          <td>{customerMap[b.customerId]?.name || `ID: ${b.customerId}`}</td>
                          <td className="text-danger fw-bold">₹{b.totalAmount}</td>
                          <td>{b.month}/{b.year}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Payments;
