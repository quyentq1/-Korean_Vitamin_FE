import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

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

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Navigation Bar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
                }`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/landing')}>
                        <div
                            className="nav-logo"
                            onClick={() => scrollToSection('home')}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <span className="text-xl font-bold text-primary-700" style={{ marginRight: '8px' }}>
                                🇰🇷
                            </span>
                            <span className="text-xl font-bold text-primary-700" style={{ marginRight: '8px' }}>
                                <img
                                    src="https://flagcdn.com/w20/kr.png"
                                    alt="Korean Flag"
                                    style={{ width: '24px', verticalAlign: 'middle' }}
                                />
                            </span>
                        </div>
                        <span className="text-xl font-bold text-primary-700">
                            {t('landing.nav.title', 'Korean Vitamin')}
                        </span>
                    </div>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-gray-700 hover:text-primary-600 transition font-medium">
                            {t('landing.nav.features', 'Tính năng')}
                        </a>
                        <a href="#courses" className="text-gray-700 hover:text-primary-600 transition font-medium">
                            {t('landing.nav.courses', 'Khóa học')}
                        </a>
                        <a href="#pricing" className="text-gray-700 hover:text-primary-600 transition font-medium">
                            {t('landing.nav.pricing', 'Học phí')}
                        </a>
                        <a href="#testimonials" className="text-gray-700 hover:text-primary-600 transition font-medium">
                            {t('landing.nav.testimonials', 'Đánh giá')}
                        </a>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
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
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium"
                        >
                            {t('landing.nav.login', 'Đăng nhập')}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary-400 via-primary-300 to-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-6 animate-slide-up">
                            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                                {t('landing.hero.title', 'Chinh Phục')} <br />
                                <span className="text-primary-700">
                                    {t('landing.hero.titleHighlight', 'Tiếng Hàn')}
                                </span>
                            </h1>
                            <p className="text-xl text-gray-700 leading-relaxed">
                                {t('landing.hero.subtitle', 'Nền tảng học và luyện thi tiếng Hàn hàng đầu với công nghệ AI, giúp bạn đạt chứng chỉ TOPIK, OPIc, EPS-TOPIK một cách hiệu quả nhất')}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl">
                                    {t('landing.hero.cta1', 'Dùng thử miễn phí')} →
                                </button>
                                <button className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-50 transition border-2 border-primary-600">
                                    {t('landing.hero.cta2', 'Xem khóa học')}
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-8 pt-8">
                                <div>
                                    <div className="text-3xl font-bold text-primary-700">10,000+</div>
                                    <div className="text-gray-600">{t('landing.hero.stat1', 'Học viên')}</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary-700">95%</div>
                                    <div className="text-gray-600">{t('landing.hero.stat2', 'Đỗ chứng chỉ')}</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary-700">50+</div>
                                    <div className="text-gray-600">{t('landing.hero.stat3', 'Giáo viên')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Image/Illustration */}
                        <div className="relative">
                            <div className="bg-white rounded-2xl shadow-2xl p-8">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80"
                                    alt="Korean Learning"
                                    className="rounded-xl w-full"
                                />
                            </div>
                            {/* Floating Cards */}
                            <div className="absolute -top-6 -right-6 bg-accent-pink text-white px-6 py-3 rounded-xl shadow-lg z-20">
                                <div className="text-sm font-medium">⭐ 4.9/5.0</div>
                                <div className="text-xs">2,500+ đánh giá</div>
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-accent-blue text-white px-6 py-3 rounded-xl shadow-lg z-20">
                                <div className="text-sm font-medium">🏆 Top #1</div>
                                <div className="text-xs">Nền tảng học tiếng Hàn</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0 top-0.2">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
                    </svg>
                </div>
            </section>

            {/* Features Section - HỌC / ÔN / THI */}
            <section id="features" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('landing.features.title', 'Tính Năng Nổi Bật')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('landing.features.subtitle', 'Học - Ôn - Thi với hệ thống toàn diện')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* HỌC */}
                        <div className="group bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-transparent hover:border-accent-blue hover:shadow-xl transition-all duration-300">
                            <div className="w-16 h-16 bg-accent-blue rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition">
                                📖
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {t('landing.features.learn.title', 'HỌC')}
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                {t('landing.features.learn.desc', 'Khóa học có cấu trúc rõ ràng từ cơ bản đến nâng cao, phù hợp với mọi trình độ')}
                            </p>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-blue mt-1">✓</span>
                                    <span>{t('landing.features.learn.item1', 'Lộ trình cá nhân hóa')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-blue mt-1">✓</span>
                                    <span>{t('landing.features.learn.item2', 'Video bài giảng HD')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-blue mt-1">✓</span>
                                    <span>{t('landing.features.learn.item3', 'Tài liệu đầy đủ')}</span>
                                </li>
                            </ul>
                        </div>

                        {/* ÔN */}
                        <div className="group bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-transparent hover:border-accent-purple hover:shadow-xl transition-all duration-300">
                            <div className="w-16 h-16 bg-accent-purple rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition">
                                📝
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {t('landing.features.practice.title', 'ÔN')}
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                {t('landing.features.practice.desc', 'Hàng nghìn câu hỏi và đề thi thử được cập nhật liên tục')}
                            </p>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-purple mt-1">✓</span>
                                    <span>{t('landing.features.practice.item1', 'Ngân hàng câu hỏi khổng lồ')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-purple mt-1">✓</span>
                                    <span>{t('landing.features.practice.item2', 'Luyện theo dạng câu')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-purple mt-1">✓</span>
                                    <span>{t('landing.features.practice.item3', 'Phân tích điểm yếu')}</span>
                                </li>
                            </ul>
                        </div>

                        {/* THI */}
                        <div className="group bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl border-2 border-transparent hover:border-accent-pink hover:shadow-xl transition-all duration-300">
                            <div className="w-16 h-16 bg-accent-pink rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition">
                                🎯
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {t('landing.features.test.title', 'THI')}
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                {t('landing.features.test.desc', 'Thi thử với đề thi chuẩn, chấm điểm tự động bằng AI')}
                            </p>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-pink mt-1">✓</span>
                                    <span>{t('landing.features.test.item1', '20 mã đề không trùng')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-pink mt-1">✓</span>
                                    <span>{t('landing.features.test.item2', 'AI chấm viết & nói')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-pink mt-1">✓</span>
                                    <span>{t('landing.features.test.item3', 'Báo cáo chi tiết')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Test Types Section - TOPIK, OPIc, EPS-TOPIK */}
            <section id="courses" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('landing.courses.title', 'Các Chứng Chỉ')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('landing.courses.subtitle', 'Luyện thi đầy đủ các chứng chỉ tiếng Hàn')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* TOPIK */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition group">
                            <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                <div className="text-white text-center">
                                    <div className="text-6xl mb-2">📘</div>
                                    <div className="text-3xl font-bold">TOPIK</div>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    TOPIK I & II
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {t('landing.courses.topik.desc', 'Chứng chỉ tiếng Hàn phổ biến nhất, 6 cấp độ từ 1-6. Phù hợp du học, việc làm')}
                                </p>
                                <ul className="space-y-2 mb-6 text-gray-600 text-sm">
                                    <li>• {t('landing.courses.topik.item1', 'Đọc - Nghe - Viết')}</li>
                                    <li>• {t('landing.courses.topik.item2', '40-50 câu mỗi phần')}</li>
                                    <li>• {t('landing.courses.topik.item3', 'Thi 2 lần/năm')}</li>
                                </ul>
                                <button className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition">
                                    {t('landing.courses.cta', 'Tìm hiểu thêm')} →
                                </button>
                            </div>
                        </div>

                        {/* OPIc */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition group">
                            <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                <div className="text-white text-center">
                                    <div className="text-6xl mb-2">🎤</div>
                                    <div className="text-3xl font-bold">OPIc</div>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    OPIc
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {t('landing.courses.opic.desc', 'Đánh giá khả năng giao tiếp tiếng Hàn trong thực tế, quan trọng với doanh nghiệp')}
                                </p>
                                <ul className="space-y-2 mb-6 text-gray-600 text-sm">
                                    <li>• {t('landing.courses.opic.item1', 'Thi nói qua máy tính')}</li>
                                    <li>• {t('landing.courses.opic.item2', '12-15 câu hỏi')}</li>
                                    <li>• {t('landing.courses.opic.item3', 'Cấp độ AL - NL')}</li>
                                </ul>
                                <button className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition">
                                    {t('landing.courses.cta', 'Tìm hiểu thêm')} →
                                </button>
                            </div>
                        </div>

                        {/* EPS-TOPIK */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition group">
                            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <div className="text-white text-center">
                                    <div className="text-6xl mb-2">👷</div>
                                    <div className="text-3xl font-bold">EPS-TOPIK</div>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    EPS-TOPIK
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {t('landing.courses.eps.desc', 'Chứng chỉ cho lao động Việt Nam đi làm việc tại Hàn Quốc trong các ngành sản xuất')}
                                </p>
                                <ul className="space-y-2 mb-6 text-gray-600 text-sm">
                                    <li>• {t('landing.courses.eps.item1', 'Đọc - Nghe')}</li>
                                    <li>• {t('landing.courses.eps.item2', '25 câu mỗi phần')}</li>
                                    <li>• {t('landing.courses.eps.item3', 'Chuẩn xuất khẩu lao động')}</li>
                                </ul>
                                <button className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition">
                                    {t('landing.courses.cta', 'Tìm hiểu thêm')} →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('landing.pricing.title', 'Gói Học Phí')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('landing.pricing.subtitle', 'Linh hoạt theo nhu cầu của bạn')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-xl transition">
                            <div className="text-center mb-6">
                                <div className="text-4xl mb-3">🎁</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {t('landing.pricing.free.name', 'Miễn Phí')}
                                </h3>
                                <div className="text-4xl font-bold text-primary-600 mb-2">0đ</div>
                                <p className="text-gray-600 text-sm">
                                    {t('landing.pricing.free.desc', 'Dùng thử không giới hạn thời gian')}
                                </p>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span className="text-gray-700">{t('landing.pricing.free.item1', '2 bài test miễn phí')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span className="text-gray-700">{t('landing.pricing.free.item2', 'Xem thông tin khóa học')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span className="text-gray-700">{t('landing.pricing.free.item3', 'Tham gia forum')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400 mt-1">✗</span>
                                    <span className="text-gray-400">{t('landing.pricing.free.item4', 'Thi viết và nói')}</span>
                                </li>
                            </ul>
                            <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">
                                {t('landing.pricing.free.cta', 'Bắt đầu ngay')}
                            </button>
                        </div>

                        {/* Combo Test */}
                        <div className="bg-white border-2 border-primary-500 rounded-2xl p-8 hover:shadow-xl transition relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-accent-orange text-white px-4 py-1 rounded-full text-sm font-semibold">
                                    {t('landing.pricing.popular', 'Popular')}
                                </span>
                            </div>
                            <div className="text-center mb-6">
                                <div className="text-4xl mb-3">💎</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {t('landing.pricing.combo.name', 'Combo Test')}
                                </h3>
                                <div className="text-4xl font-bold text-primary-600 mb-2">100k - 200k</div>
                                <p className="text-gray-600 text-sm">
                                    {t('landing.pricing.combo.desc', 'Add-on Combo Test')}
                                </p>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span className="text-gray-700">{t('landing.pricing.combo.item1', 'All free plan features')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span className="text-gray-700">{t('landing.pricing.combo.item2', 'Test in combo')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400 mt-1">✗</span>
                                    <span className="text-gray-400">{t('landing.pricing.combo.item3', 'Writing & speaking tests')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400 mt-1">✗</span>
                                    <span className="text-gray-400">{t('landing.pricing.combo.item4', 'Online classes')}</span>
                                </li>
                            </ul>
                            <button className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition">
                                {t('landing.pricing.combo.cta', 'Buy Now')}
                            </button>
                        </div>

                        {/* Full Course */}
                        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl p-8 hover:shadow-2xl transition">
                            <div className="text-center mb-6">
                                <div className="text-4xl mb-3">👑</div>
                                <h3 className="text-2xl font-bold mb-2">
                                    {t('landing.pricing.full.name', 'Khóa Học Đầy Đủ')}
                                </h3>
                                <div className="text-4xl font-bold mb-2">{t('landing.pricing.full.price', 'Liên hệ')}</div>
                                <p className="text-primary-100 text-sm">
                                    {t('landing.pricing.full.desc', 'Truy cập toàn bộ khóa học')}
                                </p>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-2">
                                    <span className="text-white mt-1">✓</span>
                                    <span>{t('landing.pricing.full.item1', 'Tất cả quyền gói trước')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-white mt-1">✓</span>
                                    <span>{t('landing.pricing.full.item2', 'Lớp học online với giáo viên')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-white mt-1">✓</span>
                                    <span>{t('landing.pricing.full.item3', 'Chấm bài 1-1')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-white mt-1">✓</span>
                                    <span>{t('landing.pricing.full.item4', 'Hỗ trợ 24/7')}</span>
                                </li>
                            </ul>
                            <button className="w-full py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition">
                                {t('landing.pricing.full.cta', 'Liên hệ tư vấn')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Features Showcase */}
            <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('landing.ai.title', 'Công Nghệ AI Tiên Tiến')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('landing.ai.subtitle', 'Học thông minh hơn với trợ lý AI')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* AI Chatbot */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4">
                                🤖
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {t('landing.ai.chatbot.title', 'AI Chatbot')}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {t('landing.ai.chatbot.desc', 'Tư vấn khóa học và chứng chỉ phù hợp 24/7')}
                            </p>
                        </div>

                        {/* AI Grading */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center text-2xl mb-4">
                                🎯
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {t('landing.ai.grading.title', 'Chấm Tự Động')}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {t('landing.ai.grading.desc', 'AI chấm bài viết và nói với phản hồi chi tiết')}
                            </p>
                        </div>

                        {/* OCR */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-2xl mb-4">
                                📸
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {t('landing.ai.ocr.title', 'OCR Thông Minh')}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {t('landing.ai.ocr.desc', 'Tự động nhập thông tin học viên từ ảnh')}
                            </p>
                        </div>

                        {/* Analysis */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-2xl mb-4">
                                📊
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {t('landing.ai.analysis.title', 'Phân Tích Điểm Yếu')}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {t('landing.ai.analysis.desc', 'Chỉ ra điểm yếu và đề xuất lộ trình cải thiện')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Learning Process */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('landing.process.title', 'Quy Trình Học Tập')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('landing.process.subtitle', '5 bước đơn giản để chinh phục tiếng Hàn')}
                        </p>
                    </div>

                    <div className="relative">
                        {/* Desktop Timeline */}
                        <div className="hidden md:block">
                            <div className="flex justify-between items-start">
                                {[1, 2, 3, 4, 5].map((step) => (
                                    <div key={step} className="flex-1 text-center relative">
                                        <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                                            {step}
                                        </div>
                                        {step < 5 && (
                                            <div className="absolute top-8 left-1/2 w-full h-1 bg-primary-200"></div>
                                        )}
                                        <h3 className="font-bold text-gray-900 mb-2 text-lg">
                                            {t(`landing.process.step${step}.title`, `Bước ${step}`)}
                                        </h3>
                                        <p className="text-gray-600 text-sm px-2">
                                            {t(`landing.process.step${step}.desc`, 'Mô tả')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Timeline */}
                        <div className="md:hidden space-y-6">
                            {[1, 2, 3, 4, 5].map((step) => (
                                <div key={step} className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                                        {step}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">
                                            {t(`landing.process.step${step}.title`, `Bước ${step}`)}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {t(`landing.process.step${step}.desc`, 'Mô tả')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('landing.testimonials.title', 'Học Viên Nói Gì')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('landing.testimonials.subtitle', 'Câu chuyện thành công từ học viên')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-4 mb-4">
                                <img
                                    src="https://i.pravatar.cc/150?img=1"
                                    alt="Student"
                                    className="w-16 h-16 rounded-full"
                                />
                                <div>
                                    <h4 className="font-bold text-gray-900">Nguyễn Văn A</h4>
                                    <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                                </div>
                            </div>
                            <p className="text-gray-600 italic mb-4">
                                "{t('landing.testimonials.test1', 'Tôi đã đỗ TOPIK II level 5 nhờ hệ thống luyện đề và AI chấm bài rất chi tiết. Thầy cô tận tâm!')}"
                            </p>
                            <div className="text-sm text-primary-600 font-semibold">
                                TOPIK II Level 5 - 2024
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-4 mb-4">
                                <img
                                    src="https://i.pravatar.cc/150?img=5"
                                    alt="Student"
                                    className="w-16 h-16 rounded-full"
                                />
                                <div>
                                    <h4 className="font-bold text-gray-900">Trần Thị B</h4>
                                    <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                                </div>
                            </div>
                            <p className="text-gray-600 italic mb-4">
                                "{t('landing.testimonials.test2', 'OPIc IM3 không còn khó với bài tập nói qua AI. Giúp em tự tin hơn rất nhiều!')}"
                            </p>
                            <div className="text-sm text-primary-600 font-semibold">
                                OPIc IM3 - 2024
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-4 mb-4">
                                <img
                                    src="https://i.pravatar.cc/150?img=8"
                                    alt="Student"
                                    className="w-16 h-16 rounded-full"
                                />
                                <div>
                                    <h4 className="font-bold text-gray-900">Lê Văn C</h4>
                                    <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                                </div>
                            </div>
                            <p className="text-gray-600 italic mb-4">
                                "{t('landing.testimonials.test3', 'EPS-TOPIK đạt 200 điểm, được sang Hàn làm việc. Cảm ơn Korean Vitamin!')}"
                            </p>
                            <div className="text-sm text-primary-600 font-semibold">
                                EPS-TOPIK 200đ - 2024
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('landing.faq.title', 'Câu Hỏi Thường Gặp')}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <details key={num} className="bg-gray-50 rounded-xl p-6 cursor-pointer group">
                                <summary className="font-bold text-gray-900 text-lg flex items-center justify-between">
                                    {t(`landing.faq.q${num}`, `Câu hỏi ${num}?`)}
                                    <span className="text-primary-500 group-open:rotate-180 transition">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-4 leading-relaxed">
                                    {t(`landing.faq.a${num}`, `Câu trả lời ${num}`)}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        {/* About */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">Korean Vitamin</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {t('landing.footer.about', 'Nền tảng học và luyện thi tiếng Hàn hàng đầu Việt Nam với công nghệ AI tiên tiến')}
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-bold mb-4">{t('landing.footer.links', 'Liên kết')}</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#features" className="hover:text-white transition">Tính năng</a></li>
                                <li><a href="#courses" className="hover:text-white transition">Khóa học</a></li>
                                <li><a href="#pricing" className="hover:text-white transition">Học phí</a></li>
                                <li><a href="#testimonials" className="hover:text-white transition">Đánh giá</a></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h3 className="text-lg font-bold mb-4">{t('landing.footer.support', 'Hỗ trợ')}</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">Trung tâm trợ giúp</a></li>
                                <li><a href="#" className="hover:text-white transition">Điều khoản sử dụng</a></li>
                                <li><a href="#" className="hover:text-white transition">Chính sách bảo mật</a></li>
                                <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-lg font-bold mb-4">{t('landing.footer.contact', 'Liên hệ')}</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li>📧 contact@koreanvitamin.vn</li>
                                <li>📱 +84 123 456 789</li>
                                <li>📍 Hà Nội, Việt Nam</li>
                            </ul>
                            <div className="flex gap-3 mt-4">
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition">
                                    f
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition">
                                    Y
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition">
                                    in
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
                        <p>© 2024 Korean Vitamin. {t('landing.footer.rights', 'Bảo lưu mọi quyền')}.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
