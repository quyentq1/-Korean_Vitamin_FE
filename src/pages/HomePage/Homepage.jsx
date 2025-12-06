import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [currentLang, setCurrentLang] = useState(i18n.language);
    const [isScrolled, setIsScrolled] = useState(false);

    // Detect scroll for navbar style
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'vi' : 'en';
        i18n.changeLanguage(newLang);
        setCurrentLang(newLang);
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80; // Account for navbar height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="homepage-container">
            {/* Language Toggle */}
            <button
                className="lang-toggle"
                onClick={toggleLanguage}
                aria-label="Toggle Language"
            >
                {currentLang === 'en' ? (
                    <>
                        <img
                            src="https://flagcdn.com/w20/vn.png"
                            alt="Vietnam Flag"
                            style={{ width: '20px', marginRight: '8px' }}
                        />
                        Tiếng Việt
                    </>
                ) : (
                    <>
                        <img
                            src="https://flagcdn.com/w20/gb.png"
                            alt="US Flag"
                            style={{ width: '20px', marginRight: '8px' }}
                        />
                        English
                    </>
                )}
            </button>


            {/* Navigation Bar */}
            <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
                <div className="nav-container">
                    <div
                        className="nav-logo"
                        onClick={() => scrollToSection('home')}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <span className="logo-icon" style={{ marginRight: '8px' }}>
                            🇰🇷
                        </span>
                        <span className="logo-icon" style={{ marginRight: '8px' }}>
                            <img
                                src="https://flagcdn.com/w20/kr.png"
                                alt="Korean Flag"
                                style={{ width: '24px', verticalAlign: 'middle' }}
                            />
                        </span>
                        <span className="logo-text">
                            {t('homepage.nav.brand') || 'Korean Learning'}
                        </span>
                    </div>

                    <ul className="nav-menu">
                        <li>
                            <a
                                href="#home"
                                onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}
                            >
                                {t('homepage.nav.home') || 'Home'}
                            </a>
                        </li>
                        <li>
                            <a
                                href="#courses"
                                onClick={(e) => { e.preventDefault(); scrollToSection('courses'); }}
                            >
                                {t('homepage.nav.courses') || 'Courses'}
                            </a>
                        </li>
                        <li>
                            <a
                                href="#materials"
                                onClick={(e) => { e.preventDefault(); scrollToSection('materials'); }}
                            >
                                {t('homepage.nav.materials') || 'Materials'}
                            </a>
                        </li>
                        <li>
                            <a
                                href="#practice"
                                onClick={(e) => { e.preventDefault(); scrollToSection('practice'); }}
                            >
                                {t('homepage.nav.practice') || 'Practice'}
                            </a>
                        </li>
                        <li>
                            <a
                                href="#blog"
                                onClick={(e) => { e.preventDefault(); scrollToSection('blog'); }}
                            >
                                {t('homepage.nav.blog') || 'Blog'}
                            </a>
                        </li>
                        <li>
                            <a
                                href="#contact"
                                onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
                            >
                                {t('homepage.nav.contact') || 'Contact'}
                            </a>
                        </li>
                    </ul>
                    <button className="btn btn-login" onClick={() => navigate('/login')}>
                        {t('homepage.nav.login') || 'Login'}
                    </button>
                </div>
            </nav>

            <div className="homepage-content">
                {/* Hero Section */}
                <section id="home" className="hero-section">
                    <div className="hero-content">
                        <div className="hero-text">
                            <p className="hero-label">
                                {t('homepage.hero.label') || 'Korean Language Learning'}
                            </p>
                            <h1 className="hero-title">
                                {t('homepage.hero.title') || 'Master Korean with Confidence'}
                            </h1>
                            <p className="hero-description">
                                {t('homepage.hero.description') || 'Comprehensive online platform for Korean language certification exam preparation.'}
                            </p>
                            <div className="cta-buttons">
                                <button
                                    className="btn btn-primary btn-large"
                                    onClick={() => scrollToSection('courses')}
                                >
                                    {t('homepage.hero.startLearning') || 'Start Learning'}
                                </button>
                                <button
                                    className="btn btn-secondary btn-large"
                                    onClick={() => navigate('/login')}
                                >
                                    {t('homepage.hero.signIn') || 'Sign In'}
                                </button>
                            </div>
                            <div className="hero-stats">
                                <div className="hero-stat-item">
                                    <span className="stat-icon">📚</span>
                                    <span>{t('homepage.hero.stat1') || '1000+ Practice Questions'}</span>
                                </div>
                                <div className="hero-stat-item">
                                    <span className="stat-icon" style={{ color: 'red' }}>✓</span>
                                    <span>{t('homepage.hero.stat2') || 'Expert Teachers'}</span>
                                </div>
                                <div className="hero-stat-item">
                                    <span className="stat-icon">💯</span>
                                    <span>{t('homepage.hero.stat3') || 'High Pass Rate'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="hero-image">
                            <img
                                src="/images/hero-illustration.png"
                                alt="Korean Learning Platform"
                                loading="eager"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* Feature Badges */}
                <section className="feature-badges">
                    <div className="badge-item">
                        <span className="badge-icon">📝</span>
                        <span className="badge-text">
                            {t('homepage.badges.standard') || 'TOPIK Standard'}
                        </span>
                    </div>
                    <div className="badge-item">
                        <span className="badge-icon">👥</span>
                        <span className="badge-text">
                            {t('homepage.badges.students') || '10,000+ Students'}
                        </span>
                    </div>
                    <div className="badge-item">
                        <span className="badge-icon">📊</span>
                        <span className="badge-text">
                            {t('homepage.badges.tracking') || 'Progress Tracking'}
                        </span>
                    </div>
                    <div className="badge-item">
                        <span className="badge-icon">🎯</span>
                        <span className="badge-text">
                            {t('homepage.badges.noRegister') || 'Free Registration'}
                        </span>
                    </div>
                    <div className="badge-item">
                        <span className="badge-icon">🔄</span>
                        <span className="badge-text">
                            {t('homepage.badges.updates') || 'Regular Updates'}
                        </span>
                    </div>
                </section>

                {/* Courses by Level */}
                <section id="courses" className="courses-section">
                    <h2>{t('homepage.courses.title') || 'Courses by Level'}</h2>
                    <p className="section-subtitle">
                        {t('homepage.courses.subtitle') || 'Choose the right course for your level'}
                    </p>
                    <div className="courses-grid">
                        <div className="course-card">
                            <div className="course-icon">📘</div>
                            <h3>{t('homepage.courses.beginner.title') || 'TOPIK I (Beginner)'}</h3>
                            <p>{t('homepage.courses.beginner.description') || 'Start your Korean learning journey'}</p>
                            <ul className="course-features">
                                <li>{t('homepage.courses.beginner.feature1') || 'Basic grammar & vocabulary'}</li>
                                <li>{t('homepage.courses.beginner.feature2') || 'Reading & listening practice'}</li>
                                <li>{t('homepage.courses.beginner.feature3') || 'Interactive exercises'}</li>
                            </ul>
                        </div>
                        <div className="course-card">
                            <div className="course-icon">📗</div>
                            <h3>{t('homepage.courses.intermediate.title') || 'TOPIK II (Intermediate)'}</h3>
                            <p>{t('homepage.courses.intermediate.description') || 'Build your Korean proficiency'}</p>
                            <ul className="course-features">
                                <li>{t('homepage.courses.intermediate.feature1') || 'Advanced grammar patterns'}</li>
                                <li>{t('homepage.courses.intermediate.feature2') || 'Writing practice'}</li>
                                <li>{t('homepage.courses.intermediate.feature3') || 'Mock exams'}</li>
                            </ul>
                        </div>
                        <div className="course-card">
                            <div className="course-icon">📕</div>
                            <h3>{t('homepage.courses.advanced.title') || 'TOPIK II (Advanced)'}</h3>
                            <p>{t('homepage.courses.advanced.description') || 'Master Korean at the highest level'}</p>
                            <ul className="course-features">
                                <li>{t('homepage.courses.advanced.feature1') || 'Complex texts & essays'}</li>
                                <li>{t('homepage.courses.advanced.feature2') || 'Native-level listening'}</li>
                                <li>{t('homepage.courses.advanced.feature3') || 'Exam strategies'}</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="materials" className="features-section">
                    <h2>{t('homepage.features.title') || 'Platform Features'}</h2>
                    <p className="features-subtitle">
                        {t('homepage.features.subtitle') || 'Everything you need to succeed'}
                    </p>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">✅</div>
                            <h3>{t('homepage.features.autoGrading.title') || 'Auto Grading'}</h3>
                            <p>{t('homepage.features.autoGrading.description') || 'Instant feedback on your answers'}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>{t('homepage.features.progress.title') || 'Progress Tracking'}</h3>
                            <p>{t('homepage.features.progress.description') || 'Monitor your improvement'}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📄</div>
                            <h3>{t('homepage.features.materials.title') || 'Study Materials'}</h3>
                            <p>{t('homepage.features.materials.description') || 'Comprehensive resources'}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💬</div>
                            <h3>{t('homepage.features.community.title') || 'Community'}</h3>
                            <p>{t('homepage.features.community.description') || 'Learn with others'}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3>{t('homepage.features.topik.title') || 'TOPIK Focused'}</h3>
                            <p>{t('homepage.features.topik.description') || 'Exam-specific preparation'}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📚</div>
                            <h3>{t('homepage.features.flashcards.title') || 'Flashcards'}</h3>
                            <p>{t('homepage.features.flashcards.description') || 'Memorize vocabulary efficiently'}</p>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section id="practice" className="testimonials-section">
                    <h2>{t('homepage.testimonials.title') || 'Student Success Stories'}</h2>
                    <p className="section-subtitle">
                        {t('homepage.testimonials.subtitle') || 'Hear from our successful students'}
                    </p>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="testimonial-avatar">👨‍🎓</div>
                            <p className="testimonial-text">
                                "{t('homepage.testimonials.student1.text') || 'This platform helped me pass TOPIK II with level 5!'}"
                            </p>
                            <div className="testimonial-author">
                                {t('homepage.testimonials.student1.name') || 'Nguyen Van A'}
                            </div>
                            <div className="testimonial-result">
                                {t('homepage.testimonials.student1.result') || 'TOPIK II Level 5'}
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-avatar">👩‍🎓</div>
                            <p className="testimonial-text">
                                "{t('homepage.testimonials.student2.text') || 'The practice questions are very similar to the real exam!'}"
                            </p>
                            <div className="testimonial-author">
                                {t('homepage.testimonials.student2.name') || 'Tran Thi B'}
                            </div>
                            <div className="testimonial-result">
                                {t('homepage.testimonials.student2.result') || 'TOPIK I Level 2'}
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-avatar">🧑‍🎓</div>
                            <p className="testimonial-text">
                                "{t('homepage.testimonials.student3.text') || 'Excellent preparation materials and supportive community!'}"
                            </p>
                            <div className="testimonial-author">
                                {t('homepage.testimonials.student3.name') || 'Le Van C'}
                            </div>
                            <div className="testimonial-result">
                                {t('homepage.testimonials.student3.result') || 'TOPIK II Level 6'}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Blog/News */}
                <section id="blog" className="blog-section">
                    <h2>{t('homepage.blog.title') || 'Latest News & Tips'}</h2>
                    <p className="section-subtitle">
                        {t('homepage.blog.subtitle') || 'Stay updated with Korean learning tips'}
                    </p>
                    <div className="blog-grid">
                        <div className="blog-card">
                            <div className="blog-icon">📅</div>
                            <h3>{t('homepage.blog.post1.title') || 'TOPIK Exam Schedule 2024'}</h3>
                            <p>{t('homepage.blog.post1.description') || 'Important dates and registration deadlines'}</p>
                            <a href="#" className="blog-link" onClick={(e) => e.preventDefault()}>
                                {t('homepage.blog.readMore') || 'Read More'} →
                            </a>
                        </div>
                        <div className="blog-card">
                            <div className="blog-icon">💡</div>
                            <h3>{t('homepage.blog.post2.title') || '10 Tips for TOPIK Success'}</h3>
                            <p>{t('homepage.blog.post2.description') || 'Expert strategies for exam preparation'}</p>
                            <a href="#" className="blog-link" onClick={(e) => e.preventDefault()}>
                                {t('homepage.blog.readMore') || 'Read More'} →
                            </a>
                        </div>
                        <div className="blog-card">
                            <div className="blog-icon">🎎</div>
                            <h3>{t('homepage.blog.post3.title') || 'Korean Culture & Language'}</h3>
                            <p>{t('homepage.blog.post3.description') || 'Understanding cultural context in learning'}</p>
                            <a href="#" className="blog-link" onClick={(e) => e.preventDefault()}>
                                {t('homepage.blog.readMore') || 'Read More'} →
                            </a>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <h2>{t('homepage.cta.title') || 'Ready to Start Your Korean Journey?'}</h2>
                    <p>{t('homepage.cta.description') || 'Join thousands of students preparing for TOPIK success'}</p>
                    <div className="cta-buttons">
                        <button
                            className="btn btn-primary btn-large"
                            onClick={() => navigate('/login')}
                        >
                            {t('homepage.cta.button') || 'Get Started Now'}
                        </button>
                        <button
                            className="btn btn-secondary btn-large"
                            onClick={() => scrollToSection('courses')}
                        >
                            {t('homepage.cta.buttonSecondary') || 'Explore Courses'}
                        </button>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer id="contact" className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>{t('homepage.footer.about.title') || 'About Us'}</h3>
                        <p>
                            {t('homepage.footer.about.description') || 'Leading Korean language learning platform for TOPIK preparation'}
                        </p>
                    </div>
                    <div className="footer-section">
                        <h3>{t('homepage.footer.contact.title') || 'Contact'}</h3>
                        <ul>
                            <li>📧 {t('homepage.footer.contact.email') || 'info@koreanlearning.com'}</li>
                            <li>📱 {t('homepage.footer.contact.phone') || '+84 123 456 789'}</li>
                            <li>📍 {t('homepage.footer.contact.address') || 'Hanoi, Vietnam'}</li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>{t('homepage.footer.social.title') || 'Follow Us'}</h3>
                        <div className="social-links">
                            <a
                                href="#"
                                aria-label="Facebook"
                                onClick={(e) => e.preventDefault()}
                            >
                                📘 Facebook
                            </a>
                            <a
                                href="#"
                                aria-label="Instagram"
                                onClick={(e) => e.preventDefault()}
                            >
                                📷 Instagram
                            </a>
                            <a
                                href="#"
                                aria-label="YouTube"
                                onClick={(e) => e.preventDefault()}
                            >
                                📺 YouTube
                            </a>
                        </div>
                    </div>
                    <div className="footer-section">
                        <h3>{t('homepage.footer.links.title') || 'Quick Links'}</h3>
                        <ul>
                            <li>
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                    {t('homepage.footer.links.privacy') || 'Privacy Policy'}
                                </a>
                            </li>
                            <li>
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                    {t('homepage.footer.links.terms') || 'Terms of Service'}
                                </a>
                            </li>
                            <li>
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                    {t('homepage.footer.links.faq') || 'FAQ'}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>
                        {t('homepage.footer.copyright') || '© 2024 Korean Learning Platform. All rights reserved.'}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;