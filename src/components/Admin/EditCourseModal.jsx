import { useState, useEffect } from 'react';
import { Edit, Save } from 'lucide-react';

const EditCourseModal = ({ course, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '', code: '', description: '', level: 'beginner',
        duration: 60, price: 0, discountPrice: null, status: 'DRAFT',
        objectives: '', requirements: '', thumbnailUrl: '', promoVideoUrl: ''
    });

    useEffect(() => {
        if (course) {
            setFormData(course);
        }
    }, [course]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ</label>
                            <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                                <option value="beginner">Sơ cấp</option>
                                <option value="intermediate">Trung cấp</option>
                                <option value="advanced">Cao cấp</option>
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
                        <textarea value={formData.objectives} onChange={e => setFormData({...formData, objectives: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" />
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
