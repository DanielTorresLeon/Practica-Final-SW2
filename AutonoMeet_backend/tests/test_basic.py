import pytest
from app import create_app  

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    client = app.test_client()
    return client

def test_home_route(client):
    response = client.get('/')
    assert response.status_code == 200

