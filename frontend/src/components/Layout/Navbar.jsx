import React from 'react';

const Navbar = () => (
  <nav className="bg-gray-800 p-4 text-white">
    <div className="container mx-auto flex justify-between">
      <h1 className="text-xl font-bold">GameShelf</h1>
      <input type="text" placeholder="Search games..." className="p-2 rounded text-black" />
    </div>
  </nav>
);

export default Navbar;
