import React, { useState, useEffect, useRef, useCallback } from 'react';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import LapsList, { LapData } from './components/LapsList';
import SettingsPanel from './components/SettingsPanel';
import AnalysisDisplay from './components/AnalysisDisplay';
import { vibratePhone } from './utils/timeUtils';

type AlertStatus = 'none' | 'warning' | 'hit';
const STORAGE_KEY = 'stopwatchData';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const App: React.FC = () => {
    // --- Timer State ---
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [laps, setLaps] = useState<LapData[]>([]);
    const [saveStatus, setSaveStatus] = useState('');
    
    // --- Customization State ---
    const [customMessage, setCustomMessage] = useState("MY SMART PRO STOPWATCH");
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [bgColor, setBgColor] = useState("#121212");
    
    // --- Threshold State ---
    const [thresholdMinutes, setThresholdMinutes] = useState(5);
    const [alertStatus, setAlertStatus] = useState<AlertStatus>('none');

    // --- Voice State ---
    const [voiceStatus, setVoiceStatus] = useState('Initializing...');
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(true);

    // --- Refs ---
    const startTimeRef = useRef<number>(0);
    const elapsedTimeRef = useRef<number>(0);
    const previousTotalTimeRef = useRef<number>(0);
    const requestRef = useRef<number | null>(null);
    
    // Refs for accessing latest state inside animation frame and event handlers
    const thresholdMinutesRef = useRef(thresholdMinutes);
    const alertStatusRef = useRef<AlertStatus>('none');
    const isRunningRef = useRef(isRunning);

    // Sync refs
    useEffect(() => { thresholdMinutesRef.current = thresholdMinutes; }, [thresholdMinutes]);
    useEffect(() => { alertStatusRef.current = alertStatus; }, [alertStatus]);
    useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

    // --- Initialization Logic ---
    useEffect(() => {
        loadData();
    }, []);

    // --- Data Persistence ---

    const saveData = useCallback((overrideElapsedTime?: number) => {
        const currentElapsed = overrideElapsedTime !== undefined ? overrideElapsedTime : elapsedTimeRef.current;
        
        const data = {
            elapsedTime: currentElapsed,
            previousTotalTime: previousTotalTimeRef.current,
            laps,
            customMessage,
            thresholdMinutes,
            bgImage,
            bgColor
        };
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            setSaveStatus('Saved');
            setTimeout(() => setSaveStatus(''), 2000);
        } catch (e) {
            console.error("Save failed", e);
            setSaveStatus('Storage Full');
            setTimeout(() => setSaveStatus(''), 2000);
        }
    }, [laps, customMessage, thresholdMinutes, bgImage, bgColor]);

    const loadData = () => {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
                const data = JSON.parse(storedData);
                
                // Restore Refs
                elapsedTimeRef.current = data.elapsedTime || 0;
                previousTotalTimeRef.current = data.previousTotalTime || 0;
                
                // Restore State
                setTime(data.elapsedTime || 0);
                setLaps(data.laps || []);
                setCustomMessage(data.customMessage || "MY SMART PRO STOPWATCH");
                setThresholdMinutes(data.thresholdMinutes || 5);
                setBgImage(data.bgImage || null);
                setBgColor(data.bgColor || "#121212");
                
                setSaveStatus('Loaded');
                setTimeout(() => setSaveStatus(''), 2000);
            }
        } catch (e) {
            console.error("Failed to load data", e);
        }
    };

    // Auto-save logic
    useEffect(() => {
        const handler = setTimeout(() => {
            if (time > 0 || laps.length > 0 || customMessage !== "MY SMART PRO STOPWATCH") {
                saveData();
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [saveData, laps, customMessage, thresholdMinutes, bgImage, bgColor, time]);

    // --- Timer Logic ---

    const checkThreshold = (totalTime: number) => {
        const goalMs = thresholdMinutesRef.current * 60 * 1000;
        const remaining = goalMs - totalTime;
        const currentStatus = alertStatusRef.current;

        if (remaining <= 0) {
            if (currentStatus !== 'hit') {
                setAlertStatus('hit');
                vibratePhone([200, 100, 200, 100, 200]);
            }
        } else if (remaining <= 10000) {
            if (currentStatus !== 'warning' && currentStatus !== 'hit') {
                setAlertStatus('warning');
                vibratePhone(100);
            }
        } else {
            if (currentStatus !== 'none') {
                setAlertStatus('none');
            }
        }
    };

    const updateTimer = useCallback(() => {
        const now = Date.now();
        const newTime = (now - startTimeRef.current) + elapsedTimeRef.current;
        setTime(newTime);
        checkThreshold(newTime);
        requestRef.current = requestAnimationFrame(updateTimer);
    }, []);

    const toggleTimer = () => {
        vibratePhone(50);

        if (isRunning) {
            // STOP
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
            elapsedTimeRef.current += Date.now() - startTimeRef.current;
            setAlertStatus('none');
            setIsRunning(false);
            saveData();
        } else {
            // START
            startTimeRef.current = Date.now();
            updateTimer();
            setIsRunning(true);
        }
    };

    const resetTimer = () => {
        vibratePhone(50);
        
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }

        setIsRunning(false);
        setTime(0);
        setLaps([]);
        elapsedTimeRef.current = 0;
        previousTotalTimeRef.current = 0;
        setAlertStatus('none');
        setBgColor("#121212");
        setBgImage(null);
        
        localStorage.removeItem(STORAGE_KEY);
        setSaveStatus('Data Cleared');
        setTimeout(() => setSaveStatus(''), 2000);
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

        const lapDuration = currentTotalTime - previousTotalTimeRef.current;
        previousTotalTimeRef.current = currentTotalTime;
        
        const newLap: LapData = {
            id: Date.now() + Math.random(), 
            duration: lapDuration,
            totalTime: currentTotalTime
        };
        
        setLaps(prevLaps => [newLap, ...prevLaps]);
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

    // --- Voice Control Logic ---
    const toggleTimerRef = useRef(toggleTimer);
    const recordLapRef = useRef(recordLap);
    useEffect(() => {
        toggleTimerRef.current = toggleTimer;
        recordLapRef.current = recordLap;
    }, [toggleTimer, recordLap]);

    const speakFeedback = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.2;
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setVoiceSupported(false);
            setVoiceStatus('Not Supported');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'hi-IN';

        let isMounted = true;
        let restartTimer: ReturnType<typeof setTimeout>;

        recognition.onstart = () => {
            if (isMounted) {
                setVoiceStatus('Listening...');
                setIsListening(true);
            }
        };

        recognition.onend = () => {
            if (!isMounted) return;
            setIsListening(false);
            setVoiceStatus('Restarting...');
            restartTimer = setTimeout(() => {
                if (isMounted) {
                    try { recognition.start(); } catch(e) {}
                }
            }, 500);
        };

        recognition.onerror = (event: any) => {
            if (!isMounted) return;
            if (event.error === 'not-allowed') {
                setVoiceStatus('Mic Denied');
            } else {
                setVoiceStatus('Voice Error');
            }
        };

        recognition.onresult = (event: any) => {
            if (!isMounted) return;
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.toLowerCase().trim();
            
            if (command.includes('start') || command.includes('chalu') || command.includes('chaloo')) {
                if (!isRunningRef.current) {
                    toggleTimerRef.current();
                    speakFeedback("Timer started.");
                }
            } else if (command.includes('stop') || command.includes('roko') || command.includes('band karo')) {
                if (isRunningRef.current) {
                    toggleTimerRef.current();
                    speakFeedback("Timer stopped.");
                }
            } else if (command.includes('lap') || command.includes('chakkar')) {
                 if (isRunningRef.current) {
                    recordLapRef.current();
                    speakFeedback("Lap recorded.");
                }
            }
        };

        try { recognition.start(); } catch (e) {}

        return () => {
            isMounted = false;
            clearTimeout(restartTimer);
            recognition.onend = null;
            recognition.stop();
        };
    }, []);

    // --- Render Helpers ---

    const bestLap = laps.length > 0 ? Math.min(...laps.map(l => l.duration)) : null;
    const worstLap = laps.length > 0 ? Math.max(...laps.map(l => l.duration)) : null;

    const getCurrentBackgroundColor = () => {
        if (alertStatus === 'hit') return '#e74c3c';
        if (alertStatus === 'warning') return '#f39c12';
        return bgImage ? '#121212' : bgColor; 
    };

    const getTitleText = () => {
        if (alertStatus === 'hit') return "TIME'S UP! GOAL ACHIEVED!";
        return customMessage;
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const isAlerting = alertStatus !== 'none';

    return (
        <div 
            className={`flex flex-col items-center justify-center min-h-screen text-white p-4 font-mono select-none transition-colors duration-[800ms] ease-in-out bg-cover bg-center ${isAlerting ? 'bg-blend-overlay' : ''} relative overflow-hidden`}
            style={{ 
                backgroundColor: getCurrentBackgroundColor(),
                backgroundImage: bgImage ? `url(${bgImage})` : 'none'
            }}
        >
            <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none"></div>

            {/* Voice Status */}
            {voiceSupported && (
                <div className={`fixed top-4 left-4 bg-black/70 px-3 py-1 rounded font-bold text-xs z-50 transition-all ${isListening ? 'text-[#1DB954] shadow-[0_0_10px_rgba(29,185,84,0.5)]' : 'text-[#ffcc00]'}`}>
                   {voiceStatus}
                </div>
            )}
            
            {/* Save Status */}
            <div className="absolute top-4 right-4 text-xs sm:text-sm font-bold text-[#1DB954] opacity-80 z-20">
                {saveStatus}
            </div>

            <h2 className="text-3xl sm:text-4xl font-sans font-bold uppercase tracking-[3px] mb-4 z-10 text-center drop-shadow-md px-2">
                {getTitleText()}
            </h2>

            <TimerDisplay time={time} />
            
            <AnalysisDisplay bestLap={bestLap} worstLap={worstLap} />
            
            <Controls 
                isRunning={isRunning} 
                onStartStop={toggleTimer} 
                onReset={resetTimer} 
                onLap={recordLap} 
                canLap={time > 0} 
            />
            
            <LapsList laps={laps} bestLap={bestLap} worstLap={worstLap} />

            <SettingsPanel 
                customMessage={customMessage}
                onMessageChange={setCustomMessage}
                onImageUpload={handleImageUpload}
                thresholdMinutes={thresholdMinutes}
                onThresholdChange={setThresholdMinutes}
                bgColor={bgColor}
                onColorChange={setBgColor}
            />
        </div>
    );
};

export default App;