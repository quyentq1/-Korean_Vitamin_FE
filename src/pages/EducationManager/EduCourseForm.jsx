import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';
import Swal from 'sweetalert2';

const EduCourseForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '', code: '', description: '', price: 0, discountPrice: 0,
        duration: '', capacity: '', fee: 0, objectives: '', requirements: '',
        promoVideoUrl: '', schedule: '', startDate: '', endDate: '', active: true,
    });

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            educationManagerService.getCourseById(id)
                .then(data => setForm({ ...data }))
                .catch(() => Swal.fire('Lỗi', 'Không tìm thấy khóa học', 'error'))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.code) {
            Swal.fire('Thiếu thông tin', 'Vui lòng nhập tên và mã khóa học', 'warning');
            return;
        }
        if (!form.capacity || Number(form.capacity) <= 0) {
            Swal.fire('Thiếu thông tin', 'Vui lòng nhập sĩ số tối đa', 'warning');
            return;
        }
        setSaving(true);
        try {
            // Ensure numeric fields are numbers, not empty strings
            const payload = {
                ...form,
                fee: Number(form.fee) || 0,
                capacity: Number(form.capacity),
                price: Number(form.price) || 0,
                discountPrice: Number(form.discountPrice) || 0,
                duration: Number(form.duration) || null,
                startDate: form.startDate || null,
                endDate: form.endDate || null,
            };
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
        { name: 'name', label: 'Tên khóa học *', type: 'text', span: 2, placeholder: 'VD: TOPIK I - Level 1' },
        { name: 'code', label: 'Mã khóa học *', type: 'text', placeholder: 'VD: TOPIK-I-L1' },
        { name: 'capacity', label: 'Sĩ số tối đa *', type: 'number', placeholder: 'VD: 30' },
        { name: 'fee', label: 'Học phí (₫) *', type: 'number', placeholder: 'VD: 2000000' },
        { name: 'price', label: 'Giá niêm yết (₫)', type: 'number', placeholder: 'VD: 2500000' },
        { name: 'discountPrice', label: 'Giá ưu đãi (₫)', type: 'number', placeholder: 'VD: 1800000' },
        { name: 'duration', label: 'Thời lượng (giờ)', type: 'number', placeholder: 'VD: 60' },
        { name: 'schedule', label: 'Lịch học', type: 'text', placeholder: 'VD: Thứ 2, 4, 6 - 18:00-20:00' },
        { name: 'startDate', label: 'Ngày bắt đầu', type: 'date' },
        { name: 'endDate', label: 'Ngày kết thúc', type: 'date' },
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                            <input
                                type={f.type}
                                name={f.name}
                                value={form[f.name] ?? ''}
                                onChange={handleChange}
                                placeholder={f.placeholder || ''}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none"
                            />
                        </div>
                    ))}

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea name="description" value={form.description || ''} onChange={handleChange} rows={4}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none" />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu khóa học</label>
                        <textarea name="objectives" value={form.objectives || ''} onChange={handleChange} rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none" />
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
