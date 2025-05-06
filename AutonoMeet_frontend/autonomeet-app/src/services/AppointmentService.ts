import apiClient from './apiClient';

interface AppointmentData {
  client_id: number;
  service_id: number;
  scheduled_at: string;
}

interface Appointment {
  id: number;
  client_id: number;
  service_id: number;
  scheduled_at: string;
  created_at: string;
}

export const AppointmentService = {
  createAppointment: async (data: AppointmentData) => {
    try {
      const response = await apiClient.post('/appointments', data);
      return response.data;
    } catch (error) {
      throw new Error('Error creating appointment');
    }
  },

  getAppointmentsByFreelancer: async (freelancerId: number): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get(`/appointments/freelancer/${freelancerId}`);
      return response.data;
    } catch (error) {
      throw new Error('Error fetching freelancer appointments');
    }
  },

  getAppointmentsByClient: async (clientId: number): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get(`/appointments/client/${clientId}`);
      return response.data;
    } catch (error) {
      throw new Error('Error fetching client appointments');
    }
  },

  deleteAppointment: async (appointmentId: number) => {
    try {
      const response = await apiClient.delete(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw new Error('Error deleting appointment');
    }
  },
};