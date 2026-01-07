import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Smartphone, Globe, Mail, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Le Petit Bistro",
    email: "hello@lepetitbistro.com",
    phone: "+1 (555) 000-0000",
    website: "https://lepetitbistro.com",
    address: "123 Gourmet St, Foodie City, FC 12345",
  });

  const [notifications, setNotifications] = useState({
    newMember: true,
    highValue: true,
    rewardRedemption: true,
    weeklyReport: true,
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    toast({ 
      title: "Settings saved",
      description: "Your restaurant profile has been updated.",
    });
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast({ 
      title: "Notification preference updated",
    });
  };

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your Loyalize CRM and restaurant profile.</p>
      </header>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-8 bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-8">
          <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-0 pb-3">General</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-0 pb-3">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-0 pb-3">Security</TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-0 pb-3">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold mb-1">Restaurant Profile</h3>
              <p className="text-sm text-muted-foreground">Basic information about your establishment.</p>
            </div>
            <Card className="md:col-span-2 shadow-sm border-border/50">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rest-name">Restaurant Name</Label>
                    <Input 
                      id="rest-name" 
                      value={profileData.name} 
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rest-email">Business Email</Label>
                    <Input 
                      id="rest-email" 
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rest-phone">Phone Number</Label>
                    <Input 
                      id="rest-phone" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rest-website">Website URL</Label>
                    <Input 
                      id="rest-website" 
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rest-address">Address</Label>
                  <Input 
                    id="rest-address" 
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  />
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? "Saving..." : (
                      <>
                        <Check className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Email & Push Notifications</CardTitle>
              <CardDescription>Control how you and your team receive alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "newMember" as const, title: "New Member Signup", desc: "Notify when a new customer joins the loyalty program.", icon: Mail },
                { key: "highValue" as const, title: "High Value Transaction", desc: "Alert when a transaction exceeds $500.", icon: Bell },
                { key: "rewardRedemption" as const, title: "Reward Redemption", desc: "Notify staff when a customer redeems a reward.", icon: Smartphone },
                { key: "weeklyReport" as const, title: "Weekly Report", desc: "Receive a summary of CRM performance every Monday.", icon: Globe },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications[item.key]} 
                    onCheckedChange={() => handleNotificationChange(item.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and access controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                </div>
                <button 
                  onClick={() => toast({ title: "Password updated successfully" })}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:bg-primary/90 transition-all"
                >
                  Update Password
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect Loyalize with your existing tools and services.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Square POS", desc: "Sync transactions automatically", connected: true },
                  { name: "Mailchimp", desc: "Email marketing automation", connected: false },
                  { name: "Twilio", desc: "SMS notifications", connected: false },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">{integration.desc}</p>
                    </div>
                    <button 
                      onClick={() => toast({ 
                        title: integration.connected ? "Disconnected" : "Connected",
                        description: `${integration.name} has been ${integration.connected ? "disconnected" : "connected"}.`
                      })}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        integration.connected 
                          ? "bg-muted text-muted-foreground hover:bg-muted/80" 
                          : "bg-primary text-white hover:bg-primary/90"
                      }`}
                    >
                      {integration.connected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
