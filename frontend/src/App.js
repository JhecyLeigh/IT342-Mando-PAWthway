import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage.js';
import Login from './pages/Login.js';
import AdminLogin from './pages/AdminLogin.js';
import Register from './pages/Register.js';
import Homepage from './pages/Homepage.js';
import Clinics from './pages/Clinics.js';
import CreateAppointment from './pages/CreateAppointment.js';
import Appointments from './pages/Appointments.js';
import Pets from './pages/Pets.js';
import AdminDashboard from './pages/AdminDashboard.js';
import AdminAppointments from './pages/AdminAppointments.js';
import AdminLogs from './pages/AdminLogs.js';

const isAuthenticated = () => Boolean(localStorage.getItem('user'));
const isAdminAuthenticated = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return Boolean(user?.id && String(user?.role || '').toUpperCase() === 'ADMIN');
};

function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  return isAuthenticated() ? <Navigate to="/homepage" replace /> : <Outlet />;
}

function AdminProtectedRoute() {
  return isAdminAuthenticated() ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Navigate to="/homepage" replace />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/clinics" element={<Clinics />} />
          <Route path="/clinics/:clinicId/appointment" element={<CreateAppointment />} />
          <Route path="/appointments" element={<Appointments />} />
        </Route>
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
