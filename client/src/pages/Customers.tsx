import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { customers } from "@/lib/mockData";
import { Search, Filter, MoreHorizontal, Mail, Phone, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Customers() {
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

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name, email or phone..." className="pl-9 bg-background/50" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50 transition-colors">
              <Filter className="w-4 h-4" />
              Segments
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50 transition-colors">
              <Calendar className="w-4 h-4" />
              Date Range
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Customer</TableHead>
                <TableHead>Tier Status</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Total Spend</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/30 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-primary/5 text-primary font-medium">{customer.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{customer.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${customer.tier === 'Platinum' ? 'bg-slate-800 text-white border-slate-700' : 
                        customer.tier === 'Gold' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                        'bg-slate-100 text-slate-800 border-slate-200'}`}>
                      {customer.tier}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Layout>
  );
}
