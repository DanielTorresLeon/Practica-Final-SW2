import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faSearch, faUser, faSignOutAlt, faBriefcase, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext'; 
import '../../styles/freelancerHome.css';

const FreelancerHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const upcomingAppointments = [
    { id: 1, client: 'Sarah Johnson', service: 'Haircut', date: '2025-04-15', time: '10:00 AM' },
    { id: 2, client: 'Michael Lee', service: 'Beard Trim', date: '2025-04-16', time: '2:00 PM' },
  ];

  const pendingRequests = [
    { id: 3, client: 'Emma Wilson', service: 'Hair Coloring', date: '2025-04-17', time: '3:00 PM' },
  ];

  const earnings = [
    { month: 'March 2025', amount: 1250, completedJobs: 12 },
    { month: 'February 2025', amount: 980, completedJobs: 9 },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching clients:', searchQuery);
    navigate(`/freelancer/clients?query=${searchQuery}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAcceptRequest = (id) => {
    console.log('Accepted request:', id);
    // Add your logic here
  };

  const handleDeclineRequest = (id) => {
    console.log('Declined request:', id);
    // Add your logic here
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
                  <button className="action-btn">Details</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming appointments scheduled.</p>
          )}
        </section>

        <section className="section requests">
          <h2>
            <FontAwesomeIcon icon={faBriefcase} /> Pending Requests
          </h2>
          {pendingRequests.length > 0 ? (
            <ul className="request-list">
              {pendingRequests.map((request) => (
                <li key={request.id} className="request-item">
                  <div>
                    <strong>{request.service}</strong> from {request.client}
                  </div>
                  <div>
                    {request.date} at {request.time}
                  </div>
                  <div className="request-actions">
                    <button className="accept-btn" onClick={() => handleAcceptRequest(request.id)}>
                      Accept
                    </button>
                    <button className="decline-btn" onClick={() => handleDeclineRequest(request.id)}>
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending service requests.</p>
          )}
        </section>

        <section className="section earnings">
          <h2>
            <FontAwesomeIcon icon={faDollarSign} /> Earnings Overview
          </h2>
          <div className="earnings-stats">
            <div className="stat-card">
              <h3>This Month</h3>
              <p className="amount">$1,250</p>
              <p className="meta">12 jobs completed</p>
            </div>
            <div className="stat-card">
              <h3>Last Month</h3>
              <p className="amount">$980</p>
              <p className="meta">9 jobs completed</p>
            </div>
          </div>
          <button className="cta-btn" onClick={() => navigate('/freelancer/earnings')}>
            View Full Earnings Report
          </button>
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

        <section className="section profile">
          <h2>
            <FontAwesomeIcon icon={faUser} /> Your Profile
          </h2>
          <div className="profile-info">
            <p><strong>Email:</strong> {user?.email || 'email@example.com'}</p>
            <p><strong>Services Offered:</strong> Hair Styling, Coloring, Beard Trimming</p>
            <p><strong>Rating:</strong> 4.8 ★ (24 reviews)</p>
          </div>
          <button className="action-btn" onClick={() => navigate('/freelancer/profile/edit')}>
            Edit Profile
          </button>
          <button className="cta-btn" onClick={() => navigate('/freelancer/services')}>
            Manage Services
          </button>
        </section>
      </main>

      <footer className="footer">
        <p>© 2025 AutonoMeet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FreelancerHome;