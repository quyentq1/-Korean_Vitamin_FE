import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'vi' : 'en';
        i18n.changeLanguage(newLang);
    };

    // Check if we're on homepage to apply transparent background
    const isHomePage = location.pathname === '/';
    const shouldBeTransparent = isHomePage && !isScrolled;

    const navLinks = [
        { link: '#features', label: t('landing.nav.features', 'Tính năng'), isAnchor: true },
        { link: '#courses', label: t('landing.nav.courses', 'Khóa học'), isAnchor: true },
        { link: '#pricing', label: t('landing.nav.pricing', 'Học phí'), isAnchor: true },
        { link: '#testimonials', label: t('landing.nav.testimonials', 'Đánh giá'), isAnchor: true },
        { link: '/curriculum', label: t('landing.nav.curriculum_only', 'Giáo trình') },
        { link: '/prep', label: t('landing.nav.prep', 'Luyện thi') }
    ];

    const handleNavClick = (item) => {
        if (item.isAnchor) {
            if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => {
                    const element = document.querySelector(item.link);
                    element?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                const element = document.querySelector(item.link);
                element?.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate(item.link);
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${shouldBeTransparent ? 'bg-transparent py-4' : 'bg-white shadow-md py-2'
            }`}>
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-primary-700 mr-2">🇰🇷</span>
                            <span className="text-xl font-bold text-primary-700 mr-2">
                                <img
                                    src="https://flagcdn.com/w20/kr.png"
                                    alt="Korean Flag"
                                    className="w-6 align-middle"
                                />
                            </span>
                        </div>
                        <span className={`text-xl font-bold hidden sm:block ${isScrolled ? 'text-primary-700' : 'text-primary-700'
                            }`}>
                            {t('landing.nav.title', 'Korean Vitamin')}
                        </span>
                    </div>

                    {/* Desktop Nav Links - Button Style */}
                    <div className="hidden lg:flex items-center gap-4">
                        {navLinks.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleNavClick(item)}
                                className={`px-4 py-2 text-sm font-bold border-2 rounded-xl transition duration-300 whitespace-nowrap ${shouldBeTransparent
                                    ? 'text-white border-white/30 bg-white/10 hover:bg-white hover:text-primary-600 backdrop-blur-sm'
                                    : 'text-primary-600 border-primary-200 hover:border-primary-500 hover:bg-primary-50'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Actions & Mobile Menu Button */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleLanguage}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition hidden sm:flex ${shouldBeTransparent ? 'text-white hover:bg-white/20' : 'hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            <img
                                src={i18n.language === 'en' ? 'https://flagcdn.com/w20/vn.png' : 'https://flagcdn.com/w20/gb.png'}
                                alt="flag"
                                className="w-5 h-4"
                            />
                            <span className="text-sm font-medium">
                                {i18n.language === 'en' ? 'VN' : 'EN'}
                            </span>
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className={`px-6 py-2 rounded-xl transition font-medium whitespace-nowrap hidden sm:block ${shouldBeTransparent
                                ? 'bg-white text-primary-600 hover:bg-gray-100 shadow-lg'
                                : 'bg-primary-500 text-white hover:bg-primary-600'
                                }`}
                        >
                            {t('landing.nav.login', 'Đăng nhập')}
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            className={`lg:hidden p-2 rounded-lg ${shouldBeTransparent ? 'text-white hover:bg-white/20' : 'text-primary-600 hover:bg-primary-50'
                                }`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl p-4 flex flex-col gap-4 animate-slide-down">
                        {navLinks.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleNavClick(item)}
                                className="block w-full px-4 py-3 text-center font-bold text-primary-600 border-2 border-primary-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition"
                            >
                                {item.label}
                            </button>
                        ))}
                        <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-100">
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <img
                                    src={i18n.language === 'en' ? 'https://flagcdn.com/w20/vn.png' : 'https://flagcdn.com/w20/gb.png'}
                                    alt="flag"
                                    className="w-5 h-4"
                                />
                                <span className="text-sm font-medium">
                                    {i18n.language === 'en' ? 'Tiếng Việt' : 'English'}
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/login');
                                    setIsMobileMenuOpen(false);
                                }}
                                className="px-6 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition"
                            >
                                {t('landing.nav.login', 'Đăng nhập')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
