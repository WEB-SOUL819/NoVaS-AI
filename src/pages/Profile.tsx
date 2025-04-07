
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AssistantAvatar from '@/components/AssistantAvatar';
import { UserProfile } from '@/types';
import { DEFAULT_USER_PROFILE } from '@/config/env';
import { toast } from '@/components/ui/sonner';
import { ArrowLeft, Save } from 'lucide-react';

const Profile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    ...DEFAULT_USER_PROFILE,
    name: 'John Doe', // Example data
  });

  const handleSave = () => {
    // Here you would normally save to database/localStorage
    toast.success("Profile updated successfully!");
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
          <h1 className="text-xl font-bold text-white">User Profile</h1>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Picture & Preview */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>How your profile appears to NoVaS</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {userProfile.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-medium">{userProfile.name}</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-300">Active</span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assistant Voice</CardTitle>
                  <CardDescription>Customize how NoVaS speaks to you</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <AssistantAvatar size="md" />
                  <Select 
                    value={userProfile.preferredVoice}
                    onValueChange={(value) => setUserProfile({...userProfile, preferredVoice: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>ElevenLabs Voices</SelectLabel>
                        <SelectItem value="Sarah">Sarah (Female)</SelectItem>
                        <SelectItem value="Roger">Roger (Male)</SelectItem>
                        <SelectItem value="Charlotte">Charlotte (Female)</SelectItem>
                        <SelectItem value="Brian">Brian (Male)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Profile Settings */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Interface Preferences</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="theme">Theme</Label>
                      <p className="text-xs text-muted-foreground">Choose your interface theme</p>
                    </div>
                    <Select 
                      value={userProfile.theme}
                      onValueChange={(value: 'light' | 'dark' | 'system') => setUserProfile({...userProfile, theme: value})}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notifications</Label>
                      <p className="text-xs text-muted-foreground">Enable or disable system notifications</p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={userProfile.notificationsEnabled}
                      onCheckedChange={(checked) => setUserProfile({...userProfile, notificationsEnabled: checked})}
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Privacy Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-collection">Data Collection</Label>
                      <p className="text-xs text-muted-foreground">Allow NoVaS to collect usage data</p>
                    </div>
                    <Switch id="data-collection" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="conversation-history">Save Conversation History</Label>
                      <p className="text-xs text-muted-foreground">Store your conversations for future reference</p>
                    </div>
                    <Switch id="conversation-history" defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
