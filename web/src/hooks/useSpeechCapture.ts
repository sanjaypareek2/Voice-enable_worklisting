import { useEffect, useMemo, useRef, useState } from "react";

export function useSpeechCapture() {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>();

  useEffect(() => {
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0])
        .map((r: any) => r.transcript)
        .join(" ");
      setTranscript(text.trim());
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, [SpeechRecognition]);

  const start = () => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setListening(true);
    recognitionRef.current.start();
  };

  return { transcript, listening, supported: Boolean(SpeechRecognition), start };
}
