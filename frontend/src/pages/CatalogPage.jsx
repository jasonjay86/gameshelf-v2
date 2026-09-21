import React, { useState, useEffect, useRef, useMemo } from 'react';
import GameCard from '../components/Game/GameCard';
import {
  IconCompass, IconLayers, IconCloud, IconSettings,
  IconSearch, IconPlus, IconRefresh, IconKey, IconX,
} from '../components/UI/Icons';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Stable per-browser device id
function getDeviceId() {
  let id = localStorage.getItem('gs_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem('gs_device_id', id);
  }
  return id;
}

const STATUSES = ['All', 'Unplayed', 'Backlog', 'Playing', 'Completed', 'Dropped'];

const Header = ({ count, onSettings }) => (
  <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-slate-950/60 backdrop-blur-xl transition-all duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/20">
          <IconLayers className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
            Game<span className="text-brand-400">Shelf</span>
          </span>
          <span className="block text-[10px] text-slate-400 tracking-wider uppercase font-medium">Virtual Library</span>
        </div>
      </div>

      {/* Center badge */}
      <div className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/60 border border-white/[0.08]">
        <IconCompass className="w-4 h-4 text-brand-400" />
        <span className="text-sm font-semibold text-slate-200">My Shelf</span>
        <span className="ml-1 px-2 py-0.5 text-xs bg-slate-800 text-brand-300 rounded-full border border-brand-500/20 font-mono">
          {count}
        </span>
      </div>

      {/* Right-side: sync indicator + settings */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.08] bg-slate-900/50 text-xs font-semibold text-slate-300">
          <IconCloud className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Cloud Sync</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
        </div>
        <button
          onClick={onSettings}
          className="p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/50 hover:bg-slate-800/80 transition-all text-slate-400 hover:text-white"
          aria-label="Settings"
          title="Settings & API"
        >
          <IconSettings className="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
);

const SettingsModal = ({ onClose, apiBase, deviceId, onApiBaseChange }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
    <div className="glass-panel rounded-2xl border border-white/[0.08] max-w-md w-full p-6 space-y-5" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl">Settings</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
          <IconX className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <IconKey className="w-3.5 h-3.5" />
          API Base URL
        </label>
        <input
          type="text"
          value={apiBase}
          onChange={e => onApiBaseChange(e.target.value)}
          placeholder="https://your-tunnel.trycloudflare.com"
          className="input-base px-4 py-3 text-sm"
        />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Set this to your Cloudflare tunnel URL so the static GitHub Pages site can talk to your backend.
          Leave blank to use same-origin (local dev).
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Device ID</label>
        <code className="block px-4 py-3 rounded-xl bg-slate-950/80 border border-white/[0.08] text-xs font-mono text-slate-300 break-all">
          {deviceId}
        </code>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Sent with every write so you can tell which device last touched a row.
        </p>
      </div>

      <button onClick={onClose} className="btn-primary w-full">Done</button>
    </div>
  </div>
);

