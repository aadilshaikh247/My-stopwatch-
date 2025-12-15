import React, { useState, useEffect, useRef, useCallback } from 'react';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import LapsList from './components/LapsList';
import SettingsPanel from './components/SettingsPanel';
import { vibratePhone } from './utils/timeUtils';

const App: React.FC = () => {
    // Timer State
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [laps, setLaps] = useState<number[]>([]);
    
    // Customization State
    const [customMessage, setCustomMessage] = useState("MY STOPWATCH");
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [bgColor, setBgColor] = useState("#121212");

    // Refs
    const startTimeRef = useRef<number>(0);
    const elapsedTimeRef = useRef<number>(0);
    const requestRef = useRef<number | null>(null);
    const colorIntervalRef = useRef<number | null>(null);

    // Update timer display
    const updateTimer = useCallback(() => {
        const now = Date.now();
        const newTime = (now - startTimeRef.current) + elapsedTimeRef.current;
        setTime(newTime);
        requestRef.current = requestAnimationFrame(updateTimer);
    }, []);

    // Change background color randomly (HSL)
    const changeBackground = useCallback(() => {
        const randomHue = Math.floor(Math.random() * 360);
        setBgColor(`hsl(${randomHue}, 60%, 20%)`);
    }, []);

    const toggleTimer = () => {
        vibratePhone();

        if (isRunning) {
            // STOP Logic
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
            
            // Clear color interval and reset color
            if (colorIntervalRef.current) {
                clearInterval(colorIntervalRef.current);
                colorIntervalRef.current = null;
            }
            setBgColor("#121212");

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
        vibratePhone();
        
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
    };

    const recordLap = () => {
        if (!isRunning && time === 0) return;
        
        vibratePhone();

        let currentTotalTime;
        if (isRunning) {
            currentTotalTime = (Date.now() - startTimeRef.current) + elapsedTimeRef.current;
        } else {
            currentTotalTime = elapsedTimeRef.current;
        }
        
        setLaps(prevLaps => [currentTotalTime, ...prevLaps]);
    };

    // Handle Image Upload
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
                backgroundColor: bgColor,
                backgroundImage: bgImage ? `url(${bgImage})` : 'none'
            }}
        >
            {/* Overlay for better text visibility */}
            <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none"></div>

            {/* Custom Title */}
            <h2 className="text-3xl sm:text-4xl font-sans font-bold uppercase tracking-[3px] mb-8 z-10 text-center drop-shadow-md px-2">
                {customMessage}
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
            />
        </div>
    );
};

export default App;