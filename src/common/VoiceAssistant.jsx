// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   FaVolumeUp,
//   FaStopCircle,
//   FaMicrophone,
//   FaTrash,
// } from "react-icons/fa";
// import { GEMINI_KEY } from "../../env";

// const VoiceAssistant = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [responseText, setResponseText] = useState("");
//   const [conversationHistory, setConversationHistory] = useState(() => {
//     const saved = localStorage.getItem("conversationHistory");
//     return saved ? JSON.parse(saved) : [];
//   });

//   const recognitionRef = useRef(null);
//   const audioContextRef = useRef(null);
//   const analyserRef = useRef(null);
//   const utteranceRef = useRef(null); // track current utterance

//   // Clean text helper
//   const cleanResponseText = (text) =>
//     text
//       .replace(/[*_~`#+=|{}[\]()\\<>^$@!%]/g, "")
//       .replace(/\n+/g, " ")
//       .replace(/\s+/g, " ")
//       .replace(/(\w)\s*\.\s*(\w)/g, "$1. $2")
//       .trim();

//   const speak = async (text) => {
//     if (!text) return;
//     setIsProcessing(true);

//     // Cancel any ongoing speech or recognition first
//     window.speechSynthesis.cancel();
//     if (recognitionRef.current && isListening) {
//       recognitionRef.current.abort();
//       setIsListening(false);
//     }

//     const waitForVoices = () =>
//       new Promise((resolve) => {
//         const voices = window.speechSynthesis.getVoices();
//         if (voices.length) return resolve(voices);
//         window.speechSynthesis.onvoiceschanged = () =>
//           resolve(window.speechSynthesis.getVoices());
//       });

//     const voices = await waitForVoices();
//     const utterance = new SpeechSynthesisUtterance(text);

//     utterance.voice =
//       voices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ||
//       voices.find((v) => v.lang === "en-US");
//     utterance.rate = 1.0;
//     utterance.pitch = 1.0;

//     let resumeIntervalId = null;

//     utterance.onstart = () => {
//       // Start the periodic resume workaround to prevent speech cut-off
//       resumeIntervalId = setInterval(() => {
//         if (window.speechSynthesis.speaking) {
//           window.speechSynthesis.pause();
//           window.speechSynthesis.resume();
//         } else {
//           clearInterval(resumeIntervalId);
//         }
//       }, 14000);

//       // Ensure recognition is stopped while speaking
//       if (recognitionRef.current && isListening) {
//         recognitionRef.current.abort();
//         setIsListening(false);
//       }
//     };

//     utterance.onend = () => {
//       // Clear interval once speaking is done
//       if (resumeIntervalId) {
//         clearInterval(resumeIntervalId);
//         resumeIntervalId = null;
//       }
//       setIsProcessing(false);
//       setResponseText("");
//       // Restart recognition for user input
//       if (recognitionRef.current) {
//         try {
//           recognitionRef.current.start();
//           setIsListening(true);
//         } catch (e) {
//           console.warn("Recognition start error:", e);
//         }
//       }
//     };

//     utterance.onerror = (event) => {
//       console.error("SpeechSynthesisUtterance error:", event.error);
//       setIsProcessing(false);
//       if (recognitionRef.current && !isListening) {
//         try {
//           recognitionRef.current.start();
//           setIsListening(true);
//         } catch {}
//       }
//       if (resumeIntervalId) {
//         clearInterval(resumeIntervalId);
//         resumeIntervalId = null;
//       }
//     };

//     utteranceRef.current = utterance;
//     window.speechSynthesis.speak(utterance);
//   };

//   // Call Gemini API with conversation history
//   const handleGeminiAPI = async (userMessage) => {
//     setIsProcessing(true);
//     const updatedHistory = [
//       ...conversationHistory,
//       { role: "user", text: userMessage },
//     ];

//     const messages = updatedHistory.map((m) => ({
//       role: m.role,
//       parts: [{ text: m.text }],
//     }));

//     try {
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ contents: messages }),
//         }
//       );

//       const data = await res.json();
//       const geminiText =
//         data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
//       const cleaned = cleanResponseText(geminiText);

//       const newHistory = [...updatedHistory, { role: "model", text: cleaned }];
//       setConversationHistory(newHistory);
//       localStorage.setItem("conversationHistory", JSON.stringify(newHistory));

