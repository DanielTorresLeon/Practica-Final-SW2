import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendar, faSearch, faUser, faSignOutAlt, 
  faBriefcase, faDollarSign, faPlus, faEdit, faTrash,
  faInfoCircle, faStar, faClock
} from '@fortawesome/free-solid-svg-icons';
import Calendar from 'react-calendar';
import Modal from 'react-modal';
import { useAuth } from '../../context/AuthContext'; 
import { ServiceService } from '../../services/ServiceService';
import { AppointmentService } from '../../services/AppointmentService';
import 'react-calendar/dist/Calendar.css';
import '../../styles/freelancerHome.css';

Modal.setAppElement('#root');

interface Service {
  id: number;
  title: string;
  price: number;
  description?: string;
  category_id: number;
  user_id: number;
  category?: {
    name: string;
  };
  average_rating?: number;
  duration_minutes?: number;
  created_at?: string;
}

interface Appointment {
  id: number;
  client_id: number;
  service_id: number;
  scheduled_at: string;
  created_at: string;
}

interface AppointmentWithService extends Appointment {
  service?: {
    title: string;
  };
}

const FreelancerHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalServices: 0,
    totalEarnings: 0,
    averageRating: 0
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.id) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        if (!user.is_freelancer) {
          setError(`User with ID ${user.id} is not registered as a freelancer`);
          setLoading(false);
          return;
        }

        const servicesData = await ServiceService.getFreelancerServices(Number(user.id));
        setServices(servicesData);

        const appointmentsData = await AppointmentService.getAppointmentsByFreelancer(Number(user.id));
        const appointmentsWithService = await Promise.all(
          appointmentsData.map(async (appointment) => {
            try {
              const service = await ServiceService.getServiceById(appointment.service_id);
              return { ...appointment, service: { title: service.title } };
            } catch (err) {
              console.error(`Error fetching service ${appointment.service_id}:`, err);
              return appointment;
            }
          })
        );
        setAppointments(appointmentsWithService);

        // Calculate stats
        const totalEarnings = servicesData.reduce((sum, service) => sum + service.price, 0);
        const avgRating = servicesData.reduce((sum, service) => sum + (service.average_rating || 0), 0) / 
                         (servicesData.length || 1);
        
        setStats({
          totalServices: servicesData.length,
          totalEarnings,
          averageRating: parseFloat(avgRating.toFixed(1))
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/freelancer/clients?query=${searchQuery}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteService = async (serviceId: number) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      try {
        await ServiceService.deleteService(serviceId);
        setServices(services.filter(service => service.id !== serviceId));
        setStats(prev => ({
          ...prev,
          totalServices: prev.totalServices - 1
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete service');
      }
    }
  };

  const getAppointmentsForDate = (date: Date): AppointmentWithService[] => {
    return appointments.filter(appointment => {
      const apptDate = new Date(appointment.scheduled_at);
      return (
        apptDate.getFullYear() === date.getFullYear() &&
        apptDate.getMonth() === date.getMonth() &&
        apptDate.getDate() === date.getDate()
      );
    });
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const appts = getAppointmentsForDate(date);
    return appts.length > 0 ? 'has-appointments' : null;
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const openAllAppointmentsModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="freelancer-container">
      <header className="header">
        <h1 className="logo">AutonoMeet</h1>
        <div className="user-info">
          <span>Welcome, {user?.email || 'Freelancer'}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* Dashboard Stats */}
        <section className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Services</h3>
            <p className="stat-value">{stats.totalServices}</p>
          </div>
          <div className="stat-card">
            <h3>Total Earnings</h3>
            <p className="stat-value">${stats.totalEarnings.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Average Rating</h3>
            <p className="stat-value">
              <FontAwesomeIcon icon={faStar} color="gold" /> {stats.averageRating}
            </p>
          </div>
        </section>

        {/* Appointments Calendar */}
        <section className="section appointments">
          <div className="section-header">
            <h2>
              <FontAwesomeIcon icon={faCalendar} /> Your Schedule
            </h2>
            <button className="cta-btn" onClick={openAllAppointmentsModal}>
              View All Appointments
            </button>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileClassName={tileClassName}
            />
          </div>
          <h3>Appointments for {selectedDate.toLocaleDateString()}</h3>
          {selectedDateAppointments.length > 0 ? (
            <ul className="appointment-list">
              {selectedDateAppointments.map((appointment) => {
                const { date, time } = formatDateTime(appointment.scheduled_at);
                return (
                  <li key={appointment.id} className="appointment-item">
                    <div>
                      <strong>{appointment.service?.title || 'Unknown Service'}</strong>
                    </div>
                    <div>
                      {date} at {time}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No appointments scheduled for this date.</p>
          )}
        </section>

        {/* Services Section */}
        <section className="section services">
          <div className="section-header">
            <h2>
              <FontAwesomeIcon icon={faBriefcase} /> Your Services
            </h2>
            <button 
              className="add-service-btn"
              onClick={() => navigate('/freelancer/services/new')}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Service
            </button>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your services...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <h4>Error Loading Services</h4>
              <p>{error}</p>
              {user && !user.is_freelancer && (
                <button 
                  className="cta-btn"
                  onClick={() => navigate('/profile/settings')}
                >
                  Upgrade to Freelancer Account
                </button>
              )}
            </div>
          ) : services.length > 0 ? (
            <div className="services-grid">
              {services.map((service) => (
                <div key={service.id} className="service-card">
                  <div className="service-header">
                    <h3>{service.title}</h3>
                    <div className="service-meta">
                      <span className="service-price">${service.price.toFixed(2)}</span>
                      {service.duration_minutes && (
                        <span className="service-duration">
                          <FontAwesomeIcon icon={faClock} /> {service.duration_minutes} mins
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {service.description && (
                    <p className="service-description">{service.description}</p>
                  )}
                  
                  <div className="service-footer">
                    {service.category && (
                      <span className="service-category">{service.category.name}</span>
                    )}
                    {service.average_rating && (
                      <span className="service-rating">
                        <FontAwesomeIcon icon={faStar} color="gold" /> {service.average_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  
                  <div className="service-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => navigate(`/freelancer/services/edit/${service.id}`)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-services">
              <p>You haven't added any services yet.</p>
              <button 
                className="cta-btn"
                onClick={() => navigate('/freelancer/services/new')}
              >
                Create Your First Service
              </button>
            </div>
          )}
        </section>
      </main>

      {/* All Appointments Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '600px',
            width: '90%',
            padding: '20px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }
        }}
      >
        <h2>All Appointments</h2>
        {appointments.length > 0 ? (
          <ul className="appointment-list">
            {appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.scheduled_at);
              return (
                <li key={appointment.id} className="appointment-item">
                  <div>
                    <strong>{appointment.service?.title || 'Unknown Service'}</strong>
                  </div>
                  <div>
                    {date} at {time}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>You have no scheduled appointments.</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={closeModal}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Close
          </button>
        </div>
      </Modal>

      <footer className="footer">
        <p>© 2025 AutonoMeet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FreelancerHome;