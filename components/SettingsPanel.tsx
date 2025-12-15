import React from 'react';

interface SettingsPanelProps {
    customMessage: string;
    onMessageChange: (msg: string) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    thresholdMinutes: number;
    onThresholdChange: (val: number) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    customMessage, 
    onMessageChange, 
    onImageUpload,
    thresholdMinutes,
    onThresholdChange
}) => {
    return (
        <div className="absolute bottom-5 flex flex-col gap-3 items-center bg-white/10 p-4 rounded-xl backdrop-blur-md z-20 w-[90%] max-w-[400px] border border-white/20 shadow-lg">
            <input 
                type="text" 
                value={customMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="Apna Text Likhein (e.g. Gym Time)"
                className="p-2 rounded w-full bg-white/80 text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex gap-2 w-full">
                <input 
                    type="number"
                    min="1"
                    value={thresholdMinutes}
                    onChange={(e) => onThresholdChange(Math.max(1, parseInt(e.target.value) || 0))}
                    placeholder="Goal (Min)"
                    className="p-2 rounded w-1/3 bg-white/80 text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="relative w-2/3">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={onImageUpload}
                        className="block w-full text-sm text-gray-300
                          file:mr-4 file:py-2 file:px-2
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-violet-600 file:text-white
                          hover:file:bg-violet-700
                          cursor-pointer
                        "
                    />
                </div>
            </div>
            
            <small className="text-gray-300 text-xs uppercase tracking-wider flex justify-between w-full px-1">
                <span>Set Goal (Minutes)</span>
                <span>Change Photo</span>
            </small>
        </div>
    );
};

export default SettingsPanel;