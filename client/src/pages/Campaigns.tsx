import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageCircle, Plus, Send, Users, Calendar, Clock, CheckCircle2, XCircle, Loader2, Smartphone, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { customersApi, type Customer } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Campaign = {
  id: number;
  name: string;
  message: string;
  status: "draft" | "scheduled" | "sent" | "failed";
  recipients: number;
  scheduledAt?: string;
  sentAt?: string;
  delivered: number;
  failed: number;
};

const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: "Promoción de Verano",
    message: "¡Hola! Te invitamos a disfrutar de un 20% de descuento en tu próxima visita. Válido hasta fin de mes.",
    status: "sent",
    recipients: 145,
    sentAt: "2026-01-08T14:30:00",
    delivered: 142,
    failed: 3,
  },
  {
    id: 2,
    name: "Recordatorio VIP",
    message: "Como cliente VIP, tienes acceso exclusivo a nuestro nuevo menú degustación. ¡Reserva ahora!",
    status: "scheduled",
    recipients: 28,
    scheduledAt: "2026-01-15T10:00:00",
    delivered: 0,
    failed: 0,
  },
];

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterSegment, setFilterSegment] = useState<string>("all");
  const [campaignData, setCampaignData] = useState({
    name: "",
    message: "",
    scheduleType: "now",
    scheduledDate: "",
    scheduledTime: "",
  });

  const { toast } = useToast();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.getAll,
  });

  const filteredCustomers = customers.filter((c) => {
    const matchesTier = filterTier === "all" || c.tier === filterTier;
    const matchesSegment = filterSegment === "all" || c.segment === filterSegment;
    return matchesTier && matchesSegment && c.phone;
  });

  const toggleCustomer = (id: number) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((c) => c.id));
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCustomers([]);
    setCampaignData({ name: "", message: "", scheduleType: "now", scheduledDate: "", scheduledTime: "" });
    setFilterTier("all");
    setFilterSegment("all");
  };

  const handleCreateCampaign = () => {
    const newCampaign: Campaign = {
      id: campaigns.length + 1,
      name: campaignData.name,
      message: campaignData.message,
      status: campaignData.scheduleType === "now" ? "sent" : "scheduled",
      recipients: selectedCustomers.length,
      ...(campaignData.scheduleType === "now"
        ? { sentAt: new Date().toISOString(), delivered: selectedCustomers.length, failed: 0 }
        : { scheduledAt: `${campaignData.scheduledDate}T${campaignData.scheduledTime}:00`, delivered: 0, failed: 0 }),
    };

    setCampaigns([newCampaign, ...campaigns]);
    setIsCreateOpen(false);
    resetForm();

    toast({
      title: campaignData.scheduleType === "now" ? "Campaña enviada" : "Campaña programada",
      description:
        campaignData.scheduleType === "now"
          ? `Se enviaron ${selectedCustomers.length} mensajes de WhatsApp.`
          : `La campaña se enviará el ${campaignData.scheduledDate} a las ${campaignData.scheduledTime}.`,
    });
  };

  const getStatusBadge = (status: Campaign["status"]) => {
    const styles = {
      draft: "bg-gray-100 text-gray-700",
      scheduled: "bg-blue-100 text-blue-700",
      sent: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
    };
    const labels = {
      draft: "Borrador",
      scheduled: "Programada",
      sent: "Enviada",
      failed: "Fallida",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <Layout>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Campañas WhatsApp</h1>
          <p className="text-muted-foreground mt-1">Envía mensajes masivos a tus clientes por WhatsApp.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <button className="bg-green-600 text-white px-6 py-2 rounded-md font-medium shadow-md shadow-green-600/20 hover:bg-green-700 transition-all flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Nueva Campaña
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                {step === 1 && "Seleccionar Destinatarios"}
                {step === 2 && "Componer Mensaje"}
                {step === 3 && "Programar Envío"}
              </DialogTitle>
            </DialogHeader>

            {step === 1 && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Filtrar por Nivel</Label>
                    <Select value={filterTier} onValueChange={setFilterTier}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los niveles</SelectItem>
                        <SelectItem value="Silver">Silver</SelectItem>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>Filtrar por Segmento</Label>
                    <Select value={filterSegment} onValueChange={setFilterSegment}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los segmentos</SelectItem>
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

                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                            onCheckedChange={selectAll}
                          />
                        </TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Nivel</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No hay clientes con teléfono registrado en este filtro.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <TableRow key={customer.id} className="cursor-pointer" onClick={() => toggleCustomer(customer.id)}>
                            <TableCell>
                              <Checkbox checked={selectedCustomers.includes(customer.id)} />
                            </TableCell>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                customer.tier === "Platinum" ? "bg-slate-800 text-white" :
                                customer.tier === "Gold" ? "bg-amber-100 text-amber-800" :
                                "bg-slate-100 text-slate-800"
                              }`}>
                                {customer.tier}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {selectedCustomers.length} de {filteredCustomers.length} clientes seleccionados
                  </span>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <button className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50">Cancelar</button>
                  </DialogClose>
                  <button
                    disabled={selectedCustomers.length === 0}
                    onClick={() => setStep(2)}
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    Continuar ({selectedCustomers.length})
                  </button>
                </DialogFooter>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Nombre de la Campaña</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Ej: Promoción de Verano"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje de WhatsApp</Label>
                  <Textarea
                    id="message"
                    placeholder="Escribe tu mensaje aquí... Puedes usar {nombre} para personalizar."
                    rows={5}
                    value={campaignData.message}
                    onChange={(e) => setCampaignData({ ...campaignData, message: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">{campaignData.message.length}/1000 caracteres</p>
                </div>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Smartphone className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Vista previa</p>
                        <p className="text-sm text-green-700 mt-1 whitespace-pre-wrap">
                          {campaignData.message || "Tu mensaje aparecerá aquí..."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <DialogFooter>
                  <button onClick={() => setStep(1)} className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50">
                    Atrás
                  </button>
                  <button
                    disabled={!campaignData.name || !campaignData.message}
                    onClick={() => setStep(3)}
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    Continuar
                  </button>
                </DialogFooter>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>¿Cuándo enviar?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCampaignData({ ...campaignData, scheduleType: "now" })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        campaignData.scheduleType === "now"
                          ? "border-green-600 bg-green-50"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <Send className={`w-5 h-5 mb-2 ${campaignData.scheduleType === "now" ? "text-green-600" : "text-muted-foreground"}`} />
                      <p className="font-medium">Enviar ahora</p>
                      <p className="text-xs text-muted-foreground">Envío inmediato</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCampaignData({ ...campaignData, scheduleType: "scheduled" })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        campaignData.scheduleType === "scheduled"
                          ? "border-green-600 bg-green-50"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <Calendar className={`w-5 h-5 mb-2 ${campaignData.scheduleType === "scheduled" ? "text-green-600" : "text-muted-foreground"}`} />
                      <p className="font-medium">Programar</p>
                      <p className="text-xs text-muted-foreground">Elige fecha y hora</p>
                    </button>
                  </div>
                </div>

                {campaignData.scheduleType === "scheduled" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha</Label>
                      <Input
                        id="date"
                        type="date"
                        value={campaignData.scheduledDate}
                        onChange={(e) => setCampaignData({ ...campaignData, scheduledDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Hora</Label>
                      <Input
                        id="time"
                        type="time"
                        value={campaignData.scheduledTime}
                        onChange={(e) => setCampaignData({ ...campaignData, scheduledTime: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Resumen de la campaña</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• <strong>{selectedCustomers.length}</strong> destinatarios</li>
                      <li>• Campaña: <strong>{campaignData.name}</strong></li>
                      <li>• Envío: <strong>{campaignData.scheduleType === "now" ? "Inmediato" : `${campaignData.scheduledDate} a las ${campaignData.scheduledTime}`}</strong></li>
                    </ul>
                  </CardContent>
                </Card>

                <DialogFooter>
                  <button onClick={() => setStep(2)} className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50">
                    Atrás
                  </button>
                  <button
                    disabled={campaignData.scheduleType === "scheduled" && (!campaignData.scheduledDate || !campaignData.scheduledTime)}
                    onClick={handleCreateCampaign}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {campaignData.scheduleType === "now" ? "Enviar Ahora" : "Programar Campaña"}
                  </button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Campañas Enviadas", value: campaigns.filter(c => c.status === "sent").length, icon: CheckCircle2, color: "text-green-600" },
          { label: "Programadas", value: campaigns.filter(c => c.status === "scheduled").length, icon: Clock, color: "text-blue-600" },
          { label: "Mensajes Totales", value: campaigns.reduce((sum, c) => sum + c.recipients, 0), icon: MessageCircle, color: "text-primary" },
          { label: "Tasa de Entrega", value: "98%", icon: Users, color: "text-amber-600" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-muted/50 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Campaign List */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle>Historial de Campañas</CardTitle>
          <CardDescription>Todas las campañas de WhatsApp enviadas y programadas.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {campaigns.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Campaña</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Destinatarios</TableHead>
                  <TableHead>Entregados</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{campaign.message}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell>{campaign.recipients}</TableCell>
                    <TableCell>
                      {campaign.status === "sent" ? (
                        <span className="text-green-600">{campaign.delivered} / {campaign.recipients}</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {campaign.sentAt
                        ? new Date(campaign.sentAt).toLocaleDateString()
                        : campaign.scheduledAt
                        ? new Date(campaign.scheduledAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No hay campañas todavía</h3>
              <p className="text-sm text-muted-foreground mb-4">Crea tu primera campaña de WhatsApp para comunicarte con tus clientes.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
