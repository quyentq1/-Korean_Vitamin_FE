import { useState } from 'react';
import { X, FileText, Award, User, Tags, Calendar, Clock, DollarSign, Globe, BookOpen, CheckCircle2 } from 'lucide-react';

const CourseDetailModal = ({ course, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!course) return null;

    const levelLabels = {
        'BEGINNER': 'TOPIK I',
        'INTERMEDIATE': 'TOPIK II',
        'ADVANCED': 'ESP'
    };

    const statusLabels = {
        'DRAFT': 'Bản nháp',
        'PUBLISHED': 'Đã công bố',
        'ARCHIVED': 'Lưu trữ'
    };

    const statusColors = {
        'DRAFT': 'bg-gray-100 text-gray-700',
        'PUBLISHED': 'bg-green-100 text-green-700',
        'ARCHIVED': 'bg-amber-100 text-amber-700'
    };

    // Parse YouTube ID from URL - supports multiple formats
    const getYouTubeId = (url) => {
        if (!url) return null;

        // Support multiple YouTube URL formats:
        // - youtube.com/watch?v=ID
        // - youtu.be/ID
        // - youtube.com/embed/ID
        // - youtube.com/v/ID
        // - youtube.com/shorts/ID
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^#&?]{11})/,
            /^.*((youtu.be)|(youtube\.com))\/.+/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1] && match[1].length === 11) {
                return match[1];
            }
        }

        return null;
    };

    const youtubeId = getYouTubeId(course.promoVideoUrl);

    // Debug: log to console
    console.log('[CourseDetail] Video URL:', course.promoVideoUrl);
    console.log('[CourseDetail] YouTube ID:', youtubeId);
    console.log('[CourseDetail] Has thumbnail:', !!course.thumbnailUrl);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {course.thumbnailUrl && (
                            <img
                                src={course.thumbnailUrl}
                                alt={course.name}
                                className="w-16 h-16 rounded-lg object-cover border-2 border-white/30 shadow-lg"
                            />
                        )}
                        <div className="text-white">
                            <h2 className="text-2xl font-bold">{course.name}</h2>
                            <p className="text-violet-100 text-sm">Mã: {course.code}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 px-6 bg-gray-50">
                    <div className="flex gap-6">
                        {['overview', 'curriculum', 'requirements', 'instructor'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab
                                        ? 'border-violet-600 text-violet-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab === 'overview' && 'Tổng quan'}
                                {tab === 'curriculum' && 'Giáo trình'}
                                {tab === 'requirements' && 'Yêu cầu'}
                                {tab === 'instructor' && 'Giáo viên'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Course Thumbnail */}
                            {course.thumbnailUrl && !youtubeId && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Globe className="w-5 h-5 text-violet-600" />
                                        <span className="font-semibold text-gray-700">Ảnh khóa học</span>
                                    </div>
                                    <img
                                        src={course.thumbnailUrl}
                                        alt={course.name}
                                        className="w-full rounded-lg shadow-lg"
                                    />
                                </div>
                            )}

                            {/* Video Preview */}
                            {youtubeId ? (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Globe className="w-5 h-5 text-red-500" />
                                        <span className="font-semibold text-gray-700">Video giới thiệu</span>
                                    </div>
                                    <div className="aspect-video rounded-lg overflow-hidden">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${youtubeId}`}
                                            title="Course preview"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                        />
                                    </div>
                                    {course.promoVideoUrl && (
                                        <a
                                            href={course.promoVideoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-violet-600 hover:text-violet-700 mt-2 inline-block"
                                        >
                                            Mở link YouTube →
                                        </a>
                                    )}
                                </div>
                            ) : course.promoVideoUrl ? (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Globe className="w-5 h-5 text-blue-500" />
                                        <span className="font-semibold text-gray-700">Link giới thiệu</span>
                                    </div>
                                    <a
                                        href={course.promoVideoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-violet-600 hover:text-violet-700 underline break-all"
                                    >
                                        {course.promoVideoUrl}
                                    </a>
                                    <p className="text-sm text-gray-500 mt-2">Click để mở video trong tab mới</p>
                                </div>
                            ) : null}

                            {/* Description */}
                            {course.description && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả khóa học</h3>
                                    <p className="text-gray-600 whitespace-pre-wrap">{course.description}</p>
                                </div>
                            )}

                            {/* Quick Info Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <BookOpen className="w-5 h-5 text-blue-600 mb-2" />
                                    <p className="text-xs text-gray-600">Trình độ</p>
                                    <p className="font-semibold text-gray-900">{levelLabels[course.level] || course.level}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <Clock className="w-5 h-5 text-green-600 mb-2" />
                                    <p className="text-xs text-gray-600">Thời lượng</p>
                                    <p className="font-semibold text-gray-900">{course.duration || 0} giờ</p>
                                </div>
                                <div className="bg-amber-50 rounded-lg p-4">
                                    <DollarSign className="w-5 h-5 text-amber-600 mb-2" />
                                    <p className="text-xs text-gray-600">Học phí</p>
                                    <p className="font-semibold text-gray-900">
                                        {new Intl.NumberFormat('vi-VN').format(course.fee || 0)}₫
                                    </p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <Globe className="w-5 h-5 text-purple-600 mb-2" />
                                    <p className="text-xs text-gray-600">Trạng thái</p>
                                    <p className={`font-semibold text-xs px-2 py-1 rounded-full inline-block ${statusColors[course.status]}`}>
                                        {statusLabels[course.status] || course.status}
                                    </p>
                                </div>
                            </div>

                            {/* Objectives */}
                            {course.objectives && (
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        Mục tiêu khóa học
                                    </h3>
                                    <div className="text-gray-700 whitespace-pre-wrap space-y-1">
                                        {course.objectives.split('\n').map((line, idx) => (
                                            <p key={idx} className="flex items-start gap-2">
                                                <span className="text-green-600 mt-1">✓</span>
                                                <span>{line}</span>
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {course.courseTags && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Tags className="w-5 h-5 text-indigo-600" />
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {course.courseTags.split(',').map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                                            >
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Curriculum Tab */}
                    {activeTab === 'curriculum' && (
                        <div className="space-y-6">
                            {course.syllabus ? (
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        Giáo trình chi tiết
                                    </h3>
                                    <div className="text-gray-700 whitespace-pre-wrap prose prose-sm max-w-none">
                                        {course.syllabus}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-10">
                                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Chưa có giáo trình</p>
                                </div>
                            )}

                            {course.testSummary && (
                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-amber-600" />
                                        Cấu trúc bài kiểm tra
                                    </h3>
                                    <div className="text-gray-700 whitespace-pre-wrap prose prose-sm max-w-none">
                                        {course.testSummary}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Requirements Tab */}
                    {activeTab === 'requirements' && (
                        <div className="space-y-6">
                            {course.requirements ? (
                                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Yêu cầu / Điều kiện tiên quyết</h3>
                                    <div className="text-gray-700 whitespace-pre-wrap">
                                        {course.requirements}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-10">
                                    <p>Không có yêu cầu đặc biệt</p>
                                </div>
                            )}

                            {course.schedule && (
                                <div className="bg-gray-50 rounded-xl p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-gray-600" />
                                        Lịch học mẫu
                                    </h3>
                                    <p className="text-gray-700">{course.schedule}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Instructor Tab */}
                    {activeTab === 'instructor' && (
                        <div className="space-y-6">
                            {course.instructorInfo ? (
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <User className="w-5 h-5 text-purple-600" />
                                        Thông tin giáo viên
                                    </h3>
                                    <div className="text-gray-700 whitespace-pre-wrap prose prose-sm max-w-none">
                                        {course.instructorInfo}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-10">
                                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Chưa có thông tin giáo viên</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetailModal;
