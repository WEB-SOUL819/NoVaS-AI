
import React, { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, VolumeX, Volume2, Search, Globe } from "lucide-react";
import { motion } from "framer-motion";
import MessageBubble from "@/components/MessageBubble";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import { Message } from "@/types";
import { toast } from "sonner";
import { processWithAI, isWebSearchQuery, AUTOMATION_KNOWLEDGE_BASES } from "@/utils/ai";
import { searchWeb, extractSearchQuery } from "@/utils/webSearch";
import { textToSpeech, playAudio, startSpeechRecognition } from "@/utils/voice";
import { isWikipediaQuery, extractWikipediaSearchTerm, searchWikipedia } from "@/utils/wikipedia";
import { getCurrentDateTime, getTimeBasedGreeting } from "@/utils/userGreeting";
import { supabase } from "@/integrations/supabase/client";

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

  const saveMessageToSupabase = async (message: Message, conversationId?: string) => {
    if (!user) return null;
    
    try {
      let activeConversationId = conversationId;
      
      // Create a conversation if this is the first message
      if (!activeConversationId) {
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert([
            { user_id: user.id, title: message.content.substring(0, 50) }
          ])
          .select('id')
          .single();
          
        if (convError) throw convError;
        activeConversationId = conversation.id;
      }
      
      // Insert the message
      const { data, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversationId,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp.toISOString()
        });
          
      if (msgError) throw msgError;
      
      return activeConversationId;
    } catch (error) {
      console.error("Error saving message to Supabase:", error);
      return null;
    }
  };

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
    
    let conversationId = await saveMessageToSupabase(userMessage);
    
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
      // Check for web search queries - prioritize this for news related queries
      else if (isWebSearchQuery(messageText)) {
        try {
          const searchQuery = extractSearchQuery(messageText);
          console.log("Extracted web search query:", searchQuery);
          
          if (searchQuery) {
            const webResult = await searchWeb(searchQuery);
            response = { text: webResult };
          }
        } catch (error) {
          console.error("Web search error:", error);
          // Fall back to AI processing if web search fails
        }
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
      
      const assistantMessage = {
        ...assistantPlaceholder,
        content: response?.text || "I'm sorry, I couldn't process your request.",
        isProcessing: false,
      };
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantPlaceholder.id ? assistantMessage : msg
        )
      );
      
      // Save assistant message to Supabase
      if (conversationId) {
        await saveMessageToSupabase(assistantMessage, conversationId);
      }
      
      setSystemStatus(prev => ({ ...prev, isThinking: false }));
      
      if (voiceEnabled) {
        setSystemStatus(prev => ({ ...prev, isSpeaking: true }));
        console.log("Attempting text-to-speech with:", response.text);
        
        // Don't speak error messages
        if (!assistantMessage.content.toLowerCase().includes("error") && 
            !assistantMessage.content.toLowerCase().includes("sorry, i couldn't") &&
            !assistantMessage.content.toLowerCase().includes("i'm sorry") &&
            !assistantMessage.content.toLowerCase().includes("failed")) {
          const audioBlob = await textToSpeech(response.text);
          console.log("TTS returned audioBlob:", !!audioBlob);
          
          if (audioBlob) {
            await playAudio(audioBlob);
          } else {
            console.error("No audio blob returned from textToSpeech");
          }
        } else {
          console.log("Skipping TTS for error message");
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
            title={micEnabled ? "Turn off voice input" : "Turn on voice input"}
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
            title={voiceEnabled ? "Turn off voice output" : "Turn on voice output"}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          
          <Button onClick={() => handleSubmit()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
        
        <div className="flex justify-center mt-2">
          <div className="text-xs text-gray-500 flex items-center">
            <Globe className="h-3 w-3 mr-1" />
            <span>Web knowledge enabled • </span>
            <Search className="h-3 w-3 mx-1" />
            <span>Try asking "What's happening in the world today?"</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatInterface;
