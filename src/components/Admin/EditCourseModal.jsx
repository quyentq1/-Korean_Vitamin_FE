import { useState, useEffect } from 'react';
import { Edit, Save, FileText, Award, User, Tags, X, Upload } from 'lucide-react';
import Swal from 'sweetalert2';

const EditCourseModal = ({ course, onClose, onSubmit }) => {
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
                    title: 'File quá lớn',
                    text: 'Kích thước ảnh không được vượt quá 5MB',
                    confirmButtonText: 'Đồng ý',
                    confirmButtonColor: '#ef4444'
                });
                return;
            }
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Sai định dạng',
                    text: 'Chỉ chấp nhận file hình ảnh',
                    confirmButtonText: 'Đồng ý',
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
                    title: 'Lỗi tải ảnh',
                    text: 'Không thể tải ảnh lên. Vui lòng thử lại.',
                    confirmButtonText: 'Đồng ý',
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    };

    const handleRemoveImage = () => {
        Swal.fire({
            icon: 'question',
            title: 'Xóa ảnh',
            text: 'Bạn có chắc muốn xóa ảnh này?',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
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
                    <h3 className="text-lg font-semibold text-gray-900">Cập Nhật Khóa Học</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học *</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã khóa học</label>
                            <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh khóa học</label>
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
                                        title="Xóa ảnh"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {formData.thumbnailUrl && (
                            <div className="mt-2 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-gray-400" />
                                <p className="text-xs text-gray-500">Chọn ảnh khác để thay thế</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ</label>
                            <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                                <option value="BEGINNER">TOPIK I</option>
                                <option value="INTERMEDIATE">TOPIK II</option>
                                <option value="ADVANCED">ESP</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (giờ)</label>
                            <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                                <option value="DRAFT">Bản nháp</option>
                                <option value="PUBLISHED">Đã công bố</option>
                                <option value="ARCHIVED">Lưu trữ</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lịch học</label>
                        <input type="text" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Thứ 2,4,6 - 18:00-20:00" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Học phí (VND)</label>
                        <input type="number" value={formData.fee} onChange={e => setFormData({...formData, fee: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                            <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá KM</label>
                            <input type="number" value={formData.discountPrice || ''} onChange={e => setFormData({...formData, discountPrice: e.target.value ? parseInt(e.target.value) : null})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu</label>
                        <textarea value={formData.objectives} onChange={e => setFormData({...formData, objectives: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Mục tiêu học tập (mỗi dòng một mục tiêu)" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu</label>
                        <textarea value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Điều kiện tiên quyết, kiến thức cần có..." />
                    </div>

                    {/* NEW: Detailed Syllabus */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Giáo trình chi tiết
                        </label>
                        <textarea
                            value={formData.syllabus || ''}
                            onChange={e => setFormData({...formData, syllabus: e.target.value})}
                            rows={4}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Mô tả chi tiết nội dung từng bài học, từng tuần... (có thể dùng Markdown)"
                        />
                    </div>

                    {/* NEW: Test Structure Summary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Cấu trúc bài kiểm tra
                        </label>
                        <textarea
                            value={formData.testSummary || ''}
                            onChange={e => setFormData({...formData, testSummary: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="VD: 2 bài kiểm tra giữa kỳ, 1 bài cuối kỳ, mỗi bài 20 câu trắc nghiệm..."
                        />
                    </div>

                    {/* NEW: Instructor Information */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Thông tin giáo viên
                        </label>
                        <textarea
                            value={formData.instructorInfo || ''}
                            onChange={e => setFormData({...formData, instructorInfo: e.target.value})}
                            rows={2}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Tên giáo viên, kinh nghiệm, bằng cấp..."
                        />
                    </div>

                    {/* NEW: Course Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Tags className="w-4 h-4" />
                            Tags khóa học
                        </label>
                        <input
                            type="text"
                            value={formData.courseTags || ''}
                            onChange={e => setFormData({...formData, courseTags: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="VD: TOPIK, TOPIK I, Ngữ pháp, Listening (cách nhau bằng dấu phẩy)"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Save className="w-4 h-4" /> Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCourseModal;
