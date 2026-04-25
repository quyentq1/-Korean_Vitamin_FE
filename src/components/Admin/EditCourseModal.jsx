import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Save, FileText, Award, User, Tags, X, Upload } from 'lucide-react';
import Swal from 'sweetalert2';

const EditCourseModal = ({ course, onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(() => course ? { ...course } : {
        name: '',
        code: '',
        description: '',
        level: 'BEGINNER',
        duration: 60,
        fee: 0,
        price: 0,
        discountPrice: null,
        status: 'DRAFT',
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

    // Only set initial data on mount
    useEffect(() => {
        if (course) {
            setFormData({ ...course });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: t('admin.editCourseModal.fileTooLarge'),
                    text: t('admin.editCourseModal.fileSizeLimit'),
                    confirmButtonText: t('common.ok'),
                    confirmButtonColor: '#ef4444'
                });
                return;
            }
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'error',
                    title: t('admin.editCourseModal.invalidFormat'),
                    text: t('admin.editCourseModal.onlyImages'),
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
                console.log('[EditCourseModal] Upload successful, Cloudinary URL:', data.url);
                setFormData(prev => {
                    console.log('[EditCourseModal] Updating formData, OLD thumbnailUrl:', prev.thumbnailUrl);
                    const updated = { ...prev, thumbnailUrl: data.url };
                    console.log('[EditCourseModal] Updating formData, NEW thumbnailUrl:', updated.thumbnailUrl);
                    return updated;
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: t('admin.editCourseModal.uploadError'),
                    text: t('admin.editCourseModal.uploadErrorText'),
                    confirmButtonText: t('common.ok'),
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    };

    const handleRemoveImage = () => {
        Swal.fire({
            icon: 'question',
            title: t('admin.editCourseModal.removeImage'),
            text: t('admin.editCourseModal.confirmRemoveImage'),
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

        // Debug log
        console.log('[EditCourseModal] Submitting with thumbnailUrl:', formData.thumbnailUrl);

        onSubmit(formData);
    };

    // Debug log when thumbnailUrl changes
    useEffect(() => {
        console.log('[EditCourseModal] thumbnailUrl changed to:', formData.thumbnailUrl);
    }, [formData.thumbnailUrl]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">{t('admin.editCourseModal.title')}</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.editCourseModal.courseName')}</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.editCourseModal.courseCode')}</label>
                            <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.editCourseModal.courseImage')}</label>
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full px-3 py-2 border rounded-lg text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                                        title={t('admin.editCourseModal.removeImage')}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {formData.thumbnailUrl && (
                            <div className="mt-2 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-gray-400" />
                                <p className="text-xs text-gray-500">{t('admin.editCourseModal.chooseDifferentImage')}</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.editCourseModal.description')}</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.editCourseModal.level')}</label>
                            <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                                <option value="BEGINNER">TOPIK I</option>
                                <option value="INTERMEDIATE">TOPIK II</option>
                                <option value="ADVANCED">ESP</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.editCourseModal.duration')}</label>
                            <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.editCourseModal.status')}</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                                <option value="DRAFT">{t('admin.editCourseModal.statusDraft')}</option>
                                <option value="PUBLISHED">{t('admin.editCourseModal.statusPublished')}</option>
                                <option value="ARCHIVED">{t('admin.editCourseModal.statusArchived')}</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.editCourseModal.schedule')}</label>
                        <input type="text" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder={t('admin.editCourseModal.schedulePlaceholder')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.editCourseModal.fee')}</label>
                        <input type="number" value={formData.fee} onChange={e => setFormData({...formData, fee: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.editCourseModal.price')}</label>
                            <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.editCourseModal.discountPrice')}</label>
                            <input type="number" value={formData.discountPrice || ''} onChange={e => setFormData({...formData, discountPrice: e.target.value ? parseInt(e.target.value) : null})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.editCourseModal.objectives')}</label>
                        <textarea value={formData.objectives} onChange={e => setFormData({...formData, objectives: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder={t('admin.editCourseModal.objectivesPlaceholder')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.editCourseModal.requirements')}</label>
                        <textarea value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder={t('admin.editCourseModal.requirementsPlaceholder')} />
                    </div>

                    {/* NEW: Detailed Syllabus */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {t('admin.editCourseModal.syllabus')}
                        </label>
                        <textarea
                            value={formData.syllabus || ''}
                            onChange={e => setFormData({...formData, syllabus: e.target.value})}
                            rows={4}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder={t('admin.editCourseModal.syllabusPlaceholder')}
                        />
                    </div>

                    {/* NEW: Test Structure Summary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            {t('admin.editCourseModal.testSummary')}
                        </label>
                        <textarea
                            value={formData.testSummary || ''}
                            onChange={e => setFormData({...formData, testSummary: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder={t('admin.editCourseModal.testSummaryPlaceholder')}
                        />
                    </div>

                    {/* NEW: Instructor Information */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {t('admin.editCourseModal.instructorInfo')}
                        </label>
                        <textarea
                            value={formData.instructorInfo || ''}
                            onChange={e => setFormData({...formData, instructorInfo: e.target.value})}
                            rows={2}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder={t('admin.editCourseModal.instructorInfoPlaceholder')}
                        />
                    </div>

                    {/* NEW: Course Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Tags className="w-4 h-4" />
                            {t('admin.editCourseModal.courseTags')}
                        </label>
                        <input
                            type="text"
                            value={formData.courseTags || ''}
                            onChange={e => setFormData({...formData, courseTags: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder={t('admin.editCourseModal.courseTagsPlaceholder')}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{t('common.cancel')}</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Save className="w-4 h-4" /> {t('admin.editCourseModal.saveChanges')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCourseModal;
