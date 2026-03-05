
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  initialValue: string;
}

const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose, onSave, initialValue }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setText(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSave = () => {
    onSave(text);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="storyModalTitle">
      <div className="relative w-full max-w-md bg-black border-4 border-white shadow-[10px_10px_0_#fff] p-6 sm:p-8">
        <h2 id="storyModalTitle" className="text-lg sm:text-xl font-bold uppercase tracking-widest mb-4">Tentukan Alur Cerita Scene Ini</h2>
        
        <div className="space-y-4">
            <label htmlFor="story-input" className="sr-only">Alur Cerita</label>
            <textarea
                id="story-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Jelaskan alur cerita singkat untuk video ini..."
                className="w-full bg-black text-white p-3 border-2 border-white focus:outline-none focus:ring-2 focus:ring-white min-h-[100px] resize-y"
                rows={4}
            />
            <button
                onClick={handleSave}
                className="w-full bg-white text-black font-bold py-3 text-center uppercase transition-all duration-200 border-4 border-black shadow-[5px_5px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-none active:translate-y-1 active:translate-x-1"
            >
                OK
            </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default StoryModal;
