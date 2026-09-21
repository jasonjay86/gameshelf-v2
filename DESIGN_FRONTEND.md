# GameShelf Frontend Interface Design

## 1. Wireframe Concepts
- **Home View (Catalog):**
  - Search Bar (header)
  - Grid view of game cards.
  - Sidebar for filtering (by genre, status, metacritic score).
- **Game Detail View:**
  - Hero section with title, cover image, and metadata.
  - "Add to collection" button with status dropdown (backlog, playing, completed).
- **Navigation:**
  - Sidebar menu: Library, Collections, Backlog, Browse.

## 2. Component Structure (React)
- `App.jsx`: Main routing setup.
- `components/Layout/`: Navbar, Sidebar, Footer.
- `components/UI/`: Button, Card, Input.
- `components/Game/`: GameCard, GameGrid, GameDetail.
- `pages/`: CatalogPage, GamePage, CollectionPage.
