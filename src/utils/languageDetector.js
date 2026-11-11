// ============================================================================
// SMART LANGUAGE DETECTION & LOCALIZATION SYSTEM
// Multi-factor detection: Manual preference > Browser languages > Country IP > Fallback
// ============================================================================

export const SUPPORTED_LANGS = [
  'all', 'fr', 'en', 'es', 'pt_BR', 'de', 'ar', 'zh', 'ru', 'ja', 'it', 'ko', 'hi',
  'vi', 'id', 'pl', 'tr', 'bn', 'ta', 'te', 'fa_IR', 'ml', 'cs', 'th', 'hu',
  'fi', 'si', 'el', 'ur', 'mr', 'uk', 'my', 'sv', 'he', 'ne', 'bg', 'et',
  'nl', 'pt_PT', 'ro', 'km', 'sr', 'kn', 'da', 'sk', 'kk', 'no', 'az', 'lv',
  'ca', 'zh_TW', 'uz', 'pa', 'sl', 'hy'
];

export const RTL_LANGS = ['ar', 'he', 'fa_IR', 'ur'];

// Map of 240+ ISO 3166-1 alpha-2 country codes to primary & secondary language codes
export const COUNTRY_TO_LANG = {
  // Francophone Countries
  FR: ['fr'], MC: ['fr'], GP: ['fr'], MQ: ['fr'], GF: ['fr'], RE: ['fr'],
  YT: ['fr'], PF: ['fr'], NC: ['fr'], WF: ['fr'], BL: ['fr'], MF: ['fr'],
  PM: ['fr'], SN: ['fr'], CI: ['fr'], CM: ['fr', 'en'], CD: ['fr'], CG: ['fr'],
  GA: ['fr'], ML: ['fr'], NE: ['fr'], BF: ['fr'], BJ: ['fr'], TG: ['fr'],
  GN: ['fr'], MG: ['fr'], DJ: ['fr', 'ar'], KM: ['fr', 'ar'], HT: ['fr'],
  LU: ['fr', 'de'], BE: ['fr', 'nl', 'de'], CH: ['de', 'fr', 'it'],

  // Arab World (MENA)
  DZ: ['ar', 'fr'], MA: ['ar', 'fr'], TN: ['ar', 'fr'], LY: ['ar'],
  EG: ['ar'], SD: ['ar'], MR: ['ar', 'fr'], SA: ['ar'], AE: ['ar', 'en'],
  QA: ['ar'], KW: ['ar'], OM: ['ar'], BH: ['ar'], IQ: ['ar'], JO: ['ar'],
  LB: ['ar', 'fr', 'en'], SY: ['ar'], YE: ['ar'], PS: ['ar'],

  // Hispanophone Countries
  ES: ['es', 'ca'], MX: ['es'], CO: ['es'], AR: ['es'], PE: ['es'],
  VE: ['es'], CL: ['es'], GT: ['es'], EC: ['es'], CU: ['es'], BO: ['es'],
  DO: ['es'], HN: ['es'], PY: ['es'], SV: ['es'], NI: ['es'], CR: ['es'],
  PA: ['es'], UY: ['es'], GQ: ['es', 'fr'],

  // Lusophone Countries
  BR: ['pt_BR'],
  PT: ['pt_PT'], AO: ['pt_PT'], MZ: ['pt_PT'], CV: ['pt_PT'],
  GW: ['pt_PT'], ST: ['pt_PT'], TL: ['pt_PT'],

  // Anglophone Countries
  US: ['en'], GB: ['en'], CA: ['en', 'fr'], AU: ['en'], NZ: ['en'],
  IE: ['en'], ZA: ['en'], NG: ['en'], GH: ['en'], KE: ['en'], UG: ['en'],
  ZW: ['en'], BW: ['en'], NA: ['en'], ZM: ['en'], MW: ['en'], LR: ['en'],
  SL: ['en'], GM: ['en'], SZ: ['en'], LS: ['en'], JM: ['en'], TT: ['en'],
  BB: ['en'], BS: ['en'], GY: ['en'], BZ: ['en'], SG: ['en', 'zh', 'ta'],
  PH: ['en'], IN: ['hi', 'en', 'ta', 'te', 'bn', 'ml', 'kn', 'mr', 'pa'],

  // Germanic & Nordic
  DE: ['de'], AT: ['de'], LI: ['de'],
  NL: ['nl'], SR: ['nl'],
  SE: ['sv'], NO: ['no'], DK: ['da'], FI: ['fi', 'sv'],

  // Slavic & Eastern European
  RU: ['ru'], BY: ['ru'], UA: ['uk', 'ru'], PL: ['pl'],
  CZ: ['cs'], SK: ['sk'], BG: ['bg'], RS: ['sr'], BA: ['sr'],
  ME: ['sr'], SI: ['sl'], RO: ['ro'], MD: ['ro', 'ru'],
  HU: ['hu'],

  // Mediterranean & Middle East
  IT: ['it'], SM: ['it'], VA: ['it'],
  GR: ['el'], CY: ['el', 'tr'],
  TR: ['tr'],
  IL: ['he', 'ar', 'en'],
  IR: ['fa_IR'], AF: ['fa_IR'], TJ: ['fa_IR'],
  PK: ['ur', 'en'], BD: ['bn'],

  // East & Southeast Asia
  CN: ['zh'], TW: ['zh_TW'], HK: ['zh_TW', 'en'], MO: ['zh_TW', 'pt_PT'],
  JP: ['ja'], KR: ['ko'], VN: ['vi'], ID: ['id'],
  TH: ['th'], MM: ['my'], NP: ['ne'], LK: ['si', 'ta'],
  KH: ['km'],

  // Central Asia & Caucasus
  KZ: ['kk', 'ru'], UZ: ['uz'], AZ: ['az'],
  AM: ['hy'], EE: ['et'], LV: ['lv'],
  AD: ['ca']
};

