import React, { useState, useCallback } from 'react';
import type { EngajifyResult, AdvancedOptions as AdvancedOptionsType } from '../types';
import { generateContentStrategy } from '../services/geminiService';
import Header from './Header';
import ImageUploader from './ImageUploader';
import AdvancedOptions from './AdvancedOptions';
import ResultsDisplay from './ResultsDisplay';
import Loader from './Loader';
import TechLoader from './TechLoader';
import { StrategyIcon, XIcon, RefreshIcon } from './Icons'; // Import RefreshIcon
import ThemeSelector from './ThemeSelector';
import Modal from './Modal';
import { themes } from '../themes';
import { useAuth } from '../contexts/AuthContext';
import Auth from './Auth';
import SoftLightBackground from './SoftLightBackground';
import LiquidGlassBackground from './LiquidGlassBackground';
import { useLowPerformanceDevice } from '../hooks/useLowPerformanceDevice';

const Dashboard: React.FC = () => {
  const { session } = useAuth();
  const { isLowPerformance } = useLowPerformanceDevice();
  const [image, setImage] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>('');
  const [contextText, setContextText] = useState<string>('');
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptionsType>({
    platform: 'Instagram',
    objective: 'Engajamento',
    voiceStyle: 'Casual',
    language: 'Português (Brasil)',
  });
  const [results, setResults] = useState<EngajifyResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(Date.now());
  const [isResetting, setIsResetting] = useState(false); // New state for reset animation

  const handleImageChange = (file: File, base64: string, mimeType: string) => {
    setImage(file);
    setImageBase64(base64);
    setImageMimeType(mimeType);
    setResults(null);
    setError(null);
  };
  
  const handleClearSelection = () => {
      setTheme('');
  }
  
  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
    setResults(null);
    setError(null);
    setIsThemeModalOpen(false);
  };

  const handleSubmit = useCallback(async () => {
    if (!imageBase64 && !theme) {
      setError('Por favor, envie uma imagem ou selecione um tema.');
      return;
    }
    if (!session) {
      setError('Você precisa estar logado para gerar uma estratégia.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const mode = showAdvanced ? 'Avançado' : 'Rápido';
      const response = await generateContentStrategy(
        imageBase64,
        imageMimeType,
        theme,
        contextText,
        mode,
        advancedOptions
      );
      setResults(response);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao gerar o conteúdo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [imageBase64, imageMimeType, theme, contextText, showAdvanced, advancedOptions, session]);
  
  const selectedThemeObject = themes.find(t => t.value === theme);

  const handlePageReset = () => {
    if (isResetting) return; // Prevent multiple clicks during animation

    setIsResetting(true);

    // Wait for fade-out animation to complete before resetting state
    setTimeout(() => {
      // Reset all state variables to their initial values
      setImage(null);
      setImageBase64(null);
      setImageMimeType(null);
      setTheme('');
      setContextText('');
      setAdvancedOptions({
        platform: 'Instagram',
        objective: 'Engajamento',
        voiceStyle: 'Casual',
        language: 'Português (Brasil)',
      });
      setResults(null);
      setError(null);
      setShowAdvanced(false);
      // Force re-mount of ImageUploader to clear its internal state by changing its key
      setUploaderKey(Date.now());
      
      setIsResetting(false); // End of animation cycle
    }, 400); // Duration should match the fade-out animation
  };

  return (
    <div className="min-h-screen">
      <Header>
        <div className="flex items-center gap-4">
          <Auth />
        </div>
      </Header>
      <main className="container mx-auto p-4 md:p-8">
        <div className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 ${isResetting ? 'fade-out-fast' : 'animate-fade-in'}`}>
          {/* Input Column */}
          <LiquidGlassBackground className="p-6 rounded-[12px] flex flex-col surface-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">1. Forneça o Contexto</h2>
              <button
                onClick={handlePageReset}
                className="icon-button p-2 text-gray-400 hover:text-white disabled:opacity-50"
                aria-label="Reiniciar página"
                title="Reiniciar"
                disabled={isResetting}
              >
                <RefreshIcon className={`w-5 h-5 ${isResetting ? 'spin-once' : ''}`} />
              </button>
            </div>
            <ImageUploader key={uploaderKey} onImageChange={handleImageChange} onClear={() => { setImage(null); setImageBase64(null); setImageMimeType(null); }} />
            
            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-[var(--border-color)]"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">OU</span>
              <div className="flex-grow border-t border-[var(--border-color)]"></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Selecione um tema
              </label>
              {selectedThemeObject ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg inset-surface">
                    <div className="flex items-center">
                        <span className="text-2xl mr-3" role="img" aria-label={selectedThemeObject.label}>{selectedThemeObject.icon}</span>
                        <span className="font-semibold">{selectedThemeObject.label}</span>
                    </div>
                    <button onClick={handleClearSelection} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-[var(--button-secondary-bg)]">
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsThemeModalOpen(true)}
                  className="w-full text-left p-3 form-input"
                >
                  <span className='text-[var(--text-secondary)]'>Escolha um tema...</span>
                </button>
              )}
            </div>
            
            <div className="mt-6">
                <label htmlFor="context" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Contexto Adicional (Opcional)
                </label>
                <textarea
                    id="context"
                    value={contextText}
                    onChange={(e) => setContextText(e.target.value)}
                    className="w-full h-24 form-input resize-none"
                    placeholder="Forneça mais detalhes sobre seu público, produto ou objetivo..."
                />
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">2. Escolha o Modo</h2>
                  <div className="flex items-center p-1 rounded-lg inset-surface">
                    <button
                        onClick={() => setShowAdvanced(false)}
                        className={`w-1/2 py-1.5 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${!showAdvanced ? 'bg-[var(--button-secondary-bg)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        Rápido
                    </button>
                    <button
                        onClick={() => setShowAdvanced(true)}
                        className={`w-1/2 py-1.5 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${showAdvanced ? 'bg-[var(--button-secondary-bg)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        Avançado
                    </button>
                </div>
            </div>

            {showAdvanced && (
                <div className="mt-8 animate-fade-in">
                    <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">3. Opções Avançadas</h2>
                    <AdvancedOptions options={advancedOptions} setOptions={setAdvancedOptions} />
                </div>
            )}
            
            <div className="flex-grow"></div>
            <button
              onClick={handleSubmit}
              disabled={isLoading || (!imageBase64 && !theme) || !session}
              className="mt-8 w-full bg-[var(--accent-primary)] text-[var(--accent-primary-text)] font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:brightness-110 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  <StrategyIcon className="w-5 h-5 mr-2" />
                  Gerar Estratégia
                </>
              )}
            </button>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          </LiquidGlassBackground>

          {/* Output Column */}
          <LiquidGlassBackground className="p-6 rounded-[12px] min-h-[500px] flex flex-col surface-card">
              <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">Sua Estratégia de Conteúdo</h2>
              {isLoading ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
                  <TechLoader isLowPerformance={isLowPerformance} />
                </div>
              ) : results ? (
                <ResultsDisplay results={results} />
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
                  <TechLoader isLowPerformance={isLowPerformance} variant="idle" />
                  {!session && (
                    <p className="text-sm text-gray-500 mt-4">Faça login para começar a gerar.</p>
                  )}
                </div>
              )}
          </LiquidGlassBackground>
        </div>
      </main>
      
      <Modal 
        isOpen={isThemeModalOpen} 
        onClose={() => setIsThemeModalOpen(false)}
        title="Selecione um Tema"
      >
        <ThemeSelector 
          selectedTheme={theme}
          onThemeChange={handleThemeChange}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;