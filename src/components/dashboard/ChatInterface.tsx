
import React, { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, VolumeX, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import MessageBubble from "@/components/MessageBubble";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import { Message } from "@/types";
import { toast } from "sonner";
import { processWithAI } from "@/utils/ai";
import { textToSpeech, playAudio, startSpeechRecognition } from "@/utils/voice";
import { isWikipediaQuery, extractWikipediaSearchTerm, searchWikipedia } from "@/utils/wikipedia";
import { getCurrentDateTime, getTimeBasedGreeting } from "@/utils/userGreeting";

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  systemStatus: {
    isListening: boolean;
    isSpeaking: boolean;
    isThinking: boolean;
  };
  setSystemStatus: React.Dispatch<React.SetStateAction<any>>;
  user: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  setMessages, 
  systemStatus,
  setSystemStatus,
  user
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<{ stop: () => void } | null>(null);
  
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  useEffect(() => {
    if (micEnabled) {
      setSystemStatus(prev => ({ ...prev, isListening: true }));
      
      speechRecognitionRef.current = startSpeechRecognition(
        (text, isFinal) => {
          setRecognizedText(text);
          
          if (isFinal) {
            handleSubmit(text);
            setRecognizedText("");
          }
        },
        (error) => {
          console.error("Speech recognition error:", error);
          toast.error("Speech recognition error. Please try again.");
          setMicEnabled(false);
          setSystemStatus(prev => ({ ...prev, isListening: false }));
        }
      );
    } else {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      }
      setSystemStatus(prev => ({ ...prev, isListening: false }));
    }
    
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [micEnabled, setSystemStatus]);

  const handleSubmit = async (text?: string) => {
    const messageText = text || inputMessage;
    if (!messageText.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    
    const assistantPlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "...",
      timestamp: new Date(),
      isProcessing: true,
    };
    
    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
    setInputMessage("");
    
    setSystemStatus(prev => ({ ...prev, isThinking: true }));
    
    try {
      // Check for local processing of simple commands
      let response: {text: string} | null = null;
      
      // Handle date/time inquiries locally
      if (messageText.toLowerCase().includes('time') || 
          messageText.toLowerCase().includes('date') || 
          messageText.toLowerCase().includes('day')) {
        const dateTimeInfo = getCurrentDateTime();
        if (messageText.toLowerCase().includes('time')) {
          response = {
            text: `The current time is ${new Date().toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit', hour12: true})}.`
          };
        } else {
          response = {
            text: `Today is ${dateTimeInfo.formatted.split(',')[0]} (${new Date().toLocaleDateString()}).`
          };
        }
      }
      // Handle greetings locally
      else if (messageText.toLowerCase().includes('good morning') || 
               messageText.toLowerCase().includes('good afternoon') ||
               messageText.toLowerCase().includes('good evening')) {
        response = {
          text: `${getTimeBasedGreeting()}, ${user?.name || 'User'}. How may I assist you today?`
        };
      }
      // Handle introduction requests
      else if (messageText.toLowerCase().includes('who are you') || 
              messageText.toLowerCase().includes('introduce yourself') || 
              messageText.toLowerCase().includes('tell me about yourself')) {
        response = {
          text: `I am an advanced AI assistant. I'm designed to assist with various tasks including information retrieval, knowledge processing, and voice interactions. How can I help you today?`
        };
      }
      // Check for Wikipedia queries
      else if (isWikipediaQuery(messageText)) {
        try {
          const searchTerm = extractWikipediaSearchTerm(messageText);
          console.log("Extracted Wikipedia search term:", searchTerm);
          if (searchTerm) {
            const wikipediaResult = await searchWikipedia(searchTerm);
            response = { text: wikipediaResult };
          }
        } catch (error) {
          console.error("Wikipedia search error:", error);
          // Fall back to AI processing if Wikipedia search fails
        }
      }
      
      // If no local processing, use AI
      if (!response) {
        response = await processWithAI([...messages, userMessage]);
      }
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantPlaceholder.id
            ? {
                ...msg,
                content: response?.text || "I'm sorry, I couldn't process your request.",
                isProcessing: false,
              }
            : msg
        )
      );
      
      setSystemStatus(prev => ({ ...prev, isThinking: false }));
      
      if (voiceEnabled) {
        setSystemStatus(prev => ({ ...prev, isSpeaking: true }));
        console.log("Attempting text-to-speech with:", response.text);
        const audioBlob = await textToSpeech(response.text);
        console.log("TTS returned audioBlob:", !!audioBlob);
        
        if (audioBlob) {
          await playAudio(audioBlob);
        } else {
          console.error("No audio blob returned from textToSpeech");
        }
        
        setSystemStatus(prev => ({ ...prev, isSpeaking: false }));
      }
    } catch (error) {
      console.error("Error processing message:", error);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantPlaceholder.id
            ? {
                ...msg,
                role: "error",
                content: "I'm sorry, I encountered an error processing your request. Please try again.",
                isProcessing: false,
              }
            : msg
        )
      );
      
      setSystemStatus(prev => ({ ...prev, isThinking: false, isSpeaking: false }));
      
      toast.error("Error processing message. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-3 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
          <div ref={messageEndRef} />
        </div>
      </div>
      
      {micEnabled && recognizedText && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-gray-800 bg-opacity-50 mx-4 mb-4 rounded-lg"
        >
          <p className="text-sm text-gray-300 italic">{recognizedText}</p>
        </motion.div>
      )}
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="p-4 border-t border-gray-800 glass-panel"
      >
        <div className="flex items-end space-x-2 max-w-3xl mx-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMicEnabled(!micEnabled)}
            className={micEnabled ? "text-nova-500" : "text-gray-400"}
          >
            {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          
          <Textarea
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="resize-none min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={voiceEnabled ? "text-purple-500" : "text-gray-400"}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          
          <Button onClick={() => handleSubmit()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatInterface;
