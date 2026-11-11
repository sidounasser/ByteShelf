import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
  useClerk
} from '@clerk/react';
import { LANGUAGES_META, getLangMeta } from './constants/languages.js';
import { detectVisitorLanguage, t, RTL_LANGS, getCategoryIcon } from './utils/languageDetector.js';

const extractDomain = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'web';
  }
};

const getFormatTagClass = (fmt) => {
  const f = (fmt || '').toLowerCase();
  if (f.includes('pdf')) return 'tag-pdf';
  if (f.includes('vidéo') || f.includes('video') || f.includes('youtube')) return 'tag-video';
  if (f.includes('epub')) return 'tag-epub';
  if (f.includes('podcast')) return 'tag-podcast';
  if (f.includes('interactif') || f.includes('cheatsheet')) return 'tag-inter';
  return 'tag-web';
};

export default function App() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  // Pending lesson lock protection
  const [pendingLesson, setPendingLesson] = useState(null);
  const pendingLessonRef = useRef(null);

  // Dataset State
  const [allResources, setAllResources] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Filter & Search State
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('fpb_manual_lang') || localStorage.getItem('fpb_lang') || 'fr';
  });
  const [detectedInfo, setDetectedInfo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilterQuery, setCatFilterQuery] = useState('');
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [sortBy, setSortBy] = useState('title_asc');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // Favorites State
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('fpb_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Modals & Feedback
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const searchInputRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3400);
  }, []);

  // 1. SMART AUTOMATIC LANGUAGE DETECTION (IP + BROWSER + MANUAL)
  useEffect(() => {
    let isMounted = true;
    detectVisitorLanguage().then((res) => {
      if (!isMounted) return;
      setDetectedInfo(res);
      if (res && res.lang) {
        setCurrentLang(res.lang);
        const meta = getLangMeta(res.lang);
        const isRtl = RTL_LANGS.includes(res.lang) || meta.rtl;

        // Apply RTL/LTR to HTML root
        document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', res.lang);

        // Show friendly notification if automatically detected
        if (!res.isManual && !sessionStorage.getItem('fpb_lang_notified')) {
          sessionStorage.setItem('fpb_lang_notified', 'true');
          const sourceLabels = {
            browser_and_country: `Navigateur & Pays`,
            browser: `Navigateur (${navigator.language || 'détecté'})`,
            ip_country: `Pays IP (${res.country || 'Géoloc'})`,
            default_fallback: `Par défaut`
          };
          const src = sourceLabels[res.source] || res.source;
          showToast(`🌍 ${t(res.lang, 'lang_detected_toast', { lang: `${meta.native || meta.fr} ${meta.flag}` })} [${src}]`);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // Handle manual language selection
  const handleSelectLanguage = (code) => {
    setCurrentLang(code);
    setSelectedCategory('all');
    localStorage.setItem('fpb_manual_lang', code);
    localStorage.setItem('fpb_lang', code);

    const meta = getLangMeta(code);
    const isRtl = RTL_LANGS.includes(code) || meta.rtl;
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', code);

    setIsLangModalOpen(false);
    showToast(`🌐 ${meta.native || meta.fr} ${meta.flag}`);
  };

  // Load dataset
  useEffect(() => {
    if (window.FPB_DATA && Array.isArray(window.FPB_DATA)) {
      setAllResources(window.FPB_DATA);
      setDataLoaded(true);
    } else {
      fetch('/resources.json')
        .then((res) => res.json())
        .then((data) => {
          setAllResources(data);
          setDataLoaded(true);
        })
        .catch((err) => {
          console.warn('Dataset loading fallback:', err);
          setDataLoaded(true);
        });
    }
  }, []);

  // Sync favorites
  useEffect(() => {
    try {
      localStorage.setItem('fpb_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [favorites]);

  const toggleFavorite = (res) => {
    const key = `${res.u}|${res.t}`;
    setFavorites((prev) => {
      const exists = prev.includes(key);
      const next = exists ? prev.filter((k) => k !== key) : [...prev, key];
      showToast(exists ? t(currentLang, 'fav_remove') : t(currentLang, 'fav_add'));
      return next;
    });
  };

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === 'Escape') {
        setIsLangModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentLang, selectedCategory, selectedFormat, searchQuery, onlyFavorites, sortBy]);

  // Filtered language resources
  const langResources = useMemo(() => {
    if (currentLang === 'all') return allResources;
    return allResources.filter((r) => r.l === currentLang);
  }, [allResources, currentLang]);

  // Categories with counts
  const categories = useMemo(() => {
    const counts = {};
    for (const r of langResources) {
      const cat = r.c || 'Autre';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [langResources]);

  // Filtered categories for sidebar search
  const filteredCategories = useMemo(() => {
    if (!catFilterQuery.trim()) return categories;
    const q = catFilterQuery.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, catFilterQuery]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    let result = langResources;

    if (selectedCategory !== 'all') {
      result = result.filter((r) => r.c === selectedCategory);
    }

    if (selectedFormat !== 'all') {
      result = result.filter((r) => (r.f || '').toLowerCase().includes(selectedFormat.toLowerCase()));
    }

    if (onlyFavorites) {
      result = result.filter((r) => favorites.includes(`${r.u}|${r.t}`));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          (r.t && r.t.toLowerCase().includes(q)) ||
          (r.a && r.a.toLowerCase().includes(q)) ||
          (r.c && r.c.toLowerCase().includes(q))
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'title_asc') return (a.t || '').localeCompare(b.t || '');
      if (sortBy === 'title_desc') return (b.t || '').localeCompare(a.t || '');
      if (sortBy === 'cat_asc') return (a.c || '').localeCompare(b.c || '');
      return 0;
    });
  }, [langResources, selectedCategory, selectedFormat, onlyFavorites, searchQuery, sortBy, favorites]);

  // Pagination
  const totalPages = Math.ceil(filteredResources.length / pageSize) || 1;
  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResources.slice(start, start + pageSize);
  }, [filteredResources, currentPage, pageSize]);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedFormat('all');
    setSearchQuery('');
    setOnlyFavorites(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    showToast(t(currentLang, 'link_copied'));
  };

  const handleOpenLesson = (res, e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    if (!isSignedIn) {
      setPendingLesson(res);
      pendingLessonRef.current = res;
      showToast(`🔒 Veuillez vous connecter pour accéder à "${res.t}"`);
      if (typeof openSignIn === 'function') {
        openSignIn();
      }
      return;
    }

    window.open(res.u, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (isSignedIn && pendingLessonRef.current) {
      const target = pendingLessonRef.current;
      showToast(`🎉 Connecté avec succès ! Ouverture de "${target.t}"...`);
      const timer = setTimeout(() => {
        window.open(target.u, '_blank', 'noopener,noreferrer');
        pendingLessonRef.current = null;
        setPendingLesson(null);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, showToast]);

  const meta = getLangMeta(currentLang);

  return (
    <div className="app-container">
      {/* ====================================================================
          TOP NAVIGATION BAR (WITH CLERK INTEGRATION)
          ==================================================================== */}
      <header className="navbar">
        <div className="navbar-inner">
          {/* Brand */}
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="brand-icon">📚</div>
            <div className="brand-name">Free Programming Books</div>
          </div>

          {/* Search Bar */}
          <div className="nav-search">
            <span className="nav-search-icon">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t(currentLang, 'search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="nav-search-clear visible"
                onClick={() => setSearchQuery('')}
                title="Effacer la recherche"
              >
                ✕
              </button>
            )}
            <span className="nav-search-kbd">Ctrl K</span>
          </div>

          {/* Actions: Languages, Favorites, Clerk Auth */}
          <div className="nav-actions">
            {/* Language Selector */}
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setIsLangModalOpen(true)}
              title="Changer de langue parmi les 53 disponibles"
            >
              <span>{meta.flag}</span>
              <span>{meta.native || meta.fr}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>▾</span>
            </button>

            {/* Favorites Filter */}
            <button
              type="button"
              className={`btn-ghost ${onlyFavorites ? 'active-fav' : ''}`}
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              title={t(currentLang, 'favorites')}
            >
              <span>⭐</span>
              <span>{t(currentLang, 'favorites')} ({favorites.length})</span>
            </button>

            {/* Clerk Authentication Controls */}
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button type="button" className="btn-ghost" title={t(currentLang, 'login')}>
                  <span>🔐</span>
                  <span>{t(currentLang, 'login')}</span>
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button type="button" className="btn-primary" style={{ padding: '0.48rem 0.95rem' }} title={t(currentLang, 'create_account')}>
                  <span>✨</span>
                  <span>{t(currentLang, 'create_account')}</span>
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {user?.firstName ? `Bonjour, ${user.firstName}` : user?.primaryEmailAddress?.emailAddress}
                </span>
                <UserButton
                  showName={false}
                  userProfileMode="modal"
                />
              </div>
            </Show>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN CONTENT AREA
          ==================================================================== */}
      <main className="main-content">
        {/* Editorial Hero Banner */}
        <section className="hero-section">
          <div className="hero-card">
            <div className="hero-info">
              <div className="hero-badge">
                <span>⚡</span>
                <span>{t(currentLang, 'hero_badge')}</span>
              </div>
              <h1 className="hero-title">
                {t(currentLang, 'hero_title_pre')}{' '}
                <span className="highlight-text">{t(currentLang, 'hero_title_highlight')}</span>
              </h1>
              <p className="hero-subtitle">
                {t(currentLang, 'hero_subtitle')}
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-val">{allResources.length.toLocaleString()}</div>
                  <div className="stat-lbl">{t(currentLang, 'stat_resources')}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-val">53</div>
                  <div className="stat-lbl">{t(currentLang, 'stat_languages')}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-val">100%</div>
                  <div className="stat-lbl">{t(currentLang, 'stat_free')}</div>
                </div>
              </div>
            </div>
            <div className="hero-media">
              <img
                src="hero-ebook.jpg"
                alt="Illustration Editorial Ebook Library"
                className="hero-image"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </section>

        {/* Workspace: Sidebar + Results Grid */}
        <div className="workspace">
          {/* Left Vertical Sidebar (Clean, NO horizontal scrollbar) */}
          <aside className="sidebar">
            {/* Mobile Filter Header Toggle */}
            <button
              type="button"
              className="sidebar-mobile-toggle"
              onClick={() => setIsMobileExpanded(!isMobileExpanded)}
              title="Afficher ou masquer les filtres"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚡</span>
                <span style={{ fontWeight: 700 }}>Filtres & Sujets</span>
                <span className="side-count">{categories.length}</span>
              </span>
              <span style={{ transform: isMobileExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                ▼
              </span>
            </button>

            <div className={`sidebar-collapsible ${isMobileExpanded ? 'expanded' : ''}`}>
              <div className="side-group">
                <div className="side-label">
                  <span>{t(currentLang, 'active_lang')}</span>
                  <button
                    type="button"
                    className="side-action-link"
                    onClick={() => setIsLangModalOpen(true)}
                  >
                    {t(currentLang, 'change_lang')}
                  </button>
                </div>
                <button
                  type="button"
                  className="side-nav-btn active"
                  onClick={() => setIsLangModalOpen(true)}
                >
                  <span className="side-nav-left">
                    <span>{meta.flag}</span>
                    <span>{meta.native || meta.fr}</span>
                  </span>
                  <span className="side-count">{langResources.length}</span>
                </button>
              </div>

              {/* Topics Filter */}
              <div className="side-group">
                <div className="side-label">
                  <span>{t(currentLang, 'topics')}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {categories.length}
                  </span>
                </div>
                <input
                  type="text"
                  className="side-cat-search"
                  placeholder={t(currentLang, 'filter_topic_placeholder')}
                  value={catFilterQuery}
                  onChange={(e) => setCatFilterQuery(e.target.value)}
                />
                <div className="side-cat-list">
                  <button
                    type="button"
                    className={`side-nav-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    <span className="side-nav-left">
                      <span>✨</span>
                      <span>{t(currentLang, 'all_subjects')}</span>
                    </span>
                    <span className="side-count">{langResources.length}</span>
                  </button>

                  {filteredCategories.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      className={`side-nav-btn ${selectedCategory === c.name ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(c.name)}
                      title={c.name}
                    >
                      <span className="side-nav-left">
                        <span className="cat-icon">{getCategoryIcon(c.name)}</span>
                        <span className="cat-name">{c.name}</span>
                      </span>
                      <span className="side-count">{c.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Main Content Panel */}
          <div className="content-pane">
            {/* Toolbar */}
            <div className="content-toolbar">
              <div className="toolbar-left">
                <span>
                  <strong>{filteredResources.length.toLocaleString()}</strong> ressource(s) en <strong>{meta.flag} {meta.native || meta.fr}</strong>
                </span>
                {(selectedCategory !== 'all' || selectedFormat !== 'all' || searchQuery || onlyFavorites) && (
                  <button type="button" className="btn-clear-filters" onClick={resetAllFilters}>
                    {t(currentLang, 'reset_filters')}
                  </button>
                )}
              </div>

              <div className="toolbar-right">
                {/* Format Pills */}
                <div className="format-pills">
                  {['all', 'Web', 'PDF', 'Vidéo', 'EPUB', 'Podcast', 'Interactif'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      className={`format-pill ${selectedFormat === (fmt === 'all' ? 'all' : fmt.toLowerCase()) ? 'active' : ''}`}
                      onClick={() => setSelectedFormat(fmt === 'all' ? 'all' : fmt.toLowerCase())}
                    >
                      {fmt === 'all' ? t(currentLang, 'all_formats') : fmt}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="title_asc">Titre (A → Z)</option>
                  <option value="title_desc">Titre (Z → A)</option>
                  <option value="cat_asc">Sujet (A → Z)</option>
                </select>

                {/* View Mode Toggle */}
                <div className="view-toggle">
                  <button
                    type="button"
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Vue grille"
                  >
                    ⊞
                  </button>
                  <button
                    type="button"
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="Vue liste"
                  >
                    ≡
                  </button>
                </div>
              </div>
            </div>

            {/* Resource Cards */}
            {paginatedResources.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>{t(currentLang, 'empty_title')}</h3>
                <p>{t(currentLang, 'empty_desc')}</p>
                <button type="button" className="btn-primary" onClick={resetAllFilters} style={{ marginTop: '1rem' }}>
                  {t(currentLang, 'reset_filters')}
                </button>
              </div>
            ) : (
              <div className={`resource-${viewMode}`}>
                {paginatedResources.map((res) => {
                  const isFav = favorites.includes(`${res.u}|${res.t}`);
                  const domain = extractDomain(res.u);
                  const tagClass = getFormatTagClass(res.f);

                  return (
                    <div
                      key={`${res.u}|${res.t}`}
                      className="card"
                      onClick={(e) => {
                        if (e.target.closest('.card-fav-btn') || e.target.closest('.card-category-badge') || e.target.closest('.btn-copy-link')) return;
                        handleOpenLesson(res, e);
                      }}
                      style={{ cursor: 'pointer' }}
                      title={`Accéder à la leçon : ${res.t}`}
                    >
                      <div className="card-top">
                        <span className={`tag ${tagClass}`}>{res.f || 'Livre'}</span>
                        <button
                          type="button"
                          className={`card-fav-btn ${isFav ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(res);
                          }}
                          title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          {isFav ? '⭐' : '☆'}
                        </button>
                      </div>

                      <h3 className="card-title">
                        <a
                          href={res.u}
                          onClick={(e) => handleOpenLesson(res, e)}
                          title={`Accéder à la leçon : ${res.t}`}
                        >
                          {res.t}
                        </a>
                      </h3>

                      {res.a && <div className="card-author">Auteur : {res.a}</div>}

                      <div className="card-bottom">
                        <div
                          className="card-category-badge"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(res.c);
                          }}
                          style={{ cursor: 'pointer' }}
                          title={`Filtrer par ${res.c}`}
                        >
                          <span style={{ marginRight: '0.35rem' }}>{getCategoryIcon(res.c)}</span>
                          <span>{res.c}</span>
                        </div>
                        <div className="card-actions-row">
                          <button
                            type="button"
                            className="btn-copy-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(res.u);
                            }}
                            title="Copier le lien"
                          >
                            🔗
                          </button>
                          <a
                            href={res.u}
                            onClick={(e) => handleOpenLesson(res, e)}
                            className="card-link"
                            title="Accéder à la leçon"
                          >
                            <span>{domain}</span>
                            <span>↗</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => p - 1);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                >
                  {t(currentLang, 'prev_page')}
                </button>

                <div className="page-numbers">
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) pageNum = i + 1;
                    else if (currentPage <= 4) pageNum = i + 1;
                    else if (currentPage >= totalPages - 3) pageNum = totalPages - 6 + i;
                    else pageNum = currentPage - 3 + i;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => p + 1);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                >
                  {t(currentLang, 'next_page')}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <p>
          ByteShelf • Bibliothèque propulsée par{' '}
          <a
            href="https://github.com/EbookFoundation/free-programming-books"
            target="_blank"
            rel="noopener noreferrer"
          >
            EbookFoundation/free-programming-books
          </a>{' '}
          • 10 740 ressources vérifiées en 53 langues mondiales
        </p>
      </footer>

      {/* ====================================================================
          LANGUAGE SELECTION MODAL (53 LANGUAGES)
          ==================================================================== */}
      {isLangModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsLangModalOpen(false)}>
          <div className="lang-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lang-modal-header">
              <div>
                <h2>{t(currentLang, 'modal_title')}</h2>
                <p>{t(currentLang, 'modal_subtitle')}</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsLangModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="lang-modal-search">
              <input
                type="text"
                placeholder={t(currentLang, 'modal_search_placeholder')}
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="lang-grid">
              {Object.entries(LANGUAGES_META)
                .filter(([code, info]) => {
                  if (!langSearch.trim()) return true;
                  const q = langSearch.toLowerCase();
                  return info.fr.toLowerCase().includes(q) || info.native.toLowerCase().includes(q) || code.toLowerCase().includes(q);
                })
                .map(([code, info]) => {
                  const count = code === 'all'
                    ? allResources.length
                    : allResources.filter((r) => r.l === code).length;

                  return (
                    <button
                      key={code}
                      type="button"
                      className={`lang-card ${currentLang === code ? 'active' : ''}`}
                      onClick={() => handleSelectLanguage(code)}
                    >
                      <div className="lang-card-flag">{info.flag}</div>
                      <div className="lang-card-names">
                        <span className="lang-card-fr">{info.native || info.fr}</span>
                        <span className="lang-card-native">{info.fr}</span>
                      </div>
                      <span className="lang-card-badge">{count}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TOAST NOTIFICATION
          ==================================================================== */}
      <div className={`toast ${toastVisible ? 'visible' : ''}`}>
        {toastMsg}
      </div>
    </div>
  );
}
