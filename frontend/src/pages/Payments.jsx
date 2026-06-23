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
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
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
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-wallet2"></i> Payments</h4>
      </div>
      <div className="row g-4">
        <div className="col-md-5">
          <div className="glass-card p-4 animate-fade-in-up">
            <h6 className="fw-bold mb-3"><i className="bi bi-plus-circle me-2" style={{ color: 'var(--primary)' }}></i>Record Payment</h6>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Customer</label>
                <select className={`form-control form-control-modern ${errors.customerId ? 'is-invalid' : ''}`}
                  {...register('customerId', { required: true })}>
                  <option value="">Select customer...</option>
                  {unpaid.map((b, i) => (
                    <option key={i} value={b.customerId}>
                      {customerMap[b.customerId]?.name || `ID: ${b.customerId}`} - ₹{b.totalAmount}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Amount (₹)</label>
                <input type="number" step="0.01" className={`form-control form-control-modern ${errors.amountPaid ? 'is-invalid' : ''}`}
                  {...register('amountPaid', { required: true, min: 0.01 })} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Mode</label>
                <select className="form-control form-control-modern" {...register('paymentMode')}>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK">Bank Transfer</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Notes</label>
                <textarea className="form-control form-control-modern" rows="2" {...register('notes')}></textarea>
              </div>
              <button type="submit" className="btn btn-modern btn-modern-primary w-100 py-2.5" disabled={collecting}>
                {collecting ? 'Recording...' : 'Record Payment'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-7">
          <div className="glass-card mb-3 animate-fade-in-up animate-delay-1">
            <div className="px-4 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <h6 className="fw-bold mb-0"><i className="bi bi-clock-history me-2" style={{ color: 'var(--primary)' }}></i>Payment History</h6>
              <select className="form-control form-control-modern" style={{ width: '200px', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                value={selectedCust || ''} onChange={(e) => setSelectedCust(e.target.value ? Number(e.target.value) : null)}>
                <option value="">Select customer...</option>
                {(customers || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr><th>Date</th><th>Amount</th><th>Mode</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {!paymentHistory || paymentHistory.length === 0 ? (
                    <tr><td colSpan="4"><div className="empty-state"><i className="bi bi-inbox"></i><p>No payment history</p></div></td></tr>
                  ) : (
                    paymentHistory.map((p, i) => (
                      <tr key={i}>
                        <td style={{ fontSize: '0.85rem' }}>{p.paymentDate}</td>
                        <td className="fw-bold" style={{ color: '#10b981' }}>₹{p.amountPaid}</td>
                        <td><span className="badge-modern badge-info-custom">{p.paymentMode}</span></td>
                        <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{p.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card animate-fade-in-up animate-delay-2">
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <h6 className="fw-bold mb-0"><i className="bi bi-exclamation-triangle me-2 text-danger"></i>Outstanding Dues</h6>
            </div>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr><th>Customer</th><th>Amount Due</th><th>Period</th></tr>
                </thead>
                <tbody>
                  {(!unpaid || unpaid.length === 0) ? (
                    <tr><td colSpan="3"><div className="empty-state"><i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i><p>All bills are paid!</p></div></td></tr>
                  ) : (
                    unpaid.map((b, i) => (
                      <tr key={b.id || i}>
                        <td className="fw-semibold">{customerMap[b.customerId]?.name || `Customer #${b.customerId}`}</td>
                        <td className="fw-bold text-danger">₹{b.totalAmount}</td>
                        <td style={{ color: '#64748b' }}>{b.month}/{b.year}</td>
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
  );
};
export default Payments;
