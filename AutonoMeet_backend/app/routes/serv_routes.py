from flask_restx import Namespace, Resource, fields
from flask import request
from ..services.serv_service import ServiceService, CategoryService
from ..utils.jwt_utils import jwt_required, get_current_user

api = Namespace('services', description='Service operations')

service_model = api.model('Service', {
    'freelancer_id': fields.Integer(required=True, description='Freelancer ID'),
    'category_id': fields.Integer(required=True, description='Category ID'),
    'title': fields.String(required=True, description='Service title'),
    'price': fields.Float(required=True, description='Service price')
})

service_update_model = api.model('ServiceUpdate', {
    'category_id': fields.Integer(required=False, description='Category ID'),
    'title': fields.String(required=False, description='Service title'),
    'price': fields.Float(required=False, description='Service price')
})

category_model = api.model('Category', {
    'name': fields.String(required=True, description='Category name')
})

@api.route('/')
class ServiceList(Resource):
    @api.doc('list_services')
    def get(self):
        """List all services"""
        services, error, status_code = ServiceService.get_all_services()
        if error:
            return {'message': error}, status_code
        return [service.__dict__ for service in services], status_code

    @api.doc('create_service')
    @api.expect(service_model)
    @jwt_required()
    def post(self):
        """Create a new service"""
        current_user = get_current_user()
        if not current_user.is_freelancer:
            return {'message': 'Only freelancers can create services'}, 403

        data = request.get_json()
        data['freelancer_id'] = current_user.id
        service, error, status_code = ServiceService.create_service(**data)
        if error:
            return {'message': error}, status_code
        return service.__dict__, status_code

@api.route('/<int:service_id>')
class ServiceResource(Resource):
    @api.doc('get_service')
    def get(self, service_id):
        """Get a specific service"""
        service, error, status_code = ServiceService.get_service_by_id(service_id)
        if error:
            return {'message': error}, status_code
        return service.__dict__, status_code

    @api.doc('update_service')
    @api.expect(service_update_model)
    @jwt_required()
    def put(self, service_id):
        """Update a service"""
        current_user = get_current_user()
        service, error, status_code = ServiceService.get_service_by_id(service_id)
        if error:
            return {'message': error}, status_code

        if service.freelancer_id != current_user.id:
            return {'message': 'You can only update your own services'}, 403

        data = request.get_json()
        updated_service, error, status_code = ServiceService.update_service(service_id, **data)
        if error:
            return {'message': error}, status_code
        return updated_service.__dict__, status_code

    @api.doc('delete_service')
    @jwt_required()
    def delete(self, service_id):
        """Delete a service"""
        current_user = get_current_user()
        service, error, status_code = ServiceService.get_service_by_id(service_id)
        if error:
            return {'message': error}, status_code

        if service.freelancer_id != current_user.id:
            return {'message': 'You can only delete your own services'}, 403

        result, error, status_code = ServiceService.delete_service(service_id)
        if error:
            return {'message': error}, status_code
        return result, status_code

@api.route('/freelancer/<int:freelancer_id>')
class FreelancerServices(Resource):
    @api.doc('get_freelancer_services')
    def get(self, freelancer_id):
        """Get all services for a freelancer"""
        services, error, status_code = ServiceService.get_services_by_freelancer(freelancer_id)
        if error:
            return {'message': error}, status_code
        return [service.__dict__ for service in services], status_code

@api.route('/category/<int:category_id>')
class CategoryServices(Resource):
    @api.doc('get_category_services')
    def get(self, category_id):
        """Get all services in a category"""
        services, error, status_code = ServiceService.get_services_by_category(category_id)
        if error:
            return {'message': error}, status_code
        return [service.__dict__ for service in services], status_code

@api.route('/categories/')
class CategoryList(Resource):
    @api.doc('list_categories')
    def get(self):
        """List all categories"""
        categories, error, status_code = CategoryService.get_all_categories()
        if error:
            return {'message': error}, status_code
        return [category.__dict__ for category in categories], status_code

    @api.doc('create_category')
    @api.expect(category_model)
    @jwt_required()
    def post(self):
        """Create a new category"""
        current_user = get_current_user()
        if not current_user.is_admin:  # Assuming you have an is_admin field
            return {'message': 'Only admins can create categories'}, 403

        data = request.get_json()
        category, error, status_code = CategoryService.create_category(**data)
        if error:
            return {'message': error}, status_code
        return category.__dict__, status_code

@api.route('/categories/<int:category_id>')
class CategoryResource(Resource):
    @api.doc('get_category')
    def get(self, category_id):
        """Get a specific category"""
        category, error, status_code = CategoryService.get_category_by_id(category_id)
        if error:
            return {'message': error}, status_code
        return category.__dict__, status_code

    @api.doc('update_category')
    @api.expect(category_model)
    @jwt_required()
    def put(self, category_id):
        """Update a category"""
        current_user = get_current_user()
        if not current_user.is_admin:
            return {'message': 'Only admins can update categories'}, 403

        data = request.get_json()
        updated_category, error, status_code = CategoryService.update_category(category_id, **data)
        if error:
            return {'message': error}, status_code
        return updated_category.__dict__, status_code

    @api.doc('delete_category')
    @jwt_required()
    def delete(self, category_id):
        """Delete a category"""
        current_user = get_current_user()
        if not current_user.is_admin:
            return {'message': 'Only admins can delete categories'}, 403

        result, error, status_code = CategoryService.delete_category(category_id)
        if error:
            return {'message': error}, status_code
        return result, status_code