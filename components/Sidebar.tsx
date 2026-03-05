import React, { useState } from 'react';
import { Theme, Background, PromptOptions, CamShot, From, Action, Gender, MovieStyle } from '../types';
import OptimizedImage from './OptimizedImage';
import {
  CameraIcon,
  SunIcon,
  PencilIcon,
  CubeIcon,
  MixIcon,
  StudioIcon,
  PosterIcon,
  EventIcon,
  CloseUpIcon,
  MediumIcon,
  MediumShotIcon,
  WideShotIcon,
  JapanIcon,
  ChinaIcon,
  RussiaIcon,
  UKIcon,
  NaskahIcon,
  PoseIcon,
  BicaraIcon,
  SantaiIcon,
  FreeTextIcon,
  GirlIcon,
  BoyIcon,
  NonIcon,
  WomenIcon,
  ManIcon,
  EightKIcon,
  FlatDesignIcon,
  AnimeIcon
} from './icons';

interface SidebarProps {
  activeTabIndex: number;
  onImageUpload: (file: File, index?: number) => void;
  promptOptions: PromptOptions;
  setPromptOptions: React.Dispatch<React.SetStateAction<PromptOptions>>;
  onGenerate: () => void;
  onMovieGenerate: () => void;
  movieThemeBackground: string;
  setMovieThemeBackground: (value: string) => void;
  isGenerating: boolean;
  hasSourceImage: boolean;
  sourceImage: {url: string, mimeType: string} | null;
  convertSourceImages?: ({url: string, mimeType: string} | null)[];
  editedImages: string[] | null;
  onOpenFreeBackgroundModal: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTabIndex,
  onImageUpload,
  promptOptions,
  setPromptOptions,
  onGenerate,
  onMovieGenerate,
  movieThemeBackground,
  setMovieThemeBackground,
  isGenerating,
  hasSourceImage,
  sourceImage,
  convertSourceImages,
  editedImages,
  onOpenFreeBackgroundModal
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const isMovieTab = activeTabIndex === 4;
  const isConvertTab = activeTabIndex === 5;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number = 0) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file, index);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>, index: number = 0) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>, index: number = 0) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragIndex(null);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file, index);
    }
  };

  const OptionButton = <T extends string>({
    value,
    currentValue,
    onClick,
    icon,
    label,
    ariaLabel,
    disabled = false,
  }: {
    value: T;
    currentValue: T;
    onClick: (value: T) => void;
    icon: React.ReactNode;
    label: string;
    ariaLabel: string;
    disabled?: boolean;
  }) => {
    const isActive = currentValue === value;
    const disabledClasses = 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-600 text-slate-500';
    // Active: Blue background, pressed down (no shadow)
    // Inactive: Dark background, raised (shadow)
    const activeClasses = isActive 
        ? 'bg-sky-500 text-white translate-x-[2px] translate-y-[2px] shadow-none' 
        : 'bg-slate-700 text-slate-200 hover:bg-slate-600 shadow-[4px_4px_0_#000] hover:-translate-y-0.5 hover:-translate-x-0.5';
    
    return (
      <button
        onClick={() => !disabled && onClick(value)}
        disabled={disabled}
        className={`flex flex-col items-center justify-center w-full aspect-square sm:aspect-auto sm:h-20 transition-all border-2 border-black rounded-xl ${
          disabled ? disabledClasses : activeClasses
        }`}
        aria-label={ariaLabel}
        aria-pressed={isActive}
        aria-disabled={disabled}
      >
        <div className="transform scale-90 sm:scale-100">{icon}</div>
        <span className="text-[10px] sm:text-xs font-bold uppercase mt-1 leading-tight">{label}</span>
      </button>
    );
  };
  
  // Render function for upload boxes
  const renderUploadBox = (imgSource: {url: string, mimeType: string} | null, index: number = 0, isSmall: boolean = false) => {
    const isThisDragging = isDragging && dragIndex === index;
    const id = `file-upload-${index}`;

    return (
        <label 
          key={index}
          htmlFor={id} 
          className={`relative flex flex-col items-center justify-center w-full ${isSmall ? 'aspect-square' : 'aspect-[4/3]'} cursor-pointer transition-all overflow-hidden border-4 border-black rounded-2xl shadow-[6px_6px_0_#000] ${
            isThisDragging ? 'bg-sky-900' : 'bg-slate-700 hover:bg-slate-600'
          }`}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
        >
          {imgSource ? (
            <>
              <OptimizedImage
                src={imgSource.url}
                alt={`Uploaded preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity duration-300">
                <CameraIcon className="w-8 h-8 mb-1 drop-shadow-md" />
                <span className="text-xs font-bold text-center px-1 drop-shadow-md">Ganti</span>
              </div>
            </>
          ) : (
            <>
              <CameraIcon className={`${isSmall ? 'w-8 h-8' : 'w-12 h-12'} text-slate-400 mb-2`} />
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 text-center px-2">{isSmall ? `Slot ${index + 1}` : 'Drag & drop'}</span>
            </>
          )}
          <input id={id} name={id} type="file" className="sr-only" onChange={(e) => handleFileChange(e, index)} accept="image/*" />
        </label>
    );
  }

  return (
    <aside className={`w-full ${isMovieTab ? 'lg:w-[26rem]' : 'lg:w-80'} lg:flex-shrink-0 bg-slate-800 p-6 flex flex-col space-y-8 border-r-4 border-black`}>
      <div className="space-y-3">
        <h3 className="text-sm font-black tracking-widest uppercase text-slate-900 bg-amber-400 inline-block px-2 py-1 rounded border-2 border-black shadow-[2px_2px_0_#000]">UPLOAD FILES</h3>
        
        {isConvertTab ? (
            <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map(i => renderUploadBox(convertSourceImages ? convertSourceImages[i] : null, i, true))}
            </div>
        ) : (
            renderUploadBox(sourceImage, 0, false)
        )}
      </div>

      {!isConvertTab && (
          <div className="space-y-3">
            <h3 className="text-sm font-black tracking-widest uppercase text-slate-900 bg-rose-400 inline-block px-2 py-1 rounded border-2 border-black shadow-[2px_2px_0_#000]">CAM SHOT</h3>
            {isMovieTab && (
              <p className="text-xs font-bold text-slate-400">
                Pilih sudut pandang kamera untuk memulai adegan film Anda.
              </p>
            )}
            <div className="grid grid-cols-4 gap-3">
               <OptionButton value={CamShot.CloseUp} currentValue={promptOptions.camShot} onClick={v => setPromptOptions(p => ({ ...p, camShot: v }))} label="Close Up" icon={<CloseUpIcon className="w-6 h-6" />} ariaLabel="Select Close Up camera shot" />
               <OptionButton value={CamShot.Medium} currentValue={promptOptions.camShot} onClick={v => setPromptOptions(p => ({ ...p, camShot: v }))} label="Medium" icon={<MediumIcon className="w-6 h-6" />} ariaLabel="Select Medium camera shot" />
               <OptionButton value={CamShot.MediumShot} currentValue={promptOptions.camShot} onClick={v => setPromptOptions(p => ({ ...p, camShot: v }))} label="M. Shot" icon={<MediumShotIcon className="w-6 h-6" />} ariaLabel="Select Medium Shot camera shot" />
               <OptionButton value={CamShot.WideShot} currentValue={promptOptions.camShot} onClick={v => setPromptOptions(p => ({ ...p, camShot: v }))} label="Wide" icon={<WideShotIcon className="w-6 h-6" />} ariaLabel="Select Wide camera shot" />
            </div>
          </div>
      )}
      
      {isMovieTab && (
        <>
          <div className="space-y-3">
            <h3 className="text-sm font-black tracking-widest uppercase text-slate-900 bg-purple-400 inline-block px-2 py-1 rounded border-2 border-black shadow-[2px_2px_0_#000]">Style</h3>
            <div className="grid grid-cols-4 gap-3">
                <OptionButton 
                  value={MovieStyle.EightK} 
                  currentValue={promptOptions.movieStyle || MovieStyle.EightK} 
                  onClick={v => setPromptOptions(p => ({ ...p, movieStyle: v }))} 
                  label="8K" 
                  icon={<EightKIcon className="w-6 h-6" />} 
                  ariaLabel="Select 8K Quality Style" 
                />
                <OptionButton 
                  value={MovieStyle.FlatDesign} 
                  currentValue={promptOptions.movieStyle || MovieStyle.EightK} 
                  onClick={v => setPromptOptions(p => ({ ...p, movieStyle: v }))} 
                  label="Flat" 
                  icon={<FlatDesignIcon className="w-6 h-6" />} 
                  ariaLabel="Select Flat Design Style" 
                />
                <OptionButton 
                  value={MovieStyle.ThreeDCGI} 
                  currentValue={promptOptions.movieStyle || MovieStyle.EightK} 
                  onClick={v => setPromptOptions(p => ({ ...p, movieStyle: v }))} 
                  label="3D CGI" 
                  icon={<CubeIcon className="w-6 h-6" />} 
                  ariaLabel="Select 3D CGI Style" 
                />
                <OptionButton 
                  value={MovieStyle.Anime} 
                  currentValue={promptOptions.movieStyle || MovieStyle.EightK} 
                  onClick={v => setPromptOptions(p => ({ ...p, movieStyle: v }))} 
                  label="Anime" 
                  icon={<AnimeIcon className="w-6 h-6" />} 
                  ariaLabel="Select Anime Style" 
                />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-black tracking-widest uppercase text-slate-900 bg-green-400 inline-block px-2 py-1 rounded border-2 border-black shadow-[2px_2px_0_#000]">TITLE STORY</h3>
            <textarea
              value={movieThemeBackground}
              onChange={(e) => setMovieThemeBackground(e.target.value)}
              placeholder="Contoh: Petualangan di Hutan Ajaib..."
              className="w-full bg-slate-700 text-white p-4 border-4 border-black rounded-xl shadow-[4px_4px_0_#000] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all min-h-[100px] resize-y text-sm font-medium placeholder-slate-400"
              rows={4}
            />
          </div>
          <button
            onClick={onMovieGenerate}
            disabled={isGenerating || !hasSourceImage}
            className="w-full bg-amber-400 text-black font-black text-lg py-4 rounded-xl uppercase transition-all duration-200 border-4 border-black shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-y-1 hover:-translate-x-1 active:shadow-none active:translate-y-1 active:translate-x-1 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:border-slate-500 disabled:transform-none"
          >
            {isGenerating ? 'Generating...' : 'Generate Story'}
          </button>
        </>
      )}

      {!isMovieTab && !isConvertTab && (
      <>
        <div className="space-y-3">
          <h3 className="text-sm font-black tracking-widest uppercase text-slate-900 bg-indigo-400 inline-block px-2 py-1 rounded border-2 border-black shadow-[2px_2px_0_#000]">GENDER</h3>
          <div className="grid grid-cols-5 gap-2">
            <OptionButton value={Gender.Women} currentValue={promptOptions.gender} onClick={v => setPromptOptions(p => ({ ...p, gender: v }))} label="Women" icon={<WomenIcon className="w-6 h-6" />} ariaLabel="Select Women gender" />
            <OptionButton value={Gender.Man} currentValue={promptOptions.gender} onClick={v => setPromptOptions(p => ({ ...p, gender: v }))} label="Man" icon={<ManIcon className="w-6 h-6" />} ariaLabel="Select Man gender" />
            <OptionButton value={Gender.Girl} currentValue={promptOptions.gender} onClick={v => setPromptOptions(p => ({ ...p, gender: v }))} label="Girl" icon={<GirlIcon className="w-6 h-6" />} ariaLabel="Select Girl gender" />
            <OptionButton value={Gender.Boy} currentValue={promptOptions.gender} onClick={v => setPromptOptions(p => ({ ...p, gender: v }))} label="Boy" icon={<BoyIcon className="w-6 h-6" />} ariaLabel="Select Boy gender" />
            <OptionButton value={Gender.Non} currentValue={promptOptions.gender} onClick={v => setPromptOptions(p => ({ ...p, gender: v }))} label="Non" icon={<NonIcon className="w-6 h-6" />} ariaLabel="Select Non-human gender" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black tracking-widest uppercase text-slate-900 bg-orange-400 inline-block px-2 py-1 rounded border-2 border-black shadow-[2px_2px_0_#000]">THEME</h3>
          <div className="grid grid-cols-4 gap-3">
            <OptionButton value={Theme.Realistic} currentValue={promptOptions.theme} onClick={v => setPromptOptions(p => ({ ...p, theme: v }))} label="Real" icon={<SunIcon className="w-6 h-6" />} ariaLabel="Select Real theme" />
            <OptionButton value={Theme.TwoDAnimations} currentValue={promptOptions.theme} onClick={v => setPromptOptions(p => ({ ...p, theme: v }))} label="2D Anim" icon={<PencilIcon className="w-6 h-6" />} ariaLabel="Select 2D Animations theme" />
            <OptionButton value={Theme.ThreeDAnimation} currentValue={promptOptions.theme} onClick={v => setPromptOptions(p => ({ ...p, theme: v }))} label="3D Anim" icon={<CubeIcon className="w-6 h-6" />} ariaLabel="Select 3D Animation theme" />
            <OptionButton value={Theme.Mix} currentValue={promptOptions.theme} onClick={v => setPromptOptions(p => ({ ...p, theme: v }))} label="Mix" icon={<MixIcon className="w-6 h-6" />} ariaLabel="Select Mix theme" />
          </div>
        </div>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${promptOptions.theme === Theme.Realistic ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-3">
            <h3 className="text-sm font-black tracking-widest uppercase text-slate-900 bg-teal-400 inline-block px-2 py-1 rounded border-2 border-black shadow-[2px_2px_0_#000]">FROM</h3>
            <div className="grid grid-cols-4 gap-3">
              <OptionButton disabled={promptOptions.gender === Gender.Non} value={From.Jepang} currentValue={promptOptions.from} onClick={v => setPromptOptions(p => ({ ...p, from: v }))} label="Jepang" icon={<JapanIcon className="w-6 h-6" />} ariaLabel="Select Jepang origin" />
              <OptionButton disabled={promptOptions.gender === Gender.Non} value={From.China} currentValue={promptOptions.from} onClick={v => setPromptOptions(p => ({ ...p, from: v }))} label="China" icon={<ChinaIcon className="w-6 h-6" />} ariaLabel="Select China origin" />
              <OptionButton disabled={promptOptions.gender === Gender.Non} value={From.Rusia} currentValue={promptOptions.from} onClick={v => setPromptOptions(p => ({ ...p, from: v }))} label="Rusia" icon={<RussiaIcon className="w-6 h-6" />} ariaLabel="Select Rusia origin" />
              <OptionButton disabled={promptOptions.gender === Gender.Non} value={From.Inggris} currentValue={promptOptions.from} onClick={v => setPromptOptions(p => ({ ...p, from: v }))} label="Inggris" icon={<UKIcon className="w-6 h-6" />} ariaLabel="Select Inggris origin" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black tracking-widest uppercase text-slate-900 bg-pink-400 inline-block px-2 py-1 rounded border-2 border-black shadow-[2px_2px_0_#000]">BACKGROUND</h3>
          <div className="grid grid-cols-4 gap-3">
            <OptionButton value={Background.Studio} currentValue={promptOptions.background} onClick={v => setPromptOptions(p => ({ ...p, background: v }))} label="Studio" icon={<StudioIcon className="w-6 h-6" />} ariaLabel="Select Studio background" />
            <OptionButton value={Background.Poster} currentValue={promptOptions.background} onClick={v => setPromptOptions(p => ({ ...p, background: v }))} label="Poster" icon={<PosterIcon className="w-6 h-6" />} ariaLabel="Select Poster background" />
            <OptionButton value={Background.Event} currentValue={promptOptions.background} onClick={v => setPromptOptions(p => ({ ...p, background: v }))} label="Event" icon={<EventIcon className="w-6 h-6" />} ariaLabel="Select Event background" />
            <OptionButton value={Background.Free} currentValue={promptOptions.background} onClick={onOpenFreeBackgroundModal} label="Free" icon={<FreeTextIcon className="w-6 h-6" />} ariaLabel="Select Free background" />
          </div>
        </div>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${promptOptions.background === Background.Studio ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-3">
            <h3 className="text-sm font-black tracking-widest uppercase text-slate-900 bg-lime-400 inline-block px-2 py-1 rounded border-2 border-black shadow-[2px_2px_0_#000]">ACTION</h3>
            <div className="grid grid-cols-4 gap-3">
              <OptionButton value={Action.Naskah} currentValue={promptOptions.action} onClick={v => setPromptOptions(p => ({ ...p, action: v }))} label="Naskah" icon={<NaskahIcon className="w-6 h-6" />} ariaLabel="Select Naskah action" />
              <OptionButton value={Action.Pose} currentValue={promptOptions.action} onClick={v => setPromptOptions(p => ({ ...p, action: v }))} label="Pose" icon={<PoseIcon className="w-6 h-6" />} ariaLabel="Select Pose action" />
              <OptionButton value={Action.Bicara} currentValue={promptOptions.action} onClick={v => setPromptOptions(p => ({ ...p, action: v }))} label="Bicara" icon={<BicaraIcon className="w-6 h-6" />} ariaLabel="Select Bicara action" />
              <OptionButton value={Action.Santai} currentValue={promptOptions.action} onClick={v => setPromptOptions(p => ({ ...p, action: v }))} label="Santai" icon={<SantaiIcon className="w-6 h-6" />} ariaLabel="Select Santai action" />
            </div>
          </div>
        </div>
      </>
      )}

      <div className="flex-grow"></div>

      {!isMovieTab && (
        <button
          onClick={onGenerate}
          // For Convert tab, enable if any image is present in the slots. For others, check single sourceImage
          disabled={isGenerating || (isConvertTab ? !convertSourceImages?.some(i => i !== null) : !hasSourceImage)}
          className="w-full bg-amber-400 text-black font-black text-xl py-5 rounded-2xl uppercase transition-all duration-200 border-4 border-black shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-y-1 hover:-translate-x-1 active:shadow-none active:translate-y-1 active:translate-x-1 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:border-slate-500 disabled:transform-none"
        >
          {isGenerating ? 'Generating...' : isConvertTab ? 'Convert All' : 'Generate'}
        </button>
      )}
    </aside>
  );
};

export default React.memo(Sidebar);