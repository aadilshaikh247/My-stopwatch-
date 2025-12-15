import React from 'react';

interface SettingsPanelProps {
    customMessage: string;
    onMessageChange: (msg: string) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    thresholdMinutes: number;
    onThresholdChange: (val: number) => void;
    bgColor: string;
    onColorChange: (color: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    customMessage, 
    onMessageChange, 
    onImageUpload,
    thresholdMinutes,
    onThresholdChange,
    bgColor,
    onColorChange,
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
            
            <div className="flex gap-2 w-full items-center">
                <input 
                    type="number"
                    min="1"
                    value={thresholdMinutes}
                    onChange={(e) => onThresholdChange(Math.max(1, parseInt(e.target.value) || 0))}
                    placeholder="Goal"
                    className="p-2 rounded w-20 bg-white/80 text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
                
                <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden rounded border-2 border-white/50 bg-black shadow-inner" title="Choose Background Color">
                     <input 
                        type="color"
                        value={bgColor}
                        onChange={(e) => onColorChange(e.target.value)}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                    />
                </div>

                <div className="relative flex-1 min-w-0">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={onImageUpload}
                        className="block w-full text-xs text-gray-300
                          file:mr-2 file:py-2 file:px-2
                          file:rounded-full file:border-0
                          file:text-xs file:font-semibold
                          file:bg-violet-600 file:text-white
                          hover:file:bg-violet-700
                          cursor-pointer
                        "
                    />
                </div>
            </div>
            
            <small className="text-gray-300 text-[10px] uppercase tracking-wider flex justify-between w-full px-1">
                <span>Goal</span>
                <span>Color</span>
                <span>Photo</span>
            </small>
        </div>
    );
};

export default SettingsPanel;