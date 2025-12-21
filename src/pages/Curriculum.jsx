import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Curriculum = () => {
    const { t } = useTranslation();

    const curriculums = [
        {
            level: t('curriculum.beginner.title', 'Sơ cấp'),
            levelEn: 'Beginner',
            icon: '📘',
            color: 'from-blue-400 to-blue-600',
            borderColor: 'border-blue-500',
            description: t('curriculum.beginner.desc', 'Nền tảng cơ bản cho người mới bắt đầu. Học Hangul, chào hỏi cơ bản và hội thoại hàng ngày.'),
            features: [
                t('curriculum.beginner.feature1', 'Bảng chữ cái Hangul'),
                t('curriculum.beginner.feature2', 'Ngữ pháp cơ bản'),
                t('curriculum.beginner.feature3', '500+ từ vựng thiết yếu'),
                t('curriculum.beginner.feature4', 'Hội thoại hàng ngày'),
            ],
            duration: '3-6 ' + t('curriculum.months', 'tháng'),
        },
        {
            level: t('curriculum.intermediate.title', 'Trung cấp'),
            levelEn: 'Intermediate',
            icon: '📗',
            color: 'from-green-400 to-green-600',
            borderColor: 'border-green-500',
            description: t('curriculum.intermediate.desc', 'Mở rộng vốn từ vựng và ngữ pháp. Tập trung vào cấu trúc câu phức tạp và viết.'),
            features: [
                t('curriculum.intermediate.feature1', '1000+ từ vựng'),
                t('curriculum.intermediate.feature2', 'Ngữ pháp nâng cao'),
                t('curriculum.intermediate.feature3', 'Đọc hiểu văn bản'),
                t('curriculum.intermediate.feature4', 'Viết bài luận'),
            ],
            duration: '6-12 ' + t('curriculum.months', 'tháng'),
        },
        {
            level: t('curriculum.advanced.title', 'Cao cấp'),
            levelEn: 'Advanced',
            icon: '📙',
            color: 'from-orange-400 to-orange-600',
            borderColor: 'border-orange-500',
            description: t('curriculum.advanced.desc', 'Thành thạo tiếng Hàn chuyên nghiệp. Chuẩn bị cho TOPIK cấp cao và phiên dịch kinh doanh.'),
            features: [
                t('curriculum.advanced.feature1', 'Từ vựng chuyên ngành'),
                t('curriculum.advanced.feature2', 'Văn bản học thuật'),
                t('curriculum.advanced.feature3', 'Giao tiếp kinh doanh'),
                t('curriculum.advanced.feature4', 'TOPIK II (cấp 5-6)'),
            ],
            duration: '12+ ' + t('curriculum.months', 'tháng'),
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12 sm:py-20">
                    <div className="container mx-auto px-4 sm:px-6 text-center">
                        <div className="text-4xl sm:text-5xl mb-4 sm:mb-6 animate-float">📚</div>
                        <h1 className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4">
                            {t('landing.nav.curriculum_only', 'Giáo trình')}
                        </h1>
                        <p className="text-lg sm:text-xl text-primary-100 max-w-3xl mx-auto">
                            {t('curriculum.subtitle', 'Giáo trình chuẩn hóa tiếng Hàn được thiết kế riêng cho học viên Việt Nam, từ sơ cấp đến cao cấp')}
                        </p>
                    </div>
                </div>

                {/* Learning Path */}
                <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
                    <div className="text-center mb-10 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                            {t('curriculum.learningPath', 'Lộ trình học tập')}
                        </h2>
                        <p className="text-gray-600 text-base sm:text-lg">
                            {t('curriculum.learningPathDesc', 'Chương trình được thiết kế theo từng cấp độ, đảm bảo tiến bộ vững chắc')}
                        </p>
                    </div>

                    {/* Curriculum Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
                        {curriculums.map((curriculum, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-t-4 ${curriculum.borderColor}"
                            >
                                {/* Header */}
                                <div className={`bg-gradient-to-br ${curriculum.color} p-6 sm:p-8 text-white text-center`}>
                                    <div className="text-5xl sm:text-6xl mb-4 animate-float">{curriculum.icon}</div>
                                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{curriculum.level}</h3>
                                    <p className="text-sm opacity-90">{curriculum.levelEn}</p>
                                </div>

                                {/* Content */}
                                <div className="p-4 sm:p-6">
                                    <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                                        {curriculum.description}
                                    </p>

                                    {/* Features */}
                                    <div className="space-y-3 mb-6">
                                        {curriculum.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Duration */}
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{curriculum.duration}</span>
                                    </div>

                                    {/* Buttons */}
                                    <div className="space-y-3">
                                        <button className={`w-full py-3 bg-gradient-to-r ${curriculum.color} text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 text-sm sm:text-base`}>
                                            {t('curriculum.viewDetails', 'Xem chi tiết')}
                                        </button>
                                        <button className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm sm:text-base">
                                            {t('curriculum.downloadSyllabus', 'Tải giáo trình')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Why Choose Us Section */}
                    <div className="bg-white rounded-2xl p-6 sm:p-12 shadow-lg">
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
                            {t('curriculum.whyChoose', 'Tại sao chọn giáo trình của chúng tôi?')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: '🎯',
                                    title: t('curriculum.reason1.title', 'Chuẩn hóa'),
                                    desc: t('curriculum.reason1.desc', 'Giáo trình được biên soạn theo chuẩn quốc tế'),
                                },
                                {
                                    icon: '🤖',
                                    title: t('curriculum.reason2.title', 'Công nghệ AI'),
                                    desc: t('curriculum.reason2.desc', 'Học tập cá nhân hóa với hỗ trợ AI'),
                                },
                                {
                                    icon: '👨‍🏫',
                                    title: t('curriculum.reason3.title', 'Giáo viên chuyên nghiệp'),
                                    desc: t('curriculum.reason3.desc', 'Đội ngũ giảng viên giàu kinh nghiệm'),
                                },
                            ].map((reason, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-4xl sm:text-5xl mb-4">{reason.icon}</div>
                                    <h3 className="font-bold text-lg sm:text-xl mb-2">{reason.title}</h3>
                                    <p className="text-gray-600 text-sm sm:text-base">{reason.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Curriculum;
