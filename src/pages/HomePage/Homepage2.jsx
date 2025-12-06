import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Homepage2.css';

const Homepage2 = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [currentLang, setCurrentLang] = useState(i18n.language);
    const [isScrolled, setIsScrolled] = useState(false);

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
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    return (
        <div className="vitamin-container">
            {/* Language Toggle */}
            <button className="vitamin-lang-toggle" onClick={toggleLanguage}>
                {currentLang === 'en' ? (
                    <>
                        <img src="https://flagcdn.com/w20/vn.png" alt="Vietnam Flag" style={{ width: '20px', marginRight: '8px' }} />
                        Tiếng Việt
                    </>
                ) : (
                    <>
                        <img src="https://flagcdn.com/w20/gb.png" alt="US Flag" style={{ width: '20px', marginRight: '8px' }} />
                        English
                    </>
                )}
            </button>

            {/* Navigation */}
            <nav className={`vitamin-nav ${isScrolled ? 'vitamin-nav-scrolled' : ''}`}>
                <div className="vitamin-nav-container">
                    <div className="vitamin-logo" onClick={() => scrollToSection('home')}>
                        <div className="logo-icon">🇰🇷</div>
                        <div className="logo-text">
                            <div className="logo-main">Vitamin</div>
                            <div className="logo-sub">Korean Center</div>
                        </div>
                    </div>
                    <ul className="vitamin-nav-menu">
                        <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>{t('homepage.vitamin.nav.home')}</a></li>
                        <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>{t('homepage.vitamin.nav.about')}</a></li>
                        <li><a href="#courses" onClick={(e) => { e.preventDefault(); scrollToSection('courses'); }}>{t('homepage.vitamin.nav.courses')}</a></li>
                        <li><a href="#teachers" onClick={(e) => { e.preventDefault(); scrollToSection('teachers'); }}>{t('homepage.vitamin.nav.teachers')}</a></li>
                        <li><a href="#achievements" onClick={(e) => { e.preventDefault(); scrollToSection('achievements'); }}>{t('homepage.vitamin.nav.achievements')}</a></li>
                        <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>{t('homepage.vitamin.nav.contact')}</a></li>
                    </ul>
                    <button className="vitamin-btn vitamin-btn-primary" onClick={() => navigate('/login')}>
                        {t('homepage.vitamin.nav.login')}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="vitamin-hero">
                <div className="vitamin-hero-content">
                    <div className="vitamin-hero-text">
                        <div className="hero-badge">{t('homepage.vitamin.hero.badge')}</div>
                        <h1 className="hero-title">
                            {t('homepage.vitamin.hero.title1')}<br />
                            <span className="title-highlight">{t('homepage.vitamin.hero.titleHighlight')}</span>
                        </h1>
                        <p className="hero-description">
                            {t('homepage.vitamin.hero.description1')}
                        </p>
                        <div className="hero-buttons">
                            <button className="vitamin-btn vitamin-btn-large vitamin-btn-primary" onClick={() => scrollToSection('courses')}>
                                {t('homepage.vitamin.hero.btnCourses')}
                            </button>
                            <button className="vitamin-btn vitamin-btn-large vitamin-btn-outline" onClick={() => scrollToSection('contact')}>
                                {t('homepage.vitamin.hero.btnConsult')}
                            </button>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <div className="stat-number">10+</div>
                                <div className="stat-label">{t('homepage.vitamin.hero.stat1Label')}</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">5,000+</div>
                                <div className="stat-label">{t('homepage.vitamin.hero.stat2Label2')}</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">98%</div>
                                <div className="stat-label">{t('homepage.vitamin.hero.stat3Label2')}</div>
                            </div>
                        </div>
                    </div>
                    <div className="vitamin-hero-image">
                        <div className="hero-image-card">
                            <div className="korean-text">한국어</div>
                            <div className="image-badge">TOPIK Certified</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="vitamin-about">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">{t('homepage.vitamin.about.title')}</h2>
                        <p className="section-subtitle">{t('homepage.vitamin.about.subtitle')}</p>
                    </div>
                    <div className="about-content">
                        <div className="about-item">
                            <div className="about-icon">🎯</div>
                            <h3>{t('homepage.vitamin.about.mission')}</h3>
                            <p>{t('homepage.vitamin.about.missionDesc')}</p>
                        </div>
                        <div className="about-item">
                            <div className="about-icon">👁️</div>
                            <h3>{t('homepage.vitamin.about.vision')}</h3>
                            <p>{t('homepage.vitamin.about.visionDesc')}</p>
                        </div>
                        <div className="about-item">
                            <div className="about-icon">💎</div>
                            <h3>{t('homepage.vitamin.about.values')}</h3>
                            <p>{t('homepage.vitamin.about.valuesDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="vitamin-why">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">{t('homepage.vitamin.about.title2')}</h2>
                        <p className="section-subtitle">{t('homepage.vitamin.about.subtitle2')}</p>
                    </div>
                    <div className="why-grid">
                        <div className="why-card">
                            <div className="why-icon">👨‍🏫</div>
                            <h3>{t('homepage.vitamin.about.feature1Title')}</h3>
                            <p>{t('homepage.vitamin.about.feature1Desc')}</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon">📚</div>
                            <h3>{t('homepage.vitamin.about.feature2Title')}</h3>
                            <p>{t('homepage.vitamin.about.feature2Desc')}</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon">🎓</div>
                            <h3>{t('homepage.vitamin.about.feature3Title')}</h3>
                            <p>{t('homepage.vitamin.about.feature3Desc')}</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon">💻</div>
                            <h3>{t('homepage.vitamin.about.feature4Title')}</h3>
                            <p>{t('homepage.vitamin.about.feature4Desc')}</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon">📊</div>
                            <h3>{t('homepage.vitamin.about.feature5Title')}</h3>
                            <p>{t('homepage.vitamin.about.feature5Desc')}</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon">🎯</div>
                            <h3>{t('homepage.vitamin.about.feature6Title')}</h3>
                            <p>{t('homepage.vitamin.about.feature6Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses Section */}
            <section id="courses" className="vitamin-courses">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">{t('homepage.vitamin.courses.title')}</h2>
                        <p className="section-subtitle">{t('homepage.vitamin.courses.subtitle')}</p>
                    </div>
                    <div className="courses-grid">
                        {/* TOPIK I */}
                        <div className="course-card">
                            <div className="course-badge">TOPIK I</div>
                            <h3 className="course-title">{t('homepage.vitamin.courses.topik1Title')}<br />({t('homepage.vitamin.courses.topik1Level')})</h3>
                            <div className="course-price">
                                <span className="price-amount">{t('homepage.vitamin.courses.topik1Price')}</span>
                                <span className="price-period">{t('homepage.vitamin.courses.topik1Duration')}</span>
                            </div>
                            <ul className="course-features">
                                <li>{t('homepage.vitamin.courses.topik1Feature1')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature2')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature3')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature4')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature5')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature6')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature7')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature8')}</li>
                            </ul>
                            <button className="course-btn" onClick={() => scrollToSection('contact')}>
                                {t('homepage.vitamin.courses.registerBtn')}
                            </button>
                        </div>

                        {/* TOPIK II Intermediate */}
                        <div className="course-card course-featured">
                            <div className="featured-badge">{t('homepage.vitamin.courses.popularBadge')}</div>
                            <div className="course-badge">TOPIK II</div>
                            <h3 className="course-title">{t('homepage.vitamin.courses.topik2IntTitle')}<br />({t('homepage.vitamin.courses.topik2IntLevel')})</h3>
                            <div className="course-price">
                                <span className="price-amount">{t('homepage.vitamin.courses.topik2IntPrice')}</span>
                                <span className="price-period">{t('homepage.vitamin.courses.topik2IntDuration')}</span>
                            </div>
                            <ul className="course-features">
                                <li>{t('homepage.vitamin.courses.topik2IntFeature1')}</li>
                                <li>{t('homepage.vitamin.courses.topik2IntFeature2')}</li>
                                <li>{t('homepage.vitamin.courses.topik2IntFeature3')}</li>
                                <li>{t('homepage.vitamin.courses.topik2IntFeature4')}</li>
                                <li>{t('homepage.vitamin.courses.topik2IntFeature5')}</li>
                                <li>{t('homepage.vitamin.courses.topik2IntFeature6')}</li>
                                <li>{t('homepage.vitamin.courses.topik2IntFeature7')}</li>
                                <li>{t('homepage.vitamin.courses.topik2IntFeature8')}</li>
                                <li>{t('homepage.vitamin.courses.topik2IntFeature9')}</li>
                            </ul>
                            <button className="course-btn" onClick={() => scrollToSection('contact')}>
                                {t('homepage.vitamin.courses.registerBtn')}
                            </button>
                        </div>

                        {/* TOPIK II Advanced */}
                        <div className="course-card">
                            <div className="course-badge">TOPIK II</div>
                            <h3 className="course-title">{t('homepage.vitamin.courses.topik2AdvTitle')}<br />({t('homepage.vitamin.courses.topik2AdvLevel')})</h3>
                            <div className="course-price">
                                <span className="price-amount">{t('homepage.vitamin.courses.topik2AdvPrice')}</span>
                                <span className="price-period">{t('homepage.vitamin.courses.topik2AdvDuration')}</span>
                            </div>
                            <ul className="course-features">
                                <li>{t('homepage.vitamin.courses.topik2AdvFeature1')}</li>
                                <li>{t('homepage.vitamin.courses.topik2AdvFeature2')}</li>
                                <li>{t('homepage.vitamin.courses.topik2AdvFeature3')}</li>
                                <li>{t('homepage.vitamin.courses.topik2AdvFeature4')}</li>
                                <li>{t('homepage.vitamin.courses.topik2AdvFeature5')}</li>
                                <li>{t('homepage.vitamin.courses.topik2AdvFeature6')}</li>
                                <li>{t('homepage.vitamin.courses.topik2AdvFeature7')}</li>
                                <li>{t('homepage.vitamin.courses.topik2AdvFeature8')}</li>
                                <li>{t('homepage.vitamin.courses.topik2AdvFeature9')}</li>
                                <li>{t('homepage.vitamin.courses.topik2AdvFeature10')}</li>
                            </ul>
                            <button className="course-btn" onClick={() => scrollToSection('contact')}>
                                {t('homepage.vitamin.courses.registerBtn')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Teachers Section */}
            <section id="teachers" className="vitamin-teachers">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">{t('homepage.vitamin.teachers.title')}</h2>
                        <p className="section-subtitle">{t('homepage.vitamin.teachers.subtitle')}</p>
                    </div>
                    <div className="teachers-grid">
                        <div className="teacher-card">
                            <div className="teacher-avatar">👩‍🏫</div>
                            <h3>{t('homepage.vitamin.teachers.teacher1Name')}</h3>
                            <div className="teacher-title">{t('homepage.vitamin.teachers.teacher1Title')}</div>
                            <div className="teacher-info">
                                <p>{t('homepage.vitamin.teachers.teacher1Degree')}</p>
                                <p>{t('homepage.vitamin.teachers.teacher1Exp')}</p>
                                <p>{t('homepage.vitamin.teachers.teacher1Achievement')}</p>
                            </div>
                        </div>
                        <div className="teacher-card">
                            <div className="teacher-avatar">👨‍🏫</div>
                            <h3>{t('homepage.vitamin.teachers.teacher2Name')}</h3>
                            <div className="teacher-title">{t('homepage.vitamin.teachers.teacher2Title')}</div>
                            <div className="teacher-info">
                                <p>{t('homepage.vitamin.teachers.teacher2Degree')}</p>
                                <p>{t('homepage.vitamin.teachers.teacher2Exp')}</p>
                                <p>{t('homepage.vitamin.teachers.teacher2Achievement')}</p>
                            </div>
                        </div>
                        <div className="teacher-card">
                            <div className="teacher-avatar">👩‍🏫</div>
                            <h3>{t('homepage.vitamin.teachers.teacher3Name')}</h3>
                            <div className="teacher-title">{t('homepage.vitamin.teachers.teacher3Title')}</div>
                            <div className="teacher-info">
                                <p>{t('homepage.vitamin.teachers.teacher3Degree')}</p>
                                <p>{t('homepage.vitamin.teachers.teacher3Exp')}</p>
                                <p>{t('homepage.vitamin.teachers.teacher3Achievement')}</p>
                            </div>
                        </div>
                        <div className="teacher-card">
                            <div className="teacher-avatar">👨‍🏫</div>
                            <h3>{t('homepage.vitamin.teachers.teacher4Name')}</h3>
                            <div className="teacher-title">{t('homepage.vitamin.teachers.teacher4Title')}</div>
                            <div className="teacher-info">
                                <p>{t('homepage.vitamin.teachers.teacher4Degree')}</p>
                                <p>{t('homepage.vitamin.teachers.teacher4Exp')}</p>
                                <p>{t('homepage.vitamin.teachers.teacher4Achievement')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Achievements */}
            <section id="achievements" className="vitamin-achievements">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">{t('homepage.vitamin.achievements.title')}</h2>
                        <p className="section-subtitle">{t('homepage.vitamin.achievements.subtitle')}</p>
                    </div>
                    <div className="achievements-grid">
                        <div className="achievement-card">
                            <div className="achievement-icon">🏆</div>
                            <h3>{t('homepage.vitamin.achievements.achievement1Title')}</h3>
                            <p>{t('homepage.vitamin.achievements.achievement1Desc')}</p>
                        </div>
                        <div className="achievement-card">
                            <div className="achievement-icon">⭐</div>
                            <h3>{t('homepage.vitamin.achievements.achievement2Title')}</h3>
                            <p>{t('homepage.vitamin.achievements.achievement2Desc')}</p>
                        </div>
                        <div className="achievement-card">
                            <div className="achievement-icon">🎓</div>
                            <h3>{t('homepage.vitamin.achievements.achievement3Title')}</h3>
                            <p>{t('homepage.vitamin.achievements.achievement3Desc')}</p>
                        </div>
                        <div className="achievement-card">
                            <div className="achievement-icon">🤝</div>
                            <h3>{t('homepage.vitamin.achievements.achievement4Title')}</h3>
                            <p>{t('homepage.vitamin.achievements.achievement4Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="vitamin-testimonials">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">{t('homepage.vitamin.testimonials.title')}</h2>
                        <p className="section-subtitle">{t('homepage.vitamin.testimonials.subtitle')}</p>
                    </div>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">"{t('homepage.vitamin.testimonials.student1Text')}"</p>
                            <div className="testimonial-author">
                                <div className="author-avatar">👩</div>
                                <div>
                                    <div className="author-name">{t('homepage.vitamin.testimonials.student1Name')}</div>
                                    <div className="author-result">{t('homepage.vitamin.testimonials.student1Result')}</div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">"{t('homepage.vitamin.testimonials.student2Text')}"</p>
                            <div className="testimonial-author">
                                <div className="author-avatar">👨</div>
                                <div>
                                    <div className="author-name">{t('homepage.vitamin.testimonials.student2Name')}</div>
                                    <div className="author-result">{t('homepage.vitamin.testimonials.student2Result')}</div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">"{t('homepage.vitamin.testimonials.student3Text')}"</p>
                            <div className="testimonial-author">
                                <div className="author-avatar">👩</div>
                                <div>
                                    <div className="author-name">{t('homepage.vitamin.testimonials.student3Name')}</div>
                                    <div className="author-result">{t('homepage.vitamin.testimonials.student3Result')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="vitamin-contact">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">{t('homepage.vitamin.contact.title')}</h2>
                        <p className="section-subtitle">{t('homepage.vitamin.contact.subtitle')}</p>
                    </div>
                    <div className="contact-content">
                        <div className="contact-info">
                            <div className="contact-item">
                                <div className="contact-icon">📍</div>
                                <div>
                                    <h4>{t('homepage.vitamin.contact.addressLabel')}</h4>
                                    <p>{t('homepage.vitamin.contact.address')}</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <div className="contact-icon">📞</div>
                                <div>
                                    <h4>{t('homepage.vitamin.contact.hotlineLabel')}</h4>
                                    <p>{t('homepage.vitamin.contact.hotlineDesc')}</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <div className="contact-icon">✉️</div>
                                <div>
                                    <h4>{t('homepage.vitamin.contact.emailLabel')}</h4>
                                    <p>{t('homepage.vitamin.contact.email')}</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <div className="contact-icon">⏰</div>
                                <div>
                                    <h4>{t('homepage.vitamin.contact.hoursLabel')}</h4>
                                    <p>{t('homepage.vitamin.contact.hours')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="contact-form">
                            <h3>{t('homepage.vitamin.contact.formTitle')}</h3>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <input type="text" placeholder={t('homepage.vitamin.contact.formName')} required />
                                <input type="tel" placeholder={t('homepage.vitamin.contact.formPhone')} required />
                                <input type="email" placeholder={t('homepage.vitamin.contact.formEmail')} />
                                <select>
                                    <option value="">{t('homepage.vitamin.contact.formCourse')}</option>
                                    <option value="topik1">TOPIK I (Level 1-2)</option>
                                    <option value="topik2-34">TOPIK II (Level 3-4)</option>
                                    <option value="topik2-56">TOPIK II (Level 5-6)</option>
                                </select>
                                <textarea placeholder={t('homepage.vitamin.contact.formNote')} rows="4"></textarea>
                                <button type="submit" className="vitamin-btn vitamin-btn-primary vitamin-btn-full">
                                    {t('homepage.vitamin.contact.formSubmit')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="vitamin-footer">
                <div className="footer-content">
                    <div className="footer-col">
                        <div className="footer-logo">
                            <div className="logo-icon">🇰🇷</div>
                            <div>
                                <div className="logo-main">Vitamin</div>
                                <div className="logo-sub">Korean Center</div>
                            </div>
                        </div>
                        <p>{t('homepage.vitamin.footer.description')}</p>
                    </div>
                    <div className="footer-col">
                        <h4>{t('homepage.vitamin.footer.coursesTitle')}</h4>
                        <ul>
                            <li><a href="#courses">TOPIK I (Level 1-2)</a></li>
                            <li><a href="#courses">TOPIK II (Level 3-4)</a></li>
                            <li><a href="#courses">TOPIK II (Level 5-6)</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>{t('homepage.vitamin.footer.linksTitle')}</h4>
                        <ul>
                            <li><a href="#about">{t('homepage.vitamin.nav.about')}</a></li>
                            <li><a href="#teachers">{t('homepage.vitamin.nav.teachers')}</a></li>
                            <li><a href="#achievements">{t('homepage.vitamin.nav.achievements')}</a></li>
                            <li><a href="#contact">{t('homepage.vitamin.nav.contact')}</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>{t('homepage.vitamin.footer.socialTitle')}</h4>
                        <div className="social-links">
                            <a href="#" onClick={(e) => e.preventDefault()}>📘 Facebook</a>
                            <a href="#" onClick={(e) => e.preventDefault()}>📷 Instagram</a>
                            <a href="#" onClick={(e) => e.preventDefault()}>📺 YouTube</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>{t('homepage.vitamin.footer.copyright')}</p>
                </div>
            </footer>
        </div>
    );
};

export default Homepage2;
