import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCustomers } from '../hooks/useCustomers';
import { toast } from 'react-toastify';
import { sendBills, sendReminder, sendCustomMessage } from '../api/notificationApi';

const Notifications = () => {
  const { data: customers } = useCustomers();
  const [loading, setLoading] = useState({ bills: false, reminder: false, custom: false });
  const { register, handleSubmit, reset } = useForm();

  const handleSendBills = async () => {
    setLoading(p => ({ ...p, bills: true }));
    try {
      await sendBills();
      toast.success('Bills sent to all customers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send bills');
    } finally {
      setLoading(p => ({ ...p, bills: false }));
    }
  };

  const handleSendReminder = async () => {
    setLoading(p => ({ ...p, reminder: true }));
    try {
      await sendReminder();
      toast.success('Payment reminders sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reminders');
    } finally {
      setLoading(p => ({ ...p, reminder: false }));
    }
  };

  const handleCustom = async (data) => {
    if (!data.customerId || !data.message) {
      toast.error('Please select a customer and enter a message');
      return;
    }
    setLoading(p => ({ ...p, custom: true }));
    try {
      await sendCustomMessage({ customerId: Number(data.customerId), message: data.message, type: data.type });
      toast.success('Message sent successfully');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(p => ({ ...p, custom: false }));
    }
  };

  return (
    <div>
      <h4 className="mb-4"><i className="bi bi-bell me-2"></i>Notifications</h4>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Send Bills</h6></div>
            <div className="card-body text-center">
              <i className="bi bi-file-text text-primary" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2 text-muted">Send monthly bills to all customers via WhatsApp/SMS</p>
              <button className="btn btn-primary" onClick={handleSendBills} disabled={loading.bills}>
                {loading.bills ? 'Sending...' : 'Send Bills to All'}
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Payment Reminder</h6></div>
            <div className="card-body text-center">
              <i className="bi bi-exclamation-circle text-warning" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2 text-muted">Send payment reminders to customers with dues</p>
              <button className="btn btn-warning" onClick={handleSendReminder} disabled={loading.reminder}>
                {loading.reminder ? 'Sending...' : 'Send Reminders'}
              </button>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Custom Message</h6></div>
            <div className="card-body">
              <form onSubmit={handleSubmit(handleCustom)}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Customer</label>
                    <select className="form-select" {...register('customerId')}>
                      <option value="">All customers...</option>
                      {(customers || []).map(c => (
                        <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Type</label>
                    <select className="form-select" {...register('type')}>
                      <option value="SMS">SMS</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="EMAIL">Email</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">&nbsp;</label>
                    <button type="submit" className="btn btn-primary d-block w-100" disabled={loading.custom}>
                      {loading.custom ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Message</label>
                    <textarea className="form-control" rows="3" {...register('message')}
                      placeholder="Type your message here..."></textarea>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Notifications;
