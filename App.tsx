import React, { useState, useEffect, useRef, useCallback } from 'react';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import LapsList from './components/LapsList';
import SettingsPanel from './components/SettingsPanel';
import { vibratePhone } from './utils/timeUtils';

type AlertStatus = 'none' | 'warning' | 'hit';

const App: React.FC = () => {
    // Timer State
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [laps, setLaps] = useState<number[]>([]);
    
    // Customization State
    const [customMessage, setCustomMessage] = useState("MY SMART STOPWATCH");
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [bgColor, setBgColor] = useState("#121212");
    
    // Threshold State
    const [thresholdMinutes, setThresholdMinutes] = useState(5);
    const [alertStatus, setAlertStatus] = useState<AlertStatus>('none');

    // Refs
    const startTimeRef = useRef<number>(0);
    const elapsedTimeRef = useRef<number>(0);
    const requestRef = useRef<number | null>(null);
    const colorIntervalRef = useRef<number | null>(null);
    
    // Refs for accessing latest state inside animation frame
    const thresholdMinutesRef = useRef(thresholdMinutes);
    const alertStatusRef = useRef<AlertStatus>('none');

    // Sync refs with state
    useEffect(() => {
        thresholdMinutesRef.current = thresholdMinutes;
    }, [thresholdMinutes]);

    useEffect(() => {
        alertStatusRef.current = alertStatus;
    }, [alertStatus]);

    // Check Threshold Logic
    const checkThreshold = (totalTime: number) => {
        const goalMs = thresholdMinutesRef.current * 60 * 1000;
        const remaining = goalMs - totalTime;
        const currentStatus = alertStatusRef.current;

        // If goal hit
        if (remaining <= 0) {
            if (currentStatus !== 'hit') {
                setAlertStatus('hit');
                vibratePhone([200, 100, 200, 100, 200]); // Triple pulse
            }
        } 
        // If warning (10 seconds left)
        else if (remaining <= 10000) {
            if (currentStatus !== 'warning' && currentStatus !== 'hit') {
                setAlertStatus('warning');
                vibratePhone(100); // Short pulse
            }
        } 
        // Normal state
        else {
            if (currentStatus !== 'none') {
                setAlertStatus('none');
            }
        }
    };

    // Update timer display
    const updateTimer = useCallback(() => {
        const now = Date.now();
        const newTime = (now - startTimeRef.current) + elapsedTimeRef.current;
        setTime(newTime);
        checkThreshold(newTime);
        requestRef.current = requestAnimationFrame(updateTimer);
    }, []);

    // Change background color randomly (HSL)
    const changeBackground = useCallback(() => {
        // Only change background if no alert is active
        if (alertStatusRef.current === 'none') {
            const randomHue = Math.floor(Math.random() * 360);
            setBgColor(`hsl(${randomHue}, 60%, 20%)`);
        }
    }, []);

    const toggleTimer = () => {
        vibratePhone(50);

        if (isRunning) {
            // STOP Logic
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
            
            if (colorIntervalRef.current) {
                clearInterval(colorIntervalRef.current);
                colorIntervalRef.current = null;
            }
            
            // Reset background and alerts on stop
            setBgColor("#121212");
            setAlertStatus('none');

            elapsedTimeRef.current += Date.now() - startTimeRef.current;
            setIsRunning(false);
        } else {
            // START Logic
            startTimeRef.current = Date.now();
            updateTimer();
            
            // Start Color Cycle
            changeBackground(); // Immediate change
            colorIntervalRef.current = window.setInterval(changeBackground, 1000);

            setIsRunning(true);
        }
    };

    const resetTimer = () => {
        vibratePhone(50);
        
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }

        if (colorIntervalRef.current) {
            clearInterval(colorIntervalRef.current);
            colorIntervalRef.current = null;
        }

        setIsRunning(false);
        setTime(0);
        setLaps([]);
        elapsedTimeRef.current = 0;
        setBgColor("#121212");
        setAlertStatus('none');
    };

    const recordLap = () => {
        if (!isRunning && time === 0) return;
        
        vibratePhone(50);

        let currentTotalTime;
        if (isRunning) {
            currentTotalTime = (Date.now() - startTimeRef.current) + elapsedTimeRef.current;
        } else {
            currentTotalTime = elapsedTimeRef.current;
        }
        
        setLaps(prevLaps => [currentTotalTime, ...prevLaps]);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setBgImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Determine current background color based on alert status
    const getCurrentBackgroundColor = () => {
        if (alertStatus === 'hit') return '#e74c3c'; // Red
        if (alertStatus === 'warning') return '#f39c12'; // Yellow
        return bgColor; // Normal dynamic color
    };

    // Determine title text
    const getTitleText = () => {
        if (alertStatus === 'hit') return "TIME'S UP! GOAL ACHIEVED!";
        return customMessage;
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (colorIntervalRef.current) clearInterval(colorIntervalRef.current);
        };
    }, []);

    return (
        <div 
            className="flex flex-col items-center justify-center min-h-screen text-white p-4 font-mono select-none transition-colors duration-[800ms] ease-in-out bg-cover bg-center bg-blend-overlay relative overflow-hidden"
            style={{ 
                backgroundColor: getCurrentBackgroundColor(),
                backgroundImage: bgImage ? `url(${bgImage})` : 'none'
            }}
        >
            {/* Overlay for better text visibility */}
            <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none"></div>

            {/* Custom Title */}
            <h2 className="text-3xl sm:text-4xl font-sans font-bold uppercase tracking-[3px] mb-8 z-10 text-center drop-shadow-md px-2">
                {getTitleText()}
            </h2>

            <TimerDisplay time={time} />
            
            <Controls 
                isRunning={isRunning} 
                onStartStop={toggleTimer} 
                onReset={resetTimer} 
                onLap={recordLap} 
                canLap={time > 0} 
            />
            
            <LapsList laps={laps} />

            <SettingsPanel 
                customMessage={customMessage}
                onMessageChange={setCustomMessage}
                onImageUpload={handleImageUpload}
                thresholdMinutes={thresholdMinutes}
                onThresholdChange={setThresholdMinutes}
            />
        </div>
    );
};

export default App;