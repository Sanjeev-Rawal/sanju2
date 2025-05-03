import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Clipboard, Trash2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { Textarea } from "@/components/ui/textarea";

export default function SpeechToText() {
  const { toast } = useToast();
  const [transcription, setTranscription] = useState("");
  const [interimTranscription, setInterimTranscription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMicrophoneAccessGranted, setIsMicrophoneAccessGranted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasTranscription = transcription.trim().length > 0;

  // Check microphone access on mount
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMicrophoneAccessGranted(true);
        stream.getTracks().forEach(t => t.stop());
      } catch {
        setIsMicrophoneAccessGranted(false);
      }
    })();
  }, []);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const {
    start,
    stop,
    isSupported,
    isListening
  } = useSpeechRecognition({
    onResult: (final, interim) => {
      if (final) {
        // Strip out all commas and dots
        const processed = final.replace(/[.,]/g, "");
        setTranscription(prev => {
          const cursor = textareaRef.current?.selectionStart ?? prev.length;
          const newText = prev.slice(0, cursor) + processed + " " + prev.slice(cursor);
          setTimeout(() => {
            if (textareaRef.current) {
              const pos = cursor + processed.length + 1;
              textareaRef.current.selectionStart = pos;
              textareaRef.current.selectionEnd = pos;
              textareaRef.current.focus();
            }
          }, 0);
          return newText;
        });
      }

      // Also strip punctuation from interim text
      const processedInterim = interim.replace(/[.,]/g, "");
      setInterimTranscription(processedInterim);
      setIsProcessing(!final && interim.length > 0);
    },
    onError: (error) => {
      console.error("Speech recognition error:", error);
      toast({
        variant: "destructive",
        title: "Speech Recognition Error",
        description: `${error}. Please try again.`,
      });
      setIsRecording(false);
    },
    onEnd: () => {
      setIsRecording(false);
    }
  });

  // Keep recording state in sync
  useEffect(() => {
    setIsRecording(isListening);
  }, [isListening]);

  const toggleRecording = async () => {
    if (!isSupported) {
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.",
      });
      return;
    }

    if (!isMicrophoneAccessGranted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMicrophoneAccessGranted(true);
        stream.getTracks().forEach(t => t.stop());
      } catch {
        toast({
          variant: "destructive",
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use speech recognition.",
        });
        return;
      }
    }

    if (!isRecording) {
      setIsProcessing(false);
      start();
    } else {
      stop();
    }
  };

  const copyToClipboard = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription)
      .then(() => {
        toast({ title: "Success", description: "Text copied to clipboard!" });
      })
      .catch(err => {
        console.error(err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy text to clipboard",
        });
      });
  };

  const clearTranscription = () => {
    setTranscription("");
    setInterimTranscription("");
    toast({ title: "Success", description: "Transcription cleared" });
    textareaRef.current?.focus();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscription(e.target.value);
  };

  return (
    <>
      {/* Record Button */}
      <div className="flex flex-col items-center justify-center">
        <Button
          variant="default"
          size="icon"
          onClick={toggleRecording}
          disabled={!isSupported}
          className={`w-24 h-24 rounded-full app-button ${
            isRecording ? "mic-button-recording" : "mic-button"
          } text-white flex items-center justify-center transition-all duration-300`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          <Mic className="h-10 w-10" />
        </Button>

        {isRecording && (
          <div className="mt-3 flex items-center space-x-2 fade-in">
            <div className="recording-dot w-3 h-3 bg-red-600 rounded-full" />
            <span className="text-red-600 font-semibold">Listening...</span>
          </div>
        )}

        {isProcessing && !isRecording && (
          <div className="mt-3 flex items-center space-x-2 fade-in">
            <div className="flex space-x-1">
              <div className="loading-dot w-2 h-2 bg-indigo-600 rounded-full" />
              <div className="loading-dot w-2 h-2 bg-indigo-600 rounded-full" />
              <div className="loading-dot w-2 h-2 bg-indigo-600 rounded-full" />
            </div>
            <span className="text-indigo-600 font-semibold">Processing...</span>
          </div>
        )}
      </div>

      {/* Transcription Display */}
      <Card className="app-card w-[calc(100%)] mx-auto mt-5">
        <CardContent className="p-2 md:p-3 min-h-[270px] max-h-[440px] overflow-y-auto">
          <div className="flex items-center mb-3 text-slate-700">
            <Sparkles className="h-5 w-5 text-indigo-500 mr-2" />
            <h2 className="text-lg font-semibold">Your Transcription</h2>
          </div>
          <div className="relative min-h-[190px] text-area-container w-[calc(100%)]">
            <Textarea
              ref={textareaRef}
              value={transcription}
              onChange={handleTextChange}
              placeholder="Type or speak to add text here..."
              className="custom-textarea min-h-[190px] p-3 text-slate-700 w-full"
            />
            {interimTranscription && (
              <div className="absolute bottom-3 right-3 interim-text">
                {interimTranscription}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-5">
        <Button
          variant="default"
          onClick={copyToClipboard}
          disabled={!hasTranscription}
          className="px-5 py-2 copy-button app-button text-white rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Clipboard className="h-5 w-5" />
          Copy Text
        </Button>

        <Button
          variant="secondary"
          onClick={clearTranscription}
          disabled={!hasTranscription}
          className="px-5 py-2 clear-button app-button text-slate-700 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-5 w-5" />
          Clear
        </Button>
      </div>
    </>
  );
}
