import { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Link, Upload, Film } from 'lucide-react';
import lessonService from '../../services/lessonService';
import TipTapEditor from './TipTapEditor';
import Swal from 'sweetalert2';

const LessonEditorModal = ({ courseId, lesson, onClose, onSuccess }) => {
    const isEdit = Boolean(lesson?.id);
    const [saving, setSaving] = useState(false);
    const [videoMode, setVideoMode] = useState('none'); // 'none' | 'url' | 'upload'
    const [uploading, setUploading] = useState(false);
    const videoFileRef = useRef(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        content: '',
        videoUrl: '',
        durationMinutes: '',
        isPreview: false,
        published: false,
        lessonOrder: 1,
    });

    useEffect(() => {
        if (lesson) {
            const url = lesson.videoUrl || '';
            setForm({
                title: lesson.title || '',
                description: lesson.description || '',
                content: lesson.content || '',
                videoUrl: url,
                durationMinutes: lesson.durationMinutes || '',
                isPreview: lesson.isPreview || false,
                published: lesson.published || false,
                lessonOrder: lesson.lessonOrder || 1,
            });
            if (url) {
                // Cloudinary URLs mean uploaded, otherwise it's a link
                setVideoMode(url.includes('cloudinary.com') ? 'upload' : 'url');
            }
        }
    }, [lesson]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            Swal.fire('Lỗi', 'Chỉ chấp nhận file video', 'error');
            return;
        }
        if (file.size > 100 * 1024 * 1024) {
            Swal.fire('Lỗi', 'Video không được vượt quá 100MB', 'error');
            return;
        }

        setUploading(true);
        try {
            const data = await lessonService.uploadLessonVideo(file);
            setForm(prev => ({ ...prev, videoUrl: data.url }));
        } catch (err) {
            Swal.fire('Lỗi', 'Không thể upload video', 'error');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const removeVideo = () => {
        setForm(prev => ({ ...prev, videoUrl: '' }));
        setVideoMode('none');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            Swal.fire('Thiếu thông tin', 'Vui lòng nhập tiêu đề bài học', 'warning');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description || null,
                content: form.content || '',
                videoUrl: form.videoUrl || null,
                durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : null,
                isPreview: form.isPreview,
                published: form.published,
                lessonOrder: form.lessonOrder,
                active: true,
                course: { id: courseId },
            };

            if (isEdit) {
                await lessonService.updateLesson(lesson.id, payload);
            } else {
                await lessonService.createLesson(payload);
            }

            Swal.fire({
                icon: 'success',
                title: isEdit ? 'Đã cập nhật bài học' : 'Đã thêm bài học',
                timer: 1500,
                showConfirmButton: false,
            });
            onSuccess?.();
        } catch (err) {
            Swal.fire('Lỗi', err?.response?.data?.message || 'Không thể lưu bài học', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">
                        {isEdit ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
                    </h2>
                    <button onClick={onClose} disabled={saving}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tiêu đề <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="VD: Bài 1 - Nguyên âm cơ bản"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                            <input
                                type="text"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Tóm tắt nội dung bài học..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (phút)</label>
                            <input
                                type="number"
                                name="durationMinutes"
                                value={form.durationMinutes}
                                onChange={handleChange}
                                placeholder="60"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none"
                            />
                        </div>
                    </div>

                    {/* Video Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                            <Film className="w-4 h-4" /> Video bài học
                        </label>

                        {form.videoUrl ? (
                            /* Already has video */
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 truncate max-w-[80%]">{form.videoUrl}</span>
                                    <button type="button" onClick={removeVideo}
                                        className="text-xs text-red-500 hover:text-red-700 shrink-0">Xóa video</button>
                                </div>
                                {form.videoUrl.match(/\.(mp4|webm|ogg)($|\?)/i) && (
                                    <video src={form.videoUrl} controls className="w-full max-h-48 rounded-lg" />
                                )}
                            </div>
                        ) : (
                            /* No video yet - show mode selection */
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <button type="button"
                                        onClick={() => setVideoMode('url')}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
                                            videoMode === 'url' ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}>
                                        <Link className="w-4 h-4" /> Dán link
                                    </button>
                                    <button type="button"
                                        onClick={() => setVideoMode('upload')}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
                                            videoMode === 'upload' ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}>
                                        <Upload className="w-4 h-4" /> Upload file
                                    </button>
                                </div>

                                {videoMode === 'url' && (
                                    <input
                                        type="text"
                                        name="videoUrl"
                                        value={form.videoUrl}
                                        onChange={handleChange}
                                        placeholder="https://youtube.com/watch?v=... hoặc link video mp4"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none"
                                    />
                                )}

                                {videoMode === 'upload' && (
                                    <div className="space-y-2">
                                        <input
                                            ref={videoFileRef}
                                            type="file"
                                            accept="video/*"
                                            onChange={handleVideoUpload}
                                            disabled={uploading}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 disabled:opacity-50"
                                        />
                                        {uploading && (
                                            <div className="flex items-center gap-2 text-sm text-violet-600">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Đang upload video...
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-400">MP4, WebM, OGG. Tối đa 100MB</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="published"
                                name="published"
                                checked={form.published}
                                onChange={handleChange}
                                className="w-4 h-4 accent-blue-600"
                            />
                            <label htmlFor="published" className="text-sm text-gray-700">
                                Xuất bản bài học
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isPreview"
                                name="isPreview"
                                checked={form.isPreview}
                                onChange={handleChange}
                                className="w-4 h-4 accent-violet-600"
                            />
                            <label htmlFor="isPreview" className="text-sm text-gray-700">
                                Cho phép xem trước (hiện cho khách)
                            </label>
                        </div>
                    </div>

                    {/* TipTap Editor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nội dung bài học
                        </label>
                        <TipTapEditor
                            content={form.content}
                            onChange={(html) => setForm(prev => ({ ...prev, content: html }))}
                            placeholder="Nhập nội dung bài học. Hỗ trợ văn bản, hình ảnh, video, danh sách..."
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || uploading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-60 text-sm font-medium"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm bài học')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LessonEditorModal;
