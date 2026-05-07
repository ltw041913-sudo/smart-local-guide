require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    console.log("Listing available models...");
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // We use the underlying client to list models if possible, 
        // or just try common names.
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                await model.generateContent("test");
                console.log(`SUCCESS: ${m} is working!`);
            } catch (e) {
                console.log(`FAILED: ${m} - ${e.message}`);
            }
        }
    } catch (e) {
        console.error("General error:", e.message);
    }
}

listModels();
