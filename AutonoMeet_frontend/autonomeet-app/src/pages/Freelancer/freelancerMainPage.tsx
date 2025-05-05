import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendar, faSearch, faUser, faSignOutAlt, 
  faBriefcase, faDollarSign, faPlus, faEdit, faTrash,
  faInfoCircle, faStar, faClock
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext'; 
import { ServiceService } from '../../services/ServiceService';
import '../../styles/freelancerHome.css';

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

const FreelancerHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalServices: 0,
    totalEarnings: 0,
    averageRating: 0
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log(user)
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
        
        console.log(user.id)
        const servicesData = await ServiceService.getFreelancerServices(Number(user.id));
        setServices(servicesData);

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
        setError(err instanceof Error ? err.message : 'Failed to load services');
        console.error('Service fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
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
        // Update stats after deletion
        setStats(prev => ({
          ...prev,
          totalServices: prev.totalServices - 1
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete service');
      }
    }
  };

  

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
        {/* Services Dashboard */}
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

        {/* Other Sections (simplified for brevity) */}
        <section className="section appointments">
          <h2>
            <FontAwesomeIcon icon={faCalendar} /> Recent Activity
          </h2>
          <div className="coming-soon">
            <p>Activity feed coming soon!</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2025 AutonoMeet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FreelancerHome;