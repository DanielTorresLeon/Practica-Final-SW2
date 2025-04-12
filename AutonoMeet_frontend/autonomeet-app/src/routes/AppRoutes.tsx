import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login'; 
import Registration from '../pages/Registration';
import NotFound from '../pages/NotFound';
import React from 'react';
import UserMain from '../pages/Client/clientMainPage'
import FreelancerMain from '../pages/Freelancer/freelancerMainPage'


const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/user" element={<UserMain />} />
        <Route path="/freelancer" element={<FreelancerMain />} />
        <Route path="/" element={<Login />} />        
        <Route path="/signup" element={<Registration/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;