/**
 * Normalizes browser locale tag (e.g. 'fr-FR', 'pt-BR', 'zh-CN') to supported app code.
 */
export function normalizeLocale(locale) {
  if (!locale || typeof locale !== 'string') return null;
  const clean = locale.trim().replace('_', '-').toLowerCase();

  // Special exact regional matches
  if (clean === 'pt-br' || clean.startsWith('pt-br')) return 'pt_BR';
  if (clean === 'pt-pt' || clean.startsWith('pt-pt')) return 'pt_PT';
  if (clean === 'zh-tw' || clean === 'zh-hk' || clean === 'zh-hant') return 'zh_TW';
  if (clean === 'zh-cn' || clean === 'zh-sg' || clean === 'zh-hans' || clean === 'zh') return 'zh';
  if (clean === 'fa-ir' || clean === 'fa') return 'fa_IR';

  // Direct 2-letter prefix match (e.g. 'fr-fr' -> 'fr', 'en-us' -> 'en')
  const prefix = clean.split('-')[0];
  if (prefix === 'pt') return 'pt_BR'; // Default portuguese to pt_BR
  if (SUPPORTED_LANGS.includes(prefix)) {
    return prefix;
  }

  // Check full tag underscored
  const underscored = clean.replace('-', '_');
  if (SUPPORTED_LANGS.includes(underscored)) {
    return underscored;
  }

  return null;
}

/**
 * Detects visitor language using multi-factor prioritization:
 * 1. Manual user choice (saved in localStorage, NEVER overwritten)
 * 2. Browser preferred languages (navigator.languages)
 * 3. Country IP Geolocation
 * 4. Default fallback ('fr' or 'en')
 */
export async function detectVisitorLanguage() {
  // 1. MANUAL USER PREFERENCE ALWAYS PREVAILS
  const manualLang = localStorage.getItem('fpb_manual_lang');
  if (manualLang && SUPPORTED_LANGS.includes(manualLang)) {
    return {
      lang: manualLang,
      source: 'manual',
      isManual: true,
      rtl: RTL_LANGS.includes(manualLang)
    };
  }

  // 2. DETECT BROWSER LANGUAGE PREFERENCE
  let browserCandidates = [];
  try {
    const rawList = navigator.languages || [navigator.language || navigator.userLanguage];
    for (const raw of rawList) {
      const match = normalizeLocale(raw);
      if (match && !browserCandidates.includes(match)) {
        browserCandidates.push(match);
      }
    }
  } catch (e) {
    console.warn('Browser language detection warning:', e);
  }
  const primaryBrowserLang = browserCandidates[0] || null;

  // 3. DETECT COUNTRY BY IP (Cached or Asynchronous fetch)
  let countryCode = localStorage.getItem('fpb_geo_country');
  if (!countryCode) {
    countryCode = await fetchVisitorCountry();
    if (countryCode) {
      try {
        localStorage.setItem('fpb_geo_country', countryCode);
      } catch {}
    }
  }

  let countryLangs = [];
  if (countryCode && COUNTRY_TO_LANG[countryCode.toUpperCase()]) {
    countryLangs = COUNTRY_TO_LANG[countryCode.toUpperCase()];
  }

  // DECISION MATRIX:
  // Rule: Compare browser language with country language.
  // Priority: 1. Manual, 2. Browser, 3. Country IP, 4. Default ('fr')

  // Check if browser language is supported
  if (primaryBrowserLang) {
    // If the browser language also matches one of the country's spoken languages, it is an ideal match
    const countryMatch = countryLangs.find(cl => cl === primaryBrowserLang);
    return {
      lang: primaryBrowserLang,
      source: countryMatch ? 'browser_and_country' : 'browser',
      country: countryCode || null,
      isManual: false,
      rtl: RTL_LANGS.includes(primaryBrowserLang)
    };
  }

  // If browser language is not supported or not present, use the country's primary language
  if (countryLangs.length > 0 && SUPPORTED_LANGS.includes(countryLangs[0])) {
    const chosen = countryLangs[0];
    return {
      lang: chosen,
      source: 'ip_country',
      country: countryCode,
      isManual: false,
      rtl: RTL_LANGS.includes(chosen)
    };
  }

  // Default fallback
  return {
    lang: 'fr',
    source: 'default_fallback',
    country: countryCode || null,
    isManual: false,
    rtl: false
  };
}

/**
 * Asynchronously fetches visitor's country with timeout and fallbacks.
 * RGPD compliant: Does NOT store or expose visitor IP address.
 */
