import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Input, Button, Alert } from '../ui';

const CreateCourseModal = ({ isOpen, onClose, onSave }) => {
    const { t } = useTranslation();
    
    // State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        level: 'beginner',
        duration: 0,
        price: 0,
        teacherId: '',
        imageUrl: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [fetchingTeachers, setFetchingTeachers] = useState(false);
    
    // Fetch teachers when modal opens
    useEffect(() => {
        if (isOpen && teachers.length === 0 && !fetchingTeachers) {
            setFetchingTeachers(true);
            // TODO: Fetch teachers from API
            // For now, use mock data
            const mockTeachers = [
                { id: 1, name: 'Nguyễn Văn A' },
                { id: 2, name: 'Trần Thị B' },
                { id: 3, name: 'Lê Minh C' }
            ];
            setTeachers(mockTeachers);
            setFetchingTeachers(false);
        }
    }, [isOpen, teachers.length, fetchingTeachers]);
    
    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field
        if (value.trim()) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };
    
    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = t('courseMgmt.nameRequired', 'Tên khóa học là bắt buộc');
        }
        
        if (!formData.code.trim()) {
            newErrors.code = t('courseMgmt.codeRequired', 'Mã khóa học là bắt buộc');
        }
        
        if (!formData.description.trim()) {
            newErrors.description = t('courseMgmt.descriptionRequired', 'Mô tả là bắt buộc');
        }
        
        if (formData.duration <= 0) {
            newErrors.duration = t('courseMgmt.durationRequired', 'Thời lượng phải lớn hơn 0');
        }
        
        if (formData.price < 0) {
            newErrors.price = t('courseMgmt.priceRequired', 'Giá phải lớn hơn hoặc bằng 0');
        }
        
        if (!formData.teacherId) {
            newErrors.teacherId = t('courseMgmt.teacherRequired', 'Giảng viên là bắt buộc');
        }
        
        setErrors(newErrors);
        
        return Object.keys(newErrors).length === 0;
    };
    
    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        try {
            const courseData = {
                name: formData.name,
                code: formData.code,
                description: formData.description,
                level: formData.level,
                duration: parseInt(formData.duration),
                price: parseFloat(formData.price),
                teacherId: parseInt(formData.teacherId),
                imageUrl: formData.imageUrl || null
            };
            
            await onSave(courseData);
            
            // Reset form
            setFormData({
                name: '',
                code: '',
                description: '',
                level: 'beginner',
                duration: 0,
                price: 0,
                teacherId: '',
                imageUrl: ''
            });
            setErrors({});
            onClose();
        } catch (error) {
            console.error("Failed to create course:", error);
            setErrors({ submit: error.message || t('courseMgmt.createError', 'Không thể tạo khóa học') });
        } finally {
            setLoading(false);
        }
    };
    
    // Handle reset
    const handleReset = () => {
        setFormData({
            name: '',
            code: '',
            description: '',
            level: 'beginner',
            duration: 0,
            price: 0,
            teacherId: '',
            imageUrl: ''
        });
        setErrors({});
    };
    
    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                handleReset();
                onClose();
            }}
            title={t('courseMgmt.createCourseTitle', 'Tạo Khóa Học Mới')}
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={() => {
                        handleReset();
                        onClose();
                    }}>
                        {t('common.cancel', 'Hủy')}
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSubmit}
                        loading={loading}
                    >
                        {t('common.create', 'Tạo')}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('courseMgmt.name', 'Tên khóa học')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('courseMgmt.namePlaceholder', 'Nhập tên khóa học...')}
                        error={errors.name}
                    />
                </div>
                
                {/* Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('courseMgmt.code', 'Mã khóa học')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder={t('courseMgmt.codePlaceholder', 'Nhập mã khóa học...')}
                        error={errors.code}
                    />
                </div>
                
                {/* Level */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('courseMgmt.level', 'Trình độ')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="select"
                        value={formData.level}
                        onChange={handleChange}
                        placeholder={t('courseMgmt.levelPlaceholder', 'Chọn trình độ...')}
                    >
                        <option value="beginner">{t('courseMgmt.beginner', 'Sơ cấp')}</option>
                        <option value="intermediate">{t('courseMgmt.intermediate', 'Trung cấp')}</option>
                        <option value="advanced">{t('courseMgmt.advanced', 'Cao cấp')}</option>
                    </Input>
                </div>
                
                {/* Duration */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('courseMgmt.duration', 'Thời lượng (giờ)')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="number"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder={t('courseMgmt.durationPlaceholder', 'Nhập thời lượng...')}
                        min="0"
                        error={errors.duration}
                    />
                </div>
                
                {/* Price */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('courseMgmt.price', 'Giá (VND)')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder={t('courseMgmt.pricePlaceholder', 'Nhập giá...')}
                        min="0"
                        step="100000"
                        error={errors.price}
                    />
                </div>
                
                {/* Teacher */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('courseMgmt.teacher', 'Giảng viên')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="select"
                        value={formData.teacherId}
                        onChange={handleChange}
                        placeholder={t('courseMgmt.teacherPlaceholder', 'Chọn giảng viên...')}
                        loading={fetchingTeachers}
                        error={errors.teacherId}
                    >
                        <option value="">{t('courseMgmt.selectTeacher', '-- Chọn giảng viên --')}</option>
                        {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.name}
                            </option>
                        ))}
                    </Input>
                </div>
                
                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('courseMgmt.description', 'Mô tả')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => {
                            setFormData(prev => ({
                                ...prev,
                                description: e.target.value
                            }));
                            if (e.target.value.trim()) {
                                setErrors(prev => ({
                                    ...prev,
                                    description: null
                                }));
                            }
                        }}
                        placeholder={t('courseMgmt.descriptionPlaceholder', 'Nhập mô tả khóa học...')}
                    />
                </div>
                
                {/* Image URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('courseMgmt.imageUrl', 'URL hình ảnh')}
                    </label>
                    <Input
                        type="text"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder={t('courseMgmt.imageUrlPlaceholder', 'Nhập URL hình ảnh (không bắt buộc)')}
                    />
                </div>
                
                {/* Submit error */}
                {errors.submit && (
                    <Alert variant="error" dismissible onDismiss={() => setErrors(prev => ({ ...prev, submit: null }))}>
                        {errors.submit}
                    </Alert>
                )}
            </form>
        </Modal>
    );
};

export default CreateCourseModal;
