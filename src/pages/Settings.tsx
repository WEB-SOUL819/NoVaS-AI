
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VOICE_CONFIG, SYSTEM_CONFIG, AI_CONFIG } from "@/config/env";
import { 
  ArrowLeft, Save, Mic, Volume2, Brain, Shield, 
  Lightbulb, ChevronDown, ChevronUp, Sparkles, 
  Zap, Database, Cpu, Globe, Languages, Cloud
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

const Settings = () => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  
  // Voice Settings State
  const [voiceSettings, setVoiceSettings] = useState({
    voiceId: VOICE_CONFIG.VOICE_ID,
    stability: VOICE_CONFIG.STABILITY,
    similarityBoost: VOICE_CONFIG.SIMILARITY_BOOST,
    style: VOICE_CONFIG.STYLE,
    speakRate: VOICE_CONFIG.SPEAK_RATE,
  });

  // AI Settings State
  const [aiSettings, setAiSettings] = useState({
    model: AI_CONFIG.MODEL,
    temperature: AI_CONFIG.TEMPERATURE,
    maxOutputTokens: AI_CONFIG.MAX_OUTPUT_TOKENS,
    topP: AI_CONFIG.TOP_P,
    topK: AI_CONFIG.TOP_K,
    knowledgeBases: [
      { id: 'general', name: 'General Knowledge', enabled: true },
      { id: 'news', name: 'News & Current Events', enabled: true },
      { id: 'science', name: 'Science & Technology', enabled: true },
      { id: 'history', name: 'History & Culture', enabled: false },
      { id: 'medicine', name: 'Health & Medicine', enabled: false },
      { id: 'finance', name: 'Business & Finance', enabled: false },
    ]
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    wakeWord: SYSTEM_CONFIG.WAKE_WORD,
    debugMode: SYSTEM_CONFIG.DEBUG_MODE,
    notificationMethods: [
      { id: 'webNotification', name: 'Web Notifications', enabled: true },
      { id: 'indexedDB', name: 'IndexedDB Storage', enabled: true },
      { id: 'localStorage', name: 'Local Storage', enabled: true },
      { id: 'serviceWorker', name: 'Service Worker', enabled: true },
      { id: 'chromiumAPI', name: 'Browser Extensions API', enabled: false },
    ],
    appearanceSettings: {
      enableAnimations: true,
      reducedMotion: false,
      enableGlassEffect: true,
      darkModeEnhanced: true
    }
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      }
    }
  };

  // Toggle section expanded/collapsed
  const toggleSection = (sectionName: string) => {
    if (activeSection === sectionName) {
      setActiveSection(null);
    } else {
      setActiveSection(sectionName);
    }
  };

  // Handle saving settings
  const handleSaveSettings = () => {
    toast.success("Settings saved successfully", {
      description: "Your preferences have been updated",
      action: {
        label: "Undo",
        onClick: () => toast.info("Changes reverted")
      },
    });
  };

  // Toggle knowledge base
  const toggleKnowledgeBase = (id: string) => {
    setAiSettings({
      ...aiSettings,
      knowledgeBases: aiSettings.knowledgeBases.map(kb => 
        kb.id === id ? { ...kb, enabled: !kb.enabled } : kb
      )
    });
  };

  // Toggle notification method
  const toggleNotificationMethod = (id: string) => {
    setSystemSettings({
      ...systemSettings,
      notificationMethods: systemSettings.notificationMethods.map(method => 
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    });
  };

  return (
    <motion.div 
      className="min-h-screen bg-background p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.header 
        className="container mx-auto py-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Link to="/dashboard" className="flex items-center text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </motion.header>

      <motion.main 
        className="container mx-auto max-w-4xl py-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="mb-8 text-center"
          variants={itemVariants}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">System Settings</h1>
          <p className="text-muted-foreground">Configure and optimize your experience</p>
        </motion.div>

        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="voice" className="flex items-center">
              <Volume2 className="mr-2 h-4 w-4" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center">
              <Brain className="mr-2 h-4 w-4" />
              AI Model
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Voice Settings Tab */}
          <TabsContent value="voice">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Card className="glass-panel mb-6 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Volume2 className="mr-2 h-5 w-5" />
                      Voice Engine Settings
                    </CardTitle>
                    <CardDescription>Configure speech recognition and text-to-speech preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Voice ID</label>
                      <select
                        value={voiceSettings.voiceId}
                        onChange={(e) => setVoiceSettings({ ...voiceSettings, voiceId: e.target.value })}
                        className="w-full p-2 rounded-md bg-card border border-muted"
                      >
                        <option value="EXAVITQu4vr4xnSDxMaL">Sarah (Default)</option>
                        <option value="9BWtsMINqrJLrRacOk9x">Aria</option>
                        <option value="CwhRBWXzGAHq8TQ4Fs17">Roger</option>
                        <option value="FGY2WhTYpPnrIDTdsKH5">Laura</option>
                        <option value="IKne3meq5aSn9XLyUdCD">Charlie</option>
                        <option value="JBFqnCBsd6RMkjVDRZzb">George</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Text-to-speech voice identifier
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Stability: {voiceSettings.stability.toFixed(2)}</label>
                      </div>
                      <Slider
                        value={[voiceSettings.stability]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => setVoiceSettings({ ...voiceSettings, stability: value[0] })}
                        className="py-4"
                      />
                      <p className="text-xs text-muted-foreground">
                        Higher stability makes voice more consistent but less expressive (0-1)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">
                          Similarity Boost: {voiceSettings.similarityBoost.toFixed(2)}
                        </label>
                      </div>
                      <Slider
                        value={[voiceSettings.similarityBoost]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => setVoiceSettings({ ...voiceSettings, similarityBoost: value[0] })}
                        className="py-4"
                      />
                      <p className="text-xs text-muted-foreground">
                        Higher similarity makes voice more similar to original but may sound less natural (0-1)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Style: {voiceSettings.style.toFixed(2)}</label>
                      </div>
                      <Slider
                        value={[voiceSettings.style]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => setVoiceSettings({ ...voiceSettings, style: value[0] })}
                        className="py-4"
                      />
                      <p className="text-xs text-muted-foreground">
                        Style factor affects speaking style variations (0-1)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Speaking Rate: {voiceSettings.speakRate.toFixed(2)}</label>
                      </div>
                      <Slider
                        value={[voiceSettings.speakRate]}
                        min={0.5}
                        max={2.0}
                        step={0.01}
                        onValueChange={(value) => setVoiceSettings({ ...voiceSettings, speakRate: value[0] })}
                        className="py-4"
                      />
                      <p className="text-xs text-muted-foreground">
                        Speed of speech (0.5-2.0)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div 
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => toggleSection('speechRecognition')}
                      >
                        <Mic className="h-4 w-4" />
                        <h3 className="text-sm font-medium">Speech Recognition</h3>
                        {activeSection === 'speechRecognition' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      <Separator />
                      
                      {activeSection === 'speechRecognition' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 py-2"
                        >
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="continuous-listening" className="text-sm">
                              Continuous Listening Mode
                            </label>
                            <Switch id="continuous-listening" />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="wake-word" className="text-sm">
                              Wake Word Detection
                            </label>
                            <Switch id="wake-word" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="voice-commands" className="text-sm">
                              Enable Voice Commands
                            </label>
                            <Switch id="voice-commands" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="voice-feedback" className="text-sm">
                              Voice Feedback
                            </label>
                            <Switch id="voice-feedback" defaultChecked />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveSettings} className="w-full nova-gradient">
                      <Save className="mr-2 h-4 w-4" />
                      Save Voice Settings
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Voice Enhancements
                    </CardTitle>
                    <CardDescription>Advanced voice features and capabilities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div 
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => toggleSection('voiceEnhancement')}
                      >
                        <Zap className="h-4 w-4" />
                        <h3 className="text-sm font-medium">Voice Effects & Processing</h3>
                        {activeSection === 'voiceEnhancement' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      <Separator />
                      
                      {activeSection === 'voiceEnhancement' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 py-2"
                        >
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="background-noise-reduction" className="text-sm">
                              Background Noise Reduction
                            </label>
                            <Switch id="background-noise-reduction" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="voice-clarity-enhancement" className="text-sm">
                              Voice Clarity Enhancement
                            </label>
                            <Switch id="voice-clarity-enhancement" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="emotional-tone-detection" className="text-sm">
                              Emotional Tone Detection
                            </label>
                            <Switch id="emotional-tone-detection" />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="multi-speaker-recognition" className="text-sm">
                              Multi-Speaker Recognition
                            </label>
                            <Switch id="multi-speaker-recognition" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveSettings} className="w-full nova-gradient">
                      <Save className="mr-2 h-4 w-4" />
                      Save Enhancement Settings
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* AI Model Settings Tab */}
          <TabsContent value="ai">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Card className="glass-panel mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="mr-2 h-5 w-5" />
                      AI Model Settings
                    </CardTitle>
                    <CardDescription>Configure the AI model parameters and behavior</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">AI Model</label>
                      <select
                        value={aiSettings.model}
                        onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
                        className="w-full p-2 rounded-md bg-card border border-muted"
                      >
                        <option value="gemini-pro">Gemini Pro</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        <option value="claude-3">Claude 3</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="llama-3">Llama 3</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Temperature: {aiSettings.temperature.toFixed(2)}</label>
                      </div>
                      <Slider
                        value={[aiSettings.temperature]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => setAiSettings({ ...aiSettings, temperature: value[0] })}
                        className="py-4"
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls randomness of responses. Higher values make output more random (0-1)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">
                          Max Output Tokens: {aiSettings.maxOutputTokens}
                        </label>
                      </div>
                      <Slider
                        value={[aiSettings.maxOutputTokens]}
                        min={256}
                        max={4096}
                        step={128}
                        onValueChange={(value) => setAiSettings({ ...aiSettings, maxOutputTokens: value[0] })}
                        className="py-4"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum length of generated responses
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Top P: {aiSettings.topP.toFixed(2)}</label>
                      </div>
                      <Slider
                        value={[aiSettings.topP]}
                        min={0.1}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => setAiSettings({ ...aiSettings, topP: value[0] })}
                        className="py-4"
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls diversity via nucleus sampling (0.1-1)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Top K: {aiSettings.topK}</label>
                      </div>
                      <Slider
                        value={[aiSettings.topK]}
                        min={1}
                        max={100}
                        step={1}
                        onValueChange={(value) => setAiSettings({ ...aiSettings, topK: value[0] })}
                        className="py-4"
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls diversity by limiting to top K tokens (1-100)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div 
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => toggleSection('aiBehavior')}
                      >
                        <Brain className="h-4 w-4" />
                        <h3 className="text-sm font-medium">AI Behavior</h3>
                        {activeSection === 'aiBehavior' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      <Separator />
                      
                      {activeSection === 'aiBehavior' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 py-2"
                        >
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="context-memory" className="text-sm">
                              Conversation Context Memory
                            </label>
                            <Switch id="context-memory" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="proactive" className="text-sm">
                              Proactive Suggestions
                            </label>
                            <Switch id="proactive" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="personality" className="text-sm">
                              Enhanced Personality
                            </label>
                            <Switch id="personality" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="explanations" className="text-sm">
                              Detailed Explanations
                            </label>
                            <Switch id="explanations" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveSettings} className="w-full nova-gradient">
                      <Save className="mr-2 h-4 w-4" />
                      Save AI Settings
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="mr-2 h-5 w-5" />
                      Knowledge Bases
                    </CardTitle>
                    <CardDescription>Configure the AI's knowledge sources</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {aiSettings.knowledgeBases.map(kb => (
                        <div key={kb.id} className="flex items-center justify-between py-2">
                          <label htmlFor={`kb-${kb.id}`} className="text-sm flex items-center">
                            {kb.id === 'general' && <Cpu className="h-4 w-4 mr-2" />}
                            {kb.id === 'news' && <Globe className="h-4 w-4 mr-2" />}
                            {kb.id === 'science' && <Lightbulb className="h-4 w-4 mr-2" />}
                            {kb.id === 'history' && <Database className="h-4 w-4 mr-2" />}
                            {kb.id === 'medicine' && <Cpu className="h-4 w-4 mr-2" />}
                            {kb.id === 'finance' && <Languages className="h-4 w-4 mr-2" />}
                            {kb.name}
                          </label>
                          <Switch 
                            id={`kb-${kb.id}`} 
                            checked={kb.enabled}
                            onCheckedChange={() => toggleKnowledgeBase(kb.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveSettings} className="w-full nova-gradient">
                      <Save className="mr-2 h-4 w-4" />
                      Save Knowledge Base Settings
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Card className="glass-panel mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      System Settings
                    </CardTitle>
                    <CardDescription>Configure system-wide settings and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Wake Word</label>
                      <input
                        type="text"
                        value={systemSettings.wakeWord}
                        onChange={(e) => setSystemSettings({ ...systemSettings, wakeWord: e.target.value })}
                        className="w-full p-2 rounded-md bg-card border border-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        The phrase that activates voice recognition (default: "Hey NoVaS")
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div 
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => toggleSection('systemConfig')}
                      >
                        <Shield className="h-4 w-4" />
                        <h3 className="text-sm font-medium">System Configuration</h3>
                        {activeSection === 'systemConfig' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      <Separator />
                      
                      {activeSection === 'systemConfig' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 py-2"
                        >
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="debug-mode" className="text-sm">
                              Debug Mode
                            </label>
                            <Switch
                              id="debug-mode"
                              checked={systemSettings.debugMode}
                              onCheckedChange={(checked) =>
                                setSystemSettings({ ...systemSettings, debugMode: checked })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="startup" className="text-sm">
                              Launch on System Startup
                            </label>
                            <Switch id="startup" />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="updates" className="text-sm">
                              Automatic Updates
                            </label>
                            <Switch id="updates" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="telemetry" className="text-sm">
                              Send Anonymous Usage Data
                            </label>
                            <Switch id="telemetry" />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div 
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => toggleSection('appearance')}
                      >
                        <Sparkles className="h-4 w-4" />
                        <h3 className="text-sm font-medium">Appearance</h3>
                        {activeSection === 'appearance' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      <Separator />
                      
                      {activeSection === 'appearance' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 py-2"
                        >
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="enable-animations" className="text-sm">
                              Enable Animations
                            </label>
                            <Switch 
                              id="enable-animations" 
                              checked={systemSettings.appearanceSettings.enableAnimations}
                              onCheckedChange={(checked) =>
                                setSystemSettings({ 
                                  ...systemSettings, 
                                  appearanceSettings: {
                                    ...systemSettings.appearanceSettings,
                                    enableAnimations: checked
                                  }
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="reduced-motion" className="text-sm">
                              Reduced Motion
                            </label>
                            <Switch 
                              id="reduced-motion" 
                              checked={systemSettings.appearanceSettings.reducedMotion}
                              onCheckedChange={(checked) =>
                                setSystemSettings({ 
                                  ...systemSettings, 
                                  appearanceSettings: {
                                    ...systemSettings.appearanceSettings,
                                    reducedMotion: checked
                                  }
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="glass-effect" className="text-sm">
                              Glass Effect
                            </label>
                            <Switch 
                              id="glass-effect" 
                              checked={systemSettings.appearanceSettings.enableGlassEffect}
                              onCheckedChange={(checked) =>
                                setSystemSettings({ 
                                  ...systemSettings, 
                                  appearanceSettings: {
                                    ...systemSettings.appearanceSettings,
                                    enableGlassEffect: checked
                                  }
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <label htmlFor="enhanced-dark" className="text-sm">
                              Enhanced Dark Mode
                            </label>
                            <Switch 
                              id="enhanced-dark" 
                              checked={systemSettings.appearanceSettings.darkModeEnhanced}
                              onCheckedChange={(checked) =>
                                setSystemSettings({ 
                                  ...systemSettings, 
                                  appearanceSettings: {
                                    ...systemSettings.appearanceSettings,
                                    darkModeEnhanced: checked
                                  }
                                })
                              }
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div 
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => toggleSection('notificationSettings')}
                      >
                        <Cloud className="h-4 w-4" />
                        <h3 className="text-sm font-medium">Notification Methods</h3>
                        {activeSection === 'notificationSettings' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      <Separator />
                      
                      {activeSection === 'notificationSettings' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 py-2"
                        >
                          {systemSettings.notificationMethods.map(method => (
                            <div key={method.id} className="flex items-center justify-between py-2">
                              <label htmlFor={`method-${method.id}`} className="text-sm">
                                {method.name}
                              </label>
                              <Switch 
                                id={`method-${method.id}`} 
                                checked={method.enabled}
                                onCheckedChange={() => toggleNotificationMethod(method.id)}
                              />
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div 
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => toggleSection('dataManagement')}
                      >
                        <Database className="h-4 w-4" />
                        <h3 className="text-sm font-medium">Data Management</h3>
                        {activeSection === 'dataManagement' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      <Separator />
                      
                      {activeSection === 'dataManagement' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 py-2"
                        >
                          <div className="py-2">
                            <Button variant="outline" className="w-full mb-2 flex items-center justify-center">
                              <Database className="mr-2 h-4 w-4" />
                              Export Conversation History
                            </Button>
                            <Button variant="outline" className="w-full mb-2 flex items-center justify-center">
                              <Save className="mr-2 h-4 w-4" />
                              Backup Settings
                            </Button>
                            <Button variant="outline" className="w-full text-destructive hover:text-destructive flex items-center justify-center">
                              <x-circle className="mr-2 h-4 w-4" />
                              Clear All Data
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveSettings} className="w-full nova-gradient">
                      <Save className="mr-2 h-4 w-4" />
                      Save System Settings
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.main>
    </motion.div>
  );
};

export default Settings;