//       setResponseText(cleaned);
//       await speak(cleaned);
//     } catch (err) {
//       console.error("Gemini error:", err);
//       const fallback = "Sorry, an error occurred.";
//       setResponseText(fallback);
//       await speak(fallback);
//     }
//   };

//   // Setup speech recognition on mount
//   useEffect(() => {
//     if (
//       !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
//     ) {
//       console.error("Speech recognition not supported.");
//       return;
//     }

//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();
//     recognitionRef.current = recognition;

//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = "en-US";

//     recognition.onresult = (e) => {
//       const spoken = e.results[0][0].transcript;
//       setTranscript(spoken);
//       handleGeminiAPI(spoken);
//     };

//     recognition.onerror = (e) => {
//       console.error("Recognition error:", e.error);
//       setIsListening(false);
//       setIsProcessing(false);
//     };

//     recognition.onend = () => {
//       // If we are supposed to be listening (no ongoing TTS), restart recognition
//       if (isListening && !isProcessing) {
//         try {
//           recognition.start();
//         } catch (e) {
//           console.warn("Recognition restart error:", e);
//         }
//       }
//     };

//     return () => {
//       try {
//         recognition.stop();
//       } catch {}
//     };
//   }, []); // Empty deps to run once

//   // AudioContext management - create only when listening or processing, close when not
//   useEffect(() => {
//     if (isListening || isProcessing) {
//       if (
//         !audioContextRef.current ||
//         audioContextRef.current.state === "closed"
//       ) {
//         audioContextRef.current = new (window.AudioContext ||
//           window.webkitAudioContext)();
//         analyserRef.current = audioContextRef.current.createAnalyser();
//         analyserRef.current.fftSize = 2048;
//       }
//     } else {
//       if (
//         audioContextRef.current &&
//         audioContextRef.current.state !== "closed"
//       ) {
//         audioContextRef.current.close();
//       }
//       audioContextRef.current = null;
//       analyserRef.current = null;
//     }
//   }, [isListening, isProcessing]);

//   // Toggle listening with button (manual start/stop)
//   const toggleListening = () => {
//     const recognition = recognitionRef.current;
//     window.speechSynthesis.cancel();

//     if (isListening) {
//       recognition.abort();
//       setIsListening(false);
//       setIsProcessing(false);
//     } else {
//       setTranscript("");
//       setResponseText("");
//       try {
//         recognition.start();
//         setIsListening(true);
//       } catch (e) {
//         console.warn("Recognition start error:", e);
//       }
//     }
//   };

//   // Clear conversation button
//   const clearConversation = () => {
//     setConversationHistory([]);
//     localStorage.removeItem("conversationHistory");
//     window.speechSynthesis.cancel();
//     setResponseText("");
//     setTranscript("");
//   };

//   // Waveform visualizer remains same
//   const WaveformVisualizer = ({ analyser }) => {
//     const canvasRef = useRef(null);

//     useEffect(() => {
//       if (!analyser) return;
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");
//       const dataArray = new Uint8Array(analyser.frequencyBinCount);

//       const draw = () => {
//         requestAnimationFrame(draw);
//         analyser.getByteTimeDomainData(dataArray);

//         ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
//         ctx.fillRect(0, 0, canvas.width, canvas.height);

//         ctx.lineWidth = 2;
//         ctx.strokeStyle = "#22c55e";
//         ctx.beginPath();

//         const sliceWidth = canvas.width / dataArray.length;
//         let x = 0;

//         for (let i = 0; i < dataArray.length; i++) {
//           const v = dataArray[i] / 128.0;
//           const y = (v * canvas.height) / 2;
//           if (i === 0) ctx.moveTo(x, y);
//           else ctx.lineTo(x, y);
//           x += sliceWidth;
//         }

//         ctx.lineTo(canvas.width, canvas.height / 2);
//         ctx.stroke();
//       };

//       draw();
//     }, [analyser]);

//     return <canvas ref={canvasRef} className="w-full h-12 rounded-lg" />;
//   };

