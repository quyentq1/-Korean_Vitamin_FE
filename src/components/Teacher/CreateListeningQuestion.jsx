import { useState, useEffect } from 'react';
import { Upload, Mic, Play, Pause, Trash2, X } from 'lucide-react';

/**
 * CreateListeningQuestion - Component tạo câu hỏi nghe hiểu với upload audio
 * Priority 1: Question Bank
 */
const CreateListeningQuestion = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        questionText: '',
        audioUrl: '',
        transcript: '',
        category: 'Listening',
        difficulty: 'MEDIUM',
        points: 2,
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        tags: []
    });

    const [audioFile, setAudioFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            if (initialData.audioUrl) {
                setAudioFile(initialData.audioUrl);
            }
        }
    }, [initialData]);

    const handleAudioUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/aac'];
        if (!validTypes.includes(file.type)) {
            setErrors({ audio: 'Chỉ chấp nhận file audio (MP3, WAV, M4A, AAC)' });
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setErrors({ audio: 'Kích thước file không được vượt quá 10MB' });
            return;
        }

        setErrors({});
        setUploading(true);
        setAudioFile(file);

        try {
            // In real implementation, upload to server
            // const response = await teacherService.uploadAudio(file);
            // setFormData({ ...formData, audioUrl: response.data.url });

            // For now, create a local URL
            const localUrl = URL.createObjectURL(file);
            setFormData({ ...formData, audioUrl: localUrl });
        } catch (error) {
            console.error('Error uploading audio:', error);
            setErrors({ audio: 'Không thể upload file audio' });
        } finally {
            setUploading(false);
        }
    };

    const removeAudio = () => {
        setAudioFile(null);
        setFormData({ ...formData, audioUrl: '' });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const setCorrectAnswer = (index) => {
        setFormData({ ...formData, correctAnswer: formData.options[index] });
    };

    const togglePlay = () => {
        const audio = document.getElementById('audio-preview');
        if (audio) {
            if (playing) {
                audio.pause();
            } else {
                audio.play();
            }
            setPlaying(!playing);
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.questionText.trim()) {
            newErrors.questionText = 'Vui lòng nhập nội dung câu hỏi';
        }

        if (!formData.audioUrl && !audioFile) {
            newErrors.audio = 'Vui lòng upload file audio';
        }

        const validOptions = formData.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
            newErrors.options = 'Cần ít nhất 2 đáp án';
        }

        if (!formData.correctAnswer) {
            newErrors.correctAnswer = 'Vui lòng chọn đáp án đúng';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            onSubmit({
                ...formData,
                questionType: 'LISTENING'
            });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                        <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Tạo Câu Hỏi Nghe Hiểu
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Upload audio và tạo câu hỏi nghe hiểu
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Audio Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        File Audio <span className="text-red-500">*</span>
                    </label>

                    {!audioFile && !formData.audioUrl ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
                            <input
                                type="file"
                                id="audio-upload"
                                accept="audio/*"
                                onChange={handleAudioUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                            <label
                                htmlFor="audio-upload"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                                    <Upload className="w-8 h-8 text-orange-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                    Click để upload file audio
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    MP3, WAV, M4A, AAC (tối đa 10MB)
                                </p>
                            </label>
                        </div>
                    ) : (
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <button
                                        type="button"
                                        onClick={togglePlay}
                                        className="p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors"
                                    >
                                        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    </button>
                                    <div className="flex-1">
                                        <audio
                                            id="audio-preview"
                                            src={formData.audioUrl}
                                            onEnded={() => setPlaying(false)}
                                            className="hidden"
                                        />
                                        <p className="text-sm font-medium text-gray-900">
                                            {audioFile?.name || 'Audio đã upload'}
                                        </p>
                                        {audioFile?.size && (
                                            <p className="text-xs text-gray-600">
                                                {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeAudio}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {errors.audio && (
                        <p className="text-sm text-red-600 mt-2">{errors.audio}</p>
                    )}
                </div>

                {/* Transcript */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transcript (Nội dung audio) - Optional
                    </label>
                    <textarea
                        value={formData.transcript}
                        onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                        placeholder="Nhập nội dung transcript của audio..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Transcript giúp học viên review lại sau khi làm bài
                    </p>
                </div>

                {/* Question Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Câu hỏi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.questionText}
                        onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                        placeholder="VD: Người nói đang làm gì? / Họ đang ở đâu? / Từ nào được nhắc đến?"
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                            errors.questionText ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.questionText && (
                        <p className="text-sm text-red-600 mt-1">{errors.questionText}</p>
                    )}
                </div>

                {/* Difficulty & Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Độ khó
                        </label>
                        <select
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="EASY">Dễ</option>
                            <option value="MEDIUM">Trung bình</option>
                            <option value="HARD">Khó</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điểm
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={formData.points}
                            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                </div>

                {/* Options */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đáp án <span className="text-red-500">*</span>
                    </label>

                    <div className="space-y-3">
                        {formData.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCorrectAnswer(index)}
                                    className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        formData.correctAnswer === option
                                            ? 'bg-orange-500 border-orange-500 text-white'
                                            : 'border-gray-300 hover:border-orange-500'
                                    }`}
                                >
                                    {formData.correctAnswer === option ? '✓' : index + 1}
                                </button>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Đáp án ${index + 1}`}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        ))}
                    </div>

                    {errors.options && (
                        <p className="text-sm text-red-600 mt-2">{errors.options}</p>
                    )}

                    {errors.correctAnswer && (
                        <p className="text-sm text-red-600 mt-2">{errors.correctAnswer}</p>
                    )}
                </div>

                {/* Explanation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giải thích (Optional)
                    </label>
                    <textarea
                        value={formData.explanation}
                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        placeholder="Giải thích tại sao đáp án này đúng..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (Optional)
                    </label>
                    <input
                        type="text"
                        value={formData.tags.join(', ')}
                        onChange={(e) => setFormData({
                            ...formData,
                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        })}
                        placeholder="VD: conversation, directions, numbers"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>

                {/* Tips */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Mẹo tạo câu hỏi nghe hiểu</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Chọn audio ngắn (30-60 giây) cho câu hỏi đơn</li>
                        <li>• Audio nên rõ nét, không bị tạp âm</li>
                        <li>• Transcript nên được cung cấp để học viên review</li>
                        <li>• Câu hỏi nên tập trung vào thông tin chính</li>
                        <li>• Có thể tạo nhiều câu hỏi cho cùng một audio</li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={uploading}
                        className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang upload...
                            </>
                        ) : (
                            'Lưu Câu Hỏi'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateListeningQuestion;
