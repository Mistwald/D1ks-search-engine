// Search functionality
class D1ksSearchEngine {
    constructor() {
        this.currentPage = 1;
        this.resultsPerPage = 10;
        this.mockResults = this.generateMockResults();
        this.searchHistory = this.loadSearchHistory();
        this.searchCache = new Map();
        this.selectedSuggestionIndex = -1;
        this.isDarkTheme = localStorage.getItem('theme') === 'dark';
        this.settings = this.loadSettings();
        this.useRealAPI = true; // try real search API (DuckDuckGo); falls back to mock results
        this.lastResults = [];
        this.lastResultsQuery = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.applySettings();
        this.initAnimations();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const moreBtn = document.getElementById('moreBtn');
        const createAccountBtn = document.getElementById('createAccountBtn');
        const signInBtn = document.getElementById('signInBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const advancedSearchBtn = document.getElementById('advancedSearchBtn');
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        const modalClose = document.querySelectorAll('.modal-close');
        const easterEgg = document.querySelector('.easter-egg');
        const searchSuggestions = document.getElementById('searchSuggestions');

        // Search functionality
        searchBtn.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Search suggestions
        searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
        searchInput.addEventListener('focus', () => this.showSuggestions());
        searchInput.addEventListener('blur', () => {
            setTimeout(() => this.hideSuggestions(), 200);
        });

        // Keyboard navigation for suggestions
        searchInput.addEventListener('keydown', (e) => this.handleSuggestionNavigation(e));

        // More button modal
        moreBtn.addEventListener('click', () => this.showMoreModal());

        // Modal close functionality
        modalClose.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal);
            });
        });

        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });

        // Account buttons
        createAccountBtn.addEventListener('click', () => this.showCreateAccount());
        signInBtn.addEventListener('click', () => this.showSignIn());
        settingsBtn.addEventListener('click', () => this.showSettings());

        // Advanced search
        advancedSearchBtn.addEventListener('click', () => this.showAdvancedSearch());
        document.getElementById('applyAdvancedSearch').addEventListener('click', () => this.applyAdvancedSearch());

        // Theme toggle
        themeToggleBtn.addEventListener('click', () => this.toggleTheme());

        // Settings
        document.getElementById('clearHistory').addEventListener('click', () => this.clearSearchHistory());
        document.getElementById('saveHistory').addEventListener('change', (e) => this.toggleHistorySaving(e.target.checked));
        document.getElementById('resultsPerPage').addEventListener('change', (e) => this.updateResultsPerPage(e.target.value));

        // Easter egg - Rickroll
        easterEgg.addEventListener('click', () => this.rickroll());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    async performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();

        if (!query) {
            alert('Please enter a search term');
            return;
        }

        // Add to search history
        this.addToSearchHistory(query);

        this.currentPage = 1;

        // Check cache first
        const cacheKey = `${query}_${this.currentPage}`;
        if (this.searchCache.has(cacheKey)) {
            this.displayCachedResults(cacheKey);
            this.hideSuggestions();
            return;
        }

        // Try real API, fallback to mock filtering
        let fetched = [];
        if (this.useRealAPI) {
            try {
                fetched = await this.fetchRealSearch(query);
            } catch (e) {
                console.warn('Real search failed, falling back to mock results', e);
                fetched = [];
            }
        }

        if (!fetched || fetched.length === 0) {
            // fallback to local mock filtering
            fetched = this.mockResults.filter(result =>
                result.title.toLowerCase().includes(query.toLowerCase()) ||
                result.description.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Store last results for pagination/display
        this.lastResults = fetched;
        this.lastResultsQuery = query;

        // Cache initial page results
        this.cacheResults(`${query}_${this.currentPage}`, { query, data: fetched });

        this.displayResults(query);
        this.hideSuggestions();
    }

    // Animation initialization
    initAnimations() {
        // Add animation classes to elements
        this.addAnimationClasses();

        // Setup intersection observer for scroll animations
        this.setupScrollAnimations();

        // Add loading animation to search box
        this.setupLoadingAnimations();
    }

    addAnimationClasses() {
        // Elements that should animate on page load
        const elements = [
            { selector: '.logo', class: 'animate-bounce-in' },
            { selector: '.search-box', class: 'animate-fade-in-up animate-delay-1' },
            { selector: '.search-options', class: 'animate-fade-in-up animate-delay-2' },
            { selector: '.footer-content', class: 'animate-fade-in-up animate-delay-3' },
            { selector: '.easter-egg', class: 'animate-bounce-in animate-delay-4' }
        ];

        elements.forEach(({ selector, class: className }) => {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('animate-on-load', className);
            }
        });
    }

    setupScrollAnimations() {
        // Intersection Observer for scroll-reveal animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe result items for scroll animations
        document.addEventListener('DOMContentLoaded', () => {
            const observeElements = () => {
                document.querySelectorAll('.result-item').forEach(item => {
                    item.classList.add('animate-on-load');
                    observer.observe(item);
                });
            };

            // Initial observation
            observeElements();

            // Re-observe when new results are loaded
            const searchResults = document.getElementById('searchResults');
            if (searchResults) {
                const mutationObserver = new MutationObserver(observeElements);
                mutationObserver.observe(searchResults, { childList: true });
            }
        });
    }

    setupLoadingAnimations() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        // Add loading state animation
        searchInput.addEventListener('input', () => {
            if (searchInput.value.length > 0) {
                searchBtn.classList.add('animate-pulse');
            } else {
                searchBtn.classList.remove('animate-pulse');
            }
        });
    }

    // Enhanced modal animations
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'flex';

        // Add staggered animation to modal content
        setTimeout(() => {
            modal.classList.add('show');

            // Animate modal buttons
            const buttons = modal.querySelectorAll('.modal-option-btn, .modal-btn');
            buttons.forEach((btn, index) => {
                btn.style.opacity = '0';
                btn.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    btn.style.transition = 'all 0.3s ease';
                    btn.style.opacity = '1';
                    btn.style.transform = 'translateY(0)';
                }, 100 + (index * 50));
            });
        }, 10);
    }

    hideModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Enhanced search result animations
    displayResultsFromData(query, filteredResults) {
        const searchResults = document.getElementById('searchResults');
        const pagination = document.getElementById('pagination');

        // Calculate pagination
        const totalPages = Math.ceil(filteredResults.length / this.resultsPerPage);
        const startIndex = (this.currentPage - 1) * this.resultsPerPage;
        const endIndex = startIndex + this.resultsPerPage;
        const currentResults = filteredResults.slice(startIndex, endIndex);

        // Clear and add loading animation
        searchResults.innerHTML = '<div class="loading-shimmer" style="height: 100px; border-radius: 8px; margin-bottom: 20px;"></div>'.repeat(3);

        // Simulate loading delay for animation effect
        setTimeout(() => {
            this.displayResultsContent(query, currentResults, totalPages);
        }, 300);
    }

    displayResultsContent(query, currentResults, totalPages) {
        const searchResults = document.getElementById('searchResults');
        const pagination = document.getElementById('pagination');

        // Display results
        searchResults.innerHTML = '';

        if (currentResults.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results animate-fade-in-up">
                    <h3>No results found for "${query}"</h3>
                    <p>Try different keywords or check your spelling</p>
                </div>
            `;
        } else {
            currentResults.forEach((result, index) => {
                const resultElement = document.createElement('div');
                resultElement.className = 'result-item animate-on-load';
                resultElement.style.animationDelay = `${index * 0.1}s`;
                resultElement.innerHTML = `
                    <a href="${result.url}" class="result-title" target="_blank">${result.title}</a>
                    <div class="result-url">${result.url}</div>
                    <div class="result-description">${result.description}</div>
                `;
                searchResults.appendChild(resultElement);
            });
        }

        // Display pagination with animation
        this.displayPagination(totalPages, query);
    }

    // Enhanced suggestion animations
    showSuggestions(query = '') {
        const suggestionsDiv = document.getElementById('searchSuggestions');
        const searchInput = document.getElementById('searchInput');

        let suggestions = [];

        if (query) {
            // Get matching suggestions from history and mock data
            suggestions = this.getSuggestions(query);
        } else {
            // Show recent searches
            suggestions = this.getRecentSearches();
        }

        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        suggestionsDiv.innerHTML = '';
        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item animate-on-load';
            item.style.animationDelay = `${index * 0.05}s`;
            item.innerHTML = `
                <i class="fas ${suggestion.icon} suggestion-icon"></i>
                <span class="suggestion-text">${suggestion.text}</span>
                ${suggestion.type ? `<span class="suggestion-type">${suggestion.type}</span>` : ''}
            `;
            item.addEventListener('click', () => {
                searchInput.value = suggestion.text;
                this.performSearch();
            });
            suggestionsDiv.appendChild(item);
        });

        suggestionsDiv.style.display = 'block';
        this.selectedSuggestionIndex = -1;
    }

    handleSearchInput(e) {
        const query = e.target.value.trim();
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        this.showSuggestions(query);
    }

    hideSuggestions() {
        document.getElementById('searchSuggestions').style.display = 'none';
        this.selectedSuggestionIndex = -1;
    }

    getSuggestions(query) {
        const allSuggestions = [
            ...this.searchHistory.slice(0, 5).map(text => ({ text, icon: 'fa-history', type: 'Recent' })),
            ...this.mockResults.slice(0, 10).map(result => ({
                text: result.title,
                icon: 'fa-search',
                type: 'Suggestion'
            }))
        ];

        return allSuggestions
            .filter(s => s.text.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 8);
    }

    getRecentSearches() {
        return this.searchHistory.slice(0, 5).map(text => ({
            text,
            icon: 'fa-history',
            type: 'Recent'
        }));
    }

    handleSuggestionNavigation(e) {
        const suggestionsDiv = document.getElementById('searchSuggestions');
        const items = suggestionsDiv.querySelectorAll('.suggestion-item');

        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedSuggestionIndex = Math.min(this.selectedSuggestionIndex + 1, items.length - 1);
            this.updateSuggestionSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
            this.updateSuggestionSelection(items);
        } else if (e.key === 'Enter' && this.selectedSuggestionIndex >= 0) {
            e.preventDefault();
            items[this.selectedSuggestionIndex].click();
        }
    }

    updateSuggestionSelection(items) {
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedSuggestionIndex);
        });

        if (this.selectedSuggestionIndex >= 0) {
            document.getElementById('searchInput').value = items[this.selectedSuggestionIndex].querySelector('.suggestion-text').textContent;
        }
    }

    displayResults(query) {
        const resultsContainer = document.getElementById('resultsContainer');
        const searchResults = document.getElementById('searchResults');
        const pagination = document.getElementById('pagination');
        const searchContainer = document.querySelector('.search-container');

        // Show results container, hide search container
        resultsContainer.style.display = 'block';
        searchContainer.style.display = 'none';

        // Use last fetched results if they match this query, otherwise fallback to mock filter
        let filteredResults = [];
        if (this.lastResults && this.lastResultsQuery === query) {
            filteredResults = this.lastResults;
        } else {
            filteredResults = this.mockResults.filter(result =>
                result.title.toLowerCase().includes(query.toLowerCase()) ||
                result.description.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Apply advanced filters if any
        if (this.advancedFilters) {
            if (this.advancedFilters.resultType) {
                // In a real implementation, this would filter by actual result type
                filteredResults = filteredResults.slice(0, Math.floor(filteredResults.length * 0.7));
            }
        }

        // Cache this page's results (object with query + data)
        const cacheKey = `${query}_${this.currentPage}`;
        this.cacheResults(cacheKey, { query, data: filteredResults });

        this.displayResultsFromData(query, filteredResults);
    }

    displayPagination(totalPages, query) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.textContent = 'Previous';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.displayResults(query);
            }
        });
        pagination.appendChild(prevBtn);

        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'page-btn';
            if (i === this.currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                this.currentPage = i;
                this.displayResults(query);
            });
            pagination.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.textContent = 'Next';
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.displayResults(query);
            }
        });
        pagination.appendChild(nextBtn);
    }

    showMoreModal() {
        this.showModal('moreModal');
    }

    rickroll() {
        // Redirect to Rick Astley's "Never Gonna Give You Up"
        window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
    }

    showCreateAccount() {
        alert('Create Account feature would open a registration form. This is a demo version.');
        this.hideModal(document.getElementById('moreModal'));
    }

    showSignIn() {
        alert('Sign In feature would open a login form. This is a demo version.');
        this.hideModal(document.getElementById('moreModal'));
    }

    // Search history functionality
    loadSearchHistory() {
        const history = localStorage.getItem('d1ks_search_history');
        return history ? JSON.parse(history) : [];
    }

    saveSearchHistory() {
        localStorage.setItem('d1ks_search_history', JSON.stringify(this.searchHistory));
    }

    addToSearchHistory(query) {
        if (!this.settings.saveHistory) return;

        // Remove if already exists and add to beginning
        this.searchHistory = this.searchHistory.filter(item => item !== query);
        this.searchHistory.unshift(query);

        // Keep only last 20 searches
        this.searchHistory = this.searchHistory.slice(0, 20);

        this.saveSearchHistory();
    }

    clearSearchHistory() {
        this.searchHistory = [];
        localStorage.removeItem('d1ks_search_history');
        alert('Search history cleared!');
    }

    toggleHistorySaving(enabled) {
        this.settings.saveHistory = enabled;
        this.saveSettings();

        if (!enabled) {
            this.clearSearchHistory();
        }
    }

    // Settings functionality
    loadSettings() {
        const saved = localStorage.getItem('d1ks_settings');
        return saved ? JSON.parse(saved) : {
            saveHistory: true,
            resultsPerPage: 10,
            safeSearch: 'moderate',
            language: 'en'
        };
    }

    saveSettings() {
        localStorage.setItem('d1ks_settings', JSON.stringify(this.settings));
    }

    applySettings() {
        document.getElementById('saveHistory').checked = this.settings.saveHistory;
        document.getElementById('resultsPerPage').value = this.settings.resultsPerPage;
        document.getElementById('safeSearch').value = this.settings.safeSearch;
        document.getElementById('language').value = this.settings.language;
        this.resultsPerPage = parseInt(this.settings.resultsPerPage);
    }

    updateResultsPerPage(value) {
        this.settings.resultsPerPage = parseInt(value);
        this.resultsPerPage = parseInt(value);
        this.saveSettings();
    }

    // Theme functionality
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        this.applyTheme();
    }

    applyTheme() {
        const body = document.body;
        const themeBtn = document.getElementById('themeToggleBtn');

        if (this.isDarkTheme) {
            body.classList.add('dark-theme');
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.classList.remove('dark-theme');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }

        localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    }

    showAdvancedSearch() {
        this.showModal('advancedSearchModal');
    }

    showSettings() {
        this.showModal('settingsModal');
        this.hideModal(document.getElementById('moreModal'));
    }

    applyAdvancedSearch() {
        const exactPhrase = document.getElementById('exactPhrase').value;
        const excludeWords = document.getElementById('excludeWords').value;
        const dateRange = document.getElementById('dateRange').value;
        const resultType = document.getElementById('resultType').value;
        const region = document.getElementById('region').value;

        let query = document.getElementById('searchInput').value;

        if (exactPhrase) {
            query += ` "${exactPhrase}"`;
        }

        if (excludeWords) {
            const words = excludeWords.split(' ').map(word => `-${word}`).join(' ');
            query += ` ${words}`;
        }

        // Store filters for use in search
        this.advancedFilters = { dateRange, resultType, region };

        document.getElementById('searchInput').value = query;
        this.hideModal(document.getElementById('advancedSearchModal'));
        this.performSearch();
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl+K: Focus search
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }

        // Ctrl+/: Open advanced search
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            this.showAdvancedSearch();
        }

        // Ctrl+T: Toggle theme
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            this.toggleTheme();
        }

        // Escape: Close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                this.hideModal(modal);
            });
        }
    }

    // Search result caching
    cacheResults(query, results) {
        // `query` may already be a composite cache key (e.g. `${q}_${page}`),
        // but to remain compatible with existing calls we honor that.
        const cacheKey = `${query}`;
        this.searchCache.set(cacheKey, results);

        // Limit cache size
        if (this.searchCache.size > 50) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }
    }

    displayCachedResults(cacheKey) {
        const results = this.searchCache.get(cacheKey);
        if (results && results.query) {
            this.displayResultsFromData(results.query, results.data);
        }
    }

    // Fetch simple results from DuckDuckGo Instant Answer API (no API key required).
    // Note: If the API is blocked by CORS in some environments this will fail
    // and the code will gracefully fall back to local mock results.
    async fetchRealSearch(query) {
        const endpoint = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
        try {
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error('Network response not ok');
            const data = await res.json();

            const results = [];

            if (data.AbstractURL || data.AbstractText) {
                results.push({
                    title: data.Heading || query,
                    url: data.AbstractURL || '#',
                    description: data.AbstractText || ''
                });
            }

            const topics = data.RelatedTopics || [];
            const flatten = (arr) => {
                const out = [];
                arr.forEach(item => {
                    if (item.Topics) {
                        item.Topics.forEach(t => out.push(t));
                    } else {
                        out.push(item);
                    }
                });
                return out;
            };

            const flat = flatten(topics);
            flat.forEach(t => {
                if (t && t.FirstURL && t.Text) {
                    results.push({ title: t.Text, url: t.FirstURL, description: '' });
                }
            });

            return results.slice(0, 100);
        } catch (err) {
            console.warn('DuckDuckGo fetch failed:', err);
            return [];
        }
    }

    generateMockResults() {
        return [
            {
                title: 'D1Ks Search Engine - Professional Web Search',
                url: 'https://www.d1ks.com',
                description: 'Discover the power of D1Ks search engine with advanced features, intelligent suggestions, and professional results.'
            },
            {
                title: 'Modern Web Development Best Practices',
                url: 'https://developer.mozilla.org',
                description: 'Learn about modern web development, HTML5, CSS3, JavaScript, and responsive design techniques.'
            },
            {
                title: 'Search Engine Optimization Guide',
                url: 'https://developers.google.com/search',
                description: 'Master SEO techniques to improve your website visibility and ranking on search engines.'
            },
            {
                title: 'JavaScript Animation Libraries',
                url: 'https://github.com',
                description: 'Explore popular JavaScript libraries for creating smooth animations and interactive web experiences.'
            },
            {
                title: 'CSS Grid and Flexbox Tutorial',
                url: 'https://css-tricks.com',
                description: 'Complete guide to CSS Grid and Flexbox layouts for modern responsive web design.'
            },
            {
                title: 'Web Accessibility Standards',
                url: 'https://www.w3.org/WAI/',
                description: 'Understanding WCAG guidelines and implementing accessibility features in web applications.'
            },
            {
                title: 'Progressive Web Apps Development',
                url: 'https://web.dev',
                description: 'Build fast, reliable, and engaging Progressive Web Apps with modern web technologies.'
            },
            {
                title: 'API Design Best Practices',
                url: 'https://restfulapi.net',
                description: 'Learn how to design and implement RESTful APIs following industry best practices.'
            },
            {
                title: 'React vs Vue vs Angular Comparison',
                url: 'https://2023.stateofjs.com',
                description: 'Comprehensive comparison of popular JavaScript frameworks for frontend development.'
            },
            {
                title: 'Web Performance Optimization',
                url: 'https://web.dev/performance/',
                description: 'Techniques and tools for optimizing web application performance and user experience.'
            },
            {
                title: 'TypeScript for JavaScript Developers',
                url: 'https://www.typescriptlang.org',
                description: 'Learn TypeScript to add static typing and improve code quality in JavaScript projects.'
            },
            {
                title: 'Node.js Backend Development',
                url: 'https://nodejs.org',
                description: 'Build scalable server-side applications with Node.js and modern JavaScript frameworks.'
            },
            {
                title: 'Database Design Principles',
                url: 'https://www.mongodb.com',
                description: 'Understanding database design patterns, normalization, and modern database technologies.'
            },
            {
                title: 'Cloud Computing Services Guide',
                url: 'https://aws.amazon.com',
                description: 'Compare and choose the best cloud computing services for your applications and infrastructure.'
            },
            {
                title: 'Machine Learning for Web Developers',
                url: 'https://www.tensorflow.org',
                description: 'Introduction to machine learning concepts and implementation in web applications.'
            },
            {
                title: 'Cybersecurity Best Practices',
                url: 'https://owasp.org',
                description: 'Essential security practices for protecting web applications from common vulnerabilities.'
            },
            {
                title: 'Mobile-First Responsive Design',
                url: 'https://responsivedesign.is',
                description: 'Create websites that work seamlessly across all devices with mobile-first design approach.'
            },
            {
                title: 'WebAssembly Performance Guide',
                url: 'https://webassembly.org',
                description: 'Leverage WebAssembly for high-performance computing in web browsers.'
            },
            {
                title: 'GraphQL vs REST API Comparison',
                url: 'https://graphql.org',
                description: 'Understanding the differences and use cases for GraphQL and REST APIs.'
            },
            {
                title: 'DevOps and CI/CD Pipelines',
                url: 'https://about.gitlab.com',
                description: 'Implement continuous integration and deployment workflows for modern software development.'
            }
        ];
    }
}

// Initialize the search engine when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new D1ksSearchEngine();
});
