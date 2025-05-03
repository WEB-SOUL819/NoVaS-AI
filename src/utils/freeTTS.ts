
/**
 * A free text-to-speech implementation using the Web Speech API
 */

// Available voices for the free TTS system
let voices: SpeechSynthesisVoice[] = [];
let isVoicesLoaded = false;

// Load available voices
export const loadVoices = () => {
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    // Check if voices are already loaded
    voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      isVoicesLoaded = true;
      resolve(voices);
      return;
    }

    // If not loaded, wait for them to load
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      isVoicesLoaded = true;
      resolve(voices);
    };
  });
};

// Get available voices
export const getAvailableVoices = async (): Promise<SpeechSynthesisVoice[]> => {
  if (!isVoicesLoaded) {
    await loadVoices();
  }
  return voices;
};

// Get a specific voice by name or language
export const getVoice = async (
  nameOrLang: string
): Promise<SpeechSynthesisVoice | null> => {
  if (!isVoicesLoaded) {
    await loadVoices();
  }

  // Try to match by name first (case-insensitive)
  const byName = voices.find(
    (v) => v.name.toLowerCase() === nameOrLang.toLowerCase()
  );
  if (byName) return byName;

  // Then try to match by language
  const byLang = voices.find((v) => v.lang.includes(nameOrLang));
  if (byLang) return byLang;

  // If no match, try to find a default English voice
  const enVoice = voices.find((v) => v.lang.includes("en-US") && v.default);
  if (enVoice) return enVoice;

  // Fallback to any English voice
  const anyEnVoice = voices.find((v) => v.lang.includes("en"));
  if (anyEnVoice) return anyEnVoice;

  // Fallback to any default voice
  const defaultVoice = voices.find((v) => v.default);
  if (defaultVoice) return defaultVoice;

  // Last resort: first available voice
  return voices[0] || null;
};

// Text to speech function
export const textToSpeech = async (
  text: string,
  voiceNameOrLang: string = "en-US",
  rate: number = 1,
  pitch: number = 1,
  volume: number = 1
): Promise<Blob | null> => {
  if (!window.speechSynthesis) {
    console.error("Web Speech API is not supported in this browser");
    return null;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Set up utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get and set voice
    const voice = await getVoice(voiceNameOrLang);
    if (voice) {
      utterance.voice = voice;
    }

    // Set other properties
    utterance.rate = Math.max(0.1, Math.min(2, rate));
    utterance.pitch = Math.max(0, Math.min(2, pitch));
    utterance.volume = Math.max(0, Math.min(1, volume));
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
    
    // No Blob is returned since Web Speech API doesn't work that way
    return null;
  } catch (error) {
    console.error("Error in textToSpeech:", error);
    return null;
  }
};

// Stop any ongoing speech
export const stopSpeech = (): void => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

// Check if the browser supports the Web Speech API
export const isSpeechSynthesisSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

// Check if speech synthesis is currently speaking
export const isSpeaking = (): boolean => {
  return window.speechSynthesis ? window.speechSynthesis.speaking : false;
};

// Export a modified version of the speech function that returns an AudioBlob
// to match the interface of the premium TTS service
export const getFreeTTSAsBlob = async (
  text: string,
  voiceNameOrLang: string = "en-US"
): Promise<Blob | null> => {
  await textToSpeech(text, voiceNameOrLang);
  return null; // No blob is returned, but the function signature matches
};

// Initialize voices when this module is imported
loadVoices();