async function fetchVisitorCountry() {
  const fetchWithTimeout = async (url, ms = 2500) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);
    try {
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  };

  // Tier 1: api.country.is (ultra fast, HTTPS, free, CORS open)
  try {
    const data = await fetchWithTimeout('https://api.country.is', 2000);
    if (data && data.country && typeof data.country === 'string') {
      return data.country.toUpperCase();
    }
  } catch {}

  // Tier 2: ipwho.is (backup)
  try {
    const data = await fetchWithTimeout('https://ipwho.is/', 2500);
    if (data && data.success && data.country_code) {
      return data.country_code.toUpperCase();
    }
  } catch {}

  // Tier 3: freeipapi.com (secondary backup)
  try {
    const data = await fetchWithTimeout('https://freeipapi.com/api/json', 2500);
    if (data && data.countryCode) {
      return data.countryCode.toUpperCase();
    }
  } catch {}

  return null;
}

// ============================================================================
// UI TRANSLATIONS DICTIONARY (Automatic Full Translation)
// ============================================================================

export const UI_TRANSLATIONS = {
  fr: {
    search_placeholder: "Rechercher un livre, techno (ex: Python, React, Rust, Algorithmes)...",
    all_subjects: "Tous les sujets",
    all_formats: "Tous les formats",
    active_lang: "Langue active",
    change_lang: "Changer",
    topics: "Sujets & Technologies",
    filter_topic_placeholder: "Filtrer un sujet (ex: Python)...",
    favorites: "Favoris",
    fav_remove: "⭐ Retiré des favoris",
    fav_add: "🌟 Ajouté à vos favoris !",
    reset_filters: "✕ Réinitialiser",
    empty_title: "Aucune ressource trouvée",
    empty_desc: "Essayez de modifier votre recherche ou réinitialisez les filtres.",
    prev_page: "← Précédent",
    next_page: "Suivant →",
    hero_badge: "⚡ Bibliothèque Open Source Officielle",
    hero_title_pre: "Apprenez à coder avec des",
    hero_title_highlight: "milliers de livres gratuits",
    hero_subtitle: "Explorez plus de 10 740 livres, cours, vidéos et podcasts vérifiés par la communauté internationale dans 53 langues.",
    stat_resources: "Ressources Référencées",
    stat_languages: "Langues Mondiales",
    stat_free: "Accès Libre & Gratuit",
    modal_title: "Choisir une langue",
    modal_subtitle: "53 langues mondiales disponibles avec ressources vérifiées",
    modal_search_placeholder: "Rechercher une langue (ex: Français, English, Español)...",
    link_copied: "📋 Lien copié dans le presse-papier !",
    login: "Connexion",
    create_account: "Créer un compte",
    lang_detected_toast: "🌍 Langue détectée : {lang}"
  },
  en: {
    search_placeholder: "Search for a book, tech (e.g. Python, React, Rust, Algorithms)...",
    all_subjects: "All topics",
    all_formats: "All formats",
    active_lang: "Active language",
    change_lang: "Change",
    topics: "Topics & Technologies",
    filter_topic_placeholder: "Filter a topic (e.g. Python)...",
    favorites: "Favorites",
    fav_remove: "⭐ Removed from favorites",
    fav_add: "🌟 Added to your favorites!",
    reset_filters: "✕ Reset",
    empty_title: "No resources found",
    empty_desc: "Try adjusting your search query or reset the active filters.",
    prev_page: "← Previous",
    next_page: "Next →",
    hero_badge: "⚡ Official Open Source Library",
    hero_title_pre: "Learn to code with",
    hero_title_highlight: "thousands of free books",
    hero_subtitle: "Explore over 10,740 curated books, courses, videos and podcasts verified by the international community in 53 languages.",
    stat_resources: "Curated Resources",
    stat_languages: "Global Languages",
    stat_free: "100% Free & Open",
    modal_title: "Choose a Language",
    modal_subtitle: "53 world languages available with verified educational resources",
    modal_search_placeholder: "Search for a language (e.g. English, French, Spanish)...",
    link_copied: "📋 Link copied to clipboard!",
    login: "Sign In",
    create_account: "Create Account",
    lang_detected_toast: "🌍 Language detected: {lang}"
  },
  es: {
    search_placeholder: "Buscar un libro, tecnología (ej: Python, React, Rust, Algoritmos)...",
    all_subjects: "Todos los temas",
    all_formats: "Todos los formatos",
    active_lang: "Idioma activo",
    change_lang: "Cambiar",
    topics: "Temas y Tecnologías",
    filter_topic_placeholder: "Filtrar un tema (ej: Python)...",
    favorites: "Favoritos",
    fav_remove: "⭐ Eliminado de favoritos",
    fav_add: "🌟 ¡Añadido a tus favoritos!",
    reset_filters: "✕ Restablecer",
    empty_title: "No se encontraron recursos",
    empty_desc: "Intenta modificar tu búsqueda o restablece los filtros.",
    prev_page: "← Anterior",
    next_page: "Siguiente →",
    hero_badge: "⚡ Biblioteca Open Source Oficial",
    hero_title_pre: "Aprende a programar con",
    hero_title_highlight: "miles de libros gratuitos",
    hero_subtitle: "Explora más de 10.740 libros, cursos, vídeos y podcasts verificados por la comunidad internacional en 53 idiomas.",
    stat_resources: "Recursos Referenciados",
    stat_languages: "Idiomas Mundiales",
    stat_free: "100% Libre y Gratuito",
    modal_title: "Elegir un idioma",
    modal_subtitle: "53 idiomas mundiales disponibles con recursos verificados",
    modal_search_placeholder: "Buscar un idioma (ej: Español, Inglés, Francés)...",
    link_copied: "📋 ¡Enlace copiado al portapapeles!",
    login: "Iniciar sesión",
    create_account: "Crear cuenta",
    lang_detected_toast: "🌍 Idioma detectado: {lang}"
  },
  ar: {
    search_placeholder: "ابحث عن كتاب أو تقنية (مثال: بايثون، رياكت، خوارزميات)...",
    all_subjects: "جميع المواضيع",
    all_formats: "جميع الصيغ",
    active_lang: "اللغة الحالية",
    change_lang: "تغيير",
    topics: "المواضيع والتقنيات",
    filter_topic_placeholder: "تصفية موضوع (مثال: بايثون)...",
    favorites: "المفضلة",
    fav_remove: "⭐ تمت الإزالة من المفضلة",
    fav_add: "🌟 تمت الإضافة إلى المفضلة!",
    reset_filters: "✕ إعادة ضبط",
    empty_title: "لم يتم العثور على نتائج",
    empty_desc: "حاول تعديل عبارة البحث أو إعادة تعيين الفلاتر المحددة.",
    prev_page: "السابق ←",
    next_page: "→ التالي",
    hero_badge: "⚡ المكتبة الرسمية مفتوحة المصدر",
    hero_title_pre: "تعلم البرمجة من خلال",
    hero_title_highlight: "آلاف الكتب المجانية",
    hero_subtitle: "استكشف أكثر من 10,740 كتاباً ودورة وفيديو وبودكاست موثقة من قبل المجتمع الدولي بـ 53 لغة عالمية.",
    stat_resources: "مرجع تعليمي موثق",
    stat_languages: "لغة عالمية",
    stat_free: "وصول مجاني 100%",
    modal_title: "اختر لغة التصفح",
    modal_subtitle: "53 لغة حول العالم مدعومة مع مراجع وكتب موثقة",
    modal_search_placeholder: "ابحث عن لغة (مثال: العربية، الفرنسية، الإنجليزية)...",
    link_copied: "📋 تم نسخ الرابط بنجاح!",
    login: "تسجيل الدخول",
    create_account: "إنشاء حساب",
    lang_detected_toast: "🌍 تم تحديد لغتك تلقائياً: {lang}"
  },
  de: {
    search_placeholder: "Suche nach einem Buch, Technologie (z.B. Python, React, Rust)...",
    all_subjects: "Alle Themen",
    all_formats: "Alle Formate",
    active_lang: "Aktive Sprache",
    change_lang: "Ändern",
    topics: "Themen & Technologien",
    filter_topic_placeholder: "Thema filtern (z.B. Python)...",
    favorites: "Favoriten",
    fav_remove: "⭐ Aus Favoriten entfernt",
    fav_add: "🌟 Zu Favoriten hinzugefügt!",
    reset_filters: "✕ Zurücksetzen",
    empty_title: "Keine Ressourcen gefunden",
    empty_desc: "Versuche einen anderen Suchbegriff oder setze die Filter zurück.",
    prev_page: "← Zurück",
    next_page: "Weiter →",
    hero_badge: "⚡ Offizielle Open-Source-Bibliothek",
    hero_title_pre: "Lerne programmieren mit",
    hero_title_highlight: "Tausenden kostenlosen Büchern",
    hero_subtitle: "Entdecke über 10.740 Bücher, Kurse, Videos und Podcasts in 53 Sprachen.",
    stat_resources: "Referenzierte Ressourcen",
    stat_languages: "Sprachen Weltweit",
    stat_free: "100% Kostenloser Zugang",
    modal_title: "Sprache wählen",
    modal_subtitle: "53 Weltsprachen mit verifizierten Ressourcen verfügbar",
    modal_search_placeholder: "Sprache suchen (z.B. Deutsch, Englisch, Französisch)...",
    link_copied: "📋 Link in die Zwischenablage kopiert!",
    login: "Anmelden",
    create_account: "Konto erstellen",
    lang_detected_toast: "🌍 Sprache erkannt: {lang}"
  },
  pt_BR: {
    search_placeholder: "Pesquisar livro, tecnologia (ex: Python, React, Rust, Algoritmos)...",
    all_subjects: "Todos os tópicos",
    all_formats: "Todos os formatos",
    active_lang: "Idioma ativo",
    change_lang: "Alterar",
    topics: "Tópicos & Tecnologias",
    filter_topic_placeholder: "Filtrar tópico (ex: Python)...",
    favorites: "Favoritos",
    fav_remove: "⭐ Removido dos favoritos",
    fav_add: "🌟 Adicionado aos favoritos!",
    reset_filters: "✕ Redefinir",
    empty_title: "Nenhum recurso encontrado",
    empty_desc: "Tente alterar sua pesquisa ou redefina os filtros.",
    prev_page: "← Anterior",
    next_page: "Próximo →",
    hero_badge: "⚡ Biblioteca Oficial de Código Aberto",
    hero_title_pre: "Aprenda a programar com",
    hero_title_highlight: "milhares de livros gratuitos",
    hero_subtitle: "Explore mais de 10.740 livros, cursos, vídeos e podcasts verificados em 53 idiomas.",
    stat_resources: "Recursos Referenciados",
    stat_languages: "Idiomas Globais",
    stat_free: "100% Gratuito e Aberto",
    modal_title: "Escolha um idioma",
    modal_subtitle: "53 idiomas disponíveis com recursos verificados",
    modal_search_placeholder: "Pesquisar idioma (ex: Português, Inglês)...",
    link_copied: "📋 Link copiado para a área de transferência!",
    login: "Entrar",
    create_account: "Criar conta",
    lang_detected_toast: "🌍 Idioma detectado: {lang}"
  },
  zh: {
    search_placeholder: "搜索图书、技术（例如：Python、React、Rust、算法）...",
    all_subjects: "所有主题",
    all_formats: "所有格式",
    active_lang: "当前语言",
    change_lang: "更改",
    topics: "主题与技术",
    filter_topic_placeholder: "筛选主题（例如：Python）...",
    favorites: "收藏夹",
    fav_remove: "⭐ 已从收藏夹移除",
    fav_add: "🌟 已添加到收藏夹！",
    reset_filters: "✕ 重置",
    empty_title: "未找到相关资源",
    empty_desc: "请尝试更改搜索关键词或重置筛选条件。",
    prev_page: "← 上一页",
    next_page: "下一页 →",
    hero_badge: "⚡ 官方开源图书库",
    hero_title_pre: "通过",
    hero_title_highlight: "数千本免费编程书籍",
    hero_subtitle: "探索由全球社区维护的 10,740+ 本书籍、课程、视频及播客，涵盖 53 种语言。",
    stat_resources: "收录精选资源",
    stat_languages: "支持全球语言",
    stat_free: "100% 自由免费",
    modal_title: "选择浏览语言",
    modal_subtitle: "提供 53 种语言的高质量编程学习资源",
    modal_search_placeholder: "搜索语言（例如：中文、English、Français）...",
    link_copied: "📋 链接已复制到剪贴板！",
    login: "登录",
    create_account: "创建账号",
    lang_detected_toast: "🌍 已自动检测语言：{lang}"
  },
  ru: {
    search_placeholder: "Поиск книги, технологии (напр: Python, React, Rust, Алгоритмы)...",
    all_subjects: "Все темы",
    all_formats: "Все форматы",
    active_lang: "Текущий язык",
    change_lang: "Изменить",
    topics: "Темы и технологии",
    filter_topic_placeholder: "Фильтр тем (напр: Python)...",
    favorites: "Избранное",
    fav_remove: "⭐ Удалено из избранного",
    fav_add: "🌟 Добавлено в избранное!",
    reset_filters: "✕ Сбросить",
    empty_title: "Ничего не найдено",
    empty_desc: "Попробуйте изменить поисковый запрос или сбросить фильтры.",
    prev_page: "← Назад",
    next_page: "Вперёд →",
    hero_badge: "⚡ Официальная Open-Source Библиотека",
    hero_title_pre: "Учитесь программированию с",
    hero_title_highlight: "тысячами бесплатных книг",
    hero_subtitle: "Более 10 740 книг, курсов, видео и подкастов на 53 языках.",
    stat_resources: "Проверенных ресурсов",
    stat_languages: "Языков мира",
    stat_free: "100% Бесплатно",
    modal_title: "Выберите язык",
    modal_subtitle: "53 языка мира с проверенными материалами",
    modal_search_placeholder: "Поиск языка (напр: Русский, English)...",
    link_copied: "📋 Ссылка скопирована в буфер!",
    login: "Войти",
    create_account: "Создать аккаунт",
    lang_detected_toast: "🌍 Определён язык: {lang}"
  },
  ja: {
    search_placeholder: "本や技術を検索（例：Python、React、Rust、アルゴリズム）...",
    all_subjects: "すべてのトピック",
    all_formats: "すべての形式",
    active_lang: "現在の言語",
    change_lang: "変更",
    topics: "トピックと技術",
    filter_topic_placeholder: "トピックを絞り込む...",
    favorites: "お気に入り",
    fav_remove: "⭐ お気に入りから削除しました",
    fav_add: "🌟 お気に入りに追加しました！",
    reset_filters: "✕ リセット",
    empty_title: "リソースが見つかりません",
    empty_desc: "検索語を変更するか、フィルターをリセットしてください。",
    prev_page: "← 前へ",
    next_page: "次へ →",
    hero_badge: "⚡ 公式オープンソースライブラリ",
    hero_title_pre: "プログラミングを学ぶための",
    hero_title_highlight: "何千冊もの無料ブック",
    hero_subtitle: "53言語にわたる10,740冊以上の書籍、コース、動画、ポッドキャスト。",
    stat_resources: "厳選されたリソース",
    stat_languages: "対応言語数",
    stat_free: "100% 無料アクセス",
    modal_title: "言語を選択",
    modal_subtitle: "53の言語で学習教材を提供",
    modal_search_placeholder: "言語を検索（例：日本語、English）...",
    link_copied: "📋 リンクをクリップボードにコピーしました！",
    login: "ログイン",
    create_account: "アカウント作成",
    lang_detected_toast: "🌍 言語が検出されました: {lang}"
  },
  it: {
    search_placeholder: "Cerca un libro, tecnologia (es: Python, React, Rust, Algoritmi)...",
    all_subjects: "Tutti gli argomenti",
    all_formats: "Tutti i formati",
    active_lang: "Lingua attiva",
    change_lang: "Cambia",
    topics: "Argomenti & Tecnologie",
    filter_topic_placeholder: "Filtra argomento...",
    favorites: "Preferiti",
    fav_remove: "⭐ Rimosso dai preferiti",
    fav_add: "🌟 Aggiunto ai tuoi preferiti!",
    reset_filters: "✕ Reimposta",
    empty_title: "Nessuna risorsa trovata",
    empty_desc: "Prova a modificare la ricerca o reimposta i filtri.",
    prev_page: "← Precedente",
    next_page: "Successivo →",
    hero_badge: "⚡ Biblioteca Open Source Ufficiale",
    hero_title_pre: "Impara a programmare con",
    hero_title_highlight: "migliaia di libri gratuiti",
    hero_subtitle: "Esplora oltre 10.740 libri, corsi, video e podcast verificati in 53 lingue.",
    stat_resources: "Risorse Curate",
    stat_languages: "Lingue Globali",
    stat_free: "Accesso 100% Libero",
    modal_title: "Scegli una lingua",
    modal_subtitle: "53 lingue mondiali con risorse verificate",
    modal_search_placeholder: "Cerca una lingua...",
    link_copied: "📋 Link copiato negli appunti!",
    login: "Accedi",
    create_account: "Registrati",
    lang_detected_toast: "🌍 Lingua rilevata: {lang}"
  }
};

