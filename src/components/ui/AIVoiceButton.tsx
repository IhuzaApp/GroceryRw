import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

export default function AIVoiceButton() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          processVoiceCommand(transcript.trim());
        }
      };
    }
  }, [transcript]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    } else {
      // Fallback for browsers without speech recognition
      alert('Speech recognition is not supported in this browser. Please use a modern browser like Chrome.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    
    try {
      // Convert command to lowercase for easier processing
      const lowerCommand = command.toLowerCase();
      
      // Process different voice commands
      if (lowerCommand.includes('order') || lowerCommand.includes('buy') || lowerCommand.includes('purchase')) {
        // Navigate to shops page
        router.push('/shops');
      } else if (lowerCommand.includes('cart') || lowerCommand.includes('basket')) {
        // Navigate to cart
        router.push('/Cart');
      } else if (lowerCommand.includes('profile') || lowerCommand.includes('account')) {
        // Navigate to profile
        router.push('/Myprofile');
      } else if (lowerCommand.includes('orders') || lowerCommand.includes('my orders')) {
        // Navigate to orders
        router.push('/CurrentPendingOrders');
      } else if (lowerCommand.includes('reels') || lowerCommand.includes('videos')) {
        // Navigate to reels
        router.push('/Reels');
      } else if (lowerCommand.includes('recipes') || lowerCommand.includes('cook')) {
        // Navigate to recipes
        router.push('/Recipes');
      } else if (lowerCommand.includes('home') || lowerCommand.includes('main')) {
        // Navigate to home
        router.push('/');
      } else {
        // Show feedback for unrecognized command
        alert(`I heard: "${command}". Please try saying "order food", "go to cart", "my profile", etc.`);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      alert('Sorry, I encountered an error processing your command. Please try again.');
    } finally {
      setIsProcessing(false);
      setTranscript("");
    }
  };

  const handleButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="z-50 -mt-12">
      <button
        className={`flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300 ${
          isListening 
            ? 'border-red-500 bg-red-500 text-white animate-pulse' 
            : isProcessing
            ? 'border-yellow-500 bg-yellow-500 text-white'
            : 'border-green-500 bg-white text-green-500 dark:bg-gray-800'
        }`}
        onClick={handleButtonClick}
        disabled={isProcessing}
      >
        {isProcessing ? (
          // Processing spinner
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-spin"
          >
            <path
              d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : isListening ? (
          // Microphone icon when listening
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 1C10.8954 1 10 1.89543 10 3V11C10 12.1046 10.8954 13 12 13C13.1046 13 14 12.1046 14 11V3C14 1.89543 13.1046 1 12 1Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 10V11C19 14.866 15.866 18 12 18C8.13401 18 5 14.866 5 11V10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 18V22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 22H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // AI/Microphone icon when idle
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C13.1046 2 14 2.89543 14 4V10C14 11.1046 13.1046 12 12 12C10.8954 12 10 11.1046 10 10V4C10 2.89543 10.8954 2 12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 10V11C19 14.866 15.866 18 12 18C8.13401 18 5 14.866 5 11V10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 18V22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 22H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Voice feedback overlay */}
      {isListening && (
        <div className="absolute bottom-full left-1/2 mb-4 -translate-x-1/2 transform rounded-lg bg-black bg-opacity-75 px-4 py-2 text-white">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
            <span className="text-sm">Listening...</span>
          </div>
          {transcript && (
            <div className="mt-2 text-xs text-gray-300">
              "{transcript}"
            </div>
          )}
        </div>
      )}

      {/* Processing feedback */}
      {isProcessing && (
        <div className="absolute bottom-full left-1/2 mb-4 -translate-x-1/2 transform rounded-lg bg-black bg-opacity-75 px-4 py-2 text-white">
          <div className="flex items-center space-x-2">
            <svg
              width="16px"
              height="16px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="animate-spin"
            >
              <path
                d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
} 