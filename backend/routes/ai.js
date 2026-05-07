// routes/ai.js
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/plan-trip', async (req, res) => {
    const { allPlaces, duration, preferences, interests, lang, selectedPlaces } = req.body;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        return res.status(500).json({ error: "API Key 尚未設定。請在 backend/.env 檔案中填寫您的 GEMINI_API_KEY" });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const langMap = {
            'zh-TW': '繁體中文 (Traditional Chinese)',
            'en': '英文 (English)',
            'ja': '日文 (Japanese)'
        };
        const outputLang = langMap[lang] || '繁體中文';

        const prompt = `
        你是一個頂尖的在地旅遊規劃師。請根據使用者的「旅遊興趣」與「手動選定的店家」，從我們平台提供的資料庫中，排出一份完美的行程表。

        【使用者條件】
        - 旅遊時間：${duration} 天 (0.5代表半日遊)
        - **使用者手動選定的優先地點**：${selectedPlaces && selectedPlaces.length > 0 ? selectedPlaces.join(', ') : '無'}
        - 選擇的興趣標籤：${interests && interests.length > 0 ? interests.join(', ') : '無特定'}
        - 其他偏好：${preferences || '無特定偏好，請安排順暢舒適的節奏'}

        【平台店家與景點資料庫】
        ${allPlaces.map(p => `- 名稱: ${p.name} | 類別: ${p.category} | 標籤: ${p.tags} | 座標: ${p.lat},${p.lng} | 營業時間: ${p.openingHours || '未註明'}`).join('\n')}

        【任務要求】
        1. **優先順序**：請務必將「使用者手動選定的優先地點」排入行程。
        2. **考量細節**：請根據「營業時間」與「座標位置」安排合理的順序。如果地點之間很近，請標註「步行即可抵達」。
        3. **行程排版**：請給我一個排版精美的 Markdown 格式行程表。
        4. **Google Maps 導航連結**：請在行程表的最下方，產生一條 Google Maps 路線規劃連結。
           連結格式範例： \`[📍 點擊這裡開啟 Google Maps 自動導航](https://www.google.com/maps/dir/?api=1&origin=地點A的座標&destination=地點C的座標&waypoints=地點B的座標)\`

        IMPORTANT INSTRUCTION: You MUST reply entirely in ${outputLang}. Ensure the tone is helpful and inspiring.
        `;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text();

        res.json({ itinerary: text });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: "Failed to generate itinerary." });
    }
});

