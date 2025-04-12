import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { GithubLoginButton } from 'react-social-login-buttons';
import '../styles/login.css';
import { Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

      login(response.access_token);
      navigate('/products');
    } catch (err) {
      setError('Error during GitHub authentication. Please try again.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await AuthService.login({ email, password });
      login(response.access_token);
      navigate('/products');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="form">
        <h2>Sign In</h2>
        
        <form onSubmit={handleLoginSubmit}>
          <div className="input-group">
            <label htmlFor="email" className="input-label">Email</label>
            <input
              id="email"
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password" className="input-label">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">
            Sign In
          </button>
        </form>

        <p className="p line">Or sign in with</p>

        <div className="flex-row">
          <div className="w-100 p-1 google-login-container" style={{ height: '40px' }}>
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
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="auth-redirect">
          Don't have an account? <Link to="/signup" className="redirect-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;