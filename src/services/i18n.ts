import { Language } from '../types/game';

type TranslationKey =
  | 'game_title'
  | 'game_subtitle'
  | 'play'
  | 'play_now'
  | 'play_level'
  | 'levels'
  | 'worlds'
  | 'collection'
  | 'achievements'
  | 'daily_challenge'
  | 'endless_mode'
  | 'endless_desc'
  | 'settings'
  | 'balls_skins'
  | 'balls_desc'
  | 'language'
  | 'turkish'
  | 'english'
  | 'sound_fx'
  | 'sound_desc'
  | 'music'
  | 'music_desc'
  | 'vibration'
  | 'vibration_desc'
  | 'graphics'
  | 'sensitivity'
  | 'reset_data'
  | 'reset_confirm'
  | 'back'
  | 'done'
  | 'cancel'
  | 'pause'
  | 'resume'
  | 'restart'
  | 'main_menu'
  | 'game_over'
  | 'game_over_subtitle'
  | 'try_again'
  | 'level_won'
  | 'level_won_desc'
  | 'next_level'
  | 'claim_rewards'
  | 'stats_distance'
  | 'stats_coins'
  | 'stats_fragments'
  | 'stats_energy'
  | 'stats_speed'
  | 'stats_lives'
  | 'level_selector_title'
  | 'unlocked_levels'
  | 'level_status_completed'
  | 'level_status_active'
  | 'level_status_locked'
  | 'level_requirement'
  | 'how_to_play_title'
  | 'how_to_play_steer'
  | 'how_to_play_jump'
  | 'how_to_play_speed'
  | 'how_to_play_coins'
  | 'got_it'
  | 'alert_ball_lost_edge'
  | 'alert_ball_lost_pit'
  | 'alert_all_balls_lost'
  | 'alert_fell_in_pit'
  | 'alert_shield_protected'
  | 'page_prev'
  | 'page_next'
  | 'page_indicator'
  | 'desktop_controls'
  | 'tab_evolutions'
  | 'tab_trails'
  | 'equipped'
  | 'locked'
  | 'equip_btn'
  | 'unlock_btn'
  | 'need_fragments'
  | 'cooldown_short'
  | 'compendium_title'
  | 'cat_energy'
  | 'cat_fragments'
  | 'cat_events'
  | 'cat_worlds'
  | 'cat_balls'
  | 'harvested'
  | 'road_memory_influence'
  | 'luminous_fragments_title'
  | 'luminous_fragments_desc'
  | 'total_discovered'
  | 'fragments_spent'
  | 'unknown_anomaly'
  | 'anomaly_desc_hidden'
  | 'worlds_title'
  | 'worlds_subtitle'
  | 'discovered_badge'
  | 'primary_resonance'
  | 'req_distance'
  | 'best_exploration'
  | 'achievements_title'
  | 'achievements_subtitle'
  | 'ach_completed'
  | 'ach_claim'
  | 'ach_claimed'
  | 'daily_title'
  | 'daily_progress'
  | 'daily_reward'
  | 'daily_bonus'
  | 'daily_claimed'
  | 'daily_claim_btn'
  | 'daily_in_progress'
  | 'close_btn';

