import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Calendar, Download } from "lucide-react";

// Additional mock data for detailed analytics
const visitFrequencyData = [
  { range: '1 Visit', count: 450 },
  { range: '2-5 Visits', count: 890 },
  { range: '6-10 Visits', count: 420 },
  { range: '11-20 Visits', count: 180 },
  { range: '21+ Visits', count: 85 },
];

const rewardsRedemptionData = [
  { name: 'Free Dessert', redeemed: 245, revenueImpact: 1200 },
  { name: '10% Off', redeemed: 560, revenueImpact: 4500 },
  { name: 'Free Drink', redeemed: 380, revenueImpact: 1100 },
  { name: 'Birthday Meal', redeemed: 85, revenueImpact: 3200 },
  { name: 'VIP Chef Table', redeemed: 12, revenueImpact: 2400 },
];

const hourlyTrafficData = [
  { hour: '11am', visits: 15 },
  { hour: '12pm', visits: 85 },
  { hour: '1pm', visits: 120 },
  { hour: '2pm', visits: 60 },
  { hour: '3pm', visits: 25 },
  { hour: '4pm', visits: 30 },
  { hour: '5pm', visits: 75 },
  { hour: '6pm', visits: 140 },
  { hour: '7pm', visits: 180 },
  { hour: '8pm', visits: 160 },
  { hour: '9pm', visits: 90 },
];

const customerSatisfactionMetrics = [
  { subject: 'Service', A: 120, fullMark: 150 },
  { subject: 'Food Quality', A: 145, fullMark: 150 },
  { subject: 'Ambiance', A: 110, fullMark: 150 },
  { subject: 'Value', A: 90, fullMark: 150 },
  { subject: 'Speed', A: 100, fullMark: 150 },
  { subject: 'Cleanliness', A: 140, fullMark: 150 },
];

export default function Analytics() {
  return (
    <Layout>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your restaurant's performance and customer behavior.</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-border px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                This Quarter
            </button>
            <button className="bg-white border border-border px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Data
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Visit Frequency Distribution</CardTitle>
            <CardDescription>How often do your customers come back?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitFrequencyData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis dataKey="range" type="category" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={100} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Hourly Traffic Heatmap</CardTitle>
            <CardDescription>Peak visiting hours (Average)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyTrafficData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="visits" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--chart-2))" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Rewards Performance</CardTitle>
            <CardDescription>Redemptions vs. Associated Revenue Impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rewardsRedemptionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-4))" tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="redeemed" name="Redemptions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenueImpact" name="Revenue Impact ($)" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Feedback Analysis</CardTitle>
            <CardDescription>Based on post-visit surveys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={customerSatisfactionMetrics}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar
                    name="Satisfaction"
                    dataKey="A"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.4}
                  />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
