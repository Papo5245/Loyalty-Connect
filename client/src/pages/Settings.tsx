import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Bell, Shield, Smartphone, Globe, Mail } from "lucide-react";

export default function Settings() {
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
                    <Input id="rest-name" defaultValue="Le Petit Bistro" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rest-email">Business Email</Label>
                    <Input id="rest-email" defaultValue="hello@lepetitbistro.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rest-phone">Phone Number</Label>
                    <Input id="rest-phone" defaultValue="+1 (555) 000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rest-website">Website URL</Label>
                    <Input id="rest-website" defaultValue="https://lepetitbistro.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rest-address">Address</Label>
                  <Input id="rest-address" defaultValue="123 Gourmet St, Foodie City, FC 12345" />
                </div>
                <div className="flex justify-end">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:bg-primary/90 transition-all">
                    Save Changes
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
                { title: "New Member Signup", desc: "Notify when a new customer joins the loyalty program.", icon: Mail },
                { title: "High Value Transaction", desc: "Alert when a transaction exceeds $500.", icon: Bell },
                { title: "Reward Redemption", desc: "Notify staff when a customer redeems a reward.", icon: Smartphone },
                { title: "Weekly Report", desc: "Receive a summary of CRM performance every Monday.", icon: Globe },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
