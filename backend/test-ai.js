require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    console.log("Starting AI Diagnostic Test...");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY is missing in .env");
        return;
    }
    console.log("API Key found (length):", apiKey.length);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Model initialized. Sending test prompt...");
        
        const result = await model.generateContent("Hello, say 'AI is working' if you can read this.");
        const text = (await result.response).text();
        console.log("SUCCESS! AI Response:", text);
    } catch (e) {
        console.error("DIAGNOSTIC FAILED:", e.message);
        if (e.stack) console.error(e.stack);
    }
}

test();
