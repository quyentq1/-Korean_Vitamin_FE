import { useTranslation } from 'react-i18next';
import { Award, Users, CheckCircle, AlertCircle } from 'lucide-react';

const PassCriteriaCard = ({ passCriteria, className = '' }) => {
    const { t } = useTranslation();
    if (!passCriteria) {
        return null;
    }

    const { passingScore, requiredAttendance, certificateCriteria } = passCriteria;

    return (
        <div className={'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5 ' + className}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('component.passCriteriaCard.title')}</h3>
                    <p className="text-xs text-gray-600">{t('component.passCriteriaCard.subtitle')}</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">{t('component.passCriteriaCard.passingScore')}</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{passingScore}%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">{t('component.passCriteriaCard.attendance')}</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{requiredAttendance}%</span>
                </div>

                {certificateCriteria && (
                    <div className="p-3 bg-white rounded-lg border border-purple-100">
                        <p className="text-sm font-medium text-gray-900 mb-1">{t('component.passCriteriaCard.certificate')}</p>
                        <p className="text-xs text-gray-600">{certificateCriteria}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PassCriteriaCard;
