import { useState, useRef, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function STTButton({ onTextResult, className = "" }) {
  const { t, i18n } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
    } else {
      console.warn("Web Speech API is not supported in this browser.");
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error(t("voice.micError", "Speech recognition not supported in this browser."));
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      // Dynamically set recognition language based on app state
      recognitionRef.current.lang = i18n.language === "en" ? "en-IN" : "hi-IN";
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTextResult(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "aborted") {
          toast.error(t("voice.processError", "Could not process your voice. Try again."));
        }
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Speech recognition start error", error);
        setIsRecording(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleRecording}
      className={`flex items-center justify-center transition-colors ${
        isRecording ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-primary-600"
      } ${className}`}
      title={t("voice.speak", "Speak")}
    >
      {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
    </button>
  );
}