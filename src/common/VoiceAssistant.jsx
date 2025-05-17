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


// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   FaMicrophone,
//   FaStopCircle,
//   FaTrash,
//   FaCheckCircle,
// } from "react-icons/fa";
// import { IoClose } from "react-icons/io5";
// import { GEMINI_KEY } from "../../env";
// import {
//   Box,
//   Typography,
//   Button,
//   IconButton,
//   TextField,
//   CircularProgress,
// } from "@mui/material";

// // Framer Motion variants for bottom sheet animation
// const sheetVariants = {
//   hidden: { y: "100%", opacity: 0 },
//   visible: {
//     y: 0,
//     opacity: 1,
//     transition: { type: "spring", stiffness: 300, damping: 30 },
//   },
//   exit: { y: "100%", opacity: 0, transition: { duration: 0.3 } },
// };

// const VoiceAssistantSheet = ({ onSubmit, userId }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [step, setStep] = useState("title"); // Steps: title, description, note, confirm
//   const [taskData, setTaskData] = useState({
//     title: "",
//     description: "",
//     note: "",
//     timestamp: new Date().getTime(),
//     alert: false,
//     alertMinutes: 5,
//     status: false,
//     userId,
//   });
//   const [aiEnhancedText, setAiEnhancedText] = useState("");
//   const [userInput, setUserInput] = useState("");
//   const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
//   const recognitionRef = useRef(null);

//   // Clean text helper
//   const cleanResponseText = (text) =>
//     text
//       .replace(/[*_~#+=|{}[\]()\\<>^$@!%]/g, "")
//       .replace(/\n+/g, " ")
//       .replace(/\s+/g, " ")
//       .trim();

//   // Speak text
//   const speak = async (text) => {
//     if (!text) return;
//     setIsProcessing(true);
//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     const voices = window.speechSynthesis.getVoices();
//     utterance.voice =
//       voices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ||
//       voices.find((v) => v.lang === "en-US");
//     utterance.rate = 1.0;
//     utterance.pitch = 1.0;

//     utterance.onend = () => {
//       setIsProcessing(false);
//       if (isListening) startListening();
//     };

//     utterance.onerror = () => {
//       setIsProcessing(false);
//       if (isListening) startListening();
//     };

//     window.speechSynthesis.speak(utterance);
//   };

//   // Call Gemini API to enhance text
//   const enhanceText = async (inputText, context) => {
//     setIsProcessing(true);
//     try {
//       const prompt = `Enhance the following ${context} for a task. Make it clear, concise, and professional:\n\n${inputText}`;
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [{ role: "user", parts: [{ text: prompt }] }],
//           }),
//         }
//       );
//       const data = await res.json();
//       const enhanced = cleanResponseText(
//         data?.candidates?.[0]?.content?.parts?.[0]?.text || inputText
//       );
//       setIsProcessing(false);
//       return enhanced;
//     } catch (err) {
//       console.error("Gemini error:", err);
//       setIsProcessing(false);
//       return inputText;
//     }
//   };

//   // Setup speech recognition
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
//       setUserInput(spoken);
//       if (!awaitingConfirmation) {
//         processInput(spoken);
//       }
//     };

//     recognition.onerror = (e) => {
//       console.error("Recognition error:", e.error);
//       setIsListening(false);
//       setIsProcessing(false);
//     };

//     recognition.onend = () => {
//       if (isListening && !isProcessing) {
//         try {
//           recognition.start();
//         } catch {}
//       }
//     };

//     return () => {
//       recognition.stop();
//     };
//   }, [isListening, isProcessing, awaitingConfirmation]);

//   // Start listening
//   const startListening = () => {
//     try {
//       recognitionRef.current.start();
//       setIsListening(true);
//     } catch (e) {
//       console.warn("Recognition start error:", e);
//     }
//   };

//   // Process user input
//   const processInput = async (input) => {
//     setIsListening(false);
//     setTranscript(input);
//     const context =
//       step === "title"
//         ? "task title"
//         : step === "description"
//         ? "task description"
//         : "task note";
//     await speak(
//       `You said: ${input}. Would you like me to enhance it or proceed with this ${context}?`
//     );
//     setAwaitingConfirmation(true);
//   };

//   // Handle enhancement
//   const handleEnhance = async () => {
//     const context =
//       step === "title"
//         ? "task title"
//         : step === "description"
//         ? "task description"
//         : "task note";
//     const enhanced = await enhanceText(userInput, context);
//     setAiEnhancedText(enhanced);
//     await speak(
//       `Here’s the enhanced ${context}: ${enhanced}. Do you want to use this or edit it manually?`
//     );
//     setAwaitingConfirmation(true);
//   };

//   // Confirm and move to next step
//   const confirmInput = () => {
//     const input = userInput || aiEnhancedText;
//     setTaskData((prev) => ({ ...prev, [step]: input }));
//     setAwaitingConfirmation(false);
//     setTranscript("");
//     setUserInput("");
//     setAiEnhancedText("");
//     moveToNextStep();
//   };

//   // Move to next step
//   const moveToNextStep = async () => {
//     if (step === "title") {
//       setStep("description");
//       await speak("Please provide the task description.");
//       startListening();
//     } else if (step === "description") {
//       setStep("note");
//       await speak(
//         "Please provide any additional notes, or say 'skip' to proceed."
//       );
//       startListening();
//     } else if (step === "note") {
//       setStep("confirm");
//       await speak(
//         `Task summary: Title: ${taskData.title}, Description: ${
//           taskData.description
//         }, Note: ${
//           taskData.note || "None"
//         }. Confirm to save or cancel to discard.`
//       );
//     } else if (step === "confirm") {
//       onSubmit(taskData);
//       resetAndClose();
//     }
//   };

//   // Toggle assistant
//   const toggleAssistant = () => {
//     if (isOpen) {
//       resetAndClose();
//     } else {
//       setIsOpen(true);
//       speak("Please provide the task title.");
//       startListening();
//     }
//   };

//   // Reset and close
//   const resetAndClose = () => {
//     setIsOpen(false);
//     setIsListening(false);
//     setIsProcessing(false);
//     setTranscript("");
//     setStep("title");
//     setTaskData({
//       title: "",
//       description: "",
//       note: "",
//       timestamp: new Date().getTime(),
//       alert: false,
//       alertMinutes: 5,
//       status: false,
//       userId,
//     });
//     setAiEnhancedText("");
//     setUserInput("");
//     setAwaitingConfirmation(false);
//     window.speechSynthesis.cancel();
//     recognitionRef.current?.abort();
//   };

//   // Skip note
//   const skipNote = () => {
//     setTaskData((prev) => ({ ...prev, note: "" }));
//     setStep("confirm");
//     speak(
//       `Task summary: Title: ${taskData.title}, Description: ${taskData.description}, Note: None. Confirm to save or cancel to discard.`
//     );
//   };

//   return (
//     <div className="fixed bottom-4 right-4 z-50">
//       <motion.button
//         className={`p-3 rounded-full shadow-lg focus:outline-none ${
//           isOpen ? "bg-red-500" : "bg-blue-600"
//         } text-white`}
//         onClick={toggleAssistant}
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.9 }}
//       >
//         {isOpen ? <FaStopCircle size={24} /> : <FaMicrophone size={24} />}
//       </motion.button>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             variants={sheetVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             style={{
//               width: "100%",
//               maxWidth: "600px",
//               position: "fixed",
//               bottom: 0,
//               right: 0,
//               left: 0,
//               margin: "auto",
//             }}
//           >
//             <Box
//               sx={{
//                 width: "100%",
//                 bgcolor: "background.paper",
//                 borderRadius: "16px 16px 0 0",
//                 border: "1px solid",
//                 borderColor: "grey.200",
//                 maxHeight: "80vh",
//                 display: "flex",
//                 flexDirection: "column",
//                 overflowY: "auto",
//                 p: 2,
//               }}
//             >
//               {/* Header */}
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="subtitle1" fontWeight="medium">
//                   Voice Task Creation
//                 </Typography>
//                 <IconButton onClick={resetAndClose}>
//                   <IoClose size={24} />
//                 </IconButton>
//               </Box>

//               {/* Content */}
//               <Box
//                 sx={{
//                   flex: 1,
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: 2,
//                 }}
//               >
//                 {transcript && (
//                   <Typography variant="body2">
//                     You said: {transcript}
//                   </Typography>
//                 )}
//                 {aiEnhancedText && (
//                   <Typography variant="body2">
//                     Enhanced: {aiEnhancedText}
//                   </Typography>
//                 )}
//                 {awaitingConfirmation && (
//                   <Box
//                     sx={{ display: "flex", flexDirection: "column", gap: 1 }}
//                   >
//                     <TextField
//                       fullWidth
//                       label={`Edit ${step}`}
//                       value={userInput || aiEnhancedText}
//                       onChange={(e) => setUserInput(e.target.value)}
//                       variant="outlined"
//                     />
//                     <Box sx={{ display: "flex", gap: 1 }}>
//                       <Button
//                         variant="contained"
//                         onClick={confirmInput}
//                         startIcon={<FaCheckCircle />}
//                       >
//                         Confirm
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         onClick={handleEnhance}
//                         disabled={isProcessing}
//                       >
//                         Enhance
//                       </Button>
//                       {step === "note" && (
//                         <Button
//                           variant="outlined"
//                           onClick={skipNote}
//                           disabled={isProcessing}
//                         >
//                           Skip
//                         </Button>
//                       )}
//                     </Box>
//                   </Box>
//                 )}
//                 {isProcessing && <CircularProgress size={24} />}
//                 {step === "confirm" && !awaitingConfirmation && (
//                   <Box sx={{ display: "flex", gap: 1 }}>
//                     <Button
//                       variant="contained"
//                       onClick={() => {
//                         setStep("confirm");
//                         confirmInput();
//                       }}
//                       startIcon={<FaCheckCircle />}
//                     >
//                       Save Task
//                     </Button>
//                     <Button variant="outlined" onClick={resetAndClose} start>
//                       Cancel
//                     </Button>
//                   </Box>
//                 )}
//               </Box>
//             </Box>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default VoiceAssistantSheet;


// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   FaMicrophone,
//   FaStopCircle,
//   FaCheckCircle,
// } from "react-icons/fa";
// import { IoClose } from "react-icons/io5";
// import { GEMINI_KEY } from "../../env";
// import {
//   Box,
//   Typography,
//   Button,
//   IconButton,
//   TextField,
//   CircularProgress,
//   FormControlLabel,
//   Switch,
// } from "@mui/material";
// import { DatePicker, TimePicker } from "@mui/x-date-pickers";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
// import moment from "moment";

// // Framer Motion variants for bottom sheet animation
// const sheetVariants = {
//   hidden: { y: "100%", opacity: 0 },
//   visible: {
//     y: 0,
//     opacity: 1,
//     transition: { type: "spring", stiffness: 300, damping: 30 },
//   },
//   exit: { y: "100%", opacity: 0, transition: { duration: 0.3 } },
// };

// const VoiceAssistantSheet = ({ onSubmit, userId }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [step, setStep] = useState("title"); // Steps: title, description, note, date, time, alert, alertMinutes, confirm
//   const [taskData, setTaskData] = useState({
//     title: "",
//     description: "",
//     note: "",
//     timestamp: new Date().getTime(),
//     alert: false,
//     alertMinutes: 5,
//     status: false,
//     userId,
//   });
//   const [aiEnhancedOptions, setAiEnhancedOptions] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
//   const [date, setDate] = useState(new Date());
//   const [time, setTime] = useState(new Date());
//   const recognitionRef = useRef(null);

//   // Clean text helper
//   const cleanResponseText = (text) =>
//     text
//       .replace(/[*_~#+=|{}[\]()\\<>^$@!%]/g, "")
//       .replace(/\n+/g, " ")
//       .replace(/\s+/g, " ")
//       .trim();

//   // Speak text
//   const speak = async (text) => {
//     if (!text) return;
//     setIsProcessing(true);
//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     const voices = window.speechSynthesis.getVoices();
//     utterance.voice =
//       voices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ||
//       voices.find((v) => v.lang === "en-US");
//     utterance.rate = 1.0;
//     utterance.pitch = 1.0;

//     utterance.onend = () => {
//       setIsProcessing(false);
//       if (isListening) startListening();
//     };

//     utterance.onerror = () => {
//       setIsProcessing(false);
//       if (isListening) startListening();
//     };

//     window.speechSynthesis.speak(utterance);
//   };

//   // Call Gemini API to enhance text
//   const enhanceText = async (inputText, context) => {
//     setIsProcessing(true);
//     try {
//       const prompt = `Enhance the following ${context} for a task. Provide exactly 3 clear, concise, and professional options in a numbered list (e.g., 1. Option one). Return only the numbered list, no extra sentences or words:\n\n${inputText}`;
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [{ role: "user", parts: [{ text: prompt }] }],
//           }),
//         }
//       );
//       const data = await res.json();
//       const enhancedText = cleanResponseText(
//         data?.candidates?.[0]?.content?.parts?.[0]?.text || inputText
//       );
//       // Parse numbered list into array
//       const options = enhancedText
//         .split("\n")
//         .map((line) => line.replace(/^\d+\.\s*/, "").trim())
//         .filter((line) => line);
//       setIsProcessing(false);
//       return options.length > 0 ? options : [inputText];
//     } catch (err) {
//       console.error("Gemini error:", err);
//       setIsProcessing(false);
//       return [inputText];
//     }
//   };

//   // Setup speech recognition
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
//       setUserInput(spoken);
//       if (!awaitingConfirmation) {
//         processInput(spoken);
//       } else {
//         handleConfirmationInput(spoken);
//       }
//     };

//     recognition.onerror = (e) => {
//       console.error("Recognition error:", e.error);
//       setIsListening(false);
//       setIsProcessing(false);
//     };

//     recognition.onend = () => {
//       if (isListening && !isProcessing) {
//         try {
//           recognition.start();
//         } catch {}
//       }
//     };

//     return () => {
//       recognition.stop();
//     };
//   }, [isListening, isProcessing, awaitingConfirmation]);

//   // Start listening
//   const startListening = () => {
//     try {
//       recognitionRef.current.start();
//       setIsListening(true);
//     } catch (e) {
//       console.warn("Recognition start error:", e);
//     }
//   };

//   // Process user input
//   const processInput = async (input) => {
//     setIsListening(false);
//     setTranscript(input);

//     if (step === "note" && input.toLowerCase().includes("skip")) {
//       skipNote();
//       return;
//     }

//     if (step === "alert" && input.toLowerCase().includes("yes")) {
//       setTaskData((prev) => ({ ...prev, alert: true }));
//       setStep("alertMinutes");
//       await speak("How many minutes before the task should the alert be set? Say a number like 5 or 10.");
//       startListening();
//       return;
//     }

//     if (step === "alert" && input.toLowerCase().includes("no")) {
//       setTaskData((prev) => ({ ...prev, alert: false, alertMinutes: 0 }));
//       setStep("confirm");
//       await speak(getTaskSummary());
//       startListening();
//       return;
//     }

//     if (step === "alertMinutes") {
//       const minutes = parseInt(input, 10);
//       if (isNaN(minutes) || minutes < 1) {
//         await speak("Please say a valid number of minutes, like 5 or 10.");
//         startListening();
//         return;
//       }
//       setTaskData((prev) => ({ ...prev, alertMinutes: minutes }));
//       setStep("confirm");
//       await speak(getTaskSummary());
//       startListening();
//       return;
//     }

//     if (["date", "time"].includes(step)) {
//       await handleDateTimeInput(input);
//       return;
//     }

//     const context =
//       step === "title" ? "task title" :
//       step === "description" ? "task description" :
//       "task note";
//     await speak(
//       `You said: ${input}. Would you like me to enhance it or use this ${context}? Say 'enhance', 'use', or 'edit'.`
//     );
//     setAwaitingConfirmation(true);
//   };

//   // Handle date and time input
//   const handleDateTimeInput = async (input) => {
//     if (step === "date") {
//       try {
//         const parsedDate = moment(input, ["MMMM D YYYY", "MM/DD/YYYY", "YYYY-MM-DD"], true);
//         if (parsedDate.isValid()) {
//           setDate(parsedDate.toDate());
//           setStep("time");
//           await speak("Please provide the time for the task, like 3 PM or 15:00.");
//           startListening();
//         } else {
//           await speak("Invalid date. Please say a date like May 15, 2025 or 05/15/2025.");
//           startListening();
//         }
//       } catch {
//         await speak("Invalid date. Please say a date like May 15, 2025 or 05/15/2025.");
//         startListening();
//       }
//     } else if (step === "time") {
//       try {
//         const parsedTime = moment(input, ["h:mm A", "HH:mm"], true);
//         if (parsedTime.isValid()) {
//           setTime(parsedTime.toDate());
//           setTaskData((prev) => ({
//             ...prev,
//             timestamp: new Date(
//               date.getFullYear(),
//               date.getMonth(),
//               date.getDate(),
//               parsedTime.hours(),
//               parsedTime.minutes()
//             ).getTime(),
//           }));
//           setStep("alert");
//           await speak("Would you like to enable an alert for this task? Say 'yes' or 'no'.");
//           startListening();
//         } else {
//           await speak("Invalid time. Please say a time like 3 PM or 15:00.");
//           startListening();
//         }
//       } catch {
//         await speak("Invalid time. Please say a time like 3 PM or 15:00.");
//         startListening();
//       }
//     }
//   };

//   // Handle confirmation input (enhance, use, edit, select)
//   const handleConfirmationInput = async (input) => {
//     setTranscript(input);
//     const lowerInput = input.toLowerCase();

//     if (lowerInput.includes("use")) {
//       setTaskData((prev) => ({ ...prev, [step]: userInput }));
//       setAwaitingConfirmation(false);
//       setTranscript("");
//       setUserInput("");
//       setAiEnhancedOptions([]);
//       moveToNextStep();
//     } else if (lowerInput.includes("enhance")) {
//       const context =
//         step === "title" ? "task title" :
//         step === "description" ? "task description" :
//         "task note";
//       const options = await enhanceText(userInput, context);
//       setAiEnhancedOptions(options);
//       await speak(
//         `Here are the enhanced options: ${options.map((opt, i) => `Option ${i + 1}: ${opt}`).join(", ")}. Say 'select' followed by the number, like 'select 1', or 'edit' to modify manually.`
//       );
//       startListening();
//     } else if (lowerInput.includes("edit")) {
//       await speak(`Please say the new ${step} now.`);
//       setUserInput("");
//       setAiEnhancedOptions([]);
//       setAwaitingConfirmation(false);
//       startListening();
//     } else if (lowerInput.includes("select")) {
//       const match = input.match(/select\s*(\d+)/i);
//       if (match) {
//         const index = parseInt(match[1], 10) - 1;
//         if (index >= 0 && index < aiEnhancedOptions.length) {
//           setTaskData((prev) => ({ ...prev, [step]: aiEnhancedOptions[index] }));
//           setAwaitingConfirmation(false);
//           setTranscript("");
//           setUserInput("");
//           setAiEnhancedOptions([]);
//           moveToNextStep();
//         } else {
//           await speak("Invalid selection. Please say 'select' followed by a valid number, or 'edit'.");
//           startListening();
//         }
//       } else {
//         await speak("Please say 'select' followed by the number, like 'select 1', or 'edit'.");
//         startListening();
//       }
//     } else if (step === "confirm") {
//       if (lowerInput.includes("confirm")) {
//         onSubmit(taskData);
//         resetAndClose();
//       } else if (lowerInput.includes("cancel")) {
//         resetAndClose();
//       } else {
//         await speak("Please say 'confirm' to save or 'cancel' to discard.");
//         startListening();
//       }
//     } else {
//       await speak("Please say 'enhance', 'use', or 'edit'.");
//       startListening();
//     }
//   };