export const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = {
  tr: {
    game_title: 'ROLLVERSE 3D',
    game_subtitle: 'Hızlı Yuvarlanan Toplar Macerası',
    play: 'OYNA',
    play_now: 'HEMEN OYNA',
    play_level: 'BU BÖLÜMÜ OYNA',
    levels: 'BÖLÜMLER (1-100)',
    worlds: 'DÜNYALAR',
    collection: 'KOLEKSİYON',
    achievements: 'BAŞARILAR',
    daily_challenge: 'GÜNLÜK GÖREV',
    endless_mode: 'SONSUZ MOD',
    endless_desc: 'Sonsuz yolda rekor mesafeye ulaş!',
    settings: 'AYARLAR',
    balls_skins: 'TOPLAR & KOSTÜMLER',
    balls_desc: 'Özel yetenekli topları aç ve geliştir',
    language: 'Dil Seçeneği',
    turkish: 'Türkçe',
    english: 'English',
    sound_fx: 'Ses Efektleri',
    sound_desc: 'Yuvarlanma, kristal ve çarpışma sesleri',
    music: 'Arka Plan Müziği',
    music_desc: 'Ortama göre değişen dinamik müzikler',
    vibration: 'Titreşim / Dokunsal',
    vibration_desc: 'Mobil cihazlarda dokunsal titreşim',
    graphics: 'Grafik Kalitesi',
    sensitivity: 'Direksiyon Hassasiyeti',
    reset_data: 'Tüm İlerlemeyi Sıfırla',
    reset_confirm: 'Tüm ilerlemeniz silinecektir. Emin misiniz?',
    back: 'GERİ',
    done: 'TAMAM',
    cancel: 'İPTAL',
    pause: 'DURAKLAT',
    resume: 'DEVAM ET',
    restart: 'YENİDEN BAŞLA',
    main_menu: 'ANA MENÜ',
    game_over: 'OYUN BİTTİ',
    game_over_subtitle: 'Tüm toplar kaybedildi!',
    try_again: 'TEKRAR DENE',
    level_won: 'BÖLÜM TAMAMLANDI!',
    level_won_desc: 'Harika iş! Yeni bölüme geçmeye hazırsın.',
    next_level: 'SONRAKİ BÖLÜM',
    claim_rewards: 'Ödülleri Al',
    stats_distance: 'Mesafe',
    stats_coins: 'Altın',
    stats_fragments: 'Kristal',
    stats_energy: 'Enerji',
    stats_speed: 'Hız',
    stats_lives: 'Top Sayısı',
    level_selector_title: '100 BÖLÜMLÜK MACERA',
    unlocked_levels: 'Açık Seviyeler',
    level_status_completed: 'Tamamlandı',
    level_status_active: 'Aktif Bölüm',
    level_status_locked: 'Kilitli',
    level_requirement: 'Önceki bölümü tamamla',
    how_to_play_title: 'Rolling Balls 3D Nasıl Oynanır?',
    how_to_play_steer: 'A / D veya ekrana dokunarak yön verin.',
    how_to_play_jump: 'BOŞLUK (SPACE) ile zıplayın, çukurların ve engellerin üzerinden uçun!',
    how_to_play_speed: 'W / S ile hızlanın veya dar raylarda yavaşlayın.',
    how_to_play_coins: 'Altınları 🪙 toplayın, kenarlardan ve deliklerden sakının!',
    got_it: 'ANLADIM, BAŞLA!',
    alert_ball_lost_edge: '1 Top Kenardan Düştü!',
    alert_ball_lost_pit: '1 Top Çukura Düştü!',
    alert_all_balls_lost: '⚠️ TÜM TOPLAR KAYBEDİLDİ!',
    alert_fell_in_pit: '⚠️ ÇUKURA DÜŞTÜN!',
    alert_shield_protected: '🛡️ KALKAN ÇUKURDAN KORUDU!',
    page_prev: 'Önceki',
    page_next: 'Sonraki',
    page_indicator: 'Sayfa',
    desktop_controls: 'Masaüstü: [Yön Tuşları / WASD / Boşluk] • Mobil: [Dokun & Kaydır]',
    tab_evolutions: 'Toplar & Yetenekler',
    tab_trails: 'Kozmetik İzler',
    equipped: 'KUŞANILDI',
    locked: 'KİLİTLİ',
    equip_btn: 'Kullan / Kuşan',
    unlock_btn: 'Parça ile Aç',
    need_fragments: 'Parça Gerekli',
    cooldown_short: 'sn Bekleme',
    compendium_title: 'Koleksiyon Ansiklopedisi',
    cat_energy: 'Enerji Türleri',
    cat_fragments: 'Yol Parçaları',
    cat_events: 'Gizemli Olaylar',
    cat_worlds: 'Dünyalar',
    cat_balls: 'Top Formları',
    harvested: 'Toplandı',
    road_memory_influence: 'Yol Hafızası Etkisi',
    luminous_fragments_title: 'Işıltılı Yol Parçaları',
    luminous_fragments_desc: 'Kadim otoyolun kırılmış kristalize parçaları. Yüksek riskli yollar, gizli portallar ve uzun mesafe rekorları bu parçaları kazandırır. Yeni topları ve kozmetik izleri açmak için kullanın.',
    total_discovered: 'Toplam Bulunan',
    fragments_spent: 'Harcanan Kristal',
    unknown_anomaly: 'Bilinmeyen Anomali',
    anomaly_desc_hidden: 'Yol üzerinde henüz karşılaşılmamış gizemli bir uzay-zaman dalgalanması.',
    worlds_title: "Rollverse'in Bilinen Dünyaları",
    worlds_subtitle: 'Dinamik yollarda ve portallarda ilerleyerek altı kadim dünyayı keşfedin.',
    discovered_badge: 'Keşfedildi',
    primary_resonance: 'Birincil Enerji Rezonansı:',
    req_distance: 'Gerekli Mesafe',
    best_exploration: 'En İyi Mesafe',
    achievements_title: 'Yolun Kilometre Taşları',
    achievements_subtitle: 'Özel hedefleri tamamlayarak bonus Yol Kristalleri toplayın.',
    ach_completed: 'Tamamlandı',
    ach_claim: 'Ödülü Al',
    ach_claimed: 'Alındı',
    daily_title: 'Günün Görevi',
    daily_progress: 'Mevcut İlerleme',
    daily_reward: 'Ödül',
    daily_bonus: 'Bonus',
    daily_claimed: 'Günlük Ödül Alındı! Gece Yarısı Yenilenir.',
    daily_claim_btn: 'Günün Ödülünü Al!',
    daily_in_progress: 'Devam Ediyor – Tamamlamak İçin Yolda İlerle!',
    close_btn: 'Kapat'
  },
  en: {
    game_title: 'ROLLVERSE 3D',
    game_subtitle: 'High-Speed Rolling Balls Odyssey',
    play: 'PLAY',
    play_now: 'PLAY NOW',
    play_level: 'PLAY LEVEL',
    levels: 'LEVELS (1-100)',
    worlds: 'WORLDS',
    collection: 'COLLECTION',
    achievements: 'ACHIEVEMENTS',
    daily_challenge: 'DAILY MISSION',
    endless_mode: 'ENDLESS MODE',
    endless_desc: 'Reach record distances on infinite highways!',
    settings: 'SETTINGS',
    balls_skins: 'BALLS & SKINS',
    balls_desc: 'Unlock and evolve balls with unique powers',
    language: 'Language',
    turkish: 'Türkçe',
    english: 'English',
    sound_fx: 'Sound Effects',
    sound_desc: 'Rolling, crystal chimes, impacts',
    music: 'Background Music',
    music_desc: 'Dynamic procedural world soundtrack',
    vibration: 'Vibration / Haptics',
    vibration_desc: 'Mobile tactile vibration feedback',
    graphics: 'Graphics Quality',
    sensitivity: 'Steering Sensitivity',
    reset_data: 'Reset All Progress',
    reset_confirm: 'All your unlocked progress will be wiped. Are you sure?',
    back: 'BACK',
    done: 'DONE',
    cancel: 'CANCEL',
    pause: 'PAUSE',
    resume: 'RESUME',
    restart: 'RESTART',
    main_menu: 'MAIN MENU',
    game_over: 'GAME OVER',
    game_over_subtitle: 'All rolling balls were lost!',
    try_again: 'TRY AGAIN',
    level_won: 'LEVEL COMPLETED!',
    level_won_desc: 'Fantastic roll! Ready for the next stage.',
    next_level: 'NEXT LEVEL',
    claim_rewards: 'Claim Rewards',
    stats_distance: 'Distance',
    stats_coins: 'Coins',
    stats_fragments: 'Crystals',
    stats_energy: 'Energy',
    stats_speed: 'Speed',
    stats_lives: 'Balls Squad',
    level_selector_title: '100-LEVEL ODYSSEY',
    unlocked_levels: 'Unlocked Levels',
    level_status_completed: 'Completed',
    level_status_active: 'Active Level',
    level_status_locked: 'Locked',
    level_requirement: 'Complete previous level',
    how_to_play_title: 'How to Play Rolling Balls 3D',
    how_to_play_steer: 'Use A / D or swipe screen to steer squad.',
    how_to_play_jump: 'Press SPACE to jump over pits and high obstacles!',
    how_to_play_speed: 'W / S to accelerate or brake on narrow rails.',
    how_to_play_coins: 'Collect gold coins 🪙 and avoid edge drops & pits!',
    got_it: 'GOT IT, START!',
    alert_ball_lost_edge: '1 Ball fell off the edge!',
    alert_ball_lost_pit: '1 Ball dropped into a pit!',
    alert_all_balls_lost: '⚠️ ALL BALLS LOST!',
    alert_fell_in_pit: '⚠️ FELL INTO PIT!',
    alert_shield_protected: '🛡️ SHIELD SAVED FROM PIT!',
    page_prev: 'Prev',
    page_next: 'Next',
    page_indicator: 'Page',
    desktop_controls: 'Desktop: [Arrow Keys / WASD / Space] • Mobile: [Touch & Swipe]',
    tab_evolutions: 'Balls & Abilities',
    tab_trails: 'Cosmetic Trails',
    equipped: 'EQUIPPED',
    locked: 'LOCKED',
    equip_btn: 'Equip Core',
    unlock_btn: 'Unlock with Fragments',
    need_fragments: 'Fragments Needed',
    cooldown_short: 's CD',
    compendium_title: 'Compendium',
    cat_energy: 'Energy Types',
    cat_fragments: 'Road Fragments',
    cat_events: 'Mystery Events',
    cat_worlds: 'Realms',
    cat_balls: 'Core Forms',
    harvested: 'Harvested',
    road_memory_influence: 'Road Memory Influence',
    luminous_fragments_title: 'Luminous Road Fragments',
    luminous_fragments_desc: 'Shattered remnants of the primordial highway. High-risk routes, secret portals, and long-distance milestones harbor these crystalline fragments. Use them to unlock advanced Ball Evolutions, Worlds, and Trails.',
    total_discovered: 'Total Discovered',
    fragments_spent: 'Fragments Spent',
    unknown_anomaly: 'Unknown Anomaly',
    anomaly_desc_hidden: 'A bizarre spacetime ripple waiting to be encountered along the road.',
    worlds_title: 'Known Realms of Rollverse',
    worlds_subtitle: 'Traverse the dynamic roads and dimensional portals to discover all six primordial realms.',
    discovered_badge: 'Discovered',
    primary_resonance: 'Primary Resonance:',
    req_distance: 'Req. Distance',
    best_exploration: 'Best Exploration',
    achievements_title: 'Milestones of the Road',
    achievements_subtitle: 'Complete daring feats to harvest bonus Road Fragments.',
    ach_completed: 'Completed',
    ach_claim: 'Claim',
    ach_claimed: 'Claimed',
    daily_title: 'Daily Directive',
    daily_progress: 'Current Progress',
    daily_reward: 'Reward',
    daily_bonus: 'Bonus',
    daily_claimed: 'Daily Reward Claimed! Resets at Midnight.',
    daily_claim_btn: 'Claim Daily Bounty!',
    daily_in_progress: 'In Progress – Roll on the Road to Complete!',
    close_btn: 'Close'
  }
};

