import './App.css';
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Landing from './components/Landing/Landing';
import QRGenerator from './components/QRGenerator/QRGenerator';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Header from './components/Header/Header';
import PrivacyPolicy from './components/Pages/PrivacyPolicy';
import TermsConditions from './components/Pages/TermsConditions';
import AboutUs from './components/Pages/AboutUs';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return <div className="App">Loading...</div>;
  }

  const Protected = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  };

  const RedirectIfAuthed = ({ children }) => {
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <div className="App">
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <RedirectIfAuthed>
              <>
                <Header variant="landing" user={user} />
                <Landing onGetStarted={() => (user ? navigate('/dashboard') : navigate('/login'))} />
                {showGenerator && (
                  <QRGenerator user={user} onClose={() => setShowGenerator(false)} />
                )}
              </>
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/privacy"
          element={
            <RedirectIfAuthed>
              <><Header variant="landing" user={user} /><div className="page-container"><div className="page-content"><h1>Privacy Policy</h1><PrivacyPolicy /></div></div></>
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/terms"
          element={
            <RedirectIfAuthed>
              <><Header variant="landing" user={user} /><div className="page-container"><div className="page-content"><h1>Terms & Conditions</h1><TermsConditions /></div></div></>
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/about"
          element={
            user ? (
              <>
                <Header variant="dashboard" user={user} />
                <div className="page-container"><div className="page-content"><h1>About Us</h1><AboutUs /></div></div>
              </>
            ) : (
              <>
                <Header variant="landing" user={user} />
                <div className="page-container"><div className="page-content"><h1>About Us</h1><AboutUs /></div></div>
              </>
            )
          }
        />
        <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
        <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <>
                <Header variant="dashboard" user={user} />
                <Dashboard user={user} />
              </>
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
