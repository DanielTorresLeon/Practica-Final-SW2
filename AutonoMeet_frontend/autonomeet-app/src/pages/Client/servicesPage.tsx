import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faDollarSign, faStar, faClock, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
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

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, categoriesData] = await Promise.all([
          ServiceService.getAllServices(),
          ServiceService.getCategories(),
        ]);
        setServices(servicesData);
        setFilteredServices(servicesData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...services];
    if (searchQuery) {
      result = result.filter(
        (service) =>
          service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (selectedCategory) {
      result = result.filter((service) => service.category_id === selectedCategory);
    }
    result = result.filter(
      (service) => service.price >= priceRange[0] && service.price <= priceRange[1]
    );
    setFilteredServices(result);
  }, [searchQuery, selectedCategory, priceRange, services]);

  const handleServiceClick = (serviceId: number) => {
    navigate(`/services/${serviceId}`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setPriceRange([0, 1000]);
    setFilteredServices(services);
  };

  if (loading) return <div className="loading">Loading services...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="services-page">
      <div className="services-header">
        <div className="services-header-left">
          <button className="back-btn" onClick={() => navigate('/user')}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
          </button>
          <h1>Explore Services</h1>
        </div>
        <div className="search-bar">
          <div className="search-input-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <FontAwesomeIcon icon={faFilter} /> Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <h3>Categories</h3>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <h3>Price Range</h3>
            <div className="price-range">
              <span>${priceRange[0]}</span>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              />
              <span>${priceRange[1]}</span>
            </div>
          </div>

          <button className="reset-filters" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      )}

      <div className="services-grid">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div key={service.id} className="service-card" onClick={() => handleServiceClick(service.id)}>
              <div className="service-header">
                <h3>{service.title}</h3>
                <div className="service-price">
                  <FontAwesomeIcon icon={faDollarSign} /> {service.price.toFixed(2)}
                </div>
              </div>
              <div className="service-freelancer">
                <span>By: {service.user?.email || 'Unknown Freelancer'}</span>
              </div>
              {service.description && (
                <p className="service-description">
                  {service.description.length > 100
                    ? `${service.description.substring(0, 100)}...`
                    : service.description}
                </p>
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
            </div>
          ))
        ) : (
          <div className="no-results">
            <h3>No services found matching your criteria</h3>
            <button onClick={resetFilters}>Reset filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
