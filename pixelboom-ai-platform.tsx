import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Upload, Eye, ShoppingCart, Sparkles, ArrowLeft, ArrowRight, User, Check, AlertCircle } from 'lucide-react';

// Main App Component for the Pixelboom AI Art Generator
const App = () => {
  // --- STYLE DEFINITIONS FOR ANIMATIONS ---
  // We add a style tag directly in the component to define keyframe animations
  // that are not possible with Tailwind CSS classes alone.
  const GlobalStyles = () => (
    <style>{`
      @keyframes gloss-effect {
        0% { transform: translateX(-120%) skewX(-30deg); }
        100% { transform: translateX(220%) skewX(-30deg); }
      }
      
      .gloss-sheen {
        position: absolute;
        top: 0;
        left: 0;
        width: 50%;
        height: 100%;
        background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0) 100%);
        animation: gloss-effect 4s infinite ease-in-out;
        pointer-events: none; /* Make sure it doesn't interfere with mouse events */
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out forwards;
      }
    `}</style>
  );


  // State management for the application flow and user data
  const [currentStep, setCurrentStep] = useState('home'); // Tracks the current view (home, generate, select, preview)
  const [credits, setCredits] = useState(4); // User's available credits for generation
  const [prompt, setPrompt] = useState(''); // Text prompt for AI image generation
  const [format, setFormat] = useState('vertical'); // Image orientation: 'vertical' or 'horizontal'
  const [size, setSize] = useState('30x40cm'); // Desired print size
  const [generatedImages, setGeneratedImages] = useState([]); // Array of URLs for generated images
  const [selectedImage, setSelectedImage] = useState(null); // The image chosen by the user for preview
  const [currentMockup, setCurrentMockup] = useState(0); // Index of the current mockup background
  const [isGenerating, setIsGenerating] = useState(false); // Loading state for image generation
  const [showCreditsModal, setShowCreditsModal] = useState(false); // Visibility of the "out of credits" modal
  const [uploadedImage, setUploadedImage] = useState(null); // Holds the user-uploaded image data
  const [showModal, setShowModal] = useState(false); // Visibility of the generic confirmation modal
  const [modalMessage, setModalMessage] = useState(''); // Message for the confirmation modal
  const [error, setError] = useState(null); // Error message for the alert component

  // --- MOCKUP CONFIGURATION (WITH FINAL HORIZONTAL VALUES) ---
  const mockups = [
    {
      name: 'Cyberpunk Gallery',
      bg: 'https://res.cloudinary.com/dtdg5smr8/image/upload/v1749812129/pixelboom-cyberpunk-gallery.jpg_o3y5vo.png',
      defaults: {
        vertical: { top: 15.5, left: 18.5, width: 23.0, height: 61.5, rotateY: 22.0, rotateX: 0.0 },
        horizontal: { top: 18.5, left: 12.5, width: 45.5, height: 55.0, rotateY: 16.0, rotateX: 0.0 }
      },
      baseStyle: { boxShadow: '0 25px 60px rgba(0, 191, 255, 0.3)', border: '2px solid rgba(0, 191, 255, 0.2)' }
    },
    {
      name: 'Gaming Room',
      bg: 'https://res.cloudinary.com/dtdg5smr8/image/upload/v1750169494/Gaming_Room_v2_yiqdkn.png',
      defaults: {
        vertical: { top: 0.5, left: 41.5, width: 17.5, height: 46.5, rotateY: 0.0, rotateX: 0.0 },
        horizontal: { top: 4.0, left: 35.0, width: 30.5, height: 39.0, rotateY: 2.0, rotateX: 0.0 }
      },
      baseStyle: { boxShadow: '0 20px 50px rgba(233, 30, 99, 0.4)', border: '2px solid rgba(233, 30, 99, 0.2)' }
    },
    {
      name: 'Modern Loft',
      bg: 'https://res.cloudinary.com/dtdg5smr8/image/upload/v1749812130/pixelboom-modern-loft.jpg_yoxwi0.png',
      defaults: {
        vertical: { top: 6.0, left: 39.0, width: 22.0, height: 58.5, rotateY: 15.0, rotateX: 0.0 },
        horizontal: { top: 6.0, left: 30.5, width: 39.5, height: 48.5, rotateY: 14.0, rotateX: 0.0 }
      },
      baseStyle: { boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4)', border: '1px solid rgba(0, 0, 0, 0.2)' }
    },
    {
      name: 'Gaming Bedroom',
      bg: 'https://res.cloudinary.com/dtdg5smr8/image/upload/v1749812130/pixelboom-gaming-bedroom.jpg_efhkzm.png',
      defaults: {
        vertical: { top: 0.5, left: 40.0, width: 20.5, height: 51.0, rotateY: 0.0, rotateX: 0.0 },
        horizontal: { top: 3.0, left: 31.0, width: 39.0, height: 46.0, rotateY: 0.0, rotateX: 0.0 }
      },
      baseStyle: { boxShadow: '0 20px 60px rgba(138, 43, 226, 0.5)', border: '2px solid rgba(138, 43, 226, 0.3)' }
    }
  ];
  
    // --- DYNAMIC FRAME STYLE LOGIC ---
    const getFrameStyle = () => {
        const mockupConf = mockups[currentMockup];
        const style = mockupConf.defaults[format];

        return {
            position: 'absolute',
            top: `${style.top}%`,
            left: `${style.left}%`,
            width: `${style.width}%`,
            height: `${style.height}%`,
            transition: 'all 0.3s ease-in-out', // Slightly adjusted transition speed
            ...mockupConf.baseStyle,
            transform: `perspective(1800px) rotateY(${style.rotateY}deg) rotateX(${style.rotateX}deg)`
        };
    };

  // --- SAMPLE IMAGES ---
  const sampleImages = {
    vertical: [
      'https://placehold.co/768x1024/8E44AD/FFFFFF?text=Cyberpunk+Art+1',
      'https://placehold.co/768x1024/00BCD4/FFFFFF?text=Futuristic+Vision',
      'https://placehold.co/768x1024/E91E63/FFFFFF?text=Neon+Dream',
      'https://placehold.co/768x1024/B25FF1/FFFFFF?text=Digital+Soul'
    ],
    horizontal: [
      'https://placehold.co/1024x768/8E44AD/FFFFFF?text=Cyberpunk+Art+2',
      'https://placehold.co/1024x768/00BCD4/FFFFFF?text=Futuristic+Vision',
      'https://placehold.co/1024x768/E91E63/FFFFFF?text=Neon+Dream',
      'https://placehold.co/1024x768/B25FF1/FFFFFF?text=Digital+Soul'
    ]
  };

  // --- CORE FUNCTIONS ---
  const generateImages = async () => {
    if (credits <= 0) {
      setShowCreditsModal(true);
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setCredits(credits - 1);
      setGeneratedImages(sampleImages[format]);
      setIsGenerating(false);
      setCurrentStep('select');
    }, 2000);
  };

  const selectImage = (imageUrl, index) => {
    setSelectedImage({ url: imageUrl, index });
    setCurrentStep('preview');
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, sube un archivo de imagen válido');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const detectedFormat = img.width > img.height ? 'horizontal' : 'vertical';
          setFormat(detectedFormat);
          setUploadedImage(e.target.result);
          setSelectedImage({ url: e.target.result, index: 0 });
          setCurrentStep('preview');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const addToCart = () => {
    setModalMessage('¡Producto añadido al carrito! Redirigiendo a checkout...');
    setShowModal(true);
  };
  
  const getPriceForSize = (size) => {
    const prices = { '20x30cm': 39.99, '30x40cm': 49.99, '40x60cm': 69.99 };
    return prices[size] || 49.99;
  };

  // --- UI COMPONENTS ---
  const Breadcrumb = () => {
    const steps = ['Crear', 'Seleccionar', 'Preview', 'Checkout'];
    // FIX: Corrected typo from `current-step` to `currentStep`
    const stepIndex = currentStep === 'home' || currentStep === 'generate' ? 0 : currentStep === 'select' ? 1 : currentStep === 'preview' ? 2 : 3;
    
    return (
      <div className="flex items-center justify-center mb-8 space-x-2 sm:space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${index <= stepIndex ? 'bg-purple-500 text-white scale-110' : 'bg-gray-700 text-gray-400'}`}>
                {index < stepIndex ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span className={`ml-2 transition-all duration-300 hidden sm:inline ${index <= stepIndex ? 'text-purple-400 font-semibold' : 'text-gray-400'}`}>{step}</span>
            </div>
            {index < steps.length - 1 && <ArrowRight className="w-4 h-4 text-gray-600" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const CreditsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-8 rounded-lg border-2 border-purple-500 max-w-md w-full mx-auto">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-purple-400 mb-4">¡Creatividad desbloqueada!</h2>
          <p className="text-gray-300 mb-6">Has usado tus créditos gratuitos. Para continuar:</p>
          <div className="space-y-4">
            <button className="w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white font-bold py-3 px-4 rounded-lg hover:scale-105 transition-all">✨ Compra este diseño → +10 créditos GRATIS</button>
            <button onClick={() => { setCredits(2); setShowCreditsModal(false); }} className="w-full bg-gray-700 text-purple-400 font-bold py-3 px-4 rounded-lg hover:bg-gray-600 transition-all">💎 Crear cuenta → +2 créditos adicionales</button>
            <button onClick={() => setShowCreditsModal(false)} className="w-full bg-gray-800 text-gray-400 font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-all">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );

  const CustomModal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-8 rounded-lg border-2 border-purple-500 max-w-md w-full mx-auto text-center">
        <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <p className="text-white text-lg mb-6">{message}</p>
        <button onClick={onClose} className="bg-purple-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-400 transition-all">Continuar</button>
      </div>
    </div>
  );
  
  const ErrorAlert = () => error && (
    <div className="fixed top-4 right-4 bg-red-900 border-2 border-red-500 text-white p-4 rounded-lg flex items-center space-x-3 z-50 animate-fadeIn">
      <AlertCircle className="w-5 h-5" />
      <span>{error}</span>
      <button onClick={() => setError(null)} className="ml-4 text-red-300 hover:text-white">✕</button>
    </div>
  );

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <GlobalStyles />
      <ErrorAlert />
      
      <header className="bg-gray-900/80 backdrop-blur-sm border-b-2 border-purple-500 p-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">PIXELBOOM</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-800 px-4 py-2 rounded-lg border-2 border-purple-500 hover:border-purple-400 transition-all">
              <Zap className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-purple-400 font-bold text-lg">{credits}</span>
              <span className="text-gray-400 ml-1 hidden sm:inline">créditos</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <Breadcrumb />

        {/* HOME STEP */}
        {currentStep === 'home' && (
          <div className="text-center space-y-8 animate-fadeIn">
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400 leading-tight">Crea Arte del Futuro</h2>
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">Genera arte cyberpunk único con IA o sube tu propio diseño. Visualízalo en metal prints premium.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <button onClick={() => setCurrentStep('generate')} className="group bg-gradient-to-br from-purple-600 to-purple-800 text-white p-8 rounded-xl font-bold text-xl hover:from-purple-500 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50">
                <Sparkles className="w-16 h-16 mx-auto mb-4 transition-transform duration-500 group-hover:rotate-180" />
                Generar Arte con IA
                <p className="text-sm font-normal mt-3 text-gray-200">Crea diseños únicos con prompts</p>
              </button>
              <label className="group bg-gradient-to-br from-cyan-600 to-cyan-800 text-white p-8 rounded-xl font-bold text-xl hover:from-cyan-500 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 cursor-pointer">
                <Upload className="w-16 h-16 mx-auto mb-4 transition-transform duration-500 group-hover:animate-bounce" />
                Subir tu Diseño
                <p className="text-sm font-normal mt-3 text-gray-200">Carga tu propia imagen</p>
                <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
              </label>
            </div>
          </div>
        )}

        {/* GENERATE STEP */}
        {currentStep === 'generate' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <button onClick={() => setCurrentStep('home')} className="flex items-center text-purple-400 hover:text-purple-300 mb-4 transition-all hover:scale-105"><ArrowLeft className="w-4 h-4 mr-2" />Volver</button>
            <div className="bg-gray-900 p-6 sm:p-8 rounded-xl border-2 border-purple-500 shadow-lg shadow-purple-500/20">
              <h3 className="text-3xl font-bold text-purple-400 mb-8">Generar Arte con IA</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-3 text-lg">1. Describe tu arte cyberpunk</label>
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ej: Un androide con gabardina de neón en una calle lluviosa de Neo-Tokio" className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all" rows="4"/>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 mb-3 text-lg">2. Formato</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-4 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all">
                      <option value="vertical">Vertical</option>
                      <option value="horizontal">Horizontal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-3 text-lg">3. Tamaño</label>
                    <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-4 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all">
                      <option value="20x30cm">20x30cm</option>
                      <option value="30x40cm">30x40cm</option>
                      <option value="40x60cm">40x60cm</option>
                    </select>
                  </div>
                </div>
                <button onClick={generateImages} disabled={!prompt.trim() || isGenerating || credits <= 0} className="w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white font-bold py-4 px-6 rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-xl">
                  {isGenerating ? <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>Generando arte...</div> : `Generar (${credits} crédito${credits !== 1 ? 's' : ''})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SELECT STEP */}
        {currentStep === 'select' && (
          <div className="max-w-5xl mx-auto animate-fadeIn">
            <button onClick={() => setCurrentStep('generate')} className="flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-all hover:scale-105"><ArrowLeft className="w-4 h-4 mr-2" />Volver a generar</button>
            <h3 className="text-3xl font-bold text-purple-400 mb-8 text-center">Selecciona tu favorita</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {generatedImages.map((image, index) => (
                <div key={index} onClick={() => selectImage(image, index)} className="group cursor-pointer bg-gray-900 rounded-xl border-2 border-transparent hover:border-purple-500 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30">
                  <img src={image} onError={(e) => e.target.src='https://placehold.co/768x1024/000000/FFFFFF?text=Error'} alt={`Generated art ${index + 1}`} className="w-full object-cover rounded-t-lg bg-gray-800" style={{aspectRatio: format === 'vertical' ? '3/4' : '4/3'}}/>
                  <div className="p-4">
                    <button className="w-full bg-purple-500 text-white font-bold py-3 px-4 rounded-lg group-hover:bg-purple-400 transition-all"><Eye className="w-4 h-4 inline mr-2" />Ver en Mockup</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* PREVIEW STEP */}
        {currentStep === 'preview' && selectedImage && (
          <div className="max-w-6xl mx-auto animate-fadeIn">
            <button onClick={() => setCurrentStep(uploadedImage ? 'home' : 'select')} className="flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-all hover:scale-105"><ArrowLeft className="w-4 h-4 mr-2" />Volver</button>
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <h3 className="text-3xl font-bold text-purple-400">Preview del Producto</h3>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden transition-all duration-500 shadow-2xl bg-gray-900" style={{perspective: '1500px'}}>
                  <img src={mockups[currentMockup].bg} onError={(e) => e.target.src='https://placehold.co/1200x800/000000/FFFFFF?text=Fondo+no+disponible'} alt={mockups[currentMockup].name} className="absolute inset-0 w-full h-full object-cover"/>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden backdrop-blur-sm relative z-10" style={getFrameStyle()}>
                    <img src={selectedImage.url} onError={(e) => e.target.src='https://placehold.co/800x600/000000/FFFFFF?text=Error'} alt="Tu diseño" className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>
                    {/* The new gloss/sheen effect div */}
                    <div className="gloss-sheen"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {mockups.map((mockup, index) => <button key={index} onClick={() => setCurrentMockup(index)} className={`py-3 px-4 rounded-lg font-bold transition-all hover:scale-105 text-sm ${currentMockup === index ? 'bg-purple-500 text-white scale-105 ring-2 ring-purple-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{mockup.name}</button>)}
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-900 p-8 rounded-xl border-2 border-purple-500/50">
                  <h4 className="text-2xl font-bold text-purple-400 mb-6">Detalles del Producto</h4>
                  <div className="space-y-4 text-gray-300">
                    <div className="flex justify-between items-center"><span className="text-lg">Formato:</span><span className="text-white font-bold text-lg capitalize bg-gray-700 px-3 py-1 rounded">{format}</span></div>
                    <div className="flex justify-between items-center"><span className="text-lg">Tamaño:</span><span className="text-white font-bold text-lg bg-gray-700 px-3 py-1 rounded">{size}</span></div>
                    <div className="flex justify-between items-center"><span className="text-lg">Material:</span><span className="text-white font-bold text-lg bg-gray-700 px-3 py-1 rounded">Metal Premium</span></div>
                    <hr className="border-gray-700 my-4" />
                    <div className="flex justify-between items-center text-2xl"><span className="font-bold">Precio:</span><span className="text-cyan-400 font-bold">€{getPriceForSize(size)}</span></div>
                  </div>
                </div>
                <button onClick={addToCart} className="w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white font-bold py-4 px-6 rounded-lg hover:scale-105 transition-all text-xl"><ShoppingCart className="w-6 h-6 inline mr-3" />Añadir al Carrito</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showCreditsModal && <CreditsModal />}
      {showModal && <CustomModal message={modalMessage} onClose={() => setShowModal(false)} />}

      <footer className="bg-gray-900 border-t-2 border-purple-500/20 mt-12 p-6">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 Pixelboom - Arte Futurista Premium</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
