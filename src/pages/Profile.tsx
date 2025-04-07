
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { UserProfile } from "@/types";
import { ArrowLeft, Save, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    preferredVoice: "Sarah",
    theme: "dark" as "light" | "dark" | "system",
    notificationsEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setProfile({
            id: data.id,
            name: data.name,
            preferredVoice: data.preferred_voice,
            theme: data.theme as "light" | "dark" | "system",
            notificationsEnabled: data.notifications_enabled,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          });
        }
      } catch (error: any) {
        toast.error("Error loading profile: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: profile.name,
          preferred_voice: profile.preferredVoice,
          theme: profile.theme,
          notifications_enabled: profile.notificationsEnabled
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success("Profile saved successfully.");
    } catch (error: any) {
      toast.error("Error saving profile: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nova-600"></div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-foreground mb-2">User Profile</h1>
          <p className="text-muted-foreground">Manage your personal settings and preferences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="bg-card border-muted"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="voice" className="text-sm font-medium">Preferred Voice</label>
                <Input
                  id="voice"
                  value={profile.preferredVoice}
                  onChange={(e) => setProfile({ ...profile, preferredVoice: e.target.value })}
                  className="bg-card border-muted"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="theme" className="text-sm font-medium">Theme</label>
                <select
                  id="theme"
                  value={profile.theme}
                  onChange={(e) => setProfile({ ...profile, theme: e.target.value as "light" | "dark" | "system" })}
                  className="w-full p-2 rounded-md bg-card border border-muted"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications"
                  checked={profile.notificationsEnabled}
                  onCheckedChange={(checked) => setProfile({ ...profile, notificationsEnabled: checked })}
                />
                <label htmlFor="notifications" className="text-sm font-medium">
                  Enable Notifications
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveProfile} 
                className="w-full nova-gradient"
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Account Preferences</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">User ID: {profile.id?.substring(0, 8)}</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button variant="outline" className="w-full">
                  Change Profile Picture
                </Button>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                  Delete Account
                </Button>
              </CardFooter>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Manage your privacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="data-collection" className="text-sm font-medium">
                    Data Collection
                  </label>
                  <Switch id="data-collection" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <label htmlFor="voice-recording" className="text-sm font-medium">
                    Voice Recording Storage
                  </label>
                  <Switch id="voice-recording" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <label htmlFor="analytics" className="text-sm font-medium">
                    Usage Analytics
                  </label>
                  <Switch id="analytics" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
