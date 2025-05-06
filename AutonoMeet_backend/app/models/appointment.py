from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app import db
from datetime import datetime

class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    service_id = Column(Integer, ForeignKey('services.id'), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    service = relationship('Service')

    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'service_id': self.service_id,
            'scheduled_at': self.scheduled_at.isoformat(),
            'created_at': self.created_at.isoformat(),
            'service': {
                'duration': self.service.duration
            }
        }