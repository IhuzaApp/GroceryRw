import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

interface VoiceResponse {
  text: string;
  command: {
    intent: string;
    entities: any;
    confidence: number;
  };
  results: any;
  message: string;
  action: string | null;
}

export default function AIVoiceButton() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState<VoiceResponse | null>(null);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();
  const { data: session } = useSession();

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
        setShowResults(true);
        setVoiceResponse(null);
        setPendingOrder(null);
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
        setShowResults(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          processVoiceCommand(transcript.trim());
        }
        // Keep results visible for a moment after processing
        setTimeout(() => setShowResults(false), 5000);
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
      // Send command to voice recognition API
      const response = await fetch('/api/voice/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: command,
          userId: session?.user?.id || 'anonymous'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process voice command');
      }

      const data: VoiceResponse = await response.json();
      setVoiceResponse(data);

      // Handle different actions
      if (data.action === 'confirm_order' && data.results?.product) {
        setPendingOrder(data.results.product);
      } else if (data.action === 'open_cart') {
        router.push('/Cart');
      } else if (data.action?.startsWith('navigate_to_')) {
        const destination = data.action.replace('navigate_to_', '');
        handleNavigation(destination);
      } else if (data.action === 'show_shops') {
        router.push('/shops');
      }

    } catch (error) {
      console.error('Error processing voice command:', error);
      setVoiceResponse({
        text: command,
        command: { intent: 'error', entities: {}, confidence: 0 },
        results: null,
        message: 'Sorry, I encountered an error processing your command. Please try again.',
        action: null
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNavigation = (destination: string) => {
    switch (destination) {
      case 'profile':
        router.push('/Myprofile');
        break;
      case 'orders':
        router.push('/CurrentPendingOrders');
        break;
      case 'reels':
        router.push('/Reels');
        break;
      case 'recipes':
        router.push('/Recipes');
        break;
      case 'home':
        router.push('/');
        break;
      default:
        console.log('Unknown destination:', destination);
    }
  };

  const confirmOrder = async (confirm: boolean) => {
    if (!pendingOrder || !session?.user?.id) return;

    try {
      const response = await fetch('/api/voice/confirm-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: pendingOrder.id,
          quantity: pendingOrder.quantity || 1,
          userId: session.user.id,
          confirm: confirm
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm order');
      }

      const data = await response.json();
      
      if (data.success) {
        setVoiceResponse({
          text: '',
          command: { intent: 'success', entities: {}, confidence: 1 },
          results: null,
          message: data.message,
          action: 'order_confirmed'
        });
        setPendingOrder(null);
      } else {
        setVoiceResponse({
          text: '',
          command: { intent: 'cancelled', entities: {}, confidence: 1 },
          results: null,
          message: data.message,
          action: 'order_cancelled'
        });
        setPendingOrder(null);
      }

    } catch (error) {
      console.error('Error confirming order:', error);
      setVoiceResponse({
        text: '',
        command: { intent: 'error', entities: {}, confidence: 0 },
        results: null,
        message: 'Sorry, I encountered an error confirming your order.',
        action: null
      });
    }
  };

  const handleButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const closeResults = () => {
    setShowResults(false);
    if (isListening) {
      stopListening();
    }
  };

  return (
    <>
      {/* Draggable Results Component */}
      {showResults && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg transform transition-transform duration-300">
          <div className="container mx-auto px-4 py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`h-3 w-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : isProcessing ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice Assistant'}
                </h3>
              </div>
              <button
                onClick={closeResults}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Results Content */}
            <div className="space-y-3">
              {/* Live Transcript */}
              {isListening && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Live Transcript</span>
                  </div>
                  <p className="text-gray-800 dark:text-white text-lg">
                    {transcript || "Listening for your command..."}
                  </p>
                </div>
              )}

              {/* Processing Status */}
              {isProcessing && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
                      <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Processing Command</span>
                  </div>
                  <p className="text-blue-800 dark:text-blue-200">
                    Understanding: "{transcript}"
                  </p>
                </div>
              )}

              {/* Voice Response */}
              {voiceResponse && (
                <div className={`rounded-lg p-3 ${
                  voiceResponse.command.intent === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : voiceResponse.command.intent === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-purple-50 dark:bg-purple-900/20'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Assistant Response</span>
                  </div>
                  <p className="text-gray-800 dark:text-white text-lg mb-3">
                    {voiceResponse.message}
                  </p>
                  
                  {/* Order Confirmation */}
                  {pendingOrder && (
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-3 mb-3">
                        {pendingOrder.image && (
                          <img 
                            src={pendingOrder.image} 
                            alt={pendingOrder.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">{pendingOrder.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">${pendingOrder.final_price}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => confirmOrder(true)}
                          className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Confirm Order
                        </button>
                        <button
                          onClick={() => confirmOrder(false)}
                          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Command Suggestions */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Try Saying</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-green-700 dark:text-green-300">• "Order 2 milk"</span>
                  <span className="text-green-700 dark:text-green-300">• "Find restaurants"</span>
                  <span className="text-green-700 dark:text-green-300">• "Show my cart"</span>
                  <span className="text-green-700 dark:text-green-300">• "Go to profile"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Voice Button */}
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
      </div>
    </>
  );
} 