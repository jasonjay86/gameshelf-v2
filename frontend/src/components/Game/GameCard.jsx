import React from 'react';

const GameCard = ({ game }) => (
  <div className="border rounded p-4 shadow-sm hover:shadow-md transition">
    <h3 className="font-bold text-lg">{game.title}</h3>
    <p className="text-gray-600">Platform: {game.platform}</p>
    <p className="text-sm text-blue-500">Status: {game.status}</p>
  </div>
);

export default GameCard;
