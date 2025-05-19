import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { AppointmentService } from '../../services/AppointmentService';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const [message, setMessage] = useState('Processing your booking...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const confirmBooking = async () => {
      const sessionId = new URLSearchParams(location.search).get('session_id');
      
      if (!sessionId) {
        setMessage('Invalid session ID');
        setIsLoading(false);
        setTimeout(() => navigate('/user'), 3000);
        return;
      }

      try {
        const response = await apiClient.get(`/appointments/success?session_id=${sessionId}`);
        
        const pendingAppointment = localStorage.getItem('pendingAppointment');
        if (pendingAppointment) {
          const { serviceId, scheduledAt, userId } = JSON.parse(pendingAppointment);
          
          await AppointmentService.verifyAppointment(serviceId, scheduledAt);
          
          localStorage.removeItem('pendingAppointment');
          
          const token = localStorage.getItem('token');
          if (token) {
            login(token);
          }
          
          setMessage('Booking confirmed! Redirecting...');
          setTimeout(() => navigate('/user', { 
            state: { 
              refresh: true,
              newAppointment: true 
            } 
          }), 2000);
        } else {
          setMessage('Booking confirmed! Redirecting...');
          setTimeout(() => navigate('/user'), 2000);
        }
      } catch (err: any) {
        console.error('Error confirming booking:', err);
        setMessage(err.response?.data?.message || 'Error confirming your booking');
        setTimeout(() => navigate('/user'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    confirmBooking();
  }, [location, navigate, login]);

  return (
    <div className="success-page">
      <div className="success-container">
        <h2>{message}</h2>
        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;