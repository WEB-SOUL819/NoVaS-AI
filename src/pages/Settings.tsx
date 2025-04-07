
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ModuleStatusCard from '@/components/ModuleStatusCard';
import { toast } from '@/components/ui/sonner';
import { Module } from '@/types';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { VOICE_CONFIG, AI_CONFIG } from '@/config/env';

// Demo data for modules, same as in Dashboard
const DEMO_MODULES: Module[] = [
  {
    id: "voice-engine",
    name: "Voice Engine",
    isActive: true,
    status: "operational",
    description: "Speech recognition and TTS functionality.",
  },
  {
    id: "ai-brain",
    name: "AI Brain",
    isActive: true,
    status: "operational",
    description: "Natural language processing and response generation.",
  },
  {
    id: "device-control",
    name: "Device Control",
    isActive: true,
    status: "limited",
    description: "Application and system control capabilities.",
  },
  {
    id: "iot-remote",
    name: "IoT & Remote",
    isActive: false,
    status: "offline",
    description: "Smart device control interface.",
  },
  {
    id: "computer-vision",
    name: "Computer Vision",
    isActive: false,
    status: "offline",
    description: "Visual recognition and processing.",
  },
  {
    id: "behavior-engine",
    name: "Behavior Engine",
    isActive: false,
    status: "offline",
    description: "Predictive planning and mood detection.",
  },
];

const Settings = () => {
  const [voiceSettings, setVoiceSettings] = useState({
    stability: VOICE_CONFIG.STABILITY,
    similarity: VOICE_CONFIG.SIMILARITY_BOOST,
    style: VOICE_CONFIG.STYLE,
    speakRate: VOICE_CONFIG.SPEAK_RATE,
  });

  const [aiSettings, setAiSettings] = useState({
    temperature: AI_CONFIG.TEMPERATURE,
    maxTokens: AI_CONFIG.MAX_OUTPUT_TOKENS,
    topP: AI_CONFIG.TOP_P,
  });

  const [modules, setModules] = useState<Module[]>(DEMO_MODULES);

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  const handleModuleToggle = (moduleId: string) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, isActive: !module.isActive } 
        : module
    ));
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header */}
      <header className="p-4 border-b border-gray-800 glass-panel">
        <div className="container flex items-center">
          <Link to="/" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-white">System Settings</h1>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container py-8">
        <Tabs defaultValue="general">
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-3 mb-8">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>AI Settings</CardTitle>
                  <CardDescription>Configure the AI model behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Temperature: {aiSettings.temperature.toFixed(2)}</Label>
                        <span className="text-xs text-muted-foreground">
                          {aiSettings.temperature < 0.3 ? "More precise" : aiSettings.temperature > 0.7 ? "More creative" : "Balanced"}
                        </span>
                      </div>
                      <Slider
                        value={[aiSettings.temperature]}
                        min={0}
                        max={1}
                        step={0.05}
                        onValueChange={(values) => setAiSettings({...aiSettings, temperature: values[0]})}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Max Output Tokens: {aiSettings.maxTokens}</Label>
                      </div>
                      <Slider
                        value={[aiSettings.maxTokens]}
                        min={128}
                        max={2048}
                        step={128}
                        onValueChange={(values) => setAiSettings({...aiSettings, maxTokens: values[0]})}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Top P: {aiSettings.topP.toFixed(2)}</Label>
                      </div>
                      <Slider
                        value={[aiSettings.topP]}
                        min={0.1}
                        max={1}
                        step={0.05}
                        onValueChange={(values) => setAiSettings({...aiSettings, topP: values[0]})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure the NoVaS system behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="wake-word">Wake Word</Label>
                    <Input id="wake-word" defaultValue="Hey NoVaS" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="auto-start" defaultChecked />
                    <Label htmlFor="auto-start">Start on system boot</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="debug-mode" defaultChecked />
                    <Label htmlFor="debug-mode">Debug mode</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="active-listening" />
                    <Label htmlFor="active-listening">Always listening mode</Label>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="log-location">Log File Location</Label>
                    <Input id="log-location" defaultValue="/var/log/novas/" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Voice Settings */}
          <TabsContent value="voice">
            <Card>
              <CardHeader>
                <CardTitle>Voice Engine Configuration</CardTitle>
                <CardDescription>Configure text-to-speech and speech recognition settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Text-to-Speech</h3>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Voice Stability: {voiceSettings.stability.toFixed(2)}</Label>
                        </div>
                        <Slider
                          value={[voiceSettings.stability]}
                          min={0}
                          max={1}
                          step={0.05}
                          onValueChange={(values) => setVoiceSettings({...voiceSettings, stability: values[0]})}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Similarity Boost: {voiceSettings.similarity.toFixed(2)}</Label>
                        </div>
                        <Slider
                          value={[voiceSettings.similarity]}
                          min={0}
                          max={1}
                          step={0.05}
                          onValueChange={(values) => setVoiceSettings({...voiceSettings, similarity: values[0]})}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Style Influence: {voiceSettings.style.toFixed(2)}</Label>
                        </div>
                        <Slider
                          value={[voiceSettings.style]}
                          min={0}
                          max={1}
                          step={0.05}
                          onValueChange={(values) => setVoiceSettings({...voiceSettings, style: values[0]})}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Speaking Rate: {voiceSettings.speakRate.toFixed(1)}x</Label>
                        </div>
                        <Slider
                          value={[voiceSettings.speakRate]}
                          min={0.5}
                          max={2.0}
                          step={0.1}
                          onValueChange={(values) => setVoiceSettings({...voiceSettings, speakRate: values[0]})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="voice-model">Voice Model</Label>
                        <Input id="voice-model" defaultValue={VOICE_CONFIG.MODEL_ID} readOnly />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Speech Recognition</h3>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="continuous-listening" defaultChecked />
                        <Label htmlFor="continuous-listening">Continuous listening mode</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="interim-results" defaultChecked />
                        <Label htmlFor="interim-results">Show interim results</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="language">Recognition Language</Label>
                        <Input id="language" defaultValue="en-US" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="stt-model">Speech-to-Text Model</Label>
                        <Input id="stt-model" defaultValue="Whisper" readOnly />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Response Preferences</h3>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="response-beep" defaultChecked />
                        <Label htmlFor="response-beep">Play sound when ready to listen</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="automatic-response" defaultChecked />
                        <Label htmlFor="automatic-response">Automatically respond to queries</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="outline" className="mr-2">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reset to Default
                </Button>
                <Button onClick={handleSaveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Modules Settings */}
          <TabsContent value="modules">
            <Card>
              <CardHeader>
                <CardTitle>System Modules</CardTitle>
                <CardDescription>Enable or disable system functionality modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modules.map((module) => (
                    <div key={module.id} className="flex items-start space-x-4 p-2 rounded-lg hover:bg-gray-800/50">
                      <Checkbox 
                        id={`module-${module.id}`} 
                        checked={module.isActive}
                        onCheckedChange={() => handleModuleToggle(module.id)}
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={`module-${module.id}`}
                          className="text-sm font-medium block mb-1"
                        >
                          {module.name}
                        </Label>
                        <p className="text-xs text-gray-400">{module.description}</p>
                        <div className="flex items-center mt-1">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            module.status === "operational" ? "bg-green-500" :
                            module.status === "limited" ? "bg-yellow-500" :
                            module.status === "error" ? "bg-red-500" :
                            "bg-gray-500"
                          }`}></div>
                          <span className="text-xs capitalize text-gray-400">{module.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleSaveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Module Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
