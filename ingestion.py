import logging

class Ingestor:
    def __init__(self):
        self.games = {}
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("Ingestor")

    def process(self, raw_data):
        return {"title": raw_data["name"], "score": raw_data["rating"]}

    def ingest(self, raw_data):
        if raw_data.get("name") == "Fail":
            raise Exception("Transient Error")
        processed = self.process(raw_data)
        if processed["title"] not in self.games:
            self.games[processed["title"]] = processed
            self.logger.info(f"Ingested {processed['title']}")

    def get_all_games(self):
        return list(self.games.values())
