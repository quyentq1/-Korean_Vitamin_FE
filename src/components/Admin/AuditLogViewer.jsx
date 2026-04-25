import { useState, useEffect } from 'react';
import { Shield, Search, Filter, Download, Calendar, User, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';
import Swal from 'sweetalert2';

/**
 * AuditLogViewer - Component hiển thị nhật ký hoạt động của admin/staff
 * Phase 6: Audit & Security
 *
 * Features:
 * - View all admin/staff actions
 * - Filter by action type, user, date range
 * - Search functionality
 * - Export logs
 * - View detailed action info
 */
const AuditLogViewer = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        actionType: 'all',
        userId: 'all',
        dateRange: '7d',
        search: ''
    });

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/admin/audit-logs', {
                params: filter
            });
            setLogs(response.data || []);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axiosClient.get('/api/admin/audit-logs/export', {
                params: filter,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            await Swal.fire({
                icon: 'success',
                title: t('admin.auditLog.swal.exported'),
                text: t('admin.auditLog.swal.exportedText'),
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: t('common.error'),
                text: t('admin.auditLog.swal.exportError'),
                confirmButtonColor: '#6366f1'
            });
        }
    };

    const getActionIcon = (action) => {
        const icons = {
            CREATE: { icon: CheckCircle, color: 'text-green-600 bg-green-100' },
            UPDATE: { icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-100' },
            DELETE: { icon: XCircle, color: 'text-red-600 bg-red-100' },
            LOGIN: { icon: User, color: 'text-blue-600 bg-blue-100' },
            LOGOUT: { icon: User, color: 'text-gray-600 bg-gray-100' }
        };
        const config = icons[action] || icons.UPDATE;
        const Icon = config.icon;
        return { Icon, className: config.color };
    };

    const filteredLogs = logs.filter(log => {
        const matchesAction = filter.actionType === 'all' || log.actionType === filter.actionType;
        const matchesSearch = filter.search === '' ||
            log.action?.toLowerCase().includes(filter.search.toLowerCase()) ||
            log.userName?.toLowerCase().includes(filter.search.toLowerCase());
        return matchesAction && matchesSearch;
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-white" />
                    <div>
                        <h2 className="text-xl font-bold text-white">Audit Log</h2>
                        <p className="text-red-100 text-sm">{t('admin.auditLog.subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('admin.auditLog.searchPlaceholder')}
                                value={filter.search}
                                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={filter.actionType}
                            onChange={(e) => setFilter({ ...filter, actionType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                            <option value="all">{t('admin.auditLog.filter.all')}</option>
                            <option value="CREATE">{t('admin.auditLog.filter.create')}</option>
                            <option value="UPDATE">{t('admin.auditLog.filter.update')}</option>
                            <option value="DELETE">{t('admin.auditLog.filter.delete')}</option>
                            <option value="LOGIN">{t('admin.auditLog.filter.login')}</option>
                            <option value="LOGOUT">{t('admin.auditLog.filter.logout')}</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filter.dateRange}
                            onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                            <option value="7d">{t('admin.auditLog.dateRange.7d')}</option>
                            <option value="30d">{t('admin.auditLog.dateRange.30d')}</option>
                            <option value="90d">{t('admin.auditLog.dateRange.90d')}</option>
                            <option value="all">{t('admin.auditLog.dateRange.all')}</option>
                        </select>
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.auditLog.table.timestamp')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.auditLog.table.user')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.auditLog.table.action')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.auditLog.table.entity')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.auditLog.table.ipAddress')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.auditLog.table.details')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                                </td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    {t('admin.auditLog.emptyState')}
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => {
                                const { Icon, className } = getActionIcon(log.actionType);
                                return (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(log.timestamp).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium">{log.userName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
                                                <Icon className="w-3 h-3" />
                                                {log.action}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {log.entityType}: {log.entityId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {log.ipAddress}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {log.details && (
                                                <button
                                                    onClick={() => showDetail(log)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    {t('admin.auditLog.viewDetail')}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    function showDetail(log) {
        Swal.fire({
            title: t('admin.auditLog.detail.title'),
            html: `
                <div class="text-left space-y-2 text-sm">
                    <p><strong>${t('admin.auditLog.detail.user')}:</strong> ${log.userName}</p>
                    <p><strong>${t('admin.auditLog.detail.action')}:</strong> ${log.action}</p>
                    <p><strong>${t('admin.auditLog.detail.time')}:</strong> ${new Date(log.timestamp).toLocaleString('vi-VN')}</p>
                    <p><strong>${t('admin.auditLog.detail.ip')}:</strong> ${log.ipAddress}</p>
                    <p><strong>${t('admin.auditLog.detail.userAgent')}:</strong> ${log.userAgent || 'N/A'}</p>
                    ${log.changes ? `<p><strong>${t('admin.auditLog.detail.changes')}:</strong></p><pre class="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">${JSON.stringify(log.changes, null, 2)}</pre>` : ''}
                </div>
            `,
            confirmButtonColor: '#6366f1'
        });
    }
};

export default AuditLogViewer;
