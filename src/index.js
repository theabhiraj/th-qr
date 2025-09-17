import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

// app screens
import Header from './components/Header/Header';
import Landing from './components/Landing/Landing';
import QRGenerator from './components/QRGenerator/QRGenerator';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import PrivacyPolicy from './components/Pages/PrivacyPolicy';
import TermsConditions from './components/Pages/TermsConditions';
import AboutUs from './components/Pages/AboutUs';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Minimal Auth Context
const AuthContext = React.createContext({ user: null, loading: true });

function AuthProvider() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  const value = useMemo(() => ({ user, loading }), [user, loading]);
  return (
    <AuthContext.Provider value={value}>
      <Outlet />
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = React.useContext(AuthContext);
  return ctx;
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="App">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

function RedirectIfAuthedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="App">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function LandingWrapper() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showGenerator, setShowGenerator] = useState(false);
  return (
    <>
      <Header variant="landing" user={user} />
      <Landing onGetStarted={() => (user ? navigate('/dashboard') : navigate('/login'))} />
      {showGenerator && (
        <QRGenerator user={user} onClose={() => setShowGenerator(false)} />
      )}
    </>
  );
}

function AboutWrapper() {
  const { user } = useAuth();
  return user ? (
    <>
      <Header variant="dashboard" user={user} />
      <div className="page-container"><div className="page-content"><h1>About Us</h1><AboutUs /></div></div>
    </>
  ) : (
    <>
      <Header variant="landing" user={user} />
      <div className="page-container"><div className="page-content"><h1>About Us</h1><AboutUs /></div></div>
    </>
  );
}

function PrivacyWrapper() {
  const { user } = useAuth();
  return (
    <>
      <Header variant="landing" user={user} />
      <div className="page-container"><div className="page-content"><h1>Privacy Policy</h1><PrivacyPolicy /></div></div>
    </>
  );
}

function TermsWrapper() {
  const { user } = useAuth();
  return (
    <>
      <Header variant="landing" user={user} />
      <div className="page-container"><div className="page-content"><h1>Terms & Conditions</h1><TermsConditions /></div></div>
    </>
  );
}

function DashboardWrapper() {
  const { user } = useAuth();
  return (
    <>
      <Header variant="dashboard" user={user} />
      <Dashboard user={user} />
    </>
  );
}

const router = createBrowserRouter(
  [
    {
      element: <AuthProvider />, // provides user/loading
      children: [
        {
          element: <RedirectIfAuthedRoute />,
          children: [
            { path: '/', element: <LandingWrapper /> },
            { path: '/privacy', element: <PrivacyWrapper /> },
            { path: '/terms', element: <TermsWrapper /> },
            { path: '/login', element: <Login /> },
            { path: '/signup', element: <Signup /> },
          ],
        },
        {
          element: <ProtectedRoute />, // must be authed
          children: [
            { path: '/dashboard', element: <DashboardWrapper /> },
          ],
        },
        { path: '/about', element: <AboutWrapper /> },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ],
  {
    basename: process.env.NODE_ENV === 'production' ? '/th-qr' : '/',
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
