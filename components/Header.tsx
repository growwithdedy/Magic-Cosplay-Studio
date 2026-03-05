
import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, SettingsIcon } from './icons';
import { AspectRatio, ImageQuality } from '../types';

interface HeaderProps {
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  imageQuality: ImageQuality;
  setImageQuality: (quality: ImageQuality) => void;
  disabled?: boolean;
  savedApiKey: string | null;
  onSaveApiKey: (key: string) => void;
  onClearApiKey: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  aspectRatio, 
  setAspectRatio, 
  imageQuality,
  setImageQuality,
  disabled,
  savedApiKey,
  onSaveApiKey,
  onClearApiKey
}) => {
  const [localKey, setLocalKey] = useState('');
  
  // URL Gambar Utama (Menggunakan RAW URL tanpa token agar permanen)
  // Pastikan repo github 'iyanmcom/Source-magekaz' diset ke PUBLIC.
  const customKeqingUrl = "https://raw.githubusercontent.com/iyanmcom/Source-magekaz/main/x.png";
  
  // Fallback (Avatar cadangan jika gambar utama error/tidak ditemukan)
  const fallbackUrl = "https://api.dicebear.com/9.x/adventurer/svg?seed=Keqing&backgroundColor=b6e3f4";

  const [imgSrc, setImgSrc] = useState(customKeqingUrl);

  useEffect(() => {
    setLocalKey(savedApiKey || '');
  }, [savedApiKey]);

  const handleSave = () => {
    if (localKey.trim()) {
      onSaveApiKey(localKey.trim());
    }
  };

  const handleClear = () => {
    onClearApiKey();
    setLocalKey('');
  };

  const handleImageError = () => {
    // Jika gambar utama gagal dimuat (misal repo private atau link salah), ganti ke fallback
    if (imgSrc !== fallbackUrl) {
        setImgSrc(fallbackUrl);
    }
  };

  const ratios = [
    { label: '1:1', value: AspectRatio.Square },
    { label: '3:4', value: AspectRatio.Portrait },
    { label: '4:3', value: AspectRatio.Landscape },
    { label: '9:16', value: AspectRatio.Tall },
    { label: '16:9', value: AspectRatio.Wide },
  ];

  const qualities = [
    { label: '1K', value: ImageQuality.OneK },
    { label: '2K', value: ImageQuality.TwoK },
    { label: '4K', value: ImageQuality.FourK },
  ];

  return (
    <header className="bg-slate-800 text-white border-b-4 border-black flex flex-col p-6">
      {/* Top Row: Title and Settings */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-start">
          <div className="bg-rose-500 p-1.5 sm:p-2 rounded-xl border-2 border-black shadow-[4px_4px_0_#000] shrink-0">
            <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1 sm:flex-none">
             <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-sm whitespace-nowrap">Magic Cosplay Studio</h1>
                {/* Gambar Header dengan Error Handling */}
                <img 
                  src={imgSrc} 
                  onError={handleImageError}
                  alt="Magic Cosplay Studio Avatar" 
                  className="h-12 sm:h-[72px] w-auto object-contain drop-shadow-md -rotate-6 hover:rotate-0 transition-transform duration-300 shrink-0"
                />
             </div>
             <p className="text-sm font-bold text-slate-400 hidden sm:block">Buat Karakter Favorit Kamu Jadi Nyata</p>
          </div>
        </div>

        {/* API Key Section */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
             <input
                type="password"
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="API Key..."
                className="flex-1 sm:w-64 bg-slate-900 border-2 border-black rounded-lg px-3 py-2 text-white text-sm font-bold placeholder-slate-500 focus:outline-none focus:bg-slate-950 focus:shadow-[2px_2px_0_#000] transition-all"
             />
             <button 
                onClick={handleSave}
                className="bg-emerald-500 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-lg border-2 border-black shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:bg-emerald-600"
             >
                Save
             </button>
             <button 
                onClick={handleClear}
                className="bg-rose-500 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-lg border-2 border-black shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:bg-rose-600"
             >
                Clear
             </button>
        </div>
      </div>
      
      {/* Mobile Subtitle (visible only on small screens) */}
      <div className="pb-4 sm:hidden text-center sm:text-left">
         <span className="text-xs text-slate-400 font-bold uppercase">Buat Karakter Favorit Kamu Jadi Nyata</span>
      </div>

      {/* Bottom Row: Controls */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-8">
            
            {/* Aspect Ratio Selector */}
            <div className="flex items-center space-x-2 min-w-max">
            <span className="text-sm font-black uppercase mr-2 text-rose-400">Rasio:</span>
            <div className="flex space-x-2">
                {ratios.map((r) => (
                    <button
                    key={r.value}
                    onClick={() => !disabled && setAspectRatio(r.value)}
                    disabled={disabled}
                    className={`px-3 py-1.5 text-xs font-bold uppercase border-2 border-black rounded-lg transition-all shadow-[2px_2px_0_#000] ${
                        aspectRatio === r.value
                        ? 'bg-rose-500 text-white translate-x-[2px] translate-y-[2px] shadow-none'
                        : 'bg-slate-700 text-white hover:bg-slate-600 hover:-translate-y-0.5'
                    } ${disabled ? 'opacity-50 cursor-not-allowed shadow-none transform-none' : ''}`}
                    >
                    {r.label}
                    </button>
                ))}
            </div>
            </div>

            {/* Quality Selector */}
            <div className="flex items-center space-x-2 min-w-max sm:pl-6 sm:border-l-4 sm:border-slate-700">
                <span className="text-sm font-black uppercase mr-2 text-amber-400">Kualitas:</span>
                <div className="flex space-x-2">
                    {qualities.map((q) => (
                        <button
                        key={q.value}
                        onClick={() => !disabled && setImageQuality(q.value)}
                        disabled={disabled}
                        className={`px-3 py-1.5 text-xs font-bold uppercase border-2 border-black rounded-lg transition-all shadow-[2px_2px_0_#000] ${
                            imageQuality === q.value
                            ? 'bg-amber-500 text-black translate-x-[2px] translate-y-[2px] shadow-none'
                            : 'bg-slate-700 text-white hover:bg-slate-600 hover:-translate-y-0.5'
                        } ${disabled ? 'opacity-50 cursor-not-allowed shadow-none transform-none' : ''}`}
                        >
                        {q.label}
                        </button>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
