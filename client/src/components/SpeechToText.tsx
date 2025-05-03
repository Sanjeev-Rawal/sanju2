import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Clipboard, Trash2 } from "lucide-react";
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
  
  // Check microphone access on component mount
  useEffect(() => {
    // Check if microphone permission has been granted
    const checkMicrophoneAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMicrophoneAccessGranted(true);
        console.log("Microphone access granted");
        
        // Stop the tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error("Microphone access not granted:", error);
        setIsMicrophoneAccessGranted(false);
      }
    };
    
    checkMicrophoneAccess();
  }, []);

  // Focus the textarea on component mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  const { 
    start, 
    stop, 
    isSupported,
    isListening
  } = useSpeechRecognition({
    onResult: (final, interim) => {
      console.log("Recognition result:", { final, interim });
      if (final) {
        // Append to the editable text
        setTranscription(prev => {
          // Get the current cursor position
          const cursorPos = textareaRef.current?.selectionStart || prev.length;
          // Insert the new text at the current cursor position
          const newText = prev.substring(0, cursorPos) + final + " " + prev.substring(cursorPos);
          
          // Update the cursor position after React updates the DOM
          setTimeout(() => {
            if (textareaRef.current) {
              const newCursorPos = cursorPos + final.length + 1;
              textareaRef.current.selectionStart = newCursorPos;
              textareaRef.current.selectionEnd = newCursorPos;
              textareaRef.current.focus();
            }
          }, 0);
          
          return newText;
        });
      }
      setInterimTranscription(interim);
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
      console.log("Speech recognition ended");
      setIsRecording(false);
    }
  });

  // Effect to synchronize listening state with recording state
  useEffect(() => {
    setIsRecording(isListening);
  }, [isListening]);

  // Toggle recording state
  const toggleRecording = async () => {
    if (!isSupported) {
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.",
      });
      return;
    }

    // Request microphone permission if not already granted
    if (!isMicrophoneAccessGranted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMicrophoneAccessGranted(true);
        // Stop the tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error("Microphone access denied:", error);
        toast({
          variant: "destructive",
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use speech recognition.",
        });
        return;
      }
    }

    if (!isRecording) {
      console.log("Starting speech recognition...");
      setIsProcessing(false);
      start();
    } else {
      console.log("Stopping speech recognition...");
      stop();
    }
  };

  // Copy transcription to clipboard
  const copyToClipboard = () => {
    if (!transcription) return;
    
    navigator.clipboard.writeText(transcription)
      .then(() => {
        toast({
          title: "Success",
          description: "Text copied to clipboard!",
        });
      })
      .catch(err => {
        console.error("Could not copy text: ", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy text to clipboard",
        });
      });
  };

  // Clear transcription
  const clearTranscription = () => {
    setTranscription("");
    setInterimTranscription("");
    toast({
      title: "Success",
      description: "Transcription cleared",
    });
    
    // Focus the textarea after clearing
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle text change in editable mode
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
          className={`w-20 h-20 rounded-full ${
            isRecording 
              ? "bg-red-600 hover:bg-red-700 focus:ring-red-300" 
              : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
          } text-white flex items-center justify-center focus:outline-none focus:ring-4 transition-all`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          <Mic className="h-10 w-10" />
        </Button>
        
        {isRecording && (
          <div className="mt-4 flex items-center space-x-2">
            <div className="recording-dot w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-red-600 font-medium">Recording...</span>
          </div>
        )}
        
        {isProcessing && !isRecording && (
          <div className="mt-4 flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="loading-dot w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="loading-dot w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="loading-dot w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-blue-600 font-medium">Processing...</span>
          </div>
        )}
      </div>

      {/* Transcription Display */}
      <Card className="bg-white rounded-lg shadow-md">
        <CardContent className="p-5 md:p-6 min-h-[250px] max-h-[400px] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-3 text-slate-700">Transcription</h2>
          
          <div className="relative min-h-[200px]">
            <Textarea
              ref={textareaRef}
              value={transcription}
              onChange={handleTextChange}
              placeholder="Type or speak to add text here..."
              className="min-h-[200px] resize-none p-2 text-slate-700 border border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
            
            {/* Show interim text at the cursor position */}
            {interimTranscription && (
              <div className="absolute bottom-2 right-2 text-slate-400 bg-white bg-opacity-75 px-2 py-1 rounded text-sm">
                {interimTranscription}...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          variant="default"
          onClick={copyToClipboard}
          disabled={!hasTranscription}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Clipboard className="h-5 w-5" />
          Copy Text
        </Button>
        
        <Button
          variant="secondary"
          onClick={clearTranscription}
          disabled={!hasTranscription}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Trash2 className="h-5 w-5" />
          Clear
        </Button>
      </div>
    </>
  );
}
