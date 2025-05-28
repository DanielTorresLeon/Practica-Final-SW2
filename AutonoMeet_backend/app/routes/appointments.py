from flask_restx import Namespace, Resource, fields
from flask import request, current_app
from app.services.appointment_service import AppointmentService
from ..utils.jwt_utils import jwt_required
from app.services.serv_service import ServiceService
import stripe

api = Namespace('appointments', description='Appointment Operations')

appointment_model = api.model('Appointment', {
    'client_id': fields.Integer(required=True, description='ID of the client (user)'),
    'service_id': fields.Integer(required=True, description='ID of the service'),
    'scheduled_at': fields.DateTime(required=True, description='Scheduled date and time (ISO 8601 format)')
})

appointment_update_model = api.model('AppointmentUpdate', {
    'client_id': fields.Integer(required=False, description='ID of the client (user)'),
    'service_id': fields.Integer(required=False, description='ID of the service'),
    'scheduled_at': fields.DateTime(required=False, description='Scheduled date and time (ISO 8601 format)')
})

checkout_model = api.model('Checkout', {
    'service_id': fields.Integer(required=True, description='ID of the service'),
    'scheduled_at': fields.DateTime(required=True, description='Scheduled date and time (ISO 8601 format)')
})

@api.route('')
class AppointmentList(Resource):
    @jwt_required
    @api.expect(appointment_model)
    def post(self, current_user):  
        """Create a new appointment"""
        data = request.get_json()
        
        if str(current_user.id) != str(data.get('client_id')):
            return {"message": "You can only create appointments for yourself"}, 403
            
        appointment, error, status_code = AppointmentService.create_appointment(data)
        if error:
            return {"message": error}, status_code
        return {
            "message": "Appointment created successfully",
            "appointment": {
                "id": appointment.id,
                "client_id": appointment.client_id,
                "service_id": appointment.service_id,
                "scheduled_at": appointment.scheduled_at.isoformat(),
                "created_at": appointment.created_at.isoformat()
            }
        }, 201

    @jwt_required
    def get(self):
        """Get all appointments"""
        appointments = AppointmentService.get_all_appointments()
        return [{
            "id": appointment.id,
            "client_id": appointment.client_id,
            "service_id": appointment.service_id,
            "scheduled_at": appointment.scheduled_at.isoformat(),
            "created_at": appointment.created_at.isoformat()
        } for appointment in appointments], 200

@api.route('/<int:id>')
class Appointment(Resource):
    @jwt_required
    def get(self, id):
        """Get a specific appointment by ID"""
        appointment, error, status_code = AppointmentService.get_appointment_by_id(id)
        if error:
            return {"message": error}, status_code
        return {
            "id": appointment.id,
            "client_id": appointment.client_id,
            "service_id": appointment.service_id,
            "scheduled_at": appointment.scheduled_at.isoformat(),
            "created_at": appointment.created_at.isoformat()
        }, 200

    @jwt_required
    @api.expect(appointment_update_model)
    def put(self, id):
        """Update an existing appointment"""
        data = request.get_json()
        appointment, error, status_code = AppointmentService.update_appointment(id, data)
        if error:
            return {"message": error}, status_code
        return {
            "message": "Appointment updated successfully",
            "appointment": {
                "id": appointment.id,
                "client_id": appointment.client_id,
                "service_id": appointment.service_id,
                "scheduled_at": appointment.scheduled_at.isoformat(),
                "created_at": appointment.created_at.isoformat()
            }
        }, 200

    @jwt_required
    def delete(self, id, current_user):
        """Delete an appointment"""
        appointment, error, status_code = AppointmentService.get_appointment_by_id(id)
        if error:
            return {"message": error}, status_code
            
        if str(current_user.id) != str(appointment.client_id):
            return {"message": "You can only delete your own appointments"}, 403

        error, status_code = AppointmentService.delete_appointment(id)
        if error:
            return {"message": error}, status_code
        return {"message": "Appointment deleted successfully"}, 200

@api.route('/freelancer/<int:freelancer_id>')
class FreelancerAppointments(Resource):
    @api.doc('get_freelancer_appointments')
    @jwt_required
    def get(self, freelancer_id, current_user):
        """Get all appointments for a freelancer"""
        appointments, error, status_code = AppointmentService.get_appointments_by_freelancer(freelancer_id)
        if error:
            return {'message': error}, status_code
        return [appointment.to_dict() for appointment in appointments], status_code

@api.route('/client/<int:client_id>')
class ClientAppointments(Resource):
    @api.doc('get_client_appointments')
    @jwt_required
    def get(self, client_id, current_user):
        """Get all appointments for a client"""
        if str(current_user.id) != str(client_id):
            return {"message": "You can only view your own appointments"}, 403
        
        appointments, error, status_code = AppointmentService.get_appointments_by_client(client_id)
        if error:
            return {"message": error}, status_code
        return [{
            "id": appointment.id,
            "client_id": appointment.client_id,
            "service_id": appointment.service_id,
            "scheduled_at": appointment.scheduled_at.isoformat(),
            "created_at": appointment.created_at.isoformat()
        } for appointment in appointments], 200

@api.route('/checkout')
class AppointmentCheckout(Resource):
    @jwt_required
    @api.expect(checkout_model)
    def post(self, current_user):
        """Create a Stripe Checkout Session for an appointment"""
        data = request.get_json()
        service_id = data.get('service_id')
        scheduled_at = data.get('scheduled_at')

        try:
            service, error, status_code = ServiceService.get_service_by_id(service_id)
            if error:
                return {"message": error}, status_code

            auth_header = request.headers.get('Authorization')
            token = auth_header.split(" ")[1] if auth_header else None

            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'unit_amount': int(service.price * 100),  
                            'product_data': {
                                'name': service.title,
                            },
                        },
                        'quantity': 1,
                    },
                ],
                mode='payment',
                success_url='https://practica-final-sw2-frontend.onrender.com/success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=f'https://practica-final-sw2-frontend.onrender.com/services/{service_id}?canceled=true&token={token}' if token else f'https://practica-final-sw2-frontend.onrender.com/services/{service_id}?canceled=true',
                metadata={
                    'client_id': current_user.id,
                    'service_id': service_id,
                    'scheduled_at': scheduled_at,
                },
            )
            return {
                'sessionId': checkout_session.id,
                'publishableKey': current_app.config['STRIPE_PUBLISHABLE_KEY']
            }, 200
        except Exception as e:
            return {"message": str(e)}, 400
        
@api.route('/success')
class PaymentSuccess(Resource):
    def get(self):
        """Handle successful payment and create appointment"""
        session_id = request.args.get('session_id')
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == 'paid':
                if not all(key in session.metadata for key in ['client_id', 'service_id', 'scheduled_at']):
                    return {"message": "Missing appointment data in Stripe session"}, 400
                
                appointment_data = {
                    'client_id': int(session.metadata['client_id']),
                    'service_id': int(session.metadata['service_id']),
                    'scheduled_at': session.metadata['scheduled_at'],
                }
                
                appointment, error, status_code = AppointmentService.create_appointment(appointment_data)
                if error:
                    return {"message": error}, status_code
                
                return {
                    "message": "Appointment booked successfully",
                    "appointment": {
                        "id": appointment.id,
                        "client_id": appointment.client_id,
                        "service_id": appointment.service_id,
                        "scheduled_at": appointment.scheduled_at.isoformat(),
                        "created_at": appointment.created_at.isoformat()
                    }
                }, 200
            else:
                return {"message": "Payment not completed"}, 400
        except Exception as e:
            return {"message": str(e)}, 400