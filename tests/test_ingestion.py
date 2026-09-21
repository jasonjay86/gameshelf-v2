import pytest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ingestion import Ingestor

def test_ingestion_schema_mapping():
    ingestor = Ingestor()
    raw_data = {"name": "Test Game", "rating": 5}
    processed = ingestor.process(raw_data)
    assert processed["title"] == "Test Game"
    assert processed["score"] == 5

def test_ingestor_idempotency():
    ingestor = Ingestor()
    data = {"name": "Dup Test", "rating": 1}
    ingestor.ingest(data)
    ingestor.ingest(data)
def test_ingestion_resilience():
    ingestor = Ingestor()
    # Mocking failure scenario
    def faulty_ingest(raw_data):
        raise Exception("Transient Error")

    with pytest.raises(Exception):
        ingestor.ingest({"name": "Fail", "rating": 0})
