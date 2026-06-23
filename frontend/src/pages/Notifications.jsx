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
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-bell"></i> Notifications</h4>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="glass-card p-4 text-center animate-fade-in-up">
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(99,102,241,0.25)'
            }}>
              <i className="bi bi-file-text text-white" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <h6 className="fw-bold">Send Bills</h6>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Send monthly bills to all customers via WhatsApp/SMS</p>
            <button className="btn btn-modern btn-modern-primary px-4" onClick={handleSendBills} disabled={loading.bills}>
              {loading.bills ? 'Sending...' : 'Send Bills to All'}
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <div className="glass-card p-4 text-center animate-fade-in-up animate-delay-1">
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(245,158,11,0.25)'
            }}>
              <i className="bi bi-exclamation-circle text-white" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <h6 className="fw-bold">Payment Reminder</h6>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Send payment reminders to customers with dues</p>
            <button className="btn btn-modern px-4" onClick={handleSendReminder} disabled={loading.reminder}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600,
                boxShadow: '0 4px 15px rgba(245,158,11,0.3)'
              }}>
              {loading.reminder ? 'Sending...' : 'Send Reminders'}
            </button>
          </div>
        </div>

        <div className="col-12">
          <div className="glass-card p-4 animate-fade-in-up animate-delay-2">
            <h6 className="fw-bold mb-3"><i className="bi bi-chat-dots me-2" style={{ color: 'var(--primary)' }}></i>Custom Message</h6>
            <form onSubmit={handleSubmit(handleCustom)}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Customer</label>
                  <select className="form-control form-control-modern" {...register('customerId')}>
                    <option value="">All customers...</option>
                    {(customers || []).map(c => (
                      <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Type</label>
                  <select className="form-control form-control-modern" {...register('type')}>
                    <option value="SMS">SMS</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>&nbsp;</label>
                  <button type="submit" className="btn btn-modern btn-modern-primary w-100" disabled={loading.custom}>
                    {loading.custom ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Message</label>
                  <textarea className="form-control form-control-modern" rows="3" {...register('message')}
                    placeholder="Type your message here..."></textarea>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Notifications;
