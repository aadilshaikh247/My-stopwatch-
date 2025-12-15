import React from 'react';
import { formatTime } from '../utils/timeUtils';

interface TimerDisplayProps {
    time: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time }) => {
    const { min, sec, ms } = formatTime(time);

    return (
        <div className="font-mono text-6xl sm:text-7xl font-bold mb-10 tracking-widest select-none z-10 relative drop-shadow-[2px_2px_10px_rgba(0,0,0,0.8)]">
            <span>{min}</span>:<span>{sec}</span>.<span className="text-[#ffcc00] text-3xl sm:text-4xl">{ms}</span>
        </div>
    );
};

export default TimerDisplay;