//   // Move to next step
//   const moveToNextStep = async () => {
//     if (step === "title") {
//       setStep("description");
//       await speak("Please provide the task description.");
//       startListening();
//     } else if (step === "description") {
//       setStep("note");
//       await speak(
//         "Please provide any additional notes, or say 'skip' to proceed."
//       );
//       startListening();
//     } else if (step === "note") {
//       setStep("date");
//       await speak("Please provide the date for the task, like May 15, 2025.");
//       startListening();
//     } else if (step === "time") {
//       setStep("alert");
//       await speak("Would you like to enable an alert for this task? Say 'yes' or 'no'.");
//       startListening();
//     } else if (step === "alert") {
//       setStep("alertMinutes");
//       await speak("How many minutes before the task should the alert be set? Say a number like 5 or 10.");
//       startListening();
//     } else if (step === "alertMinutes") {
//       setStep("confirm");
//       await speak(getTaskSummary());
//       startListening();
//     } else if (step === "confirm") {
//       onSubmit(taskData);
//       resetAndClose();
//     }
//   };

//   // Get task summary
//   const getTaskSummary = () => {
//     return `Task summary: Title: ${taskData.title}, Description: ${
//       taskData.description
//     }, Note: ${
//       taskData.note || "None"
//     }, Date: ${moment(date).format("MMMM D, YYYY")}, Time: ${moment(time).format(
//       "h:mm A"
//     )}, Alert: ${
//       taskData.alert ? `${taskData.alertMinutes} minutes before` : "Disabled"
//     }. Confirm to save or cancel to discard.`;
//   };

//   // Skip note
//   const skipNote = async () => {
//     setTaskData((prev) => ({ ...prev, note: "" }));
//     setStep("date");
//     await speak("Please provide the date for the task, like May 15, 2025.");
//     startListening();
//   };

//   // Toggle assistant
//   const toggleAssistant = () => {
//     if (isOpen) {
//       resetAndClose();
//     } else {
//       setIsOpen(true);
//       speak("Please provide the task title.");
//       startListening();
//     }
//   };

//   // Reset and close
//   const resetAndClose = () => {
//     setIsOpen(false);
//     setIsListening(false);
//     setIsProcessing(false);
//     setTranscript("");
//     setStep("title");
//     setTaskData({
//       title: "",
//       description: "",
//       note: "",
//       timestamp: new Date().getTime(),
//       alert: false,
//       alertMinutes: 5,
//       status: false,
//       userId,
//     });
//     setAiEnhancedOptions([]);
//     setUserInput("");
//     setAwaitingConfirmation(false);
//     setDate(new Date());
//     setTime(new Date());
//     window.speechSynthesis.cancel();
//     recognitionRef.current?.abort();
//   };

//   return (
//     <div className="fixed bottom-4 right-4 z-50">
//       <motion.button
//         className={`p-3 rounded-full shadow-lg focus:outline-none ${
//           isOpen ? "bg-red-500" : "bg-blue-600"
//         } text-white`}
//         onClick={toggleAssistant}
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.9 }}
//       >
//         {isOpen ? <FaStopCircle size={24} /> : <FaMicrophone size={24} />}
//       </motion.button>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             variants={sheetVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             style={{
//               width: "100%",
//               maxWidth: "600px",
//               position: "fixed",
//               bottom: 0,
//               right: 0,
//               left: 0,
//               margin: "auto",
//             }}
//           >
//             <Box
//               sx={{
//                 width: "100%",
//                 bgcolor: "background.paper",
//                 borderRadius: "16px 16px 0 0",
//                 border: "1px solid",
//                 borderColor: "grey.200",
//                 maxHeight: "80vh",
//                 display: "flex",
//                 flexDirection: "column",
//                 overflowY: "auto",
//                 p: 2,
//               }}
//             >
//               {/* Header */}
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="subtitle1" fontWeight="medium">
//                   Voice Task Creation
//                 </Typography>
//                 <IconButton onClick={resetAndClose}>
//                   <IoClose size={24} />
//                 </IconButton>
//               </Box>

//               {/* Content */}
//               <LocalizationProvider dateAdapter={AdapterMoment}>
//                 <Box
//                   sx={{
//                     flex: 1,
//                     display: "flex",
//                     flexDirection: "column",
//                     gap: 2,
//                   }}
//                 >
//                   {transcript && (
//                     <Typography variant="body2">
//                       You said: {transcript}
//                     </Typography>
//                   )}
//                   {aiEnhancedOptions.length > 0 && (
//                     <Box>
//                       <Typography variant="body2">Enhanced Options:</Typography>
//                       {aiEnhancedOptions.map((option, index) => (
//                         <Typography key={index} variant="body2">
//                           {index + 1}. {option}
//                         </Typography>
//                       ))}
//                     </Box>
//                   )}
//                   {awaitingConfirmation && (
//                     <Box
//                       sx={{ display: "flex", flexDirection: "column", gap: 1 }}
//                     >
//                       <TextField
//                         fullWidth
//                         label={`Edit ${step}`}
//                         value={userInput}
//                         onChange={(e) => setUserInput(e.target.value)}
//                         variant="outlined"
//                       />
//                       <Box sx={{ display: "flex", gap: 1 }}>
//                         <Button
//                           variant="contained"
//                           onClick={() => handleConfirmationInput("use")}
//                           startIcon={<FaCheckCircle />}
//                         >
//                           Use
//                         </Button>
//                         <Button
//                           variant="outlined"
//                           onClick={() => handleConfirmationInput("enhance")}
//                           disabled={isProcessing}
//                         >
//                           Enhance
//                         </Button>
//                         <Button
//                           variant="outlined"
//                           onClick={() => handleConfirmationInput("edit")}
//                           disabled={isProcessing}
//                         >
//                           Edit
//                         </Button>
//                         {step === "note" && (
//                           <Button
//                             variant="outlined"
//                             onClick={skipNote}
//                             disabled={isProcessing}
//                           >
//                             Skip
//                           </Button>
//                         )}
//                       </Box>
//                     </Box>
//                   )}
//                   {["date", "time"].includes(step) && (
//                     <Box sx={{ display: "flex", gap: 2 }}>
//                       <DatePicker
//                         label="Date"
//                         value={moment(date)}
//                         onChange={(newDate) => setDate(newDate.toDate())}
//                         sx={{ flex: 1 }}
//                         disabled
//                       />
//                       {step === "time" && (
//                         <TimePicker
//                           label="Time"
//                           value={moment(time)}
//                           onChange={(newTime) => setTime(newTime.toDate())}
//                           sx={{ flex: 1 }}
//                           minutesStep={15}
//                           disabled
//                         />
//                       )}
//                     </Box>
//                   )}
//                   {step === "alert" && (
//                     <FormControlLabel
//                       control={<Switch checked={taskData.alert} disabled />}
//                       label="Enable Alert"
//                     />
//                   )}
//                   {step === "alertMinutes" && taskData.alert && (
//                     <TextField
//                       fullWidth
//                       label="Alert Minutes Before"
//                       value={taskData.alertMinutes}
//                       variant="outlined"
//                       disabled
//                     />
//                   )}
//                   {isProcessing && <CircularProgress size={24} />}
//                   {step === "confirm" && !awaitingConfirmation && (
//                     <Box sx={{ display: "flex", gap: 1 }}>
//                       <Button
//                         variant="contained"
//                         onClick={() => handleConfirmationInput("confirm")}
//                         startIcon={<FaCheckCircle />}
//                       >
//                         Save Task
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         onClick={() => handleConfirmationInput("cancel")}
//                       >
//                         Cancel
//                       </Button>
//                     </Box>
//                   )}
//                 </Box>
//               </LocalizationProvider>
//             </Box>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default VoiceAssistantSheet;



// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { FaMicrophone, FaStopCircle, FaCheckCircle } from "react-icons/fa";
// import { IoClose } from "react-icons/io5";
// import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
// import { GEMINI_KEY } from "../../env";
// import { Box, Typography, Button, IconButton, TextField, CircularProgress } from "@mui/material";
// import moment from "moment";

// // Framer Motion variants for bottom sheet animation
// const sheetVariants = {
//   hidden: { y: "100%", opacity: 0 },
//   visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
//   exit: { y: "100%", opacity: 0, transition: { duration: 0.3 } },
// };

// const VoiceAssistantSheet = ({ onSubmit, userId }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [step, setStep] = useState("title"); // Steps: title, description, note, date, time, alert, alertMinutes, confirm
//   const [taskData, setTaskData] = useState({
//     title: "",
//     description: "",
//     note: "",
//     timestamp: new Date().getTime(),
//     alert: false,
//     alertMinutes: 5,
//     status: false,
//     notified: false,
//     userId,
//   });
//   const [aiEnhancedOptions, setAiEnhancedOptions] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
//   const [error, setError] = useState("");
//   const shouldResumeListening = useRef(false);

//   // Speech recognition hook
//   const {
//     transcript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition,
//     isMicrophoneAvailable,
//   } = useSpeechRecognition({
//     commands: [],
//     clearTranscriptOnListen: false,
//   });

//   // Keyword actions
//   const keywordActions = {
//     confirm: ["confirm", "yes", "okay", "sure", "yep", "accept", "agree", "save"],
//     change: ["change", "edit", "no", "redo", "retry", "modify", "revise"],
//     enhance: ["enhance", "improve", "better", "refine", "polish"],
//     original: ["original", "use original", "keep", "my version"],
//     select: ["select", "choose", "pick"],
//     skip: ["skip", "none", "nothing", "pass"],
//     cancel: ["cancel", "stop", "discard", "quit", "exit"],
//     alertOn: ["yes", "enable", "on", "alert on"],
//     alertOff: ["no", "disable", "off", "alert off"],
//   };

//   // Clean text helper
//   const cleanResponseText = (text) =>
//     text
//       .replace(/[*_~#+=|{}[\]()\\<>^$@!%]/g, "")
//       .replace(/\n+/g, " ")
//       .replace(/\s+/g, " ")
//       .trim();

//   // Text-to-speech function
//   const speak = (text, resumeListening = true) => {
//     if (!text) return;
//     setIsProcessing(true);
//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     const voices = window.speechSynthesis.getVoices();
//     utterance.voice =
//       voices.find((v) => v.lang === "en-US" && /female|samantha|victoria/i.test(v.name)) ||
//       voices.find((v) => v.lang === "en-US");

//     utterance.rate = 1.0;
//     utterance.pitch = 1.2;

//     utterance.onend = () => {
//       setIsProcessing(false);
//       if (resumeListening && shouldResumeListening.current) {
//         SpeechRecognition.startListening({ continuous: true, language: "en-US" });
//       }
//     };

//     utterance.onerror = () => {
//       setIsProcessing(false);
//       if (resumeListening && shouldResumeListening.current) {
//         SpeechRecognition.startListening({ continuous: true, language: "en-US" });
//       }
//     };

//     window.speechSynthesis.speak(utterance);
//   };

//   // Call Gemini API to enhance text
//   const enhanceText = async (inputText, context) => {
//     setIsProcessing(true);
//     try {
//       const prompt = `Enhance the following ${context} for a task. Provide exactly 3 clear, concise, and professional options in a numbered list (1., 2., 3.). Return only the numbered list with the enhanced sentences, no additional text or explanation.\n\n${inputText}`;
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [{ role: "user", parts: [{ text: prompt }] }],
//           }),
//         }
//       );
//       const data = await res.json();
//       const enhancedText = cleanResponseText(
//         data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
//       );
//       const options = enhancedText
//         .split("\n")
//         .map((line) => line.replace(/^\d+\.\s*/, "").trim())
//         .filter((line) => line);
//       setIsProcessing(false);
//       return options.length === 3 ? options : [inputText];
//     } catch (err) {
//       console.error("Gemini error:", err);
//       setIsProcessing(false);
//       return [inputText];
//     }
//   };

//   // Check for browser support
//   useEffect(() => {
//     if (!browserSupportsSpeechRecognition) {
//       setError("Speech recognition is not supported in this browser.");
//       return;
//     }
//     if (!isMicrophoneAvailable) {
//       setError("Microphone access is required for speech recognition.");
//       return;
//     }
//   }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

//   // Handle transcript changes
//   useEffect(() => {
//     if (transcript && !isProcessing) {
//       const spoken = transcript.trim();
//       if (spoken) {
//         setUserInput(spoken);
//         if (awaitingConfirmation) {
//           handleConfirmation(spoken.toLowerCase());
//         } else {
//           processInput(spoken);
//         }
//         resetTranscript();
//       }
//     }
//   }, [transcript, isProcessing, awaitingConfirmation]);

//   // Start listening
//   const startListening = () => {
//     if (isProcessing || listening || !browserSupportsSpeechRecognition || !isMicrophoneAvailable) return;
//     shouldResumeListening.current = true;
//     SpeechRecognition.startListening({ continuous: true, language: "en-US" });
//   };

//   // Stop listening
//   const stopListening = () => {
//     shouldResumeListening.current = false;
//     SpeechRecognition.stopListening();
//   };

//   // Check for keywords and return action
//   const checkForKeywords = (input) => {
//     const lowerInput = input.toLowerCase();
//     for (const [action, keywords] of Object.entries(keywordActions)) {
//       for (const keyword of keywords) {
//         if (lowerInput === keyword || lowerInput.includes(` ${keyword} `)) {
//           return { action, keyword };
//         }
//       }
//     }
//     return null;
//   };

//   // Process user input based on step
//   const processInput = async (input) => {
//     const keywordMatch = checkForKeywords(input);
//     if (keywordMatch) {
//       const { action, keyword } = keywordMatch;
//       switch (action) {
//         case "confirm":
//           if (step === "confirm") {
//             onSubmit(taskData);
//             resetAndClose();
//             startListening();
//           } else {
//             confirmInput(userInput || aiEnhancedOptions[0] || input);
//             startListening();
//           }
//           return;
//         case "change":
//           await speak(`Please provide the ${step} again.`);
//           setUserInput("");
//           setAiEnhancedOptions([]);
//           setAwaitingConfirmation(false);
//           startListening();
//           return;
//         case "enhance":
//           await handleEnhance();
//           return;
//         case "original":
//           confirmInput(userInput);
//           return;
//         case "select":
//           const numMatch = input.match(/\d+/);
//           if (numMatch) {
//             const num = parseInt(numMatch[0]) - 1;
//             if (num >= 0 && num < aiEnhancedOptions.length) {
//               confirmInput(aiEnhancedOptions[num]);
//               return;
//             }
//           }
//           await speak("Invalid selection. Please say 'select one', 'select two', or 'select three'.");
//           startListening();
//           return;
//         case "skip":
//           if (step === "note") {
//             skipNote();
//           } else {
//             await speak("Skip is only available for notes. Please provide the current input.");
//             startListening();
//           }
//           return;
//         case "cancel":
//           resetAndClose();
//           return;
//         default:
//           break;
//       }
//     }

//     if (step === "date") {
//       const parsedDate = moment(input, ["MM/DD/YYYY", "MMMM D, YYYY"], true);
//       const now = moment();
//       if (parsedDate.isValid()) {
//         if (parsedDate.isAfter(now)) {
//           setTaskData((prev) => ({
//             ...prev,
//             timestamp: new Date(prev.timestamp).setFullYear(
//               parsedDate.year(),
//               parsedDate.month(),
//               parsedDate.date()
//             ),
//           }));
//           await speak(`Date set to ${parsedDate.format("MMMM D, YYYY")}. Would you like to confirm, change, or enhance it?`);
//           setAwaitingConfirmation(true);
//           startListening();
//         } else {
//           setError("Please select a future date, like 'January 1, 2026'.");
//           await speak("Please select a future date, like 'January 1, 2026'.");
//           startListening();
//         }
//       } else {
//         setError("Invalid date format. Please say a date like 'January 1, 2026'.");
//         await speak("Invalid date format. Please say a date like 'January 1, 2026'.");
//         startListening();
//       }
//     } else if (step === "time") {
//       const parsedTime = moment(input, ["h:mm A", "HH:mm"], true);
//       const now = moment();
//       if (parsedTime.isValid()) {
//         const combinedDateTime = moment(taskData.timestamp).set({
//           hour: parsedTime.hours(),
//           minute: parsedTime.minutes(),
//         });
//         if (combinedDateTime.isAfter(now)) {
//           setTaskData((prev) => ({
//             ...prev,
//             timestamp: combinedDateTime.valueOf(),
//           }));
//           await speak(`Time set to ${parsedTime.format("h:mm A")}. Would you like to confirm, change, or enhance it?`);
//           setAwaitingConfirmation(true);
//           startListening();
//         } else {
//           setError("Please select a future time.");
//           await speak("Please select a future time.");
//           startListening();
//         }
//       } else {
//         setError("Invalid time format. Please say a time like '2:30 PM'.");
//         await speak("Invalid time format. Please say a time like '2:30 PM'.");
//         startListening();
//       }
//     } else if (step === "alert") {
//       const lowerInput = input.toLowerCase();
//       if (keywordActions.alertOn.includes(lowerInput)) {
//         setTaskData((prev) => ({ ...prev, alert: true }));
//         await speak("Alert enabled. How many minutes before the task should the alert be set? Say a number like '5' or '10'.");
//         setStep("alertMinutes");
//         startListening();
//       } else if (keywordActions.alertOff.includes(lowerInput)) {
//         setTaskData((prev) => ({ ...prev, alert: false, alertMinutes: 0 }));
//         await speak("Alert disabled. Would you like to confirm or change it?");
//         setAwaitingConfirmation(true);
//         startListening();
//       } else {
//         setError("Please say 'yes' or 'no' to enable or disable the alert.");
//         await speak("Please say 'yes' or 'no' to enable or disable the alert.");
//         startListening();
//       }
//     } else if (step === "alertMinutes") {
//       const minutes = parseInt(input, 10);
//       if (!isNaN(minutes) && minutes > 0) {
//         setTaskData((prev) => ({ ...prev, alertMinutes: minutes }));
//         await speak(`Alert set to ${minutes} minutes before. Would you like to confirm or change it?`);
//         setAwaitingConfirmation(true);
//         startListening();
//       } else {
//         setError("Please say a valid number of minutes, like '5' or '10'.");
//         await speak("Please say a valid number of minutes, like '5' or '10'.");
//         startListening();
//       }
//     } else {
//       const context =
//         step === "title" ? "task title" : step === "description" ? "task description" : "task note";
//       setUserInput(input);
//       await speak(`You said: ${input}. Would you like to confirm, change, or enhance this ${context}?`);
//       setAwaitingConfirmation(true);
//       startListening();
//     }
//   };

