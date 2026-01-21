import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, BarChart3, Settings, LogOut, Award, Utensils, MessageCircle, Grid3X3, Star, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: Wallet, label: "Wallets", href: "/wallets" },
    { icon: Grid3X3, label: "Tables", href: "/tables" },
    { icon: Star, label: "Feedback", href: "/feedback" },
    { icon: MessageCircle, label: "Campaigns", href: "/campaigns" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: Award, label: "Loyalty Tiers", href: "/tiers" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen border-r border-sidebar-border shadow-xl z-10 hidden md:flex">
      <div className="p-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 text-sidebar-primary-foreground">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-white">Loyalize</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 group cursor-pointer",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
              )}>
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-sidebar-foreground/50 group-hover:text-white")} />
                {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border/50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center border border-sidebar-border group-hover:border-primary/50 transition-colors">
            <span className="text-xs font-bold text-sidebar-foreground">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">Manager</p>
          </div>
          <LogOut className="w-4 h-4 text-sidebar-foreground/50 hover:text-white transition-colors" />
        </div>
      </div>
    </aside>
  );
}
