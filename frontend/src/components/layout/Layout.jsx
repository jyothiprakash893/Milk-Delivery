import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { user } = useAuth();

  return (
    <div className="d-flex flex-column vh-100">
      <Navbar toggleSidebar={() => setShowSidebar(!showSidebar)} />
      <div className="d-flex flex-grow-1 overflow-hidden">
        <div className={`d-none d-md-block ${showSidebar ? 'd-block' : ''}`}>
          <Sidebar role={user?.role} />
        </div>
        {showSidebar && (
          <div className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-1" onClick={() => setShowSidebar(false)}>
            <div className="bg-dark h-100" style={{ width: '250px' }} onClick={(e) => e.stopPropagation()}>
              <Sidebar role={user?.role} />
            </div>
          </div>
        )}
        <main className="flex-grow-1 p-4 overflow-auto bg-light">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default Layout;
