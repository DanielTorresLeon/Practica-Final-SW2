import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faSearch, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext'; 
import '../../styles/clientHome.css';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const appointments = [
    { id: 1, freelancer: 'John Smith', service: 'Haircut', date: '2025-04-15', time: '10:00 AM' },
    { id: 2, freelancer: 'Anna Brown', service: 'Math Tutoring', date: '2025-04-16', time: '2:00 PM' },
  ];

  const categories = ['All', 'Hair Salon', 'Plumbing', 'Tutoring', 'Cleaning'];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching:', searchQuery, 'Category:', selectedCategory);
    navigate(`/services?query=${searchQuery}&category=${selectedCategory}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

        <section className="section search">
          <h2>
            <FontAwesomeIcon icon={faSearch} /> Search Services
          </h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for a service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>
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