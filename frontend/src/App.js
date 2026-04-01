import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Homepage from './pages/Homepage.js';
import Clinics from './pages/Clinics.js';
import Appointment from './pages/Appointment.js';
import Pets from './pages/Pets.js';

const isAuthenticated = () => Boolean(localStorage.getItem('user'));

function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  return isAuthenticated() ? <Navigate to="/homepage" replace /> : <Outlet />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Navigate to="/homepage" replace />} />
          <Route path="/homepage" element={<Homepage />} />
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
