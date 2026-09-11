import { useCallback, useEffect, useRef, useState } from "react";

export function useSpeechRecognition(onFinalTranscript) {
  const recognitionRef = useRef(null);
  const [isSupported] = useState(() =>
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
  );
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isSupported) return undefined;
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setError("Speech recognition could not hear you. You can type instead.");
      setIsListening(false);
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      if (event.results[event.results.length - 1].isFinal)
        onFinalTranscript(transcript.trim());
    };
    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [isSupported, onFinalTranscript]);
  const start = useCallback(() => {
    setError("");
    recognitionRef.current?.start();
    setIsListening(true);
  }, []);
  const stop = useCallback(() => recognitionRef.current?.stop(), []);
  return { isSupported, isListening, error, start, stop };
}
