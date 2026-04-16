import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Users, Award, BookOpen, CheckCircle, Star, ChevronRight } from 'lucide-react';

/**
 * LandingPage - Trang marketing chính cho FPT K Vitamin
 * Phase 7: Marketing
 *
 * Features:
 * - Hero section với CTA
 * - Features highlights
 * - Course showcase
 * - Testimonials
 * - Statistics
 * - Pricing plans
 * - Final CTA
 */
const LandingPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        students: 1500,
        courses: 25,
        teachers: 30,
        satisfaction: 98
    });

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white shadow-sm fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">K</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900">K Vitamin</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900">Tính năng</a>
                            <a href="#courses" className="text-gray-600 hover:text-gray-900">Khóa học</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Đánh giá</a>
                            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Học phí</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Đăng nhập
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium"
                            >
                                Đăng ký
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                                <Star className="w-4 h-4 fill-current" />
                                Nền tảng học tiếng Hàn số 1 Việt Nam
                            </div>
                            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
                                Học tiếng Hàn
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    {' '}hiệu quả nhất
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Công nghệ AI tiên tiến, giáo viên bản ngữ, lộ trình cá nhân hóa.
                                Đạt TOPIK nhanh chóng với phương pháp học tập hiện đại.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate('/free-tests')}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg flex items-center justify-center gap-2 text-lg"
                                >
                                    <Play className="w-5 h-5" />
                                    Học thử miễn phí
                                </button>
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 border border-gray-300 flex items-center justify-center gap-2 text-lg"
                                >
                                    Xem khóa học
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-6 mt-8">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-gray-700">2 bài test miễn phí</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-gray-700">Không cần đăng ký</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-2xl">
                                <img
                                    src="/images/korean-learning-hero.png"
                                    alt="Learning Korean"
                                    className="rounded-xl w-full"
                                />
                            </div>
                            {/* Floating Stats */}
                            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <Users className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">1,500+</p>
                                        <p className="text-sm text-gray-600">Học viên</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <Award className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">98%</p>
                                        <p className="text-sm text-gray-600">Hài lòng</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '1,500+', label: 'Học viên', icon: Users },
                            { value: '25+', label: 'Khóa học', icon: BookOpen },
                            { value: '30+', label: 'Giáo viên', icon: Award },
                            { value: '98%', label: 'Hài lòng', icon: Star }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <stat.icon className="w-8 h-8 text-blue-600" />
                                </div>
                                <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                                <p className="text-gray-600">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Tại sao chọn K Vitamin?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Nền tảng học tiếng Hàn toàn diện với công nghệ AI tiên tiến nhất
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'AI Chấm & sửa bài',
                                description: 'Công nghệ AI tự động chấm bài viết và bài nói, phản hồi ngay lập tức',
                                icon: '🤖',
                                color: 'from-blue-600 to-indigo-600'
                            },
                            {
                                title: 'Lộ trình cá nhân hóa',
                                description: 'AI phân tích trình độ và tạo lộ trình học tập phù hợp với từng học viên',
                                icon: '📊',
                                color: 'from-green-600 to-emerald-600'
                            },
                            {
                                title: 'Giáo viên bản ngữ',
                                description: 'Đội ngũ giáo viên Hàn Quốc giàu kinh nghiệm, phương pháp giảng dạy hiện đại',
                                icon: '👨‍🏫',
                                color: 'from-purple-600 to-pink-600'
                            },
                            {
                                title: 'Luyện thi TOPIK',
                                description: 'Đề thi thử sát với đề thật, ngân hàng đề lớn, cam kết đầu ra',
                                icon: '📝',
                                color: 'from-orange-600 to-red-600'
                            },
                            {
                                title: 'Học mọi lúc mọi nơi',
                                description: 'Học online trên điện thoại, máy tính, linh hoạt thời gian',
                                icon: '💻',
                                color: 'from-cyan-600 to-blue-600'
                            },
                            {
                                title: 'Theo dõi tiến độ',
                                description: 'Báo cáo chi tiết tiến độ học tập, điểm số, và chỉ số cải thiện',
                                icon: '📈',
                                color: 'from-yellow-600 to-orange-600'
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Courses Section */}
            <section id="courses" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Khóa học nổi bật
                        </h2>
                        <p className="text-xl text-gray-600">
                            Lộ trình học từ cơ bản đến nâng cao, đáp ứng mọi trình độ
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Tiếng Hàn Sơ Cấp 1',
                                level: 'TOPIK I',
                                duration: '3 tháng',
                                price: '3.000.000 VNĐ',
                                students: 450,
                                rating: 4.8,
                                image: '/courses/beginner-1.jpg'
                            },
                            {
                                title: 'Tiếng Hàn Trung Cấp',
                                level: 'TOPIK II',
                                duration: '6 tháng',
                                price: '5.500.000 VNĐ',
                                students: 320,
                                rating: 4.9,
                                image: '/courses/intermediate.jpg'
                            },
                            {
                                title: 'Luyện Thi TOPIK II',
                                level: 'ESP',
                                duration: '4 tháng',
                                price: '6.000.000 VNĐ',
                                students: 280,
                                rating: 5.0,
                                image: '/courses/topik-prep.jpg'
                            }
                        ].map((course, idx) => (
                            <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                                    <BookOpen className="w-16 h-16 text-white opacity-50" />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            {course.level}
                                        </span>
                                        <span className="text-gray-500 text-sm">{course.duration}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="font-medium">{course.rating}</span>
                                        <span className="text-gray-500">({course.students} học viên)</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-blue-600">{course.price}</span>
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                                            Đăng ký
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <button
                            onClick={() => navigate('/courses')}
                            className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium flex items-center gap-2 mx-auto"
                        >
                            Xem tất cả khóa học
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Học viên nói gì?
                        </h2>
                        <p className="text-xl text-gray-600">
                            Hơn 1,500 học viên đã đạt kết quả xuất sắc
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Nguyễn Thị Lan',
                                course: 'TOPIK II - 2024',
                                score: 'TOPIK II - Level 6',
                                content: 'Nhờ K Vitamin mà mình đã đạt Level 6 TOPIK II. AI chấm bài rất hữu ích, giáo viên nhiệt tình.',
                                avatar: '/avatars/student1.jpg'
                            },
                            {
                                name: 'Trần Văn Minh',
                                course: 'Tiếng Hàn Trung Cấp',
                                score: 'TOPIK I - Level 4',
                                content: 'Lộ trình học rõ ràng, bài tập đa dạng. Đặc biệt tính năng luyện thi rất hiệu quả.',
                                avatar: '/avatars/student2.jpg'
                            },
                            {
                                name: 'Phạm Thu Hương',
                                course: 'Sơ Cấp 1',
                                score: 'TOPIK I - Level 2',
                                content: 'Mình bắt đầu từ con số 0, sau 3 tháng đã đạt Level 2. Giáo viên rất dễ thương và kiên nhẫn.',
                                avatar: '/avatars/student3.jpg'
                            }
                        ].map((testimonial, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                        <p className="text-sm text-gray-600">{testimonial.score}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Bắt đầu học tiếng Hàn ngay hôm nay
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        2 bài test miễn phí. Không cần đăng ký. Học thử ngay!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/free-tests')}
                            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 shadow-lg flex items-center justify-center gap-2 text-lg"
                        >
                            <Play className="w-5 h-5" />
                            Học thử miễn phí
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-8 py-4 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 border border-blue-400 flex items-center justify-center gap-2 text-lg"
                        >
                            Đăng ký tài khoản
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">K</span>
                                </div>
                                <span className="font-bold text-xl">K Vitamin</span>
                            </div>
                            <p className="text-gray-400">
                                Nền tảng học tiếng Hàn trực tuyến hàng đầu Việt Nam
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Khóa học</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Tiếng Hàn Sơ Cấp</a></li>
                                <li><a href="#" className="hover:text-white">Tiếng Hàn Trung Cấp</a></li>
                                <li><a href="#" className="hover:text-white">Luyện Thi TOPIK</a></li>
                                <li><a href="#" className="hover:text-white">Tiếng Hàn Giao Tiếp</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Trung tâm trợ giúp</a></li>
                                <li><a href="#" className="hover:text-white">Liên hệ</a></li>
                                <li><a href="#" className="hover:text-white">FAQ</a></li>
                                <li><a href="#" className="hover:text-white">Điều khoản</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Liên hệ</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>Hotline: 1900 xxxx</li>
                                <li>Email: support@k-vitamin.com</li>
                                <li>Địa chỉ: Hà Nội, Việt Nam</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2026 FPT K Vitamin. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
