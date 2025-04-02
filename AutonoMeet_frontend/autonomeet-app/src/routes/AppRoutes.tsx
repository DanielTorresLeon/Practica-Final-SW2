import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login'; 
import NotFound from '../pages/NotFound';
import React from 'react';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
    
        <Route path="/" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;

