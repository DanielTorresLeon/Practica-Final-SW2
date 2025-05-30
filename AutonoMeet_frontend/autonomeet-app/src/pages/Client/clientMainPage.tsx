import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faSearch, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { ServiceService } from '../../services/ServiceService';
import { AppointmentService } from '../../services/AppointmentService';
import '../../styles/clientHome.css';

interface Appointment {
  id: number;
  client_id: number;
  service_id: number;
  scheduled_at: string;
  service?: {
    title: string;
    user?: {
      email: string;
    };
  };
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  console.log('Component rendering. Current appointments:', appointments.length);
  console.log('Location state:', location.state);

  const retry = async <T,>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (attempt === retries) throw err;
        console.log(`Retry attempt ${attempt} failed:`, err);
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }
    throw new Error('Unexpected retry failure');
  };

  const loadCategories = async () => {
    try {
      console.log('Starting categories load');
      setIsLoadingCategories(true);
      const categoriesData = await retry(() => ServiceService.getCategories());
      console.log('Categories loaded:', categoriesData.length);
      setCategories(categoriesData.map(cat => cat.name));
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setIsLoadingCategories(false);
      console.log('Categories loading completed');
    }
  };

  const loadAppointments = async (forceRefresh: boolean = false) => {
    console.log('loadAppointments called. forceRefresh:', forceRefresh, 'user?.id:', user?.id);
    
    if (!user?.id) {
      console.log('No user ID, skipping appointment load');
      setIsLoadingAppointments(false);
      return;
    }

    try {
      setIsLoadingAppointments(true);
      
      // Eliminamos la caché completamente para asegurar datos frescos
      console.log('Fetching fresh appointments data for user:', user.id);
      const appointmentsData = await retry(() => AppointmentService.getAppointmentsByClient(user.id));
      console.log('Raw appointments data received:', appointmentsData);
      
      const appointmentsWithDetails = await Promise.all(
        appointmentsData.map(async (appointment: Appointment) => {
          try {
            console.log(`Fetching service details for appointment ${appointment.id}`);
            const service = await retry(() => ServiceService.getServiceById(appointment.service_id));
            return { ...appointment, service };
          } catch (err) {
            console.error(`Failed to fetch service for appointment ${appointment.id}:`, err);
            return appointment;
          }
        })
      );

      console.log('Processed appointments with details:', appointmentsWithDetails);
      setAppointments(appointmentsWithDetails);
      setLastFetchTime(Date.now());
    } catch (err: any) {
      console.error('Error loading appointments:', {
        error: err.message,
        stack: err.stack,
        response: err.response?.data
      });
      setError('Failed to load appointments. Please try again later.');
    } finally {
      setIsLoadingAppointments(false);
      console.log('Appointments loading completed');
    }
  };

  useEffect(() => {
    console.log('Initial load effect triggered');
    loadCategories();
    loadAppointments();
  }, [user?.id]);

  useEffect(() => {
    console.log('Location changed effect triggered', {
      pathname: location.pathname,
      state: location.state,
      key: location.key
    });

    console.log('Forcing appointments reload on location change');
    loadAppointments(true);
    
    if (location.state?.refresh) {
      console.log('Additional refresh flag detected');
    }
  }, [location.pathname]); 

  useEffect(() => {
    console.log('Setting up visibility change listener');
    
    const handleVisibilityChange = () => {
      console.log('Visibility changed:', document.visibilityState);
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing appointments');
        loadAppointments(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      console.log('Cleaning up visibility change listener');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);

  const handleViewServices = () => {
    console.log('Navigating to services');
    navigate('/services', { state: { from: 'home' } });
  };

  const handleLogout = () => {
    console.log('Logging out');
    logout();
    navigate('/');
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    console.log('Cancelling appointment:', appointmentId);
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await retry(() => AppointmentService.deleteAppointment(appointmentId));
        console.log('Appointment cancelled successfully');
        setAppointments(appointments.filter(appointment => appointment.id !== appointmentId));
      } catch (err: any) {
        console.error('Error cancelling appointment:', err);
        setError('Failed to cancel appointment');
      }
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  console.log('Rendering with appointments:', appointments);

  return (
    <div className="home-container">
      <header className="header">
        <h1 className="logo">AutonoMeet</h1>
        <div className="user-info">
          <span>Welcome, {user?.email || 'User'}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
          </button>
        </div>
      </header>

      <main className="main-content">
        {error && <div className="error-message">{error}</div>}

        <section className="section categories">
          <h2>
            <FontAwesomeIcon icon={faSearch} /> Service Categories
          </h2>
          {isLoadingCategories ? (
            <p>Loading categories...</p>
          ) : categories.length > 0 ? (
            <ul className="category-list">
              {categories.map((category) => (
                <li key={category} className="category-item">
                  {category}
                </li>
              ))}
            </ul>
          ) : (
            <p>No categories available.</p>
          )}
          <button className="cta-btn view-services-btn" onClick={handleViewServices}>
            View Services
          </button>
        </section>

        <section className="section appointments">
          <h2>
            <FontAwesomeIcon icon={faCalendar} /> Your Appointments
          </h2>
          {isLoadingAppointments ? (
            <p>Loading appointments...</p>
          ) : appointments.length > 0 ? (
            <ul className="appointment-list">
              {appointments.map((appointment) => {
                const { date, time } = formatDateTime(appointment.scheduled_at);
                return (
                  <li key={appointment.id} className="appointment-item">
                    <div>
                      <strong>{appointment.service?.title || 'Unknown Service'}</strong> with{' '}
                      {appointment.service?.user?.email || 'Unknown Freelancer'}
                    </div>
                    <div>
                      {date} at {time}
                    </div>
                    <button
                      className="action-btn cancel-btn"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Cancel
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>You have no scheduled appointments.</p>
          )}
          <button className="cta-btn" onClick={() => navigate('/services')}>
            Book a Service
          </button>
        </section>

        <section className="section profile">
          <h2>
            <FontAwesomeIcon icon={faUser} /> Your Profile
          </h2>
          <div className="profile-info">
            <p><strong>Email:</strong> {user?.email || 'email@example.com'}</p>
          </div>
          
        </section>
      </main>

      <footer className="footer">
        <p>© 2025 AutonoMeet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;