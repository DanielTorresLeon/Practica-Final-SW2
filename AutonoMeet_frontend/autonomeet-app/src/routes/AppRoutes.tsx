import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Registration from '../pages/Registration';
import NotFound from '../pages/NotFound';
import React from 'react';
import UserMain from '../pages/Client/clientMainPage';
import FreelancerMain from '../pages/Freelancer/freelancerMainPage';
import ProtectedRoute from '../components/ProtectedRoute';
import FreelancerServicesNew from '../pages/Freelancer/freelancerServicesNew';
import FreelancerServicesEdit from '../pages/Freelancer/freelancerServicesEdit';
import ServicesPage from '../pages/Client/servicesPage';
import ServiceDetailPage from '../pages/Client/serviceDetailPage';
import SuccessPage from '../pages/Client/SuccessPage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/user" element={<UserMain />} />
          <Route path="/freelancer" element={<FreelancerMain />} />
          <Route path="/freelancer/services/new" element={<FreelancerServicesNew />} />
          <Route path="/freelancer/services/edit/:serviceId" element={<FreelancerServicesEdit />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
          <Route path="/success" element={<SuccessPage />} />
        </Route>
        
        <Route path="/" element={<Login />} />        
        <Route path="/signup" element={<Registration />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
