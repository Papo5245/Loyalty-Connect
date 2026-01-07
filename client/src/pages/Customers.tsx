import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MoreHorizontal, Calendar, Loader2, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi, type Customer } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSegment, setActiveSegment] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", tier: "Silver", segment: "Occasional" });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setIsAddOpen(false);
      setFormData({ name: "", email: "", phone: "", tier: "Silver", segment: "Occasional" });
      toast({ title: "Customer added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add customer", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Customer> }) => customersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsEditOpen(false);
      setSelectedCustomer(null);
      toast({ title: "Customer updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update customer", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Customer deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete customer", variant: "destructive" });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      tier: formData.tier,
      segment: formData.segment,
      visits: 0,
      spend: "0",
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    updateMutation.mutate({
      id: selectedCustomer.id,
      data: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        tier: formData.tier,
        segment: formData.segment,
      },
    });
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      tier: customer.tier,
      segment: customer.segment,
    });
    setIsEditOpen(true);
  };

  const segments = useMemo(() => {
    const uniqueSegments = ["All Customers", ...Array.from(new Set(customers.map(c => c.segment)))];
    return uniqueSegments;
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSegment = activeSegment === "all" || customer.segment === activeSegment;
      const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSegment && matchesSearch;
    });
  }, [activeSegment, searchQuery, customers]);

  const getSegmentStats = (segment: string) => {
    const segmentCustomers = segment === "all" ? customers : customers.filter(c => c.segment === segment);
    const totalSpend = segmentCustomers.reduce((sum, c) => sum + parseFloat(c.spend || "0"), 0);
    const avgVisits = segmentCustomers.length > 0 
      ? (segmentCustomers.reduce((sum, c) => sum + c.visits, 0) / segmentCustomers.length).toFixed(1) 
      : "0";
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
      case "High Spender": return `${baseClass} bg-blue-100 text-blue-700`;
      case "Regular": return `${baseClass} bg-blue-100 text-blue-700`;
      case "Growing": return `${baseClass} bg-amber-100 text-amber-700`;
      case "Occasional": return `${baseClass} bg-gray-100 text-gray-700`;
      case "At Risk": return `${baseClass} bg-red-100 text-red-700`;
      default: return `${baseClass} bg-gray-100 text-gray-700`;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your loyalty members and view their detailed history.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium shadow-md shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Customer
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select value={formData.tier} onValueChange={(v) => setFormData({ ...formData, tier: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Segment</Label>
                  <Select value={formData.segment} onValueChange={(v) => setFormData({ ...formData, segment: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="High Spender">High Spender</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Growing">Growing</SelectItem>
                      <SelectItem value="Occasional">Occasional</SelectItem>
                      <SelectItem value="At Risk">At Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <button type="button" className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50">Cancel</button>
                </DialogClose>
                <button type="submit" disabled={createMutation.isPending} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {createMutation.isPending ? "Adding..." : "Add Customer"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone (optional)</Label>
              <Input id="edit-phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData({ ...formData, tier: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Segment</Label>
                <Select value={formData.segment} onValueChange={(v) => setFormData({ ...formData, segment: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="High Spender">High Spender</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Growing">Growing</SelectItem>
                    <SelectItem value="Occasional">Occasional</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button type="button" className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50">Cancel</button>
              </DialogClose>
              <button type="submit" disabled={updateMutation.isPending} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Segment Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
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
              <div className={`text-sm font-medium mb-2 truncate ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
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

      {/* Customer List */}
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
          </div>
          
          {/* Segment info */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="font-medium text-foreground">
              {filteredCustomers.length} customers in {activeSegment === "all" ? "all segments" : activeSegment}
            </span>
            <span className="text-muted-foreground">
              Total spend: ${filteredCustomers.reduce((sum, c) => sum + parseFloat(c.spend || "0"), 0).toLocaleString()}
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
                          <AvatarFallback className="bg-primary/5 text-primary font-medium">
                            {customer.avatar || customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
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
                    <TableCell className="font-medium">${parseFloat(customer.spend || "0").toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-muted rounded-full transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this customer?")) {
                                deleteMutation.mutate(customer.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
    </Layout>
  );
}