// Turkish dictionary for Energy Configs
export const ENERGY_CONFIGS_TR: Record<string, {
  name: string;
  description: string;
  influence: string;
}> = {
  BLUE: {
    name: 'Su Enerjisi',
    description: 'Topun enerjisini tazeleyen, dönüşleri ve yuvarlanmayı yumuşatan yatıştırıcı su akımları.',
    influence: 'Kristal su köprüleri, akıcı virajlar ve net buz pistleri oluşturur.'
  },
  RED: {
    name: 'Ateş Enerjisi',
    description: 'Yıkıcı hızı artıran ve lav hasarına karşı direnç sağlayan termal alev gücü.',
    influence: 'Volkanik köprüler, magma yarıkları ve termal hız kanalları meydana getirir.'
  },
  GREEN: {
    name: 'Doğa Enerjisi',
    description: 'Daha geniş güvenli yollar ve organik hızlandırıcılar inşa eden canlı biyo-rezonans.',
    influence: 'Geniş orman köprüleri, yeşil hız koridorları ve canlı otoyollar filizlendirir.'
  },
  PURPLE: {
    name: 'Kozmik Enerji',
    description: 'Uzay-zaman dalgalanması yaratarak gizli portalları ve yıldız köprülerini açığa çıkaran boyut enerjisi.',
    influence: 'Boyut yarıkları, yıldızlı köprüler ve ışınlanma geçitleri üretir.'
  },
  YELLOW: {
    name: 'Elektrik Enerjisi',
    description: 'Anlık itici güç sağlayan ve kapıları manyetize eden yüksek voltajlı elektrik akımı.',
    influence: 'Elektrikli iletken raylar, yıldırım kapıları ve süper akım hatları kurar.'
  }
};

