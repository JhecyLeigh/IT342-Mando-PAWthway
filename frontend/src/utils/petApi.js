import API from '../api';

export async function fetchPetsByUser(userId) {
  const response = await API.get(`/pets/user/${userId}`);
  return response.data;
}

export async function registerPet(payload) {
  const response = await API.post('/pets', payload);
  return response.data;
}

export async function updatePet(petId, payload) {
  const response = await API.put(`/pets/${petId}`, payload);
  return response.data;
}

export async function deletePet(petId, userId) {
  const response = await API.delete(`/pets/${petId}`, {
    params: { userId }
  });
  return response.data;
}
