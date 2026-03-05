import React, { useState, useEffect } from 'react';
import { EyeIcon, DownloadIcon, PencilSquareIcon, ArrowPathIcon } from './icons';
import Lightbox from './Lightbox';
import OptimizedImage from './OptimizedImage';
import { ImageQuality } from '../types';

interface MainContentProps {
  editedImages: string[] | null;
  isLoading: boolean;
  onEditImage: (index: number) => void;
  editingIndex: number | null;
  sourceImage: {url: string, mimeType: string} | null;
  activeTabIndex: number;
  onDeleteMovieImage: (index: number) => void;
  onOpenEditModal: (index: number) => void;
  imageQuality: ImageQuality;
}

const buttonClasses = {
  base: "flex-1 text-xs font-bold py-2 px-2 text-center uppercase transition-all duration-200 border-2 border-black rounded-lg flex items-center justify-center space-x-2 shadow-[2px_2px_0_#000]",
  active: "bg-slate-700 text-white hover:bg-slate-600 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
  disabled: "bg-slate-800 text-slate-500 border-slate-600 shadow-none cursor-not-allowed transform-none",
};

const thinkingMessages = [
  'Menganalisis fitur karakter...',
  'Menentukan komposisi visual...',
  'Memilih palet warna yang sesuai...',
  'Merender latar belakang...',
  'Menyesuaikan pencahayaan & bayangan...',
  'Membuat pose dinamis...',
  'Memberikan sentuhan akhir...',
  'Hampir selesai...'
];

const MainContent: React.FC<MainContentProps> = ({ editedImages, isLoading, onEditImage, editingIndex, sourceImage, activeTabIndex, onDeleteMovieImage, onOpenEditModal, imageQuality }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(thinkingMessages[0]);
  const [imagesVisible, setImagesVisible] = useState(false);
  const isMovieTab = activeTabIndex === 4;
  const isConvertTab = activeTabIndex === 5;

  useEffect(() => {
    if (isLoading) {
      setLoadingMessage(thinkingMessages[0]); // Reset on start
      let messageIndex = 0;
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % thinkingMessages.length;
        setLoadingMessage(thinkingMessages[messageIndex]);
      }, 1800);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    if (editedImages) {
      const timer = setTimeout(() => setImagesVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setImagesVisible(false);
    }
  }, [editedImages]);


  const openLightbox = (index: number) => {
    if (editedImages && editedImages[index]) {
      setLightboxIndex(index);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const renderEditButton = (index: number) => {
    const isThisOneEditing = editingIndex === index;
    const isAnyEditing = editingIndex !== null;
    const isDisabled = isThisOneEditing || isAnyEditing;

    const handleClick = () => {
        if (isMovieTab) {
            onOpenEditModal(index);
        } else {
            // Logic for Convert tab "Ubah" is handled in App.tsx via onEditImage
            // It will trigger a regeneration of that specific slot
            onEditImage(index);
        }
    };

    return (
        <button 
            onClick={handleClick} 
            disabled={isDisabled}
            className={`${buttonClasses.base} ${isDisabled ? buttonClasses.disabled : buttonClasses.active}`}
        >
            {isThisOneEditing ? (
                 <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
            ) : <PencilSquareIcon className="w-4 h-4" />}
            <span>{isThisOneEditing ? '...' : 'Ubah'}</span>
        </button>
    );
  }

  // Determine how many slots to render.
  // Movie tab uses 5. Standard and Convert now use 4.
  const numberOfSlots = isMovieTab ? 5 : 4;

  return (
    <main className="relative flex-1 p-4 sm:p-8 bg-slate-900 flex items-center justify-center min-h-[500px]">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-10 p-4 backdrop-blur-sm">
             {sourceImage && !isConvertTab && (
                <div className={`relative w-full max-w-[150px] ${isMovieTab ? 'aspect-[16/9]' : 'aspect-[2/3]'} overflow-hidden border-4 border-black rounded-xl shadow-[6px_6px_0_#000] bg-slate-800`}>
                    <OptimizedImage
                        src={sourceImage.url}
                        alt="Processing"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white"></div>
                    </div>
                </div>
            )}
            {isConvertTab && (
                <div className="flex space-x-2 mb-4">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
                </div>
            )}
            <p className="text-black mt-6 text-center font-bold bg-amber-300 px-4 py-2 border-2 border-black rounded-lg shadow-[3px_3px_0_#000]" style={{ maxWidth: '300px' }}>{loadingMessage}</p>
          </div>
      )}
      
      <div className={`w-full grid gap-8 ${isMovieTab ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'} max-w-4xl`}>
        {Array(numberOfSlots).fill(null).map((_, index) => {
          const imageSrc = editedImages ? editedImages[index] : null;
          
          if (!imageSrc && !isLoading && !editedImages) return null;
          
          if (!imageSrc) return null;
          
          const extension = 'jpg';
          
          // Random slight rotation for Polaroid effect
          const rotation = index % 2 === 0 ? '-rotate-1' : 'rotate-1';

          return (
            <div key={index} className={`transform transition-all duration-500 ease-out ${ imagesVisible && imageSrc ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8' }`} style={{ transitionDelay: `${index * 100}ms` }}>
                <div className={`group relative w-full bg-slate-800 p-2 pb-10 border-4 border-black shadow-[8px_8px_0_#000] ${rotation} hover:rotate-0 hover:scale-[1.02] transition-transform duration-300`}>
                    <div className="w-full aspect-[2/3] overflow-hidden border-2 border-black bg-slate-900 relative">
                        <OptimizedImage 
                            src={imageSrc}
                            alt={`Edited variation ${index + 1}`} 
                            className="w-full h-full object-cover" 
                        />
                         {editingIndex === index && ( 
                             <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-10 p-4 text-center"> 
                                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white mb-2"></div>
                                <p className="text-black text-xs font-bold bg-amber-300 px-2 py-1 border border-black rounded">Mengubah...</p> 
                             </div> 
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 pointer-events-none">
                             {/* Actions overlay */}
                        </div>
                    </div>
                    
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 px-2">
                        <button onClick={() => openLightbox(index)} className="bg-slate-700 text-white p-1.5 rounded border border-black hover:bg-slate-600 transition-colors" title="View">
                             <EyeIcon className="w-4 h-4" />
                        </button>
                        <a href={imageSrc} download={`keqing-wangy-edit-${index + 1}.${extension}`} className="bg-slate-700 text-white p-1.5 rounded border border-black hover:bg-green-600 transition-colors" title="Download">
                            <DownloadIcon className="w-4 h-4" />
                        </a>
                    </div>
                </div>
                <div className="mt-4 flex justify-center px-4">
                  {renderEditButton(index)}
                </div>
            </div>
          );
        })}
      </div>
      {lightboxIndex !== null && editedImages && (
        <Lightbox
          images={editedImages.filter((img): img is string => img !== null)}
          startIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </main>
  );
};

export default React.memo(MainContent);