import { useState, useEffect } from 'react';

const STORAGE_KEY = 'guest_test_tracking';
const MAX_FREE_TESTS = 2;

/**
 * Custom hook for tracking guest test attempts
 * Manages free test quota and question ID tracking for duplicate prevention
 */
const useTestTracking = () => {
    const [guestId, setGuestId] = useState(null);
    const [testHistory, setTestHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize guest ID and load history
    useEffect(() => {
        initializeTracking();
    }, []);

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
        const completedCount = testHistory.filter(t => t.completed).length;
        return Math.max(0, MAX_FREE_TESTS - completedCount);
    };

    const hasCompletedTest = (testId) => {
        return testHistory.some(t => t.testId === testId && t.completed);
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

    const recordTestCompletion = (testId, questionIds = [], score = null) => {
        const existingIndex = testHistory.findIndex(t => t.testId === testId);

        const testRecord = {
            testId,
            completed: true,
            score,
            questionIds,
            completedAt: new Date().toISOString(),
        };

        let newHistory;
        if (existingIndex >= 0) {
            // Update existing
            newHistory = [...testHistory];
            newHistory[existingIndex] = testRecord;
        } else {
            // Add new
            newHistory = [...testHistory, testRecord];
        }

        setTestHistory(newHistory);
        saveTestHistory(guestId, newHistory);
    };

    const clearHistory = () => {
        setTestHistory([]);
        if (guestId) {
            saveTestHistory(guestId, []);
        }
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
    };
};

export default useTestTracking;