//   // Handle enhancement
//   const handleEnhance = async () => {
//     const context =
//       step === "title" ? "task title" : step === "description" ? "task description" : "task note";
//     const options = await enhanceText(userInput, context);
//     setAiEnhancedOptions(options);
//     const optionsText = options
//       .map((opt, idx) => `${idx + 1}. ${opt}`)
//       .join(", ");
//     await speak(
//       `Here are the enhanced options: ${optionsText}. Say 'select one', 'select two', 'select three', or 'use original' to proceed.`
//     );
//     setAwaitingConfirmation(true);
//     startListening();
//   };

//   // Handle confirmation or selection
//   const handleConfirmation = async (input) => {
//     const keywordMatch = checkForKeywords(input);
//     if (keywordMatch) {
//       const { action, keyword } = keywordMatch;
//       switch (action) {
//         case "confirm":
//           if (step === "confirm") {
//             onSubmit(taskData);
//             resetAndClose();
//           } else {
//             confirmInput(userInput || aiEnhancedOptions[0] || "");
//           }
//           return;
//         case "change":
//           await speak(`Please provide the ${step} again.`);
//           setUserInput("");
//           setAiEnhancedOptions([]);
//           setAwaitingConfirmation(false);
//           startListening();
//           return;
//         case "enhance":
//           await handleEnhance();
//           return;
//         case "original":
//           confirmInput(userInput);
//           return;
//         case "select":
//           const numMatch = input.match(/\d+/);
//           if (numMatch) {
//             const num = parseInt(numMatch[0]) - 1;
//             if (num >= 0 && num < aiEnhancedOptions.length) {
//               confirmInput(aiEnhancedOptions[num]);
//               return;
//             }
//           }
//           await speak("Invalid selection. Please say 'select one', 'select two', or 'select three'.");
//           startListening();
//           return;
//         case "skip":
//           if (step === "note") {
//             skipNote();
//           } else {
//             await speak("Skip is only available for notes. Please provide the current input.");
//             startListening();
//           }
//           return;
//         case "cancel":
//           resetAndClose();
//           return;
//         default:
//           break;
//       }
//     }

//     await speak(
//       step === "confirm"
//         ? "Please say 'confirm' to save or 'cancel' to discard."
//         : "Please say 'confirm', 'change', 'enhance', 'select [number]', or 'use original'."
//     );
//     startListening();
//   };

//   // Confirm and move to next step
//   const confirmInput = (input) => {
//     setTaskData((prev) => ({ ...prev, [step]: input }));
//     setAwaitingConfirmation(false);
//     setUserInput("");
//     setAiEnhancedOptions([]);
//     moveToNextStep();
//   };

//   // Move to next step
//   const moveToNextStep = async () => {
//     if (step === "title") {
//       setStep("description");
//       await speak("Please provide the task description.");
//       startListening();
//     } else if (step === "description") {
//       setStep("note");
//       await speak("Please provide any additional notes, or say 'skip' to proceed.");
//       startListening();
//     } else if (step === "note") {
//       setStep("date");
//       await speak("Please provide a future task date, like 'January 1, 2026'.");
//       startListening();
//     } else if (step === "date") {
//       setStep("time");
//       await speak("Please provide a future task time, like '2:30 PM'.");
//       startListening();
//     } else if (step === "time") {
//       setStep("alert");
//       await speak("Would you like to enable an alert for this task? Say 'yes' or 'no'.");
//       startListening();
//     } else if (step === "alert") {
//       setStep("confirm");
//       await summarizeTask();
//     } else if (step === "alertMinutes") {
//       setStep("confirm");
//       await summarizeTask();
//     } else if (step === "confirm") {
//       onSubmit(taskData);
//       resetAndClose();
//     }
//   };

//   // Summarize task
//   const summarizeTask = async () => {
//     const dateTime = moment(taskData.timestamp).format("MMMM D, YYYY [at] h:mm A");
//     const alertText = taskData.alert
//       ? `Alert set for ${taskData.alertMinutes} minutes before.`
//       : "No alert set.";
//     await speak(
//       `Task summary: Title: ${taskData.title}, Description: ${
//         taskData.description
//       }, Note: ${
//         taskData.note || "None"
//       }, Date and Time: ${dateTime}, ${alertText}. Say 'confirm' to save or 'cancel' to discard.`
//     );
//     startListening();
//   };

//   // Toggle assistant
//   const toggleAssistant = () => {
//     if (isOpen) {
//       resetAndClose();
//     } else {
//       setIsOpen(true);
//       speak("Please provide the task title.");
//       startListening();
//     }
//   };

//   // Reset and close
//   const resetAndClose = () => {
//     setIsOpen(false);
//     setIsProcessing(false);
//     setStep("title");
//     setTaskData({
//       title: "",
//       description: "",
//       note: "",
//       timestamp: new Date().getTime(),
//       alert: false,
//       alertMinutes: 5,
//       status: false,
//       notified: false,
//       userId,
//     });
//     setAiEnhancedOptions([]);
//     setUserInput("");
//     setAwaitingConfirmation(false);
//     setError("");
//     window.speechSynthesis.cancel();
//     stopListening();
//     resetTranscript();
//   };

//   // Skip note
//   const skipNote = () => {
//     setTaskData((prev) => ({ ...prev, note: "" }));
//     setStep("date");
//     setAwaitingConfirmation(false);
//     setUserInput("");
//     setAiEnhancedOptions([]);
//     speak("Please provide a future task date, like 'January 1, 2026'.");
//     startListening();
//   };

//   return (
//     <div className="fixed bottom-4 right-4 z-50">
//       <motion.button
//         className={`p-3 rounded-full shadow-lg focus:outline-none ${
//           isOpen ? "bg-red-500" : "bg-blue-600"
//         } text-white`}
//         onClick={toggleAssistant}
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.9 }}
//       >
//         {isOpen ? <FaStopCircle size={24} /> : <FaMicrophone size={24} />}
//       </motion.button>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             variants={sheetVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             style={{
//               width: "100%",
//               maxWidth: "600px",
//               position: "fixed",
//               bottom: 0,
//               right: 0,
//               left: 0,
//               margin: "auto",
//             }}
//           >
//             <Box
//               sx={{
//                 width: "100%",
//                 bgcolor: "background.paper",
//                 borderRadius: "16px 16px 0 0",
//                 border: "1px solid",
//                 borderColor: "grey.200",
//                 maxHeight: "80vh",
//                 display: "flex",
//                 flexDirection: "column",
//                 overflowY: "auto",
//                 p: 2,
//               }}
//             >
//               {/* Header */}
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="subtitle1" fontWeight="medium">
//                   Voice Task Creation
//                 </Typography>
//                 <IconButton onClick={resetAndClose}>
//                   <IoClose size={24} />
//                 </IconButton>
//               </Box>

//               {/* Content */}
//               <Box
//                 sx={{
//                   flex: 1,
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: 2,
//                 }}
//               >
//                 {transcript && (
//                   <Typography variant="body2">
//                     You said: {transcript}
//                   </Typography>
//                 )}
//                 {aiEnhancedOptions.length > 0 && (
//                   <Box>
//                     <Typography variant="body2">Enhanced Options:</Typography>
//                     {aiEnhancedOptions.map((opt, idx) => (
//                       <Typography key={idx} variant="body2">
//                         {idx + 1}. {opt}
//                       </Typography>
//                     ))}
//                   </Box>
//                 )}
//                 {error && (
//                   <Typography variant="body2" color="error">
//                     {error}
//                   </Typography>
//                 )}
//                 {awaitingConfirmation && (
//                   <Box
//                     sx={{ display: "flex", flexDirection: "column", gap: 1 }}
//                   >
//                     <TextField
//                       fullWidth
//                       label={`Edit ${step}`}
//                       value={userInput || aiEnhancedOptions[0] || ""}
//                       onChange={(e) => setUserInput(e.target.value)}
//                       variant="outlined"
//                     />
//                     <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//                       <Button
//                         variant="contained"
//                         onClick={() => handleConfirmation("confirm")}
//                         startIcon={<FaCheckCircle />}
//                       >
//                         Confirm
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         onClick={() => handleConfirmation("change")}
//                       >
//                         Change
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         onClick={() => handleConfirmation("enhance")}
//                         disabled={isProcessing}
//                       >
//                         Enhance
//                       </Button>
//                       {aiEnhancedOptions.length > 0 && (
//                         <>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("select 1")}
//                           >
//                             Select 1
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("select 2")}
//                           >
//                             Select 2
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("select 3")}
//                           >
//                             Select 3
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("use original")}
//                           >
//                             Use Original
//                           </Button>
//                         </>
//                       )}
//                       {step === "note" && (
//                         <Button
//                           variant="outlined"
//                           onClick={skipNote}
//                           disabled={isProcessing}
//                         >
//                           Skip
//                         </Button>
//                       )}
//                       <Button
//                         variant="outlined"
//                         onClick={resetAndClose}
//                         disabled={isProcessing}
//                       >
//                         Cancel
//                       </Button>
//                     </Box>
//                   </Box>
//                 )}
//                 {isProcessing && <CircularProgress size={24} />}
//                 {step === "confirm" && !awaitingConfirmation && (
//                   <Box sx={{ display: "flex", gap: 1 }}>
//                     <Button
//                       variant="contained"
//                       onClick={() => handleConfirmation("confirm")}
//                       startIcon={<FaCheckCircle />}
//                     >
//                       Save Task
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       onClick={resetAndClose}
//                     >
//                       Cancel
//                     </Button>
//                   </Box>
//                 )}
//               </Box>
//             </Box>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default VoiceAssistantSheet;









//below is the final working code with few issues


// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { FaMicrophone, FaStopCircle, FaCheckCircle } from "react-icons/fa";
// import { IoClose } from "react-icons/io5";
// import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
// import { GEMINI_KEY } from "../../env";
// import { Box, Typography, Button, IconButton, TextField, CircularProgress } from "@mui/material";
// import moment from "moment";
// import {sheetVariants,keywordActions,cleanResponseText} from '../utils/index';



// const VoiceAssistantSheet = ({ onSubmit, userId }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [step, setStep] = useState("title"); // Steps: title, description, note, date, time, alert, alertMinutes, confirm
//   const [taskData, setTaskData] = useState({
//     title: "",
//     description: "",
//     note: "",
//     timestamp: new Date().getTime(),
//     alert: false,
//     alertMinutes: 5,
//     status: false,
//     notified: false,
//     userId,
//   });
//   const [aiEnhancedOptions, setAiEnhancedOptions] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
//   const [error, setError] = useState("");
//   const shouldResumeListening = useRef(false);
//   const transcriptTimeoutRef = useRef(null);

//   // Speech recognition hook
//   const {
//     transcript,
//     interimTranscript,
//     finalTranscript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition,
//     isMicrophoneAvailable,
//   } = useSpeechRecognition({
//     commands: [],
//     clearTranscriptOnListen: false,
//   });

 


//   // Text-to-speech function
//   const speak = (text, resumeListening = true) => {
//     if (!text) return;
//     setIsProcessing(true);
//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     const voices = window.speechSynthesis.getVoices();
//     utterance.voice =
//     voices.find((v) => v.lang === "en-US" && /male|david|michael/i.test(v.name)) ||
//     voices.find((v) => v.lang === "en-US");

//     utterance.rate = 1.0;
//     utterance.pitch = 1.2;

//     utterance.onend = () => {
//       setIsProcessing(false);
//       if (resumeListening && shouldResumeListening.current) {
//         SpeechRecognition.startListening({ continuous: true, language: "en-US", interimResults: true });
//       }
//     };

//     utterance.onerror = () => {
//       setIsProcessing(false);
//       if (resumeListening && shouldResumeListening.current) {
//         SpeechRecognition.startListening({ continuous: true, language: "en-US", interimResults: true });
//       }
//     };

//     window.speechSynthesis.speak(utterance);
//   };

//   // Call Gemini API to enhance text
//   const enhanceText = async (inputText, context) => {
//     setIsProcessing(true);
//     try {
//       const prompt = `Enhance the following ${context} for a task. Provide exactly 3 clear, concise, and professional options in a numbered list (1., 2., 3.). Return only the numbered list with the enhanced sentences, no additional text or explanation.\n\n${inputText}`;
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [{ role: "user", parts: [{ text: prompt }] }],
//           }),
//         }
//       );
//       const data = await res.json();
//       const enhancedText = cleanResponseText(
//         data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
//       );
//       const options = enhancedText
//         .split("\n")
//         .map((line) => line.replace(/^\d+\.\s*/, "").trim())
//         .filter((line) => line);
//       setIsProcessing(false);
//       return options.length === 3 ? options : [inputText];
//     } catch (err) {
//       console.error("Gemini error:", err);
//       setIsProcessing(false);
//       return [inputText];
//     }
//   };

//   // Check for browser support
//   useEffect(() => {
//     if (!browserSupportsSpeechRecognition) {
//       setError("Speech recognition is not supported in this browser.");
//       return;
//     }
//     if (!isMicrophoneAvailable) {
//       setError("Microphone access is required for speech recognition.");
//       return;
//     }
//   }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

//   // Handle transcript changes with debounce
//   useEffect(() => {
//     if (finalTranscript && !isProcessing) {
//       // Clear any existing timeout
//       if (transcriptTimeoutRef.current) {
//         clearTimeout(transcriptTimeoutRef.current);
//       }

//       // Set a new timeout to process the input after a pause
//       transcriptTimeoutRef.current = setTimeout(() => {
//         const spoken = finalTranscript.trim();
//         if (spoken) {
//           setUserInput(spoken);
//           if (awaitingConfirmation) {
//             handleConfirmation(spoken.toLowerCase());
//           } else {
//             processInput(spoken);
//           }
//           resetTranscript();
//         }
//       }, 3000); // Wait 1.5 seconds after speech stops
//     }

//     // Cleanup timeout on unmount or new transcript
//     return () => {
//       if (transcriptTimeoutRef.current) {
//         clearTimeout(transcriptTimeoutRef.current);
//       }
//     };
//   }, [finalTranscript, isProcessing, awaitingConfirmation]);

//   // Start listening
//   const startListening = () => {
//     if (isProcessing || listening || !browserSupportsSpeechRecognition || !isMicrophoneAvailable) return;
//     shouldResumeListening.current = true;
//     SpeechRecognition.startListening({ continuous: true, language: "en-US", interimResults: true });
//   };

//   // Stop listening
//   const stopListening = () => {
//     shouldResumeListening.current = false;
//     SpeechRecognition.stopListening();
//     if (transcriptTimeoutRef.current) {
//       clearTimeout(transcriptTimeoutRef.current);
//     }
//   };

//   // Check for keywords and return action
//   const checkForKeywords = (input) => {
//     const lowerInput = input.toLowerCase();
//     for (const [action, keywords] of Object.entries(keywordActions)) {
//       for (const keyword of keywords) {
//         if (lowerInput === keyword || lowerInput.includes(` ${keyword} `)) {
//           return { action, keyword };
//         }
//       }
//     }
//     return null;
//   };

//   // Process user input based on step
//   const processInput = async (input) => {
//     console.log("input is", input )
//     const keywordMatch = checkForKeywords(input);
//     if (keywordMatch) {
//       const { action, keyword } = keywordMatch;
//       switch (action) {
//         case "confirm":
//           if (step === "confirm") {
//             onSubmit(taskData);
//             resetAndClose();
//             startListening();
//           } else {
//             confirmInput(userInput || aiEnhancedOptions[0] || input);
//             startListening();
//           }
//           return;
//         case "change":
//           await speak(`Please provide the ${step} again.`);
//           setUserInput("");
//           setAiEnhancedOptions([]);
//           setAwaitingConfirmation(false);
//           startListening();
//           return;
//         case "enhance":
//           await handleEnhance();
//           return;
//         case "original":
//           confirmInput(userInput);
//           return;
//         case "select":
//           const numMatch = input.match(/\d+/);
//           if (numMatch) {
//             const num = parseInt(numMatch[0]) - 1;
//             if (num >= 0 && num < aiEnhancedOptions.length) {
//               confirmInput(aiEnhancedOptions[num]);
//               return;
//             }
//           }
//           await speak("Invalid selection. Please say 'select one', 'select two', or 'select three'.");
//           startListening();
//           return;
//         case "skip":
//           if (step === "note") {
//             skipNote();
//           } else {
//             await speak("Skip is only available for notes. Please provide the current input.");
//             startListening();
//           }
//           return;
//         case "cancel":
//           resetAndClose();
//           return;
//         default:
//           break;
//       }
//     }
// if (step === "date") {
//   // Normalize input by replacing multiple spaces with a single space and trimming
//   const normalizedInput = input.replace(/\s+/g, " ").trim();

//   // Define a wide range of date formats to parse
//   const dateFormats = [
//     "MMMM D YYYY", // May 1 2025
//     "MMMM D, YYYY", // May 1, 2025
//     "MM/DD/YYYY", // 05/01/2025
//     "MM-DD-YYYY", // 05-01-2025
//     "YYYY-MM-DD", // 2025-05-01
//     "MMM D YYYY", // May 1 2025
//     "MMM D, YYYY", // May 1, 2025
//     "D MMMM YYYY", // 1 May 2025
//     "D MMM YYYY", // 1 May 2025
//     "MMMM YYYY", // May 2025 (assume day 1)
//     "MMM YYYY", // May 2025 (assume day 1)
//     "YYYY MMMM", // 2025 May (assume day 1)
//     "YYYY MMM", // 2025 May (assume day 1)
//   ];

//   // Parse the date with multiple formats, non-strict mode
//   let parsedDate = moment(normalizedInput, dateFormats, false);

//   // If parsing fails, try a more lenient parse
//   if (!parsedDate.isValid()) {
//     parsedDate = moment(normalizedInput);
//   }

//   const now = moment();

//   if (parsedDate.isValid()) {
//     // If only month and year are provided, default to the first day of the month
//     if (!normalizedInput.match(/\d{1,2}/)) {
//       parsedDate = parsedDate.startOf("month");
//     }