//   return (
//     <div className="fixed bottom-25 right-4 z-50">
//       <motion.button
//         className={`p-2 rounded-full shadow-lg focus:outline-none ${
//           isListening ? "bg-red-500" : "bg-blue-600"
//         } text-white`}
//         onClick={toggleListening}
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.9 }}
//       >
//         {isListening ? <FaStopCircle size={24} /> : <FaMicrophone size={24} />}
//       </motion.button>

//       <AnimatePresence>
//         {(isListening || isProcessing) && (
//           <motion.div
//             className="absolute bottom-16 right-0 bg-gray-800 text-white p-4 rounded-lg shadow-xl w-64 max-h-64 overflow-y-auto"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 20 }}
//             transition={{ duration: 0.3 }}
//           >
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center space-x-2">
//                 <FaVolumeUp size={16} />
//                 <span className="font-semibold text-sm">
//                   {isListening ? "Listening..." : "Processing..."}
//                 </span>
//               </div>
//               <button onClick={clearConversation} title="Clear conversation">
//                 <FaTrash
//                   size={14}
//                   className="text-gray-400 hover:text-red-400"
//                 />
//               </button>
//             </div>
//             {transcript && (
//               <p className="text-xs mb-2 text-left">You said: {transcript}</p>
//             )}
//             {responseText && (
//               <p className="text-xs mb-2 text-left whitespace-pre-wrap">
//                 Response: {responseText}
//               </p>
//             )}
//             <WaveformVisualizer analyser={analyserRef.current} />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default VoiceAssistant;


import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMicrophone,
  FaStopCircle,
  FaTrash,
  FaCheckCircle,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { GEMINI_KEY } from "../../env";
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";

// Framer Motion variants for bottom sheet animation
const sheetVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { y: "100%", opacity: 0, transition: { duration: 0.3 } },
};

