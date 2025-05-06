import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await ServiceService.getCategories();
        setCategories(categoriesData.map(cat => cat.name));
      } catch (err: any) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    const loadAppointments = async () => {
      if (!user?.id) return;
      try {
        setIsLoadingAppointments(true);
        const appointmentsData = await AppointmentService.getAppointmentsByClient(user.id);
        
        const appointmentsWithDetails = await Promise.all(
          appointmentsData.map(async (appointment) => {
            try {
              const service = await ServiceService.getServiceById(appointment.service_id);
              return { ...appointment, service };
            } catch (err) {
              console.error(`Error fetching service ${appointment.service_id}:`, err);
              return appointment;
            }
          })
        );
        
        setAppointments(appointmentsWithDetails);
      } catch (err: any) {
        console.error('Error loading appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    loadCategories();
    loadAppointments();
  }, [user?.id]);

  const handleViewServices = () => {
    navigate('/services');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await AppointmentService.deleteAppointment(appointmentId);
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
          <button className="action-btn" onClick={() => navigate('/profile/edit')}>
            Edit Profile
          </button>
        </section>
      </main>

      <footer className="footer">
        <p>© 2025 AutonoMeet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;