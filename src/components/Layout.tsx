import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, FileEdit, ClipboardList, Bell, ChevronDown, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import logo from '../assets/images/logo.svg';
import UserAvatar from '../assets/images/user.svg';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => window.innerWidth <= 525);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path: string) => location.pathname.startsWith(path);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 525) setCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`app-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <a href='/'>
            <img src={logo} alt="PrepRoute" className="sidebar-logo__img" />
          </a>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`sidebar-nav__item${isActive('/dashboard') ? ' active' : ''}`} title="Dashboard">
            <TrendingUp size={18} />
            {!collapsed && <span>Dashboard</span>}
          </Link>
          <Link to="/test/create" className={`sidebar-nav__item${isActive('/test') ? ' active' : ''}`} title="Test Creation">
            <FileEdit size={18} />
            {!collapsed && <span>Test Creation</span>}
          </Link>
          <Link to="#" className="sidebar-nav__item" title="Test Tracking">
            <ClipboardList size={18} />
            {!collapsed && <span>Test Tracking</span>}
          </Link>
        </nav>
      </aside>

      <div className="main-wrapper">
        <header className="top-header">
          <button className="notif-btn">
            <Bell size={19} />
            <span className="notif-dot" />
          </button>
          <div className="user-dropdown-wrapper" ref={dropdownRef}>
            <div className="user-card" onClick={() => setDropdownOpen(o => !o)}>
              <div className="user-avatar">
                <img src={UserAvatar} alt="User Avatar" />
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name?.toLowerCase() || 'Alex Wando'}</span>
                <span className="user-role">Admin</span>
              </div>
              <ChevronDown size={18} color="#374151" className={`dropdown-chevron${dropdownOpen ? ' open' : ''}`} />
            </div>
            {dropdownOpen && (
              <div className="user-dropdown">
                <button className="user-dropdown__item" onClick={handleLogout}>
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};
