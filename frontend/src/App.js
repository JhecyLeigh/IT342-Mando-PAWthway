import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Homepage from './pages/Homepage.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Dashboard from './pages/Dashboard.js';
import Clinics from './pages/Clinics.js';
import Appointment from './pages/Appointment.js';
import Pets from './pages/Pets.js';

const isAuthenticated = () => Boolean(localStorage.getItem('user'));

function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/clinics" element={<Clinics />} />
          <Route path="/clinics/:clinicId/appointment" element={<Appointment />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
