const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const aiRoutes = require('./routes/ai');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/api/ai', aiRoutes);

// Get all merchants
app.get('/api/merchants', (req, res) => {
    db.all("SELECT * FROM merchants", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get single merchant
app.get('/api/merchants/:id', (req, res) => {
    db.get("SELECT * FROM merchants WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// Create merchant
app.post('/api/merchants', (req, res) => {
    const { name, category, lat, lng, address, openingHours, ownerId } = req.body;
    const sql = `INSERT INTO merchants (name, category, lat, lng, address, openingHours, ownerId, rating, announcement, description) VALUES (?, ?, ?, ?, ?, ?, ?, 5.0, '', '')`;
    db.run(sql, [name, category, lat, lng, address, openingHours, ownerId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

// Update merchant
app.put('/api/merchants/:id', (req, res) => {
    const { name, announcement, description, address, openingHours, ownerId } = req.body;
    const sql = `UPDATE merchants SET name=?, announcement=?, description=?, address=?, openingHours=? WHERE id=? AND ownerId=?`;
    db.run(sql, [name, announcement, description, address, openingHours, req.params.id, ownerId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Get user
app.get('/api/users/:username', (req, res) => {
    db.get("SELECT * FROM users WHERE username = ?", [req.params.username], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "User not found" });
        res.json(row);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
