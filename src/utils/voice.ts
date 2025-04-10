
import { API_KEYS, VOICE_CONFIG, SYSTEM_CONFIG } from "@/config/env";

/**
 * Text-to-Speech using ElevenLabs API
 */
export async function textToSpeech(text: string): Promise<Blob | null> {
  try {
    if (!text || text.trim() === "") {
      console.warn("Empty text provided to textToSpeech");
      return null;
    }

    console.log(`Starting TTS request for text (${text.length} chars)`);
    console.log("Using API key:", API_KEYS.ELEVEN_LABS_API_KEY ? "Present (hidden)" : "Missing");
    console.log("Using voice ID:", VOICE_CONFIG.VOICE_ID);
    
    // Check if API key is present, if not use fallback
    if (!API_KEYS.ELEVEN_LABS_API_KEY) {
      console.log("No ElevenLabs API key found, using browser TTS fallback");
      return useBrowserTTS(text);
    }
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_CONFIG.VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": API_KEYS.ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: VOICE_CONFIG.MODEL_ID,
          voice_settings: {
            stability: VOICE_CONFIG.STABILITY,
            similarity_boost: VOICE_CONFIG.SIMILARITY_BOOST,
            style: VOICE_CONFIG.STYLE,
            use_speaker_boost: true,
          },
        }),
      }
    );

    console.log("TTS API response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("TTS API Error:", errorData);
      console.log("API call failed, falling back to browser TTS");
      return useBrowserTTS(text); // Fallback to browser TTS
    }

    const audioBlob = await response.blob();
    console.log("TTS API returned audio blob:", audioBlob.size, "bytes");
    return audioBlob;
  } catch (error) {
    console.error("Error in textToSpeech:", error);
    console.log("Error caught, falling back to browser TTS");
    return useBrowserTTS(text); // Fallback to browser TTS on any error
  }
}

/**
 * Fallback Text-to-Speech using browser's Web Speech API
 */
function useBrowserTTS(text: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    console.log("Using browser TTS fallback");
    
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.error("Browser does not support speech synthesis");
      reject(new Error("Browser does not support speech synthesis"));
      return;
    }
    
    // Create a new speech synthesis instance
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice properties to make it more JARVIS-like
    utterance.rate = 1.0; // Speed of speech
    utterance.pitch = 0.9; // Lower pitch for male voice
    utterance.volume = 1.0; // Volume
    
    // Get available voices and select a deep male voice if available
    let voices = synth.getVoices();
    
    // If voices array is empty, wait for voices to load
    if (voices.length === 0) {
      console.log("Waiting for voices to load...");
      synth.onvoiceschanged = () => {
        voices = synth.getVoices();
        selectVoice();
      };
    } else {
      selectVoice();
    }
    
    function selectVoice() {
      console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`).join(', '));
      
      // Look for good English male voices
      const preferredVoices = [
        'Google UK English Male',
        'Microsoft David',
        'Microsoft Mark', 
        'Daniel',
        'Alex'
      ];
      
      // Try to find one of our preferred voices
      let selectedVoice = null;
      for (const preferredVoice of preferredVoices) {
        selectedVoice = voices.find(voice => voice.name.includes(preferredVoice));
        if (selectedVoice) break;
      }
      
      // If no preferred voice found, look for any English male voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('male') && 
          voice.lang.startsWith('en')
        );
      }
      
      // Fallback to any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
      }
      
      // Last resort: just use the first available voice
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }
      
      if (selectedVoice) {
        console.log("Selected voice:", selectedVoice.name);
        utterance.voice = selectedVoice;
      } else {
        console.warn("No suitable voice found");
      }
      
      // Create an AudioContext to record the speech
      if (!window.AudioContext) {
        console.warn("AudioContext not supported, cannot create audio blob");
        // Still speak but won't return a blob
        synth.speak(utterance);
        resolve(new Blob()); // Return empty blob
        return;
      }
      
      const audioContext = new window.AudioContext();
      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        console.log("Browser TTS generated audio blob:", audioBlob.size, "bytes");
        resolve(audioBlob);
      };
      
      utterance.onend = () => {
        console.log("Browser TTS speech ended");
        mediaRecorder.stop();
      };
      
      utterance.onerror = (error) => {
        console.error("Browser TTS error:", error);
        mediaRecorder.stop();
        reject(error);
      };
      
      mediaRecorder.start();
      synth.speak(utterance);
    }
  });
}

/**
 * Plays audio from a blob
 */
export async function playAudio(audioBlob: Blob): Promise<void> {
  try {
    console.log("Creating URL for audio blob...");
    const url = URL.createObjectURL(audioBlob);
    console.log("Audio URL created:", url);
    
    const audio = new Audio(url);
    
    return new Promise((resolve, reject) => {
      console.log("Setting up audio event handlers...");
      
      audio.onloadeddata = () => {
        console.log("Audio data loaded, duration:", audio.duration);
      };
      
      audio.onplay = () => {
        console.log("Audio playback started");
      };
      
      audio.onended = () => {
        console.log("Audio playback ended");
        URL.revokeObjectURL(url);
        resolve();
      };
      
      audio.onerror = (error) => {
        console.error("Audio playback error:", error);
        URL.revokeObjectURL(url);
        reject(error);
      };
      
      console.log("Starting audio playback...");
      audio.play().catch(error => {
        console.error("Error playing audio:", error);
        reject(error);
      });
    });
  } catch (error) {
    console.error("Error in playAudio:", error);
    throw error;
  }
}

/**
 * Speech-to-Text using Web Speech API with fallback options
 */
export function startSpeechRecognition(
  onResult: (text: string, isFinal: boolean) => void,
  onError: (error: any) => void
): { stop: () => void } {
  // Check if the browser supports the Web Speech API
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError(new Error("Speech recognition is not supported in this browser."));
    return { 
      stop: () => {}
    };
  }

  // Create a speech recognition instance
  // @ts-ignore - TypeScript doesn't know about SpeechRecognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  let isListening = false;

  recognition.onstart = () => {
    console.log("Speech recognition started");
    isListening = true;
  };

  recognition.onresult = (event: any) => {
    const result = event.results[event.results.length - 1];
    const text = result[0].transcript;
    const isFinal = result.isFinal;
    console.log(`Speech recognized: "${text}" (${isFinal ? 'final' : 'interim'})`);
    onResult(text, isFinal);
  };

  recognition.onerror = (event: any) => {
    console.error("Speech recognition error:", event.error);
    isListening = false;
    onError(event.error);
  };

  recognition.onend = () => {
    console.log("Speech recognition ended");
    isListening = false;
  };

  console.log("Starting speech recognition...");
  recognition.start();

  return {
    stop: () => {
      console.log("Stopping speech recognition...");
      recognition.stop();
    }
  };
}

/**
 * Detects wake word in speech
 * This is a simple implementation - in a production app, you'd use a more sophisticated approach
 */
export function detectWakeWord(text: string): boolean {
  const wakeWord = SYSTEM_CONFIG.WAKE_WORD.toLowerCase();
  return text.toLowerCase().includes(wakeWord);
}