// Turkish dictionary for Ball Evolutions
export const BALL_EVOLUTIONS_TR: Record<string, {
  name: string;
  subtitle: string;
  description: string;
  abilityName: string;
  abilityDescription: string;
  specialMechanic: string;
}> = {
  NORMAL_CORE: {
    name: '8 Numaralı Bilardo Topu',
    subtitle: 'Klasik Siyah Top',
    description: 'Efsanevi siyah 8 numaralı bilardo topu. Mükemmel dengeli ve hassas yol tutuşu.',
    abilityName: 'Kinetik İtme',
    abilityDescription: 'Geçici kararlılık sağlayarak yön hakimiyetini artırır.',
    specialMechanic: 'Tüm zeminlerde standart dengeli kontrol.'
  },
  ENERGY_CORE: {
    name: 'Futbol Topu',
    subtitle: 'Klasik FIFA Meşin Yuvarlak',
    description: 'Siyah beyaz beşgen dikişli klasik futbol topu. Harika sekme ve aerodinamik yapı.',
    abilityName: 'Enerji Dalgası',
    abilityDescription: '+15 anında Enerji yeniler ve hafif darbeleri emen koruyucu bir aura yaratır.',
    specialMechanic: 'Yüksek enerji tutuşu ile ekstra hayatta kalma avantajı.'
  },
  MAGNETIC_CORE: {
    name: 'Basketbol Topu',
    subtitle: 'Pota Avcısı',
    description: 'Yüksek zemin tutuşlu pürüzlü turuncu kauçuk gövde ve siyah kanal çizgileri.',
    abilityName: 'Girdap Mıknatısı',
    abilityDescription: '6 saniye boyunca etraftaki tüm kristalleri, altınları ve parçaları kendine çeker.',
    specialMechanic: 'Tüm toplanabilir eşyalar için 2.5 kat daha geniş pasif mıknatıs menzili.'
  },
  BEACH_BALL: {
    name: 'Plaj Topu',
    subtitle: 'Karnaval Çizgileri',
    description: 'Kırmızı, sarı, mavi ve yeşil parti çizgileri. Hafif, kıvrak ve yüksek zıplayışlı!',
    abilityName: 'Süper Sıçrama',
    abilityDescription: '5 saniye boyunca havada süzülme ve devasa zıplama gücü kazandırır.',
    specialMechanic: 'Daha yüksek zıplama yayları ve yumuşak iniş kontrolü.'
  },
  BOWLING_BALL: {
    name: 'Bowling Topu',
    subtitle: 'Ağır Strike Topu',
    description: '3 parmak delikli ağır gece mavisi küre. Karşısına çıkan engelleri kolayca paramparça eder.',
    abilityName: 'Ağır Yuvarlanış',
    abilityDescription: 'Durdurulamaz ağır bir gülle haline gelerek engelleri parçalar.',
    specialMechanic: 'Ahşap kasaları ve bariyerleri hız kaybetmeden ezip geçer.'
  },
  FIRE_CORE: {
    name: 'Magma Küresi',
    subtitle: 'Ateşli Meteor',
    description: 'Pırıl pırıl parlayan lav çatlakları ve akkor magma zırhı. Ateşe ve lavlara bağışıklı!',
    abilityName: 'Alev Hücumu',
    abilityDescription: '4 saniye boyunca alev topuna dönüşerek fiziksel engelleri hasar almadan yıkar.',
    specialMechanic: 'Erimiş yollarda pasif bağışıklık ve lav engellerini buharlaştırma.'
  },
  ELECTRIC_CORE: {
    name: 'Siber Tron',
    subtitle: 'Neon Devresi',
    description: 'Mavi ve sarı neon devre hatlarıyla kaplı titanyum küre.',
    abilityName: 'Aşırı Yükleme Kıvılcımı',
    abilityDescription: 'İleriye doğru anlık atılım yaparak sektördeki tüm elektrikli kapıları etkisiz hale getirir.',
    specialMechanic: 'Elektrik kapılarını hızlandırıcı rampalara dönüştürür.'
  },
  GOLDEN_BALL: {
    name: 'Altın Şampiyon Topu',
    subtitle: '24 Ayar Saf Altın',
    description: 'Yıldız işlemeli saf cilalı 24K ayna altını. Çift kat altın ve kristal kazandırır!',
    abilityName: 'Midas Dokunuşu',
    abilityDescription: '5 saniye boyunca ilerideki tüm engelleri altın paralara dönüştürür.',
    specialMechanic: 'Toplanan tüm altın ve kristallerde 2 kat çarpan.'
  },
  COSMIC_CORE: {
    name: 'Galaksi Bilyesi',
    subtitle: 'Nebula Tekilliği',
    description: 'Yıldız nebulasında dövülmüş kozmik bilye. Yolun fiziksel sınırlarını aşar.',
    abilityName: 'Boyut Fazı',
    abilityDescription: '5 saniye boyunca engellerin içinden hasarsız geçer ve gizli köprüleri açar.',
    specialMechanic: 'Gizli uzay yollarına girebilir ve havada asılı kalarak ölümcül çukurları aşar.'
  }
};

