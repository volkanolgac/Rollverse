import { LevelInfo, WorldId } from '../types/game';

// Helper palettes of 100 distinct, radiant and vibrant road colors and matching environments
const VIBRANT_PALETTES: Array<{
  road: number;
  edge: number;
  fog: number;
  ambient: number;
  skyTop: string;
  skyBottom: string;
  worldId: WorldId;
  nameTr: string;
  nameEn: string;
  descTr: string;
  descEn: string;
}> = [
  // Levels 1-10: Emerald & Azure Starter Valley
  { road: 0x10b981, edge: 0x0284c7, fog: 0x7dd3fc, ambient: 0xfffae6, skyTop: '#0284c7', skyBottom: '#bae6fd', worldId: 'GREEN_VALLEY', nameTr: 'Zümrüt Vadi', nameEn: 'Emerald Valley', descTr: 'Maceranın ilk adımı! Yeşil vadide ilerle ve ilk portala ulaş.', descEn: 'First step of your adventure through lush emerald roads.' },
  { road: 0x06b6d4, edge: 0xf59e0b, fog: 0x67e8f9, ambient: 0xf0fdf4, skyTop: '#0369a1', skyBottom: '#a5f3fc', worldId: 'GREEN_VALLEY', nameTr: 'Turkuaz Nehir', nameEn: 'Turquoise River', descTr: 'Pırıl pırıl su kıyısı boyunca virajları ustalıkla al.', descEn: 'Steer along sparkling turquoise riverside highways.' },
  { road: 0x84cc16, edge: 0x0284c7, fog: 0x86efac, ambient: 0xfefce8, skyTop: '#0284c7', skyBottom: '#bbf7d0', worldId: 'GREEN_VALLEY', nameTr: 'Bahar Tepeleri', nameEn: 'Spring Hills', descTr: 'Canlı fıstık yeşili virajlarda hızını koru.', descEn: 'Hold high speeds across bright spring slopes.' },
  { road: 0x0ea5e9, edge: 0xfacc15, fog: 0x7dd3fc, ambient: 0xf8fafc, skyTop: '#0284c7', skyBottom: '#e0f2fe', worldId: 'GREEN_VALLEY', nameTr: 'Gökkuşağı Geçidi', nameEn: 'Rainbow Pass', descTr: 'Gökyüzü mavisi asma köprüde altınları topla.', descEn: 'Collect gold coins across the sky blue overpass.' },
  { road: 0x22c55e, edge: 0xf97316, fog: 0x86efac, ambient: 0xfffbeb, skyTop: '#059669', skyBottom: '#bae6fd', worldId: 'GREEN_VALLEY', nameTr: 'Yeşil Orman', nameEn: 'Verdant Forest', descTr: 'Yoğun orman açıklığındaki dar virajları fethet.', descEn: 'Navigate tight curves surrounded by lush greenery.' },
  { road: 0x14b8a6, edge: 0x38bdf8, fog: 0x5eead4, ambient: 0xf0fdfa, skyTop: '#0f766e', skyBottom: '#99f6e4', worldId: 'GREEN_VALLEY', nameTr: 'Akuamarin Yolu', nameEn: 'Aquamarine Trace', descTr: 'Kristal gibi parlayan yolda dengeni koru.', descEn: 'Balance your squad on radiant crystalline roads.' },
  { road: 0x3b82f6, edge: 0xfbbf24, fog: 0x93c5fd, ambient: 0xf8fafc, skyTop: '#1d4ed8', skyBottom: '#bfdbfe', worldId: 'GREEN_VALLEY', nameTr: 'Mavi Şelale', nameEn: 'Blue Cascade', descTr: 'Şelale vadisinde zıplama rampalarını kullan.', descEn: 'Use jump pads to leap over rushing river ravines.' },
  { road: 0x059669, edge: 0x38bdf8, fog: 0x6ee7b7, ambient: 0xf0fdf4, skyTop: '#047857', skyBottom: '#a7f3d0', worldId: 'GREEN_VALLEY', nameTr: 'Yeşim Platosu', nameEn: 'Jade Plateau', descTr: 'Geniş otoyolda tam gaz sürüş keyfini yaşa.', descEn: 'Full throttle sprint across the expansive jade plateau.' },
  { road: 0x0284c7, edge: 0x4ade80, fog: 0x7dd3fc, ambient: 0xf0f9ff, skyTop: '#0369a1', skyBottom: '#bae6fd', worldId: 'GREEN_VALLEY', nameTr: 'Güneşli Kanyon', nameEn: 'Sunny Canyon', descTr: 'Işıl ışıl güneş altında engellerden kaçın.', descEn: 'Dodge obstacles under glowing midday sunshine.' },
  { road: 0x10b981, edge: 0xfacc15, fog: 0x6ee7b7, ambient: 0xfffae6, skyTop: '#047857', skyBottom: '#bae6fd', worldId: 'GREEN_VALLEY', nameTr: 'Vadi Kapısı Finali', nameEn: 'Valley Gate Climax', descTr: 'Vadinin son büyük portalına doğru zıpla!', descEn: 'Leap into the massive dimensional portal to the desert!' },

  // Levels 11-20: Lost Golden Desert & Amber Dunes
  { road: 0xf59e0b, edge: 0x0284c7, fog: 0xfde68a, ambient: 0xfffbeb, skyTop: '#0284c7', skyBottom: '#fef08a', worldId: 'LOST_DESERT', nameTr: 'Altın Kumlar', nameEn: 'Golden Sands', descTr: 'Sarı kum fırtınalarının ortasında parlayan yol.', descEn: 'Shining golden highway amid majestic desert dunes.' },
  { road: 0xf97316, edge: 0x38bdf8, fog: 0xfed7aa, ambient: 0xffedd5, skyTop: '#ea580c', skyBottom: '#fed7aa', worldId: 'LOST_DESERT', nameTr: 'Kızıl Kumtaşı', nameEn: 'Red Sandstone', descTr: 'Sıcak kanyonlarda dar raylarda dikkatle ilerle.', descEn: 'Tread carefully on narrow rails across red canyons.' },
  { road: 0xeab308, edge: 0xec4899, fog: 0xfef08a, ambient: 0xfefce8, skyTop: '#ca8a04', skyBottom: '#fef9c3', worldId: 'LOST_DESERT', nameTr: 'Güneş Mabedi', nameEn: 'Sun Temple', descTr: 'Antik piramitlerin arasından geçen hızlı hat.', descEn: 'Speed between ancient monoliths and sunlit ruins.' },
  { road: 0xd97706, edge: 0x06b6d4, fog: 0xfde68a, ambient: 0xfffbeb, skyTop: '#b45309', skyBottom: '#fed7aa', worldId: 'LOST_DESERT', nameTr: 'Amber Geçidi', nameEn: 'Amber Pass', descTr: 'Kehribar rengi virajlarda komboyu katla.', descEn: 'Chain massive coin combos on amber turnpikes.' },
  { road: 0xfb923c, edge: 0x8b5cf6, fog: 0xffedd5, ambient: 0xfff7ed, skyTop: '#c2410c', skyBottom: '#fed7aa', worldId: 'LOST_DESERT', nameTr: 'Vaha Serabı', nameEn: 'Mirage Oasis', descTr: 'Vaha kenarındaki pırıl pırıl altınları topla.', descEn: 'Collect radiant coins beside the desert oasis.' },
  { road: 0xfacc15, edge: 0x0284c7, fog: 0xfef08a, ambient: 0xfefce8, skyTop: '#eab308', skyBottom: '#fef9c3', worldId: 'LOST_DESERT', nameTr: 'Kumul Rüzgarı', nameEn: 'Dune Wind', descTr: 'Hızlı rüzgarda hızlanma bantlarını yakala.', descEn: 'Hit speed pads to fly across windy desert gaps.' },
  { road: 0xe11d48, edge: 0xfacc15, fog: 0xfecdd3, ambient: 0xfff1f2, skyTop: '#be123c', skyBottom: '#fecdd3', worldId: 'LOST_DESERT', nameTr: 'Kızıl Kanyon', nameEn: 'Crimson Canyon', descTr: 'Kızıl kayalıklar arasında zikzak manevralar.', descEn: 'Perform swift zigzag moves through rocky corridors.' },
  { road: 0xf59e0b, edge: 0x10b981, fog: 0xfde68a, ambient: 0xfffbeb, skyTop: '#b45309', skyBottom: '#fed7aa', worldId: 'LOST_DESERT', nameTr: 'Firavun Yolu', nameEn: 'Pharaoh Track', descTr: 'Altın heykellerin arasından hızla süzül.', descEn: 'Glide swiftly through ancient golden monuments.' },
  { road: 0xf97316, edge: 0x0284c7, fog: 0xfed7aa, ambient: 0xffedd5, skyTop: '#c2410c', skyBottom: '#fed7aa', worldId: 'LOST_DESERT', nameTr: 'Güneş Fırtınası', nameEn: 'Solar Storm', descTr: 'Işıltılı fırtınada tüm toplarını dengede tut.', descEn: 'Keep all squad balls balanced in high wind currents.' },
  { road: 0xeab308, edge: 0x3b82f6, fog: 0xfde68a, ambient: 0xfefce8, skyTop: '#a16207', skyBottom: '#fef08a', worldId: 'LOST_DESERT', nameTr: 'Çölün Sonu Portalı', nameEn: 'Desert Portal Climax', descTr: 'Ateş ve volkan kapısına giden devasa sıçrayış!', descEn: 'Massive leap towards the flaming volcano realm gate!' },

  // Levels 21-30: Molten Volcano & Lava Bridges
  { road: 0xef4444, edge: 0xfacc15, fog: 0xfca5a5, ambient: 0xfff1f2, skyTop: '#b91c1c', skyBottom: '#fca5a5', worldId: 'VOLCANO_LAND', nameTr: 'Lav Akıntısı', nameEn: 'Lava Stream', descTr: 'Ateş gibi parlayan kırmızı otoyolda hızlan.', descEn: 'Race across vibrant molten red highways.' },
  { road: 0xdc2626, edge: 0x38bdf8, fog: 0xf87171, ambient: 0xfef2f2, skyTop: '#991b1b', skyBottom: '#fca5a5', worldId: 'VOLCANO_LAND', nameTr: 'Magma Köprüsü', nameEn: 'Magma Bridge', descTr: 'Lav gayzerlerinin üzerinden zıplayarak geç.', descEn: 'Leap safely over bursting fiery lava geysers.' },
  { road: 0xf97316, edge: 0xef4444, fog: 0xfdba74, ambient: 0xffedd5, skyTop: '#c2410c', skyBottom: '#fed7aa', worldId: 'VOLCANO_LAND', nameTr: 'Obsidyen Zirvesi', nameEn: 'Obsidian Peak', descTr: 'Parlayan korların üzerinde dengeni sağla.', descEn: 'Balance across glowing obsidian mountain ridges.' },
  { road: 0xe11d48, edge: 0x38bdf8, fog: 0xfb7185, ambient: 0xfff1f2, skyTop: '#be123c', skyBottom: '#fecdd3', worldId: 'VOLCANO_LAND', nameTr: 'Ateş Çemberi', nameEn: 'Ring of Fire', descTr: 'Alev sütunlarından kaçınarak ilerle.', descEn: 'Dodge blazing fire pillars at breakneck speeds.' },
  { road: 0xb91c1c, edge: 0xf59e0b, fog: 0xf87171, ambient: 0xfef2f2, skyTop: '#7f1d1d', skyBottom: '#fca5a5', worldId: 'VOLCANO_LAND', nameTr: 'Kızıl Kalp', nameEn: 'Crimson Core', descTr: 'Volkanın merkezindeki devasa hız pisti.', descEn: 'Hyper-speed runway inside the active caldera.' },
  { road: 0xf43f5e, edge: 0xfacc15, fog: 0xfda4af, ambient: 0xfff1f2, skyTop: '#e11d48', skyBottom: '#fecdd3', worldId: 'VOLCANO_LAND', nameTr: 'Kıvılcım Vadisi', nameEn: 'Spark Canyon', descTr: 'Kıvılcımlar saçan virajlarda kaymadan sür.', descEn: 'Precision drifts on sparkling high-heat rails.' },
  { road: 0xea580c, edge: 0x06b6d4, fog: 0xfdba74, ambient: 0xffedd5, skyTop: '#9a3412', skyBottom: '#fed7aa', worldId: 'VOLCANO_LAND', nameTr: 'Alevli Raylar', nameEn: 'Blazing Rails', descTr: 'Dar köprülerde hız kesmeden dengede kal.', descEn: 'Hold absolute balance on burning narrow tracks.' },
  { road: 0x991b1b, edge: 0x38bdf8, fog: 0xfca5a5, ambient: 0xfef2f2, skyTop: '#7f1d1d', skyBottom: '#fca5a5', worldId: 'VOLCANO_LAND', nameTr: 'Ejder Yolu', nameEn: 'Dragon Way', descTr: 'Efsanevi ejderha sırtı gibi yükselen virajlar.', descEn: 'Crest dragon-back roller-coaster ramps.' },
  { road: 0xd97706, edge: 0xef4444, fog: 0xfde68a, ambient: 0xfffbeb, skyTop: '#b45309', skyBottom: '#fed7aa', worldId: 'VOLCANO_LAND', nameTr: 'Erimiş Şafak', nameEn: 'Molten Dawn', descTr: 'Güneşle yarışan erimiş altın renkli virajlar.', descEn: 'Glistening molten dawn highway sprint.' },
  { road: 0xef4444, edge: 0x38bdf8, fog: 0xfca5a5, ambient: 0xfff1f2, skyTop: '#991b1b', skyBottom: '#fca5a5', worldId: 'VOLCANO_LAND', nameTr: 'Buzul Portalı Atlama', nameEn: 'Frozen Warp Climax', descTr: 'Buzul diyarına açılan boyut kapısına fırla!', descEn: 'Blast through the icy gate into the Frozen Realm!' },

  // Levels 31-40: Crystal Frozen Glaciers & Aurora Peaks
  { road: 0x0284c7, edge: 0x38bdf8, fog: 0x7dd3fc, ambient: 0xf0f9ff, skyTop: '#0369a1', skyBottom: '#e0f2fe', worldId: 'FROZEN_REALM', nameTr: 'Buzul Safir', nameEn: 'Glacial Sapphire', descTr: 'Kristal buz pistinde pürüzsüzce kay.', descEn: 'Glide effortlessly across pure sapphire ice.' },
  { road: 0x06b6d4, edge: 0xffffff, fog: 0x67e8f9, ambient: 0xecfeff, skyTop: '#0891b2', skyBottom: '#cffafe', worldId: 'FROZEN_REALM', nameTr: 'Kutup Işıkları', nameEn: 'Aurora Borealis', descTr: 'Gökyüzündeki renkli auroraların altında sür.', descEn: 'Roll under dazzling dancing northern lights.' },
  { road: 0x38bdf8, edge: 0x818cf8, fog: 0xbae6fd, ambient: 0xf0f9ff, skyTop: '#0284c7', skyBottom: '#e0f2fe', worldId: 'FROZEN_REALM', nameTr: 'Buz Kristalleri', nameEn: 'Frost Crystals', descTr: 'Işıltılı buz kristallerinin üzerinden uç.', descEn: 'Launch high over radiant diamond ice shards.' },
  { road: 0x0ea5e9, edge: 0xf472b6, fog: 0x7dd3fc, ambient: 0xf0f9ff, skyTop: '#0369a1', skyBottom: '#e0f2fe', worldId: 'FROZEN_REALM', nameTr: 'Buzul Kemeri', nameEn: 'Ice Archway', descTr: 'Devasa buz kemerlerinin altından geç.', descEn: 'Speed beneath massive sculptured ice arches.' },
  { road: 0x6366f1, edge: 0x38bdf8, fog: 0xa5b4fc, ambient: 0xeef2ff, skyTop: '#4338ca', skyBottom: '#c7d2fe', worldId: 'FROZEN_REALM', nameTr: 'Kar Fırtınası', nameEn: 'Blizzard Peak', descTr: 'Beyaz fırtınada tüm altınları topla.', descEn: 'Sweep every golden coin in the white flurry.' },
  { road: 0x0891b2, edge: 0xfacc15, fog: 0x67e8f9, ambient: 0xecfeff, skyTop: '#0e7490', skyBottom: '#a5f3fc', worldId: 'FROZEN_REALM', nameTr: 'Sibirya Şeridi', nameEn: 'Siberian Strip', descTr: 'Geniş düzlükte maksimum hıza ulaş.', descEn: 'Push maximum velocity down the wide polar strip.' },
  { road: 0x3b82f6, edge: 0x34d399, fog: 0x93c5fd, ambient: 0xf0f9ff, skyTop: '#1d4ed8', skyBottom: '#bfdbfe', worldId: 'FROZEN_REALM', nameTr: 'Derin Buz Denizi', nameEn: 'Deep Blue Ice', descTr: 'Masmavi buzullar arasında kıvrak dönüşler.', descEn: 'Nimble slaloms between deep cyan icebergs.' },
  { road: 0x2563eb, edge: 0x38bdf8, fog: 0x93c5fd, ambient: 0xf0f9ff, skyTop: '#1e40af', skyBottom: '#bfdbfe', worldId: 'FROZEN_REALM', nameTr: 'Kristal Tepe', nameEn: 'Crystal Summit', descTr: 'Zirveden aşağı heyecan dolu bir iniş.', descEn: 'Thrilling downhill rush from the crystal summit.' },
  { road: 0x0284c7, edge: 0xf43f5e, fog: 0x7dd3fc, ambient: 0xf0f9ff, skyTop: '#0369a1', skyBottom: '#bae6fd', worldId: 'FROZEN_REALM', nameTr: 'Donmuş Göller', nameEn: 'Frozen Lakes', descTr: 'Ayna gibi yansıyan buz üstünde ustalaş.', descEn: 'Master drift physics on glass-smooth frozen mirrors.' },
  { road: 0x06b6d4, edge: 0xa855f7, fog: 0x67e8f9, ambient: 0xecfeff, skyTop: '#0891b2', skyBottom: '#cffafe', worldId: 'FROZEN_REALM', nameTr: 'Neon Şehre Atlama', nameEn: 'Neon City Warp', descTr: 'Siber şehre giden fütüristik portala ulaş!', descEn: 'Portal jump directly into the vibrant cyber metropolis!' },

  // Levels 41-50: Electric Neon Metropolis
  { road: 0x8b5cf6, edge: 0x06b6d4, fog: 0xc4b5fd, ambient: 0xf5f3ff, skyTop: '#6d28d9', skyBottom: '#ddd6fe', worldId: 'NEON_CITY', nameTr: 'Siber Otoyol', nameEn: 'Cyber Expressway', descTr: 'Neon ışıklarla aydınlanan fütüristik cadde.', descEn: 'Electrifying speed on neon-lit cyber avenues.' },
  { road: 0xec4899, edge: 0x38bdf8, fog: 0xf9a8d4, ambient: 0xfdf2f8, skyTop: '#be185d', skyBottom: '#fbcfe8', worldId: 'NEON_CITY', nameTr: 'Neon Magenta', nameEn: 'Neon Magenta', descTr: 'Göz alıcı pembe lazer çizgilerinde yarış.', descEn: 'Race down vibrant magenta laser grid tracks.' },
  { road: 0x06b6d4, edge: 0xf43f5e, fog: 0x67e8f9, ambient: 0xecfeff, skyTop: '#0891b2', skyBottom: '#a5f3fc', worldId: 'NEON_CITY', nameTr: 'Lazer Şebekesi', nameEn: 'Laser Grid', descTr: 'Dönen lazer çubuklarından sıyrıl.', descEn: 'Slip through spinning high-energy laser beams.' },
  { road: 0xa855f7, edge: 0xfacc15, fog: 0xd8b4fe, ambient: 0xfaf5ff, skyTop: '#7e22ce', skyBottom: '#e9d5ff', worldId: 'NEON_CITY', nameTr: 'Matriks Sürüşü', nameEn: 'Matrix Circuit', descTr: 'Hızlı veri hatlarında yön bul.', descEn: 'Navigate data pipelines at blazing warp speeds.' },
  { road: 0x3b82f6, edge: 0xec4899, fog: 0x93c5fd, ambient: 0xf0f9ff, skyTop: '#1d4ed8', skyBottom: '#bfdbfe', worldId: 'NEON_CITY', nameTr: 'Holo Gökdelenler', nameEn: 'Holo Towers', descTr: 'Gökdelenlerin arasında asılı duran köprüler.', descEn: 'Suspended skybridges between glowing skyscrapers.' },
  { road: 0x10b981, edge: 0x8b5cf6, fog: 0x6ee7b7, ambient: 0xf0fdf4, skyTop: '#047857', skyBottom: '#a7f3d0', worldId: 'NEON_CITY', nameTr: 'Siber Zümrüt', nameEn: 'Cyber Emerald', descTr: 'Zümrüt yeşili neon şeritlerde hız rekoru kır.', descEn: 'Set speed records on emerald neon ribbons.' },
  { road: 0xf59e0b, edge: 0x06b6d4, fog: 0xfde68a, ambient: 0xfffbeb, skyTop: '#b45309', skyBottom: '#fde68a', worldId: 'NEON_CITY', nameTr: 'Dijital Günbatımı', nameEn: 'Digital Sunset', descTr: 'Altın sarısı siber ufukta altınları topla.', descEn: 'Collect coins into the radiant digital horizon.' },
  { road: 0x6366f1, edge: 0x34d399, fog: 0xa5b4fc, ambient: 0xeef2ff, skyTop: '#4338ca', skyBottom: '#c7d2fe', worldId: 'NEON_CITY', nameTr: 'Pulsar Caddesi', nameEn: 'Pulsar Boulevard', descTr: 'Ritim tutan neon darbelerle hızlan.', descEn: 'Synchronize momentum with rhythmic light pulses.' },
  { road: 0xd946ef, edge: 0x38bdf8, fog: 0xf0abfc, ambient: 0xfdf4ff, skyTop: '#a21caf', skyBottom: '#f5d0fe', worldId: 'NEON_CITY', nameTr: 'Fütüristik Meydan', nameEn: 'Futuristic Plaza', descTr: 'Geniş meydanda tüm klon toplarını koru.', descEn: 'Shield all squad members across the bustling plaza.' },
  { road: 0x8b5cf6, edge: 0xfacc15, fog: 0xc4b5fd, ambient: 0xf5f3ff, skyTop: '#6d28d9', skyBottom: '#ddd6fe', worldId: 'NEON_CITY', nameTr: 'Kozmik Kapı Finali', nameEn: 'Cosmic Gate Leap', descTr: 'Kozmik boşluğa açılan devasa portala sıçra!', descEn: 'Blast off through the hyper-portal into Cosmic Space!' },

  // Levels 51-60: Cosmic Celestial & Starlight Pathways
  { road: 0x6366f1, edge: 0x38bdf8, fog: 0x818cf8, ambient: 0xf0f9ff, skyTop: '#3730a3', skyBottom: '#c7d2fe', worldId: 'COSMIC_VOID', nameTr: 'Yıldız Yolu', nameEn: 'Starlight Way', descTr: 'Kozmik uzayda parlayan göksel şeritler.', descEn: 'Celestial starlight ribbons in open glowing space.' },
  { road: 0x8b5cf6, edge: 0xec4899, fog: 0xa78bfa, ambient: 0xfaf5ff, skyTop: '#5b21b6', skyBottom: '#ddd6fe', worldId: 'COSMIC_VOID', nameTr: 'Galaksi Sarmalı', nameEn: 'Galaxy Spiral', descTr: 'Dönen galaksi kollarında mükemmel dönüşler.', descEn: 'Carve immaculate arcs across rotating galaxy arms.' },
  { road: 0x0ea5e9, edge: 0xf59e0b, fog: 0x38bdf8, ambient: 0xf0f9ff, skyTop: '#0369a1', skyBottom: '#bae6fd', worldId: 'COSMIC_VOID', nameTr: 'Nebula Bulutu', nameEn: 'Nebula Cloud', descTr: 'Rengarenk gaz bulutlarının içinden süzül.', descEn: 'Drift smoothly through glowing interplanetary clouds.' },
  { road: 0xd946ef, edge: 0x38bdf8, fog: 0xe879f9, ambient: 0xfdf4ff, skyTop: '#86198f', skyBottom: '#f5d0fe', worldId: 'COSMIC_VOID', nameTr: 'Süpernova Şeridi', nameEn: 'Supernova Trail', descTr: 'Göz kamaştırıcı süpernova ışıltısında sür.', descEn: 'High-energy acceleration past supernova flares.' },
  { road: 0x10b981, edge: 0x6366f1, fog: 0x34d399, ambient: 0xf0fdf4, skyTop: '#065f46', skyBottom: '#a7f3d0', worldId: 'COSMIC_VOID', nameTr: 'Zümrüt Kuasar', nameEn: 'Emerald Quasar', descTr: 'Kuasar enerjisiyle toplarını güçlendir.', descEn: 'Power up your squad with boundless quasar energy.' },
  { road: 0xf43f5e, edge: 0xfacc15, fog: 0xfb7185, ambient: 0xfff1f2, skyTop: '#9f1239', skyBottom: '#fecdd3', worldId: 'COSMIC_VOID', nameTr: 'Kızıl Gezegen', nameEn: 'Red Planet Orbit', descTr: 'Kızıl göktaşlarının arasından zıpla.', descEn: 'Leap over cosmic asteroids in lunar orbit.' },
  { road: 0x3b82f6, edge: 0x34d399, fog: 0x60a5fa, ambient: 0xf0f9ff, skyTop: '#1e40af', skyBottom: '#bfdbfe', worldId: 'COSMIC_VOID', nameTr: 'Andromeda Köprüsü', nameEn: 'Andromeda Bridge', descTr: 'Komşu galaksiye uzanan parlayan hat.', descEn: 'Span the gleaming expanse towards Andromeda.' },
  { road: 0xa855f7, edge: 0x06b6d4, fog: 0xc084fc, ambient: 0xfaf5ff, skyTop: '#6b21a8', skyBottom: '#e9d5ff', worldId: 'COSMIC_VOID', nameTr: 'Yerçekimsiz Ray', nameEn: 'Zero-G Rail', descTr: 'Ağırlıksız ortamda dar raylarda kal.', descEn: 'Flawless balance on anti-gravity cosmic rails.' },
  { road: 0x06b6d4, edge: 0xf43f5e, fog: 0x22d3ee, ambient: 0xecfeff, skyTop: '#0e7490', skyBottom: '#a5f3fc', worldId: 'COSMIC_VOID', nameTr: 'Kozmik Foton', nameEn: 'Photon Stream', descTr: 'Işık hızında foton otoyolunda sürüş.', descEn: 'Surge down the light-speed photon stream.' },
  { road: 0x8b5cf6, edge: 0xfacc15, fog: 0xa78bfa, ambient: 0xfaf5ff, skyTop: '#5b21b6', skyBottom: '#ddd6fe', worldId: 'COSMIC_VOID', nameTr: 'Sonsuzluk Kapısı 50', nameEn: 'Infinity Gate Halfway', descTr: '50. Seviye Zaferi! Maceranın yarısını tamamladın.', descEn: 'Level 50 Milestone! Triumphant leap into mastery.' },

  // Levels 61-70: Hyper-Vibrant Prismatic Realm (Green & Cyan Remix)
  { road: 0x10b981, edge: 0xec4899, fog: 0x6ee7b7, ambient: 0xf0fdf4, skyTop: '#047857', skyBottom: '#a7f3d0', worldId: 'GREEN_VALLEY', nameTr: 'Prizmatik Zümrüt', nameEn: 'Prismatic Emerald', descTr: 'Prizma renkleriyle parlayan canlı vadi.', descEn: 'Prismatic emerald shades blazing across the valley.' },
  { road: 0x06b6d4, edge: 0xfacc15, fog: 0x67e8f9, ambient: 0xecfeff, skyTop: '#0284c7', skyBottom: '#bae6fd', worldId: 'GREEN_VALLEY', nameTr: 'Safir Akarsu', nameEn: 'Sapphire Stream', descTr: 'Çift yönlü virajlarda hızlı refleksler göster.', descEn: 'Lightning reflexes on winding sapphire waters.' },
  { road: 0x22c55e, edge: 0x3b82f6, fog: 0x86efac, ambient: 0xf0fdf4, skyTop: '#15803d', skyBottom: '#bbf7d0', worldId: 'GREEN_VALLEY', nameTr: 'Neon Bambu', nameEn: 'Neon Bamboo', descTr: 'Fıstık yeşili canlı yolda engelleri aş.', descEn: 'Clear obstacles across vivid bamboo meadows.' },
  { road: 0x0ea5e9, edge: 0xf97316, fog: 0x7dd3fc, ambient: 0xf0f9ff, skyTop: '#0369a1', skyBottom: '#e0f2fe', worldId: 'GREEN_VALLEY', nameTr: 'Gökyüzü Kordonu', nameEn: 'Skyline Promenade', descTr: 'Bulutların üstünde güneşli bir koşu.', descEn: 'Sunny sprint perched high above the white clouds.' },
  { road: 0x14b8a6, edge: 0xf43f5e, fog: 0x5eead4, ambient: 0xf0fdfa, skyTop: '#0f766e', skyBottom: '#99f6e4', worldId: 'GREEN_VALLEY', nameTr: 'Turkuaz Uçurum', nameEn: 'Turquoise Cliff', descTr: 'Kenarlardan düşmeden süratini koru.', descEn: 'Stay centered to prevent edge falls along cliff edges.' },
  { road: 0x84cc16, edge: 0x8b5cf6, fog: 0xa3e635, ambient: 0xfefce8, skyTop: '#4d7c0f', skyBottom: '#d9f99d', worldId: 'GREEN_VALLEY', nameTr: 'Parlak Yeşil Vadi', nameEn: 'Bright Lime Valley', descTr: 'Göz kamaştırıcı yeşillikte altınları kap.', descEn: 'Snatch shining coins along bright lime runways.' },
  { road: 0x0284c7, edge: 0xfacc15, fog: 0x38bdf8, ambient: 0xf0f9ff, skyTop: '#0284c7', skyBottom: '#bae6fd', worldId: 'GREEN_VALLEY', nameTr: 'Mavi Şafak', nameEn: 'Blue Horizon Dawn', descTr: 'Pırıl pırıl gökyüzünde hızlanma rampaları.', descEn: 'Boost pads on an endless crystal blue canvas.' },
  { road: 0x10b981, edge: 0x38bdf8, fog: 0x6ee7b7, ambient: 0xf0fdf4, skyTop: '#047857', skyBottom: '#a7f3d0', worldId: 'GREEN_VALLEY', nameTr: 'Kristal Bahçe', nameEn: 'Crystal Garden', descTr: 'Çiçek gibi açan parıltılı kristaller.', descEn: 'Weave through blooming field crystal clusters.' },
  { road: 0x06b6d4, edge: 0xf97316, fog: 0x67e8f9, ambient: 0xecfeff, skyTop: '#0891b2', skyBottom: '#a5f3fc', worldId: 'GREEN_VALLEY', nameTr: 'Akuamarin Kanyon', nameEn: 'Aquamarine Ravine', descTr: 'Zıplama pedleriyle derin vadilerin üstünden uç.', descEn: 'Fly over deep green ravines on booster springs.' },
  { road: 0x22c55e, edge: 0xfacc15, fog: 0x86efac, ambient: 0xf0fdf4, skyTop: '#15803d', skyBottom: '#bbf7d0', worldId: 'GREEN_VALLEY', nameTr: '70. Bölüm Altın Portal', nameEn: 'Level 70 Golden Gate', descTr: 'Altın çöle doğru ikinci büyük boyut sıçrayışı!', descEn: 'Golden dimensional warp into the master desert!' },

  // Levels 71-80: Golden Sun & Crimson Dune Odyssey
  { road: 0xf59e0b, edge: 0x3b82f6, fog: 0xfde68a, ambient: 0xfffbeb, skyTop: '#b45309', skyBottom: '#fed7aa', worldId: 'LOST_DESERT', nameTr: 'Güneş Işığı Çölü', nameEn: 'Sunlight Mirage', descTr: 'Göz alıcı sarı pistte tam hız ilerle.', descEn: 'Full throttle acceleration on golden sandways.' },
  { road: 0xf97316, edge: 0x10b981, fog: 0xfed7aa, ambient: 0xffedd5, skyTop: '#c2410c', skyBottom: '#fed7aa', worldId: 'LOST_DESERT', nameTr: 'Portakal Kumullar', nameEn: 'Orange Dunes', descTr: 'Yüksek kum tepelerinden hızla aşağı süzül.', descEn: 'Rollercoaster descent down orange desert dunes.' },
  { road: 0xeab308, edge: 0x8b5cf6, fog: 0xfef08a, ambient: 0xfefce8, skyTop: '#a16207', skyBottom: '#fef08a', worldId: 'LOST_DESERT', nameTr: 'Altın Heykeller', nameEn: 'Golden Monoliths', descTr: 'Eski kralların heykelleri arasında yarış.', descEn: 'Speed between titan golden monolith guardians.' },
  { road: 0xef4444, edge: 0xfacc15, fog: 0xfca5a5, ambient: 0xfff1f2, skyTop: '#b91c1c', skyBottom: '#fca5a5', worldId: 'LOST_DESERT', nameTr: 'Yakut Geçidi', nameEn: 'Ruby Corridor', descTr: 'Kızıl yakut rengi yolda engelleri atlat.', descEn: 'Dodge hazardous stone blockers on ruby asphalt.' },
  { road: 0xfb923c, edge: 0x06b6d4, fog: 0xffedd5, ambient: 0xfff7ed, skyTop: '#c2410c', skyBottom: '#fed7aa', worldId: 'LOST_DESERT', nameTr: 'Kehribar Şafak', nameEn: 'Amber Dawn', descTr: 'Sıcak amber ışığı altında rekor kır.', descEn: 'Break your speed milestone under amber skies.' },
  { road: 0xd97706, edge: 0xec4899, fog: 0xfde68a, ambient: 0xfffbeb, skyTop: '#92400e', skyBottom: '#fed7aa', worldId: 'LOST_DESERT', nameTr: 'Bronz Kanyon', nameEn: 'Bronze Canyon', descTr: 'Bronz ve altın madenlerinde dar geçitler.', descEn: 'Tread narrow high bridges across bronze canyons.' },
  { road: 0xfacc15, edge: 0x38bdf8, fog: 0xfef08a, ambient: 0xfefce8, skyTop: '#ca8a04', skyBottom: '#fef9c3', worldId: 'LOST_DESERT', nameTr: 'Güneş Tahtı', nameEn: 'Throne of the Sun', descTr: 'Güneş tahtına giden ihtişamlı bulvar.', descEn: 'Majestic boulevard leading to the solar spire.' },
  { road: 0xf97316, edge: 0x3b82f6, fog: 0xfed7aa, ambient: 0xffedd5, skyTop: '#ea580c', skyBottom: '#fed7aa', worldId: 'LOST_DESERT', nameTr: 'Ateş Fırtınası Yolu', nameEn: 'Firestorm Run', descTr: 'Çöl fırtınasında tüm altınları topla.', descEn: 'Harvest every golden coin through desert storms.' },
  { road: 0xe11d48, edge: 0x38bdf8, fog: 0xfb7185, ambient: 0xfff1f2, skyTop: '#be123c', skyBottom: '#fecdd3', worldId: 'LOST_DESERT', nameTr: 'Kızıl Şahin', nameEn: 'Scarlet Falcon', descTr: 'Şahin gibi gökyüzüne doğru sıçra.', descEn: 'Soar like a falcon over massive canyon leaps.' },
  { road: 0xf59e0b, edge: 0x8b5cf6, fog: 0xfde68a, ambient: 0xfffbeb, skyTop: '#b45309', skyBottom: '#fed7aa', worldId: 'LOST_DESERT', nameTr: '80. Bölüm Volkan Kapısı', nameEn: 'Level 80 Molten Gate', descTr: 'Alevler diyarına açılan 80. seviye kapısı!', descEn: 'Blast into the ultimate hyper-volcano domain!' },

  // Levels 81-90: Ultra Neon & Cybernetic Speedways
  { road: 0x8b5cf6, edge: 0xf43f5e, fog: 0xc4b5fd, ambient: 0xf5f3ff, skyTop: '#6d28d9', skyBottom: '#ddd6fe', worldId: 'NEON_CITY', nameTr: 'Ultra Mor Siber', nameEn: 'Ultra Violet Cyber', descTr: 'Elektrik moru ışık hatlarında sürüş keyfi.', descEn: 'Ultra-violet hyperdrive on laser-etched asphalt.' },
  { road: 0xec4899, edge: 0x06b6d4, fog: 0xf9a8d4, ambient: 0xfdf2f8, skyTop: '#be185d', skyBottom: '#fbcfe8', worldId: 'NEON_CITY', nameTr: 'Neon Flamingo', nameEn: 'Neon Flamingo', descTr: 'Göz alıcı pembe lazerlerle aydınlanan yol.', descEn: 'Vibrant hot pink neon speeds under cyan lights.' },
  { road: 0x06b6d4, edge: 0xfacc15, fog: 0x67e8f9, ambient: 0xecfeff, skyTop: '#0891b2', skyBottom: '#a5f3fc', worldId: 'NEON_CITY', nameTr: 'Mavi Lazer Şehri', nameEn: 'Cyan Laser City', descTr: 'Gökdelenlerin zirvelerinde zıplayarak ilerle.', descEn: 'Rooftop highway jumps between cyber skyscrapers.' },
  { road: 0xa855f7, edge: 0x34d399, fog: 0xd8b4fe, ambient: 0xfaf5ff, skyTop: '#7e22ce', skyBottom: '#e9d5ff', worldId: 'NEON_CITY', nameTr: 'Holo Matriks', nameEn: 'Holo Matrix Run', descTr: 'Dijital hologramların içinden tam gaz geç.', descEn: 'Charge directly through glowing digital holograms.' },
  { road: 0xd946ef, edge: 0x38bdf8, fog: 0xf0abfc, ambient: 0xfdf4ff, skyTop: '#a21caf', skyBottom: '#f5d0fe', worldId: 'NEON_CITY', nameTr: 'Fütüristik Yarış', nameEn: 'Futuristic Dragstrip', descTr: 'Hızlanma şeritlerinde son sürat sür.', descEn: 'Hit top speedometer limits on cyber boosters.' },
  { road: 0x3b82f6, edge: 0xf43f5e, fog: 0x93c5fd, ambient: 0xf0f9ff, skyTop: '#1d4ed8', skyBottom: '#bfdbfe', worldId: 'NEON_CITY', nameTr: 'Kobalt Neon', nameEn: 'Cobalt Neon Loop', descTr: 'Kobalt mavisi virajlarda kusursuz manevra.', descEn: 'Execute pristine turns on cobalt neon loops.' },
  { road: 0x10b981, edge: 0xfacc15, fog: 0x6ee7b7, ambient: 0xf0fdf4, skyTop: '#047857', skyBottom: '#a7f3d0', worldId: 'NEON_CITY', nameTr: 'Siber Zümrüt Hat', nameEn: 'Cyber Emerald Grid', descTr: 'Lazer ızgaralarını ustalıkla geç.', descEn: 'Thread the needle between laser grid traps.' },
  { road: 0xf59e0b, edge: 0x8b5cf6, fog: 0xfde68a, ambient: 0xfffbeb, skyTop: '#b45309', skyBottom: '#fde68a', worldId: 'NEON_CITY', nameTr: 'Neon Altın Cadde', nameEn: 'Neon Gold Avenue', descTr: 'Altın renkli neon tabelaların altından ak.', descEn: 'Cruise under luminous golden billboards.' },
  { road: 0x6366f1, edge: 0xec4899, fog: 0xa5b4fc, ambient: 0xeef2ff, skyTop: '#4338ca', skyBottom: '#c7d2fe', worldId: 'NEON_CITY', nameTr: 'İndigo Şimşek', nameEn: 'Indigo Lightning', descTr: 'Şimşek hızında reflekslerle zıpla.', descEn: 'Lightning reflexes on winding indigo skyrails.' },
  { road: 0x8b5cf6, edge: 0x06b6d4, fog: 0xc4b5fd, ambient: 0xf5f3ff, skyTop: '#6d28d9', skyBottom: '#ddd6fe', worldId: 'NEON_CITY', nameTr: '90. Bölüm Kozmik Portal', nameEn: 'Level 90 Cosmic Warp', descTr: 'Son 10 büyük finale açılan kozmik kapı!', descEn: 'Ascend to the grand cosmic championship arena!' },

  // Levels 91-100: Grand Cosmic Zenith & Champion Odyssey
  { road: 0x6366f1, edge: 0xfacc15, fog: 0x818cf8, ambient: 0xf0f9ff, skyTop: '#312e81', skyBottom: '#c7d2fe', worldId: 'COSMIC_VOID', nameTr: 'Kozmik Başlangıç 91', nameEn: 'Cosmic Ascent 91', descTr: 'Büyük finale ilk adım! Yıldızların üstünde süzül.', descEn: 'First step into the grand final cosmic championship.' },
  { road: 0x8b5cf6, edge: 0x38bdf8, fog: 0xa78bfa, ambient: 0xfaf5ff, skyTop: '#4c1d95', skyBottom: '#ddd6fe', worldId: 'COSMIC_VOID', nameTr: 'Samanyolu Köprüsü', nameEn: 'Milky Way Causeway', descTr: 'Milyarlarca yıldızın ışığında tam gaz yarış.', descEn: 'Race illuminated by billions of stellar lanterns.' },
  { road: 0x0ea5e9, edge: 0xec4899, fog: 0x38bdf8, ambient: 0xf0f9ff, skyTop: '#075985', skyBottom: '#bae6fd', worldId: 'COSMIC_VOID', nameTr: 'Süper Nebula', nameEn: 'Super Nebula Drift', descTr: 'Pırıl pırıl parlayan göksel bulutlar.', descEn: 'Hyper-drift through iridescent stellar clouds.' },
  { road: 0xd946ef, edge: 0xfacc15, fog: 0xe879f9, ambient: 0xfdf4ff, skyTop: '#701a75', skyBottom: '#f5d0fe', worldId: 'COSMIC_VOID', nameTr: 'Aura Zirvesi', nameEn: 'Aura Summit', descTr: 'Büyüleyici renk dalgalarında hızlan.', descEn: 'Ride energetic chromatic waves across the summit.' },
  { road: 0x10b981, edge: 0x38bdf8, fog: 0x34d399, ambient: 0xf0fdf4, skyTop: '#064e3b', skyBottom: '#a7f3d0', worldId: 'COSMIC_VOID', nameTr: 'Galaktik Zümrüt', nameEn: 'Galactic Emerald', descTr: 'Zümrüt ışığıyla parlayan sonsuz yol.', descEn: 'Infinite speed down the glowing galactic ribbon.' },
  { road: 0xf43f5e, edge: 0x38bdf8, fog: 0xfb7185, ambient: 0xfff1f2, skyTop: '#881337', skyBottom: '#fecdd3', worldId: 'COSMIC_VOID', nameTr: 'Yıldız Patlaması', nameEn: 'Star Flare Corridor', descTr: 'Yıldız patlamalarının arasından cesurca geç.', descEn: 'Brave through star flare arcs with precision jumps.' },
  { road: 0x3b82f6, edge: 0xfacc15, fog: 0x60a5fa, ambient: 0xf0f9ff, skyTop: '#1e3a8a', skyBottom: '#bfdbfe', worldId: 'COSMIC_VOID', nameTr: 'Safir Kozmoz', nameEn: 'Sapphire Cosmos', descTr: 'Masmavi gökyüzü ve uzayın buluştuğu hat.', descEn: 'Where open azure skies meet deep starry cosmos.' },
  { road: 0xa855f7, edge: 0x34d399, fog: 0xc084fc, ambient: 0xfaf5ff, skyTop: '#581c87', skyBottom: '#e9d5ff', worldId: 'COSMIC_VOID', nameTr: 'Zaman Bükümü', nameEn: 'Time Warp Runway', descTr: 'Işıktan hızlı reflekslerle tüm engelleri aş.', descEn: 'Faster-than-light reflexes to conquer all obstacles.' },
  { road: 0x06b6d4, edge: 0xf59e0b, fog: 0x22d3ee, ambient: 0xecfeff, skyTop: '#164e63', skyBottom: '#a5f3fc', worldId: 'COSMIC_VOID', nameTr: 'Şampiyonlar Yolu', nameEn: 'Road of Champions', descTr: 'Büyük final öncesi son ustalık sınavı!', descEn: 'The penultimate master trial of the Rollverse!' },
  { road: 0xfacc15, edge: 0x38bdf8, fog: 0xfef08a, ambient: 0xfffae6, skyTop: '#0284c7', skyBottom: '#bae6fd', worldId: 'COSMIC_VOID', nameTr: '100. BÖLÜM: BÜYÜK ROLLVERSE FİNALİ', nameEn: 'LEVEL 100: GRAND ROLLVERSE ZENITH', descTr: 'Efsanevi 100. Bölüm! Altın şampiyonluk yolunu tamamla ve evrenin kralı ol!', descEn: 'The Legendary Level 100! Complete the golden champion road and become Rollverse Master!' }
];

export const GAME_LEVELS: LevelInfo[] = VIBRANT_PALETTES.map((p, idx) => {
  const levelNum = idx + 1;
  // Progress target distance starting from 400m up to 5200m
  const targetDist = 400 + (levelNum - 1) * 48;
  const bonusFrags = 15 + Math.floor(levelNum * 1.5);
  const bonusEnergy = 50 + Math.floor(levelNum * 1.8);

  return {
    level: levelNum,
    name: p.nameTr,
    nameEn: p.nameEn,
    worldId: p.worldId,
    targetDistance: targetDist,
    description: p.descTr,
    descriptionEn: p.descEn,
    bonusFragments: bonusFrags,
    bonusEnergy: bonusEnergy,
    rewardFragments: bonusFrags,
    roadColor: p.road,
    roadEdgeColor: p.edge,
    fogColor: p.fog,
    ambientColor: p.ambient,
    skyColorTop: p.skyTop,
    skyColorBottom: p.skyBottom
  };
});
