const translations = {
    'zh-TW': {
        // Nav
        nav_brand: '在地導覽平台',
        nav_home: '首頁',
        // Hero
        hero_badge: '✨ 嚴選在地故事',
        // Search & Sidebar
        search_placeholder: '搜尋店名、類別或標籤...',
        btn_trip_planner: '🤖 開始 AI 智慧規劃行程',
        btn_trip_planner_exit: '❌ 退出規劃模式',
        btn_add_merchant: '✨ 註冊新店家',
        // Trip selection bar
        trip_selected_count: '已選定',
        trip_selected_unit: '個地點',
        btn_generate_trip: '✨ 生成深度旅遊路線',
        // Map
        map_title: '📍 探索導覽地圖',
        map_subtitle: '發掘您周邊的文化亮點與職人故事',
        // Detail View
        btn_back: '← 返回列表',
        announcement_title: '📢 店主公告',
        announcement_default: '歡迎光臨！',
        audio_title: '🎧 AI 智慧語音導覽',
        btn_audio_elder: '👴 耆老講古',
        btn_audio_youth: '🧒 青年導覽',
        btn_audio_pro: '🎓 專業解說',
        btn_audio_stop: '停止',
        story_title: '📖 品牌故事',
        info_title: '📍 店家資訊',
        info_address: '地址',
        info_hours: '營業時間',
        info_category: '類別',
        info_not_provided: '未提供',
        btn_edit_merchant: '⚙️ 編輯店家資訊',
        // Add Modal
        modal_add_title: '註冊新店家',
        label_name: '店名：',
        label_category: '類別：',
        label_address: '地址：',
        label_hours: '營業：',
        label_panorama: '上傳 360 全景照片：',
        panorama_type_single: '單張全景照片',
        panorama_type_cubemap: '立方體投影 (6面)',
        label_cubemap_front: '前 (Front)',
        label_cubemap_back: '後 (Back)',
        label_cubemap_left: '左 (Left)',
        label_cubemap_right: '右 (Right)',
        label_cubemap_up: '上 (Up)',
        label_cubemap_down: '下 (Down)',
        btn_add_submit: '✨ 確認註冊',
        // Edit Modal
        modal_edit_title: '編輯店家',
        label_announcement: '公告：',
        label_description: '描述：',
        btn_ai_refine: '✨ AI 潤飾文案（將公告轉化為文化故事）',
        btn_save: '💾 儲存變更',
        // Trip Modal
        modal_trip_title: '📅 AI 智慧行程規劃',
        trip_loading: '正在為您規劃深度旅遊行程...',
        btn_trip_done: '完成',
        // AI Chat
        chat_title: '🤖 AI 在地嚮導',
        chat_subtitle: '可以詢問任何在地問題！',
        chat_close: '✕',
        chat_welcome: '你好！我是 AI 在地嚮導，可以問我：「哪間咖啡廳還有開？」或「推薦適合親子的店家」等問題！',
        chat_placeholder: '輸入您的問題...',
        btn_chat_send: '發送',
        // Audio status
        audio_preparing: '正在準備語音導覽內容...',
        audio_generating: '正在透過 AI 生成導覽劇本...',
        audio_playing: '正在為您導覽中...',
        // Alerts
        alert_min_2: '請至少勾選 2 個地點後再生成行程',
        alert_required_fields: '請填寫必要欄位',
        alert_refine_empty: '請先輸入公告內容，再使用 AI 潤飾功能',
        alert_refine_loading: '✨ AI 潤飾中...',
        alert_backend_error: '⚠️ 無法連線至後端伺服器，請確認後端程式是否已啟動 (Port 3000)',
        // User roles
        role_guest: '訪客',
        role_traveler: '遊客 John',
        role_cafe_owner: '咖啡館主',
        role_store_owner: '文創店主',
    },
    'en': {
        // Nav
        nav_brand: 'Local Guide',
        nav_home: 'Home',
        // Hero
        hero_badge: '✨ Curated Local Stories',
        // Search & Sidebar
        search_placeholder: 'Search stores, categories or tags...',
        btn_trip_planner: '🤖 Start AI Trip Planning',
        btn_trip_planner_exit: '❌ Exit Planning Mode',
        btn_add_merchant: '✨ Register Store',
        // Trip selection bar
        trip_selected_count: 'Selected',
        trip_selected_unit: 'places',
        btn_generate_trip: '✨ Generate Deep Travel Route',
        // Map
        map_title: '📍 Explore Map',
        map_subtitle: 'Discover cultural highlights and artisan stories near you',
        // Detail View
        btn_back: '← Back to List',
        announcement_title: '📢 Owner Announcement',
        announcement_default: 'Welcome!',
        audio_title: '🎧 AI Audio Guide',
        btn_audio_elder: '👴 Elder\'s Tale',
        btn_audio_youth: '🧒 Youth Guide',
        btn_audio_pro: '🎓 Expert Guide',
        btn_audio_stop: 'Stop',
        story_title: '📖 Brand Story',
        info_title: '📍 Store Info',
        info_address: 'Address',
        info_hours: 'Hours',
        info_category: 'Category',
        info_not_provided: 'Not provided',
        btn_edit_merchant: '⚙️ Edit Store Info',
        // Add Modal
        modal_add_title: 'Register New Store',
        label_name: 'Name:',
        label_category: 'Category:',
        label_address: 'Address:',
        label_hours: 'Hours:',
        label_panorama: 'Upload 360 Panorama Photo:',
        panorama_type_single: 'Single Panorama',
        panorama_type_cubemap: 'Cubemap (6 faces)',
        label_cubemap_front: 'Front',
        label_cubemap_back: 'Back',
        label_cubemap_left: 'Left',
        label_cubemap_right: 'Right',
        label_cubemap_up: 'Up',
        label_cubemap_down: 'Down',
        btn_add_submit: '✨ Confirm Registration',
        // Edit Modal
        modal_edit_title: 'Edit Store',
        label_announcement: 'Announcement:',
        label_description: 'Description:',
        btn_ai_refine: '✨ AI Polish (Turn announcement into a cultural story)',
        btn_save: '💾 Save Changes',
        // Trip Modal
        modal_trip_title: '📅 AI Trip Planner',
        trip_loading: 'Planning your deep travel itinerary...',
        btn_trip_done: 'Done',
        // AI Chat
        chat_title: '🤖 AI Local Guide',
        chat_subtitle: 'Ask me anything about local spots!',
        chat_close: '✕',
        chat_welcome: 'Hello! I\'m your AI Local Guide. Ask me: "Which cafes are still open?" or "Recommend family-friendly stores"!',
        chat_placeholder: 'Type your question...',
        btn_chat_send: 'Send',
        // Audio status
        audio_preparing: 'Preparing audio guide content...',
        audio_generating: 'AI is generating your guide script...',
        audio_playing: 'Guiding you now...',
        // Alerts
        alert_min_2: 'Please select at least 2 places to generate a trip',
        alert_required_fields: 'Please fill in required fields',
        alert_refine_empty: 'Please enter announcement content first before using AI polish',
        alert_refine_loading: '✨ AI Polishing...',
        alert_backend_error: '⚠️ Cannot connect to backend. Please make sure the server is running (Port 3000)',
        // User roles
        role_guest: 'Guest',
        role_traveler: 'Traveler John',
        role_cafe_owner: 'Cafe Owner',
        role_store_owner: 'Store Owner',
    },
    'ja': {
        // Nav
        nav_brand: 'ローカルガイド',
        nav_home: 'ホーム',
        // Hero
        hero_badge: '✨ 厳選されたローカルストーリー',
        // Search & Sidebar
        search_placeholder: '店舗名・カテゴリ・タグで検索...',
        btn_trip_planner: '🤖 AI旅程プランニングを開始',
        btn_trip_planner_exit: '❌ プランニングモードを終了',
        btn_add_merchant: '✨ 新規店舗登録',
        // Trip selection bar
        trip_selected_count: '選択済み',
        trip_selected_unit: 'か所',
        btn_generate_trip: '✨ 深度旅行ルートを生成',
        // Map
        map_title: '📍 探索マップ',
        map_subtitle: '周辺の文化スポットや職人ストーリーを発見しよう',
        // Detail View
        btn_back: '← リストに戻る',
        announcement_title: '📢 オーナーからのお知らせ',
        announcement_default: 'ようこそ！',
        audio_title: '🎧 AI音声ガイド',
        btn_audio_elder: '👴 長老の語り',
        btn_audio_youth: '🧒 若者ガイド',
        btn_audio_pro: '🎓 専門解説',
        btn_audio_stop: '停止',
        story_title: '📖 ブランドストーリー',
        info_title: '📍 店舗情報',
        info_address: '住所',
        info_hours: '営業時間',
        info_category: 'カテゴリ',
        info_not_provided: '未提供',
        btn_edit_merchant: '⚙️ 店舗情報を編集',
        // Add Modal
        modal_add_title: '新規店舗を登録',
        label_name: '店舗名：',
        label_category: 'カテゴリ：',
        label_address: '住所：',
        label_hours: '営業時間：',
        label_panorama: '360全景写真をアップロード：',
        panorama_type_single: '単一全景写真',
        panorama_type_cubemap: 'キューブマップ (6面)',
        label_cubemap_front: '前 (Front)',
        label_cubemap_back: '後 (Back)',
        label_cubemap_left: '左 (Left)',
        label_cubemap_right: '右 (Right)',
        label_cubemap_up: '上 (Up)',
        label_cubemap_down: '下 (Down)',
        btn_add_submit: '✨ 登録を確認',
        // Edit Modal
        modal_edit_title: '店舗を編集',
        label_announcement: 'お知らせ：',
        label_description: '説明：',
        btn_ai_refine: '✨ AI文案磨き（お知らせを文化的なストーリーに）',
        btn_save: '💾 変更を保存',
        // Trip Modal
        modal_trip_title: '📅 AI旅程プランナー',
        trip_loading: '深度旅行スケジュールを計画中...',
        btn_trip_done: '完了',
        // AI Chat
        chat_title: '🤖 AIローカルガイド',
        chat_subtitle: 'ローカルなことなら何でも聞いてください！',
        chat_close: '✕',
        chat_welcome: 'こんにちは！AIローカルガイドです。「どのカフェがまだ開いていますか？」や「ファミリー向けのお店を教えて」など何でも聞いてください！',
        chat_placeholder: '質問を入力してください...',
        btn_chat_send: '送信',
        // Audio status
        audio_preparing: '音声ガイドの内容を準備中...',
        audio_generating: 'AIがガイドスクリプトを生成中...',
        audio_playing: 'ガイド中...',
        // Alerts
        alert_min_2: '旅程を生成するには少なくとも2か所を選択してください',
        alert_required_fields: '必須項目を入力してください',
        alert_refine_empty: 'AI磨き機能を使う前にお知らせ内容を入力してください',
        alert_refine_loading: '✨ AI磨き中...',
        alert_backend_error: '⚠️ バックエンドサーバーに接続できません。サーバーが起動しているか確認してください (Port 3000)',
        // User roles
        role_guest: 'ゲスト',
        role_traveler: '旅行者 John',
        role_cafe_owner: 'カフェオーナー',
        role_store_owner: '文創ショップオーナー',
    }
};

window.i18n = {
    currentLang: 'zh-TW',
    t: function(key) {
        return (translations[this.currentLang] && translations[this.currentLang][key]) 
            || (translations['zh-TW'] && translations['zh-TW'][key]) 
            || key;
    },
    setLang: function(lang) {
        if (translations[lang]) this.currentLang = lang;
    }
};
