from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from app import db

class FreelancerProfile(db.Model):
    __tablename__ = 'freelancer_profiles'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True)
    headline = Column(String(255))
    description = Column(Text)
    is_available = Column(Boolean, default=True)

    services = db.relationship('Service', backref='freelancer')
    reviews = db.relationship('Review', backref='freelancer')

    def __repr__(self):
        return f"<FreelancerProfile(id={self.id}, user_id={self.user_id})>"