import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Shuffle, PlusCircle, Trash2, Check } from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';
import Swal from 'sweetalert2';

const EduTestEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isEdit = Boolean(id);
    const prefillCourseId = searchParams.get('courseId');

    const [saving, setSaving] = useState(false);
    const [allQuestions, setAllQuestions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [randomCount, setRandomCount] = useState(10);
    const [selectionMode, setSelectionMode] = useState('custom'); // 'custom' | 'random'
    const [searchQ, setSearchQ] = useState('');
    const [form, setForm] = useState({
        title: '', courseId: prefillCourseId || '', duration: 30,
        passingScore: 70, description: '', shuffleQuestions: false,
        skillType: 'MIXED',
    });

    // Map skillType to question types
    const skillTypeQuestionTypes = {
        'LISTENING': ['LISTENING'],
        'WRITING': ['WRITING', 'ESSAY'],
        'READING': ['READING'],
        'SPEAKING': ['SPEAKING'],
        'MIXED': ['MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'FILL_BLANK', 'READING', 'WRITING', 'SHORT_ANSWER', 'ESSAY', 'LISTENING', 'SPEAKING']
    };

    useEffect(() => {
        Promise.all([
            educationManagerService.getAllCourses(),
            educationManagerService.getAllQuestions().catch(() => []),
        ]).then(([cs, qs]) => {
            setCourses(Array.isArray(cs) ? cs : []);
            setAllQuestions(Array.isArray(qs) ? qs : []);
        }).catch(console.error);

        if (isEdit) {
            educationManagerService.getExamById(id)
                .then(data => {
                    setForm({
                        title: data.title || '',
                        courseId: data.course?.id || data.courseId || '',
                        duration: data.durationMinutes || data.duration || 30,
                        passingScore: data.passingScore || 70,
                        description: data.description || '',
                        shuffleQuestions: data.shuffleQuestions || false,
                        skillType: data.skillType || 'MIXED'
                    });
                    if (data.examQuestions) setSelectedQuestions(data.examQuestions.map(q => q.question?.id || q.id));
                })
                .catch(() => Swal.fire('Lỗi', 'Không tìm thấy bài test', 'error'));
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value) }));
    };

    const toggleQuestion = (qId) => {
        setSelectedQuestions(prev => prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]);
    };

    const handleRandomPick = () => {
        const shuffled = [...filteredQ].sort(() => Math.random() - 0.5);
        const count = Math.min(randomCount, shuffled.length);
        setSelectedQuestions(shuffled.slice(0, count).map(q => q.id));
        Swal.fire({ icon: 'success', title: `Đã chọn ngẫu nhiên ${count} câu!`, toast: true, timer: 1500, showConfirmButton: false, position: 'top-end' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title) return Swal.fire('Thiếu thông tin', 'Vui lòng nhập tên bài test', 'warning');
        if (selectedQuestions.length === 0) return Swal.fire('Thiếu câu hỏi', 'Vui lòng chọn ít nhất 1 câu hỏi', 'warning');

        setSaving(true);
        try {
            const payload = {
                exam: {
                    title: form.title,
                    description: form.description,
                    durationMinutes: form.duration,
                    totalQuestions: selectedQuestions.length,
                    passingScore: form.passingScore,
                    shuffleQuestions: form.shuffleQuestions,
                    skillType: form.skillType,
                    course: form.courseId ? { id: Number(form.courseId) } : null
                },
                questions: selectedQuestions.map((qId, index) => {
                    const qObj = allQuestions.find(q => q.id === qId);
                    return {
                        question: qObj,
                        questionOrder: index + 1,
                        points: qObj?.points || 1
                    };
                }),
            };
            if (isEdit) {
                await educationManagerService.updateExam(id, payload.exam);
            } else {
                await educationManagerService.createExam(payload);
            }
            Swal.fire('Thành công!', isEdit ? 'Đã cập nhật bài test' : 'Đã tạo bài test mới', 'success');
            navigate('/edu-manager/tests');
        } catch (e) {
            Swal.fire('Lỗi', 'Không thể lưu bài test', 'error');
        } finally {
            setSaving(false);
        }
    };

    const filteredQ = allQuestions.filter(q => {
        // Filter by skillType first
        const allowedTypes = skillTypeQuestionTypes[form.skillType] || skillTypeQuestionTypes['MIXED'];
        const questionType = q.type || q.questionType;
        if (!allowedTypes.includes(questionType)) return false;

        // Then filter by search text
        return q.content?.toLowerCase().includes(searchQ.toLowerCase()) ||
               q.questionText?.toLowerCase().includes(searchQ.toLowerCase());
    });

    return (
        <div className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft className="w-5 h-5" /></button>
                <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Sửa bài test' : 'Tạo bài test mới'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left: Test info */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                        <h2 className="font-semibold text-gray-800">Thông tin bài test</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài test *</label>
                            <input name="title" value={form.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none" placeholder="VD: Kiểm tra giữa khóa..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Khóa học</label>
                            <select name="courseId" value={form.courseId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none">
                                <option value="">-- Chọn khóa học --</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại bài test *</label>
                            <select name="skillType" value={form.skillType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none">
                                <option value="MIXED">Tổng hợp (nhiều kỹ năng)</option>
                                <option value="LISTENING">Bài test Nghe</option>
                                <option value="WRITING">Bài test Viết</option>
                                <option value="READING">Bài test Đọc hiểu</option>
                                <option value="SPEAKING">Bài test Nói</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
                                <input type="number" name="duration" value={form.duration} onChange={handleChange} min={1} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đạt (%)</label>
                                <input type="number" name="passingScore" value={form.passingScore} onChange={handleChange} min={0} max={100} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none resize-none" />
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="shuffle" name="shuffleQuestions" checked={form.shuffleQuestions} onChange={handleChange} className="w-4 h-4 accent-green-600" />
                            <label htmlFor="shuffle" className="text-sm text-gray-700">Trộn thứ tự câu hỏi</label>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-3">Đã chọn: <span className="font-semibold text-green-700">{selectedQuestions.length}</span> câu hỏi</p>
                            <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-60 font-medium text-sm">
                                <Save className="w-4 h-4" />
                                {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo bài test')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Question picker */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-800">Chọn câu hỏi</h2>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setSelectionMode('custom')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectionMode === 'custom' ? 'bg-green-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                    <PlusCircle className="w-3.5 h-3.5 inline mr-1" /> Chọn thủ công
                                </button>
                                <button type="button" onClick={() => setSelectionMode('random')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectionMode === 'random' ? 'bg-violet-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                    <Shuffle className="w-3.5 h-3.5 inline mr-1" /> Random
                                </button>
                            </div>
                        </div>

                        {selectionMode === 'random' && (
                            <div className="flex gap-3 items-center mb-4 p-3 bg-violet-50 rounded-xl">
                                <label className="text-sm font-medium text-violet-700 shrink-0">Số câu random:</label>
                                <input type="number" value={randomCount} onChange={e => setRandomCount(Number(e.target.value))} min={1} max={filteredQ.length}
                                    className="w-20 px-2 py-1.5 border border-violet-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-400 bg-white" />
                                <button type="button" onClick={handleRandomPick} className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
                                    <Shuffle className="w-4 h-4" /> Random ngay
                                </button>
                                <span className="text-xs text-violet-500">/{filteredQ.length} câu có sẵn (loại: {form.skillType === 'MIXED' ? 'Tất cả' : form.skillType})</span>
                            </div>
                        )}

                        <input type="text" placeholder="Tìm câu hỏi..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none mb-3" />

                        {allQuestions.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">
                                <p>Chưa có câu hỏi trong ngân hàng</p>
                                <p className="mt-1 text-xs">Teacher cần tạo câu hỏi trong Question Bank trước</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                                {filteredQ.map((q, idx) => {
                                    const isSelected = selectedQuestions.includes(q.id);
                                    return (
                                        <div
                                            key={q.id}
                                            onClick={() => selectionMode === 'custom' && toggleQuestion(q.id)}
                                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${selectionMode === 'custom' ? 'cursor-pointer' : 'cursor-default'} ${isSelected ? 'border-green-200 bg-green-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-gray-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: q.content || q.questionText || `Câu hỏi #${idx + 1}` }} />
                                                {q.imageUrl && (
                                                    <div className="mt-1 text-xs text-blue-500 font-medium flex items-center gap-1">
                                                        🖼️ Có hình ảnh đính kèm
                                                    </div>
                                                )}
                                                {q.type && <span className="text-xs text-gray-400 mt-0.5 inline-block">{q.type}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EduTestEditor;
