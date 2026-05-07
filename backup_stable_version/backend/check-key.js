require('dotenv').config();
const https = require('https');

function checkKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    console.log("Fetching official model list via HTTPS...");
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                if (parsed.models) {
                    console.log("AVAILABLE MODELS FOUND:");
                    parsed.models.forEach(m => console.log(`- ${m.name}`));
                } else {
                    console.log("NO MODELS RETURNED. Error:", JSON.stringify(parsed, null, 2));
                }
            } catch (e) {
                console.error("Parse failed:", e.message);
                console.log("Raw Response:", data);
            }
        });
    }).on('error', (err) => {
        console.error("Request failed:", err.message);
    });
}

checkKey();
