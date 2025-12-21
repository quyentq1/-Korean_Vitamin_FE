import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

const CourseDetail = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    // Course data
    const courseData = {
        'topik': {
            title: 'TOPIK I & II',
            icon: '📚',
            color: 'from-orange-500 to-orange-700',
            bgColor: 'bg-orange-500',
            desc: t('landing.courses.topik.desc', 'Chứng chỉ tiếng Hàn phổ biến nhất, 6 cấp độ từ 1-6'),
            fullDesc: t('courseDetail.topik.fullDesc', 'TOPIK (Test of Proficiency in Korean) là kỳ thi năng lực tiếng Hàn được công nhận rộng rãi trên toàn thế giới, là điều kiện bắt buộc cho du học, định cư và làm việc tại Hàn Quốc.'),
            whyLearn: [
                t('courseDetail.topik.why1', 'Học bổng du học Hàn Quốc'),
                t('courseDetail.topik.why2', 'Cơ hội việc làm tại các công ty Hàn'),
                t('courseDetail.topik.why3', 'Chứng nhận năng lực quốc tế'),
            ],
            curriculum: [
                { title: t('courseDetail.topik.module1', 'Ngữ pháp & Từ vựng'), duration: '40 giờ' },
                { title: t('courseDetail.topik.module2', 'Đọc hiểu'), duration: '30 giờ' },
                { title: t('courseDetail.topik.module3', 'Nghe hiểu'), duration: '30 giờ' },
                { title: t('courseDetail.topik.module4', 'Viết'), duration: '25 giờ' },
            ],
        },
        'opic': {
            title: 'OPIc Speaking',
            icon: '🗣️',
            color: 'from-green-500 to-green-700',
            bgColor: 'bg-green-500',
            desc: t('landing.courses.opic.desc', 'Đánh giá khả năng giao tiếp'),
            fullDesc: t('courseDetail.opic.fullDesc', 'OPIc (Oral Proficiency Interview - computer) đánh giá khả năng giao tiếp tiếng Hàn thực tế trong môi trường làm việc và cuộc sống hàng ngày.'),
            whyLearn: [
                t('courseDetail.opic.why1', 'Đánh giá kỹ năng nói thực tế'),
                t('courseDetail.opic.why2', 'Được doanh nghiệp đánh giá cao'),
                t('courseDetail.opic.why3', 'Thi qua máy tính linh hoạt'),
            ],
            curriculum: [
                { title: t('courseDetail.opic.module1', 'Phát âm chuẩn'), duration: '20 giờ' },
                { title: t('courseDetail.opic.module2', 'Hội thoại chủ đề'), duration: '35 giờ' },
                { title: t('courseDetail.opic.module3', 'Mô tả & Tường thuật'), duration: '25 giờ' },
                { title: t('courseDetail.opic.module4', 'Luyện thi OPIc'), duration: '30 giờ' },
            ],
        },
        'eps': {
            title: 'EPS-TOPIK',
            icon: '👷',
            color: 'from-blue-500 to-blue-700',
            bgColor: 'bg-blue-500',
            desc: t('landing.courses.eps.desc', 'Chứng chỉ lao động'),
            fullDesc: t('courseDetail.eps.fullDesc', 'EPS-TOPIK là kỳ thi bắt buộc cho lao động Việt Nam muốn đi làm việc tại Hàn Quốc theo chương trình EPS (Employment Permit System).'),
            whyLearn: [
                t('courseDetail.eps.why1', 'Xuất khẩu lao động Hàn Quốc'),
                t('courseDetail.eps.why2', 'Thu nhập hấp dẫn 30-50 triệu/tháng'),
                t('courseDetail.eps.why3', 'Học phí được hỗ trợ'),
            ],
            curriculum: [
                { title: t('courseDetail.eps.module1', 'Từ vựng sản xuất'), duration: '30 giờ' },
                { title: t('courseDetail.eps.module2', 'Nghe hiểu'), duration: '40 giờ' },
                { title: t('courseDetail.eps.module3', 'Đọc hiểu'), duration: '35 giờ' },
                { title: t('courseDetail.eps.module4', 'Thi thử format chuẩn'), duration: '20 giờ' },
            ],
        },
        'comm': {
            title: t('landing.courses.comm.title', 'Communication'),
            icon: '💬',
            color: 'from-purple-500 to-purple-700',
            bgColor: 'bg-purple-500',
            desc: t('landing.courses.comm.desc', 'Giao tiếp thực tế'),
            fullDesc: t('courseDetail.comm.fullDesc', 'Khóa học giao tiếp tập trung vào việc sử dụng tiếng Hàn trong các tình huống thực tế hàng ngày, giúp bạn tự tin giao tiếp với người bản xứ.'),
            whyLearn: [
                t('courseDetail.comm.why1', 'Giao tiếp tự nhiên hàng ngày'),
                t('courseDetail.comm.why2', 'Hiểu văn hóa Hàn Quốc'),
                t('courseDetail.comm.why3', 'Phát âm chuẩn như người bản xứ'),
            ],
            curriculum: [
                { title: t('courseDetail.comm.module1', 'Phát âm & Intonation'), duration: '25 giờ' },
                { title: t('courseDetail.comm.module2', 'Hội thoại hàng ngày'), duration: '40 giờ' },
                { title: t('courseDetail.comm.module3', 'Văn hóa giao tiếp'), duration: '20 giờ' },
                { title: t('courseDetail.comm.module4', 'Thực hành tình huống'), duration: '30 giờ' },
            ],
        }
    };

    const course = courseData[id] || courseData['topik'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20">
                {/* Hero Section */}
                <div className={`bg-gradient-to-r ${course.color} text-white py-12 sm:py-16`}>
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-5xl sm:text-7xl shadow-2xl shrink-0">
                                {course.icon}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">{course.title}</h1>
                                <p className="text-lg sm:text-2xl text-white/90 mb-4">{course.desc}</p>
                                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
                                    <span className="px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-xs sm:text-sm font-medium">
                                        ⏱️ 100+ {t('courseDetail.hours', 'giờ học')}
                                    </span>
                                    <span className="px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-xs sm:text-sm font-medium">
                                        👥 500+ {t('courseDetail.students', 'học viên')}
                                    </span>
                                    <span className="px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-xs sm:text-sm font-medium">
                                        ⭐ 4.9/5.0
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Left Column - Course Info */}
                        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                            {/* About */}
                            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
                                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                                    <span className={`w-8 h-8 ${course.bgColor} rounded-lg flex items-center justify-center text-white text-sm`}>
                                        ℹ️
                                    </span>
                                    {t('courseDetail.about', 'Về khóa học')}
                                </h2>
                                <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                                    {course.fullDesc}
                                </p>
                            </div>

                            {/* Why Learn */}
                            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
                                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                                    {t('courseDetail.whyLearn', 'Tại sao nên học?')}
                                </h2>
                                <div className="space-y-3 sm:space-y-4">
                                    {course.whyLearn.map((reason, index) => (
                                        <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${course.bgColor} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base`}>
                                                {index + 1}
                                            </div>
                                            <p className="text-gray-700 flex-1 pt-1.5 sm:pt-2 text-sm sm:text-base">{reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Curriculum */}
                            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
                                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                                    {t('courseDetail.curriculum', 'Nội dung khóa học')}
                                </h2>
                                <div className="space-y-3 sm:space-y-4">
                                    {course.curriculum.map((module, index) => (
                                        <div key={index} className="border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-primary-300 hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${course.bgColor} rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">{module.title}</h3>
                                                        <p className="text-xs sm:text-sm text-gray-500">{module.duration}</p>
                                                    </div>
                                                </div>
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Enrollment Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl sticky top-24 border-t-4 ${course.bgColor.replace('bg-', 'border-')}">
                                <div className="text-center mb-4 sm:mb-6">
                                    <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">
                                        {t('courseDetail.contactForPrice', 'Liên hệ')}
                                    </div>
                                    <p className="text-gray-500 text-sm sm:text-base">
                                        {t('courseDetail.flexibleSchedule', 'Lịch học linh hoạt')}
                                    </p>
                                </div>

                                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-700">{t('courseDetail.feature1', 'Tài liệu đầy đủ')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-700">{t('courseDetail.feature2', 'Chấm bài 1-1')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-700">{t('courseDetail.feature3', 'Hỗ trợ 24/7')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-700">{t('courseDetail.feature4', 'Chứng nhận hoàn thành')}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsContactModalOpen(true)}
                                    className={`w-full py-3 sm:py-4 bg-gradient-to-r ${course.color} text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 mb-3 text-sm sm:text-base`}
                                >
                                    {t('courseDetail.contactNow', 'Liên hệ tư vấn ngay')}
                                </button>

                                <button className="w-full py-3 sm:py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm sm:text-base">
                                    {t('courseDetail.downloadSyllabus', 'Tải giáo trình')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />

            <Footer />
        </div>
    );
};

export default CourseDetail;
