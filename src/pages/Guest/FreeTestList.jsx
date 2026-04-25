import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ConsultationPopup from '../../components/ConsultationPopup';
import { useAuth } from '../../contexts/AuthContext';
import useTestTracking from '../../hooks/useTestTracking';
import consultationService from '../../services/consultationService';
import examPublicService from '../../services/examPublicService';
import examService from '../../services/examService';

/* ─────────────────────────────────────────────
   Inline styles (scoped to this component)
   Using a <style> tag injected once via useEffect
   ───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .ftl-wrap * { box-sizing: border-box; }

  .ftl-wrap {
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Hero ── */
  .ftl-hero { text-align: center; margin-bottom: 2.5rem; }

  .ftl-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #E1F5EE;
    color: #0F6E56;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 100px;
    border: 1px solid #9FE1CB;
    margin-bottom: 1rem;
  }
  .ftl-eyebrow svg { width: 13px; height: 13px; flex-shrink: 0; }

  .ftl-hero h1 {
    font-family: 'Sora', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
    margin-bottom: .55rem;
  }
  .ftl-hero h1 .ftl-accent { color: #1D9E75; }

  .ftl-hero p {
    font-size: 15px;
    color: #6B7280;
    max-width: 480px;
    margin: 0 auto 1.2rem;
    line-height: 1.6;
  }

  /* ── Back button ── */
  .ftl-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #185FA5;
    background: #fff;
    border: 1px solid #B5D4F4;
    border-radius: 8px;
    padding: 7px 14px;
    cursor: pointer;
    margin-bottom: 1.2rem;
    text-decoration: none;
    transition: background .15s;
  }
  .ftl-back-btn:hover { background: #E6F1FB; }
  .ftl-back-btn svg { width: 14px; height: 14px; }

  /* ── Tip box ── */
  .ftl-tip {
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    border-radius: 10px;
    padding: 10px 16px;
    max-width: 520px;
    margin: 0 auto 1.2rem;
    font-size: 13.5px;
    color: #1E40AF;
    line-height: 1.5;
  }

  /* ── Quota bar ── */
  .ftl-quota-bar {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1px solid #D1FAE5;
    border-radius: 100px;
    padding: 8px 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,.05);
  }
  .ftl-quota-dots { display: flex; gap: 5px; }
  .ftl-quota-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #6EE7B7;
    transition: background .3s;
  }
  .ftl-quota-dot.used { background: #D1D5DB; }
  .ftl-quota-label { font-size: 13px; color: #6B7280; }
  .ftl-quota-label strong { color: #0F6E56; font-weight: 600; }

  /* ── Grid ── */
  .ftl-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  /* ── Grid Container (Fixed) ── */
  .ftl-grid-container {
    max-width: 900px;
    margin: 0 auto;
  }

  .ftl-grid-scroll {
    max-height: 600px;
    overflow-y: auto;
    padding-right: 8px;
  }

  /* Custom scrollbar for grid */
  .ftl-grid-scroll::-webkit-scrollbar {
    width: 8px;
  }

  .ftl-grid-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  .ftl-grid-scroll::-webkit-scrollbar-thumb {
    background: #d1fae5;
    border-radius: 4px;
  }

  .ftl-grid-scroll::-webkit-scrollbar-thumb:hover {
    background: #a7f3d0;
  }

  /* ── Card ── */
  .ftl-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #E5E7EB;
    overflow: hidden;
    transition: transform .2s, border-color .2s, box-shadow .2s;
  }
  .ftl-card:not(.ftl-card--locked):hover {
    transform: translateY(-3px);
    border-color: #5DCAA5;
    box-shadow: 0 8px 24px rgba(29,158,117,.12);
  }
  .ftl-card--locked { opacity: .68; }

  /* Card header */
  .ftl-card-top {
    padding: 1.25rem 1.25rem 1rem;
    background: linear-gradient(135deg, #085041 0%, #0F6E56 60%, #1D9E75 100%);
    position: relative;
  }
  .ftl-card-top--blue {
    background: linear-gradient(135deg, #0C447C 0%, #185FA5 60%, #378ADD 100%);
  }
  .ftl-card-top--gray {
    background: linear-gradient(135deg, #374151 0%, #6B7280 100%);
  }

  .ftl-card-badge {
    position: absolute;
    top: 12px; right: 12px;
    background: rgba(255,255,255,.18);
    backdrop-filter: blur(4px);
    border-radius: 100px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .ftl-card-badge svg { width: 11px; height: 11px; }

  .ftl-card-num {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,.7);
    letter-spacing: .05em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .ftl-card-title-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 6px;
  }
  .ftl-card-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
  .ftl-card-title {
    font-family: 'Sora', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    line-height: 1.25;
  }
  .ftl-card-desc {
    font-size: 12.5px;
    color: rgba(255,255,255,.82);
    line-height: 1.55;
  }

  /* Card body */
  .ftl-card-body { padding: 1rem 1.25rem 1.25rem; }

  .ftl-card-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-bottom: .85rem;
    border-bottom: 1px solid #F3F4F6;
    margin-bottom: .85rem;
  }
  .ftl-meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    color: #6B7280;
  }
  .ftl-meta-item svg { width: 14px; height: 14px; flex-shrink: 0; }

  /* Section tags */
  .ftl-sections { display: flex; gap: .6rem; margin-bottom: 1rem; }
  .ftl-section-tag {
    flex: 1;
    background: #ECFDF5;
    border: 1px solid #A7F3D0;
    border-radius: 8px;
    padding: 7px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ftl-section-tag--blue {
    background: #EFF6FF;
    border-color: #BFDBFE;
  }
  .ftl-section-tag--gray {
    background: #F9FAFB;
    border-color: #E5E7EB;
  }
  .ftl-section-name { font-size: 12px; font-weight: 500; color: #065F46; }
  .ftl-section-tag--blue .ftl-section-name { color: #1E40AF; }
  .ftl-section-tag--gray .ftl-section-name { color: #9CA3AF; }
  .ftl-section-count { font-size: 13px; font-weight: 700; color: #059669; }
  .ftl-section-tag--blue .ftl-section-count { color: #2563EB; }
  .ftl-section-tag--gray .ftl-section-count { color: #9CA3AF; }

  /* Result box */
  .ftl-result-box {
    background: #ECFDF5;
    border: 1px solid #A7F3D0;
    border-radius: 10px;
    padding: .7rem 1rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .ftl-result-left { display: flex; flex-direction: column; gap: 2px; }
  .ftl-result-label { font-size: 12px; font-weight: 600; color: #065F46; }
  .ftl-result-date { font-size: 11px; color: #059669; }
  .ftl-result-score {
    font-family: 'Sora', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #065F46;
    line-height: 1;
  }

  /* Buttons */
  .ftl-btn {
    width: 100%;
    padding: 11px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    transition: filter .18s, transform .15s;
  }
  .ftl-btn:active { transform: scale(.98); }
  .ftl-btn svg { width: 15px; height: 15px; }

  .ftl-btn--primary {
    background: linear-gradient(90deg, #0F6E56 0%, #1D9E75 100%);
    color: #fff;
  }
  .ftl-btn--primary:hover { filter: brightness(1.08); }

  .ftl-btn--result {
    background: linear-gradient(90deg, #185FA5 0%, #378ADD 100%);
    color: #fff;
  }
  .ftl-btn--result:hover { filter: brightness(1.08); }

  .ftl-btn--locked {
    background: #F3F4F6;
    color: #9CA3AF;
    cursor: not-allowed;
  }

  /* No quota box */
  .ftl-no-quota {
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    max-width: 520px;
    margin: 0 auto;
  }
  .ftl-no-quota-icon {
    width: 52px; height: 52px;
    background: #ECFDF5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    border: 2px solid #A7F3D0;
  }
  .ftl-no-quota-icon svg { width: 24px; height: 24px; color: #059669; }
  .ftl-no-quota h3 {
    font-family: 'Sora', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #111827;
    margin-bottom: .45rem;
  }
  .ftl-no-quota p {
    font-size: 13.5px;
    color: #6B7280;
    line-height: 1.6;
    margin-bottom: 1.1rem;
  }
  .ftl-btn-consult {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: linear-gradient(90deg, #0F6E56, #1D9E75);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 10px 22px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    transition: filter .18s;
  }
  .ftl-btn-consult:hover { filter: brightness(1.1); }
  .ftl-btn-consult svg { width: 16px; height: 16px; }
`;

// ──────────────────────────────────────────────
// SVG icon helpers
// ──────────────────────────────────────────────
const IconClock = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconClipboard = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const IconCheck = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const IconLock = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IconPlay = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconChart = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const IconBack = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const IconPhone = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const IconGrad = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);
const IconBadge = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

// ──────────────────────────────────────────────
// Card color configs (index % 3)
// ──────────────────────────────────────────────
const CARD_COLORS = [
  { topClass: '',          icon: '📝', sectionBVariant: '--blue' },
  { topClass: '--blue',    icon: '✍️', sectionBVariant: '' },
  { topClass: '',          icon: '📋', sectionBVariant: '--blue' },
];

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
const FreeTestList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [showConsultationPopup, setShowConsultationPopup] = useState(false);

  const courseId = searchParams.get('course');
  const hasRedirectedRef = useRef(false);

  // Inject CSS once
  useEffect(() => {
    const id = 'ftl-styles';
    if (!document.getElementById(id)) {
      const tag = document.createElement('style');
      tag.id = id;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && user?.role && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      const roleRoutes = {
        ADMIN: '/admin',
        MANAGER: '/manager',
        EDUCATION_MANAGER: '/edu-manager',
        TEACHER: '/teacher-dashboard',
        STAFF: '/staff',
        STUDENT: '/student',
      };
      navigate(roleRoutes[user.role] || '/', { replace: true });
    }
    if (!isAuthenticated) hasRedirectedRef.current = false;
  }, [isAuthenticated, user, navigate]);

  const {
    loading,
    remainingFreeTests,
    hasQuota,
    hasCompletedTest,
    testHistory,
  } = useTestTracking(courseId ? parseInt(courseId) : null);

  const getCompletedTestDetails = (testId) =>
    testHistory.find(t => String(t.testId) === String(testId) && t.completed);

  const formatCompletionDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const [tests, setTests] = useState([]);
  const [courseName, setCourseName] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        let examData;
        if (courseId && !isNaN(courseId)) {
          examData = await examService.getMockExamsByCourse(courseId);
          if (examData?.length > 0 && examData[0].course) {
            setCourseName(examData[0].course.name);
          }
        } else {
          examData = await examPublicService.getGuestExams();
        }

        if (!examData || examData.length === 0) { setTests([]); return; }

        const colorCfg = (id) => CARD_COLORS[id % CARD_COLORS.length];

        setTests(examData.map(exam => ({
          id: exam.id,
          title: exam.title,
          description: exam.description || t('freeTest.desc', 'Chưa có mô tả chi tiết'),
          duration: exam.durationMinutes,
          totalQuestions: exam.totalPoints,
          sections: [
            { name: t('freeTest.listening', 'Listening'), questions: Math.floor((exam.totalPoints || 0) / 2) },
            { name: t('freeTest.reading', 'Reading'),    questions: Math.ceil((exam.totalPoints || 0) / 2) },
          ],
          ...colorCfg(exam.id),
        })));
      } catch {
        setTests([]);
      }
    };
    fetchExams();
  }, [t, courseId]);

  const handleStartTest = (testId) => {
    if (!hasQuota && !hasCompletedTest(testId)) {
      setShowConsultationPopup(true);
      return;
    }
    navigate(`/test-runner/${testId}`);
  };

  const handleConsultationSubmit = async (formData) => {
    await consultationService.submitConsultation(formData);
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto" />
            <p className="mt-4 text-gray-500 text-sm">{t('common.loading', 'Đang tải...')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Quota dots: filled = remaining, empty = used
  const usedCount = 2 - remainingFreeTests;

  return (
    <div className="ftl-wrap min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <Navbar />

      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6">

          {/* ── Hero ── */}
          <div className="ftl-hero">
            <div className="ftl-eyebrow">
              <IconBadge />
              {t('freeTest.freeTestBadge')}
            </div>

            <h1>
              {courseName
                ? <><span className="ftl-accent">{courseName}</span> — {t('freeTest.mockExam')}</>
                : t('freeTest.title', 'Đánh Giá Năng Lực')}
            </h1>

            <p>
              {courseName
                ? t('freeTest.courseTestDesc', 'Thi thử các bài kiểm tra đánh giá năng lực cho khóa học {{name}}', { name: courseName })
                : t('freeTest.subtitle', 'Làm thử 2 bài test miễn phí để xác định trình độ hiện tại của bạn')}
            </p>

            {courseName && (
              <button className="ftl-back-btn" onClick={() => navigate('/courses')}>
                <IconBack />
                {t('freeTest.viewAllCourses')}
              </button>
            )}

            {!courseName && (
              <div className="ftl-tip">
                <strong>💡 Mẹo:</strong>{' '}
                {t('freeTest.tipText', 'Bạn có thể làm tối đa 2 bài test miễn phí. Sau đó hãy đăng ký tài khoản để tiếp tục luyện tập!')}
              </div>
            )}

            {/* Quota */}
            <div className="ftl-quota-bar">
              <div className="ftl-quota-dots">
                {[0, 1].map(i => (
                  <div key={i} className={`ftl-quota-dot${i < usedCount ? ' used' : ''}`} />
                ))}
              </div>
              <span className="ftl-quota-label">
                {t('freeTest.remaining', 'Còn lại <strong>{{count}}/2</strong> lượt thi thử', { count: remainingFreeTests }, { interpolation: { escapeValue: false } })}
              </span>
            </div>
          </div>

          {/* ── Test Cards ── */}
          <div className="ftl-grid-container">
            <div className="ftl-grid-scroll">
              <div className="ftl-grid">
                {tests.map((test, index) => {
              const completed       = hasCompletedTest(test.id);
              const completedDetails = getCompletedTestDetails(test.id);
              const isLocked        = !hasQuota && !completed;

              // header variant
              const topMod = isLocked ? '--gray' : (test.topClass ? ` ftl-card-top${test.topClass}` : '');
              const topCls = isLocked
                ? 'ftl-card-top ftl-card-top--gray'
                : `ftl-card-top${test.topClass ? ` ftl-card-top${test.topClass}` : ''}`;

              // section B variant when locked → gray
              const secBCls = isLocked
                ? 'ftl-section-tag ftl-section-tag--gray'
                : `ftl-section-tag ftl-section-tag${test.sectionBVariant || ''}`;

              return (
                <div key={test.id} className={`ftl-card${isLocked ? ' ftl-card--locked' : ''}`}>

                  {/* ── Card top ── */}
                  <div className={topCls}>
                    {completed && !isLocked && (
                      <div className="ftl-card-badge"><IconCheck />{t('freeTest.completed')}</div>
                    )}
                    {isLocked && (
                      <div className="ftl-card-badge"><IconLock />{t('freeTest.lockedBadge')}</div>
                    )}

                    <div className="ftl-card-num">
                      {t('freeTest.testNumber', 'Đề thi số')} {index + 1}
                    </div>
                    <div className="ftl-card-title-row">
                      <span className="ftl-card-icon">{test.icon}</span>
                      <span className="ftl-card-title">{test.title}</span>
                    </div>
                    <p className="ftl-card-desc">{test.description}</p>
                  </div>

                  {/* ── Card body ── */}
                  <div className="ftl-card-body">

                    {/* Meta */}
                    <div className="ftl-card-meta">
                      <div className="ftl-meta-item">
                        <IconClock />
                        {test.duration} {t('common.minutes', 'phút')}
                      </div>
                      <div className="ftl-meta-item">
                        <IconClipboard />
                        {test.totalQuestions} {t('common.questions', 'câu hỏi')}
                      </div>
                    </div>

                    {/* Sections */}
                    <div className="ftl-sections">
                      <div className={`ftl-section-tag${isLocked ? ' ftl-section-tag--gray' : ''}`}>
                        <span className="ftl-section-name">{test.sections[0].name}</span>
                        <span className="ftl-section-count">{test.sections[0].questions} {t('freeTest.questionsUnit')}</span>
                      </div>
                      <div className={secBCls}>
                        <span className="ftl-section-name">{test.sections[1].name}</span>
                        <span className="ftl-section-count">{test.sections[1].questions} {t('freeTest.questionsUnit')}</span>
                      </div>
                    </div>

                    {/* Completed details */}
                    {completed && completedDetails && (
                      <div className="ftl-result-box">
                        <div className="ftl-result-left">
                          <span className="ftl-result-label">✅ {t('freeTest.completed', 'Đã hoàn thành')}</span>
                          {completedDetails.completedAt && (
                            <span className="ftl-result-date">
                              📅 {formatCompletionDate(completedDetails.completedAt)}
                            </span>
                          )}
                        </div>
                        {completedDetails.score !== null && (
                          <div className="ftl-result-score">{completedDetails.score}</div>
                        )}
                      </div>
                    )}

                    {/* Action button */}
                    {isLocked ? (
                      <button className="ftl-btn ftl-btn--locked" disabled>
                        <IconLock />
                        {t('freeTest.locked', 'Đã hết lượt')}
                      </button>
                    ) : completed ? (
                      <div className="flex gap-2 w-full">
                        <button
                          className="ftl-btn ftl-btn--result flex-1"
                          onClick={() =>
                            navigate(`/test-result/${test.id}`, {
                              state: {
                                fromFreeTestList: true,
                                attemptId: completedDetails?.attemptId || null,
                                score: completedDetails?.score || 0,
                                correctAnswers: completedDetails?.questionIds?.length || 0,
                                testDetails: test,
                                finalAttempt: completedDetails?.attemptId ? {
                                  id: completedDetails.attemptId,
                                  autoScore: completedDetails.score,
                                  totalScore: completedDetails.score,
                                  correctAnswers: completedDetails.questionIds?.length || 0,
                                  completedAt: completedDetails.completedAt,
                                } : null,
                                courseId: courseId,
                              },
                            })
                          }
                        >
                          <IconChart />
                          {t('freeTest.viewResults', 'Kết quả')}
                        </button>
                        {remainingFreeTests > 0 && (
                          <button
                            className="ftl-btn ftl-btn--primary flex-1"
                            style={{ background: '#F59E0B', borderColor: '#D97706' }}
                            onClick={() => handleStartTest(test.id)}
                            title={t('freeTest.retestWarning')}
                          >
                            <IconPlay />
                            {t('freeTest.retest')}
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        className="ftl-btn ftl-btn--primary"
                        onClick={() => handleStartTest(test.id)}
                      >
                        <IconPlay />
                        {t('freeTest.start', 'Bắt đầu làm bài')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          {/* ── No quota section ── */}
          {!hasQuota && (
            <div className="ftl-no-quota">
              <div className="ftl-no-quota-icon"><IconGrad /></div>
              <h3>{t('freeTest.noQuotaTitle', 'Bạn đã hoàn thành 2 bài test miễn phí!')}</h3>
              <p>
                {t(
                  'freeTest.noQuotaDesc',
                  'Để tiếp tục luyện tập với toàn bộ đề thi và nhận hướng dẫn từ giáo viên, hãy để lại thông tin — đội ngũ tư vấn sẽ liên hệ hỗ trợ bạn.',
                )}
              </p>
              <button
                className="ftl-btn-consult"
                onClick={() => setShowConsultationPopup(true)}
              >
                <IconPhone />
                {t('freeTest.contactUs', 'Liên hệ tư vấn ngay')}
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      <ConsultationPopup
        isOpen={showConsultationPopup}
        onClose={() => setShowConsultationPopup(false)}
        onSubmit={handleConsultationSubmit}
      />

      <Footer />
    </div>
  );
};

export default FreeTestList;