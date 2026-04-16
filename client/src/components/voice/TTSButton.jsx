import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useTranslation } from "react-i18next";

export default function TTSButton({ textToRead, lang = "hi-IN", className = "" }) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioObj, setAudioObj] = useState(null);

  const stopPlaying = () => {
    if (audioObj) {
      audioObj.pause();
      setAudioObj(null);
    }
    window.speechSynthesis.cancel(); // Stop native fallback if it's playing
    setIsPlaying(false);
  };

  const handlePlay = async () => {
    if (isPlaying) {
      stopPlaying();
      return;
    }

    setIsPlaying(true);

    try {
      // 1. Try Sarvam AI first
      const { data } = await api.post("/voice/tts", { text: textToRead, language: lang });
      
      if (data.success && data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        setAudioObj(audio);
        audio.play();
        
        audio.onended = () => setIsPlaying(false);
        return; // Success, exit out
      }
      throw new Error("Invalid response from Sarvam API");
    } catch (error) {
      console.warn("Sarvam TTS failed, using browser fallback...", error);
      
      // 2. Fallback to built-in browser speech synthesis if Sarvam is down
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = lang; 
        
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => {
          setIsPlaying(false);
          toast.error(t("voice.ttsError", "Could not generate speech."));
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlaying(false);
        toast.error(t("voice.ttsError", "Could not generate speech."));
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      className={`flex items-center justify-center p-2 rounded-full transition-colors ${
        isPlaying ? "bg-primary-100 text-primary-600" : "bg-gray-50 text-gray-400 hover:text-primary-600"
      } ${className}`}
      title={t("voice.listen", "Listen")}
    >
      {isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
  );
}