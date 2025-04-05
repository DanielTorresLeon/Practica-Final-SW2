import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { GithubLoginButton } from 'react-social-login-buttons';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleGitHubCallback(code);
    }
  }, []);

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

  const handleGitHubLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/login')}&scope=user:email`;
    window.location.href = githubAuthUrl;
  };

  const handleGitHubCallback = async (code: string) => {
    try {
      const response = await AuthService.githubAuth({ code });
      console.log('GitHub authentication successful:', response);

      const userData = login(response.access_token);
      navigate('/products');
    } catch (err) {
      setError('Error during GitHub authentication. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="form">
        <p className="p line">Login with</p>

        <div className="flex-row">
          <div className="w-100 p-1" style={{ height: '40px' }}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          </div>
        </div>

        <div className="flex-row">
          <GithubLoginButton 
            onClick={handleGitHubLogin}
            style={{ height: '40px', width: '100%' }}  
          />
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