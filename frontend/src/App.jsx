import React from 'react';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import CatalogPage from './pages/CatalogPage';

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-4">
          <CatalogPage />
        </main>
      </div>
    </div>
  );
}

export default App;
