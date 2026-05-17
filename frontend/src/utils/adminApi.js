import API from '../api';

export async function fetchAdminDashboard(adminUserId) {
  const response = await API.get('/admin/dashboard', {
    params: { adminUserId }
  });
  return response.data;
}

export async function fetchAdminAppointments(adminUserId) {
  const response = await API.get('/admin/appointments', {
    params: { adminUserId }
  });
  return response.data;
}

export async function fetchPendingAdminAppointments(adminUserId) {
  const response = await API.get('/admin/appointments/pending', {
    params: { adminUserId }
  });
  return response.data;
}

export async function confirmAdminAppointment(appointmentId, adminUserId) {
  const response = await API.patch(`/admin/appointments/${appointmentId}/confirm`, null, {
    params: { adminUserId }
  });
  return response.data;
}

export async function fetchAdminLogs(adminUserId) {
  const response = await API.get('/admin/logs', {
    params: { adminUserId }
  });
  return response.data;
}
