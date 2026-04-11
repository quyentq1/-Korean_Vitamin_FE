import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import examPublicService from '../services/examPublicService';

const STORAGE_KEY = 'guest_test_tracking';
const MAX_FREE_TESTS = 2;

/**
 * Custom hook for tracking guest test attempts
 * Manages free test quota and question ID tracking for duplicate prevention
 *
 * NOW SYNCS WITH BACKEND QUOTA!
 * NOW SUPPORTS PER-COURSE QUOTA TRACKING!
 *
 * @param {number|null} courseId - Course ID for quota tracking (null = all courses)
 */
const useTestTracking = (courseId = null) => {
    const [guestId, setGuestId] = useState(null);
    const [testHistory, setTestHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [backendQuota, setBackendQuota] = useState(null); // Backend quota state
    const [quotaSynced, setQuotaSynced] = useState(false);   // Whether quota is synced with backend

    // Initialize guest ID and load history
    useEffect(() => {
        initializeTracking();
        syncQuotaWithBackend(); // NEW: Sync with backend on mount

        // Reload data when localStorage changes (sync between tabs/components)
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEY || e.key === 'guestId') {
                initializeTracking();
            }
        };

        // Also reload when window gains focus (user comes back from another tab)
        const handleFocus = () => {
            initializeTracking();
            syncQuotaWithBackend(); // Re-sync on focus
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [courseId]); // Add courseId dependency to re-sync when course changes
    const initializeTracking = () => {
        setLoading(true);

        // Get or create guest ID
        let storedGuestId = localStorage.getItem('guestId');
        if (!storedGuestId) {
            storedGuestId = generateGuestId();
            localStorage.setItem('guestId', storedGuestId);
        }
        setGuestId(storedGuestId);

        // Load test history
        const history = loadTestHistory(storedGuestId);
        setTestHistory(history);

        setLoading(false);
    };

    /**
     * NEW: Sync quota with backend
     * Fetches actual guest quota from backend API for a specific course
     */
    const syncQuotaWithBackend = async () => {
        try {
            // 1. Fetch quota
            const params = courseId ? { courseId } : {};
            const response = await axiosClient.get('/guest/quota', { params });

            if (response && response.remaining !== undefined) {
                setBackendQuota(response.remaining);
                setQuotaSynced(true);

                if (response.remaining === 0) {
                    console.log('[useTestTracking] Backend quota exhausted for course', courseId);
                }
            }

            // 2. Fetch truly completed attempts from backend to ensure we don't rely only on localStorage
            try {
                const attempts = await examPublicService.getMyAttempts();
                if (attempts && attempts.length > 0) {
                    // Convert into testHistory format
                    const backendHistory = attempts.filter(a => a.status === 'GRADED' || a.status === 'PENDING_MANUAL_GRADE').map(a => ({
                        testId: String(a.exam.id),
                        completed: true,
                        score: a.totalScore,
                        questionIds: [], // Hard to extract easily here, but we mainly need completed status
                        attemptId: a.id,
                        completedAt: a.submitTime || a.endTime,
                    }));
                    
                    if (backendHistory.length > 0) {
                        setTestHistory(prev => {
                            // Merge local and backend history
                            const merged = [...prev];
                            backendHistory.forEach(bHist => {
                                const existIdx = merged.findIndex(m => m.testId === bHist.testId);
                                if (existIdx >= 0) {
                                    merged[existIdx] = { ...merged[existIdx], ...bHist, questionIds: merged[existIdx].questionIds || [] };
                                } else {
                                    merged.push(bHist);
                                }
                            });
                            // Save to local storage
                            saveTestHistory(guestId, merged);
                            return merged;
                        });
                    }
                }
            } catch (historyErr) {
                console.error("Failed to fetch guest history from backend", historyErr);
            }

        } catch (error) {
            console.log('[useTestTracking] Unable to sync with backend, using local tracking');
            setQuotaSynced(false);
        }
    };

    /**
     * Handle LIMIT_EXCEEDED error from backend
     * Call this when backend returns 400 LIMIT_EXCEEDED
     */
    const handleLimitExceeded = () => {
        console.log('[useTestTracking] LIMIT_EXCEEDED from backend. Resetting local quota to 0.');
        setBackendQuota(0);
        setQuotaSynced(true);

        // Optional: Clear localStorage to force sync
        // localStorage.removeItem(STORAGE_KEY);
    };

    const generateGuestId = () => {
        return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    const loadTestHistory = (guestId) => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const allData = JSON.parse(stored);
                return allData[guestId] || [];
            }
        } catch (error) {
            console.error('Error loading test history:', error);
        }
        return [];
    };

    const saveTestHistory = (guestId, history) => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const allData = stored ? JSON.parse(stored) : {};
            allData[guestId] = history;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
        } catch (error) {
            console.error('Error saving test history:', error);
        }
    };

    const getRemainingFreeTests = () => {
        // NEW: If backend quota is synced, use backend value
        if (quotaSynced && backendQuota !== null) {
            return backendQuota;
        }

        // Fallback to local tracking
        const completedCount = testHistory.filter(t => t.completed).length;
        return Math.max(0, MAX_FREE_TESTS - completedCount);
    };

    const hasCompletedTest = (testId) => {
        // Convert both to string for comparison (testId from URL is string, from API might be number)
        const testIdStr = String(testId);
        return testHistory.some(t => String(t.testId) === testIdStr && t.completed);
    };

    const getAllUsedQuestionIds = () => {
        const allIds = [];
        testHistory.forEach(test => {
            if (test.questionIds && Array.isArray(test.questionIds)) {
                allIds.push(...test.questionIds);
            }
        });
        return [...new Set(allIds)]; // Remove duplicates
    };

    const recordTestCompletion = (testId, questionIds = [], score = null, attemptId = null) => {
        // Convert testId to string for consistent comparison
        const testIdStr = String(testId);
        const existingIndex = testHistory.findIndex(t => String(t.testId) === testIdStr);

        const testRecord = {
            testId: testIdStr,  // Always store as string
            completed: true,
            score,
            questionIds,
            attemptId,  // Store attemptId to fetch full results later
            completedAt: new Date().toISOString(),
        };

        let newHistory;
        const isFirstAttempt = existingIndex < 0;  // Check if this is a NEW exam (first attempt)

        if (existingIndex >= 0) {
            // Update existing (retake)
            newHistory = [...testHistory];
            newHistory[existingIndex] = testRecord;
        } else {
            // Add new (first attempt - should decrement quota)
            newHistory = [...testHistory, testRecord];
        }

        setTestHistory(newHistory);
        saveTestHistory(guestId, newHistory);

        // Only decrement backend quota for FIRST attempt of an exam
        // Retakes do NOT consume additional quota
        if (isFirstAttempt && quotaSynced && backendQuota !== null && backendQuota > 0) {
            setBackendQuota(backendQuota - 1);
        }
    };

    const clearHistory = () => {
        setTestHistory([]);
        if (guestId) {
            saveTestHistory(guestId, []);
        }
        // Reset backend quota cache
        setBackendQuota(null);
        setQuotaSynced(false);
    };

    return {
        guestId,
        testHistory,
        loading,
        remainingFreeTests: getRemainingFreeTests(),
        hasQuota: getRemainingFreeTests() > 0,
        hasCompletedTest,
        getAllUsedQuestionIds,
        recordTestCompletion,
        clearHistory,
        handleLimitExceeded, // NEW: Export this to handle LIMIT_EXCEEDED errors
        syncQuotaWithBackend, // NEW: Manual sync trigger
        quotaSynced, // NEW: Whether quota is synced with backend
    };
};

export default useTestTracking;
