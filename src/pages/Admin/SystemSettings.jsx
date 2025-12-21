import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const SystemSettings = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                {t('settings.title', 'Cài Đặt Hệ Thống')}
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                                {t('settings.subtitle', 'Cấu hình các thông số toàn hệ thống')}
                            </p>
                        </div>

                        {/* General Settings */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                                {t('settings.general', 'Cài Đặt Chung')}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                        {t('settings.siteName', 'Tên Website')}
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="Korean Vitamin"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                        {t('settings.contactEmail', 'Email Liên Hệ')}
                                    </label>
                                    <input
                                        type="email"
                                        defaultValue="contact@koreanvitamin.com"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                        {t('settings.hotline', 'Hotline')}
                                    </label>
                                    <input
                                        type="tel"
                                        defaultValue="0123-456-789"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Test Settings */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                                {t('settings.testSettings', 'Cài Đặt Bài Test')}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                        {t('settings.freeTestLimit', 'Giới hạn test miễn phí/IP')}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        defaultValue="2"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                        {t('settings.passScore', 'Điểm đậu mặc định (%)')}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        defaultValue="60"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Templates */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                                {t('settings.emailTemplates', 'Mẫu Email')}
                            </h2>
                            <div className="space-y-3">
                                <button className="w-full px-4 py-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition flex items-center justify-between group">
                                    <span className="font-medium text-gray-700 text-sm sm:text-base">{t('settings.welcomeEmail', 'Email Chào Mừng')}</span>
                                    <span className="text-primary-600 opacity-0 group-hover:opacity-100 transition">✏️</span>
                                </button>
                                <button className="w-full px-4 py-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition flex items-center justify-between group">
                                    <span className="font-medium text-gray-700 text-sm sm:text-base">{t('settings.testResultEmail', 'Email Kết Quả Test')}</span>
                                    <span className="text-primary-600 opacity-0 group-hover:opacity-100 transition">✏️</span>
                                </button>
                                <button className="w-full px-4 py-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition flex items-center justify-between group">
                                    <span className="font-medium text-gray-700 text-sm sm:text-base">{t('settings.reminderEmail', 'Email Nhắc Nhở')}</span>
                                    <span className="text-primary-600 opacity-0 group-hover:opacity-100 transition">✏️</span>
                                </button>
                            </div>
                        </div>

                        {/* Payment Settings */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                                {t('settings.payment', 'Cài Đặt Thanh Toán')}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                                        <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600" />
                                        <span className="font-medium text-gray-700 text-sm sm:text-base">{t('settings.enableMomo', 'Kích hoạt Momo')}</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                                        <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600" />
                                        <span className="font-medium text-gray-700 text-sm sm:text-base">{t('settings.enableBank', 'Kích hoạt chuyển khoản ngân hàng')}</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                                        <input type="checkbox" className="w-5 h-5 text-primary-600" />
                                        <span className="font-medium text-gray-700 text-sm sm:text-base">{t('settings.enableZaloPay', 'Kích hoạt ZaloPay')}</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button className="w-full px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-xl transition text-sm sm:text-base shadow-lg">
                            {t('settings.saveChanges', 'Lưu Thay Đổi')}
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SystemSettings;
