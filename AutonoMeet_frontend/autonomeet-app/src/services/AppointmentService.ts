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

interface CheckoutData {
  service_id: number;
  scheduled_at: string;
}

interface CheckoutResponse {
  sessionId: string;
  publishableKey: string;
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
      if (!clientId || isNaN(clientId)) {
        throw new Error('Invalid client ID');
      }
      const response = await apiClient.get(`/appointments/client/${clientId}`);
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format: Expected an array');
      }
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Error fetching client appointments';
      throw new Error(`Failed to fetch appointments for client ${clientId}: ${message}`);
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

  createCheckoutSession: async (data: CheckoutData): Promise<CheckoutResponse> => {
    try {
      const response = await apiClient.post('/appointments/checkout', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error creating checkout session');
    }
  },
};