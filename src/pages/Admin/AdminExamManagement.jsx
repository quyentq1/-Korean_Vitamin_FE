import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Eye, Lock, Unlock, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

/**
 * AdminExamManagement - Quản lý đề thi cho Admin
 * Priority 1: Exam System
 */
const AdminExamManagement = () => {
    const { t } = useTranslation();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PUBLISHED, DRAFT, ARCHIVED

    const fetchExams = async () => {
        setLoading(true);
        // Fetch from API
        setLoading(false);
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleDelete = async (exam) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: t('admin.examManagement.deleteExam'),
            text: t('admin.examManagement.confirmDelete', { title: exam.title }),
            showCancelButton: true,
            confirmButtonText: t('common.delete'),
            cancelButtonText: t('common.cancel'),
            confirmButtonColor: '#ef4444'
        });

        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: t('admin.examManagement.deleted'),
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    const handleTogglePublish = async (exam) => {
        const actionKey = exam.published ? 'admin.examManagement.unpublish' : 'admin.examManagement.publish';
        const result = await Swal.fire({
            icon: 'question',
            title: t(actionKey),
            showCancelButton: true,
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel')
        });

        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: t('common.success'),
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('admin.examManagement.title')}</h1>
                    <p className="text-gray-600 mt-1">{t('admin.examManagement.subtitle')}</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {t('admin.examManagement.createNew')}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex gap-3">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        {t('admin.examManagement.filterAll')}
                    </button>
                    <button
                        onClick={() => setFilter('PUBLISHED')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'PUBLISHED' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        {t('admin.examManagement.filterPublished')}
                    </button>
                    <button
                        onClick={() => setFilter('DRAFT')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'DRAFT' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        {t('admin.examManagement.filterDraft')}
                    </button>
                    <button
                        onClick={() => setFilter('ARCHIVED')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'ARCHIVED' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        {t('admin.examManagement.filterArchived')}
                    </button>
                </div>
            </div>

            {/* Exams List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {exams.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">{t('admin.examManagement.noExams')}</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">{t('admin.examManagement.colExamName')}</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">{t('admin.examManagement.colCourse')}</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">{t('admin.examManagement.colQuestions')}</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">{t('admin.examManagement.colDuration')}</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">{t('admin.examManagement.colStatus')}</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">{t('admin.examManagement.colActions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {exams.map((exam) => (
                                <tr key={exam.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{exam.title}</p>
                                        <p className="text-sm text-gray-500">{exam.description}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{exam.courseName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{exam.totalQuestions}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{exam.durationMinutes} {t('admin.examManagement.minutes')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            exam.published ? 'bg-green-100 text-green-700' :
                                            exam.archived ? 'bg-gray-100 text-gray-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {exam.published ? t('admin.examManagement.statusPublished') : exam.archived ? t('admin.examManagement.statusArchived') : t('admin.examManagement.statusDraft')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-gray-600 hover:text-indigo-600" title={t('common.view')}>
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-600 hover:text-blue-600" title={t('common.edit')}>
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleTogglePublish(exam)}
                                                className="p-2 text-gray-600 hover:text-yellow-600"
                                                title={exam.published ? t('admin.examManagement.unpublish') : t('admin.examManagement.publish')}
                                            >
                                                {exam.published ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(exam)}
                                                className="p-2 text-gray-600 hover:text-red-600"
                                                title={t('common.delete')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminExamManagement;
