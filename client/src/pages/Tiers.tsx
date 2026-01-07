import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, Zap, ShieldCheck, Crown, ChevronRight, Edit2, Loader2, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tiersApi, customersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const tierIcons: Record<string, any> = {
  Silver: ShieldCheck,
  Gold: Zap,
  Platinum: Crown,
};

const tierStyles: Record<string, { color: string; bg: string; border: string }> = {
  Silver: { color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
  Gold: { color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  Platinum: { color: "text-primary", bg: "bg-primary/5", border: "border-primary/20" },
};

export default function Tiers() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", requirement: "", threshold: "", benefits: [""] });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ["tiers"],
    queryFn: tiersApi.getAll,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: tiersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiers"] });
      setIsCreateOpen(false);
      setFormData({ name: "", requirement: "", threshold: "", benefits: [""] });
      toast({ title: "Tier created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create tier", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => tiersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiers"] });
      setIsEditOpen(false);
      setSelectedTier(null);
      toast({ title: "Tier updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update tier", variant: "destructive" });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      requirement: formData.requirement,
      threshold: formData.threshold,
      benefits: formData.benefits.filter(b => b.trim() !== ""),
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;
    updateMutation.mutate({
      id: selectedTier.id,
      data: {
        name: formData.name,
        requirement: formData.requirement,
        threshold: formData.threshold,
        benefits: formData.benefits.filter(b => b.trim() !== ""),
      },
    });
  };

  const openEditDialog = (tier: any) => {
    setSelectedTier(tier);
    setFormData({
      name: tier.name,
      requirement: tier.requirement,
      threshold: tier.threshold,
      benefits: tier.benefits.length > 0 ? tier.benefits : [""],
    });
    setIsEditOpen(true);
  };

  const addBenefit = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, ""] });
  };

  const removeBenefit = (index: number) => {
    setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== index) });
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const getMemberCount = (tierName: string) => {
    return customers.filter(c => c.tier === tierName).length;
  };

  if (tiersLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const TierForm = ({ onSubmit, submitLabel, isPending }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string; isPending: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tier-name">Tier Name</Label>
        <Input id="tier-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Diamond" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="requirement">Requirement</Label>
        <Input id="requirement" value={formData.requirement} onChange={(e) => setFormData({ ...formData, requirement: e.target.value })} placeholder="e.g., Spend $5,000+" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="threshold">Spend Threshold ($)</Label>
        <Input id="threshold" type="number" value={formData.threshold} onChange={(e) => setFormData({ ...formData, threshold: e.target.value })} placeholder="5000" required />
      </div>
      <div className="space-y-2">
        <Label>Benefits</Label>
        <div className="space-y-2">
          {formData.benefits.map((benefit, index) => (
            <div key={index} className="flex gap-2">
              <Input 
                value={benefit} 
                onChange={(e) => updateBenefit(index, e.target.value)} 
                placeholder="e.g., 20% Cashback"
              />
              {formData.benefits.length > 1 && (
                <button type="button" onClick={() => removeBenefit(index)} className="p-2 hover:bg-muted rounded-md">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addBenefit} className="text-sm text-primary hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add Benefit
          </button>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <button type="button" className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50">Cancel</button>
        </DialogClose>
        <button type="submit" disabled={isPending} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
          {isPending ? "Saving..." : submitLabel}
        </button>
      </DialogFooter>
    </form>
  );

  return (
    <Layout>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Loyalty Tiers</h1>
          <p className="text-muted-foreground mt-1">Define and manage reward structures for your customers.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
              Create New Tier
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tier</DialogTitle>
            </DialogHeader>
            <TierForm onSubmit={handleCreateSubmit} submitLabel="Create Tier" isPending={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </header>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tier</DialogTitle>
          </DialogHeader>
          <TierForm onSubmit={handleEditSubmit} submitLabel="Save Changes" isPending={updateMutation.isPending} />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {tiers.map((tier, idx) => {
          const Icon = tierIcons[tier.name] || ShieldCheck;
          const styles = tierStyles[tier.name] || { color: "text-primary", bg: "bg-primary/5", border: "border-primary/20" };
          const memberCount = getMemberCount(tier.name);
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`h-full border-2 ${styles.border} shadow-sm relative overflow-hidden`}>
                {tier.name === "Platinum" && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Top Tier
                  </div>
                )}
                <CardHeader className={`${styles.bg} border-b border-border/50 pb-8`}>
                  <div className={`p-3 rounded-xl bg-white w-fit shadow-sm mb-4 ${styles.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="text-foreground font-medium">{tier.requirement}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Benefits</h4>
                    <ul className="space-y-3">
                      {tier.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-sm text-foreground/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-bold text-foreground">{memberCount}</span> members
                    </div>
                    <button 
                      onClick={() => openEditDialog(tier)}
                      className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      Edit Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {tiers.length === 0 && (
        <Card className="mt-8 border-dashed border-2 border-border/50 bg-muted/20">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No tiers configured yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first loyalty tier to start rewarding your customers.
              </p>
              <button 
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Create First Tier
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {tiers.length > 0 && (
        <Card className="mt-8 border-dashed border-2 border-border/50 bg-muted/20">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Want to add an intermediate tier?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                You can create more tiers to bridge the gap between Gold and Platinum, or add special invitation-only levels.
              </p>
              <button 
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-white text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Configure Progression
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
