import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Users, MapPin, MoreHorizontal, Pencil, Trash2, UserPlus, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tablesApi, tableSessionsApi, customersApi, type RestaurantTable, type Customer } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Tables() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSeatOpen, setIsSeatOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [formData, setFormData] = useState({ name: "", capacity: 4, location: "Main", notes: "" });
  const [seatData, setSeatData] = useState({ customerId: "", partySize: 2 });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: tablesApi.getAll,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.getAll,
  });

  const { data: activeSessions = [] } = useQuery({
    queryKey: ["table-sessions", "active"],
    queryFn: () => tableSessionsApi.getAll(true),
  });

  const createMutation = useMutation({
    mutationFn: tablesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setIsAddOpen(false);
      setFormData({ name: "", capacity: 4, location: "Main", notes: "" });
      toast({ title: "Table added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add table", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RestaurantTable> }) => tablesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setIsEditOpen(false);
      setSelectedTable(null);
      toast({ title: "Table updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update table", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tablesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast({ title: "Table deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete table", variant: "destructive" });
    },
  });

  const seatMutation = useMutation({
    mutationFn: tableSessionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["table-sessions"] });
      setIsSeatOpen(false);
      setSelectedTable(null);
      setSeatData({ customerId: "", partySize: 2 });
      toast({ title: "Customers seated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to seat customers", variant: "destructive" });
    },
  });

  const clearMutation = useMutation({
    mutationFn: (sessionId: number) => tableSessionsApi.update(sessionId, { status: "cleared", endedAt: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["table-sessions"] });
      toast({ title: "Table cleared successfully" });
    },
    onError: () => {
      toast({ title: "Failed to clear table", variant: "destructive" });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      capacity: formData.capacity,
      location: formData.location,
      status: "available",
      currentCustomerId: null,
      notes: formData.notes || null,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    updateMutation.mutate({
      id: selectedTable.id,
      data: {
        name: formData.name,
        capacity: formData.capacity,
        location: formData.location,
        notes: formData.notes || null,
      },
    });
  };

  const handleSeatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    seatMutation.mutate({
      tableId: selectedTable.id,
      customerId: seatData.customerId ? parseInt(seatData.customerId) : null,
      partySize: seatData.partySize,
      status: "seated",
    });
  };

  const openEditDialog = (table: RestaurantTable) => {
    setSelectedTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity,
      location: table.location,
      notes: table.notes || "",
    });
    setIsEditOpen(true);
  };

  const openSeatDialog = (table: RestaurantTable) => {
    setSelectedTable(table);
    setSeatData({ customerId: "", partySize: 2 });
    setIsSeatOpen(true);
  };

  const getActiveSession = (tableId: number) => {
    return activeSessions.find(s => s.tableId === tableId);
  };

  const getCustomerName = (customerId: number | null) => {
    if (!customerId) return "Walk-in";
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || "Unknown";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500";
      case "occupied": return "bg-red-500";
      case "reserved": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === "available").length,
    occupied: tables.filter(t => t.status === "occupied").length,
    reserved: tables.filter(t => t.status === "reserved").length,
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
          <h1 className="text-3xl font-heading font-bold text-foreground">Table Management</h1>
          <p className="text-muted-foreground mt-1">Manage your restaurant floor and track seating.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button data-testid="button-add-table" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium shadow-md shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Table
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Table</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Table Name/Number</Label>
                <Input id="name" data-testid="input-table-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Table 1, Booth A" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" data-testid="input-table-capacity" type="number" min="1" max="20" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                    <SelectTrigger data-testid="select-table-location"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main">Main Floor</SelectItem>
                      <SelectItem value="Patio">Patio</SelectItem>
                      <SelectItem value="Private">Private Room</SelectItem>
                      <SelectItem value="Bar">Bar Area</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input id="notes" data-testid="input-table-notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="e.g., Near window, wheelchair accessible" />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <button type="button" className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50">Cancel</button>
                </DialogClose>
                <button type="submit" data-testid="button-submit-table" disabled={createMutation.isPending} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {createMutation.isPending ? "Adding..." : "Add Table"}
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
            <DialogTitle>Edit Table</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Table Name/Number</Label>
              <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input id="edit-capacity" type="number" min="1" max="20" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main">Main Floor</SelectItem>
                    <SelectItem value="Patio">Patio</SelectItem>
                    <SelectItem value="Private">Private Room</SelectItem>
                    <SelectItem value="Bar">Bar Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (optional)</Label>
              <Input id="edit-notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
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

      {/* Seat Dialog */}
      <Dialog open={isSeatOpen} onOpenChange={setIsSeatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seat Customers at {selectedTable?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSeatSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Customer (optional)</Label>
              <Select value={seatData.customerId} onValueChange={(v) => setSeatData({ ...seatData, customerId: v })}>
                <SelectTrigger data-testid="select-customer"><SelectValue placeholder="Walk-in (no customer)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Walk-in (no customer)</SelectItem>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="party-size">Party Size</Label>
              <Input id="party-size" data-testid="input-party-size" type="number" min="1" max="20" value={seatData.partySize} onChange={(e) => setSeatData({ ...seatData, partySize: parseInt(e.target.value) || 2 })} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button type="button" className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50">Cancel</button>
              </DialogClose>
              <button type="submit" data-testid="button-seat-customers" disabled={seatMutation.isPending} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {seatMutation.isPending ? "Seating..." : "Seat Customers"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Tables</div>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Available
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Occupied
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Reserved
            </div>
            <div className="text-2xl font-bold text-amber-600">{stats.reserved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table, idx) => {
          const session = getActiveSession(table.id);
          return (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card data-testid={`card-table-${table.id}`} className={cn(
                "border-border/50 transition-all hover:shadow-md",
                table.status === "occupied" && "border-red-200 bg-red-50/30",
                table.status === "reserved" && "border-amber-200 bg-amber-50/30"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-3 h-3 rounded-full", getStatusColor(table.status))}></span>
                      <CardTitle className="text-lg">{table.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button data-testid={`button-table-menu-${table.id}`} className="p-1 hover:bg-muted rounded transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {table.status === "available" && (
                          <DropdownMenuItem onClick={() => openSeatDialog(table)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Seat Customers
                          </DropdownMenuItem>
                        )}
                        {table.status === "occupied" && session && (
                          <DropdownMenuItem onClick={() => clearMutation.mutate(session.id)}>
                            <Check className="w-4 h-4 mr-2" />
                            Clear Table
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openEditDialog(table)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this table?")) {
                              deleteMutation.mutate(table.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Capacity: {table.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{table.location}</span>
                    </div>
                    {table.notes && (
                      <p className="text-xs text-muted-foreground italic">{table.notes}</p>
                    )}
                    {session && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="text-xs font-medium text-foreground">Currently seated:</div>
                        <div className="text-sm">{getCustomerName(session.customerId)} ({session.partySize} guests)</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {tables.length === 0 && (
        <Card className="border-border/50 border-dashed">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No tables configured yet.</p>
            <button onClick={() => setIsAddOpen(true)} className="text-primary hover:underline font-medium">
              Add your first table
            </button>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
