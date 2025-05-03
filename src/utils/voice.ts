
import { API_KEYS, VOICE_CONFIG } from "@/config/env";
import { freeTTS } from "./freeTTS";
import { toast } from "sonner";

// Use premium TTS if API key is available, otherwise use free TTS
const usePremiumTTS = !!API_KEYS.ELEVEN_LABS_API_KEY;

// Text to speech using ElevenLabs API if available
export async function textToSpeech(text: string): Promise<Blob | null> {
  try {
    if (usePremiumTTS) {
      return await premiumTextToSpeech(text);
    } else {
      return await freeTTS.textToSpeech(text, "en-US");
    }
  } catch (error) {
    console.error("Text to speech error:", error);
    toast.error("Text to speech failed. Falling back to browser TTS.");
    // Fallback to free TTS if premium fails
    return await freeTTS.textToSpeech(text, "en-US");
  }
}

// Premium TTS using ElevenLabs
async function premiumTextToSpeech(text: string): Promise<Blob | null> {
  if (!API_KEYS.ELEVEN_LABS_API_KEY) {
    console.warn("No ElevenLabs API key provided");
    return null;
  }
  
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_CONFIG.VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': API_KEYS.ELEVEN_LABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: VOICE_CONFIG.MODEL_ID,
        voice_settings: {
          stability: VOICE_CONFIG.STABILITY,
          similarity_boost: VOICE_CONFIG.SIMILARITY_BOOST,
          style: VOICE_CONFIG.STYLE,
          use_speaker_boost: true,
          speaking_rate: VOICE_CONFIG.SPEAK_RATE
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    const audioBlob = await response.blob();
    return audioBlob;
  } catch (error) {
    console.error("ElevenLabs API error:", error);
    return null;
  }
}

// Play audio from blob
export async function playAudio(audioBlob: Blob | null): Promise<void> {
  if (!audioBlob) {
    if (!usePremiumTTS) {
      // For free TTS, we don't get a blob, audio is played directly
      return;
    }
    console.error("No audio blob to play");
    return;
  }
  
  try {
    // Create audio element
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    // Create global reference to current audio for stop functionality
    (window as any).currentAudio = audio;
    
    await audio.play();
    
    return new Promise<void>((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        (window as any).currentAudio = null;
        resolve();
      };
    });
  } catch (error) {
    console.error("Error playing audio:", error);
  }
}

// Stop audio playback
export function stopAudio(): void {
  // Stop premium audio if playing
  const currentAudio = (window as any).currentAudio;
  if (currentAudio) {
    currentAudio.pause();
    (window as any).currentAudio = null;
  }
  
  // Also stop browser TTS if active
  freeTTS.stopSpeech();
}

// Speech recognition
export function startSpeechRecognition(
  onResult: (text: string, isFinal: boolean) => void,
  onError: (error: any) => void
): { stop: () => void } | null {
  const SpeechRecognition = (window as any).SpeechRecognition || 
                          (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError(new Error("Speech recognition not supported in this browser"));
    return null;
  }
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  
  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
        onResult(finalTranscript, true);
      } else {
        interimTranscript += event.results[i][0].transcript;
        onResult(interimTranscript, false);
      }
    }
  };
  
  recognition.onerror = onError;
  
  recognition.start();
  
  return {
    stop: () => {
      recognition.stop();
    }
  };
}
