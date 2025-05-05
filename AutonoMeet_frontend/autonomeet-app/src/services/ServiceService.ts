import apiClient from './apiClient';

interface Service {
  id: number;
  title: string;
  price: number;
  description?: string;
  category_id: number;
  user_id: number;
  category?: {
    name: string;
  };
  user?: {
    id: number;
    email: string;
  };
  average_rating?: number;
  duration_minutes?: number;
  created_at?: string;
}

interface CreateServiceData {
  title: string;
  price: number;
  description?: string;
  category_id: number;
  user_id: number;
}

interface UpdateServiceData {
  title?: string;
  price?: number;
  description?: string;
  category_id?: number;
  duration_minutes?: number;
}

export const ServiceService = {
  getFreelancerServices: async (userId: number): Promise<Service[]> => {
    try {
      const response = await apiClient.get(`/services/freelancer/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching freelancer services');
    }
  },

  getServiceById: async (serviceId: number): Promise<Service> => {
    try {
      const response = await apiClient.get(`/services/${serviceId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching service details');
    }
  },

  createService: async (data: CreateServiceData): Promise<Service> => {
    try {
      const response = await apiClient.post('/services/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error creating service');
    }
  },

  updateService: async (serviceId: number, data: UpdateServiceData): Promise<Service> => {
    try {
      const response = await apiClient.put(`/services/${serviceId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error updating service');
    }
  },

  deleteService: async (serviceId: number): Promise<void> => {
    try {
      await apiClient.delete(`/services/${serviceId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error deleting service');
    }
  },

  getCategories: async (): Promise<{ id: number; name: string }[]> => {
    try {
      const response = await apiClient.get('/services/categories');
      return response.data;
    } catch (error: any) {
      console.error('getCategories error:', error, error.response);
      throw new Error(error.response?.data?.message || `Error fetching categories: ${error.message || 'Network Error'}`);
    }
  },

  getServiceStats: async (userId: number): Promise<{
    totalServices: number;
    totalEarnings: number;
    averageRating: number;
  }> => {
    try {
      const response = await apiClient.get(`/services/user/${userId}/stats`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching service statistics');
    }
  },

  getAllServices: async (): Promise<Service[]> => {
    try {
      const response = await apiClient.get('/services/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching all services');
    }
  },
};
