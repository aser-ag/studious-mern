import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, NavLink, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const AppLayout = () => {
  const [userName, setUserName] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current page title from path
  const getCurrentTitle = () => {
    const path = location.pathname;
    if (path.includes('courses')) return 'Courses';
    if (path.includes('tasks')) return 'Tasks';
    if (path.includes('events')) return 'Events';
    if (path.includes('analytics')) return 'Analytics';
    if (path.includes('profile')) return 'Profile';
    return 'Dashboard';
  };

  useEffect(() => {
    // Get user from localStorage (from login)
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.name || user?.userName) {
      setUserName(user.name || user.userName);
    } else {
      // Redirect to login if no user
      navigate('/login');
    }
  }, [navigate]);

  const navItems = [
    { text: 'Dashboard', href: '/app/dashboard', icon: '/assets/icons/dashboard.svg' },
    { text: 'Courses', href: '/app/courses', icon: '/assets/icons/courses.svg' },
    { text: 'Tasks', href: '/app/tasks', icon: '/assets/icons/tasks.svg' },
    { text: 'Events', href: '/app/events', icon: '/assets/icons/events.svg' },
    { text: 'Analytics', href: '/app/analytics', icon: '/assets/icons/analytics.svg' },
    { text: 'Profile', href: '/app/profile', icon: '/assets/icons/profile.svg' },
  ];

  const currentTitle = getCurrentTitle();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  // Helper function matching PHP renderNavLink
  const renderNavLink = (text, href) => {
    const isActive = text === currentTitle;
    const icon = `/assets/icons/${text.toLowerCase()}.svg`;

    if (isActive) {
      return (
        <span className="flex items-center gap-3 px-2 py-1 rounded bg-secondary-200 scale-105 duration-200 transition-all text-text-600 cursor-default">
          <img src={icon} alt="" className="w-6 h-6" />
          <span className="text-base font-medium">{text}</span>
        </span>
      );
    }

    return (
      <NavLink
        to={href}
        className="flex items-center gap-3 px-2 py-1 rounded hover:bg-secondary-100 hover:scale-105 duration-200 transition-all text-text-400"
      >
        <img src={icon} alt="" className="w-6 h-6" />
        <span className="text-base font-medium">{text}</span>
      </NavLink>
    );
  };

  return (
    <div className="bg-background-400 flex min-h-screen">
      {/* Sidebar */}
      <aside className="border-r border-secondary-600 w-64 h-screen flex flex-col min-h-screen sticky top-0">
        <div className="px-4 pt-6">
          <h1 className="text-primary-600 text-2xl px-4 font-bold">
            <Link to="/app/dashboard">Studious</Link>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <div key={item.text}>
              {renderNavLink(item.text, item.href)}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between bg-background-500 px-6 py-4 shadow-sm sticky top-0 z-10">
          {/* Search bar */}
          <div className="flex items-center gap-2 relative w-full max-w-md">
            <form className="flex items-center gap-2 relative w-full max-w-md">
              <img src="/assets/icons/search.svg" alt="Search" className="w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses, tasks, or events..."
                className="w-full bg-secondary-100 text-text-500 placeholder-text-200 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200"
              />
            </form>
          </div>

          {/* Profile dropdown */}
          {/* Profile dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <img
                src="/assets/img/avatar.png"
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-secondary-300"
              />
              <span className="text-text-500 font-medium">{userName || 'User'}</span>
              <img src="/assets/icons/profile_drop_down.svg" alt="Menu" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-secondary-100 rounded-lg shadow-lg border border-secondary-200 z-20">
                <Link
                  to="/app/profile"
                  className="block px-4 py-2 text-text-400 hover:bg-secondary-200 rounded-t-lg"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-400 hover:bg-secondary-200 rounded-b-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content - This is where child routes render */}
        <div className="p-6 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;