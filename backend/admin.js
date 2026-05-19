const bcrypt = require('bcryptjs');
const db = require('./db');

async function makeAdmin() {
    try {
        const hash = await bcrypt.hash('admin1234', 10);
        const res = await db.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM users');
        const nextId = res.rows[0].next_id;
        
        await db.query(
            'INSERT INTO users (id, username, role, email, password_hash) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING', 
            [nextId, 'super_admin', 'admin', 'admin@local.guide', hash]
        );
        console.log('Admin created');
    } catch(e) {
        console.log(e);
    } finally {
        process.exit(0);
    }
}

makeAdmin();
