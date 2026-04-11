import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Users, Send, Search, CheckSquare, Square, CheckCircle, AlertCircle, X } from 'lucide-react';
import Swal from 'sweetalert2';

// Standard UI components from the system if possible, but fallback to custom tailwind styling
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

import { staffService } from '../../services/staffService';

const MailManagement = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    // Form state
    const [selectedUserIds, setSelectedUserIds] = useState(new Set());
    const [customEmails, setCustomEmails] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await staffService.getMailUsers();
            setUsers(data || []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi tải danh sách',
                text: 'Không thể tải danh sách người dùng. Vui lòng thử lại sau.'
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        const q = searchQuery.toLowerCase();
        return users.filter(u => 
            (u.fullName && u.fullName.toLowerCase().includes(q)) || 
            (u.email && u.email.toLowerCase().includes(q))
        );
    }, [searchQuery, users]);

    const handleSelectAll = () => {
        if (selectedUserIds.size === filteredUsers.length) {
            setSelectedUserIds(new Set());
        } else {
            setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const handleToggleUser = (id) => {
        const newSet = new Set(selectedUserIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedUserIds(newSet);
    };

    const handleSendMail = async (e) => {
        e.preventDefault();
        
        // Validation
        const customEmailList = customEmails.split(',').map(e => e.trim()).filter(e => e);
        
        if (selectedUserIds.size === 0 && customEmailList.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Thiếu người nhận',
                text: 'Vui lòng chọn ít nhất 1 học viên từ danh sách hoặc nhập email khác.'
            });
            return;
        }

        if (!subject.trim()) {
            Swal.fire({ icon: 'warning', title: 'Thiếu tiêu đề', text: 'Vui lòng nhập tiêu đề email.' });
            return;
        }

        if (!content.trim()) {
            Swal.fire({ icon: 'warning', title: 'Thiếu nội dung', text: 'Vui lòng nhập nội dung email.' });
            return;
        }

        try {
            setSending(true);
            const payload = {
                userIds: Array.from(selectedUserIds),
                customEmails: customEmailList,
                subject: subject.trim(),
                content: content.trim()
            };
            
            await staffService.sendCustomMail(payload);
            
            Swal.fire({
                icon: 'success',
                title: 'Gửi thành công',
                text: 'Email đã được đưa vào hàng đợi gửi đi!'
            });
            
            // Reset form
            setSubject('');
            setContent('');
            setCustomEmails('');
            setSelectedUserIds(new Set());
            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi gửi mail',
                text: error.message || 'Có lỗi xảy ra khi gửi email.'
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Gửi Email Thông Báo"
                subtitle="Gửi thông báo qua email cho học viên, giáo viên hoặc đối tác."
                breadcrumbs={[
                    { label: 'Staff', path: '/staff' },
                    { label: 'Quản lý Email' }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cột trái: Người nhận */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="flex flex-col h-full bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                Người Nhận Hệ Thống
                            </h3>
                            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {selectedUserIds.size} Đã chọn
                            </span>
                        </div>
                        
                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm tên hoặc email..." 
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[400px] p-2">
                            {loading ? (
                                <div className="text-center py-6 text-gray-500 text-sm">Đang tải danh sách...</div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 text-sm">Không tìm thấy người dùng phù hợp.</div>
                            ) : (
                                <div className="space-y-1">
                                    <div 
                                        onClick={handleSelectAll}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer mb-2 border-b border-gray-100 pb-3"
                                    >
                                        {selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0 ? (
                                            <CheckSquare className="w-5 h-5 text-blue-500" />
                                        ) : (
                                            <Square className="w-5 h-5 text-gray-300" />
                                        )}
                                        <span className="font-semibold text-gray-800 text-sm">Chọn tất cả ({filteredUsers.length})</span>
                                    </div>

                                    {filteredUsers.map(user => (
                                        <div 
                                            key={user.id}
                                            onClick={() => handleToggleUser(user.id)}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                                        >
                                            {selectedUserIds.has(user.id) ? (
                                                <CheckSquare className="w-5 h-5 text-blue-500 shrink-0" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-300 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{user.fullName || 'No Name'}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                {user.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Cột phải: Form Email */}
                <div className="lg:col-span-2">
                    <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden p-6">
                        <form onSubmit={handleSendMail} className="space-y-6">
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email nhận bổ sung (Ngoài hệ thống)
                                </label>
                                <textarea
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Nhập email tự do, ngăn cách bởi dấu phẩy (,)"
                                    value={customEmails}
                                    onChange={(e) => setCustomEmails(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Sử dụng để gửi cho phụ huynh hoặc người chưa có tài khoản.</p>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tiêu đề Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="[Korean Vitamin] Tiêu đề thông báo..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nội dung Email <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={12}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                                    placeholder="Xin chào,&#10;&#10;Nội dung thông báo của bạn..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    icon={sending ? undefined : <Send className="w-4 h-4" />}
                                    disabled={sending}
                                    className="px-6"
                                >
                                    {sending ? 'Đang gửi mail...' : 'Phát Hành Email'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
                
            </div>
        </PageContainer>
    );
};

export default MailManagement;
