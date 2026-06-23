import { NavLink } from 'react-router-dom';

const adminMenu = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { path: '/customers', label: 'Customers', icon: 'bi-people' },
  { path: '/deliveries', label: 'Deliveries', icon: 'bi-truck' },
  { path: '/billing', label: 'Billing', icon: 'bi-cash-coin' },
  { path: '/payments', label: 'Payments', icon: 'bi-wallet2' },
  { path: '/notifications', label: 'Notifications', icon: 'bi-bell' },
  { path: '/reports', label: 'Reports', icon: 'bi-graph-up' },
];

const customerMenu = [
  { path: '/my-deliveries', label: 'My Deliveries', icon: 'bi-truck' },
  { path: '/my-bills', label: 'My Bills', icon: 'bi-cash-coin' },
  { path: '/my-payments', label: 'My Payments', icon: 'bi-wallet2' },
];

const Sidebar = ({ role }) => {
  const menuItems = role === 'ADMIN' ? adminMenu : customerMenu;

  return (
    <div className="d-flex flex-column bg-dark text-white" style={{ width: '250px', minHeight: 'calc(100vh - 56px)' }}>
      <div className="p-3 border-bottom border-secondary">
        <h6 className="mb-0 text-white-50">Navigation</h6>
      </div>
      <nav className="nav flex-column p-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? 'bg-primary rounded' : 'text-white-50'}`
            }
          >
            <i className={`bi ${item.icon} me-2`}></i>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
export default Sidebar;
