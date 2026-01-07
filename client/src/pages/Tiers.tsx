import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Zap, ShieldCheck, Crown, ChevronRight, Edit2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { tiersApi, customersApi } from "@/lib/api";

const tierIcons: Record<string, any> = {
  Silver: ShieldCheck,
  Gold: Zap,
  Platinum: Crown,
};

const tierStyles: Record<string, { color: string; bg: string; border: string }> = {
  Silver: { color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
  Gold: { color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  Platinum: { color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
};

export default function Tiers() {
  const { data: tiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ["tiers"],
    queryFn: tiersApi.getAll,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.getAll,
  });

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

  return (
    <Layout>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Loyalty Tiers</h1>
          <p className="text-muted-foreground mt-1">Define and manage reward structures for your customers.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
          Create New Tier
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {tiers.map((tier, idx) => {
          const Icon = tierIcons[tier.name] || ShieldCheck;
          const styles = tierStyles[tier.name] || tierStyles.Silver;
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
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
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
                    <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
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
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
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
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-white text-sm font-medium hover:bg-gray-50 transition-colors">
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
