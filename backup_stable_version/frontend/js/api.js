const API_BASE = 'http://localhost:3000/api';

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
    }
};

window.api = api;
