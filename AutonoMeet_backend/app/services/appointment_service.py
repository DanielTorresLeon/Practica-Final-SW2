from app.models.appointment import Appointment
from app.models.user import User
from app.models.service import Service
from app import db
from datetime import datetime
from sqlalchemy.orm import joinedload

class AppointmentService:
    @staticmethod
    def create_appointment(data):
        try:
            client_id = data.get('client_id')
            service_id = data.get('service_id')
            scheduled_at = data.get('scheduled_at')

            if not all([client_id, service_id, scheduled_at]):
                return None, "Missing required fields", 400

            try:
                # Parse datetime string without timezone conversion
                scheduled_at = datetime.strptime(scheduled_at, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                return None, "Invalid datetime format for scheduled_at, expected YYYY-MM-DDTHH:mm:ss", 400

            new_appointment = Appointment(
                client_id=client_id,
                service_id=service_id,
                scheduled_at=scheduled_at
            )
            db.session.add(new_appointment)
            db.session.commit()

            return new_appointment, None, 201

        except Exception as e:
            db.session.rollback()
            return None, f"Error creating appointment: {str(e)}", 500

    @staticmethod
    def update_appointment(appointment_id, data):
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return None, "Appointment not found", 404

            if 'client_id' in data:
                appointment.client_id = data['client_id']

            if 'service_id' in data:
                appointment.service_id = data['service_id']

            if 'scheduled_at' in data:
                try:
                    # Parse datetime string without timezone conversion
                    scheduled_at = datetime.strptime(data['scheduled_at'], '%Y-%m-%dT%H:%M:%S')
                    appointment.scheduled_at = scheduled_at
                except ValueError:
                    return None, "Invalid datetime format for scheduled_at, expected YYYY-MM-DDTHH:mm:ss", 400

            db.session.commit()
            return appointment, None, 200

        except Exception as e:
            db.session.rollback()
            return None, f"Error updating appointment: {str(e)}", 500

    @staticmethod
    def get_all_appointments():
        try:
            return Appointment.query.all()
        except Exception as e:
            return None, f"Error retrieving appointments: {str(e)}", 500

    @staticmethod
    def get_appointment_by_id(appointment_id):
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return None, "Appointment not found", 404
            return appointment, None, 200
        except Exception as e:
            return None, f"Error retrieving appointment: {str(e)}", 500

    @staticmethod
    def delete_appointment(appointment_id):
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return "Appointment not found", 404

            db.session.delete(appointment)
            db.session.commit()
            return None, 200

        except Exception as e:
            db.session.rollback()
            return f"Error deleting appointment: {str(e)}", 500

    @staticmethod
    def get_appointments_by_freelancer(freelancer_id):
        try:
            appointments = Appointment.query.join(Appointment.service).filter(
                Service.user_id == freelancer_id
            ).options(joinedload(Appointment.service)).all()
            if not appointments:
                return [], None, 200
            return appointments, None, 200
        except Exception as e:
            return None, f"Error retrieving freelancer appointments: {str(e)}", 500

    @staticmethod
    def get_appointments_by_client(client_id):
        try:
            appointments = Appointment.query.filter_by(client_id=client_id).options(joinedload(Appointment.service)).all()
            if not appointments:
                return [], None, 200
            return appointments, None, 200
        except Exception as e:
            return None, f"Error retrieving client appointments: {str(e)}", 500