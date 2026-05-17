const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '' || window.location.protocol === 'file:') 
    ? 'http://localhost:3000/api' 
    : '/api';

const api = {
    async getMerchants() {
        const res = await fetch(`${API_BASE}/merchants`);
        return res.json();
    },

    async getMerchant(id) {
        const res = await fetch(`${API_BASE}/merchants/${id}`);
        return res.json();
    },

    async createMerchant(data) {
        const res = await fetch(`${API_BASE}/merchants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async updateMerchant(id, data) {
        const res = await fetch(`${API_BASE}/merchants/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async getUser(username) {
        const res = await fetch(`${API_BASE}/users/${username}`);
        return res.json();
    },

    async generateAudioScript(merchant, persona, lang) {
        const res = await fetch(`${API_BASE}/ai/generate-audio-script`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ merchant, persona, lang })
        });
        const data = await res.json();
        if (!res.ok) {
            console.error("Backend Error:", data);
            throw new Error(data.error || `Server Error (${res.status})`);
        }
        return data.script;
    },

    async refineAnnouncement(text, lang) {
        const res = await fetch(`${API_BASE}/ai/refine-announcement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, lang })
        });
        const data = await res.json();
        return data.refinedText;
    },

    async askBot(question, allMerchants, lang) {
        const res = await fetch(`${API_BASE}/ai/ask-bot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, allMerchants, lang })
        });
        const data = await res.json();
        return data.answer;
    },

    async planTrip(allPlaces, duration, preferences, interests, lang, selectedPlaces) {
        const res = await fetch(`${API_BASE}/ai/plan-trip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ allPlaces, duration, preferences, interests, lang, selectedPlaces })
        });
        const data = await res.json();
        return data.itinerary;
    },

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json(); // { filePath: '/uploads/...' }
    },

    async uploadCubemap(files) {
        const formData = new FormData();
        for (const face in files) {
            if (files[face]) formData.append(face, files[face]);
        }
        const res = await fetch(`${API_BASE}/upload-cubemap`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Cubemap upload failed');
        return res.json(); // { paths: [...] }
    }
};

window.api = api;
