import { useAuth } from '../../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-navbar d-flex align-items-center px-4" style={{ height: '64px', zIndex: 1030 }}>
      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-modern-outline d-md-none p-1" onClick={toggleSidebar}
          style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>
          <i className="bi bi-list"></i>
        </button>
        <div className="d-flex align-items-center gap-2">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="bi bi-droplet text-white" style={{ fontSize: '1.1rem' }}></i>
          </div>
          <span className="fw-bold text-white" style={{ fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
            Milk<span style={{ color: 'var(--primary-light)' }}>Web</span>
          </span>
        </div>
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-person text-white" style={{ fontSize: '0.8rem' }}></i>
          </div>
          <span className="text-white-50" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            {user?.username}
          </span>
          <span className="badge-modern" style={{
            background: user?.role === 'ADMIN'
              ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))'
              : 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.2))',
            color: user?.role === 'ADMIN' ? '#a5b4fc' : '#6ee7b7',
            fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.03em'
          }}>
            {user?.role}
          </span>
        </div>

        <button onClick={logout} className="btn px-3" style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.6)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 500,
          transition: 'all 0.2s'
        }}
          onMouseEnter={e => { e.target.style.background = 'rgba(239,68,68,0.2)'; e.target.style.color = '#fca5a5'; }}
          onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = 'rgba(255,255,255,0.6)'; }}>
          <i className="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>
    </nav>
  );
};
export default Navbar;
