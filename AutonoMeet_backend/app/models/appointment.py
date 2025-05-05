from sqlalchemy import Column, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app import db

class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey('users.id'))
    service_id = Column(Integer, ForeignKey('services.id'))
    scheduled_at = Column(TIMESTAMP, nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())

    def __repr__(self):
        return f"<Appointment(id={self.id}, client_id={self.client_id})>"