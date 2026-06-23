import { useAuth } from '../../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand navbar-dark bg-primary px-3" style={{ height: '56px' }}>
      <div className="d-flex align-items-center">
        <button className="btn btn-outline-light btn-sm me-2 d-md-none" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </button>
        <span className="navbar-brand mb-0 h6">
          <i className="bi bi-droplet me-2"></i>Milk Delivery
        </span>
      </div>
      <div className="ms-auto d-flex align-items-center gap-3">
        <span className="text-white-50 small">
          <i className="bi bi-person-circle me-1"></i>
          {user?.username} ({user?.role})
        </span>
        <button className="btn btn-outline-light btn-sm" onClick={logout}>
          <i className="bi bi-box-arrow-right me-1"></i>Logout
        </button>
      </div>
    </nav>
  );
};
export default Navbar;
