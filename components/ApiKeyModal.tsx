import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('gemini_api_key') || '';
      setApiKey(savedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  const handleClear = () => {
    setApiKey('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="apiKeyModalTitle">
      <div className="relative w-full max-w-md bg-slate-800 border-4 border-black shadow-[10px_10px_0_#000] p-6 sm:p-8 rounded-3xl animate-[bounceIn_0.3s_ease-out]">
        <h2 id="apiKeyModalTitle" className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 text-white">Isi API Key</h2>
        <p className="text-sm font-medium text-slate-400 mb-6">
          Please enter your Google Gemini API key. The key will be stored locally in your browser.
        </p>

        <div className="space-y-4">
            <label htmlFor="api-key-input" className="sr-only">API Key</label>
            <input
                id="api-key-input"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your API key here..."
                className="w-full bg-slate-900 text-white p-4 border-4 border-black rounded-xl focus:outline-none focus:bg-slate-950 focus:shadow-[4px_4px_0_#000] transition-all placeholder-slate-500"
            />
            <div className="flex items-center space-x-4 pt-2">
                <button
                    onClick={handleSave}
                    className="flex-1 bg-sky-500 text-white font-black py-3 rounded-xl text-center uppercase transition-all duration-200 border-4 border-black shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-none active:translate-y-1 active:translate-x-1"
                >
                    Save Key
                </button>
                 <button
                    onClick={handleClear}
                    type="button"
                    className="flex-1 bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-center uppercase transition-colors duration-200 border-4 border-slate-600 hover:border-black hover:text-white"
                >
                    Clear
                </button>
            </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-rose-500 text-white p-1 rounded-lg border-2 border-black shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ApiKeyModal;