//     // Ensure the date is in the future
//     if (parsedDate.isAfter(now)) {
//       setTaskData((prev) => ({
//         ...prev,
//         timestamp: new Date(prev.timestamp).setFullYear(
//           parsedDate.year(),
//           parsedDate.month(),
//           parsedDate.date()
//         ),
//       }));
//       await speak(`Date set to ${parsedDate.format("MMMM D, YYYY")}. Would you like to confirm, change, or enhance it?`);
//       setAwaitingConfirmation(true);
//       startListening();
//     } else {
//       setError("Please select a future date, like 'May 1, 2025'.");
//       await speak("Please select a future date, like 'May 1, 2025'.");
//       startListening();
//     }
//   } else {
//     setError("Invalid date format. Please say a date like 'May 1, 2025' or 'January 2026'.");
//     await speak("Invalid date format. Please say a date like 'May 1, 2025' or 'January 2026'.");
//     startListening();
//   }
// } else if (step === "time") {
//       const parsedTime = moment(input, ["h:mm A", "HH:mm"], true);
//       const now = moment();
//       if (parsedTime.isValid()) {
//         const combinedDateTime = moment(taskData.timestamp).set({
//           hour: parsedTime.hours(),
//           minute: parsedTime.minutes(),
//         });
//         if (combinedDateTime.isAfter(now)) {
//           setTaskData((prev) => ({
//             ...prev,
//             timestamp: combinedDateTime.valueOf(),
//           }));
//           await speak(`Time set to ${parsedTime.format("h:mm A")}. Would you like to confirm, change, or enhance it?`);
//           setAwaitingConfirmation(true);
//           startListening();
//         } else {
//           setError("Please select a future time.");
//           await speak("Please select a future time.");
//           startListening();
//         }
//       } else {
//         setError("Invalid time format. Please say a time like '2:30 PM'.");
//         await speak("Invalid time format. Please say a time like '2:30 PM'.");
//         startListening();
//       }
//     } else if (step === "alert") {
//       const lowerInput = input.toLowerCase();
//       if (keywordActions.alertOn.includes(lowerInput)) {
//         setTaskData((prev) => ({ ...prev, alert: true }));
//         await speak("Alert enabled. How many minutes before the task should the alert be set? Say a number like '5' or '10'.");
//         setStep("alertMinutes");
//         startListening();
//       } else if (keywordActions.alertOff.includes(lowerInput)) {
//         setTaskData((prev) => ({ ...prev, alert: false, alertMinutes: 0 }));
//         await speak("Alert disabled. Would you like to confirm or change it?");
//         setAwaitingConfirmation(true);
//         startListening();
//       } else {
//         setError("Please say 'yes' or 'no' to enable or disable the alert.");
//         await speak("Please say 'yes' or 'no' to enable or disable the alert.");
//         startListening();
//       }
//     } else if (step === "alertMinutes") {
//       const minutes = parseInt(input, 10);
//       if (!isNaN(minutes) && minutes > 0) {
//         setTaskData((prev) => ({ ...prev, alertMinutes: minutes }));
//         await speak(`Alert set to ${minutes} minutes before. Would you like to confirm or change it?`);
//         setAwaitingConfirmation(true);
//         startListening();
//       } else {
//         setError("Please say a valid number of minutes, like '5' or '10'.");
//         await speak("Please say a valid number of minutes, like '5' or '10'.");
//         startListening();
//       }
//     } else {
//       const context =
//         step === "title" ? "task title" : step === "description" ? "task description" : "task note";
//       setUserInput(input);
//       await speak(`You said: ${input}. Would you like to confirm, change, or enhance this ${context}?`);
//       setAwaitingConfirmation(true);
//       startListening();
//     }
//   };

//   // Handle enhancement
//   const handleEnhance = async () => {
//     const context =
//       step === "title" ? "task title" : step === "description" ? "task description" : "task note";
//     const options = await enhanceText(userInput, context);
//     setAiEnhancedOptions(options);
//     const optionsText = options
//       .map((opt, idx) => `${idx + 1}. ${opt}`)
//       .join(", ");
//     await speak(
//       `Here are the enhanced options: ${optionsText}. Say 'select one', 'select two', 'select three', or 'use original' to proceed.`
//     );
//     setAwaitingConfirmation(true);
//     startListening();
//   };

//   // Handle confirmation or selection
//   const handleConfirmation = async (input) => {
//     const keywordMatch = checkForKeywords(input);
//     if (keywordMatch) {
//       const { action, keyword } = keywordMatch;
//       switch (action) {
//         case "confirm":
//           if (step === "confirm") {
//             onSubmit(taskData);
//             resetAndClose();
//           } else {
//             confirmInput(userInput || aiEnhancedOptions[0] || "");
//           }
//           return;
//         case "change":
//           await speak(`Please provide the ${step} again.`);
//           setUserInput("");
//           setAiEnhancedOptions([]);
//           setAwaitingConfirmation(false);
//           startListening();
//           return;
//         case "enhance":
//           await handleEnhance();
//           return;
//         case "original":
//           confirmInput(userInput);
//           return;
//         case "select":
//           const numMatch = input.match(/\d+/);
//           if (numMatch) {
//             const num = parseInt(numMatch[0]) - 1;
//             if (num >= 0 && num < aiEnhancedOptions.length) {
//               confirmInput(aiEnhancedOptions[num]);
//               return;
//             }
//           }
//           await speak("Invalid selection. Please say 'select one', 'select two', or 'select three'.");
//           startListening();
//           return;
//         case "skip":
//           if (step === "note") {
//             skipNote();
//           } else {
//             await speak("Skip is only available for notes. Please provide the current input.");
//             startListening();
//           }
//           return;
//         case "cancel":
//           resetAndClose();
//           return;
//         default:
//           break;
//       }
//     }

//     await speak(
//       step === "confirm"
//         ? "Please say 'confirm' to save or 'cancel' to discard."
//         : "Please say 'confirm', 'change', 'enhance', 'select [number]', or 'use original'."
//     );
//     startListening();
//   };

//   // Confirm and move to next step
//   const confirmInput = (input) => {
//     setTaskData((prev) => ({ ...prev, [step]: input }));
//     setAwaitingConfirmation(false);
//     setUserInput("");
//     setAiEnhancedOptions([]);
//     moveToNextStep();
//   };

//   // Move to next step
//   const moveToNextStep = async () => {
//     if (step === "title") {
//       setStep("description");
//       await speak("Please provide the task description.");
//       startListening();
//     } else if (step === "description") {
//       setStep("note");
//       await speak("Please provide any additional notes, or say 'skip' to proceed.");
//       startListening();
//     } else if (step === "note") {
//       setStep("date");
//       await speak("Please provide a future task date, like 'January 1, 2026'.");
//       startListening();
//     } else if (step === "date") {
//       setStep("time");
//       await speak("Please provide a future task time, like '2:30 PM'.");
//       startListening();
//     } else if (step === "time") {
//       setStep("alert");
//       await speak("Would you like to enable an alert for this task? Say 'yes' or 'no'.");
//       startListening();
//     } else if (step === "alert") {
//       setStep("confirm");
//       await summarizeTask();
//     } else if (step === "alertMinutes") {
//       setStep("confirm");
//       await summarizeTask();
//     } else if (step === "confirm") {
//       onSubmit(taskData);
//       resetAndClose();
//     }
//   };

//   // Summarize task
//   const summarizeTask = async () => {
//     const dateTime = moment(taskData.timestamp).format("MMMM D, YYYY [at] h:mm A");
//     const alertText = taskData.alert
//       ? `Alert set for ${taskData.alertMinutes} minutes before.`
//       : "No alert set.";
//     await speak(
//       `Task summary: Title: ${taskData.title}, Description: ${
//         taskData.description
//       }, Note: ${
//         taskData.note || "None"
//       }, Date and Time: ${dateTime}, ${alertText}. Say 'confirm' to save or 'cancel' to discard.`
//     );
//     startListening();
//   };

//   // Toggle assistant
//   const toggleAssistant = () => {
//     if (isOpen) {
//       resetAndClose();
//     } else {
//       setIsOpen(true);
//       speak("Please provide the task title.");
//       startListening();
//     }
//   };

//   // Reset and close
//   const resetAndClose = () => {
//     setIsOpen(false);
//     setIsProcessing(false);
//     setStep("title");
//     setTaskData({
//       title: "",
//       description: "",
//       note: "",
//       timestamp: new Date().getTime(),
//       alert: false,
//       alertMinutes: 5,
//       status: false,
//       notified: false,
//       userId,
//     });
//     setAiEnhancedOptions([]);
//     setUserInput("");
//     setAwaitingConfirmation(false);
//     setError("");
//     window.speechSynthesis.cancel();
//     stopListening();
//     resetTranscript();
//   };

//   // Skip note
//   const skipNote = () => {
//     setTaskData((prev) => ({ ...prev, note: "" }));
//     setStep("date");
//     setAwaitingConfirmation(false);
//     setUserInput("");
//     setAiEnhancedOptions([]);
//     speak("Please provide a future task date, like 'January 1, 2026'.");
//     startListening();
//   };

//   return (
//     <div className="fixed bottom-4 right-4 z-50">
//       <motion.button
//         className={`p-3 rounded-full shadow-lg focus:outline-none ${
//           isOpen ? "bg-red-500" : "bg-blue-600"
//         } text-white`}
//         onClick={toggleAssistant}
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.9 }}
//       >
//         {isOpen ? <FaStopCircle size={24} /> : <FaMicrophone size={24} />}
//       </motion.button>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             variants={sheetVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             style={{
//               width: "100%",
//               maxWidth: "600px",
//               position: "fixed",
//               bottom: 0,
//               right: 0,
//               left: 0,
//               margin: "auto",
//             }}
//           >
//             <Box
//               sx={{
//                 width: "100%",
//                 bgcolor: "background.paper",
//                 borderRadius: "16px 16px 0 0",
//                 border: "1px solid",
//                 borderColor: "grey.200",
//                 maxHeight: "80vh",
//                 display: "flex",
//                 flexDirection: "column",
//                 overflowY: "auto",
//                 p: 2,
//               }}
//             >
//               {/* Header */}
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="subtitle1" fontWeight="medium">
//                   Voice Task Creation
//                 </Typography>
//                 <IconButton onClick={resetAndClose}>
//                   <IoClose size={24} />
//                 </IconButton>
//               </Box>

//               {/* Content */}
//               <Box
//                 sx={{
//                   flex: 1,
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: 2,
//                 }}
//               >
//                 {(transcript || interimTranscript) && (
//                   <Typography variant="body2">
//                     You said: {interimTranscript || transcript}
//                   </Typography>
//                 )}
//                 {aiEnhancedOptions.length > 0 && (
//                   <Box>
//                     <Typography variant="body2">Enhanced Options:</Typography>
//                     {aiEnhancedOptions.map((opt, idx) => (
//                       <Typography key={idx} variant="body2">
//                         {idx + 1}. {opt}
//                       </Typography>
//                     ))}
//                   </Box>
//                 )}
//                 {error && (
//                   <Typography variant="body2" color="error">
//                     {error}
//                   </Typography>
//                 )}
//                 {awaitingConfirmation && (
//                   <Box
//                     sx={{ display: "flex", flexDirection: "column", gap: 1 }}
//                   >
//                     <TextField
//                       fullWidth
//                       label={`Edit ${step}`}
//                       value={userInput || aiEnhancedOptions[0] || ""}
//                       onChange={(e) => setUserInput(e.target.value)}
//                       variant="outlined"
//                     />
//                     <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//                       <Button
//                         variant="contained"
//                         onClick={() => handleConfirmation("confirm")}
//                         startIcon={<FaCheckCircle />}
//                       >
//                         Confirm
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         onClick={() => handleConfirmation("change")}
//                       >
//                         Change
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         onClick={() => handleConfirmation("enhance")}
//                         disabled={isProcessing}
//                       >
//                         Enhance
//                       </Button>
//                       {aiEnhancedOptions.length > 0 && (
//                         <>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("select 1")}
//                           >
//                             Select 1
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("select 2")}
//                           >
//                             Select 2
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("select 3")}
//                           >
//                             Select 3
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("use original")}
//                           >
//                             Use Original
//                           </Button>
//                         </>
//                       )}
//                       {step === "note" && (
//                         <Button
//                           variant="outlined"
//                           onClick={skipNote}
//                           disabled={isProcessing}
//                         >
//                           Skip
//                         </Button>
//                       )}
//                       <Button
//                         variant="outlined"
//                         onClick={resetAndClose}
//                         disabled={isProcessing}
//                       >
//                         Cancel
//                       </Button>
//                     </Box>
//                   </Box>
//                 )}
//                 {isProcessing && <CircularProgress size={24} />}
//              {isProcessing && (
//                   <Typography variant="body2" sx={{ mt: 1 }}>
//                     Processing...
//                   </Typography>
//                 )}
//                 {step === "confirm" && !awaitingConfirmation && (
//                   <Box sx={{ display: "flex", gap: 1 }}>
//                     <Button
//                       variant="contained"
//                       onClick={() => handleConfirmation("confirm")}
//                       startIcon={<FaCheckCircle />}
//                     >
//                       Save Task
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       onClick={resetAndClose}
//                     >
//                       Cancel
//                     </Button>
//                   </Box>
//                 )}
//               </Box>
//             </Box>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default VoiceAssistantSheet;



// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { FaMicrophone, FaStopCircle, FaCheckCircle } from "react-icons/fa";
// import { IoClose } from "react-icons/io5";
// import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
// import { GEMINI_KEY } from "../../env";
// import { Box, Typography, Button, IconButton, TextField, CircularProgress } from "@mui/material";
// import moment from "moment";
// import {sheetVariants,keywordActions,cleanResponseText} from '../utils/index';

// const VoiceAssistantSheet = ({ onSubmit, userId,isOpen, setIsOpen  }) => {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [step, setStep] = useState("title"); // Steps: title, description, note, date, time, alert, alertMinutes, confirm
//   const [taskData, setTaskData] = useState({
//     title: "",
//     description: "",
//     note: "",
//     timestamp: new Date().getTime(),
//     alert: false,
//     alertMinutes: 5,
//     status: false,
//     notified: false,
//     userId,
//   });
//   const [aiEnhancedOptions, setAiEnhancedOptions] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
//   const [error, setError] = useState("");
//   const shouldResumeListening = useRef(false);
//   const transcriptTimeoutRef = useRef(null);

//   const {
//     transcript,
//     interimTranscript,
//     finalTranscript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition,
//     isMicrophoneAvailable,
//   } = useSpeechRecognition({
//     commands: [],
//     clearTranscriptOnListen: false,
//   });

//   const speak = (text, resumeListening = true) => {
//     if (!text) return;
//     setIsProcessing(true);
//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     const voices = window.speechSynthesis.getVoices();
//     utterance.voice =
//       voices.find((v) => v.lang === "en-US" && /male|david|michael/i.test(v.name)) ||
//       voices.find((v) => v.lang === "en-US");

//     utterance.rate = 1.0;
//     utterance.pitch = 1.2;

//     utterance.onend = () => {
//       setIsProcessing(false);
//       if (resumeListening && shouldResumeListening.current) {
//         SpeechRecognition.startListening({ continuous: true, language: "en-US", interimResults: true });
//       }
//     };

//     utterance.onerror = () => {
//       setIsProcessing(false);
//       if (resumeListening && shouldResumeListening.current) {
//         SpeechRecognition.startListening({ continuous: true, language: "en-US", interimResults: true });
//       }
//     };

//     window.speechSynthesis.speak(utterance);
//   };

//   const enhanceText = async (inputText, context) => {
//     setIsProcessing(true);
//     try {
//       const prompt = `Enhance the following ${context} for a task. Provide exactly 3 clear, concise, and professional options in a numbered list (1., 2., 3.). Return only the numbered list with the enhanced sentences, no additional text or explanation.\n\n${inputText}`;
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [{ role: "user", parts: [{ text: prompt }] }],
//           }),
//         }
//       );
//       const data = await res.json();
//       const enhancedText = cleanResponseText(
//         data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
//       );
//       const options = enhancedText
//         .split("\n")
//         .map((line) => line.replace(/^\d+\.\s*/, "").trim())
//         .filter((line) => line);
//       setIsProcessing(false);
//       return options.length === 3 ? options : [inputText];
//     } catch (err) {
//       console.error("Gemini error:", err);
//       setIsProcessing(false);
//       return [inputText];
//     }
//   };

//   useEffect(() => {
//     if (!browserSupportsSpeechRecognition) {
//       setError("Speech recognition is not supported in this browser.");
//       return;
//     }
//     if (!isMicrophoneAvailable) {
//       setError("Microphone access is required for speech recognition.");
//       return;
//     }
//   }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

//   useEffect(() => {
//     if (finalTranscript && !isProcessing) {
//       if (transcriptTimeoutRef.current) {
//         clearTimeout(transcriptTimeoutRef.current);
//       }

//       transcriptTimeoutRef.current = setTimeout(() => {
//         const spoken = finalTranscript.trim();
//         if (spoken) {
//           setUserInput(spoken);
//           if (awaitingConfirmation) {
//             handleConfirmation(spoken.toLowerCase());
//           } else {
//             processInput(spoken);
//           }
//           resetTranscript();
//         }
//       }, 3000);
//     }

//     return () => {
//       if (transcriptTimeoutRef.current) {
//         clearTimeout(transcriptTimeoutRef.current);
//       }
//     };
//   }, [finalTranscript, isProcessing, awaitingConfirmation]);

//   const startListening = () => {
//     if (isProcessing || listening || !browserSupportsSpeechRecognition || !isMicrophoneAvailable) return;
//     shouldResumeListening.current = true;
//     SpeechRecognition.startListening({ continuous: true, language: "en-US", interimResults: true });
//   };

//   const stopListening = () => {
//     shouldResumeListening.current = false;
//     SpeechRecognition.stopListening();
//     if (transcriptTimeoutRef.current) {
//       clearTimeout(transcriptTimeoutRef.current);
//     }
//   };

//   const checkForKeywords = (input) => {
//     const lowerInput = input.toLowerCase();
//     for (const [action, keywords] of Object.entries(keywordActions)) {
//       for (const keyword of keywords) {
//         if (lowerInput === keyword || lowerInput.includes(` ${keyword} `)) {
//           return { action, keyword };
//         }
//       }
//     }
//     return null;
//   };

//   const processInput = async (input) => {
//     console.log("Processing input:", input);
//     const keywordMatch = checkForKeywords(input);
//     if (keywordMatch) {
//       const { action, keyword } = keywordMatch;
//       switch (action) {
//         case "confirm":
//           if (step === "confirm") {
//             handleFinalSubmit();
//             resetAndClose();
//             startListening();
//           } else {
//             confirmInput(userInput || aiEnhancedOptions[0] || input);
//             startListening();
//           }
//           return;
//         case "change":
//           await speak(`Please provide the ${step} again.`);
//           setUserInput("");
//           setAiEnhancedOptions([]);
//           setAwaitingConfirmation(false);
//           startListening();
//           return;
//         case "enhance":
//           await handleEnhance();
//           return;
//         case "original":
//           confirmInput(userInput);
//           return;
//         case "select":
//           const numMatch = input.match(/\d+/);
//           if (numMatch) {
//             const num = parseInt(numMatch[0]) - 1;
//             if (num >= 0 && num < aiEnhancedOptions.length) {
//               confirmInput(aiEnhancedOptions[num]);
//               return;
//             }
//           }
//           await speak("Invalid selection. Please say 'select one', 'select two', or 'select three'.");
//           startListening();
//           return;
//         case "skip":
//           if (step === "note") {
//             skipNote();
//           } else {
//             await speak("Skip is only available for notes. Please provide the current input.");
//             startListening();
//           }
//           return;
//         case "cancel":
//           resetAndClose();
//           return;
//         default:
//           break;
//       }
//     }

