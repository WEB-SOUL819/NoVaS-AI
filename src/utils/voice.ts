
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error("TTS API Error:", errorData);
      throw new Error(`TTS API error: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error("Error in textToSpeech:", error);
    return null;
  }
}

/**
 * Plays audio from a blob
 */
export async function playAudio(audioBlob: Blob): Promise<void> {
  try {
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };
      
      audio.play().catch(reject);
    });
  } catch (error) {
    console.error("Error playing audio:", error);
    throw error;
  }
}

/**
 * Speech-to-Text placeholder function
 * In a real implementation, this would use a Web Speech API or similar
 */
export function startSpeechRecognition(
  onResult: (text: string, isFinal: boolean) => void,
  onError: (error: any) => void
): { stop: () => void } {
  // Check if the browser supports the Web Speech API
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError(new Error("Speech recognition is not supported in this browser."));
    return { stop: () => {} };
  }

  // Create a speech recognition instance
  // @ts-ignore - TypeScript doesn't know about SpeechRecognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    const result = event.results[event.results.length - 1];
    const text = result[0].transcript;
    const isFinal = result.isFinal;
    
    onResult(text, isFinal);
  };

  recognition.onerror = (event: any) => {
    onError(event.error);
  };

  recognition.start();

  return {
    stop: () => recognition.stop(),
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
