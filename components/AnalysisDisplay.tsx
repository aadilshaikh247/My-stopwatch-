import React from 'react';
import { formatTime } from '../utils/timeUtils';

interface AnalysisDisplayProps {
    bestLap: number | null;
    worstLap: number | null;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ bestLap, worstLap }) => {
    const format = (time: number | null) => {
        if (time === null) return "--:--.--";
        const { min, sec, ms } = formatTime(time);
        return `${min}:${sec}.${ms}`;
    };

    return (
        <div className="flex gap-8 mb-6 font-bold text-sm sm:text-base z-10 relative drop-shadow-md">
            <div className="flex flex-col items-center">
                <span className="text-gray-300 uppercase text-xs tracking-wider mb-1">Best Lap</span>
                <span className="text-[#1DB954] text-2xl font-mono tracking-wide">{format(bestLap)}</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-gray-300 uppercase text-xs tracking-wider mb-1">Worst Lap</span>
                <span className="text-[#e74c3c] text-2xl font-mono tracking-wide">{format(worstLap)}</span>
            </div>
        </div>
    );
};

export default AnalysisDisplay;