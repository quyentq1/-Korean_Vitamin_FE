import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {
  Upload, Download, X, FileSpreadsheet,
  AlertCircle, AlertTriangle,
  Loader2, ChevronLeft, CheckSquare, Square
} from 'lucide-react';

import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';

import teacherService from '../../services/teacherService';

const REQUIRED_HEADERS = ['CategoryName', 'Type', 'QuestionText', 'Level', 'Points', 'CorrectAnswer', 'Options'];

const QuestionImport = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  // Preview state
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [headerError, setHeaderError] = useState('');

  // Parse Excel file
  const parseExcelFile = async (selectedFile) => {
    setParsing(true);
    setError('');
    setHeaderError('');

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (rows.length < 2) {
        setError('File không có dữ liệu. Vui lòng thêm ít nhất 1 dòng câu hỏi.');
        setParsing(false);
        return;
      }

      // Validate headers
      const headers = rows[0].map(h => String(h).trim());
      for (let i = 0; i < REQUIRED_HEADERS.length; i++) {
        if (headers[i] !== REQUIRED_HEADERS[i]) {
          setHeaderError(`Cột ${i + 1} phải là "${REQUIRED_HEADERS[i]}", nhưng tìm thấy "${headers[i] || '(trống)'}"`);
          setParsing(false);
          return;
        }
      }

      // Parse data rows
      const parsed = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const text = String(row[2] || '').trim();
        if (!text) continue;

        const categoryName = String(row[0] || '').trim();
        const type = String(row[1] || 'MULTIPLE_CHOICE').trim().toUpperCase();
        const level = String(row[3] || 'LEVEL_3').trim().toUpperCase();
        const points = parseInt(row[4]) || 1;
        const correctAnswer = String(row[5] || '').trim();
        const optionsStr = String(row[6] || '').trim();

        const options = optionsStr ? optionsStr.split('|').map(o => o.trim()).filter(Boolean) : [];

        // Validation
        const errors = [];
        if (!categoryName) errors.push('Thiếu CategoryName');
        if (!type) errors.push('Thiếu Type');
        if (!level.startsWith('LEVEL_')) errors.push('Level không đúng định dạng (LEVEL_1..6)');
        if (type === 'MULTIPLE_CHOICE' && options.length < 2) errors.push('MULTIPLE_CHOICE cần ít nhất 2 options');
        if (type === 'MULTIPLE_CHOICE' && correctAnswer && !options.includes(correctAnswer)) {
          errors.push(`CorrectAnswer "${correctAnswer}" không khớp option nào`);
        }

        const id = i;
        parsed.push({
          id,
          rowNum: i + 1,
          categoryName,
          type,
          text,
          level,
          points,
          correctAnswer,
          options,
          isValid: errors.length === 0,
          errors
        });
      }

      if (parsed.length === 0) {
        setError('Không tìm thấy câu hỏi nào trong file.');
      }

      setQuestions(parsed);
      // Auto-select all valid questions
      setSelectedIds(new Set(parsed.filter(q => q.isValid).map(q => q.id)));
    } catch (err) {
      console.error('Parse error:', err);
      setError('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.');
    } finally {
      setParsing(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setError('');
    setHeaderError('');
    setQuestions([]);
    setSelectedIds(new Set());

    const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!['.xlsx', '.xls'].includes(ext)) {
      setError('Chỉ chấp nhận file .xlsx hoặc .xls');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File quá lớn. Tối đa 5MB.');
      return;
    }

    setFile(selectedFile);
    parseExcelFile(selectedFile);
  };

  const handleInputChange = (e) => {
    e.stopPropagation();
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  };

  // Selection
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allValidIds = questions.filter(q => q.isValid).map(q => q.id);
    const allSelected = allValidIds.every(id => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allValidIds));
    }
  };

  // Confirm & import
  const handleConfirmImport = async () => {
    const count = selectedIds.size;
    if (count === 0) return;

    const result = await Swal.fire({
      icon: 'question',
      title: 'Xác nhận import',
      html: `Bạn sẽ import <strong>${count}</strong> câu hỏi đã chọn vào ngân hàng câu hỏi.<br/><br/>Hành động này không thể hoàn tác.`,
      showCancelButton: true,
      confirmButtonText: 'Import ngay',
      cancelButtonText: 'Xem lại',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setUploading(true);
    try {
      const response = await teacherService.importQuestions(file);

      const importedCount = Array.isArray(response) ? response.length
        : response?.data?.length || 0;

      Swal.fire({
        icon: 'success',
        title: 'Import thành công!',
        html: `Đã nhập <strong>${importedCount}</strong> câu hỏi vào ngân hàng câu hỏi.`,
        confirmButtonText: 'Về Question Bank',
        confirmButtonColor: '#22c55e',
      }).then(() => {
        window.location.href = '/teacher/question-bank';
      });
      return;
    } catch (err) {
      console.error('Import error:', err);
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Lỗi khi import. Vui lòng thử lại.';

      Swal.fire({
        icon: 'error',
        title: 'Import thất bại',
        text: msg,
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setUploading(false);
    }
  };

  // Download template
  const handleDownloadTemplate = async () => {
    try {
      const response = await teacherService.downloadImportTemplate();
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'questions-import-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Template download error:', err);
      setError('Không thể tải file mẫu. Vui lòng thử lại.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setQuestions([]);
    setSelectedIds(new Set());
    setError('');
    setHeaderError('');
  };

  // Stats
  const validCount = questions.filter(q => q.isValid).length;
  const invalidCount = questions.filter(q => !q.isValid).length;
  const totalCount = questions.length;
  const selectedCount = selectedIds.size;
  const allValidSelected = validCount > 0 && questions.filter(q => q.isValid).every(q => selectedIds.has(q.id));
  const categories = [...new Set(questions.map(q => q.categoryName))];

  return (
    <PageContainer>
      <PageHeader
        title="Nhập Câu Hỏi Từ Excel"
        subtitle="Preview câu hỏi trước khi import vào ngân hàng"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Giáo viên', href: '/teacher' },
          { label: 'Nhập Câu Hỏi' }
        ]}
        actions={
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownloadTemplate}
          >
            Tải File Mẫu
          </Button>
        }
      />

      {/* Error */}
      {(error || headerError) && (
        <Alert variant="error" icon={<AlertTriangle className="w-5 h-5" />} className="mb-6" dismissible onDismiss={() => { setError(''); setHeaderError(''); }}>
          {headerError || error}
        </Alert>
      )}

      {/* Step 1: Upload — input tách riêng khỏi div click area */}
      {!file && (
        <Card className="mb-6">
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Định dạng file Excel</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li><strong>CategoryName</strong> — Tên danh mục (VD: Grammar, Vocabulary). Tự tạo nếu chưa có.</li>
                  <li><strong>Type</strong> — MULTIPLE_CHOICE, LISTENING, WRITING, SHORT_ANSWER, ESSAY</li>
                  <li><strong>QuestionText</strong> — Nội dung câu hỏi</li>
                  <li><strong>Level</strong> — LEVEL_1 đến LEVEL_6</li>
                  <li><strong>Points</strong> — Điểm (VD: 1, 2, 5)</li>
                  <li><strong>CorrectAnswer</strong> — Đáp án đúng (phải khớp chính xác 1 option)</li>
                  <li><strong>Options</strong> — Các lựa chọn cách nhau bằng dấu | (VD: 옵션1|옵션2|옵션3|옵션4)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Hidden input — not overlaying the div */}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleInputChange}
              className="hidden"
            />
            <div
              onClick={() => inputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition-colors
                ${dragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}
            >
              <Upload className={`w-14 h-14 mx-auto mb-4 ${dragActive ? 'text-primary-500' : 'text-gray-400'}`} />
              <p className="text-lg font-medium text-gray-700">
                {dragActive ? 'Thả file vào đây' : 'Kéo thả file .xlsx hoặc click để chọn'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Tối đa 5MB</p>
            </div>
          </div>
        </Card>
      )}

      {/* Parsing */}
      {parsing && (
        <Card className="mb-6">
          <div className="p-12 text-center">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Đang đọc file Excel...</p>
          </div>
        </Card>
      )}

      {/* Preview */}
      {file && !parsing && questions.length > 0 && (
        <>
          {/* File info bar */}
          <div className="mb-6 flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB — {totalCount} câu hỏi</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" icon={<X className="w-4 h-4" />} onClick={handleReset}>
              Hủy
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
              <p className="text-3xl font-bold text-blue-600">{totalCount}</p>
              <p className="text-sm text-blue-700 font-medium">Tổng cộng</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
              <p className="text-3xl font-bold text-green-600">{validCount}</p>
              <p className="text-sm text-green-700 font-medium">Hợp lệ</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
              <p className="text-3xl font-bold text-red-600">{invalidCount}</p>
              <p className="text-sm text-red-700 font-medium">Lỗi</p>
            </div>
            <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 text-center">
              <p className="text-3xl font-bold text-primary-600">{selectedCount}</p>
              <p className="text-sm text-primary-700 font-medium">Đã chọn</p>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map(cat => {
                const count = questions.filter(q => q.categoryName === cat).length;
                return (
                  <span key={cat} className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                    {cat} ({count})
                  </span>
                );
              })}
            </div>
          )}

          {/* Questions table */}
          <Card className="mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-center w-12">
                      <button onClick={toggleSelectAll} className="flex items-center justify-center" title={allValidSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả hợp lệ'}>
                        {allValidSelected
                          ? <CheckSquare className="w-5 h-5 text-primary-600" />
                          : <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        }
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-10">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Câu hỏi</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-20">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-16">Điểm</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Đáp án đúng</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => {
                    const isSelected = selectedIds.has(q.id);
                    return (
                      <tr
                        key={q.id}
                        onClick={() => q.isValid && toggleSelect(q.id)}
                        className={`border-b border-gray-100 transition-colors ${
                          !q.isValid ? 'bg-red-50/50 cursor-not-allowed opacity-70'
                            : isSelected ? 'bg-primary-50/60 cursor-pointer'
                            : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <td className="px-4 py-3 text-center">
                          {q.isValid && (
                            isSelected
                              ? <CheckSquare className="w-5 h-5 text-primary-600 mx-auto" />
                              : <Square className="w-5 h-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{q.rowNum}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" size="sm">{q.categoryName}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={q.type === 'MULTIPLE_CHOICE' ? 'success' : q.type === 'LISTENING' ? 'warning' : 'info'} size="sm">
                            {q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : q.type === 'LISTENING' ? 'Nghe' : q.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900 line-clamp-2 whitespace-pre-line max-w-md">{q.text}</p>
                          {q.options.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {q.options.map((opt, i) => (
                                <span key={i} className={`text-xs px-2 py-0.5 rounded ${opt === q.correctAnswer ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{q.level.replace('LEVEL_', 'L')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{q.points}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-green-700">{q.correctAnswer || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          {q.isValid ? (
                            <Badge variant="success" size="sm">OK</Badge>
                          ) : (
                            <div>
                              <Badge variant="danger" size="sm">Lỗi</Badge>
                              <p className="text-xs text-red-600 mt-1">{q.errors.join(', ')}</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Action bar */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              icon={<ChevronLeft className="w-4 h-4" />}
              onClick={handleReset}
            >
              Chọn file khác
            </Button>

            <Button
              variant="primary"
              icon={<Upload className="w-4 h-4" />}
              onClick={handleConfirmImport}
              disabled={uploading || selectedCount === 0}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang import...
                </>
              ) : (
                `Import ${selectedCount} câu hỏi đã chọn`
              )}
            </Button>
          </div>
        </>
      )}

      {/* File selected but no questions */}
      {file && !parsing && questions.length === 0 && !error && (
        <Card className="mb-6">
          <div className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <p className="text-gray-600">Không tìm thấy câu hỏi nào trong file.</p>
            <Button variant="ghost" className="mt-4" onClick={handleReset}>Chọn file khác</Button>
          </div>
        </Card>
      )}

      {uploading && <Loading.Overlay message="Đang import câu hỏi..." />}
    </PageContainer>
  );
};

export default QuestionImport;