// Turkish dictionary for Cosmetic Trails
export const COSMETIC_TRAILS_TR: Record<string, { name: string }> = {
  DEFAULT_TRAIL: { name: 'Yıldız Işığı Buharı' },
  ENERGY_TRAIL: { name: 'Turkuaz Akım' },
  FIRE_TRAIL: { name: 'Güneş Kıvılcımları' },
  ELECTRIC_TRAIL: { name: 'Yıldırım Arkı' },
  COSMIC_TRAIL: { name: 'Nebula Yıldız Tozu' },
  GOLDEN_TRAIL: { name: 'Göksel Altın İzi' }
};

// Turkish dictionary for Worlds
export const WORLDS_TR: Record<string, { name: string; title: string; description: string }> = {
  GREEN_VALLEY: {
    name: 'Yeşil Vadi',
    title: 'Başlangıçlar Beşiği',
    description: 'Güneşli gökyüzü, zümrüt çayırlar ve huzurlu tepeler arasında uzanan başlangıç vadisi.'
  },
  LOST_DESERT: {
    name: 'Kayıp Çöl',
    title: 'Kadim Kumulların Yolu',
    description: 'Kızgın kum tepeleri, antik heykeller ve altın sarısı kum fırtınaları.'
  },
  VOLCANO_LAND: {
    name: 'Volkan Diyarı',
    title: 'Erimiş Obsidyen Omurgası',
    description: 'Ateş saçan lav gayzerleri ve akkor köprülerle bezeli yüksek sıcaklık otoyolu.'
  },
  FROZEN_REALM: {
    name: 'Buzul Alemi',
    title: 'Kutup Aurorası',
    description: 'Işıltılı kutup ışıkları altında parıldayan safir buz pistleri.'
  },
  NEON_CITY: {
    name: 'Neon Şehir',
    title: 'Siber Nabız Otoyolu',
    description: 'Gökdelenlerin arasında asılı duran mor ve camgöbeği lazerli siber cadde.'
  },
  COSMIC_VOID: {
    name: 'Kozmik Boşluk',
    title: 'Sonsuzluğun Sınırı',
    description: 'Ağırlıksız yıldız tozu şeritleri ve yerçekimsiz galaktik yarış alanı.'
  }
};

