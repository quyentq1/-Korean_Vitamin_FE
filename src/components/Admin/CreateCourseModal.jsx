import { useState, useRef } from 'react';
import { BookOpen, GraduationCap, FileText, Award, User, Tags, X, Upload } from 'lucide-react';
import Swal from 'sweetalert2';

const CreateCourseModal = ({ onClose, onSubmit }) => {
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
                alert('Kích thước ảnh không được vượt quá 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Chỉ chấp nhận file ảnh');
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
                alert('Không thể tải ảnh lên. Vui lòng thử lại.');
            }
        }
    };

    const handleRemoveImage = () => {
        if (confirm('Bạn có chắc muốn xóa ảnh này?')) {
            setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Use ref to get latest formData
        const currentData = formDataRef.current;

        // Validation
        const requiredFields = {
            'Tên khóa học': currentData.name,
            'Mã khóa học': currentData.code,
            'Mô tả': currentData.description,
            'Học phí': currentData.fee,
            'Ảnh khóa học': currentData.thumbnailUrl,
            'Mục tiêu': currentData.objectives,
            'Giáo trình chi tiết': currentData.syllabus,
            'Cấu trúc bài kiểm tra': currentData.testSummary,
            'Thông tin giáo viên': currentData.instructorInfo
        };

        const missingFields = [];
        for (const [label, value] of Object.entries(requiredFields)) {
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                missingFields.push(label);
            }
        }

        if (missingFields.length > 0) {
            alert(`⚠️ Thiếu thông tin bắt buộc:\n\n• ${missingFields.join('\n• ')}`);
            return;
        }

        if (Number(currentData.fee) <= 0) {
            alert('⚠️ Học phí phải lớn hơn 0');
            return;
        }

        onSubmit({ ...currentData, status: 'DRAFT' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Tạo Khóa Học</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên khóa học <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mã khóa học <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ảnh khóa học <span className="text-red-500">*</span>
                        </label>
                        {!formData.thumbnailUrl && (
                            <p className="text-xs text-red-500 mb-2">⚠️ Bắt buộc phải có ảnh khóa học</p>
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

                    {/* Promotional Video URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Video giới thiệu</label>
                        <input
                            type="url"
                            value={formData.promoVideoUrl || ''}
                            onChange={e => setFormData({...formData, promoVideoUrl: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả <span className="text-red-500">*</span>
                        </label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Mô tả chi tiết về khóa học..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ</label>
                            <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                                <option value="BEGINNER">Sơ cấp</option>
                                <option value="INTERMEDIATE">Trung cấp</option>
                                <option value="ADVANCED">Cao cấp</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (giờ)</label>
                            <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lịch học mẫu</label>
                        <input type="text" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Thứ 2,4,6 - 18:00-20:00" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Học phí (VND) <span className="text-red-500">*</span>
                        </label>
                        <input type="number" value={formData.fee} onChange={e => setFormData({...formData, fee: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" placeholder="2000000" />
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mục tiêu <span className="text-red-500">*</span>
                        </label>
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
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.syllabus}
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
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.testSummary}
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
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.instructorInfo}
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
                            value={formData.courseTags}
                            onChange={e => setFormData({...formData, courseTags: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="VD: TOPIK, Sơ cấp, Ngữ pháp, Listening (cách nhau bằng dấu phẩy)"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" /> Tạo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCourseModal;
