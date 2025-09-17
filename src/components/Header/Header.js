import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import './Header.css';
import logo from '../../logo.png';

const Header = ({ variant = 'default', user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (e) {
      // noop
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand">
          <img src={logo} alt="QR Master logo" className="brand-logo" />
          <span className="brand-name">QR Master</span>
        </Link>

        <button
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        {variant === 'landing' && (
          <nav className={`nav ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
            <Link to="/privacy" className="nav-link">Privacy</Link>
            <Link to="/terms" className="nav-link">Terms</Link>
            <Link to="/about" className="nav-link">About</Link>
            <button className="primary-btn" onClick={() => navigate('/login')}>Get Started</button>
          </nav>
        )}

        {variant === 'dashboard' && (
          <nav className={`nav ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
            {location.pathname === '/dashboard' ? (
              <Link to="/about" className="nav-link">About</Link>
            ) : (
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            )}
            {user?.email && (
              <span className="user-chip" title={user.email}>{user.email}</span>
            )}
            <button className="secondary-btn" onClick={handleLogout}>Logout</button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;


