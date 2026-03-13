import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import authService from '../services/authService';
import CourseStatus from '../components/Learner/CourseStatus';
// Assuming you have a sweetalert or toast utility, we use a basic alert if not available
// import { toast } from 'react-hot-toast';

const Profile = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('info');

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl mt-16">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="w-full md:w-1/4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-3xl font-bold mb-4">
                                    {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{user?.fullName || user?.username}</h2>
                                <p className="text-gray-500 text-sm">{user?.email}</p>
                                <span className="mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                                    {user?.role || 'Học viên'}
                                </span>
                            </div>

                            <nav className="space-y-1">
                                {[
                                    { id: 'info', name: 'Thông tin cá nhân', icon: '👤' },
                                    { id: 'password', name: 'Đổi mật khẩu', icon: '🔒' },
                                    { id: 'history', name: 'Lịch sử thi', icon: '📝' },
                                    { id: 'courses', name: 'Khoá học của tôi', icon: '📚' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === tab.id
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="mr-3 text-lg">{tab.icon}</span>
                                        {tab.name}
                                    </button>
                                ))}
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-4"
                                >
                                    <span className="mr-3 text-lg">🚪</span>
                                    Đăng xuất
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full md:w-3/4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
                            {activeTab === 'info' && <ProfileInfo user={user} />}
                            {activeTab === 'password' && <ChangePassword />}
                            {activeTab === 'history' && <ExamHistory />}
                            {activeTab === 'courses' && <MyCourses />}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// --- Sub Components ---

const ProfileInfo = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
        setSuccess('');
        setFormData({
            fullName: user?.fullName || '',
            phone: user?.phone || ''
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
        setFormData({
            fullName: user?.fullName || '',
            phone: user?.phone || ''
        });
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');

        // Validation
        if (!formData.fullName.trim()) {
            setError('Họ và tên không được để trống');
            return;
        }

        if (formData.phone && formData.phone.length < 10) {
            setError('Số điện thoại phải có ít nhất 10 số');
            return;
        }

        setLoading(true);
        try {
            await authService.updateProfile({
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim()
            });
            setSuccess('Cập nhật thông tin thành công!');
            setIsEditing(false);
            // Reload page to get updated user info
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h3>
                {!isEditing && (
                    <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732a2.5 2.5 0 013.536 3.536z" />
                        </svg>
                        Chỉnh sửa
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
                    <span className="mr-2">❌</span> {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-start">
                    <span className="mr-2">✅</span> {success}
                </div>
            )}

            <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên {isEditing && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="text"
                            className={`w-full px-4 py-2 border rounded-lg transition-colors ${
                                isEditing
                                    ? 'border-gray-300 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                                    : 'border-gray-300 bg-gray-50 text-gray-700 cursor-not-allowed'
                            }`}
                            value={isEditing ? formData.fullName : (user?.fullName || '')}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                            value={user?.username || ''}
                            readOnly
                        />
                        <p className="mt-1 text-xs text-gray-500">Không thể thay đổi tên đăng nhập</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                            value={user?.email || ''}
                            readOnly
                        />
                        <p className="mt-1 text-xs text-gray-500">Liên hệ admin để thay đổi email</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại {isEditing && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="tel"
                            className={`w-full px-4 py-2 border rounded-lg transition-colors ${
                                isEditing
                                    ? 'border-gray-300 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                                    : 'border-gray-300 bg-gray-50 text-gray-700 cursor-not-allowed'
                            }`}
                            value={isEditing ? (formData.phone || '') : (user?.phone || 'Chưa cập nhật')}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            readOnly={!isEditing}
                            placeholder={isEditing ? 'Nhập số điện thoại' : ''}
                        />
                    </div>
                </div>

                {isEditing && (
                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <><span className="animate-spin mr-2">⟳</span> Đang lưu...</>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ChangePassword = () => {
    const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword(formData.currentPassword, formData.newPassword);
            setSuccess('Đổi mật khẩu thành công!');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại mật khẩu hiện tại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Đổi mật khẩu</h3>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-md">

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
                        <span className="mr-2">❌</span> {error}
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-start">
                        <span className="mr-2">✅</span> {success}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu hiện tại <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-70 flex items-center"
                    >
                        {loading ? (
                            <><span className="animate-spin mr-2">⟳</span> Đang xử lý...</>
                        ) : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const ExamHistory = () => {
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử làm bài</h3>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử làm bài</h3>
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                    <span className="text-4xl block mb-3">📝</span>
                    <h4 className="text-gray-900 font-medium mb-1">Chưa có dữ liệu</h4>
                    <p className="text-gray-500 text-sm">Bạn chưa thực hiện bài thi nào. Hãy bắt đầu ngay!</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử làm bài</h3>
            <div className="space-y-4">
                {history.map(attempt => (
                    <div key={attempt.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">{attempt.exam?.title || 'Bài thi không xác định'}</h4>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                <span>📅 {new Date(attempt.startTime).toLocaleDateString('vi-VN')}</span>
                                <span>⏱️ {attempt.durationMinutes || attempt.exam?.durationMinutes} phút</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="block text-xs uppercase text-gray-500 font-semibold tracking-wider">Điểm số</span>
                                <span className="text-2xl font-bold text-primary-600">
                                    {attempt.totalScore != null ? attempt.totalScore : (attempt.autoScore || 0)}
                                </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${attempt.status === 'GRADED' ? 'bg-green-100 text-green-700' :
                                attempt.status === 'PENDING_MANUAL_GRADE' ? 'bg-yellow-100 text-yellow-700' :
                                    attempt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {attempt.status === 'GRADED' ? 'Đã chấm' :
                                    attempt.status === 'PENDING_MANUAL_GRADE' ? 'Chờ chấm bài' :
                                        attempt.status === 'IN_PROGRESS' ? 'Đang làm' :
                                            'Đã nộp'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MyCourses = () => {
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Khoá học của tôi</h3>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Khoá học của tôi</h3>
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                    <span className="text-4xl block mb-3">📚</span>
                    <h4 className="text-gray-900 font-medium mb-1">Bạn chưa tham gia khoá học nào</h4>
                    <p className="text-gray-500 text-sm">Hãy liên hệ trung tâm để đăng ký khoá học mới.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Khoá học của tôi</h3>

            {/* Course Status & Expiration Warnings */}
            <CourseStatus />

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map(course => (
                    <div key={course.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{course.classEntity?.className || 'Lớp học'}</h4>
                        <div className="text-sm text-gray-500 space-y-1 mt-3">
                            <p>🏷️ Mã lớp: <span className="font-medium">{course.classEntity?.classCode}</span></p>
                            <p>📅 Ngày học: {new Date(course.classEntity?.startDate).toLocaleDateString('vi-VN')} - {new Date(course.classEntity?.endDate).toLocaleDateString('vi-VN')}</p>
                            <p>📊 Trạng thái: <span className={`font-semibold ${course.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}`}>
                                {course.status === 'ACTIVE' ? 'Đang học' : 'Đã kết thúc'}
                            </span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;
