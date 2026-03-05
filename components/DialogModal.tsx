
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';
import { Language } from '../types';

interface DialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { text: string; language: Language }) => void;
  initialData: { text: string; language: Language };
}

const languages: { id: Language, title: string }[] = [
    { id: 'English', title: 'English' },
    { id: 'Indonesia', title: 'Indonesia' },
    { id: 'Jepang', title: 'Jepang' },
];

const DialogModal: React.FC<DialogModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<Language>('Indonesia');

  useEffect(() => {
    if (isOpen) {
      setText(initialData.text);
      setLanguage(initialData.language);
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    onSave({ text, language });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="dialogModalTitle">
      <div className="relative w-full max-w-md bg-black border-4 border-white shadow-[10px_10px_0_#fff] p-6 sm:p-8">
        <h2 id="dialogModalTitle" className="text-lg sm:text-xl font-bold uppercase tracking-widest mb-4">Isi Dialog Karakter</h2>
        
        <div className="space-y-4">
            <label htmlFor="dialog-input" className="sr-only">Dialog</label>
            <textarea
                id="dialog-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tulis dialog di sini..."
                className="w-full bg-black text-white p-3 border-2 border-white focus:outline-none focus:ring-2 focus:ring-white min-h-[100px] resize-y"
                rows={4}
            />

            <fieldset>
                <legend className="text-sm font-semibold tracking-widest uppercase text-white mb-2">Pilih Bahasa</legend>
                <div className="flex items-center space-x-4">
                    {languages.map(lang => (
                        <div key={lang.id} className="flex items-center">
                            <input
                                id={`lang-${lang.id}`}
                                name="language"
                                type="radio"
                                checked={language === lang.id}
                                onChange={() => setLanguage(lang.id)}
                                className="h-4 w-4 text-sky-500 bg-black border-white focus:ring-sky-500"
                            />
                            <label htmlFor={`lang-${lang.id}`} className="ml-2 block text-sm text-white">{lang.title}</label>
                        </div>
                    ))}
                </div>
            </fieldset>

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

export default DialogModal;
