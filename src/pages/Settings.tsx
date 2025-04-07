
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VOICE_CONFIG, SYSTEM_CONFIG, AI_CONFIG } from "@/config/env";
import { ArrowLeft, Save, Mic, Volume2, Brain, Shield } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
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
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    wakeWord: SYSTEM_CONFIG.WAKE_WORD,
    debugMode: SYSTEM_CONFIG.DEBUG_MODE,
  });

  // Handle saving settings
  const handleSaveSettings = () => {
    // In a real app, this would save to a config file or database
    toast.success("Settings saved successfully.");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="container mx-auto py-4">
        <Link to="/dashboard" className="flex items-center text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </header>

      <main className="container mx-auto max-w-4xl py-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">System Settings</h1>
          <p className="text-muted-foreground">Configure and optimize NoVaS for your needs</p>
        </div>

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
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Voice Engine Settings</CardTitle>
                <CardDescription>Configure speech recognition and text-to-speech preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice ID</label>
                  <input
                    type="text"
                    value={voiceSettings.voiceId}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, voiceId: e.target.value })}
                    className="w-full p-2 rounded-md bg-card border border-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    ElevenLabs voice identifier. Default: Sarah (EXAVITQu4vr4xnSDxMaL)
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
                  />
                  <p className="text-xs text-muted-foreground">
                    Speed of speech (0.5-2.0)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mic className="h-4 w-4" />
                    <h3 className="text-sm font-medium">Speech Recognition</h3>
                  </div>
                  <Separator />
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
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} className="w-full nova-gradient">
                  <Save className="mr-2 h-4 w-4" />
                  Save Voice Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* AI Model Settings Tab */}
          <TabsContent value="ai">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>AI Model Settings</CardTitle>
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
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls diversity by limiting to top K tokens (1-100)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <h3 className="text-sm font-medium">AI Behavior</h3>
                  </div>
                  <Separator />
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
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} className="w-full nova-gradient">
                  <Save className="mr-2 h-4 w-4" />
                  Save AI Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
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
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <h3 className="text-sm font-medium">System Configuration</h3>
                  </div>
                  <Separator />
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
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium">Data Management</h3>
                  </div>
                  <Separator />
                  <div className="py-2">
                    <Button variant="outline" className="w-full mb-2">
                      Export Conversation History
                    </Button>
                    <Button variant="outline" className="w-full mb-2">
                      Backup Settings
                    </Button>
                    <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} className="w-full nova-gradient">
                  <Save className="mr-2 h-4 w-4" />
                  Save System Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
