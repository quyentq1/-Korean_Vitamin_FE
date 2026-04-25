import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import CourseStatus from '../components/Learner/CourseStatus';
import Swal from 'sweetalert2';

const Profile = () => {
    const { t } = useTranslation();
    const { user, logout, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('info');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [refreshingUser, setRefreshingUser] = useState(false);

    // Fetch fresh user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setRefreshingUser(true);
                const freshUserData = await authService.fetchCurrentUser();
                updateUser(freshUserData);
            } catch (error) {
                console.error('Failed to fetch fresh user data:', error);
            } finally {
                setRefreshingUser(false);
            }
        };

        fetchUserData();
    }, []);

    // Show loading indicator while fetching data
    if (refreshingUser) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl mt-16 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin text-4xl mb-4">⟳</div>
                        <p className="text-gray-600">{t('profile.loading', 'Đang tải thông tin...')}</p>
                    </div>
                </main>
            </div>
        );
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            Swal.fire({
                icon: 'error',
                title: t('profile.avatarError.invalidFormat'),
                text: t('profile.avatarError.invalidFormatDesc'),
                confirmButtonText: t('common.agree'),
                confirmButtonColor: '#ef4444'
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: t('profile.avatarError.fileTooLarge'),
                text: t('profile.avatarError.fileTooLargeDesc'),
                confirmButtonText: t('common.agree'),
                confirmButtonColor: '#ef4444'
            });
            return;
        }

        try {
            setUploadingAvatar(true);

            // Upload avatar
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/upload-avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload avatar');
            }

            const data = await response.json();

            // Update user with new avatar
            updateUser({ ...user, avatar: data.url });
        } catch (err) {
            console.error('Error uploading avatar:', err);
            Swal.fire({
                icon: 'error',
                title: t('profile.avatarError.uploadFailed'),
                text: t('profile.avatarError.uploadFailedDesc'),
                confirmButtonText: t('common.agree'),
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl mt-16">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="w-full md:w-1/4">
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 p-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative w-24 h-24 group mb-4">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Avatar"
                                            className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-gray-100"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold">
                                            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                        </div>
                                    )}

                                    {/* Loading overlay - always visible when uploading */}
                                    {uploadingAvatar && (
                                        <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white z-10">
                                            <div className="animate-spin text-3xl mb-1">⟳</div>
                                            <span className="text-xs">{t('common.loading')}</span>
                                        </div>
                                    )}

                                    {/* Upload overlay - only visible on hover when not uploading */}
                                    <label className={`absolute inset-0 bg-black/50 rounded-full cursor-pointer flex flex-col items-center justify-center text-white transition-opacity ${
                                        uploadingAvatar ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'
                                    }`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                            disabled={uploadingAvatar}
                                        />
                                    </label>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{user?.fullName || user?.username}</h2>
                                <p className="text-gray-500 text-sm">{user?.email}</p>
                                <span className="mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                                    {user?.role || t('profile.defaultRole', 'Học viên')}
                                </span>
                            </div>

                            <nav className="space-y-1">
                                {[
                                    { id: 'info', name: t('profile.tabs.info', 'Thông tin cá nhân'), icon: '👤' },
                                    { id: 'password', name: t('profile.tabs.password', 'Đổi mật khẩu'), icon: '🔒' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="mr-3 text-lg">{tab.icon}</span>
                                        {tab.name}
                                    </button>
                                ))}
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-all mt-4"
                                >
                                    <span className="mr-3 text-lg">🚪</span>
                                    {t('profile.logout', 'Đăng xuất')}
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full md:w-3/4">
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 p-6 md:p-8 min-h-[500px]">
                            {activeTab === 'info' && <ProfileInfo user={user} />}
                            {activeTab === 'password' && <ChangePassword />}
                            {activeTab === 'history' && <ExamHistory />}
                            {activeTab === 'courses' && <MyCourses />}
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
};

// --- Sub Components ---

const ProfileInfo = ({ user }) => {
    const { t } = useTranslation();
    const { updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        dateOfBirth: user?.dateOfBirth ? (user.dateOfBirth.includes('T') ? user.dateOfBirth.split('T')[0] : user.dateOfBirth) : '',
        gender: user?.gender || 'MALE',
        address: user?.address || '',
        avatar: user?.avatar || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Update formData when user prop changes (after fetch from API)
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth ? (user.dateOfBirth.includes('T') ? user.dateOfBirth.split('T')[0] : user.dateOfBirth) : '',
                gender: user.gender || 'MALE',
                address: user.address || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
        setSuccess('');
        setFormData({
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
            gender: user?.gender || 'MALE',
            address: user?.address || '',
            avatar: user?.avatar || ''
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
        setFormData({
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
            gender: user?.gender || 'MALE',
            address: user?.address || '',
            avatar: user?.avatar || ''
        });
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');

        // Validation
        if (!formData.fullName.trim()) {
            setError(t('profile.validation.nameRequired', 'Họ và tên không được để trống'));
            return;
        }

        if (formData.phone && formData.phone.length < 10) {
            setError(t('profile.validation.phoneMinLength', 'Số điện thoại phải có ít nhất 10 số'));
            return;
        }

        setLoading(true);
        try {
            const response = await authService.updateProfile({
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim(),
                dateOfBirth: formData.dateOfBirth || null,
                gender: formData.gender,
                address: formData.address.trim(),
                avatar: formData.avatar
            });

            // Cập nhật user state trong AuthContext
            if (response.user) {
                updateUser(response.user);
            }

            setSuccess(t('profile.updateSuccess', 'Cập nhật thông tin thành công!'));
            setIsEditing(false);

            // Tự động ẩn thông báo success sau 3 giây
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || t('profile.updateError', 'Không thể cập nhật thông tin. Vui lòng thử lại.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{t('profile.infoTitle', 'Thông tin cá nhân')}</h3>
                {!isEditing && (
                    <button
                        onClick={handleEdit}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732a2.5 2.5 0 013.536 3.536z" />
                        </svg>
                        {t('profile.edit', 'Chỉnh sửa')}
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start">
                    <span className="mr-2">❌</span> {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-start">
                    <span className="mr-2">✅</span> {success}
                </div>
            )}

            <div className="space-y-6 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Họ và tên */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('profile.fullName', 'Họ và tên')} {isEditing && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="text"
                            className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                                isEditing
                                    ? 'border-gray-200 bg-white'
                                    : 'border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed'
                            }`}
                            value={isEditing ? formData.fullName : (user?.fullName || '')}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            readOnly={!isEditing}
                            placeholder={t('profile.fullNamePlaceholder', 'Nhập họ và tên')}
                        />
                    </div>

                    {/* Tên đăng nhập */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.username', 'Tên đăng nhập')}</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                            value={user?.username || ''}
                            readOnly
                        />
                        <p className="mt-1 text-xs text-gray-500">{t('profile.usernameNote', 'Không thể thay đổi tên đăng nhập')}</p>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.email', 'Email')}</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                            value={user?.email || ''}
                            readOnly
                        />
                        <p className="mt-1 text-xs text-gray-500">{t('profile.emailNote', 'Liên hệ admin để thay đổi email')}</p>
                    </div>

                    {/* Số điện thoại */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('profile.phone', 'Số điện thoại')}
                        </label>
                        <input
                            type="tel"
                            className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                                isEditing
                                    ? 'border-gray-200 bg-white'
                                    : 'border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed'
                            }`}
                            value={isEditing ? (formData.phone || '') : (user?.phone || t('profile.notUpdated', 'Chưa cập nhật'))}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            readOnly={!isEditing}
                            placeholder={isEditing ? '0xxxxxxxxx' : ''}
                        />
                    </div>

                    {/* Ngày sinh */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.dateOfBirth', 'Ngày sinh')}</label>
                        <input
                            type="date"
                            className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                                isEditing
                                    ? 'border-gray-200 bg-white'
                                    : 'border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed'
                            }`}
                            value={isEditing ? formData.dateOfBirth : (user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : t('profile.notUpdated', 'Chưa cập nhật'))}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            readOnly={!isEditing}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Giới tính */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.gender', 'Giới tính')}</label>
                        {isEditing ? (
                            <div className="flex gap-3">
                                {['MALE', 'FEMALE', 'OTHER'].map((gender) => (
                                    <label
                                        key={gender}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-xl cursor-pointer transition-all ${
                                            formData.gender === gender
                                                ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={gender}
                                            checked={formData.gender === gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="hidden"
                                        />
                                        <span className="font-medium">
                                            {gender === 'MALE' ? t('profile.male', 'Nam') : gender === 'FEMALE' ? t('profile.female', 'Nữ') : t('profile.other', 'Khác')}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed outline-none"
                                value={user?.gender === 'MALE' ? t('profile.male', 'Nam') : user?.gender === 'FEMALE' ? t('profile.female', 'Nữ') : user?.gender === 'OTHER' ? t('profile.other', 'Khác') : t('profile.notUpdated', 'Chưa cập nhật')}
                                readOnly
                            />
                        )}
                    </div>

                    {/* Địa chỉ - Full width */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.address', 'Địa chỉ')}</label>
                        <textarea
                            className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none ${
                                isEditing
                                    ? 'border-gray-200 bg-white'
                                    : 'border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed'
                            }`}
                            value={isEditing ? formData.address : (user?.address || t('profile.notUpdated', 'Chưa cập nhật'))}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            readOnly={!isEditing}
                            placeholder={t('profile.addressPlaceholder', 'Nhập địa chỉ')}
                            rows={3}
                        />
                    </div>
                </div>

                {isEditing && (
                    <>
                        {/* Warning Note */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 text-yellow-600 mt-0.5">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-yellow-900">{t('profile.warning', 'Lưu ý')}</h4>
                                    <p className="text-sm text-yellow-800 mt-1">
                                        {t('profile.warningText', 'Thay đổi thông tin cá nhân có thể ảnh hưởng đến các dữ liệu liên quan như điểm danh, báo cáo. Vui lòng kiểm tra kỹ trước khi lưu.')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                            >
                                {t('profile.cancel', 'Hủy')}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin mr-2">⟳</span>
                                        {t('profile.saving', 'Đang lưu...')}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t('profile.saveChanges', 'Lưu thay đổi')}
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const ChangePassword = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError(t('profile.validation.confirmMismatch', 'Mật khẩu xác nhận không khớp.'));
            return;
        }

        if (formData.newPassword.length < 6) {
            setError(t('profile.validation.passwordMinLength', 'Mật khẩu mới phải có ít nhất 6 ký tự.'));
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword(formData.currentPassword, formData.newPassword);
            setSuccess(t('profile.passwordChangeSuccess', 'Đổi mật khẩu thành công!'));
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || t('profile.passwordChangeError', 'Có lỗi xảy ra, vui lòng kiểm tra lại mật khẩu hiện tại.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.changePassword', 'Đổi mật khẩu')}</h3>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-md">

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start">
                        <span className="mr-2">❌</span> {error}
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-start">
                        <span className="mr-2">✅</span> {success}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.currentPassword', 'Mật khẩu hiện tại')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.newPassword', 'Mật khẩu mới')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.confirmNewPassword', 'Xác nhận mật khẩu mới')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? (
                            <><span className="animate-spin mr-2">⟳</span> {t('profile.processing', 'Đang xử lý...')}</>
                        ) : t('profile.saveChanges', 'Lưu thay đổi')}
                    </button>
                </div>
            </form>
        </div>
    );
};

const ExamHistory = () => {
    const { t } = useTranslation();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('../services/examService').then(({ examService }) => {
            examService.getAttemptHistory()
                .then(res => setHistory(res))
                .catch(err => console.error("Failed to fetch history", err))
                .finally(() => setLoading(false));
        });
    }, []);

    if (loading) {
        return (
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.examHistory', 'Lịch sử làm bài')}</h3>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-100 rounded-xl w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.examHistory', 'Lịch sử làm bài')}</h3>
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                    <span className="text-4xl block mb-3">📝</span>
                    <h4 className="text-gray-900 font-medium mb-1">{t('profile.noData', 'Chưa có dữ liệu')}</h4>
                    <p className="text-gray-500 text-sm">{t('profile.noExamHistory', 'Bạn chưa thực hiện bài thi nào. Hãy bắt đầu ngay!')}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.examHistory')}</h3>
            <div className="space-y-4">
                {history.map(attempt => (
                    <div key={attempt.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">{attempt.exam?.title || t('profile.unknownExam')}</h4>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                <span>📅 {new Date(attempt.startTime).toLocaleDateString('vi-VN')}</span>
                                <span>⏱️ {attempt.durationMinutes || attempt.exam?.durationMinutes} phút</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="block text-xs uppercase text-gray-500 font-semibold tracking-wider">{t('profile.score', 'Điểm số')}</span>
                                <span className="text-2xl font-bold text-primary-600">
                                    {attempt.totalScore != null ? attempt.totalScore : (attempt.autoScore || 0)}
                                </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${attempt.status === 'GRADED' ? 'bg-green-100 text-green-700' :
                                attempt.status === 'PENDING_MANUAL_GRADE' ? 'bg-yellow-100 text-yellow-700' :
                                    attempt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {attempt.status === 'GRADED' ? t('profile.graded', 'Đã chấm') :
                                    attempt.status === 'PENDING_MANUAL_GRADE' ? t('profile.pendingGrade', 'Chờ chấm bài') :
                                        attempt.status === 'IN_PROGRESS' ? t('profile.inProgress', 'Đang làm') :
                                            t('profile.submitted', 'Đã nộp')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MyCourses = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('../services/classService').then(({ classService }) => {
            classService.getMyClasses()
                .then(res => setCourses(res))
                .catch(err => console.error("Failed to fetch courses", err))
                .finally(() => setLoading(false));
        });
    }, []);

    if (loading) {
        return (
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.myCourses', 'Khoá học của tôi')}</h3>
                <div className="animate-pulse space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-24 bg-gray-100 rounded-xl w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.myCourses', 'Khoá học của tôi')}</h3>
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                    <span className="text-4xl block mb-3">📚</span>
                    <h4 className="text-gray-900 font-medium mb-1">{t('profile.noCourses', 'Bạn chưa tham gia khoá học nào')}</h4>
                    <p className="text-gray-500 text-sm">{t('profile.noCoursesDesc', 'Hãy liên hệ trung tâm để đăng ký khoá học mới.')}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.myCourses')}</h3>

            {/* Course Status & Expiration Warnings */}
            <CourseStatus />

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map(course => (
                    <div key={course.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{course.className || course.classEntity?.className || 'Lớp học'}</h4>
                        <div className="text-sm text-gray-500 space-y-1 mt-3">
                            <p>🏷️ Mã lớp: <span className="font-medium">{course.classCode || course.classEntity?.classCode}</span></p>
                            <p>📅 Ngày học: {new Date(course.classEntity?.startDate || course.startDate).toLocaleDateString('vi-VN')} - {new Date(course.classEntity?.endDate || course.endDate).toLocaleDateString('vi-VN')}</p>
                            <p>📊 Trạng thái: <span className={`font-semibold ${course.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}`}>
                                {course.status === 'ACTIVE' ? t('profile.active', 'Đang học') : t('profile.ended', 'Đã kết thúc')}
                            </span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;
