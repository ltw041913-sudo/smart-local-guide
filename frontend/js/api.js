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

    async deleteMerchant(id) {
        const res = await fetch(`${API_BASE}/merchants/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    async login(email, password) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Login failed');
        }
        return data; // { success: true, user: {...} }
    },

    async getUser(username) {
        const res = await fetch(`${API_BASE}/users/${username}`);
        return res.json();
    },

    async generateAudioScript(merchant, persona, lang, model) {
        const res = await fetch(`${API_BASE}/ai/generate-audio-script`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ merchant, persona, lang, model })
        });
        const data = await res.json();
        if (!res.ok) {
            console.error("Backend Error:", data);
            throw new Error(data.error || `Server Error (${res.status})`);
        }
        return data.script;
    },

    async refineAnnouncement(text, lang, model) {
        const res = await fetch(`${API_BASE}/ai/refine-announcement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, lang, model })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Unknown error');
        }
        return data.refinedText;
    },

    async askBot(question, allMerchants, lang, model) {
        const res = await fetch(`${API_BASE}/ai/ask-bot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, allMerchants, lang, model })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Unknown error');
        }
        return data.answer;
    },

    async planTrip(allPlaces, duration, preferences, interests, lang, selectedPlaces, model) {
        const res = await fetch(`${API_BASE}/ai/plan-trip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ allPlaces, duration, preferences, interests, lang, selectedPlaces, model })
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
    },

    async upgradeToOwner(userId) {
        const res = await fetch(`${API_BASE}/auth/upgrade-role`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, role: 'owner' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Role upgrade failed');
        return data;
    }
};

window.api = api;
