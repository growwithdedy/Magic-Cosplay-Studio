import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { PromptOptions, Theme, Background, CamShot, From, Action, Gender, MovieStyle, MovieCanvasOptions, AspectRatio, ImageQuality } from './types';
import ErrorModal from './components/ErrorModal';
import FreeBackgroundModal from './components/FreeBackgroundModal';
import EditModal from './components/EditModal';

export type TabState = {
  sourceImage: {url: string, mimeType: string} | null; // Keep for tabs 0-4
  convertSourceImages: ({url: string, mimeType: string} | null)[]; // NEW: For tab 5 (4 slots)
  editedImages: string[] | null; // Array of Blob URLs
  isLoading: boolean;
  promptOptions: PromptOptions;
  editingIndex: number | null;
  movieThemeBackground: string;
  movieCanvasOptions: MovieCanvasOptions[];
}

// Helper to convert Blob URL back to Base64 for API calls, now returns mimeType too
const blobUrlToBase64 = async (blobUrl: string): Promise<{ base64: string, mimeType: string }> => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({ base64: base64String, mimeType: blob.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper to convert Base64 from API to Blob URL for efficient State storage
// OPTIMIZED: Uses fetch API to handle large Base64 strings asynchronously without blocking the main thread
const base64ToBlobUrl = async (base64Data: string, mimeType: string): Promise<string> => {
  const res = await fetch(`data:${mimeType};base64,${base64Data}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

// Helper to detect closest aspect ratio from image dimensions
const detectClosestAspectRatio = (width: number, height: number): AspectRatio => {
    const ratio = width / height;
    const targets = [
        { val: AspectRatio.Square, ratio: 1 },
        { val: AspectRatio.Portrait, ratio: 3/4 },
        { val: AspectRatio.Landscape, ratio: 4/3 },
        { val: AspectRatio.Tall, ratio: 9/16 },
        { val: AspectRatio.Wide, ratio: 16/9 },
    ];
    
    const closest = targets.reduce((prev, curr) => 
        Math.abs(curr.ratio - ratio) < Math.abs(prev.ratio - ratio) ? curr : prev
    );
    return closest.val;
};

// Helper to load image and get dimensions
const getImageDimensions = (url: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = url;
    });
};

const promptInstructions = {
    camShot: {
        [CamShot.CloseUp]: "Use a close-up shot that captures the character from the chest up, focusing on facial details and expression.",
        [CamShot.Medium]: "Use a medium shot, framing the character from the waist up.",
        [CamShot.MediumShot]: "Use a medium long shot, framing the character from roughly the knees up.",
        [CamShot.WideShot]: "Use a wide shot to capture the full body of the character and a significant portion of the surrounding environment.",
    },
    from: {
        [From.Jepang]: "The cosplayer should have physical features typical of a person from Japan.",
        [From.China]: "The cosplayer should have physical features typical of a person from China.",
        [From.Rusia]: "The cosplayer should have physical features typical of a person from Russia.",
        [From.Inggris]: "The cosplayer should have physical features typical of a person from England.",
    },
    background: {
        realistic: {
            [Background.Studio]: "The photo is set on an outdoor film shoot location, complete with professional film shooting equipment.",
            [Background.Poster]: "The cosplayer is standing next to a large movie poster which features an epic illustration of the same character they are cosplaying.",
            [Background.Event]: "The photo is taken at a bustling fan event, like a comic convention. The cosplayer is the center of attention, surrounded by adoring fans.",
        },
        animation: {
            [Background.Studio]: "The scene is an outdoor film set during a movie shoot, including professional studio lights, cameras, and other filmmaking equipment.",
            [Background.Poster]: "The scene features the cosplayer character standing proudly next to or in front of a large, visually striking movie poster. The poster itself should feature an epic depiction of the same character.",
            [Background.Event]: "The scene is a fan event, like a comic convention or a movie premiere. The cosplayer character is the center of attention, looking out at a crowd of adoring fans who are cheering and taking photos. The atmosphere should be energetic and exciting.",
        }
    },
    action: {
        [Action.Naskah]: "The character is focused on reading a script, holding it in their hands.",
        [Action.Pose]: "The character is striking a simple yet elegant pose, as if demonstrating a scene from a movie.",
        [Action.Bicara]: "The character is engaged in a close and clear conversation with a film crew member. Create a pose that shows the two people talking to each other.",
        [Action.Santai]: "The character is sitting down, taking a break, and casually drinking from a cup or bottle.",
    },
    theme: {
        [Theme.TwoDAnimations]: "Render the scene in a 2D animation style, like high-quality anime. Use clean lines, vibrant colors, and dynamic compositions.",
        [Theme.ThreeDAnimation]: "Render the scene in a 3D animation style, similar to a modern animated film. Focus on depth, soft lighting, and stylized textures.",
        [Theme.Mix]: "Analyze the uploaded image to identify the main subject's key features (physical characteristics, clothing, accessories, colors). Create a single, unified illustration that features two versions of this character standing side-by-side within the same scene. One version should be a photorealistic depiction of a real human cosplayer (male or female) that looks like an actual high-resolution photograph, capturing natural human features and realistic skin and fabric textures. The other version should be a 3D animation-style render of the character. Ensure both characters are integrated seamlessly into the same background and appear to be interacting or posing together within a single frame:",
    },
    movieStyle: {
        [MovieStyle.EightK]: "STYLE: LIVE-ACTION CINEMATIC PHOTOGRAPHY. The image must be a real photo of a real human actor. Focus on raw realism, complex lighting, ultra-realistic skin texture (pores, vellus hair), and optical camera details (dof, bokeh). It should look like a frame from a high-budget live-action movie, NOT a 3D render or painting.",
        [MovieStyle.FlatDesign]: "STYLE: FLAT DESIGN VECTOR ART. The image must be a 2D flat illustration. Use solid bold colors, clean vector lines, and minimalist shapes. DO NOT use gradients, shadows, or 3D depth. It should look like a modern graphic design poster.",
        [MovieStyle.ThreeDCGI]: "STYLE: 3D CGI ANIMATION. The image must be a high-end 3D render. Focus on subsurface scattering, volumetric lighting, ray-tracing, and soft, stylized 3D textures. It should look like a frame from a modern blockbuster 3D animated movie (Pixar/Disney style).",
        [MovieStyle.Anime]: "STYLE: MODERN JAPANESE ANIME. The image must be a high-quality 2D anime illustration. Use sharp line art, vibrant cel-shading, and dramatic composition. It should look like a screenshot from a high-budget modern anime series (e.g., Ufotable style).",
    }
};

const createInitialTabState = (): TabState => ({
  sourceImage: null,
  convertSourceImages: Array(4).fill(null), // Initialize 4 empty slots
  editedImages: null,
  isLoading: false,
  promptOptions: {
    theme: Theme.Realistic,
    gender: Gender.Girl,
    background: Background.Studio,
    camShot: CamShot.WideShot,
    from: From.Jepang,
    action: Action.Naskah,
    aspectRatio: AspectRatio.Portrait,
    imageQuality: ImageQuality.OneK, // Default to 1K
    freeBackgroundText: '',
    movieStyle: MovieStyle.EightK,
  },
  editingIndex: null,
  movieThemeBackground: '',
  movieCanvasOptions: Array(5).fill(null).map(() => ({
    edit: '',
  })),
});

// Process image using Blob URL as source
const processImageToRatio = (sourceImageUrl: string, aspectRatio: AspectRatio): Promise<{data: string, mimeType: string}> => {
  return new Promise((resolve, reject) => {
    // Approximate target dimensions for preprocessing canvas
    let targetWidth = 1024;
    let targetHeight = 1024;

    switch (aspectRatio) {
        case AspectRatio.Square: targetWidth = 1024; targetHeight = 1024; break;
        case AspectRatio.Portrait: targetWidth = 768; targetHeight = 1024; break;
        case AspectRatio.Landscape: targetWidth = 1024; targetHeight = 768; break;
        case AspectRatio.Tall: targetWidth = 720; targetHeight = 1280; break;
        case AspectRatio.Wide: targetWidth = 1280; targetHeight = 720; break;
        default: targetWidth = 1024; targetHeight = 1024;
    }

    const outputMimeType = 'image/png'; 
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      const canvasAspectRatio = targetWidth / targetHeight;
      const imageAspectRatio = img.width / img.height;

      let drawWidth = targetWidth;
      let drawHeight = targetHeight;

      if (imageAspectRatio > canvasAspectRatio) {
        drawWidth = targetWidth;
        drawHeight = targetWidth / imageAspectRatio;
      } else {
        drawHeight = targetHeight;
        drawWidth = targetHeight * imageAspectRatio;
      }

      const x = (targetWidth - drawWidth) / 2;
      const y = (targetHeight - drawHeight) / 2;

      ctx.drawImage(img, x, y, drawWidth, drawHeight);
      
      const dataUri = canvas.toDataURL(outputMimeType);
      const base64Data = dataUri.split(',')[1];
      
      resolve({ data: base64Data, mimeType: outputMimeType });
    };
    img.onerror = (error) => {
      reject(new Error(`Image loading failed for preprocessing: ${error}`));
    };
    // Load directly from Blob URL
    img.src = sourceImageUrl;
  });
};


const App: React.FC = () => {
  // Update state to hold 6 tabs (0-3: Standard, 4: Movie, 5: Convert)
  const [tabsState, setTabsState] = useState<TabState[]>(() => Array(6).fill(null).map(createInitialTabState));
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const [isFreeBackgroundModalOpen, setIsFreeBackgroundModalOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<{
    type: 'edit' | null;
    index: number | null;
  }>({ type: null, index: null });


  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        setUserApiKey(savedApiKey);
    }
  }, []);
  
  const activeTabState = tabsState[activeTabIndex];

  const updateTabState = useCallback((index: number, newState: Partial<TabState>) => {
    setTabsState(prev => {
        const newTabsState = [...prev];
        newTabsState[index] = { ...newTabsState[index], ...newState };
        return newTabsState;
    });
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setUserApiKey(key);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setUserApiKey(null);
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('api key not valid') || msg.includes('invalid api key')) {
        return 'API Key tidak valid atau telah kedaluwarsa. Silakan periksa kunci Anda di pengaturan.';
      }
      if (msg.includes('quota') || msg.includes('billing')) {
        return 'Batas penggunaan API telah tercapai atau ada masalah tagihan. Silakan periksa akun Google AI Anda.';
      }
      if (msg.includes('safety') || msg.includes('blocked')) {
        return 'Permintaan diblokir karena alasan keamanan konten. Coba gunakan gambar atau prompt yang berbeda.';
      }
      if (msg.includes('failed to fetch') || msg.includes('network')) {
          return 'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.';
      }
      if (msg.includes("did not return any images")) {
          return "AI tidak mengembalikan gambar apa pun. Ini bisa disebabkan oleh filter keamanan atau masalah sementara. Coba ubah prompt atau gunakan gambar lain.";
      }
       if (msg.includes("did not return a new image")) {
          return "AI tidak mengembalikan gambar baru untuk diedit. Coba lagi atau dengan gambar yang berbeda.";
      }
      return `Terjadi kesalahan: ${error.message}`;
    }
    return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi nanti.';
  };


  const getActiveApiKey = useCallback(() => {
    const activeKey = userApiKey || process.env.API_KEY;
    if (!activeKey) {
        setErrorMessage("API Key belum dikonfigurasi. Silakan tambahkan kunci Anda di header.");
        return null;
    }
    return activeKey;
  }, [userApiKey]);

  // Updated to handle index for Convert Tab
  const handleImageUpload = useCallback((file: File, index: number = 0) => {
    if (!file) return;
    
    const blobUrl = URL.createObjectURL(file);
    const isMovieTab = activeTabIndex === 4;
    const isConvertTab = activeTabIndex === 5;

    // Use an Image object to detect dimensions for Convert tab
    const img = new Image();
    img.onload = () => {
        // NOTE: For Convert Tab (Parallel), we don't force the global state ratio here anymore.
        // We will detect it per-image during generation to allow mixed aspects.
        let detectedRatio: AspectRatio | null = null;
        
        // Only set global ratio if NOT convert tab, or if it's the first upload in convert tab just for UI consistency
        if (!isConvertTab) {
           // ... logic for other tabs if needed, current implementation relies on user selection mostly
           // but we could auto-detect here too.
        }

        setTabsState(prev => {
            const newTabsState = [...prev];
            const currentTabState = newTabsState[activeTabIndex];
            
            const updatedState: TabState = {
                ...currentTabState,
            };

            if (isConvertTab) {
                // For Convert tab, update specific slot
                const newConvertImages = [...currentTabState.convertSourceImages];
                newConvertImages[index] = { url: blobUrl, mimeType: file.type };
                updatedState.convertSourceImages = newConvertImages;
                
                // Ensure output array exists and has size 4
                if (!updatedState.editedImages) {
                    updatedState.editedImages = Array(4).fill(null);
                }
            } else {
                 // Standard & Movie behavior
                updatedState.sourceImage = { url: blobUrl, mimeType: file.type };
                updatedState.editedImages = isMovieTab ? Array(5).fill(null) : null;
            }

            newTabsState[activeTabIndex] = updatedState;
            return newTabsState;
        });
    };
    img.src = blobUrl;

  }, [activeTabIndex]);

  const getModelAndConfig = (quality: ImageQuality, aspectRatio: AspectRatio) => {
    // Always use gemini-3-pro-image-preview (Nano Banana Pro)
    const model = 'gemini-3-pro-image-preview';
    const config: any = {
        // responseModalities is usually inferred for image gen, removing explicit set to avoid potential conflicts
        // unless specifically needed for audio. For Images, imageConfig is enough.
        imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: quality // '1K', '2K', or '4K'
        }
    };
    
    return { model, config };
  }

  // Helper to determine output format text based on quality
  const getOutputFormat = (quality: ImageQuality) => {
    // Force JPEG for all output based on user request
    return 'JPEG';
  };

  const handleGenerate = useCallback(async () => {
    const apiKey = getActiveApiKey();
    if (!apiKey) return;

    const currentTab = tabsState[activeTabIndex];
    const isConvertTab = activeTabIndex === 5;

    // Validation
    if (isConvertTab) {
        if (currentTab.convertSourceImages.every(img => img === null)) {
            setErrorMessage("Silakan unggah setidaknya satu gambar untuk dikonversi.");
            return;
        }
    } else {
        if (!currentTab.sourceImage) {
            setErrorMessage("Silakan unggah gambar terlebih dahulu.");
            return;
        }
    }
    
    updateTabState(activeTabIndex, {
      isLoading: true,
      // For Convert tab, preserve existing results if only updating some slots? 
      // For now, let's keep existing results and only overwrite processing ones or reset all?
      // Let's reset purely for clarity, or Initialize if null.
      editedImages: isConvertTab ? (currentTab.editedImages || Array(4).fill(null)) : null,
    });

    try {
      const ai = new GoogleGenAI({ apiKey });
      const { theme, background, camShot, from, action, freeBackgroundText, gender, aspectRatio: globalAspectRatio, imageQuality } = currentTab.promptOptions;
      
      const outputFormat = getOutputFormat(imageQuality);
      
      // --------------------------------------------------------------------------------
      // CONVERT TAB LOGIC (PARALLEL)
      // --------------------------------------------------------------------------------
      if (isConvertTab) {
          
          // Map over the 4 slots
          const promises = currentTab.convertSourceImages.map(async (sourceImg, index) => {
             if (!sourceImg) return { index, url: null }; // Skip empty slots

             try {
                // 1. Detect aspect ratio for THIS specific image
                const { width, height } = await getImageDimensions(sourceImg.url);
                const individualAspectRatio = detectClosestAspectRatio(width, height);
                
                // 2. Prepare Config using the individual ratio
                const { model, config } = getModelAndConfig(imageQuality, individualAspectRatio);

                const promptParts = [
                    `ROLE: Professional Cosplay Photographer & Retoucher.`,
                    `TASK: Convert the input illustration (2D/3D) into a HYPER-REALISTIC PHOTOGRAPH of a real human.`,
                    `STRICT EXECUTION GUIDELINES:`,
                    `1. REALISM: The output must look 100% like a real photo taken with a DSLR camera.`,
                    `2. SKIN: Focus on realistic human skin texture (naturally smooth) to avoid the plastic/waxy skin effect often seen in 3D conversions.`,
                    `3. NO 3D EFFECTS: Do NOT use 3D CGI rendering styles. Do NOT look like a game character. It must be a real person.`,
                    `4. COMPOSITION: You MUST strictly maintain the exact pose, expression, accessories, and framing of the original image.`,
                    `5. CLOTHING: Convert costume elements into realistic real-world materials (fabric, metal props, leather).`,
                    `6. BACKGROUND: Realistic real-world setting matching the original perspective.`,
                    `7. LIGHTING: Natural cinematic lighting.`,
                    `Output details: ${outputFormat} format, ${individualAspectRatio} aspect ratio.`
                ];
                const textPrompt = promptParts.join(' ');

                const { base64: base64Data, mimeType: sourceMimeType } = await blobUrlToBase64(sourceImg.url);
                
                const imagePart = {
                    inlineData: {
                        data: base64Data,
                        mimeType: sourceMimeType || sourceImg.mimeType,
                    },
                };
                const textPart = { text: textPrompt };

                const generateRequest = {
                    model,
                    contents: { parts: [imagePart, textPart] },
                    config,
                };

                const response = await ai.models.generateContent(generateRequest);
                const candidate = response.candidates?.[0];

                if (candidate?.finishReason === 'SAFETY') return { index, url: null, error: 'Safety Block' };

                const imagePartResponse = candidate?.content?.parts?.find(part => part.inlineData);

                if (imagePartResponse?.inlineData) {
                    const resultUrl = await base64ToBlobUrl(imagePartResponse.inlineData.data, imagePartResponse.inlineData.mimeType);
                    return { index, url: resultUrl };
                }
                return { index, url: null };
             } catch (e) {
                 console.error(`Error processing slot ${index}`, e);
                 return { index, url: null, error: e };
             }
          });

          // Wait for all
          const results = await Promise.all(promises);
          
          // Update state with new images
          setTabsState(prev => {
              const newTabsState = [...prev];
              const tabState = newTabsState[activeTabIndex];
              const newEditedImages = [...(tabState.editedImages || Array(4).fill(null))];
              
              results.forEach(res => {
                  if (res.url) {
                      newEditedImages[res.index] = res.url;
                  }
              });

              newTabsState[activeTabIndex] = { ...tabState, editedImages: newEditedImages };
              return newTabsState;
          });

          return; // End execution for Convert Tab
      }

      // --------------------------------------------------------------------------------
      // STANDARD TABS LOGIC
      // --------------------------------------------------------------------------------
      // Ensure sourceImage exists for standard tabs
      if (!currentTab.sourceImage) return;

      const { base64: base64Data, mimeType: sourceMimeType } = await blobUrlToBase64(currentTab.sourceImage.url);

      const finalInstruction = `CRITICAL INSTRUCTION: The image must be in ${outputFormat} format and feature a dynamic and interesting pose for the character.`;
      const camShotInstruction = promptInstructions.camShot[camShot];
      
      let promptParts: string[] = [];
      let backgroundInstruction: string;

      if (background === Background.Free) {
          const customText = freeBackgroundText || 'a neutral studio setting';
          if (theme === Theme.Realistic) {
              backgroundInstruction = `The photo is set in the following user-described location: "${customText}".`;
          } else { // Animations + Mix
              backgroundInstruction = `The scene is the following user-described location: "${customText}".`;
          }
      } else {
          const safeBackground = background as Exclude<Background, Background.Free>;
          if (theme === Theme.Realistic) {
              backgroundInstruction = promptInstructions.background.realistic[safeBackground];
          } else { // Animations + Mix
              backgroundInstruction = promptInstructions.background.animation[safeBackground];
          }
      }

      if (theme === Theme.Realistic) {
        let genderInstruction: string;
        switch (gender) {
          case Gender.Women:
            genderInstruction = 'Generate a photo of an adult woman cosplaying the character from the provided illustration.';
            break;
          case Gender.Man:
            genderInstruction = 'Generate a photo of an adult man cosplaying the character from the provided illustration.';
            break;
          case Gender.Non:
            genderInstruction = 'Re-imagine the character from the provided illustration as a non-human or fantastical creature in a photorealistic cosplay style.';
            break;
          default:
            genderInstruction = `Generate a photo of a ${gender.toLowerCase()} cosplaying the character from the provided illustration.`;
        }
        
        promptParts.push(genderInstruction);

        if (gender !== Gender.Non) {
          promptParts.push(promptInstructions.from[from]);
        }

        promptParts.push(
          `Cosplay must be of high quality and the appearance must look very realistic, with a similarity level of around 95% to the original illustration, such as physical characteristics, skin color, hairstyle, accessories, and then add realistic details to the character.`,
          backgroundInstruction
        );
      } else if (theme === Theme.Mix) {
        promptParts = [
            promptInstructions.theme[theme],
            backgroundInstruction,
        ];
      } else { // 2D and 3D Animations
        promptParts = [
            "Analyze the uploaded image. Identify the main subject's key features: physical characteristics, clothing, accessories, and colors. Re-imagine this subject as a detailed and accurate cosplayer. Then, place this cosplayer character into the following scene:",
            promptInstructions.theme[theme as Theme.TwoDAnimations | Theme.ThreeDAnimation],
            backgroundInstruction,
        ];
      }
      
      if (background === Background.Studio) {
        promptParts.push(promptInstructions.action[action]);
      }
      
      const textPrompt = [...promptParts, camShotInstruction, finalInstruction].join(' ');
      
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: sourceMimeType || currentTab.sourceImage.mimeType,
        },
      };

      const textPart = { text: textPrompt };
      
      // Use Global aspect ratio for Standard Tabs
      const { model, config } = getModelAndConfig(imageQuality, globalAspectRatio);

      const generateRequest = {
        model,
        contents: { parts: [imagePart, textPart] },
        config,
      };

      const imagePromises = Array(4).fill(0).map(async () => {
        try {
            const response = await ai.models.generateContent(generateRequest);
            
            // Check finish reason per request
            if (response.candidates?.[0]?.finishReason === 'SAFETY') {
                return null;
            }

            const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
            if (imagePartResponse?.inlineData) {
                // Convert response Base64 to Blob URL immediately
                return await base64ToBlobUrl(imagePartResponse.inlineData.data, imagePartResponse.inlineData.mimeType);
            }
            return null;
        } catch (e) {
            console.error("Single generation failed", e);
            return null;
        }
      });

      const results = await Promise.all(imagePromises);
      const validImages = results.filter((img): img is string => img !== null);

      if (validImages.length > 0) {
        updateTabState(activeTabIndex, { editedImages: validImages });
      } else {
        throw new Error("AI tidak dapat menghasilkan gambar (Mungkin terkena filter keamanan atau prompt terlalu kompleks).");
      }

    } catch (error) {
      console.error("Error generating image:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      updateTabState(activeTabIndex, { isLoading: false });
    }
  }, [activeTabIndex, tabsState, getActiveApiKey, updateTabState]);

  const handleEditImage = useCallback(async (index: number) => {
    const apiKey = getActiveApiKey();
    if (!apiKey) return;

    const currentTab = tabsState[activeTabIndex];
    const isConvertTab = activeTabIndex === 5;

    // --------------------------------------------------------------------------------
    // CONVERT TAB "REGENERATE" LOGIC
    // --------------------------------------------------------------------------------
    if (isConvertTab) {
        // For Convert tab, "Edit" means regenerate that specific slot from its source
        const sourceImg = currentTab.convertSourceImages[index];
        if (!sourceImg) return;

        updateTabState(activeTabIndex, { editingIndex: index });

        try {
             const ai = new GoogleGenAI({ apiKey });
             const { base64: base64Data, mimeType: sourceMimeType } = await blobUrlToBase64(sourceImg.url);
             const { imageQuality } = currentTab.promptOptions;
             const outputFormat = getOutputFormat(imageQuality);

             // Detect Ratio specifically for this image
             const { width, height } = await getImageDimensions(sourceImg.url);
             const individualAspectRatio = detectClosestAspectRatio(width, height);

             const promptParts = [
                `ROLE: Professional Cosplay Photographer & Retoucher.`,
                `TASK: Convert the input illustration (2D/3D) into a HYPER-REALISTIC PHOTOGRAPH of a real human.`,
                `STRICT EXECUTION GUIDELINES:`,
                `1. REALISM: The output must look 100% like a real photo taken with a DSLR camera.`,
                `2. SKIN: Focus on realistic human skin texture (naturally smooth) to avoid the plastic/waxy skin effect often seen in 3D conversions.`,
                `3. NO 3D EFFECTS: Do NOT use 3D CGI rendering styles. Do NOT look like a game character. It must be a real person.`,
                `4. COMPOSITION: You MUST strictly maintain the exact pose, expression, accessories, and framing of the original image.`,
                `5. CLOTHING: Convert costume elements into realistic real-world materials (fabric, metal props, leather).`,
                `6. BACKGROUND: Realistic real-world setting matching the original perspective.`,
                `7. LIGHTING: Natural cinematic lighting.`,
                `Output details: ${outputFormat} format, ${individualAspectRatio} aspect ratio.`
             ];
             const textPrompt = promptParts.join(' ');

             const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: sourceMimeType || sourceImg.mimeType,
                },
             };
             const textPart = { text: textPrompt };
             
             // Use individual ratio
             const { model, config } = getModelAndConfig(imageQuality, individualAspectRatio);

             const generateRequest = {
                model,
                contents: { parts: [imagePart, textPart] },
                config,
             };

             const response = await ai.models.generateContent(generateRequest);
             const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

             if (imagePartResponse?.inlineData) {
                const newImageUrl = await base64ToBlobUrl(imagePartResponse.inlineData.data, imagePartResponse.inlineData.mimeType);
                setTabsState(prev => {
                    const newTabsState = [...prev];
                    const tabState = newTabsState[activeTabIndex];
                    const newEditedImages = [...(tabState.editedImages || Array(4).fill(null))];
                    newEditedImages[index] = newImageUrl;
                    newTabsState[activeTabIndex] = { ...tabState, editedImages: newEditedImages };
                    return newTabsState;
                });
             } else {
                 throw new Error("AI did not return a regenerated image.");
             }

        } catch (error) {
             console.error("Error regenerating convert image:", error);
             setErrorMessage(getErrorMessage(error));
        } finally {
             updateTabState(activeTabIndex, { editingIndex: null });
        }
        return;
    }

    // --------------------------------------------------------------------------------
    // STANDARD EDIT LOGIC
    // --------------------------------------------------------------------------------
    const imageToEditUrl = currentTab.editedImages?.[index];
    if (!imageToEditUrl) return;

    updateTabState(activeTabIndex, { editingIndex: index });
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Fetch Blob URL to get correct data and mimetype
      const { base64: base64Data, mimeType } = await blobUrlToBase64(imageToEditUrl);

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      };
      
      let actionInstruction = '';
      if (currentTab.promptOptions.background === Background.Studio) {
          actionInstruction = `The character's action should be a variation of: ${promptInstructions.action[currentTab.promptOptions.action]}.`;
      }

      const backgroundDescription = currentTab.promptOptions.background === Background.Free 
        ? `a user-defined scene described as "${currentTab.promptOptions.freeBackgroundText}"`
        : `a "${currentTab.promptOptions.background}" setting`;

      const outputFormat = getOutputFormat(currentTab.promptOptions.imageQuality);
      const textPrompt = `Analyze the provided image. Generate a new version. CRITICAL INSTRUCTION: The new image MUST maintain the ${currentTab.promptOptions.aspectRatio} aspect ratio and be in ${outputFormat} format. Preserve the original theme and style, but change the character's pose and alter the background scenery. The new pose should be different and interesting. The new background should be a variation of the original setting: ${backgroundDescription}. ${actionInstruction}`;
      
      const textPart = { text: textPrompt };

      const { model, config } = getModelAndConfig(currentTab.promptOptions.imageQuality, currentTab.promptOptions.aspectRatio);

      const generateRequest = {
        model,
        contents: { parts: [imagePart, textPart] },
        config,
      };

      const response = await ai.models.generateContent(generateRequest);
      const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

      if (imagePartResponse?.inlineData) {
        const newImageUrl = await base64ToBlobUrl(imagePartResponse.inlineData.data, imagePartResponse.inlineData.mimeType);
        
        setTabsState(prev => {
          const newTabsState = [...prev];
          const currentImages = newTabsState[activeTabIndex].editedImages;
          if (!currentImages) return newTabsState;

          const newImages = [...currentImages];
          newImages[index] = newImageUrl;
          newTabsState[activeTabIndex] = { ...newTabsState[activeTabIndex], editedImages: newImages };
          return newTabsState;
        });
      } else {
        throw new Error("The API did not return a new image for editing.");
      }
    } catch (error) {
      console.error("Error editing image:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      updateTabState(activeTabIndex, { editingIndex: null });
    }
  }, [activeTabIndex, tabsState, getActiveApiKey, updateTabState]);

  const handleMovieGenerate = useCallback(async () => {
    const apiKey = getActiveApiKey();
    if (!apiKey) return;

    const currentTab = tabsState[activeTabIndex];
    if (!currentTab.sourceImage) {
        setErrorMessage("Silakan unggah gambar terlebih dahulu.");
        return;
    }

    updateTabState(activeTabIndex, { 
        isLoading: true, 
        editedImages: Array(5).fill(null),
    });

    try {
        // processImageToRatio takes Blob URL and returns Base64
        const processedImage = await processImageToRatio(currentTab.sourceImage.url, currentTab.promptOptions.aspectRatio);
        
        const ai = new GoogleGenAI({ apiKey });
        const { camShot, movieStyle, aspectRatio, imageQuality } = currentTab.promptOptions;
        const { movieThemeBackground } = currentTab;

        const camShotInstruction = promptInstructions.camShot[camShot];
        const titleStory = movieThemeBackground || 'The Unnamed Adventure';
        const movieStyleInstruction = promptInstructions.movieStyle[movieStyle || MovieStyle.EightK];
        const outputFormat = getOutputFormat(imageQuality);

        // ENFORCER: Strong instruction to ignore source style if 8K is selected
        const realismEnforcer = (movieStyle === MovieStyle.EightK || !movieStyle) 
            ? "CASTING DIRECTIVE: The character MUST be portrayed by a REAL HUMAN ACTOR in a LIVE-ACTION movie adaptation. Ignore the 2D/anime style of the input image. Generate a PHOTOREALISTIC human face, skin texture, and physical proportions." 
            : "";

        const basePrompt = `Analyze the uploaded character image. You are a Director of Photography and Casting Director for a new film. I have provided a title for a short story: "${titleStory}". Your task is to visualize the scenes for a 5-part narrative involving this character.
        
        CRITICAL VISUAL INSTRUCTIONS: 
        1. ${movieStyleInstruction}
        2. ${realismEnforcer}
        3. The final output must be a high-quality ${outputFormat} image with an aspect ratio of ${aspectRatio}.
        4. **DO NOT include any text, subtitles, titles, or panel numbers inside the image.** 
        5. **DO NOT add borders, frames, or comic book layouts.** 
        6. The image must be a clean, full-bleed cinematic shot.
        7. Maintain strict consistency of the character's appearance (costume and features) across all scenes, but adapt them to the target style.
        8. Camera: Use ${camShotInstruction} generally, but vary for dramatic effect.`;

        const panelInstructions = [
          `Scene 1 of 5: Introduction. Establish the setting and the character based on the title "${titleStory}". Show the character in a way that hints at the story to come.`,
          `Scene 2 of 5: Inciting Incident. Something happens related to "${titleStory}" that grabs the character's attention or forces them to act.`,
          `Scene 3 of 5: Rising Action. The character is in the middle of the action or conflict. The scene should be dynamic and tense.`,
          `Scene 4 of 5: The Climax. The most dramatic and intense moment of the story "${titleStory}". High emotion or action.`,
          `Scene 5 of 5: Resolution. The aftermath. Show the character at the end of the story, reflecting on the events.`
        ];

        const imagePart = {
            inlineData: {
                data: processedImage.data,
                mimeType: processedImage.mimeType,
            },
        };
        
        const { model, config } = getModelAndConfig(imageQuality, aspectRatio);

        const imagePromises = panelInstructions.map(async (instruction) => {
          const textPrompt = `${basePrompt} SPECIFIC SCENE INSTRUCTION: ${instruction}`;
          const textPart = { text: textPrompt };

          const generateRequest = {
              model,
              contents: { parts: [imagePart, textPart] },
              config,
          };

          const response = await ai.models.generateContent(generateRequest);
          const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

          if (imagePartResponse?.inlineData) {
              return await base64ToBlobUrl(imagePartResponse.inlineData.data, imagePartResponse.inlineData.mimeType);
          }
          return null;
        });

        const results = await Promise.all(imagePromises);
        const validImages = results.filter((img): img is string => img !== null);
        
        const finalImages = Array(5).fill(null).map((_, i) => validImages[i] || null);

        if (validImages.length > 0) {
           updateTabState(activeTabIndex, { editedImages: finalImages });
        } else {
            throw new Error("The API did not return any images for the movie scene story.");
        }

    } catch (error) {
        console.error("Error generating movie scene story:", error);
        setErrorMessage(getErrorMessage(error));
        updateTabState(activeTabIndex, { editedImages: Array(5).fill(null) }); 
    } finally {
        updateTabState(activeTabIndex, { isLoading: false });
    }
  }, [activeTabIndex, tabsState, getActiveApiKey, updateTabState]);


  const handleDeleteMovieImage = useCallback((index: number) => {
    setTabsState(prev => {
        const newTabsState = [...prev];
        const tabState = newTabsState[activeTabIndex];
        if (!tabState.editedImages) return prev;

        const newEditedImages = [...tabState.editedImages];
        newEditedImages[index] = null; // This is a Blob URL or null, fine.
        newTabsState[activeTabIndex] = { ...tabState, editedImages: newEditedImages };
        return newTabsState;
    });
  }, [activeTabIndex]);

  const handleMovieImageEdit = useCallback(async (index: number, instruction: string) => {
    const apiKey = getActiveApiKey();
    if (!apiKey) return;

    const currentTab = tabsState[activeTabIndex];
    const imageToEditUrl = currentTab.editedImages?.[index];
    if (!imageToEditUrl || !instruction) return;

    updateTabState(activeTabIndex, { editingIndex: index });
    try {
        const ai = new GoogleGenAI({ apiKey });
        
        const { base64: base64Data, mimeType } = await blobUrlToBase64(imageToEditUrl);
        
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType,
            },
        };

        const { movieStyle } = currentTab.promptOptions;
        const movieStyleInstruction = promptInstructions.movieStyle[movieStyle || MovieStyle.EightK];
        const outputFormat = getOutputFormat(currentTab.promptOptions.imageQuality);

        // ENFORCER for Edit as well
        const realismEnforcer = (movieStyle === MovieStyle.EightK || !movieStyle) 
        ? "Maintain a LIVE-ACTION, PHOTOREALISTIC look. The character must look like a real human actor." 
        : "";

        const textPrompt = `Analyze the provided image. The user wants to edit it with the following instruction: "${instruction}". Generate a new version of the image based on this request. 
        CRITICAL REQUIREMENT: 
        1. ${movieStyleInstruction}
        2. ${realismEnforcer}
        3. The new image MUST maintain a ${currentTab.promptOptions.aspectRatio} aspect ratio and be a full-bleed ${outputFormat} image. 
        4. **DO NOT include any text, subtitles, titles, or panel numbers inside the image.**
        5. **Do not add black bars, borders, or frames.**
        6. Preserve the overall style and character, but apply the user's edit.`;
        
        const textPart = { text: textPrompt };

        const { model, config } = getModelAndConfig(currentTab.promptOptions.imageQuality, currentTab.promptOptions.aspectRatio);

        const generateRequest = {
            model,
            contents: { parts: [imagePart, textPart] },
            config,
        };

        const response = await ai.models.generateContent(generateRequest);
        const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePartResponse?.inlineData) {
            const newImageUrl = await base64ToBlobUrl(imagePartResponse.inlineData.data, imagePartResponse.inlineData.mimeType);
            
            setTabsState(prev => {
                const newTabsState = [...prev];
                const tabState = newTabsState[activeTabIndex];
                const newEditedImages = [...(tabState.editedImages || [])];
                newEditedImages[index] = newImageUrl;
                newTabsState[activeTabIndex] = { ...tabState, editedImages: newEditedImages };
                return newTabsState;
            });
        } else {
            throw new Error("The API did not return a new image for editing.");
        }
    } catch (error) {
        console.error("Error editing movie image:", error);
        setErrorMessage(getErrorMessage(error));
    } finally {
        updateTabState(activeTabIndex, { editingIndex: null });
    }
  }, [activeTabIndex, tabsState, getActiveApiKey, updateTabState]);

  const setPromptOptionsForActiveTab = useCallback((updater: React.SetStateAction<PromptOptions>) => {
    setTabsState(prev => {
        const newTabsState = [...prev];
        const currentTabState = newTabsState[activeTabIndex];
        const oldOptions = currentTabState.promptOptions;
        const newOptions = typeof updater === 'function' ? updater(oldOptions) : updater;
        newTabsState[activeTabIndex] = { ...currentTabState, promptOptions: newOptions };
        return newTabsState;
    });
  }, [activeTabIndex]);

  const setAspectRatioForActiveTab = useCallback((ratio: AspectRatio) => {
      setPromptOptionsForActiveTab(prev => ({ ...prev, aspectRatio: ratio }));
  }, [setPromptOptionsForActiveTab]);

  const setImageQualityForActiveTab = useCallback((quality: ImageQuality) => {
    setPromptOptionsForActiveTab(prev => ({ ...prev, imageQuality: quality }));
  }, [setPromptOptionsForActiveTab]);

  const setMovieThemeBackgroundForActiveTab = useCallback((text: string) => {
    updateTabState(activeTabIndex, { movieThemeBackground: text });
  }, [activeTabIndex, updateTabState]);


  const handleSaveFreeBackground = (text: string) => {
    if (text.trim()) {
      setPromptOptionsForActiveTab(prev => ({
        ...prev,
        background: Background.Free,
        freeBackgroundText: text,
      }));
    }
    setIsFreeBackgroundModalOpen(false);
  };

  // Handlers for opening new modals
  const handleOpenEditModal = useCallback((index: number) => setActiveModal({ type: 'edit', index }), []);
  const handleCloseModal = () => setActiveModal({ type: null, index: null });

  const handleSaveEdit = (index: number, instruction: string) => {
      updateTabState(activeTabIndex, {
          movieCanvasOptions: tabsState[activeTabIndex].movieCanvasOptions.map((opt, i) => i === index ? { ...opt, edit: instruction } : opt)
      });
      handleCloseModal();
      handleMovieImageEdit(index, instruction);
  };


  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-6 bg-slate-950">
        <div
          className={`w-full max-w-6xl mx-auto bg-slate-800 overflow-hidden border-4 border-black rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 ease-in-out`}
        >
          <Header 
            aspectRatio={activeTabState.promptOptions.aspectRatio}
            setAspectRatio={setAspectRatioForActiveTab}
            imageQuality={activeTabState.promptOptions.imageQuality}
            setImageQuality={setImageQualityForActiveTab}
            disabled={activeTabState.isLoading}
            savedApiKey={userApiKey}
            onSaveApiKey={handleSaveApiKey}
            onClearApiKey={handleClearApiKey}
          />

          <div className="flex border-b-4 border-black bg-slate-800 px-1 sm:px-2 pt-3 sm:pt-4 gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {[...Array(6)].map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTabIndex(index)}
                className={`flex-1 min-w-[70px] sm:min-w-[100px] py-2 sm:py-3 px-1 sm:px-4 text-[10px] sm:text-sm md:text-base font-bold uppercase transition-all border-2 sm:border-4 border-black rounded-t-xl sm:rounded-t-2xl mb-[-4px] relative z-10 ${
                  activeTabIndex === index 
                    ? 'bg-sky-500 text-white translate-y-0' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 translate-y-1 sm:translate-y-2 hover:translate-y-0.5 sm:hover:translate-y-1'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-2">
                    <span className="truncate max-w-full">
                        {index < 4 ? `Tab ${index + 1}` : index === 4 ? 'Movie' : 'Convert'}
                    </span>
                    {tabsState[index].isLoading && (
                        <span className="inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white animate-pulse mt-1 sm:mt-0"></span>
                    )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row relative z-20 bg-slate-800">
            <Sidebar 
               activeTabIndex={activeTabIndex}
               onImageUpload={handleImageUpload}
               promptOptions={activeTabState.promptOptions}
               setPromptOptions={setPromptOptionsForActiveTab}
               onGenerate={handleGenerate}
               onMovieGenerate={handleMovieGenerate}
               movieThemeBackground={activeTabState.movieThemeBackground}
               setMovieThemeBackground={setMovieThemeBackgroundForActiveTab}
               isGenerating={activeTabState.isLoading}
               hasSourceImage={!!activeTabState.sourceImage}
               sourceImage={activeTabState.sourceImage}
               convertSourceImages={activeTabState.convertSourceImages}
               editedImages={activeTabState.editedImages}
               onOpenFreeBackgroundModal={() => setIsFreeBackgroundModalOpen(true)}
            />
            <MainContent 
              activeTabIndex={activeTabIndex}
              editedImages={activeTabState.editedImages}
              isLoading={activeTabState.isLoading}
              onEditImage={handleEditImage}
              editingIndex={activeTabState.editingIndex}
              sourceImage={activeTabState.sourceImage}
              onDeleteMovieImage={handleDeleteMovieImage}
              onOpenEditModal={handleOpenEditModal}
              imageQuality={activeTabState.promptOptions.imageQuality}
            />
          </div>
        </div>
      </div>
      <ErrorModal
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        message={errorMessage || ''}
      />
      <FreeBackgroundModal
        isOpen={isFreeBackgroundModalOpen}
        onClose={() => setIsFreeBackgroundModalOpen(false)}
        onSave={handleSaveFreeBackground}
        initialValue={activeTabState.promptOptions.freeBackgroundText || ''}
      />
       {activeModal.type === 'edit' && activeModal.index !== null && (
        <EditModal
            isOpen={true}
            onClose={handleCloseModal}
            onSave={(instruction) => handleSaveEdit(activeModal.index!, instruction)}
            initialValue={activeTabState.movieCanvasOptions[activeModal.index].edit}
        />
      )}
    </>
  );
};

export default App;