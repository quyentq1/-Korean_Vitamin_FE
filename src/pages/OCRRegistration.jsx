import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ocrService from '../services/ocrService';

const OCRRegistration = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ocrData, setOcrData] = useState({
        studentName: '',
        email: '',
        phone: '',
        address: '',
        courseCode: '',
        rawOcrText: ''
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleScan = async () => {
        if (!image) return;
        setLoading(true);

        try {
            // Call Backend OCR Service
            const response = await ocrService.processFormImage(image);

            // Backend returns parsed data directly
            setOcrData({
                studentName: response.studentName || '',
                email: response.email || '',
                phone: response.phone || '',
                address: response.address || '',
                courseCode: response.courseCode || '',
                rawOcrText: response.rawOcrText || ''
            });

        } catch (err) {
            console.error('OCR Error:', err);
            alert('Lỗi khi quét ảnh. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8 mt-20">
                <h1 className="text-3xl font-bold mb-8 text-center">Đăng Ký Nhanh (OCR)</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Upload & Preview */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4">1. Tải lên ảnh CMND/CCCD hoặc Form</h2>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4">
                            {preview ? (
                                <img src={preview} alt="Form Preview" className="max-h-64 mx-auto rounded" />
                            ) : (
                                <div className="text-gray-500">
                                    <p className="mb-2">Click để tải ảnh lên</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 block w-max mx-auto">
                                        Chọn Ảnh
                                    </label>
                                </div>
                            )}
                        </div>

                        {image && (
                            <button
                                onClick={handleScan}
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50"
                            >
                                {loading ? 'Đang Quét AI...' : '🔍 Quét Thông Tin'}
                            </button>
                        )}
                    </div>

                    {/* Right: Form Data */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4">2. Kiểm tra thông tin</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Họ và Tên</label>
                                <input
                                    type="text"
                                    value={ocrData.studentName}
                                    onChange={(e) => setOcrData({ ...ocrData, studentName: e.target.value })}
                                    className="w-full p-3 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={ocrData.email}
                                    onChange={(e) => setOcrData({ ...ocrData, email: e.target.value })}
                                    className="w-full p-3 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={ocrData.phone}
                                    onChange={(e) => setOcrData({ ...ocrData, phone: e.target.value })}
                                    className="w-full p-3 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                                <input
                                    type="text"
                                    value={ocrData.address}
                                    onChange={(e) => setOcrData({ ...ocrData, address: e.target.value })}
                                    className="w-full p-3 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Mã khóa học</label>
                                <input
                                    type="text"
                                    value={ocrData.courseCode}
                                    onChange={(e) => setOcrData({ ...ocrData, courseCode: e.target.value })}
                                    className="w-full p-3 border rounded-xl"
                                />
                            </div>

                            <button type="button" className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg mt-4">
                                Xác Nhận Đăng Ký
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default OCRRegistration;
