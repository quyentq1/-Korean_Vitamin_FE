import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ExamPrep = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const exams = [
        {
            id: 'topik',
            icon: '🇰🇷',
            title: 'TOPIK',
            fullName: 'Test of Proficiency in Korean',
            color: 'from-red-500 to-red-700',
            borderColor: 'border-red-500',
            description: t('prep.topik.desc', 'Chứng chỉ tiếng Hàn phổ biến nhất thế giới với 6 cấp độ'),
            features: [
                t('prep.topik.feature1', 'Đề thi thử TOPIK I & II'),
                t('prep.topik.feature2', 'AI chấm bài viết tự động'),
                t('prep.topik.feature3', 'Flashcards từ vựng'),
                t('prep.topik.feature4', 'Ngân hàng 1000+ câu hỏi'),
            ],
            stats: { tests: '50+', students: '1000+', rating: '4.9' },
        },
        {
            id: 'opic',
            icon: '🗣️',
            title: 'OPIc',
            fullName: 'Oral Proficiency Interview - computer',
            color: 'from-blue-600 to-blue-800',
            borderColor: 'border-blue-600',
            description: t('prep.opic.desc', 'Đánh giá khả năng giao tiếp tiếng Hàn trong thực tế'),
            features: [
                t('prep.opic.feature1', 'AI Speaking Partner'),
                t('prep.opic.feature2', 'Kiểm tra phát âm real-time'),
                t('prep.opic.feature3', 'Câu trả lời mẫu'),
                t('prep.opic.feature4', 'Luyện tập theo chủ đề'),
            ],
            stats: { tests: '30+', students: '500+', rating: '4.8' },
        },
        {
            id: 'eps',
            icon: '👷',
            title: 'EPS-TOPIK',
            fullName: 'Employment Permit System TOPIK',
            color: 'from-green-500 to-green-700',
            borderColor: 'border-green-500',
            description: t('prep.eps.desc', 'Chứng chỉ cho lao động Việt Nam đi làm việc tại Hàn Quốc'),
            features: [
                t('prep.eps.feature1', 'Từ vựng chuyên ngành sản xuất'),
                t('prep.eps.feature2', 'Luyện nghe tập trung'),
                t('prep.eps.feature3', 'Chuẩn bị phỏng vấn việc làm'),
                t('prep.eps.feature4', 'Thi thử full format'),
            ],
            stats: { tests: '40+', students: '800+', rating: '4.9' },
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
            <Navbar />

            <div className="pt-20">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-700 text-white py-12 sm:py-20 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-white rounded-full blur-3xl"></div>
                    </div>

                    <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
                        <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 animate-float">🎯</div>
                        <h1 className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4">
                            {t('landing.nav.prep', 'Luyện thi')}
                        </h1>
                        <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto mb-6 sm:mb-8">
                            {t('prep.subtitle', 'Luyện thi toàn diện cho TOPIK, OPIc và EPS-TOPIK với đề thi thật và chấm điểm bằng AI')}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                            <button className="bg-white text-primary-600 px-6 sm:px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base">
                                {t('prep.startNow', 'Bắt đầu ngay')}
                            </button>
                            <button className="border-2 border-white text-white px-6 sm:px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all text-sm sm:text-base">
                                {t('prep.viewSchedule', 'Xem lịch thi')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
                    {/* Exam Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
                        {exams.map((exam) => (
                            <div
                                key={exam.id}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border-t-4 ${exam.borderColor}"
                            >
                                {/* Card Header */}
                                <div className={`bg-gradient-to-br ${exam.color} p-6 sm:p-8 text-white relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                    <div className="relative z-10">
                                        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{exam.icon}</div>
                                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{exam.title}</h2>
                                        <p className="text-xs sm:text-sm opacity-90">{exam.fullName}</p>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-4 sm:p-6">
                                    <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                                        {exam.description}
                                    </p>

                                    {/* Features List */}
                                    <ul className="space-y-3 mb-6">
                                        {exam.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
                                        <div className="text-center">
                                            <div className="text-base sm:text-lg font-bold text-gray-900">{exam.stats.tests}</div>
                                            <div className="text-[10px] sm:text-xs text-gray-500">{t('prep.tests', 'Đề thi')}</div>
                                        </div>
                                        <div className="text-center border-l border-r border-gray-200">
                                            <div className="text-base sm:text-lg font-bold text-gray-900">{exam.stats.students}</div>
                                            <div className="text-[10px] sm:text-xs text-gray-500">{t('prep.students', 'Học viên')}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-base sm:text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
                                                <span>{exam.stats.rating}</span>
                                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-gray-500">{t('prep.rating', 'Đánh giá')}</div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => navigate(`/courses/${exam.id}`)}
                                        className={`w-full py-3 sm:py-4 bg-gradient-to-r ${exam.color} text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-sm sm:text-base`}
                                    >
                                        {t('prep.startPracticing', 'Bắt đầu luyện tập')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Why Practice With Us */}
                    <div className="bg-white rounded-2xl p-6 sm:p-12 shadow-lg mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
                            {t('prep.whyUs', 'Tại sao luyện thi với chúng tôi?')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
                            {[
                                { icon: '🤖', title: t('prep.reason1.title', 'AI Chấm Bài'), desc: t('prep.reason1.desc', 'Chấm điểm tự động và đưa ra nhận xét chi tiết') },
                                { icon: '📊', title: t('prep.reason2.title', 'Phân Tích Chi Tiết'), desc: t('prep.reason2.desc', 'Theo dõi tiến độ và xác định điểm yếu') },
                                { icon: '🎯', title: t('prep.reason3.title', 'Đề Thi Chuẩn'), desc: t('prep.reason3.desc', 'Đề thi giống thật 100%') },
                                { icon: '👨‍🏫', title: t('prep.reason4.title', 'Hỗ Trợ 24/7'), desc: t('prep.reason4.desc', 'Giáo viên sẵn sàng giải đáp') },
                            ].map((reason, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{reason.icon}</div>
                                    <h3 className="font-bold text-lg mb-2">{reason.title}</h3>
                                    <p className="text-gray-600 text-sm">{reason.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white text-center shadow-xl">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                            {t('prep.cta.title', 'Sẵn sàng chinh phục chứng chỉ?')}
                        </h2>
                        <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90">
                            {t('prep.cta.desc', 'Bắt đầu với 2 bài test miễn phí ngay hôm nay!')}
                        </p>
                        <button className="bg-white text-primary-600 px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-all shadow-lg transform hover:-translate-y-0.5">
                            {t('prep.cta.button', 'Thi thử miễn phí')}
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ExamPrep;
