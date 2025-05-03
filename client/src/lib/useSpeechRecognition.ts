import { useState, useEffect, useCallback, useRef } from 'react';

// Define SpeechRecognition types for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionOptions {
  onResult?: (finalText: string, interimText: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

interface SpeechRecognitionHook {
  isListening: boolean;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
}

export function useSpeechRecognition({
  onResult = () => {},
  onError = () => {},
  onEnd = () => {},
  continuous = true,
  interimResults = true,
  language = 'en-US'
}: SpeechRecognitionOptions = {}): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check if browser supports SpeechRecognition
  useEffect(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
      
      // Log to help with debugging
      if (!SpeechRecognition) {
        console.warn('SpeechRecognition API is not supported in this browser');
      } else {
        console.log('SpeechRecognition API is supported');
      }
    } catch (error) {
      console.error('Error checking speech recognition support:', error);
      setIsSupported(false);
    }
  }, []);

  // Initialize recognition instance
  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        console.log('Speech recognition result received', event);
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        console.log('Final transcript:', finalTranscript);
        console.log('Interim transcript:', interimTranscript);
        onResult(finalTranscript, interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        onError(event.error);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        onEnd();
      };

      return recognition;
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      return null;
    }
  }, [continuous, interimResults, language, isSupported, onResult, onError, onEnd]);

  // Start recognition
  const start = useCallback(() => {
    if (!isSupported) {
      console.warn('Cannot start: Speech recognition not supported');
      return;
    }

    try {
      // Always create a new instance to avoid potential issues with reuse
      recognitionRef.current = initializeRecognition();
      
      if (recognitionRef.current) {
        console.log('Starting speech recognition...');
        
        // Request microphone permission explicitly if needed
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            recognitionRef.current.start();
          })
          .catch((err) => {
            console.error('Microphone access error:', err);
            onError('Microphone access denied');
          });
      } else {
        console.error('Recognition instance could not be created');
        onError('Failed to initialize speech recognition');
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      onError('Failed to start speech recognition');
    }
  }, [isSupported, initializeRecognition, onError]);

  // Stop recognition
  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        console.log('Stopping speech recognition...');
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    start,
    stop
  };
}
