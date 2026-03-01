import React, { useState, useEffect } from 'react';
import { lessonService } from '../services/lessonService';
import { useTranslation } from 'react-i18next';
import './CoursePreview.css';

const CoursePreview = ({ courseId }) => {
    const { t } = useTranslation();
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPreviewLessons();
    }, [courseId]);

    const fetchPreviewLessons = async () => {
        try {
            setLoading(true);
            const response = await lessonService.getPreviewLessons(courseId);
            setLessons(response.data || []);

            // Auto-select first lesson if available
            if (response.data && response.data.length > 0) {
                setSelectedLesson(response.data[0]);
            }
        } catch (err) {
            setError(t('coursePreview.errorLoad'));
            console.error('Error fetching preview lessons:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonClick = (lesson) => {
        setSelectedLesson(lesson);
    };

    if (loading) {
        return (
            <div className="course-preview-section">
                <div className="preview-header">
                    <h2 className="preview-title">
                        <span className="preview-icon">🎓</span>
                        {t('coursePreview.title')}
                    </h2>
                </div>
                <div className="preview-loading">
                    <div className="spinner"></div>
                    <p>{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (error || lessons.length === 0) {
        return (
            <div className="course-preview-section">
                <div className="preview-header">
                    <h2 className="preview-title">
                        <span className="preview-icon">🎓</span>
                        {t('coursePreview.title')}
                    </h2>
                </div>
                <div className="preview-empty">
                    <span className="empty-icon">📚</span>
                    <p>{error || t('coursePreview.noPreview')}</p>
                    <button className="cta-button">
                        {t('coursePreview.contactUs')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="course-preview-section">
            <div className="preview-header">
                <h2 className="preview-title">
                    <span className="preview-icon">🎓</span>
                    {t('coursePreview.title')}
                </h2>
                <p className="preview-subtitle">{t('coursePreview.subtitle')}</p>
                <span className="preview-badge">
                    {lessons.length} {t('coursePreview.freeLessons')}
                </span>
            </div>

            <div className="preview-content">
                {/* Video Player Section */}
                <div className="video-player-section">
                    {selectedLesson ? (
                        <div className="video-container">
                            {selectedLesson.videoUrl ? (
                                <video
                                    className="video-player"
                                    controls
                                    poster={selectedLesson.thumbnailUrl}
                                    key={selectedLesson.id}
                                >
                                    <source src={selectedLesson.videoUrl} type="video/mp4" />
                                    {t('coursePreview.videoNotSupported')}
                                </video>
                            ) : (
                                <div className="video-placeholder">
                                    <span className="placeholder-icon">🎬</span>
                                    <p>{t('coursePreview.noVideo')}</p>
                                    {selectedLesson.content && (
                                        <div className="lesson-content">
                                            <p>{selectedLesson.content}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="video-info">
                                <h3 className="lesson-title">{selectedLesson.title}</h3>
                                {selectedLesson.description && (
                                    <p className="lesson-description">{selectedLesson.description}</p>
                                )}
                                {selectedLesson.durationMinutes && (
                                    <span className="lesson-duration">
                                        ⏱️ {selectedLesson.durationMinutes} {t('coursePreview.minutes')}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="video-placeholder">
                            <span className="placeholder-icon">📺</span>
                            <p>{t('coursePreview.selectLesson')}</p>
                        </div>
                    )}
                </div>

                {/* Lessons List Section */}
                <div className="lessons-list-section">
                    <h3 className="lessons-list-title">{t('coursePreview.lessonList')}</h3>
                    <div className="lessons-list">
                        {lessons.map((lesson, index) => (
                            <div
                                key={lesson.id}
                                className={`lesson-item ${selectedLesson?.id === lesson.id ? 'active' : ''}`}
                                onClick={() => handleLessonClick(lesson)}
                            >
                                <div className="lesson-number">
                                    <span className="lesson-badge">{index + 1}</span>
                                </div>
                                <div className="lesson-info">
                                    <h4 className="lesson-item-title">{lesson.title}</h4>
                                    {lesson.description && (
                                        <p className="lesson-item-description">
                                            {lesson.description.substring(0, 80)}
                                            {lesson.description.length > 80 ? '...' : ''}
                                        </p>
                                    )}
                                    <div className="lesson-meta">
                                        {lesson.durationMinutes && (
                                            <span className="meta-item">
                                                ⏱️ {lesson.durationMinutes}m
                                            </span>
                                        )}
                                        {lesson.isPreview && (
                                            <span className="preview-tag">{t('coursePreview.free')}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="lesson-play-icon">
                                    {selectedLesson?.id === lesson.id ? (
                                        <span className="playing-icon">▶️</span>
                                    ) : (
                                        <span className="play-icon">▶</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="preview-cta">
                        <div className="cta-content">
                            <h4>{t('coursePreview.ctaTitle')}</h4>
                            <p>{t('coursePreview.ctaDescription')}</p>
                        </div>
                        <button className="cta-button">
                            {t('coursePreview.enrollNow')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePreview;
