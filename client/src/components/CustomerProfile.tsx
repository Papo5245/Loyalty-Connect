import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, X, Star, DollarSign, ShoppingBag, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  tagsApi, customerTagsApi, customerStatsApi, ordersApi,
  type Customer, type Tag, type Order, type OrderItem 
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CustomerProfileProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TAG_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#eab308" },
  { name: "Pink", value: "#ec4899" },
  { name: "Purple", value: "#a855f7" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
];

export function CustomerProfile({ customer, open, onOpenChange }: CustomerProfileProps) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [prevCustomerId, setPrevCustomerId] = useState<number | null>(null);

  if (customer.id !== prevCustomerId) {
    setPrevCustomerId(customer.id);
    setSelectedOrderId(null);
    setIsAddingTag(false);
    setNewTagName("");
  }

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: allTags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: tagsApi.getAll,
    enabled: open,
  });

  const { data: customerTags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ["customer-tags", customer.id],
    queryFn: () => customerTagsApi.getCustomerTags(customer.id),
    enabled: open,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["customer-stats", customer.id],
    queryFn: () => customerStatsApi.getStats(customer.id),
    enabled: open,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["customer-orders", customer.id],
    queryFn: () => ordersApi.getCustomerOrders(customer.id),
    enabled: open,
  });

  const { data: orderItems = [] } = useQuery({
    queryKey: ["order-items", selectedOrderId],
    queryFn: () => selectedOrderId ? ordersApi.getOrderItems(selectedOrderId) : Promise.resolve([]),
    enabled: !!selectedOrderId,
  });

  const createTagMutation = useMutation({
    mutationFn: tagsApi.create,
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      addTagMutation.mutate({ customerId: customer.id, tagId: newTag.id });
      setNewTagName("");
      setIsAddingTag(false);
    },
    onError: () => {
      toast({ title: "Error al crear etiqueta", variant: "destructive" });
    },
  });

  const addTagMutation = useMutation({
    mutationFn: ({ customerId, tagId }: { customerId: number; tagId: number }) =>
      customerTagsApi.addTag(customerId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-tags", customer.id] });
      toast({ title: "Etiqueta agregada" });
    },
    onError: () => {
      toast({ title: "Error al agregar etiqueta", variant: "destructive" });
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: ({ customerId, tagId }: { customerId: number; tagId: number }) =>
      customerTagsApi.removeTag(customerId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-tags", customer.id] });
      toast({ title: "Etiqueta removida" });
    },
    onError: () => {
      toast({ title: "Error al remover etiqueta", variant: "destructive" });
    },
  });

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    createTagMutation.mutate({ name: newTagName, color: newTagColor, category: "general" });
  };

  const handleAddExistingTag = (tagId: number) => {
    addTagMutation.mutate({ customerId: customer.id, tagId });
  };

  const handleRemoveTag = (tagId: number) => {
    removeTagMutation.mutate({ customerId: customer.id, tagId });
  };

  const availableTags = allTags.filter(t => !customerTags.some(ct => ct.id === t.id));
  const latestOrder = orders[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-0">
          <div className="flex flex-col items-center">
            <Avatar className="h-20 w-20 border-4 border-primary/20 shadow-lg mb-4">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary text-2xl font-bold">
                {customer.avatar || customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <DialogTitle className="text-2xl font-bold">{customer.name}</DialogTitle>
            <p className="text-muted-foreground text-sm">{customer.segment}</p>
          </div>
        </DialogHeader>

        {/* Tags Section */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {tagsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {customerTags.map((tag) => (
                  <span
                    key={tag.id}
                    data-testid={`tag-${tag.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-sm"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                      data-testid={`remove-tag-${tag.id}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </>
            )}

            {/* Add Tag Button/Form */}
            {isAddingTag ? (
              <form onSubmit={handleCreateTag} className="flex items-center gap-2">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Nueva etiqueta..."
                  className="h-8 w-32 text-sm"
                  data-testid="input-new-tag"
                  autoFocus
                />
                <Select value={newTagColor} onValueChange={setNewTagColor}>
                  <SelectTrigger className="w-20 h-8">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: newTagColor }} />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.value }} />
                          {c.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button type="submit" className="bg-primary text-white px-2 py-1 rounded text-sm" data-testid="button-create-tag">
                  Crear
                </button>
                <button type="button" onClick={() => setIsAddingTag(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                {availableTags.length > 0 && (
                  <Select onValueChange={(v) => handleAddExistingTag(parseInt(v))}>
                    <SelectTrigger className="h-8 w-auto border-dashed" data-testid="select-existing-tag">
                      <Plus className="w-3 h-3 mr-1" />
                      <span className="text-sm">Agregar</span>
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                            {tag.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <button
                  onClick={() => setIsAddingTag(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  data-testid="button-new-tag"
                >
                  <Plus className="w-3 h-3" />
                  Nueva
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-4 gap-4 mt-6 py-4 border-y border-border">
          {statsLoading ? (
            <div className="col-span-4 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Spend</div>
                <div className="text-2xl font-bold text-foreground">${stats?.totalSpend.toLocaleString() || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1"># of Orders</div>
                <div className="text-2xl font-bold text-foreground">{stats?.orderCount || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Visits</div>
                <div className="text-2xl font-bold text-foreground">{stats?.visits || customer.visits}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Reviews</div>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i <= Math.round(stats?.avgRating || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Last Visit / Order History */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Historial de Órdenes
          </h3>
          {ordersLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order, idx) => (
                <div
                  key={order.id}
                  className={cn(
                    "bg-muted/30 rounded-lg p-4 cursor-pointer transition-all hover:bg-muted/50",
                    selectedOrderId === order.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                  data-testid={`order-${order.id}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {idx === 0 ? "Última Visita" : "Visita"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      ${parseFloat(order.total).toLocaleString()}
                    </div>
                  </div>

                  {selectedOrderId === order.id && orderItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            ({item.quantity}) {item.itemName}
                          </span>
                          <span className="font-medium">${parseFloat(item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay órdenes registradas</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
