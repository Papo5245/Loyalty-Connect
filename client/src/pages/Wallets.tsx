import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Wallet, ArrowUpCircle, ArrowDownCircle, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletsApi, customersApi, type Wallet as WalletType, type WalletTransaction } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Wallets() {
  const [isCreateWalletOpen, setIsCreateWalletOpen] = useState(false);
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [walletForm, setWalletForm] = useState({ customerId: "", balancePuntos: 0, status: "active" });
  const [transactionForm, setTransactionForm] = useState({ type: "credit", amount: 0, description: "" });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: wallets = [], isLoading: walletsLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: walletsApi.getAll,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.getAll,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["wallet-transactions", selectedWallet?.id],
    queryFn: () => selectedWallet ? walletsApi.getTransactions(selectedWallet.id) : Promise.resolve([]),
    enabled: !!selectedWallet,
  });

  const createWalletMutation = useMutation({
    mutationFn: walletsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      setIsCreateWalletOpen(false);
      setWalletForm({ customerId: "", balancePuntos: 0, status: "active" });
      toast({ title: "Wallet creada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear wallet", variant: "destructive" });
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: ({ walletId, data }: { walletId: number; data: { type: string; amount: number; description: string | null } }) =>
      walletsApi.createTransaction(walletId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions", selectedWallet?.id] });
      setIsAddPointsOpen(false);
      setTransactionForm({ type: "credit", amount: 0, description: "" });
      toast({ title: "Transacción registrada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al registrar transacción", variant: "destructive" });
    },
  });

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    createWalletMutation.mutate({
      customerId: parseInt(walletForm.customerId),
      balancePuntos: walletForm.balancePuntos,
      status: walletForm.status,
    });
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) return;
    createTransactionMutation.mutate({
      walletId: selectedWallet.id,
      data: {
        type: transactionForm.type,
        amount: transactionForm.amount,
        description: transactionForm.description || null,
      },
    });
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || "Desconocido";
  };

  const customersWithoutWallet = customers.filter(
    c => !wallets.some(w => w.customerId === c.id)
  );

  const totalPoints = wallets.reduce((sum, w) => sum + w.balancePuntos, 0);
  const activeWallets = wallets.filter(w => w.status === "active").length;

  if (walletsLoading) {
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
          <h1 className="text-3xl font-heading font-bold text-foreground">Wallets de Puntos</h1>
          <p className="text-muted-foreground mt-1">Gestiona los puntos de fidelidad de tus clientes.</p>
        </div>
        <Dialog open={isCreateWalletOpen} onOpenChange={setIsCreateWalletOpen}>
          <DialogTrigger asChild>
            <button data-testid="button-create-wallet" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium shadow-md shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Crear Wallet
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Wallet</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateWallet} className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={walletForm.customerId} onValueChange={(v) => setWalletForm({ ...walletForm, customerId: v })}>
                  <SelectTrigger data-testid="select-wallet-customer"><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                  <SelectContent>
                    {customersWithoutWallet.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial-balance">Balance Inicial de Puntos</Label>
                <Input
                  id="initial-balance"
                  data-testid="input-initial-balance"
                  type="number"
                  min="0"
                  value={walletForm.balancePuntos}
                  onChange={(e) => setWalletForm({ ...walletForm, balancePuntos: parseInt(e.target.value) || 0 })}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <button type="button" className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50">Cancelar</button>
                </DialogClose>
                <button type="submit" data-testid="button-submit-wallet" disabled={createWalletMutation.isPending || !walletForm.customerId} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {createWalletMutation.isPending ? "Creando..." : "Crear Wallet"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Add Points Dialog */}
      <Dialog open={isAddPointsOpen} onOpenChange={setIsAddPointsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Transacción - {selectedWallet && getCustomerName(selectedWallet.customerId)}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTransaction} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={transactionForm.type} onValueChange={(v) => setTransactionForm({ ...transactionForm, type: v })}>
                <SelectTrigger data-testid="select-transaction-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Agregar Puntos (Crédito)</SelectItem>
                  <SelectItem value="debit">Canjear Puntos (Débito)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Cantidad de Puntos</Label>
              <Input
                id="amount"
                data-testid="input-transaction-amount"
                type="number"
                min="1"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                data-testid="input-transaction-description"
                value={transactionForm.description}
                onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                placeholder="Ej: Compra de $50, Canje de recompensa"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button type="button" className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50">Cancelar</button>
              </DialogClose>
              <button type="submit" data-testid="button-submit-transaction" disabled={createTransactionMutation.isPending || transactionForm.amount <= 0} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {createTransactionMutation.isPending ? "Registrando..." : "Registrar"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Wallet className="w-4 h-4" />
                Total Wallets
              </div>
              <div className="text-2xl font-bold text-foreground">{wallets.length}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Users className="w-4 h-4" />
                Activas
              </div>
              <div className="text-2xl font-bold text-green-600">{activeWallets}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <TrendingUp className="w-4 h-4" />
                Total Puntos
              </div>
              <div className="text-2xl font-bold text-primary">{totalPoints.toLocaleString()}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Wallet className="w-4 h-4" />
                Promedio
              </div>
              <div className="text-2xl font-bold text-foreground">
                {wallets.length > 0 ? Math.round(totalPoints / wallets.length).toLocaleString() : 0}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallets List */}
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Wallets de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {wallets.length > 0 ? (
                <div className="divide-y divide-border">
                  {wallets.map((wallet, idx) => (
                    <motion.div
                      key={wallet.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => setSelectedWallet(wallet)}
                      className={cn(
                        "p-4 cursor-pointer transition-colors hover:bg-muted/30",
                        selectedWallet?.id === wallet.id && "bg-primary/5 border-l-2 border-l-primary"
                      )}
                      data-testid={`wallet-item-${wallet.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">{getCustomerName(wallet.customerId)}</div>
                          <div className="text-sm text-muted-foreground">
                            Actualizada: {format(new Date(wallet.updatedAt), "dd/MM/yyyy")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">{wallet.balancePuntos.toLocaleString()} pts</div>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded",
                            wallet.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          )}>
                            {wallet.status === "active" ? "Activa" : "Inactiva"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No hay wallets creadas aún.</p>
                  <button onClick={() => setIsCreateWalletOpen(true)} className="text-primary hover:underline font-medium">
                    Crear la primera wallet
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <div>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {selectedWallet ? `Movimientos - ${getCustomerName(selectedWallet.customerId)}` : "Selecciona una wallet"}
              </CardTitle>
              {selectedWallet && (
                <button
                  onClick={() => setIsAddPointsOpen(true)}
                  data-testid="button-add-transaction"
                  className="bg-primary text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-primary/90 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Nuevo
                </button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {selectedWallet ? (
                transactionsLoading ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="p-3 flex items-center gap-3" data-testid={`transaction-item-${tx.id}`}>
                        {tx.type === "credit" ? (
                          <ArrowUpCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <ArrowDownCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {tx.description || (tx.type === "credit" ? "Puntos agregados" : "Puntos canjeados")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm")}
                          </div>
                        </div>
                        <div className={cn(
                          "font-bold text-sm",
                          tx.type === "credit" ? "text-green-600" : "text-red-600"
                        )}>
                          {tx.type === "credit" ? "+" : "-"}{tx.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Sin movimientos registrados
                  </div>
                )
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Haz clic en una wallet para ver sus movimientos
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
