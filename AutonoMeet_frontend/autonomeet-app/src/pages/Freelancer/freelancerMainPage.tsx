import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faSearch, faUser, faSignOutAlt, faBriefcase, faDollarSign, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext'; 
import '../../styles/freelancerHome.css';

interface Service {
  id: number;
  title: string;
  price: number;
  category_id: number;
  category?: {
    name: string;
  };
}

const FreelancerHome = () => {
  const navigate = useNavigate();
  const { user, logout, getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`/api/v0/services/freelancer/${user?.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        setServices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchServices();
    }
  }, [user?.id, getToken]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching clients:', searchQuery);
    navigate(`/freelancer/clients?query=${searchQuery}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteService = async (serviceId: number) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/v0/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete service');
      }
      
      setServices(services.filter(service => service.id !== serviceId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Mock data for other sections (appointments, earnings, etc.)
  const upcomingAppointments = [
    { id: 1, client: 'Sarah Johnson', service: 'Haircut', date: '2025-04-15', time: '10:00 AM' },
  ];

  const earnings = [
    { month: 'March 2025', amount: 1250, completedJobs: 12 },
  ];

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
        {/* Services Section - Now with real data */}
        <section className="section services">
          <h2>
            <FontAwesomeIcon icon={faBriefcase} /> Your Services
            <button 
              className="add-service-btn"
              onClick={() => navigate('/freelancer/services/new')}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Service
            </button>
          </h2>
          
          {loading ? (
            <p>Loading services...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : services.length > 0 ? (
            <ul className="service-list">
              {services.map((service) => (
                <li key={service.id} className="service-item">
                  <div className="service-info">
                    <h3>{service.title}</h3>
                    <p>${service.price.toFixed(2)}</p>
                    {service.category && <span className="category-tag">{service.category.name}</span>}
                  </div>
                  <div className="service-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => navigate(`/freelancer/services/edit/${service.id}`)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
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

        {/* Other sections remain similar but shortened for brevity */}
        <section className="section appointments">
          <h2>
            <FontAwesomeIcon icon={faCalendar} /> Upcoming Appointments
          </h2>
          {upcomingAppointments.length > 0 ? (
            <ul className="appointment-list">
              {upcomingAppointments.map((appointment) => (
                <li key={appointment.id} className="appointment-item">
                  <div>
                    <strong>{appointment.service}</strong> for {appointment.client}
                  </div>
                  <div>
                    {appointment.date} at {appointment.time}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming appointments scheduled.</p>
          )}
        </section>

        <section className="section earnings">
          <h2>
            <FontAwesomeIcon icon={faDollarSign} /> Earnings Overview
          </h2>
          <div className="earnings-stats">
            {earnings.map((earning, index) => (
              <div key={index} className="stat-card">
                <h3>{earning.month}</h3>
                <p className="amount">${earning.amount.toFixed(2)}</p>
                <p className="meta">{earning.completedJobs} jobs completed</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section search">
          <h2>
            <FontAwesomeIcon icon={faSearch} /> Search Clients
          </h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search client history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>
        </section>
      </main>

      <footer className="footer">
        <p>© 2025 AutonoMeet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FreelancerHome;