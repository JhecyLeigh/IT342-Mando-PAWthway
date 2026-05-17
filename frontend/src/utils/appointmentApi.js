import API from '../api';

export async function fetchAppointmentsByUser(userId) {
  const response = await API.get(`/appointments/user/${userId}`);
  return response.data;
}

export async function fetchAppointmentsByClinic(clinicId) {
  const response = await API.get(`/appointments/clinic/${clinicId}`);
  return response.data;
}

export async function fetchAppointmentById(appointmentId) {
  const response = await API.get(`/appointments/${appointmentId}`);
  return response.data;
}

export async function createAppointment(payload) {
  const response = await API.post('/appointments', payload);
  return response.data;
}

export async function updateAppointment(appointmentId, payload) {
  const response = await API.put(`/appointments/${appointmentId}`, payload);
  return response.data;
}

export async function deleteAppointment(appointmentId) {
  const response = await API.delete(`/appointments/${appointmentId}`);
  return response.data;
}
