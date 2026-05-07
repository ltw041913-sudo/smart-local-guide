const translations = {
    'zh-TW': {
        nav_brand: '在地導覽平台',
        nav_home: '首頁',
        map_title: '探索地圖',
        search_placeholder: '搜尋店家...',
        btn_back: '← 返回列表',
        announcement_title: '📢 店主公告',
        story_title: '📖 品牌故事',
        btn_add_merchant: '✨ 註冊新店家',
        hero_badge: '✨ 嚴選在地故事'
    },
    'en': {
        nav_brand: 'Local Guide',
        nav_home: 'Home',
        map_title: 'Explore Map',
        search_placeholder: 'Search stores...',
        btn_back: '← Back',
        announcement_title: '📢 Announcement',
        story_title: '📖 Store Story',
        btn_add_merchant: '＋ Add Store'
    },
    'ja': {
        nav_brand: 'ローカルガイド',
        nav_home: 'ホーム',
        map_title: '探索マップ',
        search_placeholder: '店舗を検索...',
        btn_back: '← 戻る',
        announcement_title: '📢 お知らせ',
        story_title: '📖 物語',
        btn_add_merchant: '＋ 店舗登録'
    }
};

window.i18n = {
    currentLang: 'zh-TW',
    t: function(key) {
        return translations[this.currentLang][key] || key;
    },
    setLang: function(lang) {
        if (translations[lang]) this.currentLang = lang;
    }
};
