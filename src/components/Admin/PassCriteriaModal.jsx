import { useState, useEffect } from 'react';
import { Award, Users, CheckCircle, Info } from 'lucide-react';

/**
 * PassCriteriaModal - Modal for managing course pass criteria
 * @param {Object} course - Course object
 * @param {Function} onClose - Close modal
 * @param {Function} onSave - Save callback
 */
const PassCriteriaModal = ({ course, onClose, onSave }) => {
    const [criteria, setCriteria] = useState({
        passingScore: 70,
        requiredAttendance: 80,
        requiredExams: [],
        certificateCriteria: '',
        canEarnCertificate: true,
        certificateType: 'TOPIK'
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Load existing criteria if available
        if (course?.passCriteria) {
            setCriteria(course.passCriteria);
        }
    }, [course]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await onSave(criteria);
            onClose();
        } catch (error) {
            console.error('Error saving pass criteria:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Award className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Tiêu Chí Qua Môn</h3>
                            <p className="text-sm text-gray-600">{course?.name || course?.className}</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Passing Score */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Điểm qua môn (%)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={criteria.passingScore}
                                onChange={(e) => setCriteria({ ...criteria, passingScore: parseInt(e.target.value) })}
                                className="flex-1"
                            />
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={criteria.passingScore}
                                onChange={(e) => setCriteria({ ...criteria, passingScore: parseInt(e.target.value) })}
                                className="w-20 px-3 py-2 border rounded-lg text-center font-semibold"
                            />
                            <span className="text-sm text-gray-500">%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Học viên cần đạt ít nhất {criteria.passingScore}% điểm tổng kết để qua môn
                        </p>
                    </div>

                    {/* Required Attendance */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            Số buổi điểm danh bắt buộc (%)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={criteria.requiredAttendance}
                                onChange={(e) => setCriteria({ ...criteria, requiredAttendance: parseInt(e.target.value) })}
                                className="flex-1"
                            />
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={criteria.requiredAttendance}
                                onChange={(e) => setCriteria({ ...criteria, requiredAttendance: parseInt(e.target.value) })}
                                className="w-20 px-3 py-2 border rounded-lg text-center font-semibold"
                            />
                            <span className="text-sm text-gray-500">%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Học viên phải điểm danh ít nhất {criteria.requiredAttendance}% số buổi học
                        </p>
                    </div>

                    {/* Certificate Info */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Điều kiện cấp chứng chỉ
                                </label>
                                <textarea
                                    value={criteria.certificateCriteria}
                                    onChange={(e) => setCriteria({ ...criteria, certificateCriteria: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white"
                                    placeholder="VD: Hoàn thành tất cả bài kiểm tra với điểm trung bình ≥ 70%, điểm danh ≥ 80%..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Xem trước điều kiện qua môn:</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Điểm qua môn:</span>
                                <span className="font-semibold text-green-600">{criteria.passingScore}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Điểm danh tối thiểu:</span>
                                <span className="font-semibold text-blue-600">{criteria.requiredAttendance}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Cấp chứng chỉ:</span>
                                <span className={`font-semibold ${criteria.certificateCriteria ? 'text-purple-600' : 'text-gray-400'}`}>
                                    {criteria.certificateCriteria ? 'Có' : 'Không'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Award className="w-4 h-4" />
                            {saving ? 'Đang lưu...' : 'Lưu tiêu chí'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PassCriteriaModal;
