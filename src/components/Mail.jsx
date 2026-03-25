import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  Inbox,
  Send,
  FileText,
  Trash2,
  Star,
  Archive,
  Search,
  Plus,
  X,
  Clock,
  User,
  Paperclip,
  Image as ImageIcon,
  Download,
  Reply,
  Forward,
  MoreVertical,
  Check,
  CheckCheck
} from 'lucide-react';
import { Card, Button, Badge } from './ui';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Mail Component - Comprehensive mail system for Students and Admin
 */
const Mail = ({ userRole = 'student' }) => {
  const { t } = useTranslation();
  const [view, setView] = useState('inbox'); // inbox, sent, drafts, trash, starred, archive
  const [selectedMail, setSelectedMail] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mails, setMails] = useState({
    inbox: [],
    sent: [],
    drafts: [],
    trash: [],
    starred: [],
    archive: []
  });
  const [loading, setLoading] = useState(false);

  // Fetch mails based on current view
  useEffect(() => {
    fetchMails(view);
  }, [view]);

  const fetchMails = async (folder) => {
    setLoading(true);
    try {
      // TODO: Call actual API
      // const data = await mailService.getMails(folder);

      // Mock data for now
      const mockMails = getMockMails(folder);
      setMails(prev => ({ ...prev, [folder]: mockMails }));
    } catch (error) {
      console.error('Error fetching mails:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockMails = (folder) => {
    const baseMails = [
      {
        id: 1,
        from: { name: 'Admin System', email: 'admin@koreanvitamin.com', avatar: 'A' },
        to: { name: 'Student User', email: 'student@example.com' },
        subject: 'Thông báo: Bài kiểm tra mới đã được tạo',
        preview: 'Một bài kiểm tra mới TOPIK I đã được tạo. Vui lòng kiểm tra và làm bài trước thời hạn...',
        body: 'Chào bạn,\n\nMột bài kiểm tra mới TOPIK I đã được tạo. Vui lòng kiểm tra và làm bài trước thời hạn.\n\nThời gian bắt đầu: 25/03/2026 10:00\nThời lượng: 60 phút\n\nTrân trọng,\nAdmin System',
        timestamp: '2026-03-23T09:30:00',
        read: false,
        starred: false,
        archived: false,
        folder: 'inbox',
        attachments: []
      },
      {
        id: 2,
        from: { name: 'Teacher Kim', email: 'teacher@koreanvitamin.com', avatar: 'K' },
        to: { name: 'Student User', email: 'student@example.com' },
        subject: 'Nhắc nhở: Nộp bài viết',
        preview: 'Bạn chưa nộp bài viết về chủ đề "Gia đình". Hạn chót là ngày 25/03/2026...',
        body: 'Chào bạn,\n\nBạn chưa nộp bài viết về chủ đề "Gia đình".\n\nHạn chót: 25/03/2026\n\nVui lòng nộp bài sớm để được điểm cao.\n\nThân mến,\nTeacher Kim',
        timestamp: '2026-03-22T14:15:00',
        read: true,
        starred: true,
        archived: false,
        folder: 'inbox',
        attachments: [
          { name: 'requirements.pdf', size: '245 KB', type: 'pdf' }
        ]
      },
      {
        id: 3,
        from: { name: 'Student User', email: 'student@example.com', avatar: 'S' },
        to: { name: 'Teacher Kim', email: 'teacher@koreanvitamin.com' },
        subject: 'Re: Nhắc nhở: Nộp bài viết',
        preview: 'Cảm ơn thầy đã nhắc nhở. Em sẽ nộp bài trong hôm nay...',
        body: 'Thầy Kim ơi,\n\nCảm ơn thầy đã nhắc nhở. Em sẽ nộp bài trong hôm nay.\n\nEm đã hoàn thành bài và đang kiểm tra lại.\n\nThân mến,\nStudent',
        timestamp: '2026-03-22T15:30:00',
        read: true,
        starred: false,
        archived: false,
        folder: 'sent',
        attachments: []
      }
    ];

    // Filter by folder
    return baseMails.filter(mail => mail.folder === folder);
  };

  const handleMailAction = async (mailId, action) => {
    try {
      // TODO: Call actual API
      // await mailService.performAction(mailId, action);

      // Mock action
      setMails(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(folder => {
          updated[folder] = updated[folder].map(mail => {
            if (mail.id === mailId) {
              switch (action) {
                case 'star':
                  return { ...mail, starred: !mail.starred };
                case 'archive':
                  return { ...mail, archived: true, folder: 'archive' };
                case 'trash':
                  return { ...mail, folder: 'trash' };
                case 'read':
                  return { ...mail, read: true };
                default:
                  return mail;
              }
            }
            return mail;
          });
        });
        return updated;
      });

      if (action === 'archive' || action === 'trash') {
        setSelectedMail(null);
        fetchMails(view);
      }
    } catch (error) {
      console.error('Error performing mail action:', error);
    }
  };

  const handleSendMail = async (mailData) => {
    try {
      // TODO: Call actual API
      // await mailService.sendMail(mailData);

      console.log('Sending mail:', mailData);
      setComposeOpen(false);
      // Refresh sent folder
      fetchMails('sent');
    } catch (error) {
      console.error('Error sending mail:', error);
    }
  };

  const getUnreadCount = (folder) => {
    return mails[folder]?.filter(mail => !mail.read).length || 0;
  };

  const filteredMails = mails[view]?.filter(mail =>
    mail.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mail.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mail.preview.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading && filteredMails.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Compose Button */}
        <div className="p-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setComposeOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('mail.compose', 'Soạn thư')}
          </Button>
        </div>

        {/* Folders */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {[
            { id: 'inbox', icon: Inbox, label: t('mail.inbox', 'Hộp thư đến'), color: 'blue' },
            { id: 'sent', icon: Send, label: t('mail.sent', 'Đã gửi'), color: 'green' },
            { id: 'drafts', icon: FileText, label: t('mail.drafts', 'Thư nháp'), color: 'gray' },
            { id: 'starred', icon: Star, label: t('mail.starred', 'Đã gắn dấu'), color: 'amber' },
            { id: 'archive', icon: Archive, label: t('mail.archive', 'Lưu trữ'), color: 'purple' },
            { id: 'trash', icon: Trash2, label: t('mail.trash', 'Thùng rác'), color: 'red' },
          ].map((folder) => (
            <button
              key={folder.id}
              onClick={() => {
                setView(folder.id);
                setSelectedMail(null);
              }}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                transition-all duration-200 group
                ${view === folder.id
                  ? `bg-${folder.color}-100 text-${folder.color}-700 font-medium`
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <folder.icon className="w-5 h-5" />
                <span>{folder.label}</span>
              </div>
              {getUnreadCount(folder.id) > 0 && (
                <Badge variant="primary" size="sm">
                  {getUnreadCount(folder.id)}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        {/* Storage Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">
            {t('mail.storage', 'Dung lượng')}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '15%' }}></div>
          </div>
          <div className="text-xs text-gray-500">
            1.5 GB / 10 GB
          </div>
        </div>
      </div>

      {/* Mail List */}
      <div className="w-96 border-r border-gray-200 flex flex-col bg-white">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('mail.searchPlaceholder', 'Tìm kiếm email...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Mail List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMails.length > 0 ? (
            filteredMails.map((mail) => (
              <div
                key={mail.id}
                onClick={() => {
                  setSelectedMail(mail);
                  if (!mail.read) {
                    handleMailAction(mail.id, 'read');
                  }
                }}
                className={`
                  p-4 border-b border-gray-100 cursor-pointer transition-all
                  hover:bg-gray-50 ${selectedMail?.id === mail.id ? 'bg-indigo-50' : ''}
                  ${!mail.read ? 'bg-blue-50/50' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                    {mail.from.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-semibold truncate ${!mail.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {mail.from.name}
                      </p>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">
                        {formatDistanceToNow(new Date(mail.timestamp), {
                          addSuffix: true,
                          locale: vi
                        })}
                      </span>
                    </div>
                    <p className={`text-sm mb-1 truncate ${!mail.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {mail.subject}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{mail.preview}</p>
                  </div>
                  {mail.starred && (
                    <Star className="w-4 h-4 text-amber-500 shrink-0" fill="currentColor" />
                  )}
                </div>
                {mail.attachments?.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {mail.attachments.length} {t('mail.attachments', 'tệp đính kèm')}
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Mail className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-sm">{t('mail.noMails', 'Không có email nào')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mail Content */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedMail ? (
          <>
            {/* Mail Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedMail.subject}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMailAction(selectedMail.id, 'star')}
                    className={`p-2 rounded-lg transition-all ${
                      selectedMail.starred ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${selectedMail.starred ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleMailAction(selectedMail.id, 'archive')}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                  >
                    <Archive className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMailAction(selectedMail.id, 'trash')}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedMail.from.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{selectedMail.from.name}</p>
                    <span className="text-sm text-gray-500">&lt;{selectedMail.from.email}&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Đến:</span>
                    <span>{selectedMail.to.name}</span>
                    <span className="mx-1">•</span>
                    <Clock className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(selectedMail.timestamp), { addSuffix: true, locale: vi })}</span>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {selectedMail.attachments?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedMail.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">({file.size})</span>
                      <Download className="w-4 h-4 text-gray-400 hover:text-indigo-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mail Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {selectedMail.body}
                </p>
              </div>
            </div>

            {/* Mail Actions */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <Button variant="secondary" className="flex items-center gap-2">
                <Reply className="w-4 h-4" />
                {t('mail.reply', 'Trả lời')}
              </Button>
              <Button variant="ghost" className="flex items-center gap-2">
                <Forward className="w-4 h-4" />
                {t('mail.forward', 'Chuyển tiếp')}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Mail className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">{t('mail.selectMail', 'Chọn một email để đọc')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {composeOpen && (
        <ComposeMail
          onClose={() => setComposeOpen(false)}
          onSend={handleSendMail}
          userRole={userRole}
        />
      )}
    </div>
  );
};

/**
 * Compose Mail Modal
 */
const ComposeMail = ({ onClose, onSend, userRole }) => {
  const { t } = useTranslation();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);

  const handleSend = () => {
    if (!to || !subject) {
      alert('Vui lòng nhập người nhận và chủ đề');
      return;
    }

    onSend({
      to,
      subject,
      body,
      attachments
    });

    // Reset form
    setTo('');
    setSubject('');
    setBody('');
    setAttachments([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('mail.newMessage', 'Tin nhắn mới')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('mail.to', 'Đến')}
            </label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('mail.subject', 'Chủ đề')}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('mail.subjectPlaceholder', 'Nhập chủ đề...')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('mail.message', 'Tin nhắn')}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder={t('mail.messagePlaceholder', 'Nhập nội dung tin nhắn...')}
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <Paperclip className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <label className="cursor-pointer p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
              <Paperclip className="w-5 h-5" />
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setAttachments([...attachments, ...Array.from(e.target.files)])}
              />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              {t('common.cancel', 'Hủy')}
            </Button>
            <Button variant="primary" onClick={handleSend}>
              <Send className="w-4 h-4 mr-2" />
              {t('mail.send', 'Gửi')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mail;
