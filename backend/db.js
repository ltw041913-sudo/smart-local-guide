// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            // Create Merchants Table
            db.run(`CREATE TABLE IF NOT EXISTS merchants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                tags TEXT,
                description TEXT,
                announcement TEXT,
                ownerId INTEGER,
                lat REAL,
                lng REAL,
                rating REAL,
                imageUrl TEXT,
                galleryImages TEXT DEFAULT '[]',
                address TEXT,
                openingHours TEXT,
                isHidden INTEGER DEFAULT 0
            )`);

            // Create Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                role TEXT NOT NULL
            )`);

            // Create Stamps Table (Gamification)
            db.run(`CREATE TABLE IF NOT EXISTS stamps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                merchantId INTEGER,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(userId, merchantId)
            )`);

            // Create Achievements Table (Gamification)
            db.run(`CREATE TABLE IF NOT EXISTS achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                achievementKey TEXT,
                title TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(userId, achievementKey)
            )`);

            // Create Reviews Table
            db.run(`CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                merchantId INTEGER,
                userId INTEGER,
                rating INTEGER,
                comment TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(merchantId) REFERENCES merchants(id),
                FOREIGN KEY(userId) REFERENCES users(id)
            )`);

            // Create Analytics Table (Data Insights)
            db.run(`CREATE TABLE IF NOT EXISTS analytics_clicks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                merchantId INTEGER,
                lat REAL,
                lng REAL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Insert Mock Data if merchants is empty
            db.get("SELECT COUNT(*) as count FROM merchants", (err, row) => {
                if (row && row.count === 0) {
                    console.log('Inserting mock data...');
                    const insertMerchant = db.prepare(`INSERT INTO merchants (name, category, tags, description, announcement, ownerId, lat, lng, rating, imageUrl, address, openingHours, isHidden) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                    
                    insertMerchant.run("日出咖啡館", "cafe", "coffee,dessert,wifi", "提供自家焙煎的精品咖啡與手作甜點，是你放鬆身心的好去處。", "本月新品：海鹽焦糖拿鐵，歡迎品嚐！", 2, 25.0330, 121.5654, 4.8, "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800", "台北市信義區忠孝東路五段101號", "08:00 - 20:00", 0);
                    insertMerchant.run("老街文創小舖", "store", "souvenir,handmade,culture", "結合在地傳統工藝與現代設計的特色商品。", "徵求在地手工藝創作者進駐！", 3, 25.0340, 121.5640, 4.5, "https://images.unsplash.com/photo-1463114881077-789f2142e0fc?auto=format&fit=crop&q=80&w=800", "新北市淡水區中正路12號", "10:00 - 18:00", 0);
                    insertMerchant.run("森林秘境餐廳", "restaurant", "food,nature,view", "隱身於山林中的景觀餐廳，提供有機蔬食料理。", "假日建議提早訂位。", 4, 25.0350, 121.5660, 4.9, "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800", "台北市士林區仰德大道三段88號", "11:30 - 21:00", 0);
                    
                    // Hidden Spot
                    insertMerchant.run("神祕百年大榕樹", "sightseeing", "nature,history,hidden", "在地人才知道的神祕百年大榕樹，據說在樹下許願非常靈驗。", "隱藏景點：解鎖成就後可見。", 1, 25.0360, 121.5670, 5.0, "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=800", "山林秘徑深處", "24小時開放", 1);
                    
                    insertMerchant.finalize();

                    const insertUser = db.prepare(`INSERT INTO users (id, username, role) VALUES (?, ?, ?)`);
                    insertUser.run(1, "guest", "unregistered");
                    insertUser.run(2, "cafe_owner", "owner");
                    insertUser.run(3, "store_owner", "owner");
                    insertUser.run(4, "restaurant_owner", "owner");
                    insertUser.run(5, "traveler_john", "consumer");
                    insertUser.finalize();
                }
            });
        });
    }
});

module.exports = db;
