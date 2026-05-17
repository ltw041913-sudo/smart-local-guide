// db.js - PostgreSQL (Neon.tech)
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function initDB() {
    const client = await pool.connect();
    try {
        console.log('Initializing PostgreSQL database...');

        // Create Merchants Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS merchants (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                tags TEXT,
                description TEXT,
                announcement TEXT,
                "ownerId" INTEGER,
                lat REAL,
                lng REAL,
                rating REAL,
                "imageUrl" TEXT,
                "galleryImages" TEXT DEFAULT '[]',
                address TEXT,
                "openingHours" TEXT,
                "isHidden" INTEGER DEFAULT 0,
                "panoramaUrl" TEXT
            )
        `);

        // Create Users Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                role TEXT NOT NULL
            )
        `);

        // Create Stamps Table (Gamification)
        await client.query(`
            CREATE TABLE IF NOT EXISTS stamps (
                id SERIAL PRIMARY KEY,
                "userId" INTEGER,
                "merchantId" INTEGER,
                "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("userId", "merchantId")
            )
        `);

        // Create Achievements Table (Gamification)
        await client.query(`
            CREATE TABLE IF NOT EXISTS achievements (
                id SERIAL PRIMARY KEY,
                "userId" INTEGER,
                "achievementKey" TEXT,
                title TEXT,
                "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("userId", "achievementKey")
            )
        `);

        // Create Reviews Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                "merchantId" INTEGER,
                "userId" INTEGER,
                rating INTEGER,
                comment TEXT,
                "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY("merchantId") REFERENCES merchants(id),
                FOREIGN KEY("userId") REFERENCES users(id)
            )
        `);

        // Create Analytics Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS analytics_clicks (
                id SERIAL PRIMARY KEY,
                "merchantId" INTEGER,
                lat REAL,
                lng REAL,
                "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert Mock Data if merchants is empty
        const { rows } = await client.query('SELECT COUNT(*) AS count FROM merchants');
        if (parseInt(rows[0].count) === 0) {
            console.log('Inserting mock data...');

            await client.query(`
                INSERT INTO merchants (name, category, tags, description, announcement, "ownerId", lat, lng, rating, "imageUrl", address, "openingHours", "isHidden", "panoramaUrl") VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14),
                ($15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28),
                ($29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42),
                ($43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56)
            `, [
                '日出咖啡館','cafe','coffee,dessert,wifi','提供自家焙煎的精品咖啡與手作甜點，是你放鬆身心的好去處。','本月新品：海鹽焦糖拿鐵，歡迎品嚐！',2,25.0330,121.5654,4.8,'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800','台北市信義區忠孝東路五段101號','08:00 - 20:00',0,'images/panorama_sample.png',
                '老街文創小舖','store','souvenir,handmade,culture','結合在地傳統工藝與現代設計的特色商品。','徵求在地手工藝創作者進駐！',3,25.0340,121.5640,4.5,'https://images.unsplash.com/photo-1463114881077-789f2142e0fc?auto=format&fit=crop&q=80&w=800','新北市淡水區中正路12號','10:00 - 18:00',0,'',
                '森林秘境餐廳','restaurant','food,nature,view','隱身於山林中的景觀餐廳，提供有機蔬食料理。','假日建議提早訂位。',4,25.0350,121.5660,4.9,'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800','台北市士林區仰德大道三段88號','11:30 - 21:00',0,'',
                '神祕百年大榕樹','sightseeing','nature,history,hidden','在地人才知道的神祕百年大榕樹，據說在樹下許願非常靈驗。','隱藏景點：解鎖成就後可見。',1,25.0360,121.5670,5.0,'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=800','山林秘徑深處','24小時開放',1,''
            ]);

            await client.query(`
                INSERT INTO users (id, username, role) VALUES
                (1, 'guest', 'unregistered'),
                (2, 'cafe_owner', 'owner'),
                (3, 'store_owner', 'owner'),
                (4, 'restaurant_owner', 'owner'),
                (5, 'traveler_john', 'consumer')
                ON CONFLICT (id) DO NOTHING
            `);

            console.log('Mock data inserted successfully.');
        }

        console.log('PostgreSQL database ready.');
    } catch (err) {
        console.error('Database initialization error:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

initDB().catch(err => {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
});

module.exports = pool;
