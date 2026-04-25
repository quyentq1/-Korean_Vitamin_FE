import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Eye, EyeOff, CheckCircle } from 'lucide-react';

/**
 * ResetPasswordModal - Modal để đặt lại mật khẩu người dùng
 * Priority 2: User Management Enhancement
 */
const ResetPasswordModal = ({ user, onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
    const isPasswordStrong = newPassword && newPassword.length >= 6;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword || !passwordsMatch || !isPasswordStrong) {
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(newPassword);
        } finally {
            setSubmitting(false);
        }
    };

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0869627078!@#$%^&*';
        const password = Array.from({ length: 12 }, () =>
            chars.charAt(Math.floor(Math.random() * chars.length))
        ).join('');
        setNewPassword(password);
        setConfirmPassword(password);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{t('admin.resetPassword.title')}</h3>
                            <p className="text-sm text-gray-600">
                                {user?.fullName || user?.username}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('admin.resetPassword.newPassword')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={t('admin.resetPassword.newPasswordPlaceholder')}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {newPassword && (
                                <div className="mt-2 space-y-1">
                                    <div className={`flex items-center gap-2 text-xs ${newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                                        {newPassword.length >= 6 ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 border border-gray-300 rounded-full" />}
                                        {t('admin.resetPassword.minChars')}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('admin.resetPassword.confirmPassword')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t('admin.resetPassword.confirmPasswordPlaceholder')}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {confirmPassword && (
                                <div className={`flex items-center gap-2 text-xs mt-2 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                                    {passwordsMatch ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 border-2 border-current rounded-full" />}
                                    {passwordsMatch ? t('admin.resetPassword.passwordMatch') : t('admin.resetPassword.passwordMismatch')}
                                </div>
                            )}
                        </div>

                        {/* Generate Random Password Button */}
                        <button
                            type="button"
                            onClick={generateRandomPassword}
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            🎲 {t('admin.resetPassword.generateRandom')}
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !passwordsMatch || !isPasswordStrong}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {t('common.processing')}
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    {t('admin.resetPassword.reset')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordModal;
