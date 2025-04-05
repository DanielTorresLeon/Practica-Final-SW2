from sqlalchemy import Column, Integer, Text, SmallInteger, ForeignKey
from app import db

class Review(db.Model):
    __tablename__ = 'reviews'

    id = Column(Integer, primary_key=True, autoincrement=True)
    author_id = Column(Integer, ForeignKey('users.id'))
    freelancer_id = Column(Integer, ForeignKey('freelancer_profiles.id'))
    rating = Column(SmallInteger, nullable=False)
    comment = Column(Text)

    def __repr__(self):
        return f"<Review(id={self.id}, rating={self.rating})>"