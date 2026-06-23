import { useState } from 'react';
import { useAllBills, useGenerateBills, useUnpaidBills } from '../hooks/useBilling';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const Billing = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: bills, isLoading } = useAllBills(month, year);
  const { data: unpaid } = useUnpaidBills();
  const generateMutation = useGenerateBills();

  const handleGenerate = () => {
    if (window.confirm(`Generate bills for ${month}/${year}?`)) {
      generateMutation.mutate({ month, year });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const totalAmount = (bills || []).reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPaid = (bills || []).filter(b => b.paid).reduce((sum, b) => sum + b.totalAmount, 0);
  const totalUnpaid = totalAmount - totalPaid;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0"><i className="bi bi-cash-coin me-2"></i>Billing</h4>
        <div className="d-flex gap-2 align-items-center">
          <select className="form-select form-select-sm" style={{ width: '100px' }} value={month}
            onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('en', { month: 'short' })}</option>
            ))}
          </select>
          <select className="form-select form-select-sm" style={{ width: '90px' }} value={year}
            onChange={(e) => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generateMutation.isLoading}>
            <i className="bi bi-gear me-1"></i>{generateMutation.isLoading ? 'Generating...' : 'Generate Bills'}
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-primary border-start border-4 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Total Billed</div>
              <div className="fs-4 fw-bold text-primary">₹{totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-success border-start border-4 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Collected</div>
              <div className="fs-4 fw-bold text-success">₹{totalPaid.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-danger border-start border-4 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Outstanding</div>
              <div className="fs-4 fw-bold text-danger">₹{totalUnpaid.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Bills for {month}/{year}</h6>
          <span className="text-muted">{bills?.length || 0} bills</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Customer ID</th>
                  <th>Days Delivered</th>
                  <th>Total Litres</th>
                  <th>Price/L</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!bills || bills.length === 0) ? (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No bills generated for this month</td></tr>
                ) : (
                  bills.map((b, i) => (
                    <tr key={b.id}>
                      <td>{i + 1}</td>
                      <td>{b.customerId}</td>
                      <td>{b.totalDaysDelivered}</td>
                      <td>{b.totalLitres}</td>
                      <td>₹{b.pricePerLitre}</td>
                      <td><strong>₹{b.totalAmount}</strong></td>
                      <td>
                        {b.paid ? (
                          <span className="badge bg-success">Paid</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Unpaid</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-info" title="Download PDF">
                          <i className="bi bi-file-pdf"></i>
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

      {unpaid && unpaid.length > 0 && (
        <div className="card mt-3 shadow-sm border-danger">
          <div className="card-header bg-danger text-white">
            <h6 className="mb-0"><i className="bi bi-exclamation-triangle me-2"></i>Unpaid Bills ({unpaid.length})</h6>
          </div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr><th>Customer ID</th><th>Amount</th><th>Month</th></tr>
              </thead>
              <tbody>
                {unpaid.map((b) => (
                  <tr key={b.id}>
                    <td>{b.customerId}</td>
                    <td>₹{b.totalAmount}</td>
                    <td>{b.month}/{b.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default Billing;
