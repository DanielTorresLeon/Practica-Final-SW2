import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import React, { useState , useEffect} from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/login.css';

const Registration = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    is_freelancer: false,
  });
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
  
    console.log("UseEFFECT");
    console.log(state);
  
    let isFreelancer = null;
    if (state !== null) {
      isFreelancer = state === 'freelancer';
      setFormData((prev) => ({
        ...prev,
        is_freelancer: isFreelancer,
      }));
    }
  
    if (code) {
      handleGitHubCallback(code, isFreelancer);
    }
  }, []);

  useEffect(() => {
    console.log('Estado actual de formData:', formData);
  }, [formData]);

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    if (formData.is_freelancer === null) {
      setError('Please select whether you are a Freelancer or Client.');
      return;
    }
    try {
      const response = await AuthService.googleAuth({
        token: credentialResponse.credential,
        is_freelancer: formData.is_freelancer,
      });
      console.log('Google authentication successful:', response);

      const userData = login(response.access_token);

      navigate(userData.is_freelancer ? '/freelancer' : '/user');
    } catch (err) {
      setError('Error during Google authentication. Please try again.');
    }
  };

  const handleGoogleLoginError = () => {
    setError('Google authentication failed. Please try again.');
  };

  const handleGithubLogin = async () => {
    const userType = formData.is_freelancer ? 'freelancer' : 'client';
    console.log("GITHUB LOGIN")
    console.log(userType)
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent('http://localhost:5173/signup')}&scope=user:email&state=${userType}`;
    window.location.href = githubAuthUrl;
  };

  const handleGitHubCallback = async (code: string, isFreelancer: boolean | null = formData.is_freelancer) => {
    console.log(formData.is_freelancer)
    try {
      const response = await AuthService.githubAuth({
        code: code,
        is_freelancer: isFreelancer,
        
      });
      
      console.log('GitHub authentication successful:', response);

      const userData = login(response.access_token);
      navigate(userData.is_freelancer ? '/freelancer' : '/user');
    } catch (err) {
      setError('Error during GitHub authentication. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      is_freelancer: e.target.value === 'freelancer'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await AuthService.register({
        email: formData.email,
        password: formData.password,
        is_freelancer: formData.is_freelancer
      });

      login(response.access_token);
      
      // Redirect based on user role
      if (formData.is_freelancer) {
        navigate('/freelancer');
      } else {
        navigate('/user');
      }
      
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="form">
        <h2>Create Account</h2>
        
        <form onSubmit={handleSubmit}>
          

          <div className="input-group">
            <label htmlFor="email" className="input-label">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password" className="input-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className="input-field"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              className="input-field"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="input-group">
            <label className="input-label">I am a:</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="userType"
                  value="freelancer"
                  checked={formData.is_freelancer}
                  onChange={handleUserTypeChange}
                />
                <span>Freelancer</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="userType"
                  value="client"
                  checked={!formData.is_freelancer}
                  onChange={handleUserTypeChange}
                />
                <span>Client</span>
              </label>
            </div>
          </div>
          
          <button type="submit" className="submit-btn">
            Sign Up
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="auth-redirect">
          Already have an account? <Link to="/" className="redirect-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Registration;