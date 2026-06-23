import { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyServiceRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: requests, isLoading } = useQuery(
    ['myServiceReq', user?.id],
    () => axiosInstance.get(`/service-requests/user/${user.id}`),
    { select: (res) => res.data, enabled: !!user?.id }
  );

  if (isLoading) return <LoadingSpinner />;

  const latest = Array.isArray(requests) ? requests[requests.length - 1] : requests;

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-headset"></i> My Service Request</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Track your registration request status</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-6">
          {!latest ? (
            <div className="glass-card p-5 text-center animate-fade-in-up">
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', margin: '0 auto 16px'
              }}>
                <i className="bi bi-person-plus"></i>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: 'var(--dark)' }}>No Service Request Yet</h5>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }} className="mb-4">
                You haven't submitted any service or registration request.
              </p>
              <button className="btn btn-modern btn-modern-primary px-4 py-2"
                onClick={() => navigate('/register')}>
                <i className="bi bi-arrow-right me-1"></i>Go to Registration
              </button>
            </div>
          ) : latest.status === 'PENDING' ? (
            <div className="glass-card p-5 text-center animate-fade-in-up"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(245,158,11,0.02))',
                border: '1px solid rgba(245,158,11,0.12)'
              }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', margin: '0 auto 16px',
                animation: 'spin 3s linear infinite'
              }}>
                <i className="bi bi-clock"></i>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: '#f59e0b' }}>Pending Approval</h5>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Your request is under review. Please wait for admin approval.
              </p>
              <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(245,158,11,0.05)' }}>
                <p className="mb-1" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  <i className="bi bi-envelope me-1"></i>Submitted on {latest.createdAt ? new Date(latest.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          ) : latest.status === 'APPROVED' ? (
            <div className="glass-card p-5 animate-fade-in-up"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))',
                border: '1px solid rgba(16,185,129,0.12)'
              }}>
              <div className="text-center mb-3">
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.1)', color: '#10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', margin: '0 auto 16px'
                }}>
                  <i className="bi bi-check-circle"></i>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: '#10b981' }}>Approved</h5>
                <span className="badge-modern badge-success-custom px-3 py-2">
                  <i className="bi bi-check me-1"></i>Active
                </span>
              </div>
              <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(16,185,129,0.05)' }}>
                <p className="mb-1" style={{ fontSize: '0.85rem', color: '#475569' }}>
                  <i className="bi bi-person me-1 text-success"></i>
                  <strong>Name:</strong> {latest.fullName || user?.username || 'N/A'}
                </p>
                <p className="mb-1" style={{ fontSize: '0.85rem', color: '#475569' }}>
                  <i className="bi bi-telephone me-1 text-success"></i>
                  <strong>Phone:</strong> {latest.phone || 'N/A'}
                </p>
                <p className="mb-0" style={{ fontSize: '0.85rem', color: '#475569' }}>
                  <i className="bi bi-geo-alt me-1 text-success"></i>
                  <strong>Address:</strong> {latest.address || 'N/A'}
                </p>
              </div>
            </div>
          ) : latest.status === 'REJECTED' ? (
            <div className="glass-card p-5 animate-fade-in-up"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(239,68,68,0.02))',
                border: '1px solid rgba(239,68,68,0.12)'
              }}>
              <div className="text-center mb-3">
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', margin: '0 auto 16px'
                }}>
                  <i className="bi bi-x-circle"></i>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: '#ef4444' }}>Rejected</h5>
                <span className="badge-modern badge-danger-custom px-3 py-2">
                  <i className="bi bi-x me-1"></i>Not Approved
                </span>
              </div>
              {latest.adminNote && (
                <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                  <p className="mb-0" style={{ fontSize: '0.85rem', color: '#475569' }}>
                    <i className="bi bi-chat-dots text-danger me-1"></i>
                    <strong>Admin Note:</strong> {latest.adminNote}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-5 text-center animate-fade-in-up">
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', margin: '0 auto 16px'
              }}>
                <i className="bi bi-question-lg"></i>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: 'var(--dark)' }}>Unknown Status</h5>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Status: {latest.status}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default MyServiceRequest;
