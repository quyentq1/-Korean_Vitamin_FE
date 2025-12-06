import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Homepage3.css';

const Homepage3 = () => {
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
        <div className="vtm-container">
            {/* Language Toggle */}
            <button className="vtm-lang" onClick={toggleLanguage}>
                {currentLang === 'en' ? (
                    <>
                        <img src="https://flagcdn.com/w20/vn.png" alt="VN" />
                        Tiếng Việt
                    </>
                ) : (
                    <>
                        <img src="https://flagcdn.com/w20/gb.png" alt="EN" />
                        English
                    </>
                )}
            </button>

            {/* Navigation */}
            <nav className={`vtm-nav ${isScrolled ? 'vtm-nav-scrolled' : ''}`}>
                <div className="vtm-nav-wrap">
                    <div className="vtm-brand" onClick={() => scrollToSection('home')}>
                        🇰🇷 Vitamin Korean
                    </div>
                    <div className="vtm-menu">
                        <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>{t('homepage.vitamin.nav.home')}</a>
                        <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>{t('homepage.vitamin.nav.about')}</a>
                        <a href="#courses" onClick={(e) => { e.preventDefault(); scrollToSection('courses'); }}>{t('homepage.vitamin.nav.courses')}</a>
                        <a href="#teachers" onClick={(e) => { e.preventDefault(); scrollToSection('teachers'); }}>{t('homepage.vitamin.nav.teachers')}</a>
                        <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>{t('homepage.vitamin.nav.contact')}</a>
                    </div>
                    <button className="vtm-btn vtm-btn-nav" onClick={() => navigate('/login')}>
                        {t('homepage.vitamin.nav.login')}
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section id="home" className="vtm-hero">
                <div className="vtm-hero-bg">
                    <div className="vtm-circle vtm-c1"></div>
                    <div className="vtm-circle vtm-c2"></div>
                </div>
                <div className="vtm-hero-wrap">
                    <div className="vtm-hero-left">
                        <div className="vtm-tag">{t('homepage.vitamin.hero.badge2')}</div>
                        <h1>
                            {t('homepage.vitamin.hero.title2')} <span>{t('homepage.vitamin.hero.titleHighlight')}</span>
                        </h1>
                        <p>{t('homepage.vitamin.hero.description2')}</p>
                        <div className="vtm-hero-btns">
                            <button className="vtm-btn vtm-btn-primary" onClick={() => scrollToSection('courses')}>
                                {t('homepage.vitamin.hero.btnCourses2')}
                            </button>
                            <button className="vtm-btn vtm-btn-light" onClick={() => scrollToSection('contact')}>
                                {t('homepage.vitamin.hero.btnConsult2')}
                            </button>
                        </div>
                    </div>
                    <div className="vtm-stats-card">
                        <div className="vtm-stat">
                            <div className="vtm-stat-num">10+</div>
                            <div className="vtm-stat-txt">{t('homepage.vitamin.hero.stat1Label')}</div>
                        </div>
                        <div className="vtm-stat">
                            <div className="vtm-stat-num">5,000+</div>
                            <div className="vtm-stat-txt">{t('homepage.vitamin.hero.stat2Label2')}</div>
                        </div>
                        <div className="vtm-stat">
                            <div className="vtm-stat-num">98%</div>
                            <div className="vtm-stat-txt">{t('homepage.vitamin.hero.stat3Label2')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section id="about" className="vtm-about vtm-section">
                <div className="vtm-wrap">
                    <h2 className="vtm-title">{t('homepage.vitamin.about.title2')}</h2>
                    <p className="vtm-subtitle">{t('homepage.vitamin.about.subtitle2')}</p>
                    <div className="vtm-grid-3">
                        <div className="vtm-feature">
                            <div className="vtm-feature-icon">👨‍🏫</div>
                            <h3>{t('homepage.vitamin.about.feature1Title2')}</h3>
                            <p>{t('homepage.vitamin.about.feature1Desc2')}</p>
                        </div>
                        <div className="vtm-feature">
                            <div className="vtm-feature-icon">📚</div>
                            <h3>{t('homepage.vitamin.about.feature2Title2')}</h3>
                            <p>{t('homepage.vitamin.about.feature2Desc2')}</p>
                        </div>
                        <div className="vtm-feature">
                            <div className="vtm-feature-icon">🎓</div>
                            <h3>{t('homepage.vitamin.about.feature3Title')}</h3>
                            <p>{t('homepage.vitamin.about.feature3Desc2')}</p>
                        </div>
                        <div className="vtm-feature">
                            <div className="vtm-feature-icon">💻</div>
                            <h3>{t('homepage.vitamin.about.feature4Title2')}</h3>
                            <p>{t('homepage.vitamin.about.feature4Desc2')}</p>
                        </div>
                        <div className="vtm-feature">
                            <div className="vtm-feature-icon">📊</div>
                            <h3>{t('homepage.vitamin.about.feature5Title')}</h3>
                            <p>{t('homepage.vitamin.about.feature5Desc2')}</p>
                        </div>
                        <div className="vtm-feature">
                            <div className="vtm-feature-icon">🎯</div>
                            <h3>{t('homepage.vitamin.about.feature6Title')}</h3>
                            <p>{t('homepage.vitamin.about.feature6Desc2')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses */}
            <section id="courses" className="vtm-courses vtm-section">
                <div className="vtm-wrap">
                    <h2 className="vtm-title">{t('homepage.vitamin.courses.title2')}</h2>
                    <p className="vtm-subtitle">{t('homepage.vitamin.courses.subtitle2')}</p>
                    <div className="vtm-grid-3">
                        {/* TOPIK I */}
                        <div className="vtm-course">
                            <div className="vtm-course-head vtm-level1">
                                <div className="vtm-course-badge">TOPIK I</div>
                                <h3>{t('homepage.vitamin.courses.topik1Title')}<br />({t('homepage.vitamin.courses.topik1Level')})</h3>
                                <div className="vtm-price">
                                    {t('homepage.vitamin.courses.topik1Price')} <span>{t('homepage.vitamin.courses.topik1Duration')}</span>
                                </div>
                            </div>
                            <ul className="vtm-course-list">
                                <li>{t('homepage.vitamin.courses.topik1Feature1')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature2')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature3')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature4')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature5')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature6')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature7')}</li>
                                <li>{t('homepage.vitamin.courses.topik1Feature8')}</li>
                            </ul>
                            <button className="vtm-btn-course" onClick={() => scrollToSection('contact')}>
                                {t('homepage.vitamin.courses.registerBtn')}
                            </button>
                        </div>

                        {/* TOPIK II Intermediate */}
                        <div className="vtm-course vtm-popular">
                            <div className="vtm-badge-pop">{t('homepage.vitamin.courses.popularBadge')}</div>
                            <div className="vtm-course-head vtm-level2">
                                <div className="vtm-course-badge">TOPIK II</div>
                                <h3>{t('homepage.vitamin.courses.topik2IntTitle')}<br />({t('homepage.vitamin.courses.topik2IntLevel')})</h3>
                                <div className="vtm-price">
                                    {t('homepage.vitamin.courses.topik2IntPrice')} <span>{t('homepage.vitamin.courses.topik2IntDuration')}</span>
                                </div>
                            </div>
                            <ul className="vtm-course-list">
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
                            <button className="vtm-btn-course" onClick={() => scrollToSection('contact')}>
                                {t('homepage.vitamin.courses.registerBtn')}
                            </button>
                        </div>

                        {/* TOPIK II Advanced */}
                        <div className="vtm-course">
                            <div className="vtm-course-head vtm-level3">
                                <div className="vtm-course-badge">TOPIK II</div>
                                <h3>{t('homepage.vitamin.courses.topik2AdvTitle')}<br />({t('homepage.vitamin.courses.topik2AdvLevel')})</h3>
                                <div className="vtm-price">
                                    {t('homepage.vitamin.courses.topik2AdvPrice')} <span>{t('homepage.vitamin.courses.topik2AdvDuration')}</span>
                                </div>
                            </div>
                            <ul className="vtm-course-list">
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
                            <button className="vtm-btn-course" onClick={() => scrollToSection('contact')}>
                                {t('homepage.vitamin.courses.registerBtn')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Teachers */}
            <section id="teachers" className="vtm-teachers vtm-section">
                <div className="vtm-wrap">
                    <h2 className="vtm-title">{t('homepage.vitamin.teachers.title')}</h2>
                    <p className="vtm-subtitle">{t('homepage.vitamin.teachers.subtitle')}</p>
                    <div className="vtm-grid-4">
                        <div className="vtm-teacher">
                            <div className="vtm-teacher-img">👩‍🏫</div>
                            <h4>{t('homepage.vitamin.teachers.teacher1Name')}</h4>
                            <div className="vtm-teacher-role">{t('homepage.vitamin.teachers.teacher1Title')}</div>
                            <p>{t('homepage.vitamin.teachers.teacher1Degree2')}</p>
                            <p>{t('homepage.vitamin.teachers.teacher1Exp')}</p>
                        </div>
                        <div className="vtm-teacher">
                            <div className="vtm-teacher-img">👨‍🏫</div>
                            <h4>{t('homepage.vitamin.teachers.teacher2Name')}</h4>
                            <div className="vtm-teacher-role">{t('homepage.vitamin.teachers.teacher2Title')}</div>
                            <p>{t('homepage.vitamin.teachers.teacher2Degree2')}</p>
                            <p>{t('homepage.vitamin.teachers.teacher2Exp')}</p>
                        </div>
                        <div className="vtm-teacher">
                            <div className="vtm-teacher-img">👩‍🏫</div>
                            <h4>{t('homepage.vitamin.teachers.teacher3Name')}</h4>
                            <div className="vtm-teacher-role">{t('homepage.vitamin.teachers.teacher3Title')}</div>
                            <p>{t('homepage.vitamin.teachers.teacher3Degree2')}</p>
                            <p>{t('homepage.vitamin.teachers.teacher3Exp')}</p>
                        </div>
                        <div className="vtm-teacher">
                            <div className="vtm-teacher-img">👨‍🏫</div>
                            <h4>{t('homepage.vitamin.teachers.teacher4Name')}</h4>
                            <div className="vtm-teacher-role">{t('homepage.vitamin.teachers.teacher4Title')}</div>
                            <p>{t('homepage.vitamin.teachers.teacher4Degree2')}</p>
                            <p>{t('homepage.vitamin.teachers.teacher4Exp')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section id="contact" className="vtm-contact vtm-section">
                <div className="vtm-wrap">
                    <h2 className="vtm-title">{t('homepage.vitamin.contact.title')}</h2>
                    <p className="vtm-subtitle">{t('homepage.vitamin.contact.subtitle')}</p>
                    <div className="vtm-contact-grid">
                        <div>
                            <div className="vtm-contact-item">
                                <span>📍</span>
                                <div>
                                    <strong>{t('homepage.vitamin.contact.addressLabel')}</strong>
                                    <p>{t('homepage.vitamin.contact.address')}</p>
                                </div>
                            </div>
                            <div className="vtm-contact-item">
                                <span>📞</span>
                                <div>
                                    <strong>{t('homepage.vitamin.contact.hotlineLabel')}</strong>
                                    <p>{t('homepage.vitamin.contact.hotlineDesc')}</p>
                                </div>
                            </div>
                            <div className="vtm-contact-item">
                                <span>✉️</span>
                                <div>
                                    <strong>{t('homepage.vitamin.contact.emailLabel')}</strong>
                                    <p>{t('homepage.vitamin.contact.email')}</p>
                                </div>
                            </div>
                            <div className="vtm-contact-item">
                                <span>⏰</span>
                                <div>
                                    <strong>{t('homepage.vitamin.contact.hoursLabel')}</strong>
                                    <p>{t('homepage.vitamin.contact.hours2')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="vtm-form">
                            <h3>{t('homepage.vitamin.contact.formTitle2')}</h3>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <input type="text" placeholder={t('homepage.vitamin.contact.formName')} required />
                                <input type="tel" placeholder={t('homepage.vitamin.contact.formPhone')} required />
                                <input type="email" placeholder={t('homepage.vitamin.contact.formEmail')} />
                                <select>
                                    <option value="">{t('homepage.vitamin.contact.formCourse2')}</option>
                                    <option value="topik1">TOPIK I (Level 1-2)</option>
                                    <option value="topik2-34">TOPIK II (Level 3-4)</option>
                                    <option value="topik2-56">TOPIK II (Level 5-6)</option>
                                </select>
                                <textarea placeholder={t('homepage.vitamin.contact.formNote2')} rows="4"></textarea>
                                <button type="submit" className="vtm-btn vtm-btn-primary vtm-btn-full">
                                    {t('homepage.vitamin.contact.formSubmit2')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="vtm-footer">
                <div className="vtm-wrap">
                    <div className="vtm-footer-grid">
                        <div>
                            <strong>🇰🇷 Vitamin Korean</strong>
                            <p>{t('homepage.vitamin.footer.description2')}</p>
                        </div>
                        <div>
                            <strong>{t('homepage.vitamin.footer.coursesTitle')}</strong>
                            <p>TOPIK I (Level 1-2)</p>
                            <p>TOPIK II (Level 3-4)</p>
                            <p>TOPIK II (Level 5-6)</p>
                        </div>
                        <div>
                            <strong>{t('homepage.vitamin.footer.linksTitle')}</strong>
                            <p><a href="#about">{t('homepage.vitamin.nav.about')}</a></p>
                            <p><a href="#teachers">{t('homepage.vitamin.nav.teachers')}</a></p>
                            <p><a href="#contact">{t('homepage.vitamin.nav.contact')}</a></p>
                        </div>
                        <div>
                            <strong>{t('homepage.vitamin.footer.socialTitle2')}</strong>
                            <p><a href="#">📘 Facebook</a></p>
                            <p><a href="#">📷 Instagram</a></p>
                            <p><a href="#">📺 YouTube</a></p>
                        </div>
                    </div>
                    <div className="vtm-footer-bottom">
                        <p>{t('homepage.vitamin.footer.copyright')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Homepage3;
