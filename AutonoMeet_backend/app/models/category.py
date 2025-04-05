from sqlalchemy import Column, Integer, String
from app import db

class Category(db.Model):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)

    def __repr__(self):
        return f"<Category(id={self.id}, name={self.name})>"