import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Clipboard, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";

export default function SpeechToText() {
  const { toast } = useToast();
  const [finalTranscription, setFinalTranscription] = useState("");
  const [interimTranscription, setInterimTranscription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasTranscription = finalTranscription.trim().length > 0;
  
  const { 
    start, 
    stop, 
    isSupported,
    isListening
  } = useSpeechRecognition({
    onResult: (final, interim) => {
      if (final) {
        setFinalTranscription(prev => prev + final + " ");
      }
      setInterimTranscription(interim);
      setIsProcessing(!final && interim.length > 0);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Speech Recognition Error",
        description: `${error}. Please try again.`,
      });
      setIsRecording(false);
    }
  });

  // Effect to synchronize listening state with recording state
  useEffect(() => {
    setIsRecording(isListening);
  }, [isListening]);

  // Toggle recording state
  const toggleRecording = () => {
    if (!isSupported) {
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.",
      });
      return;
    }

    if (!isRecording) {
      setIsProcessing(false);
      start();
    } else {
      stop();
    }
  };

  // Copy transcription to clipboard
  const copyToClipboard = () => {
    if (!finalTranscription) return;
    
    navigator.clipboard.writeText(finalTranscription)
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
    setFinalTranscription("");
    setInterimTranscription("");
    toast({
      title: "Success",
      description: "Transcription cleared",
    });
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
          <div className="text-slate-700 whitespace-pre-wrap">
            {finalTranscription || interimTranscription ? (
              <>
                {finalTranscription}
                <span className="text-slate-400">{interimTranscription}</span>
              </>
            ) : (
              <p className="text-slate-400 italic text-center py-10">
                Your transcribed text will appear here...
              </p>
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
