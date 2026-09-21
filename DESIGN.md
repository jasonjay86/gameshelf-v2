# GameShelf Architecture Design

## Database Schema (SQLite)

### 1. `games`
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `title`: TEXT NOT NULL
- `release_date`: DATE
- `rawg_id`: INTEGER UNIQUE (for external mapping)
- `metacritic_score`: INTEGER
- `cover_image_url`: TEXT

### 2. `genres`
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `name`: TEXT NOT NULL UNIQUE

### 3. `game_genres` (Junction table)
- `game_id`: INTEGER FOREIGN KEY REFERENCES games(id)
- `genre_id`: INTEGER FOREIGN KEY REFERENCES genres(id)

### 4. `collections`
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `name`: TEXT NOT NULL

### 5. `collection_items`
- `collection_id`: INTEGER FOREIGN KEY REFERENCES collections(id)
- `game_id`: INTEGER FOREIGN KEY REFERENCES games(id)
- `status`: TEXT DEFAULT 'backlog'

## Metadata API
- **Provider**: RAWG Video Games Database API.
- **Reasoning**:
    - **Cost**: Generous free tier (up to 20,000 calls/month).
    - **Coverage**: Massive database including indie games.
    - **Utility**: Provides standard metadata fields (ratings, tags, platforms) essential for a catalog engine.
