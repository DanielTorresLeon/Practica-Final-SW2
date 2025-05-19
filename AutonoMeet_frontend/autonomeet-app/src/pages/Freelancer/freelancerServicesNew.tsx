import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { ServiceService } from '../../services/ServiceService';
import '../../styles/serviceForm.css';

const FreelancerServicesNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category_id: '',
    duration: '',
  });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await ServiceService.getCategories();
        setCategories(categoriesData);
        setIsLoadingCategories(false);
      } catch (err) {
        setError(err.message || 'Failed to load categories. Please try again.');
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id || !user.is_freelancer) {
      setError('Only freelancers can create services');
      return;
    }

    if (!formData.title || !formData.price || !formData.category_id || !formData.duration) {
      setError('Title, price, category, and duration are required');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0.50) {
      setError('Price must be at least $0.50');
      return;
    }

    const duration = parseInt(formData.duration);
    if (isNaN(duration) || duration <= 0) {
      setError('Duration must be a positive number');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const serviceData = {
        title: formData.title,
        price: price,
        description: formData.description || undefined,
        category_id: parseInt(formData.category_id),
        user_id: parseInt(user.id),
        duration: duration,
      };

      await ServiceService.createService(serviceData);
      navigate('/freelancer', {
        state: { message: 'Service created successfully!' },
      });
    } catch (err) {
      setError(err.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/freelancer');
  };

  return (
    <div className="service-form-container">
      <header className="form-header">
        <button className="back-btn" onClick={handleCancel}>
          <FontAwesomeIcon icon={faArrowLeft} /> Cancel
        </button>
        <h1>Create New Service</h1>
      </header>

      <form onSubmit={handleSubmit} className="service-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Service Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Logo Design, Web Development"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (USD)*</label>
          <div className="price-input-container">
            <span className="currency-symbol">$</span>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.50"
              min="0.50"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration (minutes)*</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g., 30"
            min="1"
            step="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category_id">Category*</label>
          {isLoadingCategories ? (
            <div>Loading categories...</div>
          ) : (
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your service in detail..."
            rows={5}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={handleCancel} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading || isLoadingCategories}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Creating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} /> Create Service
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FreelancerServicesNew;