const CatalogPage = () => {
  const [games, setGames] = useState([]);
  const [newGame, setNewGame] = useState({ title: '', platform: '', status: 'Backlog' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Persisted API base override — useful for the static GitHub Pages site
  const [apiBase, setApiBase] = useState(() => localStorage.getItem('gs_api_base') || API_BASE);
  useEffect(() => { localStorage.setItem('gs_api_base', apiBase); }, [apiBase]);

  const deviceIdRef = useRef(getDeviceId());
  const apiRef = useRef(apiBase);
  useEffect(() => { apiRef.current = apiBase; }, [apiBase]);

  const url = (path) => `${apiBase || ''}${path}`;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(url('/api/games'));
      const json = await res.json();
      setGames(json.data || []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAddGame = async () => {
    if (!newGame.title.trim()) return;
    try {
      const res = await fetch(url('/api/games'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newGame, device_id: deviceIdRef.current })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'POST failed');
      setGames(g => [...g, { ...newGame, id: json.id, updated_at: json.updated_at, device_id: deviceIdRef.current }]);
      setNewGame({ title: '', platform: '', status: 'Backlog' });
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(url(`/api/games/${id}`), { method: 'DELETE' });
      if (!res.ok) throw new Error('DELETE failed');
      setGames(g => g.filter(x => x.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  const visible = useMemo(() => {
    return games.filter(g => {
      const matchStatus = activeStatus === 'All' || g.status === activeStatus;
      const matchSearch = !search || (g.title || '').toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [games, activeStatus, search]);

  return (
    <div className="min-h-screen bg-dark-bg bg-ambient">
      <Header count={games.length} onSettings={() => setShowSettings(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-12">
        {/* Hero */}
        <div className="text-center md:text-left space-y-2 py-4 mb-8">
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Your Cross-Device <span className="bg-gradient-to-r from-brand-400 to-accent-cyan bg-clip-text text-transparent">Shelf</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-base sm:text-lg">
            Track what you're playing on every device — phone, laptop, tablet. Synced via your own backend.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 backdrop-blur-md flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <IconX className="w-4 h-4" />
            </div>
            <div className="flex-1 text-sm">
              <div className="font-semibold text-rose-200">Couldn't reach the API</div>
              <div className="text-xs text-slate-400 mt-0.5">{error}. Open settings and verify your API base URL.</div>
            </div>
            <button onClick={load} className="text-xs underline text-rose-300 hover:text-rose-200">retry</button>
          </div>
        )}

        {/* Search + filters panel */}
        <section className="glass-panel p-5 rounded-2xl border border-white/[0.08] bg-slate-900/30 space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 group">
              <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter your shelf..."
                className="input-base pl-12 pr-10 py-4 text-sm sm:text-base"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white rounded-full hover:bg-white/10">
                  <IconX className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={load} className="px-5 py-4 rounded-xl border border-white/[0.08] bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all text-sm font-semibold flex items-center gap-2">
              <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Status filter chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Status:</span>
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={`filter-badge ${activeStatus === s ? 'active' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Add-game panel */}
        <section className="glass-panel p-5 rounded-2xl border border-white/[0.08] bg-slate-900/30 mb-8">
          <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <IconPlus className="w-5 h-5 text-brand-400" />
            Add a game
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              className="input-base px-4 py-3 text-sm lg:col-span-1"
              placeholder="Title (e.g. Hollow Knight)"
              value={newGame.title}
              onChange={e => setNewGame({ ...newGame, title: e.target.value })}
            />
            <input
              className="input-base px-4 py-3 text-sm lg:col-span-1"
              placeholder="Platform (PC, PS5, Switch...)"
              value={newGame.platform}
              onChange={e => setNewGame({ ...newGame, platform: e.target.value })}
            />
            <select
              className="input-base px-4 py-3 text-sm lg:col-span-1"
              value={newGame.status}
              onChange={e => setNewGame({ ...newGame, status: e.target.value })}
            >
              {STATUSES.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={handleAddGame} className="btn-primary">
              <IconPlus className="w-5 h-5" />
              Add to shelf
            </button>
          </div>
        </section>

        {/* Shelf grid */}
        <section>
          {visible.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border border-white/[0.08] bg-slate-900/20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-brand-600/30 to-accent-cyan/30 flex items-center justify-center">
                <IconLayers className="w-8 h-8 text-brand-400" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-slate-200">
                {games.length === 0 ? 'Your shelf is empty' : 'No matches'}
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                {games.length === 0
                  ? 'Add your first game above to get started.'
                  : 'Try a different filter or search term.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {visible.map(game => (
                <GameCard key={game.id} game={game} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/[0.05] text-center text-xs text-slate-600 font-mono">
          <p>
            device: <span className="text-slate-400">{deviceIdRef.current}</span>
            {' · '}
            api: <span className="text-slate-400">{apiBase || 'same-origin'}</span>
          </p>
          <p className="mt-1">
            <a href="https://github.com/jasonjay86/gameshelf-v2" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">source on GitHub</a>
          </p>
        </footer>
      </main>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          apiBase={apiBase}
          onApiBaseChange={setApiBase}
          deviceId={deviceIdRef.current}
        />
      )}
    </div>
  );
};

export default CatalogPage;
