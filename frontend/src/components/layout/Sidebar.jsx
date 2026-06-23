import { NavLink } from 'react-router-dom';

const menus = {
  ADMIN: [
    { path: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/orders', label: 'Orders', icon: 'bi-basket' },
    { path: '/customers', label: 'Customers', icon: 'bi-people' },
    { path: '/delivery-boys', label: 'Delivery Boys', icon: 'bi-bicycle' },
    { path: '/service-requests', label: 'Service Requests', icon: 'bi-clipboard-check' },
    { path: '/deliveries', label: 'Deliveries', icon: 'bi-truck' },
    { path: '/billing', label: 'Billing', icon: 'bi-cash-coin' },
    { path: '/payments', label: 'Payments', icon: 'bi-wallet2' },
    { path: '/notifications', label: 'Notifications', icon: 'bi-bell' },
    { path: '/reports', label: 'Reports', icon: 'bi-graph-up' },
  ],
  CUSTOMER: [
    { path: '/my-dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/place-order', label: 'Place Order', icon: 'bi-plus-circle' },
    { path: '/my-orders', label: 'My Orders', icon: 'bi-basket' },
    { path: '/my-deliveries', label: 'My Deliveries', icon: 'bi-truck' },
    { path: '/my-bills', label: 'My Bills', icon: 'bi-cash-coin' },
    { path: '/my-payments', label: 'My Payments', icon: 'bi-wallet2' },
    { path: '/my-service-request', label: 'Service Status', icon: 'bi-clipboard-check' },
  ],
};

const roleLabels = {
  ADMIN: 'Admin Panel',
  CUSTOMER: 'Customer Portal',
};

const Sidebar = ({ role }) => {
  const menuItems = menus[role] || menus.CUSTOMER;

  return (
    <div className="modern-sidebar d-flex flex-column">
      <div className="sidebar-header d-flex align-items-center gap-3">
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
        }}>
          <i className="bi bi-droplet text-white" style={{ fontSize: '1.2rem' }}></i>
        </div>
        <div>
          <div className="fw-bold text-white" style={{ fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
            {roleLabels[role] || 'Dashboard'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', letterSpacing: '0.02em' }}>
            MILK DELIVERY
          </div>
        </div>
      </div>

      <div className="section-title">Main Menu</div>

      <nav className="sidebar-nav flex-grow-1">
        {menuItems.map((item) => (
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
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.1))',
          borderRadius: '12px', padding: '0.75rem 1rem',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            v2.0.0
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>
            Milk Delivery System
          </div>
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
