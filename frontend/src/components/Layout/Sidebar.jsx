import React from 'react';

const Sidebar = () => (
  <aside className="w-64 bg-gray-100 p-4 h-screen">
    <nav className="space-y-4">
      <a href="/" className="block">Library</a>
      <a href="/collections" className="block">Collections</a>
      <a href="/backlog" className="block">Backlog</a>
      <a href="/browse" className="block">Browse</a>
    </nav>
  </aside>
);

export default Sidebar;