// Turkish dictionary for Mystery Events
export const MYSTERY_EVENTS_TR: Record<string, { name: string; description: string }> = {
  GRAVITY_WELL: {
    name: 'Yerçekimi Anomalisi',
    description: 'Topunuzu havaya kaldıran ve dar raylarda süzülme sağlayan yerçekimsiz dalgalanma.'
  },
  ENERGY_SURGE: {
    name: 'Kozmik Enerji Patlaması',
    description: 'Yol üzerindeki tüm enerjileri katlayan ve hızı artıran süper şarj alanı.'
  },
  TIME_DILATION: {
    name: 'Zaman Bükülmesi',
    description: 'Engellerin yavaşladığı ve reflekslerin mükemmelleştiği zaman alanı.'
  },
  DIMENSIONAL_PORTAL: {
    name: 'Boyut Geçidi',
    description: 'Sizi anında bilinmeyen yeni bir dünyaya ışınlayan dönen solucan deliği.'
  }
};

// Turkish dictionary for Achievements
export const ACHIEVEMENTS_TR: Record<string, { title: string; description: string }> = {
  FIRST_ROLL: {
    title: 'İlk Yuvarlanış',
    description: 'Yolda en az 500 metre ilerleyin.'
  },
  LONG_JOURNEY: {
    title: 'Uzun Yol Gezgini',
    description: 'Toplamda 10.000 metre mesafe katedin.'
  },
  ROAD_MAKER: {
    title: 'Yol Ustası',
    description: 'Toplam 50 Yol Kristali parçası toplayın.'
  },
  RISK_TAKER: {
    title: 'Cesur Sürücü',
    description: '5 Yüksek Riskli yol ayrımını başarıyla geçin.'
  },
  COSMIC_TRAVELER: {
    title: 'Kozmik Şampiyon',
    description: 'Galaksi Bilyesi (Cosmic Core) topunu açın.'
  },
  EXPLORER: {
    title: 'Evren Kâşifi',
    description: '5 Gizemli Anomali veya Portal keşfedin.'
  }
};

let currentLanguage: Language = 'tr';

export const getLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('rollverse_lang');
    if (saved === 'tr' || saved === 'en') {
      currentLanguage = saved;
    }
  }
  return currentLanguage;
};

export const setLanguage = (lang: Language): void => {
  currentLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('rollverse_lang', lang);
    window.dispatchEvent(new CustomEvent('rollverse_language_changed', { detail: lang }));
  }
};

export const t = (key: TranslationKey): string => {
  const lang = getLanguage();
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.tr[key] || key;
};
