import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, OrgAdminRoute, GuestRoute } from './routes/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import Dashboard from './pages/Dashboard';
import LogActivity from './pages/LogActivity';
import Goals from './pages/Goals';
import Leaderboard from './pages/Leaderboard';
import Organisation from './pages/Organisation';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';

export default function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          {/* Guest Routes */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout title="Dashboard" />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<DashboardLayout title="Log Daily Activities" />}>
              <Route path="/log-activity" element={<LogActivity />} />
            </Route>
            <Route element={<DashboardLayout title="Carbon Goals & Milestones" />}>
              <Route path="/goals" element={<Goals />} />
            </Route>
            <Route element={<DashboardLayout title="Community Rankings" />}>
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>
            <Route element={<DashboardLayout title="User Preferences" />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Org Admin Routes */}
          <Route element={<OrgAdminRoute />}>
            <Route element={<DashboardLayout title="Corporate CSR Dashboard" />}>
              <Route path="/organisation" element={<Organisation />} />
            </Route>
          </Route>

          {/* Fallbacks */}
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>

      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="light" 
      />
    </>
  );
}
