import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { getOpenAIApiKey, saveOpenAIApiKey, verifyOpenAIApiKey } from "@/lib/ai-service";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Globe,
  Shield,
  MessageSquare,
  Mail,
  Calendar,
  FileText,
  CheckSquare,
  Sparkles,
  Zap,
  Clock,
  LayoutGrid,
  Save,
  Moon,
  Sun,
  LaptopIcon,
  CircleCheck,
  Sliders,
  Lock,
  Key,
  UserPlus,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Settings page with category tabs and sections
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifyingKey, setVerifyingKey] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // General settings
    language: "english",
    theme: theme || "light",
    notifications: true,
    soundEffects: true,
    desktopNotifications: true,
    
    // Appearance settings
    density: "comfortable",
    colorScheme: "default",
    fontSize: "medium",
    sidebarCollapsed: false,
    
    // Task settings
    defaultTaskView: "kanban",
    showCompletedTasks: true,
    autoAssignDueDates: false,
    defaultPriority: "medium",
    
    // Document settings
    defaultEditor: "rich",
    autosaveInterval: 60,
    showCollaboratorsInEditor: true,
    enableSpellCheck: true,
    
    // Chat settings
    showReadReceipts: true,
    enterToSend: true,
    showTypingIndicators: true,
    messageGrouping: true,
    
    // Meeting settings
    defaultMeetingDuration: 30,
    autoRecordMeetings: false,
    sendMeetingReminders: true,
    automaticTranscription: true,
    
    // Email settings
    emailSignature: "",
    showEmailAvatars: true,
    threadedConversations: true,
    emailDigestFrequency: "daily",
    
    // Timeline settings
    timelineLayout: "week",
    showWeekends: true,
    workingHours: { start: "09:00", end: "17:00" },
    colorCodeEvents: true,
    
    // AI settings
    openAIKey: "",
    openAIKeyVerified: false,
    aiModel: "gpt-4o",
    enableAIAssistant: true,
    aiPrivacyLevel: "workspace",
    saveAIHistory: true,
    aiVoiceCommands: false,
    
    // Privacy & Security
    twoFactorAuth: false,
    logRetentionDays: 30,
    allowDataAnalytics: true,
    shareUsageData: true,
  });
  
  // Load API key on component mount
  useEffect(() => {
    const savedKey = getOpenAIApiKey();
    if (savedKey) {
      setSettings(prev => ({
        ...prev,
        openAIKey: savedKey,
        openAIKeyVerified: true
      }));
    }
  }, []);
  
  // Verify OpenAI API key
  const handleVerifyApiKey = async () => {
    if (!settings.openAIKey) {
      toast({
        title: "API Key Required",
        description: "Please enter an OpenAI API key to verify.",
        variant: "destructive",
      });
      return;
    }
    
    setVerifyingKey(true);
    try {
      const isValid = await verifyOpenAIApiKey(settings.openAIKey);
      
      if (isValid) {
        await saveOpenAIApiKey(settings.openAIKey);
        setSettings(prev => ({ ...prev, openAIKeyVerified: true }));
        toast({
          title: "API Key Verified",
          description: "Your OpenAI API key has been verified and saved.",
        });
      } else {
        toast({
          title: "Invalid API Key",
          description: "The provided API key could not be verified. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "An error occurred while verifying your API key.",
        variant: "destructive",
      });
    } finally {
      setVerifyingKey(false);
    }
  };
  
  // Update a setting
  const updateSetting = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Save settings
  const saveSettings = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    }, 1000);
  };
  
  // Reset to defaults
  const resetToDefaults = () => {
    // In a real app, this would be a call to get default settings
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      
      toast({
        title: "Settings reset",
        description: "All settings have been restored to their default values.",
      });
    }, 1000);
  };
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex items-center mb-6">
        <SettingsIcon className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
          <TabsTrigger value="general" className="flex items-center">
            <Sliders className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center">
            <LayoutGrid className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center">
            <CheckSquare className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Meetings</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">AI Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic application settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => updateSetting("general", "language", value)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-4">
                    <Button 
                      variant={theme === 'light' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => {
                        setTheme('light');
                        updateSetting("general", "theme", "light");
                      }}
                      className="flex items-center"
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button 
                      variant={theme === 'dark' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => {
                        setTheme('dark');
                        updateSetting("general", "theme", "dark");
                      }}
                      className="flex items-center"
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button 
                      variant={theme === 'system' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => {
                        setTheme('system');
                        updateSetting("general", "theme", "system");
                      }}
                      className="flex items-center"
                    >
                      <LaptopIcon className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Enable notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about updates and activity
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={settings.notifications}
                      onCheckedChange={(checked) => updateSetting("general", "notifications", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="soundEffects">Sound effects</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sounds for notifications and actions
                      </p>
                    </div>
                    <Switch
                      id="soundEffects"
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) => updateSetting("general", "soundEffects", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="desktopNotifications">Desktop notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show system notifications on your desktop
                      </p>
                    </div>
                    <Switch
                      id="desktopNotifications"
                      checked={settings.desktopNotifications}
                      onCheckedChange={(checked) => updateSetting("general", "desktopNotifications", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how NebulaOne looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="density">Interface Density</Label>
                  <Select 
                    value={settings.density} 
                    onValueChange={(value) => updateSetting("appearance", "density", value)}
                  >
                    <SelectTrigger id="density">
                      <SelectValue placeholder="Select density" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="cozy">Cozy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="colorScheme">Color Scheme</Label>
                  <Select 
                    value={settings.colorScheme} 
                    onValueChange={(value) => updateSetting("appearance", "colorScheme", value)}
                  >
                    <SelectTrigger id="colorScheme">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="indigo">Indigo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select 
                    value={settings.fontSize} 
                    onValueChange={(value) => updateSetting("appearance", "fontSize", value)}
                  >
                    <SelectTrigger id="fontSize">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="x-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sidebarCollapsed">Collapsed Sidebar</Label>
                    <p className="text-sm text-muted-foreground">
                      Start with a collapsed sidebar for more screen space
                    </p>
                  </div>
                  <Switch
                    id="sidebarCollapsed"
                    checked={settings.sidebarCollapsed}
                    onCheckedChange={(checked) => updateSetting("appearance", "sidebarCollapsed", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Tasks Settings Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tasks Settings</CardTitle>
              <CardDescription>
                Configure task management and project board preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultTaskView">Default Task View</Label>
                  <Select 
                    value={settings.defaultTaskView} 
                    onValueChange={(value) => updateSetting("tasks", "defaultTaskView", value)}
                  >
                    <SelectTrigger id="defaultTaskView">
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kanban">Kanban Board</SelectItem>
                      <SelectItem value="list">List View</SelectItem>
                      <SelectItem value="calendar">Calendar View</SelectItem>
                      <SelectItem value="gantt">Gantt Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultPriority">Default Priority</Label>
                  <Select 
                    value={settings.defaultPriority} 
                    onValueChange={(value) => updateSetting("tasks", "defaultPriority", value)}
                  >
                    <SelectTrigger id="defaultPriority">
                      <SelectValue placeholder="Select default priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showCompletedTasks">Show Completed Tasks</Label>
                    <p className="text-sm text-muted-foreground">
                      Display completed tasks in task lists and boards
                    </p>
                  </div>
                  <Switch
                    id="showCompletedTasks"
                    checked={settings.showCompletedTasks}
                    onCheckedChange={(checked) => updateSetting("tasks", "showCompletedTasks", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoAssignDueDates">Auto-assign Due Dates</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically suggest due dates for new tasks
                    </p>
                  </div>
                  <Switch
                    id="autoAssignDueDates"
                    checked={settings.autoAssignDueDates}
                    onCheckedChange={(checked) => updateSetting("tasks", "autoAssignDueDates", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Documents Settings Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents Settings</CardTitle>
              <CardDescription>
                Configure document editing and collaboration preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultEditor">Default Editor</Label>
                  <Select 
                    value={settings.defaultEditor} 
                    onValueChange={(value) => updateSetting("documents", "defaultEditor", value)}
                  >
                    <SelectTrigger id="defaultEditor">
                      <SelectValue placeholder="Select default editor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rich">Rich Text Editor</SelectItem>
                      <SelectItem value="markdown">Markdown Editor</SelectItem>
                      <SelectItem value="code">Code Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="autosaveInterval">Autosave Interval (seconds)</Label>
                  <Select 
                    value={settings.autosaveInterval.toString()} 
                    onValueChange={(value) => updateSetting("documents", "autosaveInterval", parseInt(value))}
                  >
                    <SelectTrigger id="autosaveInterval">
                      <SelectValue placeholder="Select autosave interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">60 seconds</SelectItem>
                      <SelectItem value="120">2 minutes</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showCollaboratorsInEditor">Show Collaborators</Label>
                    <p className="text-sm text-muted-foreground">
                      Display active collaborators in the document editor
                    </p>
                  </div>
                  <Switch
                    id="showCollaboratorsInEditor"
                    checked={settings.showCollaboratorsInEditor}
                    onCheckedChange={(checked) => updateSetting("documents", "showCollaboratorsInEditor", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableSpellCheck">Enable Spell Check</Label>
                    <p className="text-sm text-muted-foreground">
                      Check spelling while typing in documents
                    </p>
                  </div>
                  <Switch
                    id="enableSpellCheck"
                    checked={settings.enableSpellCheck}
                    onCheckedChange={(checked) => updateSetting("documents", "enableSpellCheck", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Chat Settings Tab */}
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Chat Settings</CardTitle>
              <CardDescription>
                Configure messaging and chat preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enterToSend">Press Enter to Send</Label>
                    <p className="text-sm text-muted-foreground">
                      Use Enter key to send messages (Shift+Enter for new line)
                    </p>
                  </div>
                  <Switch
                    id="enterToSend"
                    checked={settings.enterToSend}
                    onCheckedChange={(checked) => updateSetting("chat", "enterToSend", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showReadReceipts">Show Read Receipts</Label>
                    <p className="text-sm text-muted-foreground">
                      Show when messages have been read by recipients
                    </p>
                  </div>
                  <Switch
                    id="showReadReceipts"
                    checked={settings.showReadReceipts}
                    onCheckedChange={(checked) => updateSetting("chat", "showReadReceipts", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showTypingIndicators">Show Typing Indicators</Label>
                    <p className="text-sm text-muted-foreground">
                      Show when others are typing in chat
                    </p>
                  </div>
                  <Switch
                    id="showTypingIndicators"
                    checked={settings.showTypingIndicators}
                    onCheckedChange={(checked) => updateSetting("chat", "showTypingIndicators", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="messageGrouping">Group Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Group consecutive messages from the same sender
                    </p>
                  </div>
                  <Switch
                    id="messageGrouping"
                    checked={settings.messageGrouping}
                    onCheckedChange={(checked) => updateSetting("chat", "messageGrouping", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Meetings Settings Tab */}
        <TabsContent value="meetings">
          <Card>
            <CardHeader>
              <CardTitle>Meetings Settings</CardTitle>
              <CardDescription>
                Configure meeting scheduling and recording preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultMeetingDuration">Default Meeting Duration (minutes)</Label>
                  <Select 
                    value={settings.defaultMeetingDuration.toString()} 
                    onValueChange={(value) => updateSetting("meetings", "defaultMeetingDuration", parseInt(value))}
                  >
                    <SelectTrigger id="defaultMeetingDuration">
                      <SelectValue placeholder="Select default duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoRecordMeetings">Auto-record Meetings</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically start recording when meetings begin
                    </p>
                  </div>
                  <Switch
                    id="autoRecordMeetings"
                    checked={settings.autoRecordMeetings}
                    onCheckedChange={(checked) => updateSetting("meetings", "autoRecordMeetings", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sendMeetingReminders">Send Meeting Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications before scheduled meetings
                    </p>
                  </div>
                  <Switch
                    id="sendMeetingReminders"
                    checked={settings.sendMeetingReminders}
                    onCheckedChange={(checked) => updateSetting("meetings", "sendMeetingReminders", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="automaticTranscription">Automatic Transcription</Label>
                    <p className="text-sm text-muted-foreground">
                      Generate automatic transcripts of recorded meetings
                    </p>
                  </div>
                  <Switch
                    id="automaticTranscription"
                    checked={settings.automaticTranscription}
                    onCheckedChange={(checked) => updateSetting("meetings", "automaticTranscription", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Email Settings Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email preferences and notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailSignature">Email Signature</Label>
                  <textarea
                    id="emailSignature"
                    rows={4}
                    className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 border rounded-md border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 bg-transparent"
                    placeholder="Enter your email signature"
                    value={settings.emailSignature}
                    onChange={(e) => updateSetting("email", "emailSignature", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailDigestFrequency">Email Digest Frequency</Label>
                  <Select 
                    value={settings.emailDigestFrequency} 
                    onValueChange={(value) => updateSetting("email", "emailDigestFrequency", value)}
                  >
                    <SelectTrigger id="emailDigestFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showEmailAvatars">Show Email Avatars</Label>
                    <p className="text-sm text-muted-foreground">
                      Display avatars in email conversations
                    </p>
                  </div>
                  <Switch
                    id="showEmailAvatars"
                    checked={settings.showEmailAvatars}
                    onCheckedChange={(checked) => updateSetting("email", "showEmailAvatars", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="threadedConversations">Threaded Conversations</Label>
                    <p className="text-sm text-muted-foreground">
                      Group emails in threaded conversations
                    </p>
                  </div>
                  <Switch
                    id="threadedConversations"
                    checked={settings.threadedConversations}
                    onCheckedChange={(checked) => updateSetting("email", "threadedConversations", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Timeline Settings Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Timeline Settings</CardTitle>
              <CardDescription>
                Configure calendar and timeline view preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timelineLayout">Default Timeline View</Label>
                  <Select 
                    value={settings.timelineLayout} 
                    onValueChange={(value) => updateSetting("timeline", "timelineLayout", value)}
                  >
                    <SelectTrigger id="timelineLayout">
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="agenda">Agenda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Working Hours</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workingHoursStart" className="text-xs">Start Time</Label>
                      <Select 
                        value={settings.workingHours.start} 
                        onValueChange={(value) => updateSetting("timeline", "workingHours", { ...settings.workingHours, start: value })}
                      >
                        <SelectTrigger id="workingHoursStart">
                          <SelectValue placeholder="Start time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="08:00">8:00 AM</SelectItem>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workingHoursEnd" className="text-xs">End Time</Label>
                      <Select 
                        value={settings.workingHours.end} 
                        onValueChange={(value) => updateSetting("timeline", "workingHours", { ...settings.workingHours, end: value })}
                      >
                        <SelectTrigger id="workingHoursEnd">
                          <SelectValue placeholder="End time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="17:00">5:00 PM</SelectItem>
                          <SelectItem value="18:00">6:00 PM</SelectItem>
                          <SelectItem value="19:00">7:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showWeekends">Show Weekends</Label>
                    <p className="text-sm text-muted-foreground">
                      Display weekend days in calendar views
                    </p>
                  </div>
                  <Switch
                    id="showWeekends"
                    checked={settings.showWeekends}
                    onCheckedChange={(checked) => updateSetting("timeline", "showWeekends", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="colorCodeEvents">Color-code Events</Label>
                    <p className="text-sm text-muted-foreground">
                      Use colors to distinguish different event types
                    </p>
                  </div>
                  <Switch
                    id="colorCodeEvents"
                    checked={settings.colorCodeEvents}
                    onCheckedChange={(checked) => updateSetting("timeline", "colorCodeEvents", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* AI Assistant Settings Tab */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Settings</CardTitle>
              <CardDescription>
                Configure AI assistant behavior and permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openAIKey" className="font-medium">OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openAIKey"
                      type="password"
                      placeholder="Enter your OpenAI API key"
                      className="flex-1"
                      value={settings.openAIKey}
                      onChange={(e) => updateSetting("ai", "openAIKey", e.target.value)}
                    />
                    <Button 
                      variant={settings.openAIKeyVerified ? "default" : "secondary"} 
                      size="sm"
                      onClick={handleVerifyApiKey}
                      disabled={verifyingKey || !settings.openAIKey}
                    >
                      {verifyingKey ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : settings.openAIKeyVerified ? (
                        <CircleCheck className="h-4 w-4 mr-2" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      {verifyingKey ? "Verifying..." : settings.openAIKeyVerified ? "Verified" : "Verify"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your API key is stored securely and used only for AI features in this application.
                    <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">
                      Get an API key
                    </a>
                  </p>
                </div>

                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableAIAssistant">Enable AI Assistant</Label>
                    <p className="text-sm text-muted-foreground">
                      Turn on AI-powered features across the workspace
                    </p>
                  </div>
                  <Switch
                    id="enableAIAssistant"
                    checked={settings.enableAIAssistant}
                    onCheckedChange={(checked) => updateSetting("ai", "enableAIAssistant", checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aiPrivacyLevel">AI Privacy Level</Label>
                  <Select 
                    value={settings.aiPrivacyLevel} 
                    onValueChange={(value) => updateSetting("ai", "aiPrivacyLevel", value)}
                  >
                    <SelectTrigger id="aiPrivacyLevel">
                      <SelectValue placeholder="Select privacy level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private - Only my data</SelectItem>
                      <SelectItem value="workspace">Workspace - All workspace data</SelectItem>
                      <SelectItem value="enhanced">Enhanced - Include web search</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aiModel">AI Model</Label>
                  <Select 
                    defaultValue="gpt-4o"
                  >
                    <SelectTrigger id="aiModel">
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    More powerful models provide better results but may use more API credits
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="saveAIHistory">Save AI Conversation History</Label>
                    <p className="text-sm text-muted-foreground">
                      Save your past AI assistant interactions for reference
                    </p>
                  </div>
                  <Switch
                    id="saveAIHistory"
                    checked={settings.saveAIHistory}
                    onCheckedChange={(checked) => updateSetting("ai", "saveAIHistory", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="aiVoiceCommands">Enable Voice Commands</Label>
                    <p className="text-sm text-muted-foreground">
                      Use voice to interact with the AI assistant (experimental)
                    </p>
                  </div>
                  <Switch
                    id="aiVoiceCommands"
                    checked={settings.aiVoiceCommands}
                    onCheckedChange={(checked) => updateSetting("ai", "aiVoiceCommands", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Settings Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy Settings</CardTitle>
              <CardDescription>
                Configure security and data privacy settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Secure your account with two-factor authentication
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Switch
                      id="twoFactorAuth"
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => updateSetting("security", "twoFactorAuth", checked)}
                    />
                    {!settings.twoFactorAuth && (
                      <Button variant="outline" size="sm" className="ml-4">
                        <Lock className="h-4 w-4 mr-2" />
                        Set Up
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logRetentionDays">Log Retention Period (days)</Label>
                  <Select 
                    value={settings.logRetentionDays.toString()} 
                    onValueChange={(value) => updateSetting("security", "logRetentionDays", parseInt(value))}
                  >
                    <SelectTrigger id="logRetentionDays">
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-base">Data Privacy</Label>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowDataAnalytics">Allow Data Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow collection of anonymous usage data to improve the service
                      </p>
                    </div>
                    <Switch
                      id="allowDataAnalytics"
                      checked={settings.allowDataAnalytics}
                      onCheckedChange={(checked) => updateSetting("security", "allowDataAnalytics", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="shareUsageData">Share Usage Insights</Label>
                      <p className="text-sm text-muted-foreground">
                        Share usage patterns with your team for productivity insights
                      </p>
                    </div>
                    <Switch
                      id="shareUsageData"
                      checked={settings.shareUsageData}
                      onCheckedChange={(checked) => updateSetting("security", "shareUsageData", checked)}
                    />
                  </div>
                </div>
                
                <div className="mt-6 space-y-2">
                  <Button variant="secondary" className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage Account Access
                  </Button>
                  
                  <Button variant="destructive" className="w-full">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}