import { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, Loader2 } from 'lucide-react';
import lessonService from '../../services/lessonService';
import LessonCard from './LessonCard';
import LessonEditorModal from './LessonEditorModal';
import Swal from 'sweetalert2';

const CurriculumSection = ({ courseId }) => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);

    useEffect(() => {
        if (courseId) fetchLessons();
    }, [courseId]);

    const fetchLessons = async () => {
        try {
            setLoading(true);
            const data = await lessonService.getCourseLessons(courseId);
            const list = Array.isArray(data) ? data : (data.data || []);
            list.sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));
            setLessons(list);
        } catch (err) {
            console.error('Failed to load lessons:', err);
            setLessons([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingLesson(null);
        setEditorOpen(true);
    };

    const handleEdit = (lesson) => {
        setEditingLesson(lesson);
        setEditorOpen(true);
    };

    const handleDelete = async (lesson) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: `Xóa "${lesson.title}"?`,
            text: 'Hành động này không thể hoàn tác.',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });
        if (!result.isConfirmed) return;

        try {
            await lessonService.deleteLesson(lesson.id);
            await fetchLessons();
        } catch (err) {
            Swal.fire('Lỗi', 'Không thể xóa bài học', 'error');
        }
    };

    const handleTogglePreview = async (lesson) => {
        try {
            await lessonService.updateLesson(lesson.id, {
                ...lesson,
                course: { id: courseId },
                isPreview: !lesson.isPreview,
            });
            await fetchLessons();
        } catch (err) {
            Swal.fire('Lỗi', 'Không thể cập nhật', 'error');
        }
    };

    const handleTogglePublished = async (lesson) => {
        try {
            await lessonService.updateLesson(lesson.id, {
                ...lesson,
                course: { id: courseId },
                published: !lesson.published,
            });
            await fetchLessons();
        } catch (err) {
            Swal.fire('Lỗi', 'Không thể cập nhật', 'error');
        }
    };

    const handleMove = async (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= lessons.length) return;

        const newLessons = [...lessons];
        [newLessons[index], newLessons[newIndex]] = [newLessons[newIndex], newLessons[index]];

        // Update local state immediately
        const reordered = newLessons.map((l, i) => ({ ...l, lessonOrder: i + 1 }));
        setLessons(reordered);

        try {
            await lessonService.reorderLessons(reordered.map(l => l.id));
        } catch (err) {
            // Revert on failure
            fetchLessons();
        }
    };

    const totalDuration = lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-violet-600" />
                    <h3 className="text-base font-semibold text-gray-900">Giáo trình</h3>
                    <span className="text-xs text-gray-400">
                        {lessons.length} bài học
                        {totalDuration > 0 && (
                            <span className="ml-2 flex items-center gap-1 inline-flex">
                                <Clock className="w-3 h-3" /> {totalDuration} phút
                            </span>
                        )}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" /> Thêm bài học
                </button>
            </div>

            {/* Lesson List */}
            {lessons.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Chưa có bài học nào</p>
                    <p className="text-xs text-gray-400 mt-1">Nhấn "Thêm bài học" để bắt đầu xây dựng giáo trình</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {lessons.map((lesson, index) => (
                        <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            index={index}
                            total={lessons.length}
                            onEdit={() => handleEdit(lesson)}
                            onDelete={() => handleDelete(lesson)}
                            onTogglePreview={() => handleTogglePreview(lesson)}
                            onTogglePublished={() => handleTogglePublished(lesson)}
                            onMoveUp={() => handleMove(index, -1)}
                            onMoveDown={() => handleMove(index, 1)}
                        />
                    ))}
                </div>
            )}

            {/* Editor Modal */}
            {editorOpen && (
                <LessonEditorModal
                    courseId={courseId}
                    lesson={editingLesson
                        ? { ...editingLesson, lessonOrder: editingLesson.lessonOrder || lessons.length + 1 }
                        : { lessonOrder: lessons.length + 1 }
                    }
                    onClose={() => { setEditorOpen(false); setEditingLesson(null); }}
                    onSuccess={() => { setEditorOpen(false); setEditingLesson(null); fetchLessons(); }}
                />
            )}
        </div>
    );
};

export default CurriculumSection;
