import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, Square, Upload, Play, Pause, Trash2, Send, AlertCircle, CheckCircle, Volume2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axiosClient from '../api/axiosClient';

/**
 * SpeakingSubmission - Gửi bài nói (Speaking Assignment)
 * Phase 1: Critical Assignments (Learner)
 *
 * Features:
 * - Ghi âm trực tiếp bằng micro
 * - Upload file audio
 * - Xem đề bài speaking
 * - Preview trước khi submit
 * - Xem lịch sử bài đã nộp
 */
const SpeakingSubmission = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(null);

    const [assignment, setAssignment] = useState(null);
    const [recordings, setRecordings] = useState([]);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionHistory, setSubmissionHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

    // Timer for recording
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    useEffect(() => {
        fetchAssignmentDetails();
        fetchSubmissionHistory();
    }, [assignmentId]);

    const fetchAssignmentDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/api/learner/speaking-assignments/${assignmentId}`);
            setAssignment(response.data);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể tải thông tin bài tập',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissionHistory = async () => {
        try {
            const response = await axiosClient.get(`/api/learner/speaking-assignments/${assignmentId}/submissions`);
            setSubmissionHistory(response.data);
        } catch (error) {
            console.error('Error fetching submission history:', error);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const newRecording = {
                    id: Date.now(),
                    blob: audioBlob,
                    url: audioUrl,
                    duration: recordingTime,
                    timestamp: new Date().toISOString()
                };
                setRecordings([...recordings, newRecording]);
                setRecordingTime(0);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi micro',
                text: 'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.',
                confirmButtonColor: '#6366f1'
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/m4a', 'audio/aac'];
        if (!validTypes.includes(file.type)) {
            Swal.fire({
                icon: 'error',
                title: 'Sai định dạng',
                text: 'Chỉ chấp nhận file audio (MP3, WAV, WEBM, M4A, AAC)',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        // Validate file size (max 20MB for speaking)
        if (file.size > 20 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'File quá lớn',
                text: 'Kích thước file không được vượt quá 20MB',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        const url = URL.createObjectURL(file);
        setUploadedFile({
            file,
            url,
            name: file.name,
            size: file.size
        });
    };

    const removeRecording = (id) => {
        setRecordings(recordings.filter(r => r.id !== id));
    };

    const removeUploadedFile = () => {
        if (uploadedFile?.url) {
            URL.revokeObjectURL(uploadedFile.url);
        }
        setUploadedFile(null);
    };

    const togglePlayback = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSubmit = async () => {
        // Validate: at least one audio
        if (recordings.length === 0 && !uploadedFile) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa có bài ghi âm',
                text: 'Vui lòng ghi âm hoặc upload file audio trước khi nộp bài',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        const result = await Swal.fire({
            icon: 'question',
            title: 'Xác nhận nộp bài?',
            text: 'Bài speaking sẽ được gửi đến giáo viên để chấm và nhận xét',
            showCancelButton: true,
            confirmButtonText: 'Nộp bài',
            cancelButtonText: 'Đợi chút',
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#6b7280'
        });

        if (!result.isConfirmed) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Add recorded audio
            if (recordings.length > 0) {
                recordings.forEach((recording, index) => {
                    formData.append('recordings', recording.blob, `recording-${index + 1}.webm`);
                });
            }

            // Add uploaded file
            if (uploadedFile) {
                formData.append('audioFile', uploadedFile.file);
            }

            await axiosClient.post(`/api/learner/speaking-assignments/${assignmentId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await Swal.fire({
                icon: 'success',
                title: 'Đã nộp bài thành công!',
                text: 'Giáo viên sẽ chấm và nhận xét trong sớm nhất',
                timer: 3000,
                showConfirmButton: false
            });

            // Clear form and refresh history
            setRecordings([]);
            setUploadedFile(null);
            fetchSubmissionHistory();
            setActiveTab('history');

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: error.response?.data?.message || 'Không thể nộp bài. Vui lòng thử lại.',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-600">Không tìm thấy bài tập</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Volume2 className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Bài Nói: {assignment.title}</h1>
                            <p className="text-sm text-gray-600">
                                Hạn nộp: {new Date(assignment.dueDate).toLocaleString('vi-VN')}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{assignment.durationMinutes}</p>
                            <p className="text-xs text-gray-600">Phút tối đa</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{assignment.maxAttempts}</p>
                            <p className="text-xs text-gray-600">Số lần nộp</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{submissionHistory.length}</p>
                            <p className="text-xs text-gray-600">Đã nộp</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                                activeTab === 'new'
                                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Send className="w-5 h-5 inline mr-2" />
                            Nộp bài mới
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                                activeTab === 'history'
                                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <CheckCircle className="w-5 h-5 inline mr-2" />
                            Lịch sử ({submissionHistory.length})
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'new' ? (
                    <div className="space-y-6">
                        {/* Assignment Prompt */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Đề bài</h2>
                            <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg">
                                <pre className="whitespace-pre-wrap font-sans text-sm">
                                    {assignment.prompt}
                                </pre>
                            </div>
                            {assignment.sampleAnswer && (
                                <details className="mt-4">
                                    <summary className="cursor-pointer text-sm font-medium text-purple-600 hover:text-purple-700">
                                        Xem gợi ý trả lời
                                    </summary>
                                    <div className="mt-2 p-3 bg-purple-50 rounded-lg text-sm text-gray-700">
                                        <pre className="whitespace-pre-wrap font-sans">
                                            {assignment.sampleAnswer}
                                        </pre>
                                    </div>
                                </details>
                            )}
                        </div>

                        {/* Recording Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                <Mic className="w-5 h-5 inline mr-2 text-purple-600" />
                                Ghi âm trực tiếp
                            </h2>

                            {/* Recording Controls */}
                            <div className="flex items-center gap-4 mb-4">
                                {!isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        disabled={submissionHistory.length >= assignment.maxAttempts}
                                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Mic className="w-5 h-5" />
                                        Bắt đầu ghi âm
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopRecording}
                                        className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors animate-pulse"
                                    >
                                        <Square className="w-5 h-5" />
                                        Dừng ghi âm ({formatTime(recordingTime)})
                                    </button>
                                )}
                                <span className="text-sm text-gray-600">
                                    Thời lượng tối đa: {assignment.durationMinutes} phút
                                </span>
                            </div>

                            {/* Recordings List */}
                            {recordings.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-gray-700">Bản ghi đã tạo ({recordings.length})</h3>
                                    {recordings.map((recording, index) => (
                                        <div key={recording.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setUploadedFile({ url: recording.url });
                                                        setTimeout(() => togglePlayback(), 100);
                                                    }}
                                                    className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"
                                                >
                                                    <Play className="w-4 h-4" />
                                                </button>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Bản ghi #{index + 1}</p>
                                                    <p className="text-xs text-gray-600">Thời lượng: {formatTime(recording.duration)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeRecording(recording.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Upload Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                <Upload className="w-5 h-5 inline mr-2 text-blue-600" />
                                Upload file audio
                            </h2>

                            {!uploadedFile ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="audio-upload"
                                    />
                                    <label
                                        htmlFor="audio-upload"
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                        <p className="text-gray-700 font-medium mb-1">Click để upload file audio</p>
                                        <p className="text-sm text-gray-500">hoặc kéo thả file vào đây</p>
                                        <p className="text-xs text-gray-400 mt-2">MP3, WAV, WEBM, M4A, AAC (max 20MB)</p>
                                    </label>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={togglePlayback}
                                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                        >
                                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                        </button>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                                            <p className="text-xs text-gray-600">{formatFileSize(uploadedFile.size)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={removeUploadedFile}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Hidden audio element for playback */}
                            {uploadedFile && (
                                <audio
                                    ref={audioRef}
                                    src={uploadedFile.url}
                                    onEnded={() => setIsPlaying(false)}
                                    className="hidden"
                                />
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || (recordings.length === 0 && !uploadedFile)}
                                className={`px-8 py-3 rounded-lg font-semibold text-white flex items-center gap-2 ${
                                    isSubmitting || (recordings.length === 0 && !uploadedFile)
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Đang nộp...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Nộp bài
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Submission History Tab */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử nộp bài</h2>
                        {submissionHistory.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Chưa có bài nộp nào</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {submissionHistory.map((submission, index) => (
                                    <div key={submission.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-gray-900">Lần nộp #{index + 1}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                submission.status === 'GRADED'
                                                    ? 'bg-green-100 text-green-700'
                                                    : submission.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {submission.status === 'GRADED' ? 'Đã chấm' : submission.status === 'PENDING' ? 'Chờ chấm' : submission.status}
                                            </span>
                                        </div>
                                        {submission.status === 'GRADED' && (
                                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-lg font-bold text-green-600">{submission.score}/10</span>
                                                    <span className="text-sm text-green-700">Điểm</span>
                                                </div>
                                                {submission.feedback && (
                                                    <div className="text-sm text-gray-700">
                                                        <p className="font-medium mb-1">Nhận xét:</p>
                                                        <p className="text-gray-600">{submission.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {submission.audioFiles && submission.audioFiles.length > 0 && (
                                            <div className="mt-3 flex gap-2">
                                                {submission.audioFiles.map((audio, idx) => (
                                                    <audio
                                                        key={idx}
                                                        src={audio.url}
                                                        controls
                                                        className="h-8"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpeakingSubmission;
