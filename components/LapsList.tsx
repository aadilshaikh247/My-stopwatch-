import React from 'react';
import { formatTime } from '../utils/timeUtils';

interface LapsListProps {
    laps: number[];
}

const LapsList: React.FC<LapsListProps> = ({ laps }) => {
    return (
        <div className="w-[80%] max-w-[400px] max-h-[150px] overflow-y-auto z-10 relative mb-32">
            {laps.length === 0 && (
                <div className="text-gray-400 text-center italic mt-4 drop-shadow-md">
                    No laps recorded
                </div>
            )}
            {laps.map((lapTime, index) => {
                const lapNumber = laps.length - index;
                const { min, sec, ms } = formatTime(lapTime);
                
                return (
                    <div 
                        key={lapNumber} 
                        className="flex justify-between p-2 px-4 mb-[2px] rounded bg-black/40 backdrop-blur-sm border-b border-white/5 text-lg text-gray-200"
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