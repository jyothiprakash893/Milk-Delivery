import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';

const boyMenu = [
  { path: '/boy-dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { path: '/boy-assigned', label: 'Assigned Orders', icon: 'bi-list-task' },
  { path: '/boy-deliveries', label: 'Deliveries', icon: 'bi-truck' },
  { path: '/boy-earnings', label: 'Earnings', icon: 'bi-cash-stack' },
];

const BoyLayout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      <Navbar toggleSidebar={() => setShowSidebar(!showSidebar)} />
      <div className="d-flex flex-grow-1" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* Desktop sidebar */}
        <div className="d-none d-md-block">
          <div className="modern-sidebar d-flex flex-column">
            <div className="sidebar-header d-flex align-items-center gap-3">
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
              }}>
                <i className="bi bi-bicycle text-white" style={{ fontSize: '1.2rem' }}></i>
              </div>
              <div>
                <div className="fw-bold text-white" style={{ fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                  Delivery Panel
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', letterSpacing: '0.02em' }}>
                  {user?.username}
                </div>
              </div>
            </div>

            <div className="section-title">Delivery Menu</div>

            <nav className="sidebar-nav flex-grow-1">
              {boyMenu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <span className="link-icon">
                    <i className={`bi ${item.icon}`}></i>
                  </span>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))',
                borderRadius: '12px', padding: '0.75rem 1rem',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Delivery Boy
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>
                  Milk Delivery System
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {showSidebar && (
          <div className="d-md-none position-fixed top-0 start-0 w-100 h-100"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1040 }}
            onClick={() => setShowSidebar(false)}>
            <div className="h-100 animate-slide-right"
              style={{ width: '260px' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="modern-sidebar d-flex flex-column h-100">
                <div className="sidebar-header d-flex align-items-center gap-3">
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
                  }}>
                    <i className="bi bi-bicycle text-white" style={{ fontSize: '1.2rem' }}></i>
                  </div>
                  <div>
                    <div className="fw-bold text-white">Delivery Panel</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>MILK DELIVERY</div>
                  </div>
                </div>
                <nav className="sidebar-nav flex-grow-1">
                  {boyMenu.map((item) => (
                    <NavLink key={item.path} to={item.path}
                      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                      onClick={() => setShowSidebar(false)}>
                      <span className="link-icon"><i className={`bi ${item.icon}`}></i></span>
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default BoyLayout;
