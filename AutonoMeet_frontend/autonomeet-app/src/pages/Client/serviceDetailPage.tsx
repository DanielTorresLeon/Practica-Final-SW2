import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faStar, faClock, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ServiceService } from '../../services/ServiceService';
import '../../styles/servicesPage.css';

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
  user?: {
    id: number;
    email: string;
  };
  average_rating?: number;
  duration_minutes?: number;
}

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        if (!serviceId) throw new Error('Service ID is missing');
        const serviceData = await ServiceService.getServiceById(Number(serviceId));
        setService(serviceData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service details');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  if (loading) return <div className="loading">Loading service details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!service) return <div className="error">Service not found</div>;

  return (
    <div className="services-page service-detail-page">
      <div className="services-header">
        <h1>{service.title}</h1>
        <button className="back-btn" onClick={() => navigate('/services')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Services
        </button>
      </div>
      <div className="service-detail-card">
        <div className="service-detail-header">
          <h2>{service.title}</h2>
          <div className="service-price">
            <FontAwesomeIcon icon={faDollarSign} /> {service.price.toFixed(2)}
          </div>
        </div>
        <div className="service-freelancer">
          <span>By: {service.user?.email || 'Unknown Freelancer'}</span>
        </div>
        {service.description && (
          <p className="service-description">{service.description}</p>
        )}
        <div className="service-meta">
          {service.category && <span className="service-category">{service.category.name}</span>}
          {service.duration_minutes && (
            <span className="service-duration">
              <FontAwesomeIcon icon={faClock} /> {service.duration_minutes} mins
            </span>
          )}
          {service.average_rating && (
            <span className="service-rating">
              <FontAwesomeIcon icon={faStar} /> {service.average_rating.toFixed(1)}
            </span>
          )}
        </div>
        <button className="book-btn" onClick={() => navigate('/booking')}>
          Book Now
        </button>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
