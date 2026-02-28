import { useState, useEffect, useRef } from 'react';

const useExamTimer = (initialMinutes, onTimeUp) => {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [isActive, setIsActive] = useState(false);

    // Use ref for interval to clear it properly
    const timerRef = useRef(null);

    // Update time if initialMinutes changes (e.g. after fetching exam data)
    useEffect(() => {
        if (initialMinutes && !isActive && timeLeft === 0) {
            setTimeLeft(initialMinutes * 60);
        }
    }, [initialMinutes]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        if (onTimeUp) onTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timerRef.current);
    }, [isActive, onTimeUp, timeLeft]);

    const startTimer = () => setIsActive(true);
    const stopTimer = () => setIsActive(false);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        timeLeft,
        formattedTime: formatTime(timeLeft),
        isActive,
        startTimer,
        stopTimer,
        progress: ((initialMinutes * 60 - timeLeft) / (initialMinutes * 60)) * 100
    };
};

export default useExamTimer;
