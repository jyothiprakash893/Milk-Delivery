import { useState } from 'react';
import { useTodayDeliveries } from '../hooks/useDeliveries';
import { useActiveCustomers } from '../hooks/useCustomers';
import { useAllBills, useUnpaidBills } from '../hooks/useBilling';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: deliveries, isLoading: loadDel } = useTodayDeliveries();
  const { data: customers, isLoading: loadCust } = useActiveCustomers();
  const { data: bills, isLoading: loadBills } = useAllBills(month, year);
  const { data: unpaid } = useUnpaidBills();

  if (loadDel || loadCust || loadBills) return <LoadingSpinner />;

  const stats = [
    { label: 'Active Customers', value: customers?.length || 0, icon: 'bi-people', color: 'primary' },
    { label: "Today's Deliveries", value: deliveries?.filter(d => d.delivered).length || 0, icon: 'bi-check-circle', color: 'success' },
    { label: 'Pending', value: deliveries?.filter(d => !d.delivered && !d.skipped).length || 0, icon: 'bi-clock', color: 'warning' },
    { label: 'Skipped Today', value: deliveries?.filter(d => d.skipped).length || 0, icon: 'bi-x-circle', color: 'danger' },
    { label: 'Monthly Bills', value: bills?.length || 0, icon: 'bi-cash-coin', color: 'info' },
    { label: 'Unpaid Dues', value: unpaid?.length || 0, icon: 'bi-exclamation-triangle', color: 'danger' },
  ];

  const chartData = deliveries?.slice(0, 10).map(d => ({
    name: d.customerName?.split(' ')[0] || 'N/A',
    quantity: d.quantity || 0,
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const pieData = [
    { name: 'Delivered', value: deliveries?.filter(d => d.delivered).length || 0 },
    { name: 'Pending', value: deliveries?.filter(d => !d.delivered && !d.skipped).length || 0 },
    { name: 'Skipped', value: deliveries?.filter(d => d.skipped).length || 0 },
  ].filter(d => d.value > 0);

  return (
    <div>
      <h4 className="mb-4"><i className="bi bi-speedometer2 me-2"></i>Dashboard</h4>
      <div className="row g-3 mb-4">
        {stats.map((s, i) => (
          <div className="col-md-4 col-lg-2" key={i}>
            <div className={`card border-${s.color} border-start border-4 shadow-sm h-100`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small">{s.label}</div>
                    <div className="fs-3 fw-bold">{s.value}</div>
                  </div>
                  <i className={`bi ${s.icon} fs-1 text-${s.color} opacity-25`}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Today's Delivery Quantities</h6></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#0d6efd" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Today's Status</h6></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
