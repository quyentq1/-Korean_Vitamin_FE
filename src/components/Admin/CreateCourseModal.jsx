import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, GraduationCap, FileText, Award, User, Tags, X, Upload } from 'lucide-react';
import Swal from 'sweetalert2';

const CreateCourseModal = ({ onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        level: 'BEGINNER',
        duration: 60,
        fee: 0,
        price: 0,
        discountPrice: null,
        schedule: '',
        objectives: '',
        requirements: '',
        thumbnailUrl: '',
        promoVideoUrl: '',
        syllabus: '',
        testSummary: '',
        instructorInfo: '',
        courseTags: ''
    });

    // Use ref to track latest formData
    const formDataRef = useRef(formData);
    formDataRef.current = formData;

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: t('admin.createCourse.fileTooLarge'),
                    text: t('admin.createCourse.fileSizeLimit'),
                    confirmButtonText: t('common.ok'),
                    confirmButtonColor: '#ef4444'
                });
                return;
            }
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'error',
                    title: t('admin.createCourse.invalidFormat'),
                    text: t('admin.createCourse.onlyImages'),
                    confirmButtonText: t('common.ok'),
                    confirmButtonColor: '#ef4444'
                });
                return;
            }

            try {
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);

                const response = await fetch('http://localhost:8080/api/education-manager/upload/course-thumbnail', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: uploadFormData
                });

                if (!response.ok) throw new Error('Upload failed');

                const data = await response.json();
                setFormData(prev => ({ ...prev, thumbnailUrl: data.url }));
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: t('admin.createCourse.uploadError'),
                    text: t('admin.createCourse.uploadErrorText'),
                    confirmButtonText: t('common.ok'),
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    };

    const handleRemoveImage = () => {
        Swal.fire({
            icon: 'question',
            title: t('admin.createCourse.removeImage'),
            text: t('admin.createCourse.confirmRemoveImage'),
            showCancelButton: true,
            confirmButtonText: t('common.delete'),
            cancelButtonText: t('common.cancel'),
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Use ref to get latest formData
        const currentData = formDataRef.current;

        // Validation
        const requiredFields = {
            [t('admin.createCourse.courseName')]: currentData.name,
            [t('admin.createCourse.courseCode')]: currentData.code,
            [t('admin.createCourse.description')]: currentData.description,
            [t('admin.createCourse.fee')]: currentData.fee,
            [t('admin.createCourse.courseImage')]: currentData.thumbnailUrl,
            [t('admin.createCourse.objectives')]: currentData.objectives,
            [t('admin.createCourse.syllabus')]: currentData.syllabus,
            [t('admin.createCourse.testSummary')]: currentData.testSummary,
            [t('admin.createCourse.instructorInfo')]: currentData.instructorInfo
        };

        const missingFields = [];
        for (const [label, value] of Object.entries(requiredFields)) {
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                missingFields.push(label);
            }
        }

        if (missingFields.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: t('admin.createCourse.missingInfo'),
                html: `${t('admin.createCourse.fillFields')}<br/><br/>• ${missingFields.join('<br/>• ')}`,
                confirmButtonText: t('common.ok'),
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        if (Number(currentData.fee) <= 0) {
            Swal.fire({
                icon: 'warning',
                title: t('admin.createCourse.invalidFee'),
                text: t('admin.createCourse.invalidFeeText'),
                confirmButtonText: t('common.ok'),
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        onSubmit({ ...currentData, status: 'DRAFT' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">{t('admin.createCourse.title')}</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('admin.createCourse.courseName')} <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('admin.createCourse.courseCode')} <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('admin.createCourse.courseImage')} <span className="text-red-500">*</span>
                        </label>
                        {!formData.thumbnailUrl && (
                            <p className="text-xs text-red-500 mb-2">⚠️ {t('admin.createCourse.imageRequired')}</p>
                        )}
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full px-3 py-2 border rounded-lg text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                />
                            </div>
                            {formData.thumbnailUrl && (
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        title={t('admin.createCourse.removeImage')}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {formData.thumbnailUrl && (
                            <div className="mt-2 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-gray-400" />
                                <p className="text-xs text-gray-500">{t('admin.createCourse.changeImage')}</p>
                            </div>
                        )}
                    </div>

                    {/* Promotional Video URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.createCourse.promoVideoUrl')}</label>
                        <input
                            type="url"
                            value={formData.promoVideoUrl || ''}
                            onChange={e => setFormData({...formData, promoVideoUrl: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder={t('admin.createCourse.promoVideoPlaceholder')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('admin.createCourse.description')} <span className="text-red-500">*</span>
                        </label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder={t('admin.createCourse.descriptionPlaceholder')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.createCourse.level')}</label>
                            <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                                <option value="BEGINNER">TOPIK I</option>
                                <option value="INTERMEDIATE">TOPIK II</option>
                                <option value="ADVANCED">ESP</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.createCourse.duration')}</label>
                            <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.createCourse.schedule')}</label>
                        <input type="text" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder={t('admin.createCourse.schedulePlaceholder')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('admin.createCourse.fee')} <span className="text-red-500">*</span>
                        </label>
                        <input type="number" value={formData.fee} onChange={e => setFormData({...formData, fee: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" placeholder={t('admin.createCourse.feePlaceholder')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.createCourse.price')}</label>
                            <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.createCourse.discountPrice')}</label>
                            <input type="number" value={formData.discountPrice || ''} onChange={e => setFormData({...formData, discountPrice: e.target.value ? parseInt(e.target.value) : null})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('admin.createCourse.objectives')} <span className="text-red-500">*</span>
                        </label>
                        <textarea value={formData.objectives} onChange={e => setFormData({...formData, objectives: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder={t('admin.createCourse.objectivesPlaceholder')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.createCourse.requirements')}</label>
                        <textarea value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder={t('admin.createCourse.requirementsPlaceholder')} />
                    </div>

                    {/* NEW: Detailed Syllabus */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {t('admin.createCourse.syllabus')}
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.syllabus}
                            onChange={e => setFormData({...formData, syllabus: e.target.value})}
                            rows={4}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder={t('admin.createCourse.syllabusPlaceholder')}
                        />
                    </div>

                    {/* NEW: Test Structure Summary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            {t('admin.createCourse.testSummary')}
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.testSummary}
                            onChange={e => setFormData({...formData, testSummary: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder={t('admin.createCourse.testSummaryPlaceholder')}
                        />
                    </div>

                    {/* NEW: Instructor Information */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {t('admin.createCourse.instructorInfo')}
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.instructorInfo}
                            onChange={e => setFormData({...formData, instructorInfo: e.target.value})}
                            rows={2}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder={t('admin.createCourse.instructorInfoPlaceholder')}
                        />
                    </div>

                    {/* NEW: Course Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Tags className="w-4 h-4" />
                            {t('admin.createCourse.courseTags')}
                        </label>
                        <input
                            type="text"
                            value={formData.courseTags}
                            onChange={e => setFormData({...formData, courseTags: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder={t('admin.createCourse.courseTagsPlaceholder')}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{t('common.cancel')}</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" /> {t('admin.createCourse.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCourseModal;
