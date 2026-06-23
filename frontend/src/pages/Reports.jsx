import { useState } from 'react';
import { useMonthlyReport } from '../hooks/useDeliveries';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const Reports = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { data: report, isLoading } = useMonthlyReport(month, year);

  if (isLoading) return <LoadingSpinner />;

  const data = report?.customerReports || report || [];

  const chartData = (Array.isArray(data) ? data : []).slice(0, 15).map(d => ({
    name: d.customerName?.split(' ')[0] || `#${d.customerId}`,
    delivered: d.totalDelivered || 0,
    skipped: d.totalSkipped || 0,
    litres: d.totalLitres || 0,
  }));

  const totalDeliveries = (Array.isArray(data) ? data : []).reduce((s, d) => s + (d.totalDelivered || 0), 0);
  const totalSkipped = (Array.isArray(data) ? data : []).reduce((s, d) => s + (d.totalSkipped || 0), 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0"><i className="bi bi-graph-up me-2"></i>Monthly Reports</h4>
        <div className="d-flex gap-2">
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
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-primary border-start border-4 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Customers</div>
              <div className="fs-4 fw-bold">{(Array.isArray(data) ? data : []).length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-success border-start border-4 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Total Delivered</div>
              <div className="fs-4 fw-bold text-success">{totalDeliveries}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-danger border-start border-4 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Total Skipped</div>
              <div className="fs-4 fw-bold text-danger">{totalSkipped}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-info border-start border-4 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Delivery Rate</div>
              <div className="fs-4 fw-bold text-info">
                {totalDeliveries + totalSkipped > 0
                  ? ((totalDeliveries / (totalDeliveries + totalSkipped)) * 100).toFixed(1) + '%'
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Delivery Overview</h6></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="delivered" fill="#198754" name="Delivered" />
                  <Bar dataKey="skipped" fill="#dc3545" name="Skipped" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Litres Supplied</h6></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="litres" stroke="#0d6efd" name="Litres" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Reports;
