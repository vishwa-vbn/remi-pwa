import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVolumeUp, FaStopCircle, FaMicrophone, FaTrash } from 'react-icons/fa';
import { useSpeech } from 'react-text-to-speech';  // <-- import here
import { GEMINI_KEY } from '../../env';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [conversationHistory, setConversationHistory] = useState(() => {
    const saved = localStorage.getItem('conversationHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // === react-text-to-speech hook usage ===
  // Pass the responseText as `text` to useSpeech, but only start when responseText changes.
  const {
    start: ttsStart,
    stop: ttsStop,
    pause: ttsPause,
    speechStatus,
  } = useSpeech({
    text: responseText,
    onStart() {
      // When TTS starts, stop recognition and set processing
      if (recognitionRef.current && isListening) {
        recognitionRef.current.abort();
        setIsListening(false);
      }
      setIsProcessing(true);
    },
    onEnd() {
      setIsProcessing(false);
      setResponseText(''); // clear response text after speaking
      // Restart recognition after speaking ends
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.warn('Recognition start error:', e);
        }
      }
    },
    onError(error) {
      console.error('TTS error:', error);
      setIsProcessing(false);
      // Try to restart recognition on error
      if (recognitionRef.current && !isListening) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch {}
      }
    },
  });

  // Clean text helper (unchanged)
  const cleanResponseText = (text) =>
    text
      .replace(/[*_~`#+=|{}[\]()\\<>^$@!%]/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/(\w)\s*\.\s*(\w)/g, '$1. $2')
      .trim();

  // Remove the old speak function since we now use react-text-to-speech hook

  // Call Gemini API with conversation history
  const handleGeminiAPI = async (userMessage) => {
    setIsProcessing(true);
    const updatedHistory = [...conversationHistory, { role: 'user', text: userMessage }];

    const messages = updatedHistory.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: messages }),
        }
      );

      const data = await res.json();
      const geminiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
      const cleaned = cleanResponseText(geminiText);

      const newHistory = [...updatedHistory, { role: 'model', text: cleaned }];
      setConversationHistory(newHistory);
      localStorage.setItem('conversationHistory', JSON.stringify(newHistory));

      setResponseText(cleaned);
      ttsStart(); // Start speaking with react-text-to-speech
    } catch (err) {
      console.error('Gemini error:', err);
      const fallback = 'Sorry, an error occurred.';
      setResponseText(fallback);
      ttsStart();
    }
  };

  // Setup speech recognition on mount (unchanged)
  useEffect(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setTranscript(spoken);
      handleGeminiAPI(spoken);
    };

    recognition.onerror = (e) => {
      console.error('Recognition error:', e.error);
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      // If we are supposed to be listening (no ongoing TTS), restart recognition
      if (isListening && !isProcessing) {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Recognition restart error:', e);
        }
      }
    };

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, []); // Empty deps to run once

  // AudioContext management - create only when listening or processing, close when not (unchanged)
  useEffect(() => {
    if (isListening || isProcessing) {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
      }
    } else {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
      analyserRef.current = null;
    }
  }, [isListening, isProcessing]);

  // Toggle listening with button (manual start/stop) (unchanged except stop TTS on stop)
  const toggleListening = () => {
    const recognition = recognitionRef.current;
    ttsStop(); // stop any ongoing speech

    if (isListening) {
      recognition.abort();
      setIsListening(false);
      setIsProcessing(false);
    } else {
      setTranscript('');
      setResponseText('');
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  };

  // Clear conversation button (unchanged except stop TTS)
  const clearConversation = () => {
    setConversationHistory([]);
    localStorage.removeItem('conversationHistory');
    ttsStop();
    setResponseText('');
    setTranscript('');
  };

  // Waveform visualizer remains same (unchanged)
  const WaveformVisualizer = ({ analyser }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!analyser) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const draw = () => {
        requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#22c55e';
        ctx.beginPath();

        const sliceWidth = canvas.width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      };

      draw();
    }, [analyser]);

    return <canvas ref={canvasRef} className="w-full h-12 rounded-lg" />;
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.button
        className={`p-4 rounded-full shadow-lg focus:outline-none ${
          isListening ? 'bg-red-500' : 'bg-blue-600'
        } text-white`}
        onClick={toggleListening}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isListening ? <FaStopCircle size={24} /> : <FaMicrophone size={24} />}
      </motion.button>

      <AnimatePresence>
        {(isListening || isProcessing) && (
          <motion.div
            className="absolute bottom-16 right-0 bg-gray-800 text-white p-4 rounded-lg shadow-xl w-64 max-h-64 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FaVolumeUp size={16} />
                <span className="font-semibold text-sm">
                  {isListening ? 'Listening...' : 'Processing...'}
                </span>
              </div>
              <button onClick={clearConversation} title="Clear conversation">
                <FaTrash size={14} className="text-gray-400 hover:text-red-400" />
              </button>
            </div>
            {transcript && <p className="text-xs mb-2 text-left">You said: {transcript}</p>}
            {responseText && (
              <p className="text-xs mb-2 text-left whitespace-pre-wrap">Response: {responseText}</p>
            )}
            <WaveformVisualizer analyser={analyserRef.current} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceAssistant;
