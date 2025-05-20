import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, isFreeLancer, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user && location.pathname !== '/') {
      localStorage.setItem('lastRoute', location.pathname);
    }
  }, [location, user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    const lastRoute = localStorage.getItem('lastRoute') || '/user';
    return <Navigate to="/" state={{ from: lastRoute }} replace />;
  }

  const isFreeLancerRoute = location.pathname.startsWith('/freelancer');

  if (isFreeLancerRoute && !isFreeLancer()) {
    return <Navigate to="/user" replace />;
  }

  if (
    !isFreeLancerRoute &&
    isFreeLancer() &&
    location.pathname !== '/services' &&
    location.pathname !== '/success' &&
    !location.pathname.startsWith('/services/')
  ) {
    return <Navigate to="/freelancer" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;