//     if (step === "date") {
//       const normalizedInput = input.replace(/\s+/g, " ").trim();
//       const dateFormats = [
//         "MMMM D YYYY", "MMMM D, YYYY", "MM/DD/YYYY", "MM-DD-YYYY", "YYYY-MM-DD",
//         "MMM D YYYY", "MMM D, YYYY", "D MMMM YYYY", "D MMM YYYY",
//         "MMMM YYYY", "MMM YYYY", "YYYY MMMM", "YYYY MMM",
//       ];
//       let parsedDate = moment(normalizedInput, dateFormats, false);
//       if (!parsedDate.isValid()) {
//         parsedDate = moment(normalizedInput);
//       }
//       const now = moment();
//       if (parsedDate.isValid()) {
//         if (!normalizedInput.match(/\d{1,2}/)) {
//           parsedDate = parsedDate.startOf("month");
//         }
//         if (parsedDate.isAfter(now)) {
//           setTaskData((prev) => ({
//             ...prev,
//             timestamp: new Date(prev.timestamp).setFullYear(
//               parsedDate.year(),
//               parsedDate.month(),
//               parsedDate.date()
//             ),
//           }));
//           await speak(`Date set to ${parsedDate.format("MMMM D, YYYY")}. Would you like to confirm, change, or enhance it?`);
//           setAwaitingConfirmation(true);
//           startListening();
//          } else {
//           setError("Please select a future date, like 'May 1, 2025'.");
//           await speak("Please select a future date, like 'May 1, 2025'.");
//           startListening();
//         }
//       } else {
//         setError("Invalid date format. Please say a date like 'May 1, 2025' or 'January 2026'.");
//         await speak("Invalid date format. Please say a date like 'May 1, 2025' or 'January 2026'.");
//         startListening();
//       }
//     } else if (step === "time") {
//       const parsedTime = moment(input, ["h:mm A", "HH:mm"], true);
//       const now = moment();
//       if (parsedTime.isValid()) {
//         const combinedDateTime = moment(taskData.timestamp).set({
//           hour: parsedTime.hours(),
//           minute: parsedTime.minutes(),
//         });
//         if (combinedDateTime.isAfter(now)) {
//           setTaskData((prev) => ({
//             ...prev,
//             timestamp: combinedDateTime.valueOf(),
//           }));
//           await speak(`Time set to ${parsedTime.format("h:mm A")}. Would you like to confirm, change, or enhance it?`);
//           setAwaitingConfirmation(true);
//           startListening();
//         } else {
//           setError("Please select a future time.");
//           await speak("Please select a future time.");
//           startListening();
//         }
//       } else {
//         setError("Invalid time format. Please say a time like '2:30 PM'.");
//         await speak("Invalid time format. Please say a time like '2:30 PM'.");
//         startListening();
//       }
//     } else if (step === "alert") {
//       const lowerInput = input.toLowerCase();
//       if (keywordActions.alertOn.includes(lowerInput)) {
//         setTaskData((prev) => ({ ...prev, alert: true }));
//         await speak("Alert enabled. Please choose an alert time: 2, 5, 10, or 15 minutes before the task.");
//         setStep("alertMinutes");
//         startListening();
//       } else if (keywordActions.alertOff.includes(lowerInput)) {
//         setTaskData((prev) => ({ ...prev, alert: false, alertMinutes: 0 }));
//         await speak("Alert disabled. Would you like to confirm or change it?");
//         setAwaitingConfirmation(true);
//         startListening();
//       } else {
//         setError("Please say 'yes' or 'no' to enable or disable the alert.");
//         await speak("Please say 'yes' or 'no' to enable or disable the alert.");
//         startListening();
//       }
//     } else if (step === "alertMinutes") {
//       const validMinutes = [2, 5, 10, 15];
//       const minutes = parseInt(input.match(/\d+/), 10);
//       if (validMinutes.includes(minutes)) {
//         setTaskData((prev) => ({ ...prev, alertMinutes: minutes }));
//         await speak(`Alert set to ${minutes} minutes before. Would you like to confirm or change it?`);
//         setAwaitingConfirmation(true);
//         startListening();
//       } else {
//         setError("Please choose 2, 5, 10, or 15 minutes.");
//         await speak("Please choose 2, 5, 10, or 15 minutes.");
//         startListening();
//       }
//     } else {
//       const context =
//         step === "title" ? "task title" : step === "description" ? "task description" : "task note";
//       setUserInput(input);
//       await speak(`You said: ${input}. Would you like to confirm, change, or enhance this ${context}?`);
//       setAwaitingConfirmation(true);
//       startListening();
//     }
//   };

//   const handleEnhance = async () => {
//     const context =
//       step === "title" ? "task title" : step === "description" ? "task description" : "task note";
//     const options = await enhanceText(userInput, context);
//     setAiEnhancedOptions(options);
//     const optionsText = options
//       .map((opt, idx) => `${idx + 1}. ${opt}`)
//       .join(", ");
//     await speak(
//       `Here are the enhanced options: ${optionsText}. Say 'select one', 'select two', 'select three', or 'use original' to proceed.`
//     );
//     setAwaitingConfirmation(true);
//     startListening();
//   };

//   const handleConfirmation = async (input) => {
//     const keywordMatch = checkForKeywords(input);
//     if (keywordMatch) {
//       const { action, keyword } = keywordMatch;
//       switch (action) {
//         case "confirm":
//           if (step === "confirm") {
//             handleFinalSubmit();
//             resetAndClose();
//           } else {
//             confirmInput(userInput || aiEnhancedOptions[0] || "");
//           }
//           return;
//         case "change":
//           await speak(`Please provide the ${step} again.`);
//           setUserInput("");
//           setAiEnhancedOptions([]);
//           setAwaitingConfirmation(false);
//           startListening();
//           return;
//         case "enhance":
//           await handleEnhance();
//           return;
//         case "original":
//           confirmInput(userInput);
//           return;
//         case "select":
//           const numMatch = input.match(/\d+/);
//           if (numMatch) {
//             const num = parseInt(numMatch[0]) - 1;
//             if (num >= 0 && num < aiEnhancedOptions.length) {
//               confirmInput(aiEnhancedOptions[num]);
//               return;
//             }
//           }
//           await speak("Invalid selection. Please say 'select one', 'select two', or 'select three'.");
//           startListening();
//           return;
//         case "skip":
//           if (step === "note") {
//             skipNote();
//           } else {
//             await speak("Skip is only available for notes. Please provide the current input.");
//             startListening();
//           }
//           return;
//         case "cancel":
//           resetAndClose();
//           return;
//         default:
//           break;
//       }
//     }

//     await speak(
//       step === "confirm"
//         ? "Please say 'confirm' to save or 'cancel' to discard."
//         : "Please say 'confirm', 'change', 'enhance', 'select [number]', or 'use original'."
//     );
//     startListening();
//   };

//   const handleFinalSubmit = () => {
//     if (!onSubmit || typeof onSubmit !== 'function') {
//       console.error("onSubmit is not a function or is undefined");
//       return;
//     }
//     const formattedTaskData = {
//       title: taskData.title,
//       timestamp: taskData.timestamp,
//       description: taskData.description,
//       note: taskData.note,
//       alert: taskData.alert,
//       notified: taskData.notified,
//       alertMinutes: taskData.alert ? taskData.alertMinutes : 0,
//       status: taskData.status,
//       userId: taskData.userId,
//     };
//     onSubmit(formattedTaskData);
//   };

//   const confirmInput = (input) => {
//     setTaskData((prev) => ({ ...prev, [step]: input }));
//     setAwaitingConfirmation(false);
//     setUserInput("");
//     setAiEnhancedOptions([]);
//     moveToNextStep();
//   };

//   const moveToNextStep = async () => {
//     if (step === "title") {
//       setStep("description");
//       await speak("Please provide the task description.");
//       startListening();
//     } else if (step === "description") {
//       setStep("note");
//       await speak("Please provide any additional notes, or say 'skip' to proceed.");
//       startListening();
//     } else if (step === "note") {
//       setStep("date");
//       await speak("Please provide a future task date, like 'January 1, 2026'.");
//       startListening();
//     } else if (step === "date") {
//       setStep("time");
//       await speak("Please provide a future task time, like '2:30 PM'.");
//       startListening();
//     } else if (step === "time") {
//       setStep("alert");
//       await speak("Would you like to enable an alert for this task? Say 'yes' or 'no'.");
//       startListening();
//     } else if (step === "alert" || step === "alertMinutes") {
//       setStep("confirm");
//       await summarizeTask();
//     }
//   };

//   const summarizeTask = async () => {
//     const dateTime = moment(taskData.timestamp).format("MMMM D, YYYY [at] h:mm A");
//     const alertText = taskData.alert
//       ? `Alert set for ${taskData.alertMinutes} minutes before.`
//       : "No alert set.";
//     await speak(
//       `Task summary: Title: ${taskData.title}, Description: ${
//         taskData.description
//       }, Note: ${
//         taskData.note || "None"
//       }, Date and Time: ${dateTime}, ${alertText}. Say 'confirm' to save or 'cancel' to discard.`
//     );
//     startListening();
//   };

//   useEffect(() => {
//     if (isOpen) {
//       speak("Please provide the task title.");
//       startListening();
//     }
//   }, [isOpen]);

//   const toggleAssistant = () => {
//     if (isOpen) {
//       resetAndClose();
//     } else {
//       setIsOpen(true);
//       speak("Please provide the task title.");
//       startListening();
//     }
//   };

//   const resetAndClose = () => {
//     setIsOpen(false);
//     setIsProcessing(false);
//     setStep("title");
//     setTaskData({
//       title: "",
//       description: "",
//       note: "",
//       timestamp: new Date().getTime(),
//       alert: false,
//       alertMinutes: 5,
//       status: false,
//       notified: false,
//       userId,
//     });
//     setAiEnhancedOptions([]);
//     setUserInput("");
//     setAwaitingConfirmation(false);
//     setError("");
//     window.speechSynthesis.cancel();
//     stopListening();
//     resetTranscript();
//   };

//   const skipNote = () => {
//     setTaskData((prev) => ({ ...prev, note: "" }));
//     setStep("date");
//     setAwaitingConfirmation(false);
//     setUserInput("");
//     setAiEnhancedOptions([]);
//     speak("Please provide a future task date, like 'January 1, 2026'.");
//     startListening();
//   };

//   return (
//     <div className="fixed bottom-20 right-2 z-50">
  

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             variants={sheetVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             style={{
//               width: "100%",
//               maxWidth: "600px",
//               position: "fixed",
//               bottom: 0,
//               right: 0,
//               left: 0,
//               margin: "auto",
//             }}
//           >
//             <Box
//               sx={{
//                 width: "100%",
//                 bgcolor: "background.paper",
//                 borderRadius: "16px 16px 0 0",
//                 border: "1px solid",
//                 borderColor: "grey.200",
//                 maxHeight: "80vh",
//                 display: "flex",
//                 flexDirection: "column",
//                 overflowY: "auto",
//                 p: 2,
//               }}
//             >
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="subtitle1" fontWeight="medium">
//                   Voice Task Creation
//                 </Typography>
//                 <IconButton onClick={resetAndClose}>
//                   <IoClose size={24} />
//                 </IconButton>
//               </Box>

//               <Box
//                 sx={{
//                   flex: 1,
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: 2,
//                 }}
//               >
//                 {(transcript || interimTranscript) && (
//                   <Typography variant="body2">
//                     You said: {interimTranscript || transcript}
//                   </Typography>
//                 )}
//                 {aiEnhancedOptions.length > 0 && (
//                   <Box>
//                     <Typography variant="body2">Enhanced Options:</Typography>
//                     {aiEnhancedOptions.map((opt, idx) => (
//                       <Typography key={idx} variant="body2">
//                         {idx + 1}. {opt}
//                       </Typography>
//                     ))}
//                   </Box>
//                 )}
//                 {error && (
//                   <Typography variant="body2" color="error">
//                     {error}
//                   </Typography>
//                 )}
//                 {awaitingConfirmation && (
//                   <Box
//                     sx={{ display: "flex", flexDirection: "column", gap: 1 }}
//                   >
//                     <TextField
//                       fullWidth
//                       label={`Edit ${step}`}
//                       value={userInput || aiEnhancedOptions[0] || ""}
//                       onChange={(e) => setUserInput(e.target.value)}
//                       variant="outlined"
//                     />
//                     <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//                       <Button
//                         variant="contained"
//                         onClick={() => handleConfirmation("confirm")}
//                         startIcon={<FaCheckCircle />}
//                       >
//                         Confirm
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         onClick={() => handleConfirmation("change")}
//                       >
//                         Change
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         onClick={() => handleConfirmation("enhance")}
//                         disabled={isProcessing}
//                       >
//                         Enhance
//                       </Button>
//                       {aiEnhancedOptions.length > 0 && (
//                         <>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("select 1")}
//                           >
//                             Select 1
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("select 2")}
//                           >
//                             Select 2
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("select 3")}
//                           >
//                             Select 3
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("use original")}
//                           >
//                             Use Original
//                           </Button>
//                         </>
//                       )}
//                       {step === "note" && (
//                         <Button
//                           variant="outlined"
//                           onClick={skipNote}
//                           disabled={isProcessing}
//                         >
//                           Skip
//                         </Button>
//                       )}
//                       <Button
//                         variant="outlined"
//                         onClick={resetAndClose}
//                         disabled={isProcessing}
//                       >
//                         Cancel
//                       </Button>
//                     </Box>
//                   </Box>
//                 )}
//                 {isProcessing && <CircularProgress size={24} />}
//                 {isProcessing && (
//                   <Typography variant="body2" sx={{ mt: 1 }}>
//                     Processing...
//                   </Typography>
//                 )}
//                 {step === "confirm" && !awaitingConfirmation && (
//                   <Box sx={{ display: "flex", gap: 1 }}>
//                     <Button
//                       variant="contained"
//                       onClick={() => handleConfirmation("confirm")}
//                       startIcon={<FaCheckCircle />}
//                     >
//                       Save Task
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       onClick={resetAndClose}
//                     >
//                       Cancel
//                     </Button>
//                   </Box>
//                 )}
//               </Box>
//             </Box>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default VoiceAssistantSheet;



// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { FaMicrophone, FaStopCircle, FaCheckCircle } from "react-icons/fa";
// import { IoClose } from "react-icons/io5";
// import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
// import { GEMINI_KEY } from "../../env";
// import { Box, Typography, Button, IconButton, TextField, CircularProgress } from "@mui/material";
// import moment from "moment";
// import {sheetVariants,keywordActions,cleanResponseText} from '../utils/index';

// const VoiceAssistantSheet = ({ onSubmit, userId,isOpen, setIsOpen  }) => {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [step, setStep] = useState("title"); // Steps: title, description, note, date, time, alert, alertMinutes, confirm
//   const [taskData, setTaskData] = useState({
//     title: "",
//     description: "",
//     note: "",
//     timestamp: new Date().getTime(),
//     alert: false,
//     alertMinutes: 5,
//     status: false,
//     notified: false,
//     userId,
//   });
//   const [aiEnhancedOptions, setAiEnhancedOptions] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
//   const [error, setError] = useState("");
//   const shouldResumeListening = useRef(false);
//   const transcriptTimeoutRef = useRef(null);

//   const {
//     transcript,
//     interimTranscript,
//     finalTranscript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition,
//     isMicrophoneAvailable,
//   } = useSpeechRecognition({
//     commands: [],
//     clearTranscriptOnListen: false,
//   });

//   const speak = (text, resumeListening = true) => {
//     if (!text) return;
//     setIsProcessing(true);
//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     const voices = window.speechSynthesis.getVoices();
//     utterance.voice =
//       voices.find((v) => v.lang === "en-US" && /male|david|michael/i.test(v.name)) ||
//       voices.find((v) => v.lang === "en-US");

//     utterance.rate = 1.0;
//     utterance.pitch = 1.2;

//     utterance.onend = () => {
//       setIsProcessing(false);
//       if (resumeListening && shouldResumeListening.current) {
//         SpeechRecognition.startListening({ continuous: true, language: "en-US", interimResults: true });
//       }
//     };

//     utterance.onerror = () => {
//       setIsProcessing(false);
//       if (resumeListening && shouldResumeListening.current) {
//         SpeechRecognition.startListening({ continuous: true, language: "en-US", interimResults: true });
//       }
//     };

//     window.speechSynthesis.speak(utterance);
//   };

//   const enhanceText = async (inputText, context) => {
//     setIsProcessing(true);
//     try {
//       const prompt = `Enhance the following ${context} for a task. Provide exactly 3 clear, concise, and professional options in a numbered list (1., 2., 3.). Return only the numbered list with the enhanced sentences, no additional text or explanation.\n\n${inputText}`;
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [{ role: "user", parts: [{ text: prompt }] }],
//           }),
//         }
//       );
//       const data = await res.json();
//       const enhancedText = cleanResponseText(
//         data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
//       );
//       const options = enhancedText
//         .split("\n")
//         .map((line) => line.replace(/^\d+\.\s*/, "").trim())
//         .filter((line) => line);
//       setIsProcessing(false);
//       return options.length === 3 ? options : [inputText];
//     } catch (err) {
//       console.error("Gemini error:", err);
//       setIsProcessing(false);
//       return [inputText];
//     }
//   };

//   useEffect(() => {
//     if (!browserSupportsSpeechRecognition) {
//       setError("Speech recognition is not supported in this browser.");
//       return;
//     }
//     if (!isMicrophoneAvailable) {
//       setError("Microphone access is required for speech recognition.");
//       return;
//     }
//   }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

//   useEffect(() => {
//     if (finalTranscript && !isProcessing) {
//       if (transcriptTimeoutRef.current) {
//         clearTimeout(transcriptTimeoutRef.current);
//       }

//       transcriptTimeoutRef.current = setTimeout(() => {
//         const spoken = finalTranscript.trim();
//         if (spoken) {
//           setUserInput(spoken);
//           if (awaitingConfirmation) {
//             handleConfirmation(spoken.toLowerCase());
//           } else {
//             processInput(spoken);
//           }
//           resetTranscript();
//         }
//       }, 14000);
//     }

