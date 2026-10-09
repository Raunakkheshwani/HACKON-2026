import React, { useState, useRef, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import { useSituationParser } from '../hooks/useSituationParser';
import { X, Mic, Send, Sparkles, Check } from 'lucide-react';
import type { CartItem } from '../types';

interface SituationSheetProps {
  onClose: () => void;
}

export const SituationSheet: React.FC<SituationSheetProps> = ({ onClose }) => {
  const { addToCart, setTempSituationBudget, setBudget } = useBudget();
  const { parseSituation } = useSituationParser();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const typingIntervalRef = useRef<any>(null);

  const [manifest, setManifest] = useState<{
    situationName: string;
    calculatedBudget: number;
    recommendedItems: CartItem[];
    budgetBasisDescription: string;
  } | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const predefinedSituations = [
    'gym protein prep for the week',
    'sudden late night party with friends',
    'quick breakfast prep under 300 rupees',
    'sudden dinner guests arriving in 30 mins'
  ];

  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback simulation if browser does not support SpeechRecognition
      setIsListening(true);
      setTranscriptionText('');
      setInputText('Listening...');
      
      const randomSit = predefinedSituations[Math.floor(Math.random() * predefinedSituations.length)];
      const words = randomSit.split(' ');
      let currentWordIdx = 0;

      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }

      typingIntervalRef.current = setInterval(() => {
        currentWordIdx++;
        const partial = words.slice(0, currentWordIdx).join(' ');
        setTranscriptionText(partial);

        if (currentWordIdx >= words.length) {
          if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
          setTimeout(() => {
            setIsListening(false);
            setInputText(randomSit);
            handleParse(randomSit);
          }, 600);
        }
      }, 250);
      return;
    }

    // Native Speech Recognition active stream API
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = true;

    setIsListening(true);
    setTranscriptionText('');
    setInputText('Listening to microphone stream...');

    recognition.onstart = () => {
      console.log('Audio capture stream active');
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      setInputText('Microphone error: ' + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const resultText = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');

      setTranscriptionText(resultText);
      setInputText(resultText);

      if (event.results[0].isFinal) {
        setIsListening(false);
        handleParse(resultText);
      }
    };

    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() !== '') {
      handleParse(inputText);
    }
  };

  const handleParse = (text: string) => {
    const result = parseSituation(text);
    setManifest(result);
  };

  const handleAddItems = () => {
    if (!manifest) return;
    manifest.recommendedItems.forEach(item => {
      addToCart(item.product, item.quantity);
    });
    // Set situational temporary budget active
    setTempSituationBudget(manifest.calculatedBudget);
    // Optionally trigger entry budget limit set
    setBudget(manifest.calculatedBudget, 'Before Every Purchase');
    onClose();
  };

  const manifestTotal = manifest?.recommendedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;

  return (
    <div className="bottom-sheet-overlay">
      <div className="bottom-sheet" style={{ height: '85%', maxHeight: '85%', position: 'relative' }}>
        {/* Voice typing overlay screen */}
        {isListening && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(19, 25, 33, 0.96)', // Sleek dark overlay
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              color: '#ffffff',
              textAlign: 'center',
              animation: 'fadeIn 0.25s ease-out'
            }}
          >
            {/* Animated Waveform */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px', marginBottom: '24px' }}>
              {[1, 2.5, 4, 2, 5, 3.5, 1.5, 3, 4.5, 2, 1].map((scale, i) => (
                <div 
                  key={i}
                  style={{
                    width: '4px',
                    height: '100%',
                    backgroundColor: 'var(--amazon-orange)',
                    borderRadius: '2px',
                    transformOrigin: 'bottom',
                    transform: `scaleY(${scale * 0.2})`,
                    animation: 'voiceWave 0.8s ease-in-out infinite alternate',
                    animationDelay: `${i * 0.08}s`
                  }}
                ></div>
              ))}
            </div>

            {/* Big Mic Button in pulsing state */}
            <div 
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 153, 0, 0.2)',
                border: '3px solid var(--amazon-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'micPulse 1.5s infinite',
                marginBottom: '20px'
              }}
            >
              <Mic size={40} color="var(--amazon-orange)" />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Listening...</h3>

            {/* Simulated Speech-to-Text Typing Animation Output */}
            <div 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '16px 20px',
                width: '100%',
                maxWidth: '320px',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: '500',
                fontStyle: 'italic',
                lineHeight: '1.4',
                color: '#e8e8e8',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
              }}
            >
              {transcriptionText || 'Speak now...'}
            </div>

            <button 
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsListening(false);
                if (typingIntervalRef.current) {
                  clearInterval(typingIntervalRef.current);
                }
              }}
              style={{ 
                marginTop: '24px', 
                width: 'auto', 
                padding: '8px 20px', 
                backgroundColor: 'transparent',
                borderColor: 'rgba(255,255,255,0.4)',
                color: '#ffffff',
                boxShadow: 'none'
              }}
            >
              Cancel
            </button>
          </div>
        )}
        {/* Header */}
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--amazon-teal)" />
            <span className="sheet-title">AI Shop-for-Situation</span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Content */}
        <div className="sheet-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          
          {!manifest ? (
            <>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Tell the AI agent what you need to prepare for, and it will dynamically compile a budget-optimized basket.
              </p>

              {/* Input Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div 
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '24px', 
                    padding: '8px 16px',
                    border: '1px solid var(--amazon-border-gray)'
                  }}
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Describe your situation..."
                    disabled={isListening}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      color: 'var(--text-primary)'
                    }}
                  />
                  {inputText && (
                    <button 
                      type="button" 
                      onClick={() => setInputText('')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', marginRight: '6px' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={inputText.trim() === '' || isListening}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--amazon-orange)',
                    border: 'none',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: (inputText.trim() === '' || isListening) ? 0.6 : 1
                  }}
                >
                  <Send size={16} />
                </button>
              </form>

              {/* Simulated Voice Mic Pulse button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
                <button
                  onClick={handleMicClick}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: isListening ? 'rgba(255, 153, 0, 0.2)' : 'var(--amazon-teal-light)',
                    border: `2px solid ${isListening ? 'var(--amazon-orange)' : 'var(--amazon-teal)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s'
                  }}
                  className={isListening ? 'pulse-animation' : ''}
                >
                  <Mic size={32} color={isListening ? 'var(--amazon-orange)' : 'var(--amazon-teal)'} />
                </button>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: '500' }}>
                  {isListening ? 'Listening and processing...' : 'Tap to speak situation'}
                </span>

                {/* Pulsing wave mockup when listening */}
                {isListening && (
                  <div style={{ display: 'flex', gap: '3px', marginTop: '12px', height: '20px', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          width: '3px', 
                          height: `${h * 4}px`, 
                          backgroundColor: 'var(--amazon-orange)', 
                          borderRadius: '2px',
                          animation: 'pulse 0.5s infinite alternate',
                          animationDelay: `${i * 0.1}s`
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>

              {/* Predefined Suggestions */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Try asking for
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {predefinedSituations.map((sit, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(sit);
                        handleParse(sit);
                      }}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--amazon-border-gray)',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>⚡</span>
                      <span>{sit}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // MANIFEST VIEW
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Manifest Alert / Details */}
              <div 
                style={{
                  backgroundColor: 'var(--amazon-teal-light)',
                  border: '1.5px solid var(--amazon-teal)',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--amazon-teal)' }}>
                    📦 AI Manifest: {manifest.situationName}
                  </h3>
                  <button 
                    onClick={() => setManifest(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--amazon-teal)', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    RESET
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Calculated Target Budget:</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>₹{manifest.calculatedBudget}</span>
                </div>
                <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)', lineHeight: '1.4', fontStyle: 'italic' }}>
                  {manifest.budgetBasisDescription}
                </p>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>Items in Manifest</h4>
                <div 
                  style={{ 
                    maxHeight: '220px', 
                    overflowY: 'auto', 
                    border: '1px solid var(--amazon-border-gray)',
                    borderRadius: '8px',
                    padding: '0 8px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  {manifest.recommendedItems.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      No items fit within the calculated budget! Try increasing the target budget.
                    </div>
                  ) : (
                    manifest.recommendedItems.map((item, idx) => (
                      <div 
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 0',
                          borderBottom: idx === manifest.recommendedItems.length - 1 ? 'none' : '1px solid #f0f0f0'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{item.product.image}</span>
                          <div>
                            <h5 style={{ fontSize: '12.5px', fontWeight: '600', color: '#111' }}>{item.product.name}</h5>
                            <span 
                              style={{ 
                                fontSize: '8.5px', 
                                fontWeight: '700', 
                                padding: '1px 4px', 
                                borderRadius: '3px',
                                textTransform: 'uppercase',
                                backgroundColor: item.product.quality === 'budget-alternative' ? 'var(--amazon-fresh-green-light)' : '#d1ecf1',
                                color: item.product.quality === 'budget-alternative' ? 'var(--amazon-fresh-green)' : '#0c5460'
                              }}
                            >
                              {item.product.quality}
                            </span>
                          </div>
                        </div>
                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#111' }}>₹{item.product.price}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Price calculations */}
              <div 
                style={{ 
                  backgroundColor: '#f7f8f8', 
                  borderRadius: '8px', 
                  padding: '10px', 
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  border: '1px solid var(--amazon-border-gray)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Manifest Total:</span>
                  <span style={{ fontWeight: '700' }}>₹{manifestTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--amazon-fresh-green)' }}>
                  <span>Available Cushion:</span>
                  <span>₹{manifest.calculatedBudget - manifestTotal}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <button 
                  className="btn-primary"
                  onClick={handleAddItems}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Check size={16} />
                  1-Click Apply AI Manifest
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setManifest(null)}
                >
                  Back to Search
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SituationSheet;
