class I18nManager {
    constructor() {
        this.currentLang = 'ru';
        this.translations = {};
        this.init();
    }

    async init() {
        const savedLang = localStorage.getItem('preferredLanguage');
        const browserLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
        this.currentLang = savedLang || browserLang;
        
        await this.loadLanguage(this.currentLang);
        this.applyTranslations();
        this.bindEvents();
        this.updateLanguageSwitcher();
    }

    async loadLanguage(lang) {
        try {
            const commonResponse = await fetch(`../locales/${lang}/common.json`);
            this.translations.common = await commonResponse.json();

            const page = this.getCurrentPage();
            const pageResponse = await fetch(`../locales/${lang}/${page}.json`);
            this.translations.page = await pageResponse.json();

            this.currentLang = lang;
            localStorage.setItem('preferredLanguage', lang);
            
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('services')) return 'services';
        if (path.includes('about')) return 'about';
        if (path.includes('news')) return 'news';
        if (path.includes('contacts')) return 'contacts';
        return 'home';
    }

    t(key, namespace = 'common') {
        const keys = key.split('.');
        let value = this.translations[namespace];
        
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) {
                console.warn(`Translation missing: ${namespace}.${key}`);
                return key;
            }
        }
        
        return value;
    }

    applyTranslations() {
        document.documentElement.lang = this.currentLang;
        
        const rtlLanguages = ['ar', 'he', 'fa'];
        document.documentElement.dir = rtlLanguages.includes(this.currentLang) ? 'rtl' : 'ltr';

        this.updateText('.header-top-block:nth-child(2) p', 'header.phone');
        this.updateText('.header-top-block:nth-child(3) p', 'header.salons');
        this.updateText('.header-top-block button', 'header.accessibility');
        this.updateText('.nav__button', 'header.appointment');

        this.updateText('a[href="./home.html"]', 'nav.home');
        this.updateText('a[href="./services.html"]', 'nav.services');
        this.updateText('a[href="./about.html"]', 'nav.about');
        this.updateText('a[href="./news.html"]', 'nav.news');
        this.updateText('a[href="./contacts.html"]', 'nav.contacts');

        this.updateFooterTranslations();

        this.updateAccessibilityTranslations();

        this.applyPageTranslations();
    }

    updateFooterTranslations() {
        this.updateText('.footer__column:nth-child(1) h3', 'footer.cosmetology');
        this.updateText('.footer__column:nth-child(2) h3', 'footer.plastic_surgery');
        this.updateText('.footer__column:nth-child(3) h3', 'footer.dentistry');
        this.updateText('.footer__column:nth-child(4) h3', 'footer.contacts');
        
        this.updateText('.footer__links:nth-child(1) li:nth-child(1) a', 'footer.facial_care');
        this.updateText('.footer__links:nth-child(1) li:nth-child(2) a', 'footer.body_correction');
        this.updateText('.footer__links:nth-child(1) li:nth-child(3) a', 'footer.rejuvenation');
        this.updateText('.footer__links:nth-child(1) li:nth-child(4) a', 'footer.hardware_cosmetology');
        
        this.updateText('.footer__links:nth-child(2) li:nth-child(1) a', 'footer.facial_plastic');
        this.updateText('.footer__links:nth-child(2) li:nth-child(2) a', 'footer.figure_correction');
        this.updateText('.footer__links:nth-child(2) li:nth-child(3) a', 'footer.mammoplasty');
        this.updateText('.footer__links:nth-child(2) li:nth-child(4) a', 'footer.reconstructive_surgery');
        
        this.updateText('.footer__links:nth-child(3) li:nth-child(1) a', 'footer.dental_implantation');
        this.updateText('.footer__links:nth-child(3) li:nth-child(2) a', 'footer.aesthetic_dentistry');
        this.updateText('.footer__links:nth-child(3) li:nth-child(3) a', 'footer.bite_correction');
        this.updateText('.footer__links:nth-child(3) li:nth-child(4) a', 'footer.professional_hygiene');
        
        this.updateText('.footer__copyright', 'footer.copyright');
        this.updateText('.footer__legal a:nth-child(1)', 'footer.privacy_policy');
        this.updateText('.footer__legal a:nth-child(2)', 'footer.user_agreement');
    }

    updateAccessibilityTranslations() {
        this.updateText('.accessibility-modal__header h2', 'accessibility.title');
        this.updateText('.accessibility-option:nth-child(1) h3', 'accessibility.font_size');
        this.updateText('.font-size-btn[data-size="small"]', 'accessibility.small');
        this.updateText('.font-size-btn[data-size="medium"]', 'accessibility.medium');
        this.updateText('.font-size-btn[data-size="large"]', 'accessibility.large');
        this.updateText('.accessibility-option:nth-child(2) h3', 'accessibility.color_scheme');
        this.updateText('.color-scheme-btn[data-scheme="black-white"]', 'accessibility.black_white');
        this.updateText('.color-scheme-btn[data-scheme="black-green"]', 'accessibility.black_green');
        this.updateText('.color-scheme-btn[data-scheme="default"]', 'accessibility.default');
        this.updateText('.color-scheme-btn[data-scheme="beige-brown"]', 'accessibility.beige_brown');
        this.updateText('.color-scheme-btn[data-scheme="blue-darkblue"]', 'accessibility.blue_darkblue');
        this.updateText('.accessibility-option:nth-child(3) h3', 'accessibility.images');
        this.updateText('.toggle-label', 'accessibility.show_images');
        this.updateText('.accessibility-option:nth-child(4) h3', 'accessibility.theme');
        this.updateText('.toggle-label', 'accessibility.dark_theme', 1);
        this.updateText('.reset-settings-btn', 'accessibility.reset');
        this.updateText('.apply-settings-btn', 'accessibility.apply');
        this.updateText('[data-action="toggle-contrast"]', 'accessibility.contrast');
        this.updateText('[data-action="toggle-images"]', 'accessibility.images_short');
        this.updateText('[data-action="toggle-theme"]', 'accessibility.theme');
    }

    applyPageTranslations() {
        const page = this.getCurrentPage();
        
        if (page === 'home') {
            this.applyHomeTranslations();
        }
    }

    applyHomeTranslations() {
        this.updateText('.section-slider-top-slider-slide:nth-child(1) h2', 'slider.cosmetology', 'page');
        this.updateText('.section-slider-top-slider-slide:nth-child(1) p', 'slider.cosmetology_desc', 'page');
        this.updateText('.section-slider-top-slider-slide:nth-child(2) h2', 'slider.plastic_surgery', 'page');
        this.updateText('.section-slider-top-slider-slide:nth-child(2) p', 'slider.plastic_surgery_desc', 'page');
        this.updateText('.section-slider-top-slider-slide:nth-child(3) h2', 'slider.dentistry', 'page');
        this.updateText('.section-slider-top-slider-slide:nth-child(3) p', 'slider.dentistry_desc', 'page');
        this.updateText('.section-slider-top-slider-slide button', 'slider.details', 'page');

        this.updateText('.section-slider-bottom-block:nth-child(1)', 'procedures.complex', 'page');
        this.updateText('.section-slider-bottom-block:nth-child(2)', 'procedures.education', 'page');
        this.updateText('.section-slider-bottom-block:nth-child(3)', 'procedures.vip', 'page');

        this.updateText('.section-certificate-left-top .block-text', 'innovations.title', 'page');
        this.updateText('.section-certificate-left-top h2', 'innovations.heading', 'page');
        this.updateText('.section-certificate-left-top-button p', 'innovations.details', 'page');

        this.updateText('.section-certificate-right .block-text', 'aesthetics.title', 'page');
        this.updateText('.section-certificate-right-buttom-left-block:nth-child(1) p', 'aesthetics.centers', 'page');
        this.updateText('.section-certificate-right-buttom-left-block:nth-child(2) p', 'aesthetics.doctors', 'page');
        this.updateText('.section-certificate-right-buttom-left-block:nth-child(3) p', 'aesthetics.patents', 'page');
        this.updateText('.section-certificate-right-buttom-left-block:nth-child(4) p', 'aesthetics.procedures', 'page');

        this.updateText('.news-title', 'news.title', 'page');
        this.updateText('.news-item:nth-child(1) .news-item-title', 'news.why_cosmetologist', 'page');
        this.updateText('.news-item:nth-child(2) .news-item-title', 'news.standardization', 'page');
        this.updateText('.news-item:nth-child(3) .news-item-title', 'news.individual_approach', 'page');

        this.updateText('.mod-section h2', 'special_offers.title', 'page');
        this.updateText('.mod-section-blocks-block:nth-child(1) .mod-section-blocks-block-bottom p', 'special_offers.laser_epilation', 'page');
        this.updateText('.mod-section-blocks-block:nth-child(2) .mod-section-blocks-block-bottom p', 'special_offers.biorevitalization', 'page');
        this.updateText('.mod-section-blocks-block:nth-child(3) .mod-section-blocks-block-bottom p', 'special_offers.teeth_whitening', 'page');
        this.updateText('.mod-section-blocks-block:nth-child(4) .mod-section-blocks-block-bottom p', 'special_offers.rhinoplasty', 'page');
    }

    updateText(selector, key, namespace = 'common', index = 0) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > index) {
            elements[index].textContent = this.t(key, namespace);
        }
    }

    bindEvents() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const lang = e.target.dataset.lang;
                await this.switchLanguage(lang);
            });
        });
    }

    updateLanguageSwitcher() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
        });
    }

    async switchLanguage(lang) {
        if (lang !== this.currentLang) {
            await this.loadLanguage(lang);
            this.applyTranslations();
            this.updateLanguageSwitcher();
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.i18nManager = new I18nManager();
});