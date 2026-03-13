import { useState, useRef, useEffect } from 'react';
import { Search, Mic, Image as ImageIcon, ScanBarcode, X, Loader2 } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { useRouter } from '@/lib/router';

export function MultiModalSearch() {
  const { 
    searchQuery, 
    setSearchQuery, 
    setSearchMode, 
    performSearch, 
    clearSearch,
    isSearching,
    setIsSearching
  } = useSearch();
  
  const { navigate, route } = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanError, setScanError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModeSelector(false);
      }
    };

    if (showModeSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModeSelector]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        performSearch(transcript, 'voice');
        setIsListening(false);
        setIsSearching(false);
        
        // Navigate to catalog if not already there
        if (route !== '/catalog') {
          navigate('/catalog');
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        setIsSearching(false);
        
        switch(event.error) {
          case 'no-speech':
            setVoiceError('No speech detected. Please try again.');
            break;
          case 'audio-capture':
            setVoiceError('No microphone found. Please check your device.');
            break;
          case 'not-allowed':
            setVoiceError('Microphone permission denied.');
            break;
          case 'network':
            setVoiceError('Network error. Please check your connection.');
            break;
          default:
            setVoiceError('Voice recognition error. Please try again.');
        }
        
        setTimeout(() => setVoiceError(''), 5000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsSearching(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // Cleanup camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [route, navigate, performSearch, setSearchQuery, setIsSearching]);

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery, 'text');
      if (route !== '/catalog') {
        navigate('/catalog');
      }
    }
  };

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      setVoiceError('Voice search not supported in this browser.');
      setTimeout(() => setVoiceError(''), 5000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsSearching(false);
    } else {
      setVoiceError('');
      setIsListening(true);
      setIsSearching(true);
      setSearchMode('voice');
      recognitionRef.current.start();
    }
  };

  const handleImageSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSearching(true);
    setSearchMode('image');

    // Simulate image processing and keyword extraction
    setTimeout(() => {
      // Simulated keywords extracted from image to match actual pump products
      const simulatedKeywords = ['piston', 'hydraulic', 'pump'];
      const query = simulatedKeywords.join(' ');
      
      setSearchQuery(query);
      performSearch(query, 'image');
      setIsSearching(false);
      
      if (route !== '/catalog') {
        navigate('/catalog');
      }
    }, 1500);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startBarcodeScanner = async () => {
    try {
      setScanError('');
      setShowBarcodeScanner(true);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start scanning after video is ready
        videoRef.current.onloadedmetadata = () => {
          scanBarcode();
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setScanError('Camera access denied or not available. Please check permissions.');
      setShowBarcodeScanner(false);
    }
  };

  const scanBarcode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data (for future barcode detection library integration)
    // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simulated barcode detection (in production, use a library like @zxing/library or quagga2)
    // For now, we'll simulate finding a barcode after 2 seconds
    setTimeout(() => {
      // Simulated barcode result matching a real SKU
      const simulatedBarcode = 'AH1510-WCT';
      handleBarcodeDetected(simulatedBarcode);
    }, 2000);
  };

  const handleBarcodeDetected = (barcode: string) => {
    stopBarcodeScanner();
    setSearchMode('barcode');
    setSearchQuery(barcode);
    performSearch(barcode, 'barcode');
    
    if (route !== '/catalog') {
      navigate('/catalog');
    }
  };

  const stopBarcodeScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowBarcodeScanner(false);
    setShowManualEntry(false);
    setManualBarcode('');
  };

  const handleManualBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleBarcodeDetected(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const handleClear = () => {
    clearSearch();
    setVoiceError('');
  };



  return (
    <div className="flex-1 max-w-2xl relative">
      <form onSubmit={handleTextSearch} className="relative">
        {/* Search Input */}
        <div className="relative">
          <input 
            type="text" 
            placeholder={isListening ? "Listening..." : "Search products..."} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-slate-100 rounded-full py-2.5 pl-6 pr-40 text-sm text-slate-900 focus:outline-none shadow-inner border-0 focus:bg-slate-50 ${
              isListening ? 'animate-pulse' : ''
            }`}
            disabled={isListening || isSearching}
          />

          {/* Action Buttons */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Clear Button */}
            {searchQuery && !isListening && !isSearching && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 hover:bg-slate-200 rounded-full transition-colors"
                title="Clear search"
              >
                <X size={14} className="text-slate-400" />
              </button>
            )}

            {/* Loading Indicator */}
            {isSearching && (
              <div className="p-1.5">
                <Loader2 size={14} className="text-slate-400 animate-spin" />
              </div>
            )}

            {/* Voice Search Icon */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`p-1.5 rounded-full transition-colors ${
                isListening 
                  ? 'bg-slate-300 text-slate-700' 
                  : 'hover:bg-slate-200 text-slate-600'
              }`}
              title="Voice search"
              disabled={isSearching}
            >
              <Mic size={16} className={isListening ? 'animate-pulse' : ''} />
            </button>

            {/* Image Search Icon */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
              title="Image search"
              disabled={isSearching || isListening}
            >
              <ImageIcon size={16} />
            </button>

            {/* Barcode Scanner Icon */}
            <button
              type="button"
              onClick={startBarcodeScanner}
              className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
              title="Scan barcode"
              disabled={isSearching || isListening}
            >
              <ScanBarcode size={16} />
            </button>

            {/* Search Button */}
            <button 
              type="submit"
              className="bg-slate-700 text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
              disabled={isListening || isSearching}
              title="Search"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Hidden File Input for Image Search */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSearch}
          className="hidden"
        />
      </form>

      {/* Voice Error Message */}
      {voiceError && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 z-50">
          {voiceError}
        </div>
      )}

      {/* Scan Error Message */}
      {scanError && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 z-50">
          {scanError}
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-lg">Scan Barcode</h3>
              <button
                onClick={stopBarcodeScanner}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {!showManualEntry ? (
              <>
                <div className="relative bg-black aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-4 border-[#da789b] rounded-lg w-64 h-32 relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100% animate-pulse" 
                           style={{ animation: 'scan 2s ease-in-out infinite' }} />
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-slate-600 text-center mb-3">Position the barcode within the frame</p>
                  <p className="text-xs text-slate-400 text-center mb-4">Scanning will happen automatically</p>
                  
                  <button
                    onClick={() => setShowManualEntry(true)}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Type Barcode Instead
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6">
                <p className="text-sm text-slate-600 mb-4">Enter the barcode or SKU manually</p>
                
                <form onSubmit={handleManualBarcodeSubmit}>
                  <input
                    type="text"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="Enter barcode or SKU (e.g., AH1510-WCT)"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#da789b] focus:border-transparent mb-4"
                    autoFocus
                  />
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowManualEntry(false)}
                      className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Back to Camera
                    </button>
                    <button
                      type="submit"
                      disabled={!manualBarcode.trim()}
                      className="flex-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add scanning animation keyframes */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 4px); }
        }
      `}</style>
    </div>
  );
}