/**
 * Returns translated string for the given key and language, falling back to English or French.
 */
export function t(langCode, key, params = {}) {
  const dict = UI_TRANSLATIONS[langCode] || UI_TRANSLATIONS.en || UI_TRANSLATIONS.fr;
  let text = dict[key] || UI_TRANSLATIONS.en?.[key] || UI_TRANSLATIONS.fr?.[key] || key;

  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

/**
 * Returns the relevant tech logo / emoji icon for a given category name.
 */
export const getCategoryIcon = (categoryName) => {
      if (!categoryName) return "📘";
      const name = (categoryName || "")
        .toLowerCase()
        .split(String.fromCharCode(92))
        .join("")
        .trim();

      // Algorithms & Math
      if (name.includes("algo") || name.includes("structure") || name.includes("datastruct") || name.includes("estructuras")) return "🧮";
      if (name.includes("math") || name.includes("algebra") || name.includes("calculus") || name.includes("géométrie")) return "📐";
      if (name.includes("asymptote") || name.includes("metapost") || name.includes("tikz") || name.includes("pgf")) return "📐";

      // Core Web & JavaScript ecosystem
      if (name.includes("react")) return "⚛️";
      if (name.includes("vue")) return "💚";
      if (name.includes("angular")) return "🅰️";
      if (name.includes("svelte") || name.includes("astro")) return "🚀";
      if (name.includes("javascript") || name === "js" || name.includes("ecmascript")) return "🟨";
      if (name.includes("typescript") || name === "ts") return "🔷";
      if (name.includes("jquery")) return "🔷";
      if (name.includes("node") || name.includes("deno") || name.includes("bun")) return "🟩";
      if (name.includes("html") || name.includes("css") || name.includes("web") || name.includes("frontend") || name.includes("sass") || name.includes("less") || name.includes("flexbox")) return "🌐";

      // Python ecosystem
      if (name.includes("django")) return "🎸";
      if (name.includes("python") || name.includes("flask") || name.includes("fastapi")) return "🐍";

      // C / C++ / C# / .NET
      if (name.includes("c#") || name.includes("csharp") || name.includes(".net") || name.includes("asp") || name.includes("blazor")) return "🟣";
      if (name.includes("c++") || name.includes("cpp") || name.includes("c / c++")) return "⚙️";
      if (name === "c" || name.startsWith("c ") || name.endsWith(" c") || name.includes("ansi c")) return "🅲";

      // JVM & Mobile
      if (name.includes("java") && !name.includes("javascript")) return "☕";
      if (name.includes("kotlin")) return "🎯";
      if (name.includes("scala")) return "🪜";
      if (name.includes("android")) return "🤖";
      if (name.includes("ios") || name.includes("apple") || name.includes("swiftui") || name.includes("swift")) return "🐦";
      if (name.includes("flutter") || name.includes("dart")) return "💙";

      // PHP
      if (name.includes("symfony")) return "🎼";
      if (name.includes("php") || name.includes("laravel") || name.includes("yii") || name.includes("wordpress")) return "🐘";

      // Systems & Other Popular Languages
      if (name.includes("rust")) return "🦀";
      if (name.includes("ruby") || name.includes("rails")) return "💎";
      if (name.includes("golang") || name === "go" || name.startsWith("go ") || name.endsWith(" go")) return "🐹";
      if (name.includes("perl")) return "🐪";
      if (name.includes("lua")) return "🌙";
      if (name.includes("julia")) return "🟣";
      if (name.includes("assembl") || name.includes("nasm")) return "📟";
      if (name.includes("ada")) return "🕊️";
      if (name.includes("apl")) return "⍺";
      if (name.includes("fortran") || name.includes("cobol")) return "🔢";
      if (name.includes("pascal") || name.includes("delphi")) return "🏛️";
      if (name.includes("haskell") || name.includes("agda")) return "λ";
      if (name.includes("caml") || name.includes("ocaml")) return "🐫";
      if (name.includes("lisp") || name.includes("clojure") || name.includes("scheme") || name.includes("racket")) return "괄";
      if (name.includes("elixir") || name.includes("erlang")) return "💧";
      if (name === "r" || name.startsWith("r ") || name.endsWith(" r")) return "📈";
      if (name.includes("matlab") || name.includes("octave") || name.includes("scilab")) return "🔬";
      if (name.includes("rocq") || name.includes("coq")) return "🐓";
      if (name.includes("spip")) return "📰";
      if (name.includes("sage")) return "🌿";
      if (name.includes("meteor")) return "☄️";
      if (name.includes("processing")) return "🎨";
      if (name.includes("scratch")) return "🐱";
      if (name.includes("enfant") || name.includes("adolescent") || name.includes("pédagogie")) return "🎒";
      if (name.includes("tei")) return "📜";
      if (name.includes("méta") || name.includes("meta")) return "📑";
      if (name.includes("make")) return "🛠️";
      if (name.includes("basic") || name.includes("qbasic")) return "💾";
      if (name.includes("abap") || name.includes("sap")) return "💼";
      if (name.includes("script") || name.includes("autohotkey") || name.includes("autoit") || name.includes("applescript")) return "📜";

      // Databases & Storage
      if (name.includes("sql") || name.includes("mysql") || name.includes("postgres") || name.includes("sqlite") || name.includes("données") || name.includes("database") || name.includes("db") || name.includes("base de datos") || name.includes("banco de dados") || name.includes("mariadb")) return "🗄️";
      if (name.includes("mongo") || name.includes("nosql") || name.includes("redis")) return "🍃";

      // DevOps, Cloud & OS
      if (name.includes("docker") || name.includes("kubernetes") || name.includes("devops") || name.includes("container") || name.includes("ci/cd") || name.includes("ansible") || name.includes("terraform")) return "🐳";
      if (name.includes("sysadmin")) return "🖥️";
      if (name.includes("linux") || name.includes("ubuntu") || name.includes("debian") || name.includes("unix") || name.includes("système") || name.includes("exploitation") || name.includes("operating system")) return "🐧";
      if (name.includes("bash") || name.includes("shell") || name.includes("powershell") || name.includes("terminal") || name.includes("awk") || name.includes("command line") || name.includes("zsh")) return "💻";
      if (name.includes("cloud") || name.includes("aws") || name.includes("azure") || name.includes("gcp") || name.includes("amazon")) return "☁️";
      if (name.includes("git") || name.includes("github") || name.includes("version control")) return "🐙";

      // Emerging Tech & Architecture
      if (name.includes("blockchain") || name.includes("chaîne de blocs") || name.includes("crypto") || name.includes("web3") || name.includes("solidity") || name.includes("bitcoin") || name.includes("ethereum")) return "⛓️";
      if (name.includes("ia") || name.includes("ai") || name.includes("intelligence") || name.includes("machine learning") || name.includes("deep learning") || name.includes("nlp") || name.includes("llm")) return "🤖";
      if (name.includes("data science") || name.includes("big data") || name.includes("analytics") || name.includes("hadoop") || name.includes("spark") || name.includes("kafka")) return "📊";
      if (name.includes("sécur") || name.includes("secur") || name.includes("hack") || name.includes("pen") || name.includes("cyber") || name.includes("cryptog") || name.includes("sicherheit") || name.includes("seguridad")) return "🛡️";
      if (name.includes("réseau") || name.includes("network") || name.includes("telecom") || name.includes("ipv6") || name.includes("routing")) return "🔌";
      if (name.includes("vr") || name.includes("ar") || name.includes("xr") || name.includes("metaverse")) return "🥽";
      if (name.includes("game") || name.includes("jeu") || name.includes("unity") || name.includes("unreal") || name.includes("godot")) return "🎮";
      if (name.includes("arduino") || name.includes("raspberry") || name.includes("iot") || name.includes("embarqu") || name.includes("hardware") || name.includes("fpga")) return "🎛️";
      if (name.includes("test") || name.includes("qa") || name.includes("tdd") || name.includes("jest") || name.includes("cypress")) return "🧪";
      if (name.includes("architect") || name.includes("pattern") || name.includes("design pattern")) return "🏗️";
      if (name.includes("api") || name.includes("graphql") || name.includes("rest") || name.includes("microservice")) return "⚡";
      if (name.includes("vim") || name.includes("emacs") || name.includes("editor") || name.includes("ide") || name.includes("éditeur") || name.includes("vscode")) return "📝";
      if (name.includes("agile") || name.includes("scrum") || name.includes("projet") || name.includes("kanban")) return "📋";
      if (name.includes("logiciel") || name.includes("open source") || name.includes("libre")) return "🔓";
      if (name.includes("agnost")) return "🧩";
      if (name.includes("latex") || name.includes("tex") || name.includes("markdown")) return "📄";

      return "📘";
    };


/**
 * Returns the relevant tech logo / emoji icon for a given category name.
 */
export const getCategoryIcon = (categoryName) => {
  if (!categoryName) return "📘";
  const name = (categoryName || "").toLowerCase().replace(/\\/g, '').trim();

  // Specific prioritized tech & language logos
  if (name.includes("algo") || name.includes("structure")) return "🧮";
  if (name.includes("python") || name.includes("django") || name.includes("flask")) return "🐍";
  if (name.includes("javascript") || name === "js" || name.includes("ecmascript")) return "🟨";
  if (name.includes("typescript") || name === "ts") return "🔷";
  if (name.includes("react")) return "⚛️";
  if (name.includes("vue")) return "💚";
  if (name.includes("angular")) return "🅰️";
  if (name.includes("node")) return "🟩";
  if (name.includes("html") || name.includes("css") || name.includes("web") || name.includes("frontend")) return "🌐";
  if (name.includes("c#") || name.includes("csharp") || name.includes(".net")) return "🟣";
  if (name.includes("c++") || name.includes("cpp")) return "⚙️";
  if (name === "c" || name.startsWith("c ") || name.endsWith(" c") || name.includes("ansi c")) return "🅲";
  if (name.includes("java") && !name.includes("javascript")) return "☕";
  if (name.includes("kotlin")) return "🎯";
  if (name.includes("php") || name.includes("laravel") || name.includes("symfony")) return "🐘";
  if (name.includes("rust")) return "🦀";
  if (name.includes("ruby") || name.includes("rails")) return "💎";
  if (name.includes("golang") || name === "go" || name.startsWith("go ") || name.endsWith(" go")) return "🐹";
  if (name.includes("swift")) return "🐦";
  if (name.includes("flutter") || name.includes("dart")) return "💙";
  if (name.includes("sql") || name.includes("mysql") || name.includes("postgres") || name.includes("sqlite") || name.includes("données") || name.includes("database") || name.includes("db")) return "🗄️";
  if (name.includes("mongo")) return "🍃";
  if (name.includes("docker") || name.includes("kubernetes") || name.includes("devops") || name.includes("container")) return "🐳";
  if (name.includes("linux") || name.includes("ubuntu") || name.includes("debian") || name.includes("unix")) return "🐧";
  if (name.includes("bash") || name.includes("shell") || name.includes("powershell") || name.includes("terminal")) return "💻";
  if (name.includes("git")) return "🐙";
  if (name.includes("assembl")) return "📟";
  if (name.includes("ada")) return "🕊️";
  if (name.includes("apl")) return "⍺";
  if (name.includes("asymptote")) return "📐";
  if (name.includes("blockchain") || name.includes("chaîne de blocs") || name.includes("crypto") || name.includes("web3") || name.includes("solidity")) return "⛓️";
  if (name.includes("ia") || name.includes("ai") || name.includes("intelligence") || name.includes("machine learning") || name.includes("deep learning")) return "🤖";
  if (name.includes("data science") || name.includes("big data") || name.includes("analytics")) return "📊";
  if (name.includes("sécur") || name.includes("secur") || name.includes("hack") || name.includes("pen")) return "🛡️";
  if (name.includes("réseau") || name.includes("network") || name.includes("telecom") || name.includes("ipv6")) return "🔌";
  if (name.includes("cloud") || name.includes("aws") || name.includes("azure") || name.includes("gcp")) return "☁️";
  if (name.includes("android")) return "🤖";
  if (name.includes("ios") || name.includes("apple") || name.includes("swiftui")) return "🍏";
  if (name.includes("latex") || name.includes("tex")) return "📄";
  if (name.includes("fortran")) return "🔢";
  if (name.includes("pascal") || name.includes("delphi")) return "🏛️";
  if (name.includes("haskell")) return "λ";
  if (name.includes("caml") || name.includes("ocaml")) return "🐫";
  if (name.includes("lisp") || name.includes("clojure") || name.includes("scheme")) return "괄";
  if (name.includes("elixir") || name.includes("erlang")) return "💧";
  if (name.includes("scala")) return "🪜";
  if (name.includes("perl")) return "🐪";
  if (name.includes("jquery")) return "🔷";
  if (name === "r" || name.startsWith("r ") || name.endsWith(" r")) return "📈";
  if (name.includes("matlab") || name.includes("octave") || name.includes("scilab")) return "🔬";
  if (name.includes("math")) return "📐";
  if (name.includes("game") || name.includes("jeu") || name.includes("unity") || name.includes("unreal")) return "🎮";
  if (name.includes("arduino") || name.includes("raspberry") || name.includes("iot") || name.includes("embarqu")) return "🎛️";
  if (name.includes("test") || name.includes("qa")) return "🧪";
  if (name.includes("architect") || name.includes("pattern")) return "🏗️";
  if (name.includes("api") || name.includes("graphql") || name.includes("rest")) return "⚡";
  if (name.includes("vim") || name.includes("emacs") || name.includes("editor") || name.includes("ide") || name.includes("éditeur")) return "📝";
  if (name.includes("agile") || name.includes("scrum") || name.includes("projet")) return "📋";
  if (name.includes("logiciel") || name.includes("open source") || name.includes("libre")) return "🔓";
  if (name.includes("agnost")) return "🧩";
  return "📘";
};

