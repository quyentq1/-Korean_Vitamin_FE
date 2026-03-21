import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, FileText, Award, User, Tags, X } from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';
import courseService from '../../services/courseService';
import Swal from 'sweetalert2';

const EduCourseForm = () => {
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
        price: 0,
        discountPrice: 0,
        duration: 60,
        schedule: '',
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
                .catch(() => Swal.fire('Lỗi', 'Không tìm thấy khóa học', 'error'))
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
                    `Giáo viên: ${selectedTeacher.fullName}`,
                    `Email: ${selectedTeacher.email}`,
                    selectedTeacher.phone ? `Điện thoại: ${selectedTeacher.phone}` : null
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
                Swal.fire('Lỗi', 'Kích thước ảnh không được vượt quá 5MB', 'error');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                Swal.fire('Lỗi', 'Chỉ chấp nhận file ảnh', 'error');
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
                    title: 'Thành công',
                    text: 'Đã tải ảnh lên!',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Upload error:', error);
                Swal.fire('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.', 'error');
            }
        }
    };

    const handleRemoveImage = () => {
        Swal.fire({
            title: 'Xóa ảnh?',
            text: 'Bạn có chắc muốn xóa ảnh này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
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
            'Tên khóa học': form.name,
            'Mã khóa học': form.code,
            'Mô tả': form.description,
            'Học phí': form.fee,
            'Ảnh khóa học': form.thumbnailUrl,
            'Mục tiêu': form.objectives,
            'Giáo trình chi tiết': form.syllabus,
            'Cấu trúc bài kiểm tra': form.testSummary,
            'Thông tin giáo viên': form.instructorInfo
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
                title: 'Thiếu thông tin bắt buộc',
                html: `<div class="text-left">Vui lòng điền các trường sau:<br/><br/>• ${missingFields.join('<br/>• ')}</div>`,
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        // Validation - Fee must be positive number
        if (Number(form.fee) <= 0) {
            Swal.fire('Lỗi', 'Học phí phải lớn hơn 0', 'warning');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                fee: Number(form.fee),
                price: Number(form.price) || 0,
                discountPrice: Number(form.discountPrice) || 0,
                duration: Number(form.duration) || null,
            };

            console.log('[EduCourseForm] Payload thumbnailUrl:', payload.thumbnailUrl);

            if (isEdit) {
                await educationManagerService.updateCourse(id, payload);
                Swal.fire('Thành công!', 'Đã cập nhật khóa học', 'success');
            } else {
                await educationManagerService.createCourse(payload);
                Swal.fire('Thành công!', 'Đã tạo khóa học mới', 'success');
            }
            navigate('/edu-manager/courses');
        } catch (e) {
            Swal.fire('Lỗi', e?.message || 'Không thể lưu khóa học', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-gray-400">Đang tải...</div>;

    const fields = [
        { name: 'name', label: 'Tên khóa học', type: 'text', span: 2, placeholder: 'VD: TOPIK I - Level 1', required: true },
        { name: 'code', label: 'Mã khóa học', type: 'text', placeholder: 'VD: TOPIK-I-L1', required: true },
        { name: 'level', label: 'Trình độ', type: 'select', options: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], optionLabels: ['Sơ cấp', 'Trung cấp', 'Cao cấp'] },
        { name: 'status', label: 'Trạng thái', type: 'select', options: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], optionLabels: ['Bản nháp', 'Đã công bố', 'Lưu trữ'] },
        { name: 'teacherId', label: 'Giáo viên phụ trách', type: 'teacher-select', span: 2 },
        { name: 'fee', label: 'Học phí (₫)', type: 'number', placeholder: 'VD: 2000000', required: true },
        { name: 'price', label: 'Giá niêm yết (₫)', type: 'number', placeholder: 'VD: 2500000' },
        { name: 'discountPrice', label: 'Giá ưu đãi (₫)', type: 'number', placeholder: 'VD: 1800000' },
        { name: 'duration', label: 'Thời lượng (giờ)', type: 'number', placeholder: 'VD: 60' },
        { name: 'schedule', label: 'Lịch học mẫu', type: 'text', placeholder: 'VD: Thứ 2, 4, 6 - 18:00-20:00' },
        { name: 'promoVideoUrl', label: 'Video giới thiệu URL', type: 'text', span: 2, placeholder: 'https://youtube.com/...' },
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Sửa khóa học' : 'Tạo khóa học mới'}</h1>
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
                                    <option value="">-- Chọn giáo viên --</option>
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
                            Ảnh khóa học
                            <span className="text-red-500">*</span>
                        </label>
                        {!form.thumbnailUrl && (
                            <p className="text-xs text-red-500 mb-2">⚠️ Bắt buộc phải có ảnh khóa học</p>
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
                                        title="Xóa ảnh"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {form.thumbnailUrl && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                <Upload className="w-4 h-4" />
                                <span>Chọn ảnh khác để thay thế</span>
                            </div>
                        )}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea name="description" value={form.description || ''} onChange={handleChange} rows={4}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none"
                            placeholder="Mô tả chi tiết về khóa học..." />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mục tiêu khóa học
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea name="objectives" value={form.objectives || ''} onChange={handleChange} rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none"
                            placeholder="VD: Mở rộng vốn từ vựng, Giao tiếp tự tin..." />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu / Điều kiện tiên quyết</label>
                        <textarea name="requirements" value={form.requirements || ''} onChange={handleChange} rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none" placeholder="VD: Cần biết tiếng Hàn cơ bản, đã hoàn thành khóa học Sơ cấp..." />
                    </div>

                    {/* NEW: Detailed Syllabus */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Giáo trình chi tiết
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea name="syllabus" value={form.syllabus || ''} onChange={handleChange} rows={4}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none" placeholder="Mô tả chi tiết nội dung từng bài học, từng tuần... (có thể dùng Markdown)" />
                    </div>

                    {/* NEW: Test Structure Summary */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Cấu trúc bài kiểm tra
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea name="testSummary" value={form.testSummary || ''} onChange={handleChange} rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none" placeholder="VD: 2 bài kiểm tra giữa kỳ, 1 bài cuối kỳ, mỗi bài 20 câu trắc nghiệm..." />
                    </div>

                    {/* NEW: Instructor Information */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Thông tin giảng viên (tự động điền khi chọn Teacher)
                            <span className="text-gray-400 text-xs">(Auto-filled from selected Teacher)</span>
                        </label>
                        <textarea
                            name="instructorInfo"
                            value={form.instructorInfo || ''}
                            onChange={handleChange}
                            rows={3}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none bg-gray-50 text-gray-600"
                            placeholder="Giáo viên: [Tên]\nEmail: [email]\nĐiện thoại: [số điện thoại]"
                        />
                    </div>

                    {/* NEW: Course Tags */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Tags className="w-4 h-4" />
                            Tags khóa học
                        </label>
                        <input
                            type="text"
                            name="courseTags"
                            value={form.courseTags || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none"
                            placeholder="VD: TOPIK, Sơ cấp, Ngữ pháp, Listening (cách nhau bằng dấu phẩy)"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="active" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 accent-violet-600" />
                        <label htmlFor="active" className="text-sm font-medium text-gray-700">Kích hoạt</label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm">Hủy</button>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-60 font-medium text-sm">
                        <Save className="w-4 h-4" />
                        {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo khóa học')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EduCourseForm;
