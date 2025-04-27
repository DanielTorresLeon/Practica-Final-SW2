import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, isFreeLancer } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    const isFreeLancerRoute = location.pathname.startsWith('/freelancer');

    if (isFreeLancerRoute && !isFreeLancer()) {
        return <Navigate to="/user" replace />;
    }

    if (!isFreeLancerRoute && isFreeLancer()) {
        return <Navigate to="/freelancer" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;