//     return () => {
//       if (transcriptTimeoutRef.current) {
//         clearTimeout(transcriptTimeoutRef.current);
//       }
//     };
//   }, [finalTranscript, isProcessing, awaitingConfirmation]);

//   const startListening = () => {
//     if (isProcessing || listening || !browserSupportsSpeechRecognition || !isMicrophoneAvailable) return;
//     shouldResumeListening.current = true;
//     SpeechRecognition.startListening({ continuous: true, language: "en-US", interimResults: true });
//   };

//   const stopListening = () => {
//     shouldResumeListening.current = false;
//     SpeechRecognition.stopListening();
//     if (transcriptTimeoutRef.current) {
//       clearTimeout(transcriptTimeoutRef.current);
//     }
//   };

//   const checkForKeywords = (input) => {
//     const lowerInput = input.toLowerCase();
//     for (const [action, keywords] of Object.entries(keywordActions)) {
//       for (const keyword of keywords) {
//         if (lowerInput === keyword || lowerInput.includes(` ${keyword} `)) {
//           return { action, keyword };
//         }
//       }
//     }
//     return null;
//   };

//   const processInput = async (input) => {
//     console.log("Processing input:", input);
//     const keywordMatch = checkForKeywords(input);
//     if (keywordMatch) {
//       const { action, keyword } = keywordMatch;
//       switch (action) {
//         case "confirm":
//           if (step === "confirm") {
//             handleFinalSubmit();
//             resetAndClose();
//             startListening();
//           } else {
//             confirmInput(userInput || aiEnhancedOptions[0] || input);
//             startListening();
//           }
//           return;
//         case "change":
//           await speak(`Please provide the ${step} again.`);
//           setUserInput("");
//           setAiEnhancedOptions([]);
//           setAwaitingConfirmation(false);
//           startListening();
//           return;
//         case "enhance":
//           await handleEnhance();
//           return;
//         case "original":
//           confirmInput(userInput);
//           return;
//         case "select":
//           const numMatch = input.match(/\d+/);
//           if (numMatch) {
//             const num = parseInt(numMatch[0]) - 1;
//             if (num >= 0 && num < aiEnhancedOptions.length) {
//               confirmInput(aiEnhancedOptions[num]);
//               return;
//             }
//           }
//           await speak("Invalid selection. Please say 'select one', 'select two', or 'select three'.");
//           startListening();
//           return;
//         case "skip":
//           if (step === "note") {
//             skipNote();
//           } else {
//             await speak("Skip is only available for notes. Please provide the current input.");
//             startListening();
//           }
//           return;
//         case "cancel":
//           resetAndClose();
//           return;
//         default:
//           break;
//       }
//     }

//     if (step === "date") {
//       const normalizedInput = input.replace(/\s+/g, " ").trim();
//       const dateFormats = [
//         "MMMM D YYYY", "MMMM D, YYYY", "MM/DD/YYYY", "MM-DD-YYYY", "YYYY-MM-DD",
//         "MMM D YYYY", "MMM D, YYYY", "D MMMM YYYY", "D MMM YYYY",
//         "MMMM YYYY", "MMM YYYY", "YYYY MMMM", "YYYY MMM",
//       ];
//       let parsedDate = moment(normalizedInput, dateFormats, false);
//       if (!parsedDate.isValid()) {
//         parsedDate = moment(normalizedInput);
//       }
//       const now = moment();
//       if (parsedDate.isValid()) {
//         if (!normalizedInput.match(/\d{1,2}/)) {
//           parsedDate = parsedDate.startOf("month");
//         }
//         if (parsedDate.isAfter(now)) {
//           setTaskData((prev) => ({
//             ...prev,
//             timestamp: new Date(prev.timestamp).setFullYear(
//               parsedDate.year(),
//               parsedDate.month(),
//               parsedDate.date()
//             ),
//           }));
//           await speak(`Date set to ${parsedDate.format("MMMM D, YYYY")}. Would you like to confirm, change, or enhance it?`);
//           setAwaitingConfirmation(true);
//           startListening();
//          } else {
//           setError("Please select a future date, like 'May 1, 2025'.");
//           await speak("Please select a future date, like 'May 1, 2025'.");
//           startListening();
//         }
//       } else {
//         setError("Invalid date format. Please say a date like 'May 1, 2025' or 'January 2026'.");
//         await speak("Invalid date format. Please say a date like 'May 1, 2025' or 'January 2026'.");
//         startListening();
//       }
//     } else if (step === "time") {
//       const parsedTime = moment(input, ["h:mm A", "HH:mm"], true);
//       const now = moment();
//       if (parsedTime.isValid()) {
//         const combinedDateTime = moment(taskData.timestamp).set({
//           hour: parsedTime.hours(),
//           minute: parsedTime.minutes(),
//         });
//         if (combinedDateTime.isAfter(now)) {
//           setTaskData((prev) => ({
//             ...prev,
//             timestamp: combinedDateTime.valueOf(),
//           }));
//           await speak(`Time set to ${parsedTime.format("h:mm A")}. Would you like to confirm, change, or enhance it?`);
//           setAwaitingConfirmation(true);
//           startListening();
//         } else {
//           setError("Please select a future time.");
//           await speak("Please select a future time.");
//           startListening();
//         }
//       } else {
//         setError("Invalid time format. Please say a time like '2:30 PM'.");
//         await speak("Invalid time format. Please say a time like '2:30 PM'.");
//         startListening();
//       }
//     } else if (step === "alert") {
//       const lowerInput = input.toLowerCase();
//       if (keywordActions.alertOn.includes(lowerInput)) {
//         setTaskData((prev) => ({ ...prev, alert: true }));
//         await speak("Please choose an alert time: 2, 5, 10, or 15 minutes before the task.");
//         setStep("alertMinutes");
//         startListening();
//       } else if (keywordActions.alertOff.includes(lowerInput)) {
//         setTaskData((prev) => ({ ...prev, alert: false, alertMinutes: 0 }));
//         await speak("Alert disabled. Would you like to confirm or change it?");
//         setAwaitingConfirmation(true);
//         startListening();
//       } else {
//         setError("Please say 'yes' or 'no' to enable or disable the alert.");
//         await speak("Please say 'yes' or 'no' to enable or disable the alert.");
//         startListening();
//       }
//     } else if (step === "alertMinutes") {
//       const validMinutes = [2, 5, 10, 15];
//       const minutes = parseInt(input.match(/\d+/), 10);
//       if (validMinutes.includes(minutes)) {
//         setTaskData((prev) => ({ ...prev, alertMinutes: minutes }));
//         await speak(`Alert set to ${minutes} minutes before. Would you like to confirm or change it?`);
//         setAwaitingConfirmation(true);
//         startListening();
//       } else {
//         setError("Please choose 2, 5, 10, or 15 minutes.");
//         await speak("Please choose 2, 5, 10, or 15 minutes.");
//         startListening();
//       }
//     } else {
//       const context =
//         step === "title" ? "task title" : step === "description" ? "task description" : "task note";
//       setUserInput(input);
//       await speak(`You said: ${input}. Would you like to confirm, change, or enhance this ${context}?`);
//       setAwaitingConfirmation(true);
//       startListening();
//     }
//   };

//   const handleEnhance = async () => {
//     const context =
//       step === "title" ? "task title" : step === "description" ? "task description" : "task note";
//     const options = await enhanceText(userInput, context);
//     setAiEnhancedOptions(options);
//     await speak(
//       `"${options[0]}"\n"${options[1]}"\n"${options[2]}"\nSay 'select one', 'select two', or 'select three' to choose an option, or 'use original' to keep your input.`
//     );
//     setAwaitingConfirmation(true);
//     startListening();
//   };

//   const handleConfirmation = async (input) => {
//     const keywordMatch = checkForKeywords(input);
//     if (keywordMatch) {
//       const { action, keyword } = keywordMatch;
//       switch (action) {
//         case "confirm":
//           if (step === "confirm") {
//             handleFinalSubmit();
//             resetAndClose();
//           } else {
//             confirmInput(userInput || aiEnhancedOptions[0] || "");
//           }
//           return;
//         case "change":
//           await speak(`Please provide the ${step} again.`);
//           setUserInput("");
//           setAiEnhancedOptions([]);
//           setAwaitingConfirmation(false);
//           startListening();
//           return;
//         case "enhance":
//           await handleEnhance();
//           return;
//         case "original":
//           confirmInput(userInput);
//           return;
//         case "select":
//           const numMatch = input.match(/\d+/);
//           if (numMatch) {
//             const num = parseInt(numMatch[0]) - 1;
//             if (num >= 0 && num < aiEnhancedOptions.length) {
//               confirmInput(aiEnhancedOptions[num]);
//               return;
//             }
//           }
//           await speak("Invalid selection. Please say 'select one', 'select two', or 'select three'.");
//           startListening();
//           return;
//         case "skip":
//           if (step === "note") {
//             skipNote();
//           } else {
//             await speak("Skip is only available for notes. Please provide the current input.");
//             startListening();
//           }
//           return;
//         case "cancel":
//           resetAndClose();
//           return;
//         default:
//           break;
//       }
//     }

//     await speak(
//       step === "confirm"
//         ? "Please say 'confirm' to save or 'cancel' to discard."
//         : "Please say 'confirm', 'change', 'enhance', 'select [number]', or 'use original'."
//     );
//     startListening();
//   };

//   const handleFinalSubmit = () => {
//     if (!onSubmit || typeof onSubmit !== 'function') {
//       console.error("onSubmit is not a function or is undefined");
//       return;
//     }
//     const formattedTaskData = {
//       title: taskData.title,
//       timestamp: taskData.timestamp,
//       description: taskData.description,
//       note: taskData.note,
//       alert: taskData.alert,
//       notified: taskData.notified,
//       alertMinutes: taskData.alert ? taskData.alertMinutes : 0,
//       status: taskData.status,
//       userId: taskData.userId,
//     };
//     onSubmit(formattedTaskData);
//   };

//   const confirmInput = (input) => {
//     setTaskData((prev) => ({ ...prev, [step]: input }));
//     setAwaitingConfirmation(false);
//     setUserInput("");
//     setAiEnhancedOptions([]);
//     moveToNextStep();
//   };

//   const moveToNextStep = async () => {
//     if (step === "title") {
//       setStep("description");
//       await speak("Please provide the task description.");
//       startListening();
//     } else if (step === "description") {
//       setStep("note");
//       await speak("Please provide any additional notes, or say 'skip' to proceed.");
//       startListening();
//     } else if (step === "note") {
//       setStep("date");
//       await speak("Please provide a future task date, like 'January 1, 2026'.");
//       startListening();
//     } else if (step === "date") {
//       setStep("time");
//       await speak("Please provide a future task time, like '2:30 PM'.");
//       startListening();
//     } else if (step === "time") {
//       setStep("alert");
//       await speak("Would you like to enable an alert for this task? Say 'yes' or 'no'.");
//       startListening();
//     } else if (step === "alert" || step === "alertMinutes") {
//       setStep("confirm");
//       await summarizeTask();
//     }
//   };

//   const summarizeTask = async () => {
//     const dateTime = moment(taskData.timestamp).format("MMMM D, YYYY [at] h:mm A");
//     const alertText = taskData.alert
//       ? `Alert set for ${taskData.alertMinutes} minutes before.`
//       : "No alert set.";
//     await speak(
//       `Task summary: Title: ${taskData.title}, Description: ${
//         taskData.description
//       }, Note: ${
//         taskData.note || "None"
//       }, Date and Time: ${dateTime}, ${alertText}. Say 'confirm' to save or 'cancel' to discard.`
//     );
//     startListening();
//   };

//   useEffect(() => {
//     if (isOpen) {
//       speak("Please provide the task title.");
//       startListening();
//     }
//   }, [isOpen]);

//   const toggleAssistant = () => {
//     if (isOpen) {
//       resetAndClose();
//     } else {
//       setIsOpen(true);
//       speak("Please provide the task title.");
//       startListening();
//     }
//   };

//   const resetAndClose = () => {
//     setIsOpen(false);
//     setIsProcessing(false);
//     setStep("title");
//     setTaskData({
//       title: "",
//       description: "",
//       note: "",
//       timestamp: new Date().getTime(),
//       alert: false,
//       alertMinutes: 5,
//       status: false,
//       notified: false,
//       userId,
//     });
//     setAiEnhancedOptions([]);
//     setUserInput("");
//     setAwaitingConfirmation(false);
//     setError("");
//     window.speechSynthesis.cancel();
//     stopListening();
//     resetTranscript();
//   };

//   const skipNote = () => {
//     setTaskData((prev) => ({ ...prev, note: "" }));
//     setStep("date");
//     setAwaitingConfirmation(false);
//     setUserInput("");
//     setAiEnhancedOptions([]);
//     speak("Please provide a future task date, like 'January 1, 2026'.");
//     startListening();
//   };

//   return (
//     <div className="fixed bottom-20 right-2 z-50">
  

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             variants={sheetVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             style={{
//               width: "100%",
//               maxWidth: "600px",
//               position: "fixed",
//               bottom: 0,
//               right: 0,
//               left: 0,
//               margin: "auto",
//             }}
//           >
//             <Box
//               sx={{
//                 width: "100%",
//                 bgcolor: "background.paper",
//                 borderRadius: "16px 16px 0 0",
//                 border: "1px solid",
//                 borderColor: "grey.200",
//                 maxHeight: "80vh",
//                 display: "flex",
//                 flexDirection: "column",
//                 overflowY: "auto",
//                 p: 2,
//               }}
//             >
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="subtitle1" fontWeight="medium">
//                   Voice Task Creation
//                 </Typography>
//                 <IconButton onClick={resetAndClose}>
//                   <IoClose size={24} />
//                 </IconButton>
//               </Box>

//               <Box
//                 sx={{
//                   flex: 1,
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: 2,
//                 }}
//               >
//                 {(transcript || interimTranscript) && (
//                   <Typography variant="body2">
//                     You said: {interimTranscript || transcript}
//                   </Typography>
//                 )}
//                 {aiEnhancedOptions.length > 0 && (
//                   <Box>
//                     <Typography variant="body2">Enhanced Options:</Typography>
//                     {aiEnhancedOptions.map((opt, idx) => (
//                       <Typography key={idx} variant="body2">
//                         {idx + 1}. {opt}
//                       </Typography>
//                     ))}
//                   </Box>
//                 )}
//                 {error && (
//                   <Typography variant="body2" color="error">
//                     {error}
//                   </Typography>
//                 )}
//                 {awaitingConfirmation && (
//                   <Box
//                     sx={{ display: "flex", flexDirection: "column", gap: 1 }}
//                   >
//                     <TextField
//                       fullWidth
//                       label={`Edit ${step}`}
//                       value={userInput || aiEnhancedOptions[0] || ""}
//                       onChange={(e) => setUserInput(e.target.value)}
//                       variant="outlined"
//                     />
//                     <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//                       <Button
//                         variant="contained"
//                         onClick={() => handleConfirmation("confirm")}
//                         startIcon={<FaCheckCircle />}
//                       >
//                         Confirm
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         onClick={() => handleConfirmation("change")}
//                       >
//                         Change
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         onClick={() => handleConfirmation("enhance")}
//                         disabled={isProcessing}
//                       >
//                         Enhance
//                       </Button>
//                       {aiEnhancedOptions.length > 0 && (
//                         <>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("select 1")}
//                           >
//                             Select 1
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("select 2")}
//                           >
//                             Select 2
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("select 3")}
//                           >
//                             Select 3
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("use original")}
//                           >
//                             Use Original
//                           </Button>
//                         </>
//                       )}
//                       {step === "note" && (
//                         <Button
//                           variant="outlined"
//                           onClick={skipNote}
//                           disabled={isProcessing}
//                         >
//                           Skip
//                         </Button>
//                       )}
//                       <Button
//                         variant="outlined"
//                         onClick={resetAndClose}
//                         disabled={isProcessing}
//                       >
//                         Cancel
//                       </Button>
//                     </Box>
//                   </Box>
//                 )}
//                 {isProcessing && <CircularProgress size={24} />}
//                 {isProcessing && (
//                   <Typography variant="body2" sx={{ mt: 1 }}>
//                     Processing...
//                   </Typography>
//                 )}
//                 {step === "confirm" && !awaitingConfirmation && (
//                   <Box sx={{ display: "flex", gap: 1 }}>
//                     <Button
//                       variant="contained"
//                       onClick={() => handleConfirmation("confirm")}
//                       startIcon={<FaCheckCircle />}
//                     >
//                       Save Task
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       onClick={resetAndClose}
//                     >
//                       Cancel
//                     </Button>
//                   </Box>
//                 )}
//               </Box>
//             </Box>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default VoiceAssistantSheet;



// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { FaMicrophone, FaStopCircle, FaCheckCircle } from "react-icons/fa";
// import { IoClose } from "react-icons/io5";
// import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
// import { GEMINI_KEY } from "../../env";
// import { Box, Typography, Button, IconButton, TextField, CircularProgress } from "@mui/material";
// import moment from "moment";
// import { sheetVariants, keywordActions, cleanResponseText } from '../utils/index';

// const VoiceAssistantSheet = ({ onSubmit, userId, isOpen, setIsOpen }) => {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [step, setStep] = useState("title");
//   const [taskData, setTaskData] = useState({
//     title: "",
//     description: "",
//     note: "",
//     timestamp: new Date().getTime(),
//     alert: true,
//     alertMinutes: 5,
//     status: false,
//     notified: false,
//     userId,
//   });
//   const [aiEnhancedOptions, setAiEnhancedOptions] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
//   const [error, setError] = useState("");
//   const [permissionGranted, setPermissionGranted] = useState(null);
//   const transcriptTimeoutRef = useRef(null);

//   const {
//     transcript,
//     interimTranscript,
//     finalTranscript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition,
//     isMicrophoneAvailable,
//   } = useSpeechRecognition({
//     clearTranscriptOnListen: false,
//   });

//   const requestMicPermission = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       stream.getTracks().forEach(track => track.stop());
//       setPermissionGranted(true);
//       console.log("Microphone permission granted");
//     } catch (err) {
//       console.error("Microphone permission denied:", err);
//       setPermissionGranted(false);
//       setError("Microphone access is required. Please allow microphone permissions.");
//     }
//   };

//   const speak = (text) => {
//     if (!text) return;
//     setIsProcessing(true);
//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     const voices = window.speechSynthesis.getVoices();
//     utterance.voice =
//       voices.find((v) => v.lang === "en-US" && /male|david|michael/i.test(v.name)) ||
//       voices.find((v) => v.lang === "en-US");

//     utterance.rate = 1.0;
//     utterance.pitch = 1.2;

//     utterance.onend = () => {
//       setIsProcessing(false);
//     };

//     utterance.onerror = () => {
//       setIsProcessing(false);
//     };

//     window.speechSynthesis.speak(utterance);
//   };

