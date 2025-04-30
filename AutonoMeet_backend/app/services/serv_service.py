from app.models.service import Service, Category
from app import db
from sqlalchemy.exc import SQLAlchemyError

class ServiceService:
    @staticmethod
    def get_all_services():
        try:
            services = Service.query.all()
            return services, None, 200
        except Exception as e:
            return None, f"Error retrieving services: {str(e)}", 500
    @staticmethod
    def create_service(freelancer_id, category_id, title, price):
        try:
            if not all([freelancer_id, category_id, title, price]):
                return None, "Missing required fields", 400

            if price <= 0:
                return None, "Price must be greater than 0", 400

            new_service = Service(
                freelancer_id=freelancer_id,
                category_id=category_id,
                title=title,
                price=price
            )
            
            db.session.add(new_service)
            db.session.commit()
            
            return new_service, None, 201

        except SQLAlchemyError as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}", 500
        except Exception as e:
            return None, f"Unexpected error: {str(e)}", 500

    @staticmethod
    def get_service_by_id(service_id):
        try:
            service = Service.query.get(service_id)
            if not service:
                return None, "Service not found", 404
                
            return service, None, 200
        except Exception as e:
            return None, f"Error retrieving service: {str(e)}", 500

    @staticmethod
    def update_service(service_id, **kwargs):
        try:
            service = Service.query.get(service_id)
            if not service:
                return None, "Service not found", 404

            if 'price' in kwargs and kwargs['price'] <= 0:
                return None, "Price must be greater than 0", 400

            for key, value in kwargs.items():
                if hasattr(service, key):
                    setattr(service, key, value)

            db.session.commit()
            return service, None, 200

        except SQLAlchemyError as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}", 500
        except Exception as e:
            return None, f"Unexpected error: {str(e)}", 500

    @staticmethod
    def delete_service(service_id):
        try:
            service = Service.query.get(service_id)
            if not service:
                return None, "Service not found", 404

            db.session.delete(service)
            db.session.commit()
            return {"message": "Service deleted successfully"}, None, 200

        except SQLAlchemyError as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}", 500
        except Exception as e:
            return None, f"Unexpected error: {str(e)}", 500

    @staticmethod
    def get_services_by_freelancer(freelancer_id):
        try:
            services = Service.query.filter_by(freelancer_id=freelancer_id).all()
            return services, None, 200
        except Exception as e:
            return None, f"Error retrieving services: {str(e)}", 500

    @staticmethod
    def get_services_by_category(category_id):
        try:
            services = Service.query.filter_by(category_id=category_id).all()
            return services, None, 200
        except Exception as e:
            return None, f"Error retrieving services: {str(e)}", 500


class CategoryService:
    @staticmethod
    def create_category(name):
        try:
            if not name:
                return None, "Category name is required", 400

            existing_category = Category.query.filter_by(name=name).first()
            if existing_category:
                return None, "Category already exists", 409

            new_category = Category(name=name)
            db.session.add(new_category)
            db.session.commit()
            
            return new_category, None, 201

        except SQLAlchemyError as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}", 500
        except Exception as e:
            return None, f"Unexpected error: {str(e)}", 500

    @staticmethod
    def get_all_categories():
        try:
            categories = Category.query.all()
            return categories, None, 200
        except Exception as e:
            return None, f"Error retrieving categories: {str(e)}", 500

    @staticmethod
    def get_category_by_id(category_id):
        try:
            category = Category.query.get(category_id)
            if not category:
                return None, "Category not found", 404
                
            return category, None, 200
        except Exception as e:
            return None, f"Error retrieving category: {str(e)}", 500

    @staticmethod
    def update_category(category_id, new_name):
        try:
            category = Category.query.get(category_id)
            if not category:
                return None, "Category not found", 404

            if not new_name:
                return None, "New category name is required", 400

            existing_category = Category.query.filter_by(name=new_name).first()
            if existing_category and existing_category.id != category_id:
                return None, "Category name already exists", 409

            category.name = new_name
            db.session.commit()
            
            return category, None, 200

        except SQLAlchemyError as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}", 500
        except Exception as e:
            return None, f"Unexpected error: {str(e)}", 500

    @staticmethod
    def delete_category(category_id):
        try:
            category = Category.query.get(category_id)
            if not category:
                return None, "Category not found", 404

            # Check if any services are using this category
            if category.services:
                return None, "Cannot delete category with associated services", 400

            db.session.delete(category)
            db.session.commit()
            
            return {"message": "Category deleted successfully"}, None, 200

        except SQLAlchemyError as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}", 500
        except Exception as e:
            return None, f"Unexpected error: {str(e)}", 500