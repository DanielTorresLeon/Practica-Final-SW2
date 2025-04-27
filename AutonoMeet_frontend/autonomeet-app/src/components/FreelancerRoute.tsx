import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const AdminRoute = () => {
    const { is_freelancer } = useAuth();

    if (!is_freelancer()) {
        return <Navigate to="/user" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;