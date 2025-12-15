import React from 'react';

interface ControlsProps {
    isRunning: boolean;
    onStartStop: () => void;
    onReset: () => void;
    onLap: () => void;
    canLap: boolean;
}

const Controls: React.FC<ControlsProps> = ({ isRunning, onStartStop, onReset, onLap, canLap }) => {
    return (
        <div className="flex gap-5 mb-8 z-10 relative">
            <button
                onClick={onReset}
                className="px-8 py-4 text-xl font-bold rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-all active:scale-95 min-w-[100px] outline-none shadow-lg"
            >
                Reset
            </button>
            
            <button
                onClick={onStartStop}
                className={`px-8 py-4 text-xl font-bold rounded-full text-white transition-all active:scale-95 min-w-[100px] outline-none shadow-lg ${
                    isRunning 
                    ? 'bg-[#e74c3c] hover:bg-red-600' 
                    : 'bg-[#1DB954] hover:bg-green-600'
                }`}
            >
                {isRunning ? 'Stop' : 'Start'}
            </button>

            <button
                onClick={onLap}
                disabled={!canLap}
                className={`px-8 py-4 text-xl font-bold rounded-full text-white transition-all active:scale-95 min-w-[100px] outline-none shadow-lg ${
                    canLap
                    ? 'bg-[#3498db] hover:bg-blue-600 cursor-pointer'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
            >
                Lap
            </button>
        </div>
    );
};

export default Controls;