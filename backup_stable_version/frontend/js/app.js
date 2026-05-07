const app = {
    currentUser: null,
    merchants: [],
    heroIndex: 0,
    heroInterval: null,

    async init() {
        this.applyTranslations();
        await this.switchUser('guest');
        await this.loadMerchants();
        this.renderMerchants();
        this.startHeroSlideshow();
        this.initAudioWaves();
    },

    initAudioWaves() {
        // Prepare some visual feedback logic if needed
    },

    changeLanguage(lang) {
        window.i18n.setLang(lang);
        this.applyTranslations();
        this.renderMerchants();
    },

    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.innerText = window.i18n.t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            el.innerHTML = window.i18n.t(el.dataset.i18nHtml);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = window.i18n.t(el.dataset.i18nPlaceholder);
        });
    },

    async switchUser(username) {
        try {
            this.currentUser = await api.getUser(username);
            const btnAdd = document.getElementById('btn-add-merchant');
            if (this.currentUser && this.currentUser.role !== 'guest') {
                if(btnAdd) btnAdd.style.display = 'block';
            } else {
                if(btnAdd) btnAdd.style.display = 'none';
            }
            await this.loadMerchants();
            this.renderMerchants();
        } catch (e) { console.error(e); }
    },

    async loadMerchants() {
        try {
            this.merchants = await api.getMerchants();
        } catch (e) {
            console.error("Failed to load merchants:", e);
            alert("⚠️ 無法連線至後端伺服器，請確認後端程式是否已啟動 (Port 3000)");
        }
    },

    renderMerchants(filterText = '') {
        const list = document.getElementById('merchant-list');
        list.innerHTML = '';

        const filtered = this.merchants.filter(m => 
            m.name.toLowerCase().includes(filterText.toLowerCase()) || 
            (m.tags && m.tags.toLowerCase().includes(filterText.toLowerCase()))
        );

        filtered.forEach(m => {
            const li = document.createElement('li');
            li.className = 'merchant-item';
            li.innerHTML = `
                <div>
                    <h3>${m.name}</h3>
                    <small>${m.category}</small>
                </div>
                <div class="rating">⭐ ${m.rating || '5.0'}</div>
            `;
            li.onclick = () => this.showDetail(m.id);
            list.appendChild(li);
        });
    },

    async showDetail(id) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-detail').classList.add('active');
        window.scrollTo(0, 0);

        try {
            const merchant = await api.getMerchant(id);
            const content = document.getElementById('detail-content');
            const isOwner = this.currentUser && this.currentUser.id === merchant.ownerId;

            content.innerHTML = `
                <div class="detail-header" style="background-image: url('${merchant.imageUrl}')">
                    <h1 class="detail-title">${merchant.name}</h1>
                </div>
                
                <div class="announcement-box">
                    <h3>📢 店主公告</h3>
                    <p>${merchant.announcement || '歡迎光臨！'}</p>
                </div>

                <div class="grid-layout">
                    <div class="main-content">
                        <div id="audio-guide-section" style="margin-bottom: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <h3 style="margin-bottom: 1rem; color: var(--forest-green); display: flex; align-items: center; gap: 0.5rem;">🎧 AI 智慧語音導覽</h3>
                            <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;" id="audio-controls">
                                <button class="btn-audio" onclick="app.playAudio(event, 'elder', ${merchant.id})">👴 耆老講古</button>
                                <button class="btn-audio" onclick="app.playAudio(event, 'youth', ${merchant.id})">🧒 青年導覽</button>
                                <button class="btn-audio" onclick="app.playAudio(event, 'pro', ${merchant.id})">🎓 專業解說</button>
                                <button class="btn-audio" onclick="app.stopAudio()" id="btn-audio-stop" style="display: none; background: #ef4444; color: white; border: none;">停止</button>
                            </div>
                            <div id="audio-status" style="margin-top: 1rem; font-size: 0.9rem; color: #666; display: none;"></div>
                        </div>

                        <div class="info-card">
                            <h3>📖 品牌故事</h3>
                            <div class="markdown-body">
                                ${typeof marked !== 'undefined' ? marked.parse(merchant.description || '') : (merchant.description || '')}
                            </div>
                        </div>
                    </div>

                    <div class="sidebar">
                        <div class="info-card">
                            <h3>📍 店家資訊</h3>
                            <p><strong>地址:</strong> ${merchant.address || '未提供'}</p>
                            <p><strong>營業時間:</strong> ${merchant.openingHours || '未提供'}</p>
                            <p><strong>類別:</strong> ${merchant.category}</p>
                            <div style="margin-top:1rem; height:200px; background:#eee; border-radius:8px; overflow:hidden;">
                                <iframe width="100%" height="100%" frameborder="0" src="https://www.google.com/maps?q=${merchant.lat},${merchant.lng}&hl=zh-TW&z=15&output=embed"></iframe>
                            </div>
                        </div>
                        ${isOwner ? `<button class="btn btn-edit" onclick="app.openEditModal(${merchant.id})" style="width: auto; padding: 0.8rem 2rem;">⚙️ 編輯店家資訊</button>` : ''}
                    </div>
                </div>
            `;
        } catch (e) { console.error(e); }
    },

    showHome() {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-home').classList.add('active');
    },

    startHeroSlideshow() {
        const activeMerchants = this.merchants.filter(m => m.imageUrl);
        if (activeMerchants.length === 0) return;

        const updateHero = (dir) => {
            this.heroIndex = (this.heroIndex + dir + activeMerchants.length) % activeMerchants.length;
            const current = activeMerchants[this.heroIndex];
            const track = document.getElementById('hero-track');
            track.style.transform = `translateX(-${this.heroIndex * 100}%)`;
            document.getElementById('hero-title').innerText = current.name;
            document.getElementById('hero-subtitle').innerText = current.category;
            document.getElementById('hero-main').dataset.currentId = current.id;
        };

        const track = document.getElementById('hero-track');
        track.innerHTML = activeMerchants.map(m => `<div class="hero-slide" style="background-image: url('${m.imageUrl}')"></div>`).join('');
        
        updateHero(0);
        if(this.heroInterval) clearInterval(this.heroInterval);
        this.heroInterval = setInterval(() => updateHero(1), 5000);

        this.nextHero = (e) => { e.stopPropagation(); updateHero(1); };
        this.prevHero = (e) => { e.stopPropagation(); updateHero(-1); };
    },

    jumpToMerchant() {
        const id = document.getElementById('hero-main').dataset.currentId;
        if (id) this.showDetail(id);
    },

    openAddModal() {
        document.getElementById('add-overlay').classList.add('active');
        document.getElementById('add-modal').classList.add('active');
    },

    closeAddModal() {
        document.getElementById('add-overlay').classList.remove('active');
        document.getElementById('add-modal').classList.remove('active');
    },

    async submitNewMerchant() {
        const name = document.getElementById('add-name').value;
        const category = document.getElementById('add-category').value;
        const address = document.getElementById('add-address').value;
        const hours = document.getElementById('add-hours').value;
        if (!name || !category) return alert("請填寫必要欄位");

        try {
            await api.createMerchant({ name, category, address, openingHours: hours, ownerId: this.currentUser.id, lat: 25.033, lng: 121.565 });
            this.closeAddModal();
            await this.loadMerchants();
            this.renderMerchants();
        } catch (e) { alert(e.message); }
    },

    openEditModal(id) {
        const m = this.merchants.find(merchant => merchant.id === id);
        document.getElementById('edit-name').value = m.name || '';
        document.getElementById('edit-address').value = m.address || '';
        document.getElementById('edit-hours').value = m.openingHours || '';
        document.getElementById('edit-announcement').value = m.announcement || '';
        document.getElementById('edit-description').value = m.description || '';
        document.getElementById('edit-modal').dataset.merchantId = id;
        document.getElementById('edit-overlay').classList.add('active');
        document.getElementById('edit-modal').classList.add('active');
    },

    closeEditModal() {
        document.getElementById('edit-overlay').classList.remove('active');
        document.getElementById('edit-modal').classList.remove('active');
    },

    async submitEditMerchant() {
        const id = document.getElementById('edit-modal').dataset.merchantId;
        const name = document.getElementById('edit-name').value;
        const address = document.getElementById('edit-address').value;
        const hours = document.getElementById('edit-hours').value;
        const announcement = document.getElementById('edit-announcement').value;
        const description = document.getElementById('edit-description').value;

        try {
            await api.updateMerchant(id, { name, address, openingHours: hours, announcement, description, ownerId: this.currentUser.id });
            
            // 1. Reload global data to sync list and hero
            await this.loadMerchants();
            
            // 2. Refresh the detail view with fresh data
            await this.showDetail(id);
            
            // 3. Close modal and show success feedback
            this.closeEditModal();
            console.log("Merchant updated and synced successfully.");
        } catch (e) { alert(e.message); }
    },

    filterMerchants() {
        const text = document.getElementById('search-input').value;
        this.renderMerchants(text);
    },

    stopAudio() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        document.getElementById('btn-audio-stop').style.display = 'none';
        document.getElementById('audio-status').style.display = 'none';
        document.querySelectorAll('.btn-audio').forEach(btn => btn.classList.remove('active'));
    },

    async playAudio(event, persona, id) {
        this.stopAudio();
        const btn = event.currentTarget;
        
        if (!id) {
            alert("找不到店家識別碼。");
            return;
        }

        const statusDiv = document.getElementById('audio-status');
        btn.classList.add('active');
        statusDiv.innerHTML = `<i>正在準備語音導覽內容...</i>`;
        statusDiv.style.display = 'block';

        try {
            // Fetch fresh data directly to avoid cache issues
            const merchant = await api.getMerchant(id);
            if (!merchant) throw new Error("無法從伺服器獲取店家資料。");

            const lang = window.i18n.currentLang;
            statusDiv.innerHTML = `<i>正在透過 AI 生成 ${persona === 'elder' ? '耆老' : persona === 'youth' ? '青年' : '專業'} 導覽劇本...</i>`;
            
            const script = await api.generateAudioScript(merchant, persona, lang);
            
            statusDiv.innerHTML = `<div class="audio-waves"><span></span><span></span><span></span><span></span></div> 正在為您導覽中...`;
            
            const utterance = new SpeechSynthesisUtterance(script.replace(/[*#_`]/g, ''));
            const localeMap = { 'zh-TW': 'zh-TW', 'en': 'en-US', 'ja': 'ja-JP' };
            utterance.lang = localeMap[lang] || 'zh-TW';
            
            if (persona === 'elder') {
                utterance.pitch = 0.7;
                utterance.rate = 0.8;
            } else if (persona === 'youth') {
                utterance.pitch = 1.3;
                utterance.rate = 1.1;
            }

            utterance.onend = () => this.stopAudio();
            
            document.getElementById('btn-audio-stop').style.display = 'inline-block';
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error("Audio Guide Error:", e);
            alert("語音生成失敗: " + e.message);
            this.stopAudio();
        }
    }
};

window.onload = () => app.init();
