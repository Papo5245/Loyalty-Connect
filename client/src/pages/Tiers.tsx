import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Zap, ShieldCheck, Crown, ChevronRight, Edit2 } from "lucide-react";
import { motion } from "framer-motion";

const tiers = [
  {
    name: "Silver",
    icon: ShieldCheck,
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
    requirement: "Join Loyalize",
    benefits: ["5% Cashback", "Birthday Dessert", "Exclusive Newsletter"],
    members: 1250,
    threshold: "$0"
  },
  {
    name: "Gold",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    requirement: "Spend $500+",
    benefits: ["10% Cashback", "Priority Seating", "Free Drink every visit", "Skip the Line"],
    members: 840,
    threshold: "$500"
  },
  {
    name: "Platinum",
    icon: Crown,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    requirement: "Spend $2,500+",
    benefits: ["15% Cashback", "Chef's Table Access", "Personal Concierge", "Private Event Invite", "Zero Service Fees"],
    members: 450,
    threshold: "$2,500"
  }
];

export default function Tiers() {
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
        {tiers.map((tier, idx) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`h-full border-2 ${tier.border} shadow-sm relative overflow-hidden`}>
              {tier.name === "Platinum" && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Top Tier
                </div>
              )}
              <CardHeader className={`${tier.bg} border-b border-border/50 pb-8`}>
                <div className={`p-3 rounded-xl bg-white w-fit shadow-sm mb-4 ${tier.color}`}>
                  <tier.icon className="w-6 h-6" />
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
                    <span className="font-bold text-foreground">{tier.members}</span> members
                  </div>
                  <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    Edit Details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

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
    </Layout>
  );
}
