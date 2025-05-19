import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone, FaCheckCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { GEMINI_KEY } from "../../env";
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import moment from "moment";
import {
  sheetVariants,
  keywordActions,
  cleanResponseText,
} from "../utils/index";

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
  // const [aiEnhancedOptions, setAiEnhancedOptions] = useState([]);
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
      stream.getTracks().forEach((track) => track.stop());
      setPermissionGranted(true);
      console.log("Microphone permission granted");
    } catch (err) {
      console.error("Microphone permission denied:", err);
      setPermissionGranted(false);
      setError(
        "Microphone access is required. Please allow microphone permissions."
      );
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
    console.log("voices are", voices);
    // Prioritize Google US English male voice, then other male voices
    utterance.voice =
      voices.find(
        (v) => v.name.includes("Google US English") && v.lang === "en-US"
      ) ||
      voices.find(
        (v) => v.lang === "en-US" && /male|david|michael|mark/i.test(v.name)
      ) ||
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
          updatedVoices.find(
            (v) => v.name.includes("Google US English") && v.lang === "en-US"
          ) ||
          updatedVoices.find(
            (v) => v.lang === "en-US" && /male|david|michael|mark/i.test(v.name)
          ) ||
          updatedVoices.find((v) => v.lang === "en-US");
        window.speechSynthesis.speak(utterance);
      };
    } else {
      window.speechSynthesis.speak(utterance);
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
            setUserInput(spoken);
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
    if (
      isProcessing ||
      listening ||
      !browserSupportsSpeechRecognition ||
      permissionGranted === false ||
      isSpeaking
    ) {
      setError(
        !browserSupportsSpeechRecognition
          ? "Speech recognition is not supported."
          : permissionGranted === false
          ? "Microphone access is blocked. Please allow permissions."
          : isSpeaking
          ? "Please wait until the prompt is finished."
          : "Processing or already listening."
      );
      console.log("Cannot start listening:", {
        isProcessing,
        listening,
        browserSupportsSpeechRecognition,
        permissionGranted,
        isSpeaking,
      });
      return;
    }
    try {
      await SpeechRecognition.startListening({
        continuous: false,
        language: "en-US",
        interimResults: true,
      });
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
            confirmInput(userInput || input);
          }
          return;
        case "change":
          await speak(
            `Please provide the ${step} again. Hold the microphone button to speak.`
          );
          setUserInput("");
          setAiEnhancedOptions([]);
          setAwaitingConfirmation(false);
          return;

        case "original":
          confirmInput(userInput);
          return;

        case "skip":
          if (step === "note") {
            skipNote();
          } else {
            await speak(
              "Skip is only available for notes. Please provide the current input. Hold the microphone button to speak."
            );
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
        "MMMM D YYYY",
        "MMMM D, YYYY",
        "MM/DD/YYYY",
        "MM-DD-YYYY",
        "YYYY-MM-DD",
        "MMM D YYYY",
        "MMM D, YYYY",
        "D MMMM YYYY",
        "D MMM YYYY",
        "MMMM YYYY",
        "MMM YYYY",
        "YYYY MMMM",
        "YYYY MMM",
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
          await speak(
            `Date set to ${parsedDate.format(
              "MMMM D, YYYY"
            )}. Would you like to confirm or change it? Hold the microphone button to speak.`
          );
          setAwaitingConfirmation(true);
        } else {
          setError("Please select a future date, like 'May 1, 2025'.");
          await speak(
            "Please select a future date, like 'May 1, 2025'. Hold the microphone button to speak."
          );
        }
      } else {
        setError(
          "Invalid date format. Please say a date like 'May 1, 2025' or 'January 2026'."
        );
        await speak(
          "Invalid date format. Please say a date like 'May 1, 2025' or 'January 2026'. Hold the microphone button to speak."
        );
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
          await speak(
            `Time set to ${parsedTime.format(
              "h:mm A"
            )}. Would you like to confirm or change it? Hold the microphone button to speak.`
          );
          setAwaitingConfirmation(true);
        } else {
          setError("Please select a future time.");
          await speak(
            "Please select a future time. Hold the microphone button to speak."
          );
        }
      } else {
        setError("Invalid time format. Please say a time like '2:30 PM'.");
        await speak(
          "Invalid time format. Please say a time like '2:30 PM'. Hold the microphone button to speak."
        );
      }
    } else {
      const context =
        step === "title"
          ? "task title"
          : step === "description"
          ? "task description"
          : "task note";
      setUserInput(input);
      await speak(
        `You said: ${input}. Would you like to confirm or change  this ${context}? Hold the microphone button to speak.`
      );
      setAwaitingConfirmation(true);
    }
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
            confirmInput(userInput || "");
          }
          return;
        case "change":
          await speak(
            `Please provide the ${step} again. Hold the microphone button to speak.`
          );
          setUserInput("");
          setAiEnhancedOptions([]);
          setAwaitingConfirmation(false);
          return;

        case "original":
          confirmInput(userInput);
          return;

        case "skip":
          if (step === "note") {
            skipNote();
          } else {
            await speak(
              "Skip is only available for notes. Please provide the current input. Hold the microphone button to speak."
            );
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
        : "Please say 'confirm', 'change',  or 'use original'. Hold the microphone button to speak."
    );
  };

  const handleFinalSubmit = () => {
    if (!onSubmit || typeof onSubmit !== "function") {
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
      await speak(
        "Please provide the task description. Hold the microphone button to speak."
      );
    } else if (step === "description") {
      setStep("note");
      await speak(
        "Please provide any additional notes, or say 'skip' to proceed. Hold the microphone button to speak."
      );
    } else if (step === "note") {
      setStep("date");
      await speak(
        "Please provide a future task date, like 'January 1, 2026'. Hold the microphone button to speak."
      );
    } else if (step === "date") {
      setStep("time");
      await speak(
        "Please provide a future task time, like '2:30 PM'. Hold the microphone button to speak."
      );
    } else if (step === "time") {
      setStep("confirm");
      await summarizeTask();
    }
  };

  const summarizeTask = async () => {
    const dateTime = moment(taskData.timestamp).format(
      "MMMM D, YYYY [at] h:mm A"
    );
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
      speak(
        "Please provide the task title. Hold the microphone button to speak."
      );
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
    speak(
      "Please provide a future task date, like 'January 1, 2026'. Hold the microphone button to speak."
    );
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
                    Microphone access is required. Please allow permissions in
                    your browser settings.
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
                        boxShadow: listening
                          ? "0 0 10px rgba(59, 130, 246, 0.5)"
                          : "none",
                        touchAction: "none",
                      }}
                      animate={
                        listening ? { scale: [1, 1.1, 1] } : { scale: 1 }
                      }
                      transition={
                        listening ? { repeat: Infinity, duration: 0.8 } : {}
                      }
                    >
                      <FaMicrophone
                        size={24}
                        color={listening ? "#fff" : "#4b5563"}
                      />
                    </motion.div>
                    <Typography variant="body2">
                      {listening
                        ? "Listening..."
                        : permissionGranted === null
                        ? "Checking microphone access..."
                        : "Hold the microphone to speak"}
                    </Typography>

                    {(transcript || interimTranscript) && (
                      <Typography variant="body2">
                        You said: {interimTranscript || transcript}
                      </Typography>
                    )}

                    {error && (
                      <Typography variant="body2" color="error">
                        {error}
                      </Typography>
                    )}
                    {awaitingConfirmation && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          width: "100%",
                        }}
                      >
                        <TextField
                          fullWidth
                          label={`Edit ${step}`}
                          value={userInput || ""}
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
                        <Button variant="outlined" onClick={resetAndClose}>
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