const VoiceAssistantSheet = ({ onSubmit, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [step, setStep] = useState("title"); // Steps: title, description, note, confirm
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    note: "",
    timestamp: new Date().getTime(),
    alert: false,
    alertMinutes: 5,
    status: false,
    userId,
  });
  const [aiEnhancedText, setAiEnhancedText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const recognitionRef = useRef(null);

  // Clean text helper
  const cleanResponseText = (text) =>
    text
      .replace(/[*_~#+=|{}[\]()\\<>^$@!%]/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  // Speak text
  const speak = async (text) => {
    if (!text) return;
    setIsProcessing(true);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice =
      voices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ||
      voices.find((v) => v.lang === "en-US");
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsProcessing(false);
      if (isListening) startListening();
    };

    utterance.onerror = () => {
      setIsProcessing(false);
      if (isListening) startListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Call Gemini API to enhance text
  const enhanceText = async (inputText, context) => {
    setIsProcessing(true);
    try {
      const prompt = `Enhance the following ${context} for a task. Make it clear, concise, and professional:\n\n${inputText}`;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );
      const data = await res.json();
      const enhanced = cleanResponseText(
        data?.candidates?.[0]?.content?.parts?.[0]?.text || inputText
      );
      setIsProcessing(false);
      return enhanced;
    } catch (err) {
      console.error("Gemini error:", err);
      setIsProcessing(false);
      return inputText;
    }
  };

  // Setup speech recognition
  useEffect(() => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      console.error("Speech recognition not supported.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setTranscript(spoken);
      setUserInput(spoken);
      if (!awaitingConfirmation) {
        processInput(spoken);
      }
    };

    recognition.onerror = (e) => {
      console.error("Recognition error:", e.error);
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      if (isListening && !isProcessing) {
        try {
          recognition.start();
        } catch {}
      }
    };

    return () => {
      recognition.stop();
    };
  }, [isListening, isProcessing, awaitingConfirmation]);

  // Start listening
  const startListening = () => {
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn("Recognition start error:", e);
    }
  };

  // Process user input
  const processInput = async (input) => {
    setIsListening(false);
    setTranscript(input);
    const context = step === "title" ? "task title" : step === "description" ? "task description" : "task note";
    await speak(`You said: ${input}. Would you like me to enhance it or proceed with this ${context}?`);
    setAwaitingConfirmation(true);
  };

  // Handle enhancement
  const handleEnhance = async () => {
    const context = step === "title" ? "task title" : step === "description" ? "task description" : "task note";
    const enhanced = await enhanceText(userInput, context);
    setAiEnhancedText(enhanced);
    await speak(`Here’s the enhanced ${context}: ${enhanced}. Do you want to use this or edit it manually?`);
    setAwaitingConfirmation(true);
  };

  // Confirm and move to next step
  const confirmInput = () => {
    const input = userInput || aiEnhancedText;
    setTaskData((prev) => ({ ...prev, [step]: input }));
    setAwaitingConfirmation(false);
    setTranscript("");
    setUserInput("");
    setAiEnhancedText("");
    moveToNextStep();
  };

  // Move to next step
  const moveToNextStep = async () => {
    if (step === "title") {
      setStep("description");
      await speak("Please provide the task description.");
      startListening();
    } else if (step === "description") {
      setStep("note");
      await speak("Please provide any additional notes, or say 'skip' to proceed.");
      startListening();
    } else if (step === "note") {
      setStep("confirm");
      await speak(
        `Task summary: Title: ${taskData.title}, Description: ${taskData.description}, Note: ${taskData.note || "None"}. Confirm to save or cancel to discard.`
      );
    } else if (step === "confirm") {
      onSubmit(taskData);
      resetAndClose();
    }
  };

  // Toggle assistant
  const toggleAssistant = () => {
    if (isOpen) {
      resetAndClose();
    } else {
      setIsOpen(true);
      speak("Please provide the task title.");
      startListening();
    }
  };

  // Reset and close
  const resetAndClose = () => {
    setIsOpen(false);
    setIsListening(false);
    setIsProcessing(false);
    setTranscript("");
    setStep("title");
    setTaskData({
      title: "",
      description: "",
      note: "",
      timestamp: new Date().getTime(),
      alert: false,
      alertMinutes: 5,
      status: false,
      userId,
    });
    setAiEnhancedText("");
    setUserInput("");
    setAwaitingConfirmation(false);
    window.speechSynthesis.cancel();
    recognitionRef.current?.abort();
  };

  // Skip note
  const skipNote = () => {
    setTaskData((prev) => ({ ...prev, note: "" }));
    setStep("confirm");
    speak(
      `Task summary: Title: ${taskData.title}, Description: ${taskData.description}, Note: None. Confirm to save or cancel to discard.`
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.button
        className={`p-3 rounded-full shadow-lg focus:outline-none ${
          isOpen ? "bg-red-500" : "bg-blue-600"
        } text-white`}
        onClick={toggleAssistant}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <FaStopCircle size={24} /> : <FaMicrophone size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              width: "100%",
              maxWidth: "600px",
              position: "fixed",
              bottom: 0,
              right: 0,
              left: 0,
              margin: "auto",
            }}
          >
            <Box
              sx={{
                width: "100%",
                bgcolor: "background.paper",
                borderRadius: "16px 16px 0 0",
                border: "1px solid",
                borderColor: "grey.200",
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                p: 2,
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  Voice Task Creation
                </Typography>
                <IconButton onClick={resetAndClose}>
                  <IoClose size={24} />
                </IconButton>
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                {transcript && (
                  <Typography variant="body2">
                    You said: {transcript}
                  </Typography>
                )}
                {aiEnhancedText && (
                  <Typography variant="body2">
                    Enhanced: {aiEnhancedText}
                  </Typography>
                )}
                {awaitingConfirmation && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <TextField
                      fullWidth
                      label={`Edit ${step}`}
                      value={userInput || aiEnhancedText}
                      onChange={(e) => setUserInput(e.target.value)}
                      variant="outlined"
                    />
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={confirmInput}
                        startIcon={<FaCheckCircle />}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleEnhance}
                        disabled={isProcessing}
                      >
                        Enhance
                      </Button>
                      {step === "note" && (
                        <Button
                          variant="outlined"
                          onClick={skipNote}
                          disabled={isProcessing}
                        >
                          Skip
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}
                {isProcessing && <CircularProgress size={24} />}
                {step === "confirm" && !awaitingConfirmation && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setStep("confirm");
                        confirmInput();
                      }}
                      startIcon={<FaCheckCircle />}
                    >
                      Save Task
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={resetAndClose}
                      start>Cancel</Button>
                  </Box>
                )}
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceAssistantSheet;