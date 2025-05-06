from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.models.category import Category
from app import db

class Service(db.Model):
    __tablename__ = 'services'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    category_id = Column(Integer, ForeignKey('categories.id'))
    title = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    duration = Column(Integer, nullable=False)
    description = Column(String(500))

    category = relationship('Category', backref='services')
    user = relationship('User', backref='services')

    def __repr__(self):
        return f"<Service(id={self.id}, title={self.title})>"

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user': {
                'id': self.user.id,
                'email': self.user.email
            } if self.user else None,
            'category_id': self.category_id,
            'category': {
                'name': self.category.name
            } if self.category else None,
            'title': self.title,
            'price': self.price,
            'duration': self.duration,
            'description': self.description
        }