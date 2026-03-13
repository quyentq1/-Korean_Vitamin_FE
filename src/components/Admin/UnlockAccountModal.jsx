import { useState } from 'react';
import { Unlock, CheckCircle } from 'lucide-react';

/**
 * UnlockAccountModal - Modal để mở khóa tài khoản người dùng
 */
const UnlockAccountModal = ({ user, onClose, onSubmit }) => {
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);
        try {
            await onSubmit();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Unlock className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Mở khóa tài khoản</h3>
                            <p className="text-sm text-gray-600">
                                {user?.fullName || user?.username}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <p className="text-gray-700 mb-4">
                            Bạn có chắc chắn muốn mở khóa tài khoản này không?
                        </p>
                        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-green-800">
                                <p className="font-medium mb-1">Xác nhận</p>
                                <p>Tài khoản sẽ được mở khóa và người dùng có thể đăng nhập lại.</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Unlock className="w-4 h-4" />
                                    Mở khóa
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UnlockAccountModal;
