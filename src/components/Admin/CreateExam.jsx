import { useState } from 'react';
import { Plus, Trash2, FileText, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * CreateExam - Component tạo đề thi
 * Priority 1: Exam System (Admin)
 */
const CreateExam = ({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        durationMinutes: 60,
        passingMarks: 60,
        totalMarks: 100,
        instructions: '',
        questions: []
    });

    const [selectedQuestions, setSelectedQuestions] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, questions: selectedQuestions });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-indigo-100">
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.createExam.heading')}</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('admin.createExam.examName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={t('admin.createExam.examNamePlaceholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('admin.createExam.course')}
                        </label>
                        <select
                            value={formData.courseId}
                            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">{t('admin.createExam.selectCourse')}</option>
                            <option value="1">TOPIK I</option>
                            <option value="2">TOPIK II</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('admin.createExam.duration')}
                        </label>
                        <input
                            type="number"
                            min="15"
                            max="180"
                            value={formData.durationMinutes}
                            onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('admin.createExam.passingMarks')}
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.passingMarks}
                            onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.createExam.description')}
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={t('admin.createExam.descriptionPlaceholder')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.createExam.instructions')}
                    </label>
                    <textarea
                        value={formData.instructions}
                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                        placeholder={t('admin.createExam.instructionsPlaceholder')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {t('admin.createExam.saveExam')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateExam;
