import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, FileText, Award, User, Tags, X, BookOpen } from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';
import courseService from '../../services/courseService';
import CurriculumSection from '../../components/EducationManager/CurriculumSection';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const EduCourseForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [form, setForm] = useState({
        name: '',
        code: '',
        description: '',
        fee: 0,
        duration: 60,
        active: true,
        level: 'BEGINNER',
        status: 'DRAFT',
        objectives: '',
        requirements: '',
        thumbnailUrl: '',
        promoVideoUrl: '',
        syllabus: '',
        testSummary: '',
        instructorInfo: '',
        courseTags: '',
        teacherId: null // New field for assigned teacher
    });
    const [lessonCount, setLessonCount] = useState(0);

    useEffect(() => {
        // Load teachers
        courseService.getAllTeachers()
            .then(data => setTeachers(data))
            .catch(err => console.error('Failed to load teachers:', err));

        if (isEdit) {
            setLoading(true);
            educationManagerService.getCourseById(id)
                .then(data => {
                    setForm({
                        ...data,
                        teacherId: data.assignedTeacher?.id || null
                    });
                })
                .catch(() => Swal.fire(t('eduManager.courseForm.error'), t('eduManager.courseForm.courseNotFound'), 'error'))
                .finally(() => setLoading(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // Auto-fill instructorInfo when teacher is selected
    useEffect(() => {
        if (form.teacherId && teachers.length > 0) {
            const selectedTeacher = teachers.find(t => t.id === parseInt(form.teacherId));
            if (selectedTeacher) {
                // Format as readable text (without username)
                const parts = [
                    `${t('eduManager.courseForm.teacher')}: ${selectedTeacher.fullName}`,
                    `${t('eduManager.courseForm.email')}: ${selectedTeacher.email}`,
                    selectedTeacher.phone ? `${t('eduManager.courseForm.phone')}: ${selectedTeacher.phone}` : null
                ].filter(Boolean);

                const instructorInfo = parts.join('\n');
                setForm(prev => ({ ...prev, instructorInfo }));
            }
        }
    }, [form.teacherId, teachers]); // Run when teacherId or teachers change

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire(t('eduManager.courseForm.error'), t('eduManager.courseForm.imageSizeExceeded'), 'error');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                Swal.fire(t('eduManager.courseForm.error'), t('eduManager.courseForm.onlyImageAccepted'), 'error');
                return;
            }

            try {
                // BUG-EM-04 FIX: Use educationManagerService instead of hardcoded fetch
                const data = await educationManagerService.uploadCourseThumbnail(file);

                console.log('[EduCourseForm] Upload successful, Cloudinary URL:', data.url);
                console.log('[EduCourseForm] OLD form.thumbnailUrl:', form.thumbnailUrl);

                // Set the Cloudinary URL
                setForm(prev => {
                    const updated = { ...prev, thumbnailUrl: data.url };
                    console.log('[EduCourseForm] NEW form.thumbnailUrl:', updated.thumbnailUrl);
                    return updated;
                });

                Swal.fire({
                    icon: 'success',
                    title: t('eduManager.courseForm.success'),
                    text: t('eduManager.courseForm.imageUploaded'),
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Upload error:', error);
                Swal.fire(t('eduManager.courseForm.error'), t('eduManager.courseForm.uploadFailed'), 'error');
            }
        }
    };

    const handleRemoveImage = () => {
        Swal.fire({
            title: t('eduManager.courseForm.removeImage'),
            text: t('eduManager.courseForm.confirmRemoveImage'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: t('eduManager.courseForm.delete'),
            cancelButtonText: t('eduManager.courseForm.cancel'),
        }).then((result) => {
            if (result.isConfirmed) {
                setForm(prev => ({ ...prev, thumbnailUrl: '' }));
            }
        });
    };

    // Debug: Log when thumbnailUrl changes
    useEffect(() => {
        console.log('[EduCourseForm] form.thumbnailUrl changed to:', form.thumbnailUrl);
    }, [form.thumbnailUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('[EduCourseForm] Submitting with thumbnailUrl:', form.thumbnailUrl);

        // Validation - Required fields
        const requiredFields = {
            [t('eduManager.courseForm.courseName')]: form.name,
            [t('eduManager.courseForm.courseCode')]: form.code,
            [t('eduManager.courseForm.description')]: form.description,
            [t('eduManager.courseForm.fee')]: form.fee,
            [t('eduManager.courseForm.courseImage')]: form.thumbnailUrl,
            [t('eduManager.courseForm.objectives')]: form.objectives,
            [t('eduManager.courseForm.testStructure')]: form.testSummary,
            [t('eduManager.courseForm.instructorInfo')]: form.instructorInfo
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
                title: t('eduManager.courseForm.missingRequired'),
                html: `<div class="text-left">${t('eduManager.courseForm.fillRequiredFields')}<br/><br/>• ${missingFields.join('<br/>• ')}</div>`,
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        // Validation - Fee must be positive number
        if (Number(form.fee) <= 0) {
            Swal.fire(t('eduManager.courseForm.error'), t('eduManager.courseForm.feeMustBePositive'), 'warning');
            return;
        }

        // Validation - Must have at least 1 lesson when editing
        if (isEdit && lessonCount === 0) {
            Swal.fire(t('eduManager.courseForm.missingCurriculum'), t('eduManager.courseForm.addLessonBeforeSave'), 'warning');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                fee: Number(form.fee),
                duration: Number(form.duration) || null,
            };

            console.log('[EduCourseForm] Payload thumbnailUrl:', payload.thumbnailUrl);

            if (isEdit) {
                await educationManagerService.updateCourse(id, payload);
                Swal.fire(t('eduManager.courseForm.successExcl'), t('eduManager.courseForm.courseUpdated'), 'success');
                navigate('/edu-manager/courses');
            } else {
                const data = await educationManagerService.createCourse(payload);
                const newId = data?.id || data?.data?.id;
                if (newId) {
                    navigate(`/edu-manager/courses/edit/${newId}`);
                } else {
                    navigate('/edu-manager/courses');
                }
            }
        } catch (e) {
            Swal.fire(t('eduManager.courseForm.error'), e?.message || t('eduManager.courseForm.saveFailed'), 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-gray-400">{t('eduManager.courseForm.loading')}</div>;

    const fields = [
        { name: 'name', label: t('eduManager.courseForm.courseName'), type: 'text', span: 2, placeholder: 'VD: TOPIK I - Level 1', required: true },
        { name: 'code', label: t('eduManager.courseForm.courseCode'), type: 'text', placeholder: 'VD: TOPIK-I-L1', required: true },
        { name: 'level', label: t('eduManager.courseForm.level'), type: 'select', options: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], optionLabels: [t('eduManager.courseForm.topikI'), t('eduManager.courseForm.topikII'), t('eduManager.courseForm.esp')] },
        { name: 'status', label: t('eduManager.courseForm.status'), type: 'select', options: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], optionLabels: [t('eduManager.courseForm.draft'), t('eduManager.courseForm.published'), t('eduManager.courseForm.archived')] },
        { name: 'teacherId', label: t('eduManager.courseForm.teacherInCharge'), type: 'teacher-select', span: 2 },
        { name: 'fee', label: t('eduManager.courseForm.fee'), type: 'number', placeholder: 'VD: 2000000', required: true },
        { name: 'duration', label: t('eduManager.courseForm.duration'), type: 'number', placeholder: 'VD: 60' },
        { name: 'promoVideoUrl', label: t('eduManager.courseForm.promoVideoUrl'), type: 'text', span: 2, placeholder: 'https://youtube.com/...' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEdit ? t('eduManager.courseForm.editCourse') : t('eduManager.courseForm.createCourse')}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {fields.map(f => (
                        <div key={f.name} className={f.span === 2 ? 'sm:col-span-2' : ''}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {f.label}
                                {f.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {f.type === 'select' ? (
                                <select
                                    name={f.name}
                                    value={form[f.name] || f.options[0]}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none"
                                >
                                    {f.options.map((opt, idx) => (
                                                                        <option key={opt} value={opt}>{f.optionLabels[idx]}</option>
                                                                    ))}
                                </select>
                            ) : f.type === 'teacher-select' ? (
                                <select
                                    name={f.name}
                                    value={form[f.name] || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none"
                                >
                                    <option value="">{t('eduManager.courseForm.selectTeacher')}</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher.id} value={teacher.id}>
                                                                            {teacher.fullName} ({teacher.username})
                                                                        </option>
                                                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={f.type}
                                    name={f.name}
                                    value={form[f.name] ?? ''}
                                    onChange={handleChange}
                                    placeholder={f.placeholder || ''}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none"
                                />
                            )}
                        </div>
                    ))}

                    {/* Image Upload */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            {t('eduManager.courseForm.courseImage')}
                            <span className="text-red-500">*</span>
                        </label>
                        {!form.thumbnailUrl && (
                            <p className="text-xs text-red-500 mb-2">{t('eduManager.courseForm.courseImageRequired')}</p>
                        )}
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                />
                            </div>
                            {form.thumbnailUrl && (
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img src={form.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        title={t('eduManager.courseForm.removeImage')}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {form.thumbnailUrl && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                <Upload className="w-4 h-4" />
                                <span>{t('eduManager.courseForm.chooseOtherImage')}</span>
                            </div>
                        )}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('eduManager.courseForm.description')}
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea name="description" value={form.description || ''} onChange={handleChange} rows={4}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none"
                            placeholder={t('eduManager.courseForm.descriptionPlaceholder')} />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('eduManager.courseForm.courseObjectives')}
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea name="objectives" value={form.objectives || ''} onChange={handleChange} rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none"
                            placeholder={t('eduManager.courseForm.objectivesPlaceholder')} />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('eduManager.courseForm.requirements')}</label>
                        <textarea name="requirements" value={form.requirements || ''} onChange={handleChange} rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none" placeholder={t('eduManager.courseForm.requirementsPlaceholder')} />
                    </div>

                    {/* NEW: Detailed Syllabus (legacy field, keep hidden) */}
                    <input type="hidden" name="syllabus" value={form.syllabus || ''} />

                    {/* Curriculum Section */}
                    <div className="sm:col-span-2 border-t border-gray-100 pt-5 mt-2">
                        {isEdit && id ? (
                            <CurriculumSection courseId={parseInt(id)} onLessonsChange={setLessonCount} />
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">{t('eduManager.courseForm.saveBeforeCurriculum')}</p>
                            </div>
                        )}
                    </div>

                    {/* NEW: Test Structure Summary */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            {t('eduManager.courseForm.testStructure')}
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea name="testSummary" value={form.testSummary || ''} onChange={handleChange} rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none" placeholder={t('eduManager.courseForm.testStructurePlaceholder')} />
                    </div>

                    {/* NEW: Instructor Information */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {t('eduManager.courseForm.instructorInfoLabel')}
                            <span className="text-gray-400 text-xs">({t('eduManager.courseForm.autoFilledFromTeacher')})</span>
                        </label>
                        <textarea
                            name="instructorInfo"
                            value={form.instructorInfo || ''}
                            onChange={handleChange}
                            rows={3}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none bg-gray-50 text-gray-600"
                            placeholder={t('eduManager.courseForm.instructorInfoPlaceholder')}
                        />
                    </div>

                    {/* NEW: Course Tags */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Tags className="w-4 h-4" />
                            {t('eduManager.courseForm.courseTags')}
                        </label>
                        <input
                            type="text"
                            name="courseTags"
                            value={form.courseTags || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none"
                            placeholder={t('eduManager.courseForm.tagsPlaceholder')}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="active" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 accent-violet-600" />
                        <label htmlFor="active" className="text-sm font-medium text-gray-700">{t('eduManager.courseForm.activate')}</label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm">{t('eduManager.courseForm.cancel')}</button>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-60 font-medium text-sm">
                        <Save className="w-4 h-4" />
                        {saving ? t('eduManager.courseForm.saving') : (isEdit ? t('eduManager.courseForm.update') : t('eduManager.courseForm.createCourseBtn'))}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EduCourseForm;
