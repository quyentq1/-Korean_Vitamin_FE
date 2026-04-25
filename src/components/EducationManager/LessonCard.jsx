import { GripVertical, Pencil, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Clock, Video, Globe, GlobeLock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LessonCard = ({ lesson, index, total, onEdit, onDelete, onTogglePreview, onTogglePublished, onMoveUp, onMoveDown }) => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-violet-200 transition-colors group">
            {/* Drag handle / Order */}
            <div className="flex flex-col items-center gap-0.5 text-gray-400">
                <GripVertical className="w-4 h-4" />
                <span className="text-xs font-medium">{lesson.lessonOrder}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{lesson.title}</h4>
                    {lesson.published && (
                        <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {t('eduManager.lessonCard.published')}
                        </span>
                    )}
                    {lesson.isPreview && (
                        <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                            {t('eduManager.lessonCard.preview')}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    {lesson.durationMinutes && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {lesson.durationMinutes} {t('common.minutes')}
                        </span>
                    )}
                    {lesson.videoUrl && (
                        <span className="flex items-center gap-1">
                            <Video className="w-3 h-3" /> {t('eduManager.lessonCard.hasVideo')}
                        </span>
                    )}
                    {lesson.description && (
                        <span className="truncate max-w-[200px]">{lesson.description}</span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    type="button"
                    onClick={onTogglePublished}
                    className={`p-1.5 rounded-lg transition-colors ${
                        lesson.published
                            ? 'text-blue-600 hover:bg-blue-50'
                            : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={lesson.published ? t('eduManager.lessonCard.unpublish') : t('eduManager.lessonCard.publish')}
                >
                    {lesson.published ? <Globe className="w-4 h-4" /> : <GlobeLock className="w-4 h-4" />}
                </button>
                <button
                    type="button"
                    onClick={onTogglePreview}
                    className={`p-1.5 rounded-lg transition-colors ${
                        lesson.isPreview
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={lesson.isPreview ? t('eduManager.lessonCard.unpreview') : t('eduManager.lessonCard.markPreview')}
                >
                    {lesson.isPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                    type="button"
                    onClick={onMoveUp}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-20 transition-colors"
                    title={t('eduManager.lessonCard.moveUp')}
                >
                    <ChevronUp className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={onMoveDown}
                    disabled={index === total - 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-20 transition-colors"
                    title={t('eduManager.lessonCard.moveDown')}
                >
                    <ChevronDown className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={onEdit}
                    className="p-1.5 rounded-lg text-violet-600 hover:bg-violet-50 transition-colors"
                    title={t('eduManager.lessonCard.edit')}
                >
                    <Pencil className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title={t('eduManager.lessonCard.delete')}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default LessonCard;
