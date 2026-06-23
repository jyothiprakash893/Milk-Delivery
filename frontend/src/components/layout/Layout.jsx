import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { user } = useAuth();

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      <Navbar toggleSidebar={() => setShowSidebar(!showSidebar)} />
      <div className="d-flex flex-grow-1" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* Desktop sidebar */}
        <div className="d-none d-md-block">
          <Sidebar role={user?.role} />
        </div>

        {/* Mobile sidebar overlay */}
        {showSidebar && (
          <div className="d-md-none position-fixed top-0 start-0 w-100 h-100"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1040 }}
            onClick={() => setShowSidebar(false)}>
            <div className="h-100 animate-slide-right"
              style={{ width: '260px' }}
              onClick={(e) => e.stopPropagation()}>
              <Sidebar role={user?.role} />
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
export default Layout;
