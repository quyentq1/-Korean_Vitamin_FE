import { useEffect, useState, useCallback } from 'react';

const useExamSecurity = (onViolation) => {
    const [violationCount, setViolationCount] = useState(0);

    const handleViolation = useCallback((type) => {
        const count = violationCount + 1;
        setViolationCount(count);
        console.warn(`Exam security violation: ${type}`);

        if (onViolation) {
            onViolation(type, count);
        }
    }, [violationCount, onViolation]);

    useEffect(() => {
        // Prevent right click
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Prevent copy/cut/paste
        const handleCopyCutPaste = (e) => {
            e.preventDefault();
            handleViolation('clipboard_attempt');
            return false;
        };

        // Detect visibility change (tab switching)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleViolation('tab_switch');
            }
        };

        // Prevent common keyboard shortcuts (Inspect, Print, etc.)
        const handleKeyDown = (e) => {
            // F12 or Ctrl+Shift+I (DevTools)
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                e.preventDefault();
                handleViolation('devtools_attempt');
            }
            // Ctrl+P (Print)
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                handleViolation('print_attempt');
            }
            // Ctrl+C/V/X is handled by copy/cut/paste events, but good to block here too
        };

        // Add listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopyCutPaste);
        document.addEventListener('cut', handleCopyCutPaste);
        document.addEventListener('paste', handleCopyCutPaste);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('keydown', handleKeyDown);

        // Enter fullscreen on mount (optional, can be triggered manually)
        // document.documentElement.requestFullscreen().catch(() => {});

        return () => {
            // Remove listeners
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopyCutPaste);
            document.removeEventListener('cut', handleCopyCutPaste);
            document.removeEventListener('paste', handleCopyCutPaste);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleViolation]);

    return {
        violationCount,
        resetViolations: () => setViolationCount(0)
    };
};

export default useExamSecurity;
