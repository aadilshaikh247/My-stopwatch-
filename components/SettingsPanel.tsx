import React from 'react';

interface SettingsPanelProps {
    customMessage: string;
    onMessageChange: (msg: string) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ customMessage, onMessageChange, onImageUpload }) => {
    return (
        <div className="absolute bottom-5 flex flex-col gap-3 items-center bg-white/10 p-4 rounded-xl backdrop-blur-md z-20 w-[90%] max-w-[400px] border border-white/20 shadow-lg">
            <input 
                type="text" 
                value={customMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="Apna Text Likhein (e.g. Gym Time)"
                className="p-2 rounded w-full bg-white/80 text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="w-full relative">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={onImageUpload}
                    className="block w-full text-sm text-gray-300
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-violet-600 file:text-white
                      hover:file:bg-violet-700
                      cursor-pointer
                    "
                />
            </div>
            <small className="text-gray-300 text-xs uppercase tracking-wider">Change Photo & Text Here</small>
        </div>
    );
};

export default SettingsPanel;