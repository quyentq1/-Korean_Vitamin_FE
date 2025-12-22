import React, { useState } from 'react';
import './UpgradePopup.css';

const UpgradePopup = ({ onClose }) => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would call an API to send the contact request
        // For now, just show success state
        setTimeout(() => {
            setSubmitted(true);
        }, 500);
    };

    if (submitted) {
        return (
            <div className="popup-overlay">
                <div className="popup-content success">
                    <div className="success-icon">✅</div>
                    <h2>Yêu cầu đã được gửi!</h2>
                    <p>Chúng tôi sẽ liên hệ với bạn sớm nhất để tư vấn nâng cấp tài khoản.</p>
                    <button onClick={onClose} className="btn-close">Đóng</button>
                </div>
            </div>
        );
    }

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-header">
                    <h2>⚠️ Hết lượt thi thử miễn phí</h2>
                    <button onClick={onClose} className="btn-close-x">×</button>
                </div>

                <div className="popup-body">
                    <p>Bạn đã sử dụng hết <strong>2 lượt thi thử</strong> dành cho khách.</p>
                    <p>Vui lòng nâng cấp tài khoản để thi không giới hạn và xem giải thích chi tiết!</p>

                    <div className="upgrade-benefits">
                        <h3>✨ Lợi ích tài khoản Premium:</h3>
                        <ul>
                            <li>✅ Thi không giới hạn số lượng đề</li>
                            <li>✅ Xem đáp án và giải thích chi tiết</li>
                            <li>✅ Lưu lịch sử làm bài và theo dõi tiến bộ</li>
                            <li>✅ Truy cập ngân hàng câu hỏi phong phú</li>
                        </ul>
                    </div>

                    <form onSubmit={handleSubmit} className="contact-form">
                        <h3>Liên hệ nâng cấp ngay:</h3>
                        <input type="text" placeholder="Họ và tên" required />
                        <input type="tel" placeholder="Số điện thoại" required />
                        <input type="email" placeholder="Email" required />
                        <button type="submit" className="btn-submit">Gửi yêu cầu tư vấn</button>
                    </form>

                    <div className="contact-info">
                        <p>Hotline: <strong>1900 1234</strong></p>
                        <p>Email: <strong>support@koreanvitamin.com</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradePopup;
