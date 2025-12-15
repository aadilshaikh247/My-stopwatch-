import React from 'react';
import { formatTime } from '../utils/timeUtils';

export interface LapData {
    id: number;
    duration: number;
    totalTime: number;
}

interface LapsListProps {
    laps: LapData[];
    bestLap: number | null;
    worstLap: number | null;
}

const LapsList: React.FC<LapsListProps> = ({ laps, bestLap, worstLap }) => {
    return (
        <div className="w-[85%] max-w-[400px] max-h-[200px] overflow-y-auto z-10 relative mb-32 custom-scrollbar">
            {laps.length === 0 && (
                <div className="text-gray-400 text-center italic mt-4 drop-shadow-md">
                    No laps recorded
                </div>
            )}
            {laps.map((lap, index) => {
                const lapNumber = laps.length - index;
                const { min, sec, ms } = formatTime(lap.duration);
                
                let bgColorClass = "bg-black/40";
                // Only highlight if there is more than 1 lap to compare
                if (laps.length > 1) {
                    if (lap.duration === bestLap) bgColorClass = "bg-[#1DB954]/30"; // Green tint
                    else if (lap.duration === worstLap) bgColorClass = "bg-[#e74c3c]/30"; // Red tint
                }

                return (
                    <div 
                        key={lap.id} 
                        className={`flex justify-between p-2 px-4 mb-[2px] rounded backdrop-blur-sm border-b border-white/5 text-lg text-gray-200 transition-colors ${bgColorClass}`}
                    >
                        <span className="font-semibold text-white/90">Lap {lapNumber}</span>
                        <span className="font-mono text-white">{min}:{sec}.{ms}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default LapsList;