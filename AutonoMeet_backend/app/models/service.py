from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app import db

class Service(db.Model):
    __tablename__ = 'services'

    id = Column(Integer, primary_key=True, autoincrement=True)
    freelancer_id = Column(Integer, ForeignKey('freelancer_profiles.id'))
    category_id = Column(Integer, ForeignKey('categories.id'))
    title = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)

    appointments = db.relationship('Appointment', backref='service')
    category = db.relationship('Category', backref='services')

    def __repr__(self):
        return f"<Service(id={self.id}, title={self.title})>"