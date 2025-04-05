import apiClient from './apiClient';

interface GoogleAuthData {
    token: string;
  }

  
export const AuthService = {
  googleAuth: async (data: GoogleAuthData) => {
    try {
      const response = await apiClient.post('/auth/google', data);
      return response.data;
    } catch (error) {
      throw new Error('Error durante la autenticación con Google');
    }
  },


};