//   const enhanceText = async (inputText, context) => {
//     setIsProcessing(true);
//     try {
//       const prompt = `Enhance the following ${context} for a task. Provide exactly 3 clear, concise, and professional options in a numbered list (1., 2., 3.). Return only the numbered list with the enhanced sentences, no additional text or explanation.\n\n${inputText}`;
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 5000);
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [{ role: "user", parts: [{ text: prompt }] }],
//           }),
//           signal: controller.signal,
//         }
//       );
//       clearTimeout(timeoutId);
//       const data = await res.json();
//       const enhancedText = cleanResponseText(
//         data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
//       );
//       const options = enhancedText
//         .split("\n")
//         .map((line) => line.replace(/^\d+\.\s*/, "").trim())
//         .filter((line) => line);
//       setIsProcessing(false);
//       return options.length === 3 ? options : [inputText];
//     } catch (err) {
//       console.error("Gemini error:", err);
//       setIsProcessing(false);
//       return [inputText];
//     }
//   };

//   useEffect(() => {
//     requestMicPermission();
//     if (!browserSupportsSpeechRecognition) {
//       setError("Speech recognition is not supported in this browser.");
//     }
//   }, [browserSupportsSpeechRecognition]);

//   useEffect(() => {
//     if (finalTranscript && !isProcessing) {
//       if (transcriptTimeoutRef.current) {
//         clearTimeout(transcriptTimeoutRef.current);
//       }

//       transcriptTimeoutRef.current = setTimeout(() => {
//         const spoken = finalTranscript.trim();
//         if (spoken) {
//           setUserInput(spoken);
//           if (awaitingConfirmation) {
//             handleConfirmation(spoken.toLowerCase());
//           } else {
//             processInput(spoken);
//           }
//           resetTranscript();
//         }
//       }, 3000);
//     }

//     return () => {
//       if (transcriptTimeoutRef.current) {
//         clearTimeout(transcriptTimeoutRef.current);
//       }
//     };
//   }, [finalTranscript, isProcessing, awaitingConfirmation]);

//   const startListening = async () => {
//     if (isProcessing || listening || !browserSupportsSpeechRecognition || permissionGranted === false) {
//       setError(
//         !browserSupportsSpeechRecognition
//           ? "Speech recognition is not supported."
//           : permissionGranted === false
//           ? "Microphone access is blocked. Please allow permissions."
//           : "Processing or already listening."
//       );
//       console.log("Cannot start listening:", { isProcessing, listening, browserSupportsSpeechRecognition, permissionGranted });
//       return;
//     }
//     try {
//       await SpeechRecognition.startListening({ continuous: true, language: "en-US", interimResults: true });
//       console.log("Speech recognition started");
//     } catch (err) {
//       console.error("Error starting speech recognition:", err);
//       setError("Failed to start speech recognition.");
//     }
//   };

//   const stopListening = () => {
//     SpeechRecognition.stopListening();
//     if (transcriptTimeoutRef.current) {
//       clearTimeout(transcriptTimeoutRef.current);
//     }
//     console.log("Speech recognition stopped");
//   };

//   const handleMicPress = async (e) => {
//     e.preventDefault();
//     console.log("Microphone pressed");

//     if (permissionGranted === null) {
//       await requestMicPermission(); // Recheck permission in gesture
//     }

//     startListening();
//   };

//   const handleMicRelease = (e) => {
//     e.preventDefault();
//     console.log("Microphone released");
//     stopListening();
//   };

//   const checkForKeywords = (input) => {
//     const lowerInput = input.toLowerCase();
//     for (const [action, keywords] of Object.entries(keywordActions)) {
//       for (const keyword of keywords) {
//         if (lowerInput === keyword || lowerInput.includes(` ${keyword} `)) {
//           return { action, keyword };
//         }
//       }
//     }
//     return null;
//   };

//   const processInput = async (input) => {
//     console.log("Processing input:", input);
//     const keywordMatch = checkForKeywords(input);
//     if (keywordMatch) {
//       const { action, keyword } = keywordMatch;
//       switch (action) {
//         case "confirm":
//           if (step === "confirm") {
//             handleFinalSubmit();
//             resetAndClose();
//           } else {
//             confirmInput(userInput || aiEnhancedOptions[0] || input);
//           }
//           return;
//         case "change":
//           await speak(`Please provide the ${step} again. Hold the microphone button to speak.`);
//           setUserInput("");
//           setAiEnhancedOptions([]);
//           setAwaitingConfirmation(false);
//           return;
//         case "enhance":
//           await handleEnhance();
//           return;
//         case "original":
//           confirmInput(userInput);
//           return;
//         case "select":
//           const numMatch = input.match(/\d+/);
//           if (numMatch) {
//             const num = parseInt(numMatch[0]) - 1;
//             if (num >= 0 && num < aiEnhancedOptions.length) {
//               confirmInput(aiEnhancedOptions[num]);
//               return;
//             }
//           }
//           await speak("Invalid selection. Please say 'select one', 'select two', or 'select three'. Hold the microphone button to speak.");
//           return;
//         case "skip":
//           if (step === "note") {
//             skipNote();
//           } else {
//             await speak("Skip is only available for notes. Please provide the current input. Hold the microphone button to speak.");
//           }
//           return;
//         case "cancel":
//           resetAndClose();
//           return;
//         default:
//           break;
//       }
//     }

//     if (step === "date") {
//       const normalizedInput = input.replace(/\s+/g, " ").trim();
//       const dateFormats = [
//         "MMMM D YYYY", "MMMM D, YYYY", "MM/DD/YYYY", "MM-DD-YYYY", "YYYY-MM-DD",
//         "MMM D YYYY", "MMM D, YYYY", "D MMMM YYYY", "D MMM YYYY",
//         "MMMM YYYY", "MMM YYYY", "YYYY MMMM", "YYYY MMM",
//       ];
//       let parsedDate = moment(normalizedInput, dateFormats, false);
//       if (!parsedDate.isValid()) {
//         parsedDate = moment(normalizedInput);
//       }
//       const now = moment();
//       if (parsedDate.isValid()) {
//         if (!normalizedInput.match(/\d{1,2}/)) {
//           parsedDate = parsedDate.startOf("month");
//         }
//         if (parsedDate.isAfter(now)) {
//           setTaskData((prev) => ({
//             ...prev,
//             timestamp: new Date(prev.timestamp).setFullYear(
//               parsedDate.year(),
//               parsedDate.month(),
//               parsedDate.date()
//             ),
//           }));
//           await speak(`Date set to ${parsedDate.format("MMMM D, YYYY")}. Would you like to confirm, change, or enhance it? Hold the microphone button to speak.`);
//           setAwaitingConfirmation(true);
//         } else {
//           setError("Please select a future date, like 'May 1, 2025'.");
//           await speak("Please select a future date, like 'May 1, 2025'. Hold the microphone button to speak.");
//         }
//       } else {
//         setError("Invalid date format. Please say a date like 'May 1, 2025' or 'January 2026'.");
//         await speak("Invalid date format. Please say a date like 'May 1, 2025' or 'January 2026'. Hold the microphone button to speak.");
//       }
//     } else if (step === "time") {
//       const parsedTime = moment(input, ["h:mm A", "HH:mm"], true);
//       const now = moment();
//       if (parsedTime.isValid()) {
//         const combinedDateTime = moment(taskData.timestamp).set({
//           hour: parsedTime.hours(),
//           minute: parsedTime.minutes(),
//         });
//         if (combinedDateTime.isAfter(now)) {
//           setTaskData((prev) => ({
//             ...prev,
//             timestamp: combinedDateTime.valueOf(),
//           }));
//           await speak(`Time set to ${parsedTime.format("h:mm A")}. Would you like to confirm, change, or enhance it? Hold the microphone button to speak.`);
//           setAwaitingConfirmation(true);
//         } else {
//           setError("Please select a future time.");
//           await speak("Please select a future time. Hold the microphone button to speak.");
//         }
//       } else {
//         setError("Invalid time format. Please say a time like '2:30 PM'.");
//         await speak("Invalid time format. Please say a time like '2:30 PM'. Hold the microphone button to speak.");
//       }
//     } else {
//       const context =
//         step === "title" ? "task title" : step === "description" ? "task description" : "task note";
//       setUserInput(input);
//       await speak(`You said: ${input}. Would you like to confirm, change, or enhance this ${context}? Hold the microphone button to speak.`);
//       setAwaitingConfirmation(true);
//     }
//   };

//   const handleEnhance = async () => {
//     const context =
//       step === "title" ? "task title" : step === "description" ? "task description" : "task note";
//     const options = await enhanceText(userInput, context);
//     setAiEnhancedOptions(options);
//     await speak(
//       `"${options[0]}"\n"${options[1]}"\n"${options[2]}"\nSay 'select one', 'select two', or 'select three' to choose an option, or 'use original' to keep your input. Hold the microphone button to speak.`
//     );
//     setAwaitingConfirmation(true);
//   };

//   const handleConfirmation = async (input) => {
//     const keywordMatch = checkForKeywords(input);
//     if (keywordMatch) {
//       const { action, keyword } = keywordMatch;
//       switch (action) {
//         case "confirm":
//           if (step === "confirm") {
//             handleFinalSubmit();
//             resetAndClose();
//           } else {
//             confirmInput(userInput || aiEnhancedOptions[0] || "");
//           }
//           return;
//         case "change":
//           await speak(`Please provide the ${step} again. Hold the microphone button to speak.`);
//           setUserInput("");
//           setAiEnhancedOptions([]);
//           setAwaitingConfirmation(false);
//           return;
//         case "enhance":
//           await handleEnhance();
//           return;
//         case "original":
//           confirmInput(userInput);
//           return;
//         case "select":
//           const numMatch = input.match(/\d+/);
//           if (numMatch) {
//             const num = parseInt(numMatch[0]) - 1;
//             if (num >= 0 && num < aiEnhancedOptions.length) {
//               confirmInput(aiEnhancedOptions[num]);
//               return;
//             }
//           }
//           await speak("Invalid selection. Please say 'select one', 'select two', or 'select three'. Hold the microphone button to speak.");
//           return;
//         case "skip":
//           if (step === "note") {
//             skipNote();
//           } else {
//             await speak("Skip is only available for notes. Please provide the current input. Hold the microphone button to speak.");
//           }
//           return;
//         case "cancel":
//           resetAndClose();
//           return;
//         default:
//           break;
//       }
//     }

//     await speak(
//       step === "confirm"
//         ? "Please say 'confirm' to save or 'cancel' to discard. Hold the microphone button to speak."
//         : "Please say 'confirm', 'change', 'enhance', 'select [number]', or 'use original'. Hold the microphone button to speak."
//     );
//   };

//   const handleFinalSubmit = () => {
//     if (!onSubmit || typeof onSubmit !== 'function') {
//       console.error("onSubmit is not a function or is undefined");
//       return;
//     }
//     const formattedTaskData = {
//       title: taskData.title,
//       timestamp: taskData.timestamp,
//       description: taskData.description,
//       note: taskData.note,
//       alert: taskData.alert,
//       notified: taskData.notified,
//       alertMinutes: taskData.alert ? taskData.alertMinutes : 0,
//       status: taskData.status,
//       userId: taskData.userId,
//     };
//     onSubmit(formattedTaskData);
//   };

//   const confirmInput = (input) => {
//     setTaskData((prev) => ({ ...prev, [step]: input }));
//     setAwaitingConfirmation(false);
//     setUserInput("");
//     setAiEnhancedOptions([]);
//     moveToNextStep();
//   };

//   const moveToNextStep = async () => {
//     if (step === "title") {
//       setStep("description");
//       await speak("Please provide the task description. Hold the microphone button to speak.");
//     } else if (step === "description") {
//       setStep("note");
//       await speak("Please provide any additional notes, or say 'skip' to proceed. Hold the microphone button to speak.");
//     } else if (step === "note") {
//       setStep("date");
//       await speak("Please provide a future task date, like 'January 1, 2026'. Hold the microphone button to speak.");
//     } else if (step === "date") {
//       setStep("time");
//       await speak("Please provide a future task time, like '2:30 PM'. Hold the microphone button to speak.");
//     } else if (step === "time") {
//       setStep("confirm");
//       await summarizeTask();
//     }
//   };

//   const summarizeTask = async () => {
//     const dateTime = moment(taskData.timestamp).format("MMMM D, YYYY [at] h:mm A");
//     const alertText = taskData.alert
//       ? `Alert set for ${taskData.alertMinutes} minutes before.`
//       : "No alert set.";
//     await speak(
//       `Task summary: Title: ${taskData.title}, Description: ${
//         taskData.description
//       }, Note: ${
//         taskData.note || "None"
//       }, Date and Time: ${dateTime}, ${alertText}. Say 'confirm' to save or 'cancel' to discard. Hold the microphone button to speak.`
//     );
//   };

//   useEffect(() => {
//     if (isOpen && permissionGranted) {
//       speak("Please provide the task title. Hold the microphone button to speak.");
//     }
//     return () => stopListening();
//   }, [isOpen, permissionGranted]);

//   const resetAndClose = () => {
//     setIsOpen(false);
//     setIsProcessing(false);
//     setStep("title");
//     setTaskData({
//       title: "",
//       description: "",
//       note: "",
//       timestamp: new Date().getTime(),
//       alert: true,
//       alertMinutes: 5,
//       status: false,
//       notified: false,
//       userId,
//     });
//     setAiEnhancedOptions([]);
//     setUserInput("");
//     setAwaitingConfirmation(false);
//     setError("");
//     window.speechSynthesis.cancel();
//     stopListening();
//     resetTranscript();
//   };

//   const skipNote = () => {
//     setTaskData((prev) => ({ ...prev, note: "" }));
//     setStep("date");
//     setAwaitingConfirmation(false);
//     setUserInput("");
//     setAiEnhancedOptions([]);
//     speak("Please provide a future task date, like 'January 1, 2026'. Hold the microphone button to speak.");
//   };

