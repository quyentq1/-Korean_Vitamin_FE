import { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import lessonService from '../../services/lessonService';
import LessonCard from './LessonCard';
import LessonEditorModal from './LessonEditorModal';
import Swal from 'sweetalert2';

const CurriculumSection = ({ courseId, onLessonsChange }) => {
    const { t } = useTranslation();
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
            const data = await lessonService.getAllCourseLessons(courseId);
            const list = Array.isArray(data) ? data : (data.data || []);
            list.sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));
            setLessons(list);
            onLessonsChange?.(list.length);
        } catch (err) {
            console.error('Failed to load lessons:', err);
            setLessons([]);
            onLessonsChange?.(0);
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
            title: t('eduManager.curriculum.deleteConfirm', { title: lesson.title }),
            text: t('common.irreversible'),
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: t('common.delete'),
            cancelButtonText: t('common.cancel'),
        });
        if (!result.isConfirmed) return;

        try {
            await lessonService.deleteLesson(lesson.id);
            await fetchLessons();
        } catch (err) {
            Swal.fire(t('common.error'), t('eduManager.curriculum.deleteError'), 'error');
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
            Swal.fire(t('common.error'), t('eduManager.curriculum.updateError'), 'error');
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
            Swal.fire(t('common.error'), t('eduManager.curriculum.updateError'), 'error');
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
                    <h3 className="text-base font-semibold text-gray-900">{t('eduManager.curriculum.title')}</h3>
                    <span className="text-xs text-gray-400">
                        {lessons.length} {t('eduManager.curriculum.lessons')}
                        {totalDuration > 0 && (
                            <span className="ml-2 flex items-center gap-1 inline-flex">
                                <Clock className="w-3 h-3" /> {totalDuration} {t('common.minutes')}
                            </span>
                        )}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" /> {t('eduManager.curriculum.addLesson')}
                </button>
            </div>

            {/* Lesson List */}
            {lessons.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{t('eduManager.curriculum.noLessons')}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('eduManager.curriculum.addLessonHint')}</p>
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
