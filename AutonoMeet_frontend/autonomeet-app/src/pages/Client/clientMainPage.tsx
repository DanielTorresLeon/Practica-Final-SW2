
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faSearch, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { ServiceService } from '../../services/ServiceService';
import '../../styles/clientHome.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const appointments = [
    { id: 1, freelancer: 'John Smith', service: 'Haircut', date: '2025-04-15', time: '10:00 AM' },
    { id: 2, freelancer: 'Anna Brown', service: 'Math Tutoring', date: '2025-04-16', time: '2:00 PM' },
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await ServiceService.getCategories();
        setCategories(categoriesData.map(cat => cat.name));
      } catch (err: any) {
        console.error('Error loading categories:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleViewServices = () => {
    navigate('/services');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
          {appointments.length > 0 ? (
            <ul className="appointment-list">
              {appointments.map((appointment) => (
                <li key={appointment.id} className="appointment-item">
                  <div>
                    <strong>{appointment.service}</strong> with {appointment.freelancer}
                  </div>
                  <div>
                    {appointment.date} at {appointment.time}
                  </div>
                  <button className="action-btn">Cancel</button>
                </li>
              ))}
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