//   return (
//     <div className="fixed bottom-20 right-2 z-50">
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             variants={sheetVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             style={{
//               width: "100%",
//               maxWidth: "600px",
//               position: "fixed",
//               bottom: 0,
//               right: 0,
//               left: 0,
//               margin: "auto",
//             }}
//           >
//             <Box
//               sx={{
//                 width: "100%",
//                 bgcolor: "background.paper",
//                 borderRadius: "16px 16px 0 0",
//                 border: "1px solid",
//                 borderColor: "grey.200",
//                 maxHeight: "80vh",
//                 display: "flex",
//                 flexDirection: "column",
//                 overflowY: "auto",
//                 p: 2,
//               }}
//             >
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="subtitle1" fontWeight="medium">
//                   Voice Task Creation
//                 </Typography>
//                 <IconButton onClick={resetAndClose}>
//                   <IoClose size={24} />
//                 </IconButton>
//               </Box>

//               <Box
//                 sx={{
//                   flex: 1,
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: 2,
//                   alignItems: "center",
//                 }}
//               >
//                 {permissionGranted === false ? (
//                   <Typography variant="body2" color="error">
//                     Microphone access is required. Please allow permissions in your browser settings.
//                   </Typography>
//                 ) : (
//                   <>
//                     <motion.div
//                       onMouseDown={handleMicPress}
//                       onMouseUp={handleMicRelease}
//                       onTouchStart={handleMicPress}
//                       onTouchEnd={handleMicRelease}
//                       onTouchCancel={handleMicRelease}
//                       style={{
//                         width: 60,
//                         height: 60,
//                         borderRadius: "50%",
//                         backgroundColor: listening ? "#3b82f6" : "#e5e7eb",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         cursor: "pointer",
//                         boxShadow: listening ? "0 0 10px rgba(59, 130, 246, 0.5)" : "none",
//                         touchAction: "none",
//                       }}
//                       animate={listening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
//                       transition={listening ? { repeat: Infinity, duration: 0.8 } : {}}
//                     >
//                       <FaMicrophone size={24} color={listening ? "#fff" : "#4b5563"} />
//                     </motion.div>
//                     <Typography variant="body2">
//                       {listening ? "Listening..." : permissionGranted === null ? "Checking microphone access..." : "Hold the microphone to speak"}
//                     </Typography>

//                     {(transcript || interimTranscript) && (
//                       <Typography variant="body2">
//                         You said: {interimTranscript || transcript}
//                       </Typography>
//                     )}
//                     {aiEnhancedOptions.length > 0 && (
//                       <Box>
//                         <Typography variant="body2">Enhanced Options:</Typography>
//                         {aiEnhancedOptions.map((opt, idx) => (
//                           <Typography key={idx} variant="body2">
//                             {idx + 1}. {opt}
//                           </Typography>
//                         ))}
//                       </Box>
//                     )}
//                     {error && (
//                       <Typography variant="body2" color="error">
//                         {error}
//                       </Typography>
//                     )}
//                     {awaitingConfirmation && (
//                       <Box
//                         sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}
//                       >
//                         <TextField
//                           fullWidth
//                           label={`Edit ${step}`}
//                           value={userInput || aiEnhancedOptions[0] || ""}
//                           onChange={(e) => setUserInput(e.target.value)}
//                           variant="outlined"
//                         />
//                         <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//                           <Button
//                             variant="contained"
//                             onClick={() => handleConfirmation("confirm")}
//                             startIcon={<FaCheckCircle />}
//                           >
//                             Confirm
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("change")}
//                           >
//                             Change
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             onClick={() => handleConfirmation("enhance")}
//                             disabled={isProcessing}
//                           >
//                             Enhance
//                           </Button>
//                           {aiEnhancedOptions.length > 0 && (
//                             <>
//                               <Button
//                                 variant="outlined"
//                                 onClick={() => handleConfirmation("select 1")}
//                               >
//                                 Select 1
//                               </Button>
//                               <Button
//                                 variant="outlined"
//                                 onClick={() => handleConfirmation("select 2")}
//                               >
//                                 Select 2
//                               </Button>
//                               <Button
//                                 variant="outlined"
//                                 onClick={() => handleConfirmation("select 3")}
//                               >
//                                 Select 3
//                               </Button>
//                               <Button
//                                 variant="outlined"
//                                 onClick={() => handleConfirmation("use original")}
//                               >
//                                 Use Original
//                               </Button>
//                             </>
//                           )}
//                           {step === "note" && (
//                             <Button
//                               variant="outlined"
//                               onClick={skipNote}
//                               disabled={isProcessing}
//                             >
//                               Skip
//                             </Button>
//                           )}
//                           <Button
//                             variant="outlined"
//                             onClick={resetAndClose}
//                             disabled={isProcessing}
//                           >
//                             Cancel
//                           </Button>
//                         </Box>
//                       </Box>
//                     )}
//                     {isProcessing && <CircularProgress size={24} />}
//                     {isProcessing && (
//                       <Typography variant="body2" sx={{ mt: 1 }}>
//                         Processing...
//                       </Typography>
//                     )}
//                     {step === "confirm" && !awaitingConfirmation && (
//                       <Box sx={{ display: "flex", gap: 1 }}>
//                         <Button
//                           variant="contained"
//                           onClick={() => handleConfirmation("confirm")}
//                           startIcon={<FaCheckCircle />}
//                         >
//                           Save Task
//                         </Button>
//                         <Button
//                           variant="outlined"
//                           onClick={resetAndClose}
//                         >
//                           Cancel
//                         </Button>
//                       </Box>
//                     )}
//                   </>
//                 )}
//               </Box>
//             </Box>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default VoiceAssistantSheet;


import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone, FaCheckCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { GEMINI_KEY } from "../../env";
import { Box, Typography, Button, IconButton, TextField, CircularProgress } from "@mui/material";
import moment from "moment";
import { sheetVariants, keywordActions, cleanResponseText } from '../utils/index';

const VoiceAssistantSheet = ({ onSubmit, userId, isOpen, setIsOpen }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState("title");
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    note: "",
    timestamp: new Date().getTime(),
    alert: true,
    alertMinutes: 5,
    status: false,
    notified: false,
    userId,
  });
  const [aiEnhancedOptions, setAiEnhancedOptions] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const transcriptTimeoutRef = useRef(null);
  const hasRequestedPermission = useRef(false);

  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({
    clearTranscriptOnListen: false,
  });

  const requestMicPermission = async () => {
    if (hasRequestedPermission.current) return;
    hasRequestedPermission.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      console.log("Microphone permission granted");
    } catch (err) {
      console.error("Microphone permission denied:", err);
      setPermissionGranted(false);
      setError("Microphone access is required. Please allow microphone permissions.");
    }
  };

  const speak = (text) => {
    if (!text) return;
  setIsProcessing(true);
  setIsSpeaking(true);

  stopListening(); // Fully stop the mic

  window.speechSynthesis.cancel(); // Clear any pending utterances

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Prioritize Google US English male voice, then other male voices
    utterance.voice =
      voices.find((v) => v.name.includes("Google US English") && v.lang === "en-US") ||
      voices.find((v) => v.lang === "en-US" && /male|david|michael|mark/i.test(v.name)) ||
      voices.find((v) => v.lang === "en-US");

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsProcessing(false);
      setIsSpeaking(false);

     
  };
    

    utterance.onerror = () => {
      setIsProcessing(false);
      setIsSpeaking(false);
    };

    // Ensure voices are loaded
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = window.speechSynthesis.getVoices();
        utterance.voice =
          updatedVoices.find((v) => v.name.includes("Google US English") && v.lang === "en-US") ||
          updatedVoices.find((v) => v.lang === "en-US" && /male|david|michael|mark/i.test(v.name)) ||
          updatedVoices.find((v) => v.lang === "en-US");
        window.speechSynthesis.speak(utterance);
      };
    } else {
      window.speechSynthesis.speak(utterance);
    }
  };

  const enhanceText = async (inputText, context) => {
    setIsProcessing(true);
    try {
      const prompt = `Enhance the following ${context} for a task. Provide exactly 3 clear, concise, and professional options in a numbered list (1., 2., 3.). Return only the numbered list with the enhanced sentences, no additional text or explanation.\n\n${inputText}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      const data = await res.json();
      const enhancedText = cleanResponseText(
        data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
      );
      const options = enhancedText
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter((line) => line);
      setIsProcessing(false);
      return options.length === 3 ? options : [inputText];
    } catch (err) {
      console.error("Gemini error:", err);
      setIsProcessing(false);
      return [inputText];
    }
  };

  useEffect(() => {
    requestMicPermission();
    if (!browserSupportsSpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (finalTranscript && !isProcessing && !isSpeaking) {
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }

      transcriptTimeoutRef.current = setTimeout(() => {
        const spoken = finalTranscript.trim();
        if (spoken) {
          setUserInput(spoken);
          if (awaitingConfirmation) {
            handleConfirmation(spoken.toLowerCase());
          } else {
            processInput(spoken);
          }
          resetTranscript();
        }
      }, 3000);
    }

    return () => {
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }
    };
  }, [finalTranscript, isProcessing, awaitingConfirmation, isSpeaking]);

  const startListening = async () => {
    if (isProcessing || listening || !browserSupportsSpeechRecognition || permissionGranted === false || isSpeaking) {
      setError(
        !browserSupportsSpeechRecognition
          ? "Speech recognition is not supported."
          : permissionGranted === false
          ? "Microphone access is blocked. Please allow permissions."
          : isSpeaking
          ? "Please wait until the prompt is finished."
          : "Processing or already listening."
      );
      console.log("Cannot start listening:", { isProcessing, listening, browserSupportsSpeechRecognition, permissionGranted, isSpeaking });
      return;
    }
    try {
      await SpeechRecognition.startListening({ continuous: true, language: "en-US", interimResults: true });
      console.log("Speech recognition started");
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setError("Failed to start speech recognition.");
    }

    console.log("Listening state:", {
  isProcessing,
  isSpeaking,
  listening,
  permissionGranted,
  browserSupportsSpeechRecognition,
});

  };

  const stopListening = () => {
  SpeechRecognition.stopListening();
  if (transcriptTimeoutRef.current) {
    clearTimeout(transcriptTimeoutRef.current);
  }
  console.log("Speech recognition stopped");

  console.log("Listening state:", {
  isProcessing,
  isSpeaking,
  listening,
  permissionGranted,
  browserSupportsSpeechRecognition,
});

};


const handleMicPress = async (e) => {
  e.preventDefault();
  console.log("Microphone pressed");

  if (permissionGranted === null && !hasRequestedPermission.current) {
    await requestMicPermission();
  }

  // Don't allow starting mic if system is speaking
  if (isSpeaking) {
    console.log("Speech synthesis in progress, mic won't start.");
    return;
  }

  startListening();
};

const handleMicRelease = (e) => {
  e.preventDefault();
  console.log("Microphone released");

  stopListening();
};



  const checkForKeywords = (input) => {
    const lowerInput = input.toLowerCase();
    for (const [action, keywords] of Object.entries(keywordActions)) {
      for (const keyword of keywords) {
        if (lowerInput === keyword || lowerInput.includes(` ${keyword} `)) {
          return { action, keyword };
        }
      }
    }
    return null;
  };

  const processInput = async (input) => {
    console.log("Processing input:", input);
    const keywordMatch = checkForKeywords(input);
    if (keywordMatch) {
      const { action, keyword } = keywordMatch;
      switch (action) {
        case "confirm":
          if (step === "confirm") {
            handleFinalSubmit();
            resetAndClose();
          } else {
            confirmInput(userInput || aiEnhancedOptions[0] || input);
          }
          return;
        case "change":
          await speak(`Please provide the ${step} again. Hold the microphone button to speak.`);
          setUserInput("");
          setAiEnhancedOptions([]);
          setAwaitingConfirmation(false);
          return;
        case "enhance":
          await handleEnhance();
          return;
        case "original":
          confirmInput(userInput);
          return;
        case "select":
          const numMatch = input.match(/\d+/);
          if (numMatch) {
            const num = parseInt(numMatch[0]) - 1;
            if (num >= 0 && num < aiEnhancedOptions.length) {
              confirmInput(aiEnhancedOptions[num]);
              return;
            }
          }
          await speak("Invalid selection. Please say 'select one', 'select two', or 'select three'. Hold the microphone button to speak.");
          return;
        case "skip":
          if (step === "note") {
            skipNote();
          } else {
            await speak("Skip is only available for notes. Please provide the current input. Hold the microphone button to speak.");
          }
          return;
        case "cancel":
          resetAndClose();
          return;
        default:
          break;
      }
    }

    if (step === "date") {
      const normalizedInput = input.replace(/\s+/g, " ").trim();
      const dateFormats = [
        "MMMM D YYYY", "MMMM D, YYYY", "MM/DD/YYYY", "MM-DD-YYYY", "YYYY-MM-DD",
        "MMM D YYYY", "MMM D, YYYY", "D MMMM YYYY", "D MMM YYYY",
        "MMMM YYYY", "MMM YYYY", "YYYY MMMM", "YYYY MMM",
      ];
      let parsedDate = moment(normalizedInput, dateFormats, false);
      if (!parsedDate.isValid()) {
        parsedDate = moment(normalizedInput);
      }
      const now = moment();
      if (parsedDate.isValid()) {
        if (!normalizedInput.match(/\d{1,2}/)) {
          parsedDate = parsedDate.startOf("month");
        }
        if (parsedDate.isAfter(now)) {
          setTaskData((prev) => ({
            ...prev,
            timestamp: new Date(prev.timestamp).setFullYear(
              parsedDate.year(),
              parsedDate.month(),
              parsedDate.date()
            ),
          }));
          await speak(`Date set to ${parsedDate.format("MMMM D, YYYY")}. Would you like to confirm, change, or enhance it? Hold the microphone button to speak.`);
          setAwaitingConfirmation(true);
        } else {
          setError("Please select a future date, like 'May 1, 2025'.");
          await speak("Please select a future date, like 'May 1, 2025'. Hold the microphone button to speak.");
        }
      } else {
        setError("Invalid date format. Please say a date like 'May 1, 2025' or 'January 2026'.");
        await speak("Invalid date format. Please say a date like 'May 1, 2025' or 'January 2026'. Hold the microphone button to speak.");
      }
    } else if (step === "time") {
      const parsedTime = moment(input, ["h:mm A", "HH:mm"], true);
      const now = moment();
      if (parsedTime.isValid()) {
        const combinedDateTime = moment(taskData.timestamp).set({
          hour: parsedTime.hours(),
          minute: parsedTime.minutes(),
        });
        if (combinedDateTime.isAfter(now)) {
          setTaskData((prev) => ({
            ...prev,
            timestamp: combinedDateTime.valueOf(),
          }));
          await speak(`Time set to ${parsedTime.format("h:mm A")}. Would you like to confirm, change, or enhance it? Hold the microphone button to speak.`);
          setAwaitingConfirmation(true);
        } else {
          setError("Please select a future time.");
          await speak("Please select a future time. Hold the microphone button to speak.");
        }
      } else {
        setError("Invalid time format. Please say a time like '2:30 PM'.");
        await speak("Invalid time format. Please say a time like '2:30 PM'. Hold the microphone button to speak.");
      }
    } else {
      const context =
        step === "title" ? "task title" : step === "description" ? "task description" : "task note";
      setUserInput(input);
      await speak(`You said: ${input}. Would you like to confirm, change, or enhance this ${context}? Hold the microphone button to speak.`);
      setAwaitingConfirmation(true);
    }
  };

  const handleEnhance = async () => {
    const context =
      step === "title" ? "task title" : step === "description" ? "task description" : "task note";
    const options = await enhanceText(userInput, context);
    setAiEnhancedOptions(options);
    await speak(
      `"${options[0]}"\n"${options[1]}"\n"${options[2]}"\nSay 'select one', 'select two', or 'select three' to choose an option, or 'use original' to keep your input. Hold the microphone button to speak.`
    );
    setAwaitingConfirmation(true);
  };

  const handleConfirmation = async (input) => {
    const keywordMatch = checkForKeywords(input);
    if (keywordMatch) {
      const { action, keyword } = keywordMatch;
      switch (action) {
        case "confirm":
          if (step === "confirm") {
            handleFinalSubmit();
            resetAndClose();
          } else {
            confirmInput(userInput || aiEnhancedOptions[0] || "");
          }
          return;
        case "change":
          await speak(`Please provide the ${step} again. Hold the microphone button to speak.`);
          setUserInput("");
          setAiEnhancedOptions([]);
          setAwaitingConfirmation(false);
          return;
        case "enhance":
          await handleEnhance();
          return;
        case "original":
          confirmInput(userInput);
          return;
        case "select":
          const numMatch = input.match(/\d+/);
          if (numMatch) {
            const num = parseInt(numMatch[0]) - 1;
            if (num >= 0 && num < aiEnhancedOptions.length) {
              confirmInput(aiEnhancedOptions[num]);
              return;
            }
          }
          await speak("Invalid selection. Please say 'select one', 'select two', or 'select three'. Hold the microphone button to speak.");
          return;
        case "skip":
          if (step === "note") {
            skipNote();
          } else {
            await speak("Skip is only available for notes. Please provide the current input. Hold the microphone button to speak.");
          }
          return;
        case "cancel":
          resetAndClose();
          return;
        default:
          break;
      }
    }

    await speak(
      step === "confirm"
        ? "Please say 'confirm' to save or 'cancel' to discard. Hold the microphone button to speak."
        : "Please say 'confirm', 'change', 'enhance', 'select [number]', or 'use original'. Hold the microphone button to speak."
    );
  };

  const handleFinalSubmit = () => {
    if (!onSubmit || typeof onSubmit !== 'function') {
      console.error("onSubmit is not a function or is undefined");
      return;
    }
    const formattedTaskData = {
      title: taskData.title,
      timestamp: taskData.timestamp,
      description: taskData.description,
      note: taskData.note,
      alert: taskData.alert,
      notified: taskData.notified,
      alertMinutes: taskData.alert ? taskData.alertMinutes : 0,
      status: taskData.status,
      userId: taskData.userId,
    };
    onSubmit(formattedTaskData);
  };

  const confirmInput = (input) => {
    setTaskData((prev) => ({ ...prev, [step]: input }));
    setAwaitingConfirmation(false);
    setUserInput("");
    setAiEnhancedOptions([]);
    moveToNextStep();
  };

  const moveToNextStep = async () => {
    if (step === "title") {
      setStep("description");
      await speak("Please provide the task description. Hold the microphone button to speak.");
    } else if (step === "description") {
      setStep("note");
      await speak("Please provide any additional notes, or say 'skip' to proceed. Hold the microphone button to speak.");
    } else if (step === "note") {
      setStep("date");
      await speak("Please provide a future task date, like 'January 1, 2026'. Hold the microphone button to speak.");
    } else if (step === "date") {
      setStep("time");
      await speak("Please provide a future task time, like '2:30 PM'. Hold the microphone button to speak.");
    } else if (step === "time") {
      setStep("confirm");
      await summarizeTask();
    }
  };

  const summarizeTask = async () => {
    const dateTime = moment(taskData.timestamp).format("MMMM D, YYYY [at] h:mm A");
    const alertText = taskData.alert
      ? `Alert set for ${taskData.alertMinutes} minutes before.`
      : "No alert set.";
    await speak(
      `Task summary: Title: ${taskData.title}, Description: ${
        taskData.description
      }, Note: ${
        taskData.note || "None"
      }, Date and Time: ${dateTime}, ${alertText}. Say 'confirm' to save or 'cancel' to discard. Hold the microphone button to speak.`
    );
  };

  useEffect(() => {
    if (isOpen && permissionGranted) {
      speak("Please provide the task title. Hold the microphone button to speak.");
    }
    return () => stopListening();
  }, [isOpen, permissionGranted]);

  const resetAndClose = () => {
    setIsOpen(false);
    setIsProcessing(false);
    setStep("title");
    setTaskData({
      title: "",
      description: "",
      note: "",
      timestamp: new Date().getTime(),
      alert: true,
      alertMinutes: 5,
      status: false,
      notified: false,
      userId,
    });
    setAiEnhancedOptions([]);
    setUserInput("");
    setAwaitingConfirmation(false);
    setError("");
    setIsSpeaking(false);
    window.speechSynthesis.cancel();
    stopListening();
    resetTranscript();
  };

  const skipNote = () => {
    setTaskData((prev) => ({ ...prev, note: "" }));
    setStep("date");
    setAwaitingConfirmation(false);
    setUserInput("");
    setAiEnhancedOptions([]);
    speak("Please provide a future task date, like 'January 1, 2026'. Hold the microphone button to speak.");
  };

  return (
    <div className="fixed bottom-20 right-2 z-50">
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

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                {permissionGranted === false ? (
                  <Typography variant="body2" color="error">
                    Microphone access is required. Please allow permissions in your browser settings.
                  </Typography>
                ) : (
                  <>
                    <motion.div
                       onMouseDown={handleMicPress}
  onTouchStart={handleMicPress}
  onMouseUp={handleMicRelease}
  onMouseMove={handleMicRelease}
  onMouseLeave={handleMicRelease}
  onTouchEnd={handleMicRelease}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: listening ? "#3b82f6" : "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: listening ? "0 0 10px rgba(59, 130, 246, 0.5)" : "none",
                        touchAction: "none",
                      }}
                      animate={listening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                      transition={listening ? { repeat: Infinity, duration: 0.8 } : {}}
                    >
                      <FaMicrophone size={24} color={listening ? "#fff" : "#4b5563"} />
                    </motion.div>
                    <Typography variant="body2">
                      {listening ? "Listening..." : permissionGranted === null ? "Checking microphone access..." : "Hold the microphone to speak"}
                    </Typography>

                    {(transcript || interimTranscript) && (
                      <Typography variant="body2">
                        You said: {interimTranscript || transcript}
                      </Typography>
                    )}
                    {aiEnhancedOptions.length > 0 && (
                      <Box>
                        <Typography variant="body2">Enhanced Options:</Typography>
                        {aiEnhancedOptions.map((opt, idx) => (
                          <Typography key={idx} variant="body2">
                            {idx + 1}. {opt}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    {error && (
                      <Typography variant="body2" color="error">
                        {error}
                      </Typography>
                    )}
                    {awaitingConfirmation && (
                      <Box
                        sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}
                      >
                        <TextField
                          fullWidth
                          label={`Edit ${step}`}
                          value={userInput || aiEnhancedOptions[0] || ""}
                          onChange={(e) => setUserInput(e.target.value)}
                          variant="outlined"
                        />
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          <Button
                            variant="contained"
                            onClick={() => handleConfirmation("confirm")}
                            startIcon={<FaCheckCircle />}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => handleConfirmation("change")}
                          >
                            Change
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => handleConfirmation("enhance")}
                            disabled={isProcessing}
                          >
                            Enhance
                          </Button>
                          {aiEnhancedOptions.length > 0 && (
                            <>
                              <Button
                                variant="outlined"
                                onClick={() => handleConfirmation("select 1")}
                              >
                                Select 1
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => handleConfirmation("select 2")}
                              >
                                Select 2
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => handleConfirmation("select 3")}
                              >
                                Select 3
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => handleConfirmation("use original")}
                              >
                                Use Original
                              </Button>
                            </>
                          )}
                          {step === "note" && (
                            <Button
                              variant="outlined"
                              onClick={skipNote}
                              disabled={isProcessing}
                            >
                              Skip
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            onClick={resetAndClose}
                            disabled={isProcessing}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    )}
                    {isProcessing && <CircularProgress size={24} />}
                    {isProcessing && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Processing...
                      </Typography>
                    )}
                    {step === "confirm" && !awaitingConfirmation && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={() => handleConfirmation("confirm")}
                          startIcon={<FaCheckCircle />}
                        >
                          Save Task
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={resetAndClose}
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}
                  </>
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