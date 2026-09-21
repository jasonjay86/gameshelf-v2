import React, { useState, useEffect, useRef } from 'react';
import GameCard from '../components/Game/GameCard';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Stable per-browser device id — survives reloads, distinguishes laptops/phones.
function getDeviceId() {
  let id = localStorage.getItem('gs_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem('gs_device_id', id);
  }
  return id;
}

const CatalogPage = () => {
  const [games, setGames] = useState([]);
  const [newGame, setNewGame] = useState({ title: '', platform: '', status: 'Unplayed' });
  const [error, setError] = useState(null);
  const deviceIdRef = useRef(getDeviceId());

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/games`);
      const json = await res.json();
      setGames(json.data || []);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAddGame = async () => {
    if (!newGame.title.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newGame, device_id: deviceIdRef.current })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'POST failed');
      setGames(g => [...g, { ...newGame, id: json.id, updated_at: json.updated_at, device_id: deviceIdRef.current }]);
      setNewGame({ title: '', platform: '', status: 'Unplayed' });
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/games/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('DELETE failed');
      setGames(g => g.filter(x => x.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-2 text-xs text-gray-500">
        Device: <code>{deviceIdRef.current}</code>
        {' · '}
        API: <code>{API_BASE || 'same-origin'}</code>
        {' · '}
        <button className="underline" onClick={load}>refresh</button>
      </div>
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">Error: {error}</div>}
      <div className="mb-4 p-4 border rounded">
        <input className="border p-2 mr-2" placeholder="Title" value={newGame.title} onChange={e => setNewGame({...newGame, title: e.target.value})} />
        <input className="border p-2 mr-2" placeholder="Platform" value={newGame.platform} onChange={e => setNewGame({...newGame, platform: e.target.value})} />
        <select className="border p-2 mr-2" value={newGame.status} onChange={e => setNewGame({...newGame, status: e.target.value})}>
          <option>Unplayed</option>
          <option>Backlog</option>
          <option>Playing</option>
          <option>Completed</option>
          <option>Dropped</option>
        </select>
        <button className="bg-blue-500 text-white p-2" onClick={handleAddGame}>Add Game</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {games.map(game => (
          <div key={game.id} className="relative">
            <GameCard game={game} />
            <button
              className="absolute top-2 right-2 text-xs text-red-600 underline"
              onClick={() => handleDelete(game.id)}
            >delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogPage;
