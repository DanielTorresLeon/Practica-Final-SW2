// src/tests/Login.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { useAuth } from '../context/AuthContext';
import '@testing-library/jest-dom';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../services/authService', () => ({
  AuthService: {
    login: vi.fn(),
    googleAuth: vi.fn(),
    githubAuth: vi.fn(),
  },
}));
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: vi.fn(() => <div>Google Login Button</div>),
}));
vi.mock('react-social-login-buttons', () => ({
  GithubLoginButton: vi.fn(() => <div>GitHub Login Button</div>),
}));
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

describe('Login Component', () => {
  beforeEach(() => {
    (useAuth as any).mockReturnValue({ login: vi.fn() });
  });

  it('renders login form correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Or sign in with')).toBeInTheDocument();
  });

  it('allows entering email and password', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('displays sign-up link', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByText('Sign up')).toHaveAttribute('href', '/signup');
  });

  it('renders Google and GitHub login buttons', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByText('Google Login Button')).toBeInTheDocument();
    expect(screen.getByText('GitHub Login Button')).toBeInTheDocument();
  });
});