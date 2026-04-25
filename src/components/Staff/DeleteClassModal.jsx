import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, AlertTriangle, AlertOctagon, Users, Calendar, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';
import staffService from '../../services/staffService';
import educationManagerService from '../../services/educationManagerService';

/**
 * DeleteClassModal - Modal xác nhận xóa lớp học
 * @param {Object} classData - Thông tin lớp học cần xóa
 * @param {Function} onClose - Đóng modal
 * @param {Function} onSuccess - Callback khi xóa thành công
 */
const DeleteClassModal = ({ classData, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const isManager = user?.role === 'EDUCATION_MANAGER';
    const [deleting, setDeleting] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');

    // Count active students
    const activeStudentCount = classData?.students?.filter(s => s.status === 'ACTIVE').length ||
                              classData?.currentEnrollment ||
                              classData?.studentCount ||
                              0;

    const handleDelete = async () => {
        // Validate confirmation text
        if (confirmText !== 'DELETE') {
            setError(t('staff.deleteClass.confirmRequired'));
            return;
        }

        setDeleting(true);
        setError('');

        try {
            // Use appropriate service based on user role
            const service = isManager ? educationManagerService : staffService;
            await service.deleteClass(classData.id);

            // Show success message
            await Swal.fire({
                icon: 'success',
                title: t('class.delete.success', 'Đã Xóa Lớp Học!'),
                text: t('class.delete.successMessage', 'Lớp học đã được xóa thành công.'),
                confirmButtonColor: '#10b981',
            });

            // Call success callback
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Error deleting class:', err);
            const errorMessage = err.response?.data?.message || err.message || t('class.delete.error', 'Không thể xóa lớp học. Vui lòng thử lại.');
            setError(errorMessage);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{t('staff.deleteClass.title')}</h3>
                            <p className="text-sm text-gray-600">
                                {classData?.className || classData?.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Active Students Warning */}
                    {activeStudentCount > 0 && (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-semibold mb-1">{t('staff.deleteClass.hasStudentsWarning')}</p>
                                    <p className="text-yellow-700">
                                        {t('staff.deleteClass.hasStudentsDetail', 'Lớp này hiện tại có {{count}} học viên đang học.', { count: activeStudentCount })}
                                    </p>
                                    <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                                        <p className="font-medium">{t('staff.deleteClass.stepsTitle')}</p>
                                        <ol className="list-decimal list-inside mt-1 space-y-1">
                                            <li>{t('staff.deleteClass.step1')}</li>
                                            <li>{t('staff.deleteClass.step2')}</li>
                                            <li>{t('staff.deleteClass.step3')}</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Warning Message */}
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-800">
                                <p className="font-semibold mb-1">{t('staff.deleteClass.importantWarning')}</p>
                                <p className="text-red-700">
                                    {t('staff.deleteClass.irreversibleAction')}
                                </p>
                                <ul className="list-disc list-inside mt-2 text-red-700 space-y-1">
                                    <li>{t('staff.deleteClass.willDeleteStudentList')}</li>
                                    <li>{t('staff.deleteClass.willDeleteTeachers')}</li>
                                    <li>{t('staff.deleteClass.willDeleteSchedules')}</li>
                                    <li>{t('staff.deleteClass.willDeleteAttendance')}</li>
                                    <li>{t('staff.deleteClass.willDeleteExams')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('staff.deleteClass.typeToDelete')} <span className="font-mono font-bold text-red-600">DELETE</span> {t('staff.deleteClass.toConfirm')}
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder={t('staff.deleteClass.typeDeletePlaceholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 uppercase"
                            disabled={deleting}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {t('staff.deleteClass.affectStudents', 'Hành động này sẽ ảnh hưởng đến {{count}} học viên.', { count: classData?.studentCount || 0 })}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Class Info */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-sm space-y-1">
                            <p><span className="font-medium">{t('staff.deleteClass.classCode')}:</span> {classData?.classCode || classData?.code}</p>
                            <p><span className="font-medium">{t('staff.deleteClass.course')}:</span> {classData?.courseName || classData?.course?.name}</p>
                            <p><span className="font-medium">{t('staff.deleteClass.teacher')}:</span> {classData?.teacherName || classData?.teacher?.fullName || t('staff.deleteClass.notAssigned')}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={deleting}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('staff.deleteClass.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting || confirmText !== 'DELETE' || activeStudentCount > 0}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            title={activeStudentCount > 0 ? t('staff.deleteClass.cannotDeleteWithStudents') : ''}
                        >
                            {deleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {t('staff.deleteClass.deleting')}
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    {t('staff.deleteClass.submit')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteClassModal;
