import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Star, TrendingUp, MessageSquare, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbackApi, customersApi, type Feedback } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

export default function FeedbackPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ customerId: "", rating: 5, channel: "in-app", comment: "" });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: feedbackList = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ["feedback"],
    queryFn: feedbackApi.getAll,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["feedback-stats"],
    queryFn: feedbackApi.getStats,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: feedbackApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["feedback-stats"] });
      setIsAddOpen(false);
      setFormData({ customerId: "", rating: 5, channel: "in-app", comment: "" });
      toast({ title: "Feedback added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add feedback", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      customerId: formData.customerId ? parseInt(formData.customerId) : null,
      rating: formData.rating,
      channel: formData.channel,
      comment: formData.comment || null,
    });
  };

  const getCustomerName = (customerId: number | null) => {
    if (!customerId) return "Anonymous";
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || "Unknown";
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-500";
    if (rating >= 3) return "text-amber-500";
    return "text-red-500";
  };

  const getChannelBadge = (channel: string) => {
    const baseClass = "px-2 py-0.5 rounded text-xs font-medium";
    switch (channel) {
      case "google": return `${baseClass} bg-blue-100 text-blue-700`;
      case "yelp": return `${baseClass} bg-red-100 text-red-700`;
      case "in-app": return `${baseClass} bg-primary/10 text-primary`;
      default: return `${baseClass} bg-gray-100 text-gray-700`;
    }
  };

  const ratingDistribution = stats?.byRating?.map(r => ({
    name: `${r.rating} Star`,
    value: r.count,
    rating: r.rating,
  })) || [];

  const channelData = stats?.byChannel?.map(c => ({
    name: c.channel,
    count: c.count,
  })) || [];

  const isLoading = feedbackLoading || statsLoading;

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
          <h1 className="text-3xl font-heading font-bold text-foreground">Feedback & Reputation</h1>
          <p className="text-muted-foreground mt-1">Track customer reviews and manage your reputation.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button data-testid="button-add-feedback" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium shadow-md shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Feedback
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Customer Feedback</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Customer (optional)</Label>
                <Select value={formData.customerId} onValueChange={(v) => setFormData({ ...formData, customerId: v })}>
                  <SelectTrigger data-testid="select-feedback-customer"><SelectValue placeholder="Anonymous" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Anonymous</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      data-testid={`button-rating-${rating}`}
                      onClick={() => setFormData({ ...formData, rating })}
                      className="p-2 rounded hover:bg-muted transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${formData.rating >= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={formData.channel} onValueChange={(v) => setFormData({ ...formData, channel: v })}>
                  <SelectTrigger data-testid="select-feedback-channel"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-app">In-App</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="yelp">Yelp</SelectItem>
                    <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea
                  id="comment"
                  data-testid="textarea-feedback-comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Customer's feedback..."
                  rows={3}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <button type="button" className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50">Cancel</button>
                </DialogClose>
                <button type="submit" data-testid="button-submit-feedback" disabled={createMutation.isPending} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {createMutation.isPending ? "Adding..." : "Add Feedback"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Star className="w-4 h-4" />
                Average Rating
              </div>
              <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                {stats?.avgRating?.toFixed(1) || "0.0"}
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MessageSquare className="w-4 h-4" />
                Total Reviews
              </div>
              <div className="text-2xl font-bold text-foreground">{stats?.totalReviews || 0}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <ThumbsUp className="w-4 h-4" />
                Positive Reviews
              </div>
              <div className="text-2xl font-bold text-green-600">{stats?.positivePercent || 0}%</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <TrendingUp className="w-4 h-4" />
                This Month
              </div>
              <div className="text-2xl font-bold text-foreground">
                {feedbackList.filter(f => {
                  const date = new Date(f.createdAt);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {ratingDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ratingDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={60} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.rating - 1]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Reviews by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            {channelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {channelData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${203 + index * 30}, 85%, ${48 + index * 10}%)`} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {feedbackList.length > 0 ? (
            <div className="divide-y divide-border">
              {feedbackList.slice(0, 20).map((fb, idx) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="p-4 hover:bg-muted/30 transition-colors"
                  data-testid={`feedback-item-${fb.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${fb.rating >= star ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                            />
                          ))}
                        </div>
                        <span className={getChannelBadge(fb.channel)}>{fb.channel}</span>
                      </div>
                      <p className="text-sm text-foreground">{fb.comment || <span className="italic text-muted-foreground">No comment</span>}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{getCustomerName(fb.customerId)}</span>
                        <span>•</span>
                        <span>{format(new Date(fb.createdAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No feedback recorded yet.</p>
              <button onClick={() => setIsAddOpen(true)} className="text-primary hover:underline font-medium">
                Add your first review
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
