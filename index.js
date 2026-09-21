const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('frontend'));

// GET /api/games — list all games, newest updated first
app.get('/api/games', (req, res) => {
    db.all("SELECT * FROM games ORDER BY updated_at DESC, id DESC", [], (err, rows) => {
        if (err) res.status(400).json({"error": err.message});
        else res.json({"data": rows});
    });
});

// POST /api/games — create a new game
app.post('/api/games', (req, res) => {
    const { title, platform, status } = req.body;
    const device_id = req.body.device_id || null;
    const now = new Date().toISOString();
    db.run(
        "INSERT INTO games (title, platform, status, device_id, updated_at) VALUES (?,?,?,?,?)",
        [title, platform, status, device_id, now],
        function(err) {
            if (err) res.status(400).json({"error": err.message});
            else res.json({"id": this.lastID, "updated_at": now});
        }
    );
});

// PUT /api/games/:id — update an existing game (last-write-wins by updated_at)
app.put('/api/games/:id', (req, res) => {
    const { title, platform, status, device_id } = req.body;
    const now = new Date().toISOString();
    db.run(
        "UPDATE games SET title = ?, platform = ?, status = ?, device_id = ?, updated_at = ? WHERE id = ?",
        [title, platform, status, device_id || null, now, req.params.id],
        function(err) {
            if (err) res.status(400).json({"error": err.message});
            else if (this.changes === 0) res.status(404).json({"error": "not found"});
            else res.json({"id": req.params.id, "updated_at": now});
        }
    );
});

// DELETE /api/games/:id
app.delete('/api/games/:id', (req, res) => {
    db.run("DELETE FROM games WHERE id = ?", [req.params.id], function(err) {
        if (err) res.status(400).json({"error": err.message});
        else if (this.changes === 0) res.status(404).json({"error": "not found"});
        else res.json({"deleted": req.params.id});
    });
});

app.listen(3000, () => {
    console.log("GameShelf running at http://localhost:3000");
});
