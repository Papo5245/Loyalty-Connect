import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, Users, Award, ArrowUpRight, DollarSign, Calendar, Loader2, UserCheck, UserX, UserMinus, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, customersApi, activitiesApi } from "@/lib/api";

const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 4500 },
  { name: 'Fri', sales: 8000 },
  { name: 'Sat', sales: 9500 },
  { name: 'Sun', sales: 7000 },
];

const roiData = [
  { month: 'Jan', rewardCost: 1200, revenueFromRewards: 8500, roi: 608 },
  { month: 'Feb', rewardCost: 1400, revenueFromRewards: 9800, roi: 600 },
  { month: 'Mar', rewardCost: 1100, revenueFromRewards: 10500, roi: 854 },
  { month: 'Apr', rewardCost: 1600, revenueFromRewards: 12000, roi: 650 },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getStats,
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.getAll,
  });

  const { data: activities } = useQuery({
    queryKey: ["activities"],
    queryFn: () => activitiesApi.getAll(5),
  });

  const activeCustomers = customers?.filter(c => c.segment !== "At Risk" && c.segment !== "Occasional" && c.visits > 0) || [];
  const atRiskCustomers = customers?.filter(c => c.segment === "At Risk") || [];
  const lostCustomers = customers?.filter(c => c.segment === "Occasional" && c.visits <= 1) || [];

  const totalMembers = customers?.length || 0;

  const avgLoyaltyTicket = customers && customers.length > 0
    ? (customers.reduce((sum, c) => sum + parseFloat(c.spend || "0"), 0) / customers.reduce((sum, c) => sum + c.visits, 0) || 0).toFixed(0)
    : "0";
  
  const avgNonLoyaltyTicket = 42;

  const recentActivity = activities?.map(a => {
    const customer = customers?.find(c => c.id === a.customerId);
    return {
      ...a,
      customerName: customer?.name || "Unknown Customer",
      customerTier: customer?.tier || "Silver",
      customerSegment: customer?.segment || "Regular",
    };
  }) || [];

  const totalRoiRevenue = roiData.reduce((sum, d) => sum + d.revenueFromRewards, 0);
  const totalRoiCost = roiData.reduce((sum, d) => sum + d.rewardCost, 0);
  const overallRoi = ((totalRoiRevenue - totalRoiCost) / totalRoiCost * 100).toFixed(0);

  if (statsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const getTierBadge = (tier: string) => {
    if (tier === 'Platinum') return "bg-slate-800 text-white";
    if (tier === 'Gold') return "bg-amber-100 text-amber-800";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <Layout>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, here's what's happening at your restaurant today.</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-border px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last 30 Days
            </button>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
                Download Report
            </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { title: "Total Revenue", value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, trend: "+12.5%", icon: DollarSign, color: "text-emerald-500" },
          { title: "Active Members", value: (stats?.activeMembers || 0).toLocaleString(), trend: "+8.2%", icon: Users, color: "text-blue-500" },
          { title: "Loyalty Visits", value: (stats?.loyaltyVisits || 0).toLocaleString(), trend: "+23.1%", icon: ArrowUpRight, color: "text-purple-500" },
          { title: "Rewards Redeemed", value: (stats?.rewardsRedeemed || 0).toString(), trend: "+5.4%", icon: Award, color: "text-amber-500" },
          { title: "Avg Ticket", value: "", isTicketComparison: true, icon: Receipt, color: "text-primary" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow h-full">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-background border border-border/50 ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  {stat.trend && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                  {stat.isTicketComparison ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Loyalty</span>
                        <span className="text-lg font-bold text-primary">${avgLoyaltyTicket}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Non-Loyalty</span>
                        <span className="text-sm font-medium text-muted-foreground">${avgNonLoyaltyTicket}</span>
                      </div>
                      <div className="text-xs text-emerald-600 font-medium">
                        +{((parseInt(avgLoyaltyTicket) / avgNonLoyaltyTicket - 1) * 100).toFixed(0)}% higher
                      </div>
                    </div>
                  ) : (
                    <h3 className="text-xl font-bold text-foreground">{stat.value}</h3>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Sales Analytics</CardTitle>
            <CardDescription>Revenue overview across all locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="hsl(160 84% 39%)" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Member Segments</CardTitle>
            <CardDescription>Customer engagement status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="p-3 rounded-full bg-emerald-100">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800">Active</p>
                <p className="text-xs text-emerald-600">Engaged customers</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-700">{activeCustomers.length}</p>
                <p className="text-xs text-emerald-600">{totalMembers > 0 ? ((activeCustomers.length / totalMembers) * 100).toFixed(0) : 0}%</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-50 border border-amber-100">
              <div className="p-3 rounded-full bg-amber-100">
                <UserMinus className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">At Risk</p>
                <p className="text-xs text-amber-600">Need attention</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-700">{atRiskCustomers.length}</p>
                <p className="text-xs text-amber-600">{totalMembers > 0 ? ((atRiskCustomers.length / totalMembers) * 100).toFixed(0) : 0}%</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 border border-red-100">
              <div className="p-3 rounded-full bg-red-100">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Lost</p>
                <p className="text-xs text-red-600">Inactive customers</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-700">{lostCustomers.length}</p>
                <p className="text-xs text-red-600">{totalMembers > 0 ? ((lostCustomers.length / totalMembers) * 100).toFixed(0) : 0}%</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Members</span>
                <span className="font-bold">{totalMembers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Reward Performance ROI</CardTitle>
                <CardDescription>How much revenue your loyalty rewards generate vs. their cost</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">{overallRoi}%</div>
                <div className="text-xs text-muted-foreground">Overall ROI</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Revenue from Rewards</p>
                <p className="text-lg font-bold text-primary">${totalRoiRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Purchases by reward users</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-muted-foreground mb-1">Reward Costs</p>
                <p className="text-lg font-bold text-red-600">${totalRoiCost.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Discounts & free items</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
                <p className="text-lg font-bold text-emerald-600">${(totalRoiRevenue - totalRoiCost).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">After reward costs</p>
              </div>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roiData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'revenueFromRewards' ? 'Revenue Generated' : 'Reward Cost']}
                  />
                  <Legend 
                    formatter={(value) => value === 'revenueFromRewards' ? 'Revenue Generated' : 'Reward Cost'}
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                  <Bar dataKey="revenueFromRewards" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rewardCost" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest customer interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 mt-2 rounded-full ${act.type === 'visit' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium leading-none">{act.customerName}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getTierBadge(act.customerTier)}`}>
                        {act.customerTier}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {act.type === 'visit' ? `Visited and spent $${act.amount}` : `Redeemed ${act.rewardUsed}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(act.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
