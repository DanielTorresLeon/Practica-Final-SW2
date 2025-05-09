import apiClient from './apiClient';

interface GoogleAuthData {
    token: string;
  }
  interface GitHubAuthData {
    code: string;
  }

  interface LoginData {
    email: string;
    password: string;
  }
  
  interface RegisterData {
    email: string;
    password: string;
  }

  
export const AuthService = {

  login: async (data: LoginData) => {
    try {
      const response = await apiClient.post('/auth/login', data);
      return response.data;
    } catch (error) {
      throw new Error('Error al iniciar sesión');
    }
  },

  register: async (data: RegisterData) => {
    
      const response = await apiClient.post('/auth/register', data);
      return response.data;
   
  },
  
  googleAuth: async (data: GoogleAuthData) => {
    try {
      const response = await apiClient.post('/auth/google', data);
      return response.data;
    } catch (error) {
      throw new Error('Error durante la autenticación con Google');
    }
  },

  githubAuth: async (data: GitHubAuthData) => {
    try {
      const response = await apiClient.post('/auth/github', data);
      return response.data;
    } catch (error) {
      throw new Error('Error durante la autenticación con GitHub');
    }
  },



};