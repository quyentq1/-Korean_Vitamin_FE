import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Alert } from '../../components/ui';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const SystemSettings = () => {
    const { t } = useTranslation();
    
    // State
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    
    // Form state
    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'Korean Vitamin',
        contactEmail: 'contact@koreanvitamin.com',
        hotline: '0123456789'
    });
    const [emailSettings, setEmailSettings] = useState({
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUser: 'noreply@koreanvitamin.com',
        smtpPassword: '',
        fromEmail: 'noreply@koreanvitamin.com',
        fromName: 'Korean Vitamin'
    });
    const [paymentSettings, setPaymentSettings] = useState({
        momoEnabled: false,
        zalopayEnabled: false,
        bankTransferEnabled: true,
        bankName: 'Vietcombank',
        bankAccount: '1234567890',
        bankBranch: 'Hà Nội'
    });
    
    // Handle save
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSuccess(true);
            
            // Reset success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            setError(t('settings.saveError', 'Không thể lưu cài đặt'));
            console.error("Failed to save settings:", err);
        } finally {
            setLoading(false);
        }
    };
    
    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('settings.title', 'Cài Đặt Hệ Thống')}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {t('settings.subtitle', 'Cấu hình các thông số và tùy chọn toàn cầu')}
                    </p>
                </div>
                
                {/* Success Alert */}
                {success && (
                    <Alert variant="success" dismissible onDismiss={() => setSuccess(false)}>
                        {t('settings.saveSuccess', 'Đã lưu cài đặt thành công!')}
                    </Alert>
                )}
                
                {/* Error Alert */}
                {error && (
                    <Alert variant="error" dismissible onDismiss={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                
                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => handleTabChange('general')}
                                className={`${
                                    activeTab === 'general'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } px-1 py-4 text-sm font-medium transition-colors duration-200 focus:outline-none focus:border-primary-500`}
                            >
                                {t('settings.general', 'Chung')}
                            </button>
                            <button
                                onClick={() => handleTabChange('email')}
                                className={`${
                                    activeTab === 'email'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } px-1 py-4 text-sm font-medium transition-colors duration-200 focus:outline-none focus:border-primary-500`}
                            >
                                {t('settings.email', 'Email')}
                            </button>
                            <button
                                onClick={() => handleTabChange('payment')}
                                className={`${
                                    activeTab === 'payment'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } px-1 py-4 text-sm font-medium transition-colors duration-200 focus:outline-none focus:border-primary-500`}
                            >
                                {t('settings.payment', 'Thanh Toán')}
                            </button>
                        </nav>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="p-6">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    {t('settings.general', 'Cài Đặt Chung')}
                                </h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('settings.siteName', 'Tên Website')}
                                        </label>
                                        <Input
                                            type="text"
                                            value={generalSettings.siteName}
                                            onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                                            placeholder={t('settings.siteNamePlaceholder', 'Nhập tên website...')}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('settings.contactEmail', 'Email Liên Hệ')}
                                        </label>
                                        <Input
                                            type="email"
                                            value={generalSettings.contactEmail}
                                            onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
                                            placeholder={t('settings.contactEmailPlaceholder', 'Nhập email liên hệ...')}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('settings.hotline', 'Hotline')}
                                        </label>
                                        <Input
                                            type="tel"
                                            value={generalSettings.hotline}
                                            onChange={(e) => setGeneralSettings({...generalSettings, hotline: e.target.value})}
                                            placeholder={t('settings.hotlinePlaceholder', 'Nhập số hotline...')}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Email Settings */}
                        {activeTab === 'email' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    {t('settings.emailConfiguration', 'Cấu Hình Email')}
                                </h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('settings.smtpHost', 'SMTP Host')}
                                        </label>
                                        <Input
                                            type="text"
                                            value={emailSettings.smtpHost}
                                            onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                                            placeholder="smtp.gmail.com"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('settings.smtpPort', 'SMTP Port')}
                                        </label>
                                        <Input
                                            type="number"
                                            value={emailSettings.smtpPort}
                                            onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                                            placeholder="587"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('settings.smtpUser', 'SMTP User')}
                                        </label>
                                        <Input
                                            type="text"
                                            value={emailSettings.smtpUser}
                                            onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                                            placeholder="noreply@koreanvitamin.com"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('settings.smtpPassword', 'SMTP Password')}
                                        </label>
                                        <Input
                                            type="password"
                                            value={emailSettings.smtpPassword}
                                            onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('settings.fromEmail', 'Email Gửi')}
                                        </label>
                                        <Input
                                            type="email"
                                            value={emailSettings.fromEmail}
                                            onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                                            placeholder="noreply@koreanvitamin.com"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('settings.fromName', 'Tên Gửi')}
                                        </label>
                                        <Input
                                            type="text"
                                            value={emailSettings.fromName}
                                            onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                                            placeholder="Korean Vitamin"
                                        />
                                    </div>
                                    
                                    <div className="border-t border-gray-200 pt-4 mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            {t('settings.emailTemplates', 'Mẫu Email')}
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            <button
                                                className="w-full px-4 py-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition flex items-center justify-between group"
                                            >
                                                <span className="font-medium text-gray-700 text-sm sm:text-base">
                                                    {t('settings.welcomeEmail', 'Email Chào Mừng')}
                                                </span>
                                                <span className="text-primary-600 opacity-0 group-hover:opacity-100 transition">✏️</span>
                                            </button>
                                            
                                            <button
                                                className="w-full px-4 py-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition flex items-center justify-between group"
                                            >
                                                <span className="font-medium text-gray-700 text-sm sm:text-base">
                                                    {t('settings.testResultEmail', 'Email Kết Quả Test')}
                                                </span>
                                                <span className="text-primary-600 opacity-0 group-hover:opacity-100 transition">✏️</span>
                                            </button>
                                            
                                            <button
                                                className="w-full px-4 py-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition flex items-center justify-between group"
                                            >
                                                <span className="font-medium text-gray-700 text-sm sm:text-base">
                                                    {t('settings.reminderEmail', 'Email Nhắc Nhở')}
                                                </span>
                                                <span className="text-primary-600 opacity-0 group-hover:opacity-100 transition">✏️</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Payment Settings */}
                        {activeTab === 'payment' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    {t('settings.paymentConfiguration', 'Cấu Hình Thanh Toán')}
                                </h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={paymentSettings.momoEnabled}
                                                onChange={(e) => setPaymentSettings({...paymentSettings, momoEnabled: e.target.checked})}
                                                className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="font-medium text-gray-700 text-sm sm:text-base">
                                                {t('settings.enableMomo', 'Kích hoạt Momo')}
                                            </span>
                                        </label>
                                    </div>
                                    
                                    <div>
                                        <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={paymentSettings.zalopayEnabled}
                                                onChange={(e) => setPaymentSettings({...paymentSettings, zalopayEnabled: e.target.checked})}
                                                className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="font-medium text-gray-700 text-sm sm:text-base">
                                                {t('settings.enableZaloPay', 'Kích hoạt ZaloPay')}
                                            </span>
                                        </label>
                                    </div>
                                    
                                    <div>
                                        <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={paymentSettings.bankTransferEnabled}
                                                onChange={(e) => setPaymentSettings({...paymentSettings, bankTransferEnabled: e.target.checked})}
                                                className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="font-medium text-gray-700 text-sm sm:text-base">
                                                {t('settings.enableBankTransfer', 'Kích hoạt chuyển khoản ngân hàng')}
                                            </span>
                                        </label>
                                    </div>
                                    
                                    <div className="border-t border-gray-200 pt-4 mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            {t('settings.bankInfo', 'Thông Tin Ngân Hàng')}
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('settings.bankName', 'Tên Ngân Hàng')}
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={paymentSettings.bankName}
                                                    onChange={(e) => setPaymentSettings({...paymentSettings, bankName: e.target.value})}
                                                    placeholder="Vietcombank"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('settings.bankAccount', 'Số Tài Khoản')}
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={paymentSettings.bankAccount}
                                                    onChange={(e) => setPaymentSettings({...paymentSettings, bankAccount: e.target.value})}
                                                    placeholder="1234567890"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('settings.bankBranch', 'Chi Nhánh')}
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={paymentSettings.bankBranch}
                                                    onChange={(e) => setPaymentSettings({...paymentSettings, bankBranch: e.target.value})}
                                                    placeholder="Hà Nội"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Save Button */}
                    <div className="mt-6 flex justify-end">
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            loading={loading}
                        >
                            {t('settings.saveChanges', 'Lưu Thay Đổi')}
                        </Button>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default SystemSettings;
