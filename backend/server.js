const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const aiRoutes = require('./routes/ai');
const multer = require('multer');
const fs = require('fs');

const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(cors());
app.use(express.json());
app.use('/api/ai', aiRoutes);

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'public/uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ filePath });
});

// Cubemap Upload Endpoint
app.post('/api/upload-cubemap', upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'right', maxCount: 1 },
    { name: 'back', maxCount: 1 },
    { name: 'left', maxCount: 1 },
    { name: 'up', maxCount: 1 },
    { name: 'down', maxCount: 1 }
]), (req, res) => {
    const files = req.files;
    const paths = {
        front: files.front ? `/uploads/${files.front[0].filename}` : null,
        right: files.right ? `/uploads/${files.right[0].filename}` : null,
        back: files.back ? `/uploads/${files.back[0].filename}` : null,
        left: files.left ? `/uploads/${files.left[0].filename}` : null,
        up: files.up ? `/uploads/${files.up[0].filename}` : null,
        down: files.down ? `/uploads/${files.down[0].filename}` : null
    };
    res.json({ paths: [paths.front, paths.right, paths.back, paths.left, paths.up, paths.down] });
});

// Get all merchants
app.get('/api/merchants', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM merchants');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single merchant
app.get('/api/merchants/:id', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM merchants WHERE id = $1', [req.params.id]);
        if (!rows[0]) return res.status(404).json({ error: 'Merchant not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create merchant
app.post('/api/merchants', async (req, res) => {
    const { name, category, lat, lng, address, openingHours, ownerId, panoramaUrl } = req.body;
    try {
        const { rows } = await db.query(
            `INSERT INTO merchants (name, category, lat, lng, address, "openingHours", "ownerId", rating, announcement, description, "panoramaUrl")
             VALUES ($1, $2, $3, $4, $5, $6, $7, 5.0, '', '', $8) RETURNING id`,
            [name, category, lat, lng, address, openingHours, ownerId, panoramaUrl]
        );
        res.json({ id: rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update merchant
app.put('/api/merchants/:id', async (req, res) => {
    const { name, announcement, description, address, openingHours, ownerId, panoramaUrl } = req.body;
    try {
        await db.query(
            `UPDATE merchants SET name=$1, announcement=$2, description=$3, address=$4, "openingHours"=$5, "panoramaUrl"=$6 WHERE id=$7 AND "ownerId"=$8`,
            [name, announcement, description, address, openingHours, panoramaUrl, req.params.id, ownerId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user
app.get('/api/users/:username', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [req.params.username]);
        if (!rows[0]) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 服务前端静态文件
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// 所有其他請求都導向 index.html (SPA 路由)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
