import { Switch, Route } from "wouter";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Analytics from "@/pages/Analytics";
import Tiers from "@/pages/Tiers";
import Campaigns from "@/pages/Campaigns";
import Tables from "@/pages/Tables";
import Feedback from "@/pages/Feedback";
import Settings from "@/pages/Settings";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/customers" component={Customers} />
      <Route path="/tables" component={Tables} />
      <Route path="/feedback" component={Feedback} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/tiers" component={Tiers} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
