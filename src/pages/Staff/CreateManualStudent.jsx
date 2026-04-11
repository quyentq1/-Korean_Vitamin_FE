import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User, Mail, Phone, MapPin, Calendar, GraduationCap, Users, UserPlus,
    CheckCircle, XCircle, Loader2, ArrowLeft, ArrowRight, Save
} from 'lucide-react';
import Swal from 'sweetalert2';
import staffService from '../../services/staffService';
import consultationService from '../../services/consultationService';

/**
 * Manual Student Creation Form
 * Multi-step form: Personal Info → Course & Class → Review & Confirm
 */
const CreateManualStudent = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { studentId } = useParams();

    const prefilledData = location.state?.prefilledData || {};
    const fromConsultationId = location.state?.fromConsultationId || null;

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetchingCourses, setFetchingCourses] = useState(false);
    const [courses, setCourses] = useState([]);
    const [classes, setClasses] = useState([]);

    // Form data
    const [formData, setFormData] = useState({
        // Step 1: Personal Information
        fullName: prefilledData.fullName || '',
        dateOfBirth: '',
        gender: 'male',
        email: prefilledData.email || '',
        phone: prefilledData.phone || '',
        address: '',
        avatar: '',

        // Step 2: Course & Class
        courseIds: [],
        classId: '',

        // Step 3: Additional
        notes: '',
        password: '',
        sendWelcomeEmail: true
    });

    // Validation errors
    const [errors, setErrors] = useState({});

    // Fetch courses on mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setFetchingCourses(true);
                const response = await staffService.getCourses();
                setCourses(response || []);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setFetchingCourses(false);
            }
        };

        fetchCourses();
    }, []);

    // Fetch classes when courses are selected
    useEffect(() => {
        if (formData.courseIds.length > 0) {
            const fetchClasses = async () => {
                try {
                    const allClasses = [];
                    for (const courseId of formData.courseIds) {
                        const response = await staffService.getAvailableClasses(courseId);
                        if (response) {
                            allClasses.push(...(response.content || response || []));
                        }
                    }
                    setClasses(allClasses);
                } catch (error) {
                    console.error('Error fetching classes:', error);
                }
            };

            fetchClasses();
        } else {
            setClasses([]);
        }
    }, [formData.courseIds]);

    // Handle input change
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Validate step 1
    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = t('staff.createStudent.fullName') + ' is required';
        }
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = t('staff.createStudent.dob') + ' is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = t('common.email') + ' is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = t('common.phone') + ' is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate step 2
    const validateStep2 = () => {
        const newErrors = {};

        if (formData.courseIds.length === 0) {
            newErrors.courseIds = t('staff.createStudent.courses') + ' is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle next step
    const handleNext = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        } else if (currentStep === 2 && validateStep2()) {
            setCurrentStep(3);
        }
    };

    // Handle previous step
    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Handle course selection
    const handleCourseToggle = (courseId) => {
        setFormData(prev => {
            const newCourseIds = prev.courseIds.includes(courseId)
                ? prev.courseIds.filter(id => id !== courseId)
                : [...prev.courseIds, courseId];

            // Clear classId if courseIds change
            return {
                ...prev,
                courseIds: newCourseIds,
                classId: ''
            };
        });
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!validateStep1() || !validateStep2()) {
            return;
        }

        try {
            setLoading(true);

            const response = await staffService.createManualStudent(formData);

            if (fromConsultationId) {
                try {
                    await consultationService.updateStatus(fromConsultationId, 'ACCOUNT_CREATED');
                } catch (updateErr) {
                    console.error("Failed to update consultation status", updateErr);
                }
            }

            Swal.fire({
                icon: 'success',
                title: t('staff.createStudent.success'),
                text: t('staff.createStudent.emailSent'),
                confirmButtonColor: '#667eea',
            }).then(() => {
                if (fromConsultationId) {
                    navigate('/registrations'); // Quay lại trang Tư vấn
                } else {
                    navigate('/student-management');
                }
            });
        } catch (error) {
            console.error('Error creating student:', error);

            // Format error message for display
            const errorMsg = error.message || t('errors.tryAgain') || 'Vui lòng thử lại';
            const isValidationError = errorMsg.includes('Dữ liệu không hợp lệ');

            Swal.fire({
                icon: 'error',
                title: t('errors.error') || 'Lỗi',
                [isValidationError ? 'html' : 'text']: errorMsg.replace(/\n/g, '<br/>'),
                confirmButtonColor: '#667eea',
            });
        } finally {
            setLoading(false);
        }
    };

    // Calculate progress
    const progress = (currentStep / 3) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/student-management')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t('common.back')}
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('staff.createStudent.title')}</h1>
                        <p className="text-gray-500 text-sm">{t('staff.createStudent.manualTitle')}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-full h-2 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span className={currentStep >= 1 ? 'text-blue-600 font-semibold' : ''}>
                        {t('staff.createStudent.step1')}
                    </span>
                    <span className={currentStep >= 2 ? 'text-blue-600 font-semibold' : ''}>
                        {t('staff.createStudent.step2')}
                    </span>
                    <span className={currentStep >= 3 ? 'text-blue-600 font-semibold' : ''}>
                        {t('staff.createStudent.step3')}
                    </span>
                </div>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-4xl mx-auto">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                            <User className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('staff.createStudent.step1')}: {t('staff.createStudent.fullName')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('staff.createStudent.fullName')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    placeholder={t('staff.createStudent.fullNamePlaceholder')}
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                        errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                    }`}
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('staff.createStudent.dob')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                        errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                    }`}
                                />
                                {errors.dateOfBirth && (
                                    <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                                )}
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('staff.createStudent.gender')}
                                </label>
                                <div className="flex gap-3">
                                    {['male', 'female', 'other'].map((gender) => (
                                        <label
                                            key={gender}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl cursor-pointer transition-all ${
                                                formData.gender === gender
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={gender}
                                                checked={formData.gender === gender}
                                                onChange={(e) => handleChange('gender', e.target.value)}
                                                className="hidden"
                                            />
                                            <span className="capitalize">{t(`staff.students.${gender}`)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('common.email')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder={t('staff.createStudent.emailPlaceholder')}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('common.phone')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder={t('staff.createStudent.phonePlaceholder')}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                            errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('staff.createStudent.password')}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder={t('staff.createStudent.passwordPlaceholder')}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                                <p className="text-gray-500 text-xs mt-1">
                                    {t('staff.createStudent.autoGenerate')}
                                </p>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('staff.createStudent.address')}
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder={t('staff.createStudent.addressPlaceholder')}
                                    rows={2}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Course & Class */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('staff.createStudent.step2')}: {t('staff.createStudent.courses')} & {t('staff.createStudent.class')}
                            </h2>
                        </div>

                        {fetchingCourses ? (
                            <div className="py-12 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Course Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        {t('staff.createStudent.courses')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {courses.map((course) => (
                                            <label
                                                key={course.id}
                                                className={`relative p-4 border rounded-xl cursor-pointer transition-all ${
                                                    formData.courseIds.includes(course.id)
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.courseIds.includes(course.id)}
                                                    onChange={() => handleCourseToggle(course.id)}
                                                    className="sr-only"
                                                />
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{course.name}</div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {course.code} • {course.duration || 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div className="w-5 h-5 rounded border flex items-center justify-center">
                                                        {formData.courseIds.includes(course.id) ? (
                                                            <CheckCircle className="w-4 h-4 text-blue-600" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-gray-300" />
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.courseIds && (
                                        <p className="text-red-500 text-xs mt-2">{errors.courseIds}</p>
                                    )}
                                </div>

                                {/* Class Selection */}
                                {classes.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            {t('staff.createStudent.class')}
                                        </label>
                                        <select
                                            value={formData.classId}
                                            onChange={(e) => handleChange('classId', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        >
                                            <option value="">{t('staff.createStudent.selectClass')}</option>
                                            {classes.map((cls) => (
                                                <option key={cls.id} value={cls.id}>
                                                    {cls.name} • {cls.schedule || 'No schedule'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('staff.createStudent.notes')}
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => handleChange('notes', e.target.value)}
                                        placeholder={t('staff.createStudent.notesPlaceholder')}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Step 3: Review & Confirm */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('staff.createStudent.step3')}: {t('staff.createStudent.review')}
                            </h2>
                        </div>

                        {/* Review Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Info */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {t('staff.createStudent.step1')}
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('staff.createStudent.fullName')}</span>
                                        <span className="font-medium">{formData.fullName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('staff.createStudent.dob')}</span>
                                        <span className="font-medium">
                                            {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('vi-VN') : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('staff.createStudent.gender')}</span>
                                        <span className="font-medium capitalize">{t(`staff.students.${formData.gender}`)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('common.email')}</span>
                                        <span className="font-medium">{formData.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('common.phone')}</span>
                                        <span className="font-medium">{formData.phone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Course Info */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" />
                                    {t('staff.createStudent.step2')}
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">{t('staff.createStudent.courses')}</span>
                                        <div className="font-medium mt-1">
                                            {formData.courseIds.map(id => {
                                                const course = courses.find(c => c.id === id);
                                                return course ? course.name : id;
                                            }).join(', ')}
                                        </div>
                                    </div>
                                    {formData.classId && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('staff.createStudent.class')}</span>
                                            <span className="font-medium">
                                                {classes.find(c => c.id === formData.classId)?.name || formData.classId}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="border-t border-gray-100 pt-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.sendWelcomeEmail}
                                    onChange={(e) => handleChange('sendWelcomeEmail', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {t('staff.createStudent.sendWelcomeEmail')}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {t('staff.createStudent.emailSent')}
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 1 || loading}
                        className="flex items-center gap-2 px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('common.previous')}
                    </button>

                    {currentStep < 3 ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                        >
                            {t('common.next')}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {t('staff.createStudent.create')}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateManualStudent;
