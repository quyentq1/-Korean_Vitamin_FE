import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const UpgradeModal = ({ isOpen, onClose, testsTaken = 2 }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const packages = [
        {
            id: 'single',
            name: t('upgrade.single.name', '1 Bài Test'),
            price: '100,000',
            currency: 'VNĐ',
            features: [
                t('upgrade.single.feat1', 'Làm thêm 1 bài test'),
                t('upgrade.single.feat2', 'AI feedback chi tiết'),
                t('upgrade.single.feat3', 'Có hiệu lực 30 ngày')
            ],
            color: 'from-blue-500 to-blue-600',
            popular: false
        },
        {
            id: 'package',
            name: t('upgrade.package.name', '5 Bài Test'),
            price: '400,000',
            currency: 'VNĐ',
            features: [
                t('upgrade.package.feat1', 'Làm thêm 5 bài test'),
                t('upgrade.package.feat2', 'AI feedback chi tiết'),
                t('upgrade.package.feat3', 'Có hiệu lực 60 ngày'),
                t('upgrade.package.feat4', 'Tiết kiệm 20%')
            ],
            color: 'from-purple-500 to-purple-600',
            popular: true
        },
        {
            id: 'course',
            name: t('upgrade.course.name', 'Khóa Học Trọn Gói'),
            price: t('upgrade.course.price', 'Liên hệ'),
            currency: '',
            features: [
                t('upgrade.course.feat1', 'Làm test không giới hạn'),
                t('upgrade.course.feat2', 'Lớp học trực tuyến'),
                t('upgrade.course.feat3', 'Giáo viên 1-1'),
                t('upgrade.course.feat4', 'Tài liệu đầy đủ'),
                t('upgrade.course.feat5', 'Chứng nhận sau khóa')
            ],
            color: 'from-orange-500 to-orange-600',
            popular: false
        }
    ];

    const handleContact = (packageId) => {
        onClose();
        navigate('/contact', { state: { selectedPackage: packageId } });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full p-8 animate-scale-up">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-3">
                            {t('upgrade.title', 'Chúc mừng!')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('upgrade.subtitle', 'Bạn đã hoàn thành {count} bài test miễn phí', { count: testsTaken })}
                        </p>
                        <p className="text-lg text-primary-600 font-medium mt-2">
                            {t('upgrade.cta', 'Chọn gói phù hợp để tiếp tục luyện tập!')}
                        </p>
                    </div>

                    {/* Packages */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`relative bg-white border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${pkg.popular ? 'border-purple-500 shadow-lg' : 'border-gray-200'
                                    }`}
                            >
                                {/* Popular Badge */}
                                {pkg.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                                            {t('upgrade.popular', 'Phổ biến nhất')}
                                        </span>
                                    </div>
                                )}

                                {/* Package Name */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-2">
                                    {pkg.name}
                                </h3>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">{pkg.price}</span>
                                    {pkg.currency && <span className="text-gray-600 ml-2">{pkg.currency}</span>}
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-6">
                                    {pkg.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <button
                                    onClick={() => handleContact(pkg.id)}
                                    className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${pkg.popular
                                            ? `bg-gradient-to-r ${pkg.color} text-white hover:shadow-lg`
                                            : 'border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:bg-primary-50'
                                        }`}
                                >
                                    {t('upgrade.contact', 'Liên hệ ngay')}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            {t('upgrade.support', 'Cần hỗ trợ? Liên hệ hotline:')} <span className="font-bold text-primary-600">0123-456-789</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
