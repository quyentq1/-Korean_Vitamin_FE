import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './UpgradePopup.css';

const UpgradePopup = ({ onClose }) => {
    const { t } = useTranslation();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would call an API to send the contact request
        // For now, just show success state
        setTimeout(() => {
            setSubmitted(true);
        }, 500);
    };

    if (submitted) {
        return (
            <div className="popup-overlay">
                <div className="popup-content success">
                    <div className="success-icon">✅</div>
                    <h2>{t('component.upgradePopup.requestSent')}</h2>
                    <p>{t('component.upgradePopup.willContact')}</p>
                    <button onClick={onClose} className="btn-close">{t('component.upgradePopup.close')}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-header">
                    <h2>⚠️ {t('component.upgradePopup.freeTrialExpired')}</h2>
                    <button onClick={onClose} className="btn-close-x">×</button>
                </div>

                <div className="popup-body">
                    <p>{t('component.upgradePopup.usedAllTrials')}</p>
                    <p>{t('component.upgradePopup.upgradePrompt')}</p>

                    <div className="upgrade-benefits">
                        <h3>✨ {t('component.upgradePopup.premiumBenefits')}</h3>
                        <ul>
                            <li>✅ {t('component.upgradePopup.benefitUnlimited')}</li>
                            <li>✅ {t('component.upgradePopup.benefitAnswers')}</li>
                            <li>✅ {t('component.upgradePopup.benefitHistory')}</li>
                            <li>✅ {t('component.upgradePopup.benefitQuestionBank')}</li>
                        </ul>
                    </div>

                    <form onSubmit={handleSubmit} className="contact-form">
                        <h3>{t('component.upgradePopup.contactTitle')}</h3>
                        <input type="text" placeholder={t('component.upgradePopup.fullName')} required />
                        <input type="tel" placeholder={t('component.upgradePopup.phone')} required />
                        <input type="email" placeholder={t('component.upgradePopup.email')} required />
                        <button type="submit" className="btn-submit">{t('component.upgradePopup.sendRequest')}</button>
                    </form>

                    <div className="contact-info">
                        <p>{t('component.upgradePopup.hotline')}: <strong>1900 1234</strong></p>
                        <p>Email: <strong>support@koreanvitamin.com</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradePopup;
