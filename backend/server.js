const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');
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
app.use('/api/auth', authRoutes);

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

// Geocoding helper function
const { GoogleGenerativeAI } = require('@google/generative-ai');
async function geocodeAddress(address) {
    if (!address || address.trim() === '' || address === '山林秘徑深處') {
        return { lat: 25.033, lng: 121.565 };
    }
    
    // 1. Try OSM Nominatim Geocoding first
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'SmartLocalGuidePlatform/1.0 (contact: info@smartlocalguide.example)'
            }
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                if (!isNaN(lat) && !isNaN(lng)) {
                    console.log(`[OSM Geocoder] Success for "${address}":`, lat, lng);
                    return { lat, lng };
                }
            }
        }
    } catch (e) {
        console.error("[OSM Geocoder] Error:", e.message);
    }

    // 2. Fallback to Gemini if OSM fails/rate-limits
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
        try {
            console.log(`[Gemini Geocoder] Resolving coordinates for "${address}"...`);
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
            const prompt = `
            Please find the GPS latitude and longitude coordinates for this address or location in Taiwan: "${address}".
            If it is a famous scenic spot, restaurant or location, return its exact coordinates.
            Return the output in STRICT and valid JSON format as follows:
            {
                "lat": 23.9575,
                "lng": 120.6864
            }
            Do not wrap the response in markdown blocks (such as \`\`\`json) and do not provide any extra text. Just return the raw JSON object.
            `;
            const result = await model.generateContent(prompt);
            const text = (await result.response).text().trim();
            const cleanText = text.replace(/```json/i, '').replace(/```/g, '').trim();
            const coords = JSON.parse(cleanText);
            if (coords && !isNaN(coords.lat) && !isNaN(coords.lng)) {
                console.log(`[Gemini Geocoder] Success for "${address}":`, coords.lat, coords.lng);
                return { lat: parseFloat(coords.lat), lng: parseFloat(coords.lng) };
            }
        } catch (e) {
            console.error("[Gemini Geocoder] Error:", e.message);
        }
    }

    // 3. Fallback coordinates (Taipei default)
    console.log(`[Geocoder] Fallback to default Taipei coordinates for "${address}"`);
    return { lat: 25.033, lng: 121.565 };
}

// Create merchant
app.post('/api/merchants', async (req, res) => {
    const { name, category, address, openingHours, ownerId, panoramaUrl, imageUrl } = req.body;
    let { lat, lng } = req.body;

    const hasManualCoords = (lat !== undefined && lat !== null && lat !== '' && !isNaN(parseFloat(lat))) &&
                            (lng !== undefined && lng !== null && lng !== '' && !isNaN(parseFloat(lng)));

    if (!hasManualCoords) {
        if (!address || address.trim() === '') {
            // No address and no coordinates, fall back to default Taipei coordinates
            lat = 25.033;
            lng = 121.565;
        } else {
            // Address is filled but coordinates are empty/invalid, keep coordinates as null
            lat = null;
            lng = null;
        }
    } else {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
    }

    try {
        const { rows } = await db.query(
            `INSERT INTO merchants (name, category, lat, lng, address, "openingHours", "ownerId", rating, announcement, description, "panoramaUrl", "imageUrl")
             VALUES ($1, $2, $3, $4, $5, $6, $7, 5.0, '', '', $8, $9) RETURNING id`,
            [name, category, lat, lng, address, openingHours, ownerId, panoramaUrl, imageUrl || '']
        );
        res.json({ id: rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update merchant
app.put('/api/merchants/:id', async (req, res) => {
    const { name, announcement, description, address, openingHours, ownerId, panoramaUrl, imageUrl } = req.body;
    let { lat, lng } = req.body;

    const hasManualCoords = (lat !== undefined && lat !== null && lat !== '' && !isNaN(parseFloat(lat))) &&
                            (lng !== undefined && lng !== null && lng !== '' && !isNaN(parseFloat(lng)));

    if (!hasManualCoords) {
        if (!address || address.trim() === '') {
            // No address and no coordinates, fallback to default Taipei coordinates
            lat = 25.033;
            lng = 121.565;
        } else {
            // Address is filled but coordinates are empty/invalid, keep coordinates as null
            lat = null;
            lng = null;
        }
    } else {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
    }

    try {
        await db.query(
            `UPDATE merchants SET name=$1, announcement=$2, description=$3, address=$4, "openingHours"=$5, "panoramaUrl"=$6, "imageUrl"=$7, lat=$8, lng=$9 WHERE id=$10 AND "ownerId"=$11`,
            [name, announcement, description, address, openingHours, panoramaUrl, imageUrl, lat, lng, req.params.id, ownerId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete merchant
app.delete('/api/merchants/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM merchants WHERE id=$1', [req.params.id]);
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
