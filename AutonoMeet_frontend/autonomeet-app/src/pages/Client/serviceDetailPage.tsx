import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faStar, faClock, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Calendar from 'react-calendar';
import Modal from 'react-modal';
import { ServiceService } from '../../services/ServiceService';
import { AppointmentService } from '../../services/AppointmentService';
import 'react-calendar/dist/Calendar.css';
import '../../styles/servicesPage.css';
import { useAuth } from '../../context/AuthContext';

Modal.setAppElement('#root');

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
  duration: number;
}

interface Appointment {
  id: number;
  service_id: number;
  scheduled_at: string;
  service: {
    duration: number;
  };
}

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const [service, setService] = useState<Service | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!serviceId) throw new Error('Service ID is missing');
        const serviceData = await ServiceService.getServiceById(Number(serviceId));
        setService(serviceData);
        const appointmentData = await AppointmentService.getAppointmentsByFreelancer(serviceData.user_id);
        setAppointments(appointmentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [serviceId]);

  const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const getAvailableTimeSlots = (date: Date | null): string[] => {
    if (!date || !service) return [];

    const slots: string[] = [];
    const startHour = 8;
    const endHour = 14;
    const slotInterval = Math.min(service.duration, 15);

    for (let hour = startHour; hour <= endHour; hour++) {
      const maxMinute = hour === endHour ? 0 : 60;
      for (let minute = 0; minute < maxMinute; minute += slotInterval) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);
        const slotEndTime = new Date(slotTime);
        slotEndTime.setMinutes(slotTime.getMinutes() + service.duration);

        if (slotEndTime.getHours() > endHour || (slotEndTime.getHours() === endHour && slotEndTime.getMinutes() > 0)) {
          continue;
        }

        const isFree = appointments.every((appointment) => {
          const apptStart = new Date(appointment.scheduled_at);
          const apptEnd = new Date(apptStart);
          apptEnd.setMinutes(apptStart.getMinutes() + appointment.service.duration);

          return slotTime >= apptEnd || slotEndTime <= apptStart;
        });

        if (isFree) {
          const timeString = slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          slots.push(timeString);
        }
      }
    }

    return slots;
  };

  const handleBookNow = () => {
    setIsModalOpen(true);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const confirmBooking = async () => {
    if (!service || !selectedDate || !selectedTime) {
      setBookingMessage('Please select a date and time.');
      return;
    }

    if (!user) {
      setBookingMessage('You must be logged in to book a service.');
      return;
    }

    const [time, period] = selectedTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);
    
    // Format datetime manually to preserve exact local time
    const year = scheduledAt.getFullYear();
    const month = String(scheduledAt.getMonth() + 1).padStart(2, '0');
    const day = String(scheduledAt.getDate()).padStart(2, '0');
    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = '00';
    const scheduledAtString = `${year}-${month}-${day}T${hoursStr}:${minutesStr}:${secondsStr}`;

    try {
      const appointmentData = {
        client_id: user.id, 
        service_id: service.id,
        scheduled_at: scheduledAtString,
      };

      const response = await AppointmentService.createAppointment(appointmentData);
      setBookingMessage('Appointment booked successfully!');
      
      const updatedAppointments = await AppointmentService.getAppointmentsByFreelancer(service.user_id);
      setAppointments(updatedAppointments);
      
      setIsModalOpen(false);
      setSelectedDate(null);
      setSelectedTime(null);
      setTimeout(() => navigate('/user'), 2000);
    } catch (err: any) {
      setBookingMessage(err.response?.data?.message || err.message || 'Failed to book appointment');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  if (loading) return <div className="loading">Loading service details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!service) return <div className="error">Service not found</div>;

  const availableSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : [];

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
          <span className="service-duration">
            <FontAwesomeIcon icon={faClock} /> {formatDuration(service.duration)}
          </span>
          {service.average_rating && (
            <span className="service-rating">
              <FontAwesomeIcon icon={faStar} /> {service.average_rating.toFixed(1)}
            </span>
          )}
        </div>
        <button className="book-btn" onClick={handleBookNow}>
          Book Now
        </button>
        {bookingMessage && <div className="booking-message">{bookingMessage}</div>}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '600px',
            width: '90%',
            padding: '20px',
          },
        }}
      >
        <h2>Select a Date and Time</h2>
        <div style={{ marginBottom: '20px' }}>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            minDate={new Date()}
            tileDisabled={({ date }) => {
              const today = new Date();
              return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            }}
          />
        </div>
        {selectedDate && (
          <div>
            <h3>Available MTV Times on {selectedDate.toLocaleDateString()}</h3>
            {availableSlots.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: selectedTime === time ? '#007bff' : '#f8f9fa',
                      color: selectedTime === time ? '#fff' : '#000',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <p>No available time slots for this date.</p>
            )}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={closeModal}
            style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            Cancel
          </button>
          <button
            onClick={confirmBooking}
            disabled={!selectedTime}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedTime ? '#007bff' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedTime ? 'pointer' : 'not-allowed',
            }}
          >
            Confirm Booking
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceDetailPage;