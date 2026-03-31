import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeProvider';
import '../../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRefs = useRef({});
  const navbarRef = useRef(null);

  // ── Scroll Detection ──────────────────────────────────────────────
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Auth State Listener ───────────────────────────────────────────
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    setCurrentUser(user ? JSON.parse(user) : null);
  }, [location.pathname]);

  // ── Click Outside Handler ─────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && navbarRef.current && !navbarRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // ── Keyboard Accessibility ────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeDropdown]);

  // ── Navigation Helpers ────────────────────────────────────────────
  const toggleDropdown = useCallback((dropdown) => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
  }, []);

  const closeDropdowns = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  const scrollToSection = useCallback(
    (sectionId) => {
      const isHomePage = location.pathname === '/' || location.pathname === '/login';

      if (isHomePage) {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
      closeDropdowns();
    },
    [location.pathname, navigate, closeDropdowns]
  );

  // ── Route Mapping ─────────────────────────────────────────────────
  const DASHBOARD_ROUTES = {
    doctor: '/doctor/dashboard',
    patient: '/patient/dashboard',
    pharmacist: '/pharmacist/dashboard',
    laboratory: '/laboratory/dashboard',
  };

  const ROLE_LABELS = {
    doctor: 'د.',
    patient: '',
    pharmacist: '',
    laboratory: '',
  };

  const ROLE_ICONS = {
    doctor: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    patient: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    pharmacist: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
    laboratory: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6v6l5 8H4l5-8V3z" />
      </svg>
    ),
  };

  // ── Event Handlers ────────────────────────────────────────────────
  const handleLogoClick = () => {
    if (currentUser) {
      navigate(DASHBOARD_ROUTES[currentUser.role] || '/');
    } else if (location.pathname === '/' || location.pathname === '/login') {
      scrollToSection('hero');
    } else {
      navigate('/');
    }
  };

  const handleLoginButtonClick = () => {
    if (location.pathname === '/signup') {
      navigate('/');
    } else if (location.pathname === '/' || location.pathname === '/login') {
      scrollToSection('hero');
    } else {
      navigate('/');
    }
  };

  const handleSignupClick = (e) => {
    e.preventDefault();
    navigate('/signup');
    closeDropdowns();
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/');
    closeDropdowns();
  };

  // ── Derived State ─────────────────────────────────────────────────
  const isDashboardPage = location.pathname.includes('/dashboard');
  const rolePrefix = currentUser ? ROLE_LABELS[currentUser.role] || '' : '';
  const isDark = theme === 'dark';

  // ── Dropdown Data ─────────────────────────────────────────────────
  const aboutMenuItems = [
    { id: 'about', label: 'عن Patient 360°', icon: 'info' },
    { id: 'vision', label: 'رؤيتنا ورسالتنا', icon: 'eye' },
    { id: 'contact', label: 'اتصل بنا', icon: 'mail' },
  ];

  const servicesMenuItems = [
    { id: 'services', label: 'خدماتنا', icon: 'grid' },
    { id: 'signup', label: 'إنشاء حساب جديد', icon: 'user-plus', action: handleSignupClick },
  ];

  // ── Dropdown Icon Component ───────────────────────────────────────
  const DropdownIcon = ({ type }) => {
    const icons = {
      info: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      ),
      eye: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      mail: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 7l-10 6L2 7" />
        </svg>
      ),
      grid: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      'user-plus': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      ),
    };

    return icons[type] || null;
  };

  // ── Dropdown Render Helper ────────────────────────────────────────
  const renderDropdownMenu = (items, dropdownKey) => {
    if (activeDropdown !== dropdownKey) return null;

    return (
      <div
        className="p360-dropdown-menu"
        role="menu"
        aria-label={dropdownKey === 'about' ? 'حول المنصة' : 'الخدمات'}
        ref={(el) => (dropdownRefs.current[dropdownKey] = el)}
      >
        <div className="p360-dropdown-inner">
          {items.map((item, index) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="p360-dropdown-item"
              role="menuitem"
              style={{ animationDelay: `${index * 0.04}s` }}
              onClick={(e) => {
                e.preventDefault();
                if (item.action) {
                  item.action(e);
                } else {
                  scrollToSection(item.id);
                }
              }}
            >
              <span className="p360-dropdown-item-icon">
                <DropdownIcon type={item.icon} />
              </span>
              <span className="p360-dropdown-item-label">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  // ── Chevron Arrow SVG ─────────────────────────────────────────────
  const ChevronDown = ({ isOpen }) => (
    <svg
      className={`p360-chevron ${isOpen ? 'p360-chevron--open' : ''}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  // ── Main Render ───────────────────────────────────────────────────
  return (
    <>
      {activeDropdown && (
        <div className="p360-overlay" onClick={closeDropdowns} aria-hidden="true" />
      )}

      <nav
        ref={navbarRef}
        className={`p360-navbar ${isScrolled ? 'p360-navbar--scrolled' : ''}`}
        role="navigation"
        aria-label="التنقل الرئيسي"
      >
        <div className="p360-navbar-container">
          {/* ── Logo Section ── */}
          <div className="p360-navbar-brand">
            <button
              className="p360-logo-btn"
              onClick={handleLogoClick}
              aria-label="الصفحة الرئيسية"
            >
              <div className="p360-logo-icon">
                <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Shield Shape */}
                  <path
                    d="M18 2L4 8v10c0 9 6 16 14 18 8-2 14-9 14-18V8L18 2z"
                    fill="url(#shieldGrad)"
                    opacity="0.15"
                    stroke="url(#shieldStroke)"
                    strokeWidth="1.5"
                  />
                  {/* Medical Cross */}
                  <rect x="15" y="10" width="6" height="16" rx="1.5" fill="url(#crossGrad)" />
                  <rect x="10" y="15" width="16" height="6" rx="1.5" fill="url(#crossGrad)" />
                  {/* Pulse Line */}
                  <path
                    className="p360-pulse-path"
                    d="M6 18h4l2-4 3 8 2-6 2 4h4l2-3 2 3h3"
                    stroke="url(#pulseGrad)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="shieldGrad" x1="4" y1="2" x2="32" y2="30">
                      <stop offset="0%" stopColor="#4DB6AC" />
                      <stop offset="100%" stopColor="#00897B" />
                    </linearGradient>
                    <linearGradient id="shieldStroke" x1="4" y1="2" x2="32" y2="30">
                      <stop offset="0%" stopColor="#4DB6AC" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#00897B" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="crossGrad" x1="10" y1="10" x2="26" y2="26">
                      <stop offset="0%" stopColor="#E0F2F1" />
                      <stop offset="100%" stopColor="#B2DFDB" />
                    </linearGradient>
                    <linearGradient id="pulseGrad" x1="6" y1="18" x2="34" y2="18">
                      <stop offset="0%" stopColor="#4DB6AC" stopOpacity="0" />
                      <stop offset="30%" stopColor="#4DB6AC" />
                      <stop offset="70%" stopColor="#00897B" />
                      <stop offset="100%" stopColor="#00897B" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="p360-logo-text">
                <span className="p360-logo-name">
                  PATIENT 360<span className="p360-logo-degree">°</span>
                </span>
                <span className="p360-logo-tagline">المنصة الطبية الوطنية</span>
              </div>
            </button>
          </div>

          {/* ── Navigation Section ── */}
          <div className="p360-navbar-nav">
            {currentUser ? (
              <div className="p360-auth-section">
                {/* ── Theme Toggle ── */}
                <button
                  className={`p360-theme-btn ${isDark ? 'p360-theme-btn--dark' : ''}`}
                  onClick={toggleTheme}
                  aria-label={isDark ? 'تبديل إلى الوضع الفاتح' : 'تبديل إلى الوضع الداكن'}
                  title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
                  type="button"
                >
                  <span className={`p360-theme-btn__icons ${isDark ? 'p360-theme-btn__icons--dark' : ''}`}>
                    {/* Moon */}
                    <svg className="p360-theme-btn__moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                    {/* Sun */}
                    <svg className="p360-theme-btn__sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  </span>
                </button>

                <div className="p360-user-badge">
                  <div className="p360-user-avatar">
                    {ROLE_ICONS[currentUser.role]}
                  </div>
                  <div className="p360-user-details">
                    <span className="p360-user-greeting">مرحباً</span>
                    <span className="p360-user-name">
                      {rolePrefix} {currentUser.firstName}
                    </span>
                  </div>
                </div>
                <button className="p360-btn p360-btn--logout" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            ) : (
              <div className="p360-guest-section">
                {/* ── Theme Toggle ── */}
                <button
                  className={`p360-theme-btn ${isDark ? 'p360-theme-btn--dark' : ''}`}
                  onClick={toggleTheme}
                  aria-label={isDark ? 'تبديل إلى الوضع الفاتح' : 'تبديل إلى الوضع الداكن'}
                  title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
                  type="button"
                >
                  <span className={`p360-theme-btn__icons ${isDark ? 'p360-theme-btn__icons--dark' : ''}`}>
                    {/* Moon */}
                    <svg className="p360-theme-btn__moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                    {/* Sun */}
                    <svg className="p360-theme-btn__sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  </span>
                </button>

                <button
                  className="p360-btn p360-btn--login"
                  onClick={handleLoginButtonClick}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>تسجيل الدخول</span>
                </button>

                {!isDashboardPage && (
                  <>
                    {/* About Dropdown */}
                    <div className="p360-nav-item">
                      <button
                        className={`p360-btn p360-btn--nav ${activeDropdown === 'about' ? 'p360-btn--active' : ''}`}
                        onClick={() => toggleDropdown('about')}
                        aria-expanded={activeDropdown === 'about'}
                        aria-haspopup="true"
                      >
                        <span>حول المنصة</span>
                        <ChevronDown isOpen={activeDropdown === 'about'} />
                      </button>
                      {renderDropdownMenu(aboutMenuItems, 'about')}
                    </div>

                    {/* Services Dropdown */}
                    <div className="p360-nav-item">
                      <button
                        className={`p360-btn p360-btn--nav ${activeDropdown === 'services' ? 'p360-btn--active' : ''}`}
                        onClick={() => toggleDropdown('services')}
                        aria-expanded={activeDropdown === 'services'}
                        aria-haspopup="true"
                      >
                        <span>الخدمات</span>
                        <ChevronDown isOpen={activeDropdown === 'services'} />
                      </button>
                      {renderDropdownMenu(servicesMenuItems, 'services')}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Accent Line ── */}
        <div className="p360-navbar-accent" />
      </nav>
    </>
  );
};

export default Navbar;
