import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { customers } from "@/lib/mockData";
import { Search, Filter, MoreHorizontal, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSegment, setActiveSegment] = useState("all");

  // Get unique segments
  const segments = useMemo(() => {
    const uniqueSegments = ["All Customers", ...Array.from(new Set(customers.map(c => c.segment)))];
    return uniqueSegments;
  }, []);

  // Filter customers by segment and search
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSegment = activeSegment === "all" || customer.segment === activeSegment;
      const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSegment && matchesSearch;
    });
  }, [activeSegment, searchQuery]);

  const getSegmentStats = (segment: string) => {
    const segmentCustomers = segment === "all" ? customers : customers.filter(c => c.segment === segment);
    const totalSpend = segmentCustomers.reduce((sum, c) => sum + c.spend, 0);
    const avgVisits = (segmentCustomers.reduce((sum, c) => sum + c.visits, 0) / segmentCustomers.length).toFixed(1);
    return { count: segmentCustomers.length, totalSpend, avgVisits };
  };

  const getTierColor = (tier: string) => {
    const baseClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";
    if (tier === 'Platinum') return `${baseClass} bg-slate-800 text-white border-slate-700`;
    if (tier === 'Gold') return `${baseClass} bg-amber-100 text-amber-800 border-amber-200`;
    return `${baseClass} bg-slate-100 text-slate-800 border-slate-200`;
  };

  const getSegmentBadgeColor = (segment: string) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-medium";
    switch(segment) {
      case "VIP": return `${baseClass} bg-purple-100 text-purple-700`;
      case "High Spender": return `${baseClass} bg-emerald-100 text-emerald-700`;
      case "Regular": return `${baseClass} bg-blue-100 text-blue-700`;
      case "Growing": return `${baseClass} bg-amber-100 text-amber-700`;
      case "Occasional": return `${baseClass} bg-gray-100 text-gray-700`;
      case "At Risk": return `${baseClass} bg-red-100 text-red-700`;
      default: return `${baseClass} bg-gray-100 text-gray-700`;
    }
  };

  return (
    <Layout>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your loyalty members and view their detailed history.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
          Add Customer
        </button>
      </header>

      {/* Segment Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {segments.map((segment, idx) => {
          const stats = getSegmentStats(segment === "All Customers" ? "all" : segment);
          const isActive = (segment === "All Customers" && activeSegment === "all") || segment === activeSegment;
          
          return (
            <motion.button
              key={idx}
              onClick={() => setActiveSegment(segment === "All Customers" ? "all" : segment)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-lg text-left transition-all ${
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20 border-primary" 
                  : "bg-card border border-border hover:border-border"
              }`}
            >
              <div className={`text-sm font-medium mb-2 ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                {segment}
              </div>
              <div className={`text-xl font-bold ${isActive ? "text-white" : "text-foreground"}`}>
                {stats.count}
              </div>
              <div className={`text-xs mt-1 ${isActive ? "text-white/60" : "text-muted-foreground"}`}>
                ${(stats.totalSpend / 1000).toFixed(1)}k spent
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Tabs for segment view */}
      <Tabs value={activeSegment} onValueChange={setActiveSegment} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6 bg-transparent h-auto">
          {segments.map((segment) => (
            <TabsTrigger
              key={segment}
              value={segment === "All Customers" ? "all" : segment}
              className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 border border-border data-[state=active]:border-primary rounded-lg py-2 text-sm"
            >
              {segment === "All Customers" ? "All" : segment}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeSegment} className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="relative flex-1 w-full md:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name or email..." 
                    className="pl-9 bg-background/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                  <button className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50 transition-colors">
                    <Calendar className="w-4 h-4" />
                    Date Range
                  </button>
                </div>
              </div>
              
              {/* Segment info */}
              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="font-medium text-foreground">
                  {filteredCustomers.length} customers in {activeSegment === "all" ? "all segments" : activeSegment}
                </span>
                <span className="text-muted-foreground">
                  Total spend: ${filteredCustomers.reduce((sum, c) => sum + c.spend, 0).toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  Avg visits: {(filteredCustomers.reduce((sum, c) => sum + c.visits, 0) / (filteredCustomers.length || 1)).toFixed(1)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredCustomers.length > 0 ? (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[300px]">Customer</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Visits</TableHead>
                      <TableHead>Total Spend</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="cursor-pointer hover:bg-muted/30 transition-colors group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border">
                              <AvatarFallback className="bg-primary/5 text-primary font-medium">{customer.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-foreground">{customer.name}</div>
                              <div className="text-xs text-muted-foreground">{customer.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={getTierColor(customer.tier)}>
                            {customer.tier}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={getSegmentBadgeColor(customer.segment)}>
                            {customer.segment}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium">{customer.visits}</TableCell>
                        <TableCell className="font-medium">${customer.spend.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{customer.lastVisit}</TableCell>
                        <TableCell className="text-right">
                          <button className="p-2 hover:bg-muted rounded-full transition-colors opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No customers found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