router.post('/refine-announcement', async (req, res) => {
    const { text, lang } = req.body;
    
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "API Key missing" });

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        你是一位專業的文化推廣與社群文案大師。
        請幫我將這段較為「乾澀或簡短」的店家公告，轉化為一段「充滿故事感、溫度且吸引人」的文化故事。
        
        【原始公告】
        ${text}

        【要求】
        1. 保留原本的所有資訊（如特價、新品、活動時間）。
        2. 加入感性的敘事，讓遊客覺得這不只是一個公告，而是一個邀請。
        3. 長度約 100~150 字。
        4. 請直接輸出潤飾後的文字，不需要開場白或解釋。
        5. 使用語言：${lang === 'en' ? 'English' : lang === 'ja' ? 'Japanese' : 'Traditional Chinese'}。
        `;

        const result = await model.generateContent(prompt);
        res.json({ refinedText: (await result.response).text().trim() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/ask-bot', async (req, res) => {
    const { question, allMerchants, lang } = req.body;
    
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "API Key missing" });

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        你是一位熱情且專業的「在地旅遊小助手」。你對當地的所有店家與文化瞭如指掌。
        請根據下方提供的「店家資訊清單」來回答遊客的問題。

        【店家資訊清單】
        ${allMerchants.map(m => `- ${m.name} (${m.category}): ${m.description} | 營業時間: ${m.openingHours}`).join('\n')}

        【遊客問題】
        ${question}

        【任務】
        1. 如果問題與清單中的店家有關，請給出具體推薦。
        2. 如果問題問到「現在有沒有開」，請根據當前時間（假設現在是 ${new Date().toLocaleTimeString()}）與清單中的營業時間來判斷。
        3. 語氣要親切、像在地人一樣。
        4. 如果清單中沒有相關資訊，請委婉告知並給出一般的在地旅遊建議。
        5. 使用語言：${lang === 'en' ? 'English' : lang === 'ja' ? 'Japanese' : 'Traditional Chinese'}。
        `;

        const result = await model.generateContent(prompt);
        res.json({ answer: (await result.response).text().trim() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/plan-story', async (req, res) => {
    const { name, category, tags, lang } = req.body;
    
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "API Key missing" });

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const langMap = { 'zh-TW': '繁體中文 (Traditional Chinese)', 'en': '英文 (English)', 'ja': '日文 (Japanese)' };
        const outputLang = langMap[lang] || '繁體中文';

        const prompt = `
        你是一個充滿文藝氣息的地方文化記錄者。請根據以下店家資訊，寫出一篇豐富的「品牌與文化介紹」：
        - 店名：${name}
        - 類別：${category}
        - 關鍵字標籤：${tags}

        請包含三個段落（使用 Markdown 標題）：
        ### 品牌介紹 (Brand Introduction)
        ### 旅遊亮點 (Tourist Highlights)
        ### 地方文化敘事 (Local Cultural Narrative)

        IMPORTANT INSTRUCTION: You MUST reply entirely in ${outputLang}. Do not use other languages. Ensure the tone is welcoming and culturally rich.
        `;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text();

        res.json({ story: text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/analyze-reviews', async (req, res) => {
    const { reviews, lang } = req.body;
    if (!reviews || reviews.length === 0) return res.json({ summary: "No reviews to analyze." });

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
        });
        const prompt = `
            Analyze the following merchant reviews and provide a concise summary in ${lang}.
            Categorize the sentiment into "Atmosphere", "Service", and "Product Quality".
            For each category, provide a percentage score (0-100) and a brief 1-sentence comment.
            Output ONLY a JSON object like this:
            {
                "categories": [
                    {"name": "Atmosphere", "score": 85, "comment": "..."},
                    {"name": "Service", "score": 60, "comment": "..."},
                    {"name": "Product Quality", "score": 90, "comment": "..."}
                ],
                "overall_insight": "..."
            }

            Reviews:
            ${reviews.map(r => `- [Rating: ${r.rating}] ${r.comment}`).join('\n')}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean markdown JSON block if present
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        res.json(JSON.parse(jsonMatch ? jsonMatch[0] : text));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/generate-audio-script', async (req, res) => {
    const { merchant, persona, lang } = req.body;
    
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "API Key missing" });

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ]
        });

        const langMap = { 'zh-TW': '繁體中文 (Traditional Chinese)', 'en': '英文 (English)', 'ja': '日文 (Japanese)' };
        const outputLang = langMap[lang] || '繁體中文';

        let personaInstruction = "";
        if (persona === 'elder') {
            personaInstruction = "請扮演一位『在地懷舊耆老』。語氣要像是一位和藹可親的長輩，帶著懷舊、感性的口吻，娓娓道來這家店的歷史與文化。多用感嘆與溫暖的詞彙。";
        } else if (persona === 'youth') {
            personaInstruction = "請扮演一位『熱血青年創業者』。語氣要充滿活力、熱情與創新精神，像是向朋友介紹一個超酷的夢想基地。";
        } else {
            personaInstruction = "請扮演一位『專業文史導遊』。語氣要客觀、專業且優雅，條理清晰地介紹文化亮點。";
        }

        const merchantDesc = merchant.description || `${merchant.name} 是一家位於在地的 ${merchant.category} 店家。`;

        const prompt = `
        你現在是一個語音導覽員。${personaInstruction}
        
        請注意，你的任務是向遊客介紹這家店。如果資訊中有提供地址或營業時間，請「自然地」將它們編織進你的介紹中。

        【店家資訊】
        店名：${merchant.name}
        類別：${merchant.category}
        地址：${merchant.address || '未提供'}
        營業時間：${merchant.openingHours || '未提供'}
        標籤：${merchant.tags || '在地, 文化'}
        介紹：${merchantDesc}

        【任務】
        請為這家店寫一段約 150~200 字的「廣播級語音導覽劇本」。
        請注意：
        1. 這是要直接轉換成「語音」念出來的，所以請寫成「完全口語化」的對話形式，不要有 Markdown 符號、不要有括號註解、不要有特殊符號。
        2. 請直接開始講話，不需要寫「標題」或「大家好」。

        IMPORTANT INSTRUCTION: You MUST reply entirely in ${outputLang}. Do not use other languages in your response. Ensure it is plain text.
        `;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text();

        res.json({ script: text });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: error.message || "Unknown AI error" });
    }
});

module.exports = router;
