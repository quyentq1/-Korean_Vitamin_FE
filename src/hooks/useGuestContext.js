import { useState, useEffect } from 'react';

const GUEST_CONTEXT_KEY = 'guest_context';

/**
 * Custom hook for managing guest context
 * Tracks guest activity (tests, course views) for migration when they signup
 */
const useGuestContext = () => {
    const [context, setContext] = useState({
        testHistory: [],      // Tests taken by guest
        courseInterests: [],  // Courses guest viewed
        lastPath: '/',         // Last page visited
    });
    const [loading, setLoading] = useState(true);

    // Load context on mount
    useEffect(() => {
        loadContext();
    }, []);

    /**
     * Load guest context from localStorage
     */
    const loadContext = () => {
        try {
            const stored = localStorage.getItem(GUEST_CONTEXT_KEY);
            if (stored) {
                const parsedContext = JSON.parse(stored);
                setContext(parsedContext);
            }
        } catch (error) {
            console.error('Error loading guest context:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Save guest context to localStorage
     */
    const saveContext = (newContext) => {
        try {
            localStorage.setItem(GUEST_CONTEXT_KEY, JSON.stringify(newContext));
            setContext(newContext);
        } catch (error) {
            console.error('Error saving guest context:', error);
        }
    };

    /**
     * Record test completion for guest
     * Called when guest completes a test
     */
    const recordTestCompletion = (testId, attemptId, examId, score, correctAnswers) => {
        const newTestRecord = {
            testId,
            attemptId,
            examId,
            score,
            correctAnswers,
            completedAt: new Date().toISOString(),
        };

        const newContext = {
            ...context,
            testHistory: [...context.testHistory, newTestRecord],
        };

        saveContext(newContext);
    };

    /**
     * Record course interest when guest views a course
     * Called when guest visits course detail page
     */
    const recordCourseInterest = (courseId) => {
        // Check if already interested
        if (context.courseInterests.includes(courseId)) {
            return;
        }

        const newContext = {
            ...context,
            courseInterests: [...context.courseInterests, courseId],
        };

        saveContext(newContext);
    };

    /**
     * Update last visited path
     * Called when navigating to signup page
     */
    const updateLastPath = (path) => {
        const newContext = {
            ...context,
            lastPath: path,
        };

        saveContext(newContext);
    };

    /**
     * Clear guest context after successful signup
     * Called after user registers account
     */
    const clearGuestContext = () => {
        try {
            localStorage.removeItem(GUEST_CONTEXT_KEY);
            setContext({
                testHistory: [],
                courseInterests: [],
                lastPath: '/',
            });
        } catch (error) {
            console.error('Error clearing guest context:', error);
        }
    };

    /**
     * Get guest data ready for signup
     * Returns formatted data for backend signup API
     */
    const getGuestDataForSignup = () => {
        return {
            guestTestHistory: context.testHistory.map(test => ({
                examId: test.examId,
                examAttemptId: test.attemptId,
                score: test.score,
                correctAnswers: test.correctAnswers,
                completedAt: test.completedAt,
            })),
            interestedCourseIds: context.courseInterests,
            redirectPath: context.lastPath !== '/' ? context.lastPath : null,
        };
    };

    /**
     * Check if guest has any activity to migrate
     */
    const hasActivityToMigrate = () => {
        return context.testHistory.length > 0 || context.courseInterests.length > 0;
    };

    return {
        context,
        loading,
        recordTestCompletion,
        recordCourseInterest,
        updateLastPath,
        clearGuestContext,
        getGuestDataForSignup,
        hasActivityToMigrate,
    };
};

export { useGuestContext };

