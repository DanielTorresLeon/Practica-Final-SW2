import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      const response = await AuthService.googleAuth({ token: credentialResponse.credential });
      console.log('Google authentication successful:', response);

      login(response.access_token);
      navigate('/products');
    } catch (err) {
      setError('Error during Google authentication. Please try again.');
    }
  };

  const handleGoogleLoginError = () => {
    setError('Google authentication failed. Please try again.');
  };

  return (
    <div className="login-container">
      <div className="form">
        <p className="p line">Login with Google</p>

        <div className="flex-row">
          <div className="w-100 p-1" style={{ height: '40px' }}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          </div>
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;