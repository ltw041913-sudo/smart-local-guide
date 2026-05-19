const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Check if email already exists
        const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: '此電子郵件已被註冊 (Email is already registered)' });
        }

        // Hash password with bcrypt
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Generate a username from the email prefix + random number
        const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 10000);
        
        // Calculate next ID manually in case the table was created with INTEGER instead of SERIAL
        const maxIdResult = await db.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM users');
        const nextId = maxIdResult.rows[0].next_id;

        // Set default role to 'consumer'
        const role = 'consumer';

        await db.query(
            `INSERT INTO users (id, username, role, email, password_hash) VALUES ($1, $2, $3, $4, $5)`,
            [nextId, username, role, email, passwordHash]
        );

        res.status(201).json({ success: true, message: '註冊成功！' });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: '伺服器內部錯誤' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: '找不到此電子郵件的帳號' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: '密碼錯誤' });
        }

        // Return user info (in a real app, you would return a JWT here)
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: '伺服器內部錯誤' });
    }
});

module.exports = router;
