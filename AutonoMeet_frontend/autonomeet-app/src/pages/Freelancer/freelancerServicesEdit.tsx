import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { ServiceService } from '../../services/ServiceService';
import '../../styles/serviceForm.css';

const FreelancerServicesEdit: React.FC = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category_id: '',
  });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingService, setIsLoadingService] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const id = parseInt(serviceId || '0');
        if (!serviceId || isNaN(id) || id <= 0) {
          setError('Invalid service ID. Please select a valid service.');
          setIsLoadingService(false);
          return;
        }

        const serviceData = await ServiceService.getServiceById(id);
        setFormData({
          title: serviceData.title,
          price: serviceData.price.toString(),
          description: serviceData.description || '',
          category_id: serviceData.category_id.toString(),
        });
        setIsLoadingService(false);

        const categoriesData = await ServiceService.getCategories();
        setCategories(categoriesData);
        setIsLoadingCategories(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load data. Please try again.');
        setIsLoadingService(false);
        setIsLoadingCategories(false);
      }
    };

    loadData();
  }, [serviceId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !user.is_freelancer) {
      setError('Only freelancers can edit services');
      return;
    }

    if (!formData.title || !formData.price || !formData.category_id) {
      setError('Title, price, and category are required');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError('Price must be a positive number');
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
      };

      await ServiceService.updateService(parseInt(serviceId!), serviceData);
      navigate('/freelancer', {
        state: { message: 'Service updated successfully!' },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/freelancer');
  };

  if (isLoadingService && !error) {
    return <div>Loading service...</div>;
  }

  return (
    <div className="service-form-container">
      <header className="form-header">
        <button className="back-btn" onClick={handleCancel}>
          <FontAwesomeIcon icon={faArrowLeft} /> Cancel
        </button>
        <h1>Edit Service</h1>
      </header>

      <form onSubmit={handleSubmit} className="service-form">
        {error && <div className="error-message">{error}</div>}

        {!error && (
          <>
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
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
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
                disabled={loading || isLoadingCategories || isLoadingService}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Updating...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} /> Update Service
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default FreelancerServicesEdit;