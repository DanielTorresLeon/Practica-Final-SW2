import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login'; 
import NotFound from '../pages/NotFound';
import React from 'react';
import UserMain from '../pages/Client/clientMainPage'

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserMain />} />
        {/*<Route path="/" element={<Login />} />*/}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;

