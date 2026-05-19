const app = {
    currentUser: null,
    merchants: [],
    selectedMerchants: [],
    planningMode: false,
    heroIndex: 0,
    heroInterval: null,

    async init() {
        this.applyTranslations();
        await this.checkAuthState();
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
        document.documentElement.lang = lang;
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
        document.querySelectorAll('[data-i18n-option]').forEach(el => {
            el.innerText = window.i18n.t(el.dataset.i18nOption);
        });
        // Update page title
        const titleEl = document.querySelector('title[data-i18n]');
        if (titleEl) document.title = window.i18n.t(titleEl.dataset.i18n);
    },

    async checkAuthState() {
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                document.getElementById('auth-logged-out').style.display = 'none';
                document.getElementById('auth-logged-in').style.display = 'flex';
                document.getElementById('auth-username').textContent = this.currentUser.username;
            } else {
                this.currentUser = { role: 'unregistered', username: 'guest' };
                document.getElementById('auth-logged-out').style.display = 'flex';
                document.getElementById('auth-logged-in').style.display = 'none';
            }

            const btnAdd = document.getElementById('btn-add-merchant');
            if (this.currentUser && (this.currentUser.role === 'owner' || this.currentUser.role === 'admin')) {
                if(btnAdd) btnAdd.style.display = 'block';
            } else {
                if(btnAdd) btnAdd.style.display = 'none';
            }
        } catch (e) { console.error(e); }
    },

    logout() {
        localStorage.removeItem('currentUser');
        window.location.reload();
    },

    async loadMerchants() {
        try {
            this.merchants = await api.getMerchants();
        } catch (e) {
            console.error("Failed to load merchants:", e);
            alert(window.i18n.t('alert_backend_error'));
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
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.gap = '10px';
            const isSelected = this.selectedMerchants.includes(m.id);
            li.innerHTML = `
                ${this.planningMode ? `<input type="checkbox" ${isSelected ? 'checked' : ''} onclick="app.toggleTripSelection(event, ${m.id})" style="width:18px; height:18px; cursor:pointer; flex-shrink:0;">` : ''}
                <div style="flex:1;" onclick="app.showDetail(${m.id})">
                    <h3 style="margin:0; font-size:1.1rem;">${m.name}</h3>
                    <small style="color:#666;">${m.category}</small>
                </div>
                <div class="rating">⭐ ${m.rating || '5.0'}</div>
            `;
            list.appendChild(li);
        });

        // Trip bar visibility
        const tripBar = document.getElementById('trip-selection-bar');
        const countSpan = document.getElementById('selected-count');
        if (tripBar) {
            tripBar.style.display = this.planningMode ? 'block' : 'none';
            if (countSpan) countSpan.innerText = this.selectedMerchants.length;
        }
    },

    async showDetail(id) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-detail').classList.add('active');
        window.scrollTo(0, 0);

        try {
            const merchant = await api.getMerchant(id);
            const content = document.getElementById('detail-content');
            const isOwner = this.currentUser && (this.currentUser.id === merchant.ownerId || this.currentUser.role === 'admin');

            const t = (key) => window.i18n.t(key);
            content.innerHTML = `
                <div class="detail-header" style="background-image: url('${merchant.imageUrl}')">
                    <h1 class="detail-title">${merchant.name}</h1>
                </div>
                
                <div class="announcement-box">
                    <h3>${t('announcement_title')}</h3>
                    <p>${merchant.announcement || t('announcement_default')}</p>
                </div>

                <div class="grid-layout">
                    <div class="main-content">
                        ${merchant.panoramaUrl ? `
                        <div class="panorama-section" style="margin-bottom: 2rem;">
                            <h3 style="margin-bottom: 1rem; color: var(--forest-green); display: flex; align-items: center; gap: 0.5rem;">🌐 360° 全景導覽</h3>
                            <div id="panorama-viewer" style="width: 100%; height: 350px; background: #000; border-radius: 12px; overflow: hidden;"></div>
                        </div>
                        ` : ''}
                        
                        <div id="audio-guide-section" style="margin-bottom: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <h3 style="margin-bottom: 1rem; color: var(--forest-green); display: flex; align-items: center; gap: 0.5rem;">${t('audio_title')}</h3>
                            <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;" id="audio-controls">
                                <button class="btn-audio" onclick="app.playAudio(event, 'elder', ${merchant.id})">${t('btn_audio_elder')}</button>
                                <button class="btn-audio" onclick="app.playAudio(event, 'youth', ${merchant.id})">${t('btn_audio_youth')}</button>
                                <button class="btn-audio" onclick="app.playAudio(event, 'pro', ${merchant.id})">${t('btn_audio_pro')}</button>
                                <button class="btn-audio" onclick="app.stopAudio()" id="btn-audio-stop" style="display: none; background: #ef4444; color: white; border: none;">${t('btn_audio_stop')}</button>
                            </div>
                            <div id="audio-status" style="margin-top: 1rem; font-size: 0.9rem; color: #666; display: none;"></div>
                        </div>

                        <div class="info-card">
                            <h3>${t('story_title')}</h3>
                            <div class="markdown-body">
                                ${typeof marked !== 'undefined' ? marked.parse(merchant.description || '') : (merchant.description || '')}
                            </div>
                        </div>
                    </div>

                    <div class="sidebar">
                        <div class="info-card">
                            <h3>${t('info_title')}</h3>
                            <p><strong>${t('info_address')}:</strong> ${merchant.address || t('info_not_provided')}</p>
                            <p><strong>${t('info_hours')}:</strong> ${merchant.openingHours || t('info_not_provided')}</p>
                            <p><strong>${t('info_category')}:</strong> ${merchant.category}</p>
                            <div style="margin-top:1rem; height:200px; background:#eee; border-radius:8px; overflow:hidden;">
                                <iframe width="100%" height="100%" frameborder="0" src="https://www.google.com/maps?q=${merchant.lat},${merchant.lng}&hl=zh-TW&z=15&output=embed"></iframe>
                            </div>
                        </div>
                        ${isOwner ? `
                            <div style="display:flex; gap:10px; margin-top: 2rem;">
                                <button class="btn btn-edit" onclick="app.openEditModal(${merchant.id})" style="flex:1; margin-top:0;">${t('btn_edit_merchant')}</button>
                                <button class="btn" onclick="app.deleteMerchant(${merchant.id})" style="flex:1; background: var(--retro-red); color: white; justify-content: center;">刪除店家</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            // Initialize panorama if URL exists
            if (merchant.panoramaUrl) {
                setTimeout(() => {
                    let config = {
                        "type": "equirectangular",
                        "panorama": merchant.panoramaUrl,
                        "autoLoad": true,
                        "autoRotate": -2
                    };

                    // Try to parse as JSON for cubemap
                    try {
                        if (merchant.panoramaUrl.startsWith('[')) {
                            const paths = JSON.parse(merchant.panoramaUrl);
                            if (Array.isArray(paths) && paths.length === 6) {
                                config = {
                                    "type": "cubemap",
                                    "cubeMap": paths,
                                    "autoLoad": true,
                                    "autoRotate": -2
                                };
                            }
                        }
                    } catch (e) {
                        console.log("Not a JSON panorama URL, using equirectangular");
                    }

                    pannellum.viewer('panorama-viewer', config);
                }, 100);
            }
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
        
        const cubemapFiles = {
            front: document.getElementById('add-cubemap-front').files[0],
            right: document.getElementById('add-cubemap-right').files[0],
            back: document.getElementById('add-cubemap-back').files[0],
            left: document.getElementById('add-cubemap-left').files[0],
            up: document.getElementById('add-cubemap-up').files[0],
            down: document.getElementById('add-cubemap-down').files[0]
        };

        if (!name || !category) return alert(window.i18n.t('alert_required_fields'));

        try {
            let panoramaUrl = '';
            // Check if all 6 cubemap files are selected
            const hasCubemap = Object.values(cubemapFiles).every(f => f);
            
            if (hasCubemap) {
                const uploadRes = await api.uploadCubemap(cubemapFiles);
                panoramaUrl = JSON.stringify(uploadRes.paths);
            }
            
            await api.createMerchant({ name, category, address, openingHours: hours, ownerId: this.currentUser.id, lat: 25.033, lng: 121.565, panoramaUrl });
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
        // Reset file inputs
        ['front', 'right', 'back', 'left', 'up', 'down'].forEach(face => {
            const el = document.getElementById(`edit-cubemap-${face}`);
            if (el) el.value = '';
        });
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
        
        const cubemapFiles = {
            front: document.getElementById('edit-cubemap-front').files[0],
            right: document.getElementById('edit-cubemap-right').files[0],
            back: document.getElementById('edit-cubemap-back').files[0],
            left: document.getElementById('edit-cubemap-left').files[0],
            up: document.getElementById('edit-cubemap-up').files[0],
            down: document.getElementById('edit-cubemap-down').files[0]
        };

        try {
            let targetMerchant = this.merchants.find(m => m.id == id);
            let panoramaUrl = targetMerchant.panoramaUrl || '';
            const hasCubemap = Object.values(cubemapFiles).every(f => f);
            
            if (hasCubemap) {
                const uploadRes = await api.uploadCubemap(cubemapFiles);
                panoramaUrl = JSON.stringify(uploadRes.paths);
            }
            
            // 使用原本店家的 ownerId，這樣即便 admin 去編輯也不會因為身分不符而 SQL 失敗
            await api.updateMerchant(id, { name, address, openingHours: hours, announcement, description, ownerId: targetMerchant.ownerId, panoramaUrl });
            
            // 1. Reload global data to sync list and hero
            await this.loadMerchants();
            
            // 2. Refresh the detail view with fresh data
            await this.showDetail(id);
            
            // 3. Close modal and show success feedback
            this.closeEditModal();
            console.log("Merchant updated and synced successfully.");
        } catch (e) { alert(e.message); }
    },

    async deleteMerchant(id) {
        if (confirm("確定要刪除這個店家嗎？此操作無法還原。")) {
            try {
                await api.deleteMerchant(id);
                alert("店家已成功刪除");
                await this.loadMerchants();
                this.renderMerchants();
                this.startHeroSlideshow();
                this.showHome();
            } catch (e) {
                alert("刪除失敗: " + e.message);
            }
        }
    },

    filterMerchants() {
        const text = document.getElementById('search-input').value;
        this.renderMerchants(text);
    },

    // ===== AI Trip Planner =====
    togglePlanningMode() {
        this.planningMode = !this.planningMode;
        if (!this.planningMode) this.selectedMerchants = [];
        const btn = document.getElementById('btn-trip-planner');
        if (btn) {
            btn.innerText = window.i18n.t(this.planningMode ? 'btn_trip_planner_exit' : 'btn_trip_planner');
            btn.style.background = this.planningMode ? '#666' : 'var(--forest-green)';
        }
        this.renderMerchants(document.getElementById('search-input').value);
    },

    toggleTripSelection(event, id) {
        event.stopPropagation();
        const idx = this.selectedMerchants.indexOf(id);
        if (idx > -1) {
            this.selectedMerchants.splice(idx, 1);
        } else {
            this.selectedMerchants.push(id);
        }
        this.renderMerchants(document.getElementById('search-input').value);
    },

    async generateTrip() {
        if (this.selectedMerchants.length < 2) {
            return alert(window.i18n.t('alert_min_2'));
        }
        const selectedData = this.merchants.filter(m => this.selectedMerchants.includes(m.id));
        const selectedNames = selectedData.map(m => m.name);

        document.getElementById('trip-overlay').classList.add('active');
        document.getElementById('trip-modal').classList.add('active');
        document.getElementById('trip-result').innerHTML = `<i>${window.i18n.t('trip_loading')}</i>`;

        try {
            const itinerary = await api.planTrip(this.merchants, 1, '', [], window.i18n ? window.i18n.currentLang : 'zh-TW', selectedNames);
            document.getElementById('trip-result').innerHTML = typeof marked !== 'undefined' ? marked.parse(itinerary) : itinerary;
        } catch (e) {
            console.error('Trip Error:', e);
            document.getElementById('trip-result').innerHTML = `<p style="color:red;">${e.message}</p>`;
        }
    },

    closeTripModal() {
        document.getElementById('trip-overlay').classList.remove('active');
        document.getElementById('trip-modal').classList.remove('active');
    },


    // ===== AI 風格文案助手 =====
    async refineAnnouncement() {
        const input = document.getElementById('edit-announcement');
        const text = input.value.trim();
        if (!text) return alert(window.i18n.t('alert_refine_empty'));

        const btn = event.currentTarget;
        const original = btn.innerText;
        btn.innerText = window.i18n.t('alert_refine_loading');
        btn.disabled = true;

        try {
            const lang = window.i18n ? window.i18n.currentLang : 'zh-TW';
            const refined = await api.refineAnnouncement(text, lang);
            input.value = refined;
        } catch (e) {
            alert(e.message);
        } finally {
            btn.innerText = original;
            btn.disabled = false;
        }
    },

    // ===== 懸浮 AI 客服 Bot =====
    toggleChat() {
        const win = document.getElementById('ai-chat-window');
        const isOpen = win.style.display === 'flex';
        win.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) {
            document.getElementById('chat-input').focus();
        }
    },

    async sendChatMessage() {
        const input = document.getElementById('chat-input');
        const container = document.getElementById('chat-messages');
        const text = input.value.trim();
        if (!text) return;

        // Render user bubble
        const userBubble = document.createElement('div');
        userBubble.style.cssText = 'background:#2d5a27; color:white; padding:0.7rem 1rem; border-radius:12px; border-bottom-right-radius:4px; font-size:0.85rem; max-width:85%; align-self:flex-end; margin-left:auto;';
        userBubble.innerText = text;
        container.appendChild(userBubble);
        input.value = '';
        container.scrollTop = container.scrollHeight;

        // Render thinking bubble
        const botBubble = document.createElement('div');
        botBubble.style.cssText = 'background:#e8f5e9; color:#2d5a27; padding:0.7rem 1rem; border-radius:12px; border-bottom-left-radius:4px; font-size:0.85rem; max-width:85%;';
        botBubble.innerHTML = `<i>${window.i18n.t('audio_preparing')}</i>`;
        container.appendChild(botBubble);
        container.scrollTop = container.scrollHeight;

        try {
            const lang = window.i18n ? window.i18n.currentLang : 'zh-TW';
            const answer = await api.askBot(text, this.merchants, lang);
            botBubble.innerHTML = answer;
        } catch (e) {
            botBubble.innerHTML = e.message;
        }
        container.scrollTop = container.scrollHeight;
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
        statusDiv.innerHTML = `<i>${window.i18n.t('audio_preparing')}</i>`;
        statusDiv.style.display = 'block';

        try {
            // Fetch fresh data directly to avoid cache issues
            const merchant = await api.getMerchant(id);
            if (!merchant) throw new Error(window.i18n.t('info_not_provided'));

            const lang = window.i18n.currentLang;
            statusDiv.innerHTML = `<i>${window.i18n.t('audio_generating')}</i>`;
            
            const script = await api.generateAudioScript(merchant, persona, lang);
            
            statusDiv.innerHTML = `<div class="audio-waves"><span></span><span></span><span></span><span></span></div> ${window.i18n.t('audio_playing')}`;
            
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
